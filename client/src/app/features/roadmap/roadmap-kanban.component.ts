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
        <div class="bg-white rounded-2xl p-6 mb-6" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
          <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 class="text-3xl font-bold mb-2 flex items-center gap-2" style="color: #2D2622;">
                <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Kanban Board
              </h1>
              <p style="color: #4A3B33;">Visualiza y organiza tu roadmap con vista Kanban</p>
            </div>
            <div class="flex gap-2">
              <button 
                routerLink="/roadmap"
                class="font-bold py-2 px-4 rounded-xl transition-all flex items-center gap-1"
                style="background-color: #F2E9E1; color: #4A3B33;">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                Vista Lista
              </button>
              <button 
                routerLink="/roadmap/graph"
                class="text-white font-bold py-2 px-4 rounded-xl transition-all flex items-center gap-1"
                style="background-color: #D4A373;">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Vista Gráfica
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <svg class="w-12 h-12 mx-auto mb-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
          </svg>
          <p style="color: #4A3B33;">Cargando roadmap...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-white rounded-2xl border-l-4 border-red-500 p-6 mb-6" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
          <div class="flex items-start">
            <svg class="w-6 h-6 text-red-500 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <h3 class="text-red-800 font-semibold">Error</h3>
              <p class="text-red-700 mt-1">{{ error }}</p>
              <button 
                (click)="loadRoadmap()"
                class="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm">
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
               class="bg-white rounded-2xl p-4" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <svg class="w-6 h-6" [attr.stroke]="column.status === 'todo' ? '#4A3B33' : column.status === 'in-progress' ? '#8B5E3C' : '#22c55e'" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <ng-container *ngIf="column.status === 'todo'">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </ng-container>
                  <ng-container *ngIf="column.status === 'in-progress'">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </ng-container>
                  <ng-container *ngIf="column.status === 'done'">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </ng-container>
                </svg>
                <h3 class="text-lg font-bold" style="color: #2D2622;">{{ column.title }}</h3>
                <span class="px-2 py-1 rounded-full text-sm font-semibold" style="background-color: #F2E9E1; color: #4A3B33;">
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
                class="bg-white border-2 rounded-2xl p-4 hover:shadow-md transition-all cursor-move"
                [ngClass]="{
                  'border-gray-300': column.status === 'todo',
                  'border-amber-500': column.status === 'in-progress',
                  'border-green-500': column.status === 'done'
                }">
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-bold flex-1" style="color: #2D2622;">
                    {{ node.themeId?.name || 'Theme' }}
                  </h4>
                  <button 
                    (click)="openNodeDetails(node)"
                    class="px-2 py-1 rounded-full text-xs"
                    style="background-color: #F2E9E1; color: #4A3B33;">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </button>
                </div>

                <p class="text-sm mb-3" style="color: #4A3B33;">
                  {{ node.themeId?.description || '' }}
                </p>

                <!-- Progress Bar -->
                <div class="mb-3">
                  <div class="flex justify-between text-xs mb-1">
                    <span style="color: #4A3B33;">Progreso</span>
                    <span class="font-semibold" style="color: #8B5E3C;">{{ node.progress }}%</span>
                  </div>
                  <div class="w-full rounded-full h-2" style="background-color: #EAE3DB;">
                    <div 
                      class="h-2 rounded-full transition-all"
                      [style.width.%]="node.progress"
                      [style.background-color]="node.progress === 0 ? '#EAE3DB' : node.progress === 100 ? '#22c55e' : '#8B5E3C'">
                    </div>
                  </div>
                </div>

                <!-- Due Date -->
                <div *ngIf="node.dueDate" class="flex items-center gap-1 text-xs mb-2"
                     [ngClass]="{
                       'text-red-600': isOverdue(node.dueDate),
                       'text-orange-600': isDueSoon(node.dueDate)
                     }"
                     [style.color]="!isOverdue(node.dueDate) && !isDueSoon(node.dueDate) ? '#4A3B33' : ''">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{{ formatDate(node.dueDate) }}</span>
                  <svg *ngIf="isOverdue(node.dueDate)" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span *ngIf="isOverdue(node.dueDate)" class="font-semibold">Vencido</span>
                </div>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1">
                  <span class="text-xs px-2 py-1 rounded-full" style="background-color: #F2E9E1; color: #4A3B33;">
                    {{ node.themeId?.category }}
                  </span>
                  <span 
                    class="text-xs px-2 py-1 rounded-full"
                    style="background-color: #F2E9E1; color: #4A3B33;"
                    [ngClass]="{
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
                   class="text-center py-8" style="color: #4A3B33;">
                <svg class="w-12 h-12 mx-auto mb-2" [attr.stroke]="column.status === 'todo' ? '#4A3B33' : column.status === 'in-progress' ? '#8B5E3C' : '#22c55e'" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.5">
                  <ng-container *ngIf="column.status === 'todo'">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </ng-container>
                  <ng-container *ngIf="column.status === 'in-progress'">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </ng-container>
                  <ng-container *ngIf="column.status === 'done'">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </ng-container>
                </svg>
                <p class="text-sm">No hay temas en esta columna</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && allNodes.length === 0" 
             class="bg-white rounded-2xl p-12 text-center" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
          <svg class="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <h3 class="text-2xl font-bold mb-3" style="color: #2D2622;">No hay temas en tu roadmap</h3>
          <p class="mb-6" style="color: #4A3B33;">
            Agrega temas para empezar a organizar tu aprendizaje en el tablero Kanban.
          </p>
          <button 
            routerLink="/roadmap"
            class="text-white font-bold py-3 px-8 rounded-xl"
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
    { id: 'todo', title: 'To Do', status: 'todo', nodes: [], icon: 'clock', color: 'gray' },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress', nodes: [], icon: 'refresh', color: 'amber' },
    { id: 'done', title: 'Done', status: 'done', nodes: [], icon: 'check', color: 'green' }
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
