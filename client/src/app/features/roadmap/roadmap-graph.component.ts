import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoadmapService, PersonalNode } from '../../core/services/roadmap.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  status: string;
  progress: number;
  color: string;
}

@Component({
  selector: 'app-roadmap-graph',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
        <!-- Header -->
        <div class="bg-white rounded-[12px] p-6 mb-6" style="border: 1px solid #EAE3DB;">
          <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 class="text-2xl font-semibold mb-2" style="color: #2D2622;">📊 Vista Gráfica</h1>
              <p style="color: #4A3B33;">Visualiza tu progreso con gráficos interactivos</p>
            </div>
            <div class="flex gap-2">
              <button 
                routerLink="/roadmap"
                class="font-medium py-2 px-4 rounded-[12px] transition-all"
                style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                📝 Vista Lista
              </button>
              <button 
                routerLink="/roadmap/kanban"
                class="text-white font-medium py-2 px-4 rounded-[12px] transition-all"
                style="background-color: #8B5E3C;">
                📋 Vista Kanban
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <div class="text-4xl mb-4">⏳</div>
          <p style="color: #4A3B33;">Cargando datos...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-white rounded-[12px] p-6 mb-6" style="border-left: 4px solid #8B5E3C; border-right: 1px solid #EAE3DB; border-top: 1px solid #EAE3DB; border-bottom: 1px solid #EAE3DB;">
          <div class="flex items-start">
            <span class="text-2xl mr-3">⚠️</span>
            <div>
              <h3 class="font-semibold" style="color: #2D2622;">Error</h3>
              <p class="mt-1" style="color: #4A3B33;">{{ error }}</p>
              <button 
                (click)="loadRoadmap()"
                class="mt-3 text-white px-4 py-2 rounded-[12px] text-sm font-medium"
                style="background-color: #8B5E3C;">
                Reintentar
              </button>
            </div>
          </div>
        </div>

        <!-- Graph Visualizations -->
        <div *ngIf="!loading && !error && nodes.length > 0" class="space-y-6">
          <!-- Progress Overview Chart -->
          <div class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
            <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">📈 Resumen de Progreso</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div class="text-center">
                <div class="text-3xl mb-2">⏳</div>
                <div class="text-2xl font-bold font-mono" style="color: #4A3B33;">{{ getCountByStatus('todo') }}</div>
                <div class="text-sm" style="color: #4A3B33;">To Do</div>
              </div>
              <div class="text-center">
                <div class="text-3xl mb-2">🔄</div>
                <div class="text-2xl font-bold font-mono" style="color: #D4A373;">{{ getCountByStatus('in-progress') }}</div>
                <div class="text-sm" style="color: #4A3B33;">En Progreso</div>
              </div>
              <div class="text-center">
                <div class="text-3xl mb-2">✅</div>
                <div class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ getCountByStatus('done') }}</div>
                <div class="text-sm" style="color: #4A3B33;">Completado</div>
              </div>
              <div class="text-center">
                <div class="text-3xl mb-2">📊</div>
                <div class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ getAverageProgress() }}%</div>
                <div class="text-sm" style="color: #4A3B33;">Progreso Promedio</div>
              </div>
            </div>

            <!-- Progress Bar Chart -->
            <div class="space-y-3">
              <div *ngFor="let node of nodes" class="flex items-center gap-3">
                <div class="w-32 text-sm font-medium truncate" style="color: #2D2622;">
                  {{ node.themeId?.name }}
                </div>
                <div class="flex-1 rounded-[12px] h-4 overflow-hidden" style="background-color: #EAE3DB;">
                  <div 
                    class="h-4 rounded-[12px] transition-all duration-500"
                    [ngStyle]="{
                      'background-color': node.progress === 0 ? '#EAE3DB' : node.progress < 100 ? '#D4A373' : '#8B5E3C'
                    }"
                    [style.width.%]="node.progress">
                  </div>
                </div>
                <div class="w-12 text-right text-sm font-semibold font-mono" style="color: #2D2622;">
                  {{ node.progress }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Status Distribution -->
          <div class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
            <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">🎯 Distribución por Estado</h3>
            <div class="flex items-end justify-center gap-8 h-64">
              <div class="flex flex-col items-center gap-2">
                <div class="rounded-t-[12px] transition-all duration-500" 
                     style="background-color: #EAE3DB;"
                     [style.height.px]="getBarHeight('todo')"
                     [style.width.px]="80">
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold font-mono" style="color: #4A3B33;">{{ getCountByStatus('todo') }}</div>
                  <div class="text-xs" style="color: #4A3B33;">To Do</div>
                </div>
              </div>
              <div class="flex flex-col items-center gap-2">
                <div class="rounded-t-[12px] transition-all duration-500" 
                     style="background-color: #D4A373;"
                     [style.height.px]="getBarHeight('in-progress')"
                     [style.width.px]="80">
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold font-mono" style="color: #D4A373;">{{ getCountByStatus('in-progress') }}</div>
                  <div class="text-xs" style="color: #4A3B33;">En Progreso</div>
                </div>
              </div>
              <div class="flex flex-col items-center gap-2">
                <div class="rounded-t-[12px] transition-all duration-500" 
                     style="background-color: #8B5E3C;"
                     [style.height.px]="getBarHeight('done')"
                     [style.width.px]="80">
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ getCountByStatus('done') }}</div>
                  <div class="text-xs" style="color: #4A3B33;">Completado</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Breakdown -->
          <div class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
            <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">📚 Distribución por Categoría</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let category of getCategoryBreakdown()" 
                   class="bg-white rounded-[12px] p-4 transition-all hover:shadow-md"
                   style="border: 1px solid #EAE3DB;">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-semibold" style="color: #2D2622;">{{ category.name }}</span>
                  <span class="px-2 py-1 rounded-[12px] text-xs font-bold"
                        style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                    {{ category.count }}
                  </span>
                </div>
                <div class="w-full rounded-[12px] h-2" style="background-color: #EAE3DB;">
                  <div 
                    class="h-2 rounded-[12px] transition-all duration-500"
                    style="background-color: #D4A373;"
                    [style.width.%]="category.percentage">
                  </div>
                </div>
                <div class="mt-1 text-xs" style="color: #4A3B33;">
                  {{ category.percentage }}% del total
                </div>
              </div>
            </div>
          </div>

          <!-- Network Graph Placeholder -->
          <div class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
            <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">🔗 Mapa de Relaciones</h3>
            <div #graphCanvas class="relative rounded-[12px] p-8 min-h-[400px] overflow-hidden" style="background-color: #FCF9F5;">
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-full h-full" [attr.viewBox]="'0 0 ' + canvasWidth + ' ' + canvasHeight">
                  <!-- Lines between nodes -->
                  <line *ngFor="let line of graphLines"
                        [attr.x1]="line.x1"
                        [attr.y1]="line.y1"
                        [attr.x2]="line.x2"
                        [attr.y2]="line.y2"
                        stroke="#EAE3DB"
                        stroke-width="2"
                        stroke-dasharray="5,5"/>
                  
                  <!-- Nodes -->
                  <g *ngFor="let node of graphNodes">
                    <circle 
                      [attr.cx]="node.x"
                      [attr.cy]="node.y"
                      [attr.r]="30"
                      [attr.fill]="node.color"
                      stroke="white"
                      stroke-width="3"
                      class="cursor-pointer hover:opacity-80 transition-opacity"/>
                    <text 
                      [attr.x]="node.x"
                      [attr.y]="node.y + 50"
                      text-anchor="middle"
                      class="text-xs font-medium"
                      fill="#2D2622">
                      {{ node.label }}
                    </text>
                    <text 
                      [attr.x]="node.x"
                      [attr.y]="node.y + 5"
                      text-anchor="middle"
                      class="text-sm font-bold"
                      fill="white">
                      {{ node.progress }}%
                    </text>
                  </g>
                </svg>
              </div>
            </div>
            <p class="text-sm mt-4 text-center" style="color: #4A3B33;">
              🔍 Vista de red mostrando la relación entre temas según categoría y progreso
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && nodes.length === 0" 
             class="bg-white rounded-[12px] p-12 text-center" style="border: 1px solid #EAE3DB;">
          <div class="text-6xl mb-4">📊</div>
          <h3 class="text-2xl font-semibold mb-3" style="color: #2D2622;">No hay datos para visualizar</h3>
          <p class="mb-6" style="color: #4A3B33;">
            Agrega temas a tu roadmap para ver las visualizaciones gráficas.
          </p>
          <button 
            routerLink="/roadmap"
            class="text-white font-medium py-3 px-8 rounded-[12px]"
            style="background-color: #8B5E3C;">
            Ir al Roadmap
          </button>
        </div>
      </div>
    </div>
  `
})
export class RoadmapGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('graphCanvas', { read: ElementRef }) graphCanvas?: ElementRef;

  nodes: PersonalNode[] = [];
  graphNodes: GraphNode[] = [];
  graphLines: any[] = [];
  loading = false;
  error: string | null = null;
  currentUserId: string | null = null;
  canvasWidth = 800;
  canvasHeight = 400;

  constructor(private roadmapService: RoadmapService) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentUserId = user.id;
    }
  }

  ngOnInit(): void {
    this.loadRoadmap();
  }

  ngAfterViewInit(): void {
    if (this.graphCanvas) {
      this.canvasWidth = this.graphCanvas.nativeElement.offsetWidth;
      this.canvasHeight = 400;
      this.generateGraphVisualization();
    }
  }

  loadRoadmap(): void {
    if (!this.currentUserId) return;

    this.loading = true;
    this.error = null;

    this.roadmapService.getPersonalRoadmap(this.currentUserId).subscribe({
      next: (response) => {
        this.nodes = response.data.roadmap;
        this.generateGraphVisualization();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar los datos. Por favor intenta nuevamente.';
        this.loading = false;
        console.error('Error loading roadmap:', err);
      }
    });
  }

  generateGraphVisualization(): void {
    if (!this.nodes.length) return;

    this.graphNodes = [];
    this.graphLines = [];

    const angleStep = (2 * Math.PI) / this.nodes.length;
    const radius = Math.min(this.canvasWidth, this.canvasHeight) * 0.35;
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;

    // Create nodes in a circular layout
    this.nodes.forEach((node, index) => {
      const angle = angleStep * index;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      let status = node.status;
      if (status === 'not-started') status = 'todo';
      if (status === 'completed' || status === 'mastered') status = 'done';

      const color = this.getNodeColor(status);

      this.graphNodes.push({
        id: node._id,
        label: node.themeId?.name?.substring(0, 15) || 'Theme',
        x,
        y,
        status,
        progress: node.progress,
        color
      });
    });

    // Create connections between nodes of the same category
    for (let i = 0; i < this.graphNodes.length; i++) {
      for (let j = i + 1; j < this.graphNodes.length; j++) {
        const node1 = this.nodes[i];
        const node2 = this.nodes[j];
        
        if (node1.themeId?.category === node2.themeId?.category) {
          this.graphLines.push({
            x1: this.graphNodes[i].x,
            y1: this.graphNodes[i].y,
            x2: this.graphNodes[j].x,
            y2: this.graphNodes[j].y
          });
        }
      }
    }
  }

  getNodeColor(status: string): string {
    // Matte-Drift color palette
    const colors: { [key: string]: string } = {
      'todo': '#EAE3DB',        // Border color for inactive
      'in-progress': '#D4A373', // Sand color for in progress
      'done': '#8B5E3C',        // Primary button color for done
      'not-started': '#EAE3DB',
      'completed': '#8B5E3C',
      'mastered': '#4A3B33'     // Icon color for mastered
    };
    return colors[status] || '#EAE3DB';
  }

  getCountByStatus(status: string): number {
    return this.nodes.filter(node => {
      let nodeStatus = node.status;
      if (nodeStatus === 'not-started') nodeStatus = 'todo';
      if (nodeStatus === 'completed' || nodeStatus === 'mastered') nodeStatus = 'done';
      return nodeStatus === status;
    }).length;
  }

  getAverageProgress(): number {
    if (this.nodes.length === 0) return 0;
    const total = this.nodes.reduce((sum, node) => sum + node.progress, 0);
    return Math.round(total / this.nodes.length);
  }

  getBarHeight(status: string): number {
    const count = this.getCountByStatus(status);
    const maxCount = Math.max(
      this.getCountByStatus('todo'),
      this.getCountByStatus('in-progress'),
      this.getCountByStatus('done')
    );
    if (maxCount === 0) return 0;
    return (count / maxCount) * 200; // Max height 200px
  }

  getCategoryBreakdown(): any[] {
    const categories: { [key: string]: number } = {};
    
    this.nodes.forEach(node => {
      const category = node.themeId?.category || 'other';
      categories[category] = (categories[category] || 0) + 1;
    });

    const total = this.nodes.length;
    return Object.entries(categories).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);
  }
}
