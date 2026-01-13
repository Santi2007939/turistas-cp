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
              <h1 class="text-2xl font-semibold mb-2 flex items-center gap-2" style="color: #2D2622;">
                <!-- Lucide BarChart2 icon -->
                <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 20V10m-6 10V4M6 20v-6" />
                </svg>
                Graph View
              </h1>
              <p style="color: #4A3B33;">Visualiza tu progreso con gráficos interactivos</p>
            </div>
            <div class="flex gap-2">
              <button 
                routerLink="/roadmap"
                class="font-medium py-2 px-4 rounded-[12px] transition-all flex items-center gap-2"
                style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                <!-- Lucide List icon -->
                <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
                List View
              </button>
              <button 
                routerLink="/roadmap/kanban"
                class="text-white font-medium py-2 px-4 rounded-[12px] transition-all flex items-center gap-2"
                style="background-color: #8B5E3C;">
                <!-- Lucide LayoutList icon -->
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Kanban View
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <!-- Lucide Loader icon -->
          <svg class="w-12 h-12 mx-auto mb-4 animate-spin" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p style="color: #4A3B33;">Loading data...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-white rounded-[12px] p-6 mb-6" style="border-left: 4px solid #8B5E3C; border-right: 1px solid #EAE3DB; border-top: 1px solid #EAE3DB; border-bottom: 1px solid #EAE3DB;">
          <div class="flex items-start">
            <!-- Lucide AlertTriangle icon -->
            <svg class="w-6 h-6 mr-3" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 class="font-semibold" style="color: #2D2622;">Error</h3>
              <p class="mt-1" style="color: #4A3B33;">{{ error }}</p>
              <button 
                (click)="loadRoadmap()"
                class="mt-3 text-white px-4 py-2 rounded-[12px] text-sm font-medium"
                style="background-color: #8B5E3C;">
                Retry
              </button>
            </div>
          </div>
        </div>

        <!-- Graph Visualizations -->
        <div *ngIf="!loading && !error && nodes.length > 0" class="space-y-6">
          <!-- Progress Overview Chart -->
          <div class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2" style="color: #2D2622;">
              <!-- Lucide TrendingUp icon -->
              <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Progress Summary
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div class="text-center">
                <!-- Lucide Clock icon -->
                <svg class="w-8 h-8 mx-auto mb-2" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" />
                </svg>
                <div class="text-2xl font-bold font-mono" style="color: #4A3B33;">{{ getCountByStatus('todo') }}</div>
                <div class="text-sm" style="color: #4A3B33;">To Do</div>
              </div>
              <div class="text-center">
                <!-- Lucide RefreshCw icon -->
                <svg class="w-8 h-8 mx-auto mb-2" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                <div class="text-2xl font-bold font-mono" style="color: #D4A373;">{{ getCountByStatus('in-progress') }}</div>
                <div class="text-sm" style="color: #4A3B33;">In Progress</div>
              </div>
              <div class="text-center">
                <!-- Lucide CheckCircle icon -->
                <svg class="w-8 h-8 mx-auto mb-2" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ getCountByStatus('done') }}</div>
                <div class="text-sm" style="color: #4A3B33;">Completed</div>
              </div>
              <div class="text-center">
                <!-- Lucide BarChart2 icon -->
                <svg class="w-8 h-8 mx-auto mb-2" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 20V10m-6 10V4M6 20v-6" />
                </svg>
                <div class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ getAverageProgress() }}%</div>
                <div class="text-sm" style="color: #4A3B33;">Average Progress</div>
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
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2" style="color: #2D2622;">
              <!-- Lucide Target icon -->
              <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              Status Distribution
            </h3>
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
                  <div class="text-xs" style="color: #4A3B33;">In Progress</div>
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
                  <div class="text-xs" style="color: #4A3B33;">Completed</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Breakdown -->
          <div class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2" style="color: #2D2622;">
              <!-- Lucide BookOpen icon -->
              <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Distribution by Category
            </h3>
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
                  {{ category.percentage }}% of total
                </div>
              </div>
            </div>
          </div>

          <!-- Network Graph Placeholder -->
          <div class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2" style="color: #2D2622;">
              <!-- Lucide Link icon -->
              <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Relationship Map
            </h3>
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
            <p class="text-sm mt-4 text-center flex items-center justify-center gap-2" style="color: #4A3B33;">
              <!-- Lucide Search icon -->
              <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Network view showing theme relationships by category and progress
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && nodes.length === 0" 
             class="bg-white rounded-[12px] p-12 text-center" style="border: 1px solid #EAE3DB;">
          <!-- Lucide BarChart2 icon -->
          <svg class="w-16 h-16 mx-auto mb-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 20V10m-6 10V4M6 20v-6" />
          </svg>
          <h3 class="text-2xl font-semibold mb-3" style="color: #2D2622;">No data to display</h3>
          <p class="mb-6" style="color: #4A3B33;">
            Add themes to your roadmap to see graphic visualizations.
          </p>
          <button 
            routerLink="/roadmap"
            class="text-white font-medium py-3 px-8 rounded-[12px]"
            style="background-color: #8B5E3C;">
            Go to Roadmap
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
        this.error = 'Could not load data. Please try again.';
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
