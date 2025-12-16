import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RoadmapService, PersonalNode } from '../../core/services/roadmap.service';
import { ThemesService, Theme } from '../../core/services/themes.service';

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
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">📋 Kanban Board</h1>
              <p class="text-gray-600">Visualiza y organiza tu roadmap con vista Kanban</p>
            </div>
            <div class="flex gap-2">
              <button 
                routerLink="/roadmap"
                class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all">
                📝 Vista Lista
              </button>
              <button 
                routerLink="/roadmap/graph"
                class="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all">
                📊 Vista Gráfica
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <div class="text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Cargando roadmap...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
          <div class="flex items-start">
            <span class="text-2xl mr-3">⚠️</span>
            <div>
              <h3 class="text-red-800 font-semibold">Error</h3>
              <p class="text-red-700 mt-1">{{ error }}</p>
              <button 
                (click)="loadRoadmap()"
                class="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
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
               class="bg-white rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ column.icon }}</span>
                <h3 class="text-lg font-bold text-gray-800">{{ column.title }}</h3>
                <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-semibold">
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
                class="bg-white border-2 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-move"
                [ngClass]="{
                  'border-gray-300': column.status === 'todo',
                  'border-blue-500': column.status === 'in-progress',
                  'border-green-500': column.status === 'done'
                }">
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-bold text-gray-800 flex-1">
                    {{ node.themeId?.name || 'Theme' }}
                  </h4>
                  <button 
                    (click)="openNodeDetails(node)"
                    class="text-blue-600 hover:text-blue-800 text-sm">
                    ℹ️
                  </button>
                </div>

                <p class="text-sm text-gray-600 mb-3">
                  {{ node.themeId?.description || '' }}
                </p>

                <!-- Progress Bar -->
                <div class="mb-3">
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-gray-600">Progreso</span>
                    <span class="font-semibold text-blue-600">{{ node.progress }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full transition-all"
                      [ngClass]="{
                        'bg-gray-400': node.progress === 0,
                        'bg-blue-500': node.progress > 0 && node.progress < 100,
                        'bg-green-500': node.progress === 100
                      }"
                      [style.width.%]="node.progress">
                    </div>
                  </div>
                </div>

                <!-- Due Date -->
                <div *ngIf="node.dueDate" class="flex items-center gap-1 text-xs mb-2"
                     [ngClass]="{
                       'text-red-600': isOverdue(node.dueDate),
                       'text-orange-600': isDueSoon(node.dueDate),
                       'text-gray-600': !isOverdue(node.dueDate) && !isDueSoon(node.dueDate)
                     }">
                  <span>📅</span>
                  <span>{{ formatDate(node.dueDate) }}</span>
                  <span *ngIf="isOverdue(node.dueDate)" class="font-semibold">⚠️ Vencido</span>
                </div>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1">
                  <span class="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                    {{ node.themeId?.category }}
                  </span>
                  <span 
                    class="text-xs px-2 py-1 rounded-full"
                    [ngClass]="{
                      'bg-green-100 text-green-700': node.themeId?.difficulty === 'beginner',
                      'bg-yellow-100 text-yellow-700': node.themeId?.difficulty === 'intermediate',
                      'bg-orange-100 text-orange-700': node.themeId?.difficulty === 'advanced',
                      'bg-red-100 text-red-700': node.themeId?.difficulty === 'expert'
                    }">
                    {{ node.themeId?.difficulty }}
                  </span>
                </div>
              </div>

              <!-- Empty Column State -->
              <div *ngIf="column.nodes.length === 0" 
                   class="text-center py-8 text-gray-400">
                <div class="text-4xl mb-2">{{ column.icon }}</div>
                <p class="text-sm">No hay temas en esta columna</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && allNodes.length === 0" 
             class="bg-white rounded-lg shadow-sm p-12 text-center">
          <div class="text-6xl mb-4">📋</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">No hay temas en tu roadmap</h3>
          <p class="text-gray-600 mb-6">
            Agrega temas para empezar a organizar tu aprendizaje en el tablero Kanban.
          </p>
          <button 
            routerLink="/roadmap"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg">
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
