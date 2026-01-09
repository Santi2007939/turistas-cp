import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RoadmapService, PersonalNode } from '../../core/services/roadmap.service';
import { ThemesService, Theme } from '../../core/services/themes.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  nodes: PersonalNode[];
  icon: string;
  color: string;
}

@Component({
  selector: 'app-roadmap-kanban',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule, NavbarComponent],
  template: `
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
        <!-- Header -->
        <div class="bg-white rounded-[12px] p-6 mb-6" style="border: 1px solid #EAE3DB;">
          <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 class="text-2xl font-semibold mb-2" style="color: #2D2622;">📋 Kanban Board</h1>
              <p style="color: #4A3B33;">Visualiza y organiza tu roadmap con vista Kanban</p>
            </div>
            <div class="flex gap-2">
              <button 
                routerLink="/roadmap"
                class="font-medium py-2 px-4 rounded-[12px] transition-all"
                style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                📝 Vista Lista
              </button>
              <button 
                routerLink="/roadmap/graph"
                class="text-white font-medium py-2 px-4 rounded-[12px] transition-all"
                style="background-color: #8B5E3C;">
                📊 Vista Gráfica
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <div class="text-4xl mb-4">⏳</div>
          <p style="color: #4A3B33;">Cargando roadmap...</p>
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

        <!-- Kanban Board -->
        <div *ngIf="!loading && !error" 
             class="grid grid-cols-1 md:grid-cols-3 gap-6"
             cdkDropListGroup>
          <div *ngFor="let column of columns" 
               class="bg-white rounded-[12px] p-4"
               style="border: 1px solid #EAE3DB;">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ column.icon }}</span>
                <h3 class="text-lg font-semibold" style="color: #2D2622;">{{ column.title }}</h3>
                <span class="px-2 py-1 rounded-[12px] text-sm font-semibold"
                      style="background-color: #FCF9F5; color: #4A3B33; border: 1px solid #EAE3DB;">
                  {{ column.nodes.length }}
                </span>
              </div>
            </div>

            <div 
              cdkDropList
              [id]="column.id"
              [cdkDropListData]="column.nodes"
              (cdkDropListDropped)="onDrop($event)"
              class="min-h-[200px] space-y-3">
              <div 
                *ngFor="let node of column.nodes"
                cdkDrag
                class="bg-white border-l-4 rounded-[12px] p-4 transition-all cursor-move hover:shadow-md"
                [ngStyle]="{
                  'border-left-color': column.status === 'todo' ? '#EAE3DB' : column.status === 'in-progress' ? '#D4A373' : '#8B5E3C',
                  'border-right': '1px solid #EAE3DB',
                  'border-top': '1px solid #EAE3DB',
                  'border-bottom': '1px solid #EAE3DB'
                }">
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-semibold flex-1" style="color: #2D2622;">
                    {{ node.themeId?.name || 'Theme' }}
                  </h4>
                  <button 
                    (click)="openNodeDetails(node)"
                    class="text-sm"
                    style="color: #8B5E3C;">
                    ℹ️
                  </button>
                </div>

                <p class="text-sm mb-3" style="color: #4A3B33;">
                  {{ node.themeId?.description || '' }}
                </p>

                <!-- Progress Bar -->
                <div class="mb-3">
                  <div class="flex justify-between text-xs mb-1">
                    <span style="color: #4A3B33;">Progreso</span>
                    <span class="font-semibold font-mono" style="color: #8B5E3C;">{{ node.progress }}%</span>
                  </div>
                  <div class="w-full rounded-[12px] h-2" style="background-color: #EAE3DB;">
                    <div 
                      class="h-2 rounded-[12px] transition-all"
                      [ngStyle]="{
                        'background-color': node.progress === 0 ? '#EAE3DB' : node.progress < 100 ? '#D4A373' : '#8B5E3C'
                      }"
                      [style.width.%]="node.progress">
                    </div>
                  </div>
                </div>

                <!-- Due Date -->
                <div *ngIf="node.dueDate" class="flex items-center gap-1 text-xs mb-2"
                     [ngStyle]="{
                       'color': isOverdue(node.dueDate) ? '#8B5E3C' : isDueSoon(node.dueDate) ? '#D4A373' : '#4A3B33'
                     }">
                  <span>📅</span>
                  <span>{{ formatDate(node.dueDate) }}</span>
                  <span *ngIf="isOverdue(node.dueDate)" class="font-semibold">⚠️ Vencido</span>
                </div>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1">
                  <span class="text-xs px-2 py-1 rounded-[12px]"
                        style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                    {{ node.themeId?.category }}
                  </span>
                  <span 
                    class="text-xs px-2 py-1 rounded-[12px]"
                    [ngStyle]="{
                      'background-color': '#FCF9F5',
                      'color': node.themeId?.difficulty === 'beginner' ? '#8B5E3C' : node.themeId?.difficulty === 'intermediate' ? '#D4A373' : node.themeId?.difficulty === 'advanced' ? '#4A3B33' : '#2D2622',
                      'border': '1px solid #EAE3DB'
                    }">
                    {{ node.themeId?.difficulty }}
                  </span>
                </div>
              </div>

              <!-- Empty Column State -->
              <div *ngIf="column.nodes.length === 0" 
                   class="text-center py-8" style="color: #4A3B33;">
                <div class="text-4xl mb-2">{{ column.icon }}</div>
                <p class="text-sm">No hay temas en esta columna</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && allNodes.length === 0" 
             class="bg-white rounded-[12px] p-12 text-center" style="border: 1px solid #EAE3DB;">
          <div class="text-6xl mb-4">📋</div>
          <h3 class="text-2xl font-semibold mb-3" style="color: #2D2622;">No hay temas en tu roadmap</h3>
          <p class="mb-6" style="color: #4A3B33;">
            Agrega temas para empezar a organizar tu aprendizaje en el tablero Kanban.
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
export class RoadmapKanbanComponent implements OnInit {
  columns: KanbanColumn[] = [
    { id: 'todo', title: 'To Do', status: 'todo', nodes: [], icon: '📝', color: 'gray' },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress', nodes: [], icon: '🔄', color: 'blue' },
    { id: 'done', title: 'Done', status: 'done', nodes: [], icon: '✅', color: 'green' }
  ];

  allNodes: PersonalNode[] = [];
  loading = false;
  error: string | null = null;
  currentUserId: string | null = null;

  constructor(
    private roadmapService: RoadmapService,
    private themesService: ThemesService
  ) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentUserId = user.id;
    }
  }

  ngOnInit(): void {
    this.loadRoadmap();
  }

  loadRoadmap(): void {
    if (!this.currentUserId) return;

    this.loading = true;
    this.error = null;

    this.roadmapService.getPersonalRoadmap(this.currentUserId).subscribe({
      next: (response) => {
        this.allNodes = response.data.roadmap;
        this.organizeNodesIntoColumns();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar el roadmap. Por favor intenta nuevamente.';
        this.loading = false;
        console.error('Error loading roadmap:', err);
      }
    });
  }

  organizeNodesIntoColumns(): void {
    // Reset columns
    this.columns.forEach(col => col.nodes = []);

    // Map statuses to columns
    this.allNodes.forEach(node => {
      // Map old statuses to new Kanban columns
      let targetStatus = node.status;
      
      // Map legacy statuses
      if (node.status === 'not-started') {
        targetStatus = 'todo';
      } else if (node.status === 'completed' || node.status === 'mastered') {
        targetStatus = 'done';
      }

      const column = this.columns.find(col => col.status === targetStatus);
      if (column) {
        column.nodes.push(node);
      } else {
        // Default to todo if no match
        this.columns[0].nodes.push(node);
      }
    });
  }

  onDrop(event: CdkDragDrop<PersonalNode[]>): void {
    if (event.previousContainer === event.container) {
      // Same column - just reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Different column - update status
      const node = event.previousContainer.data[event.previousIndex];
      const targetColumn = this.columns.find(col => col.id === event.container.id);
      
      if (targetColumn && node.themeId) {
        // Transfer item
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );

        // Update node status on backend
        this.roadmapService.updateNode({
          themeId: typeof node.themeId === 'object' ? node.themeId._id : node.themeId,
          status: targetColumn.status,
          progress: node.progress,
          notes: node.notes,
          dueDate: node.dueDate
        }).subscribe({
          next: () => {
            node.status = targetColumn.status as any;
          },
          error: (err) => {
            console.error('Error updating node status:', err);
            // Revert the change
            transferArrayItem(
              event.container.data,
              event.previousContainer.data,
              event.currentIndex,
              event.previousIndex
            );
            this.error = 'No se pudo actualizar el estado del tema.';
          }
        });
      }
    }
  }

  openNodeDetails(node: PersonalNode): void {
    // Navigate to subtopic details page
    window.location.href = `/roadmap/${node._id}/subtopics`;
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  isDueSoon(dueDate: Date): boolean {
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  }
}
