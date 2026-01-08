import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoadmapService, PersonalNode, PopulatedUser } from '../../core/services/roadmap.service';
import { ThemesService, Theme } from '../../core/services/themes.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
        <!-- Header Section -->
        <div class="bg-white rounded-2xl p-6 mb-6" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
          <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 class="text-3xl font-bold mb-2 flex items-center gap-2" style="color: #2D2622;">
                <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                  <line x1="8" y1="2" x2="8" y2="18"/>
                  <line x1="16" y1="6" x2="16" y2="22"/>
                </svg>
                Mi Roadmap
              </h1>
              <p style="color: #4A3B33;">Gestiona tu ruta de aprendizaje personalizada</p>
            </div>
            <div class="flex gap-2">
              <button 
                routerLink="/roadmap/kanban"
                class="text-white font-bold py-2 px-4 rounded-xl transition-all"
                style="background-color: #D4A373;">
                <svg class="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Kanban
              </button>
              <button 
                routerLink="/roadmap/graph"
                class="text-white font-bold py-2 px-4 rounded-xl transition-all"
                style="background-color: #D4A373;">
                <svg class="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Gráfica
              </button>
              <button 
                *ngIf="selectedView === 'personal'"
                (click)="showAddThemeModal = true"
                class="text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                style="background-color: #8B5E3C;">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>Agregar Tema</span>
              </button>
            </div>
          </div>

          <!-- View Selector and Filters -->
          <div class="mt-6 flex flex-col md:flex-row gap-4">
            <!-- View Selector -->
            <div class="flex gap-2 items-center">
              <label class="font-semibold text-sm" style="color: #4A3B33;">Vista:</label>
              <select 
                [(ngModel)]="selectedView"
                (change)="onViewChange()"
                class="rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 transition-all"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
                <option value="personal">Mi roadmap</option>
                <option value="members">Miembros</option>
              </select>
            </div>

            <!-- Search -->
            <div class="flex-1">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (input)="applyFilters()"
                placeholder="Buscar tema..."
                class="w-full rounded-xl px-4 py-2 focus:outline-none focus:ring-2 transition-all"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
            </div>

            <!-- Filter by Status -->
            <div class="flex gap-2 items-center">
              <label class="font-semibold text-sm" style="color: #4A3B33;">Estado:</label>
              <select 
                [(ngModel)]="filterStatus"
                (change)="applyFilters()"
                class="rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 transition-all"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
                <option value="">Todos</option>
                <option value="not-started">No iniciado</option>
                <option value="in-progress">En progreso</option>
                <option value="completed">Completado</option>
                <option value="mastered">Dominado</option>
              </select>
            </div>

            <!-- Sort Options -->
            <div class="flex gap-2 items-center">
              <label class="font-semibold text-sm" style="color: #4A3B33;">Ordenar:</label>
              <select 
                [(ngModel)]="sortBy"
                (change)="applyFilters()"
                class="rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 transition-all"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
                <option value="name">Nombre</option>
                <option value="progress">Progreso</option>
                <option value="lastPracticed">Última práctica</option>
                <option value="difficulty">Dificultad</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State with Skeleton -->
        <div *ngIf="loading" class="space-y-4">
          <div class="bg-white rounded-2xl p-6 animate-pulse" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
            <div class="h-4 rounded w-3/4 mb-4" style="background-color: #EAE3DB;"></div>
            <div class="h-4 rounded w-1/2 mb-4" style="background-color: #EAE3DB;"></div>
            <div class="h-2 rounded w-full" style="background-color: #EAE3DB;"></div>
          </div>
          <div class="bg-white rounded-2xl p-6 animate-pulse" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
            <div class="h-4 rounded w-2/3 mb-4" style="background-color: #EAE3DB;"></div>
            <div class="h-4 rounded w-1/3 mb-4" style="background-color: #EAE3DB;"></div>
            <div class="h-2 rounded w-full" style="background-color: #EAE3DB;"></div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-white rounded-2xl p-6 mb-6 border-l-4 border-red-500" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-red-800 font-semibold">Error al cargar roadmap</h3>
              <p class="text-red-700 mt-1">{{ error }}</p>
              <button 
                (click)="loadRoadmap()"
                class="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                Reintentar
              </button>
            </div>
          </div>
        </div>

        <!-- Progress Overview -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" *ngIf="!loading && filteredNodes.length > 0">
          <div class="bg-white rounded-2xl p-4 hover:shadow-md transition-shadow" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <div class="flex-1">
                <p class="text-sm font-semibold" style="color: #4A3B33;">No iniciado</p>
                <p class="text-2xl font-bold" style="color: #2D2622;">{{ getCountByStatus('not-started') }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-4 hover:shadow-md transition-shadow" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              <div class="flex-1">
                <p class="text-sm font-semibold" style="color: #4A3B33;">En progreso</p>
                <p class="text-2xl font-bold" style="color: #8B5E3C;">{{ getCountByStatus('in-progress') }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-4 hover:shadow-md transition-shadow" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <div class="flex-1">
                <p class="text-sm font-semibold" style="color: #4A3B33;">Completado</p>
                <p class="text-2xl font-bold text-green-600">{{ getCountByStatus('completed') }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-4 hover:shadow-md transition-shadow" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#D4A373" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
              <div class="flex-1">
                <p class="text-sm font-semibold" style="color: #4A3B33;">Dominado</p>
                <p class="text-2xl font-bold" style="color: #D4A373;">{{ getCountByStatus('mastered') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Results Count -->
        <div class="mb-4" *ngIf="!loading && nodes.length > 0">
          <p class="text-sm" style="color: #4A3B33;">
            Mostrando <span class="font-semibold">{{ filteredNodes.length }}</span> de <span class="font-semibold">{{ nodes.length }}</span> temas
          </p>
        </div>

        <!-- Roadmap Nodes -->
        <div class="space-y-4">
          <div 
            *ngFor="let node of filteredNodes" 
          class="bg-white rounded-2xl p-6 hover:shadow-lg transition-all border-l-4"
          style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);"
          [ngClass]="{
            'border-gray-400': node.status === 'not-started',
            'border-amber-500': node.status === 'in-progress',
            'border-green-500': node.status === 'completed',
            'border-amber-600': node.status === 'mastered'
          }">
          <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div class="flex-1">
              <div class="flex items-start gap-3 mb-3">
                <svg class="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none" [attr.stroke]="node.status === 'not-started' ? '#4A3B33' : node.status === 'in-progress' ? '#8B5E3C' : node.status === 'completed' ? '#22c55e' : '#D4A373'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <ng-container *ngIf="node.status === 'not-started'">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </ng-container>
                  <ng-container *ngIf="node.status === 'in-progress'">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </ng-container>
                  <ng-container *ngIf="node.status === 'completed'">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </ng-container>
                  <ng-container *ngIf="node.status === 'mastered'">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                    <path d="M4 22h16"/>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                  </ng-container>
                </svg>
                <div class="flex-1">
                  <h2 class="text-xl font-bold mb-1" style="color: #2D2622;">
                    {{ node.themeId?.name || 'Theme' }}
                  </h2>
                  <p class="text-sm" style="color: #4A3B33;">{{ node.themeId?.description || '' }}</p>
                </div>
              </div>
              
              <div class="flex flex-wrap gap-2 mb-3">
                <span 
                  class="px-3 py-1 text-xs font-medium rounded-full"
                  style="background-color: #F2E9E1; color: #4A3B33;">
                  {{ getStatusLabel(node.status) }}
                </span>
                <span class="px-3 py-1 text-xs font-medium rounded-full" style="background-color: #F2E9E1; color: #4A3B33;">
                  {{ node.themeId?.category }}
                </span>
                <span 
                  class="px-3 py-1 text-xs font-medium rounded-full"
                  style="background-color: #F2E9E1; color: #4A3B33;"
                  [ngClass]="{
                    'bg-green-100 text-green-700': node.themeId?.difficulty === 'beginner',
                    'bg-yellow-100 text-yellow-700': node.themeId?.difficulty === 'intermediate',
                    'bg-orange-100 text-orange-700': node.themeId?.difficulty === 'advanced',
                    'bg-red-100 text-red-700': node.themeId?.difficulty === 'expert'
                  }">
                  {{ getDifficultyLabel(node.themeId?.difficulty) }}
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="mb-3">
                <div class="flex justify-between text-sm font-semibold mb-2">
                  <span style="color: #4A3B33;">Progreso</span>
                  <span style="color: #8B5E3C;">{{ node.progress }}%</span>
                </div>
                <div class="w-full rounded-full h-3 overflow-hidden" style="background-color: #EAE3DB;">
                  <div 
                    class="h-3 rounded-full transition-all duration-500 ease-out"
                    [style.width.%]="node.progress"
                    [style.background-color]="node.progress === 0 ? '#EAE3DB' : node.progress === 100 ? '#22c55e' : '#8B5E3C'">
                  </div>
                </div>
              </div>

              <div *ngIf="node.notes" class="rounded-xl p-3 mb-3" style="background-color: #F2E9E1;">
                <p class="text-xs font-semibold mb-1" style="color: #4A3B33;">Notas:</p>
                <p class="text-sm" style="color: #2D2622;">{{ node.notes }}</p>
              </div>

              <div class="flex items-center gap-4 text-xs">
                <div *ngIf="node.lastPracticed" class="flex items-center gap-2" style="color: #4A3B33;">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>Última práctica: {{ node.lastPracticed | date:'short' }}</span>
                </div>
                <div *ngIf="node.dueDate" class="flex items-center gap-2"
                     [ngClass]="{
                       'text-red-600 font-bold': isOverdue(node.dueDate),
                       'text-orange-600': isDueSoon(node.dueDate)
                     }"
                     [style.color]="!isOverdue(node.dueDate) && !isDueSoon(node.dueDate) ? '#4A3B33' : ''">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>Vence: {{ node.dueDate | date:'short' }}</span>
                  <svg *ngIf="isOverdue(node.dueDate)" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2" [ngClass]="{'md:ml-4': selectedView === 'personal'}">
              <a 
                *ngIf="selectedView === 'personal'"
                [routerLink]="['/roadmap', node._id, 'subtopics']"
                class="text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all text-center flex items-center justify-center gap-1"
                style="background-color: #8B5E3C;">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Subtemas
              </a>
              <button 
                *ngIf="selectedView === 'personal'"
                (click)="editNode(node)"
                class="text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1"
                style="background-color: #D4A373;">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Actualizar
              </button>
              <button 
                *ngIf="selectedView === 'personal'"
                (click)="confirmDelete(node._id, node.themeId?.name || 'este tema')"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Eliminar
              </button>
              <div 
                *ngIf="selectedView === 'members'"
                class="rounded-xl px-4 py-2 text-center" style="background-color: #F2E9E1;">
                <p class="text-xs font-semibold mb-1" style="color: #4A3B33;">Miembro</p>
                <p class="text-sm font-bold" style="color: #8B5E3C;">{{ getUserName(node) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && nodes.length === 0" class="bg-white rounded-2xl p-12 text-center" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
        <svg class="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
        <h3 class="text-2xl font-bold mb-3" style="color: #2D2622;">Tu roadmap está vacío</h3>
        <p class="mb-6 max-w-md mx-auto" style="color: #4A3B33;">
          Comienza a agregar temas a tu roadmap para hacer seguimiento de tu progreso de aprendizaje.
        </p>
        <button 
          *ngIf="selectedView === 'personal'"
          (click)="showAddThemeModal = true"
          class="text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 mx-auto"
          style="background-color: #8B5E3C;">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar mi primer tema
        </button>
      </div>

      <!-- No Results State -->
      <div *ngIf="!loading && nodes.length > 0 && filteredNodes.length === 0" class="bg-white rounded-2xl p-12 text-center" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
        <svg class="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <h3 class="text-2xl font-bold mb-3" style="color: #2D2622;">No se encontraron resultados</h3>
        <p class="mb-6" style="color: #4A3B33;">
          Intenta ajustar los filtros o la búsqueda para encontrar lo que buscas.
        </p>
        <button 
          (click)="clearFilters()"
          class="font-bold py-3 px-8 rounded-xl transition-all"
          style="background-color: #F2E9E1; color: #4A3B33;">
          Limpiar filtros
        </button>
      </div>
    </div>

      <!-- Add Theme Modal -->
      <div 
        *ngIf="showAddThemeModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="showAddThemeModal = false">
        <div class="bg-white rounded-2xl p-8 w-full max-w-lg" style="box-shadow: 0 4px 20px rgba(74, 59, 51, 0.1);" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-6">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <h3 class="text-2xl font-bold" style="color: #2D2622;">Agregar Tema al Roadmap</h3>
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-bold mb-2" style="color: #4A3B33;">Selecciona un tema</label>
            <select 
              [(ngModel)]="selectedThemeId"
              class="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all"
              style="border: 2px solid #EAE3DB; color: #2D2622;">
              <option value="">Elige un tema...</option>
              <option *ngFor="let theme of availableThemes" [value]="theme._id">
                {{ theme.name }} ({{ theme.category }} - {{ theme.difficulty }})
              </option>
            </select>
            <p class="text-xs mt-2" style="color: #4A3B33;">
              El tema se agregará con estado "No iniciado" y progreso 0%
            </p>
          </div>

          <div class="flex gap-3 justify-end">
            <button 
              (click)="showAddThemeModal = false"
              class="font-semibold px-6 py-3 rounded-xl transition-all"
              style="background-color: #F2E9E1; color: #4A3B33;">
              Cancelar
            </button>
            <button 
              (click)="addThemeToRoadmap()"
              [disabled]="!selectedThemeId"
              class="text-white font-semibold px-6 py-3 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              style="background-color: #8B5E3C;">
              Agregar tema
            </button>
          </div>
        </div>
      </div>

      <!-- Update Node Modal -->
      <div 
        *ngIf="showUpdateModal && editingNode" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="showUpdateModal = false">
        <div class="bg-white rounded-2xl p-8 w-full max-w-lg" style="box-shadow: 0 4px 20px rgba(74, 59, 51, 0.1);" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-6">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <h3 class="text-2xl font-bold" style="color: #2D2622;">Actualizar Progreso</h3>
          </div>
          
          <div class="mb-5">
            <label class="block text-sm font-bold mb-2" style="color: #4A3B33;">Estado</label>
            <select 
              [(ngModel)]="editingNode.status"
              class="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all"
              style="border: 2px solid #EAE3DB; color: #2D2622;">
              <option value="not-started">No iniciado</option>
              <option value="in-progress">En progreso</option>
              <option value="completed">Completado</option>
              <option value="mastered">Dominado</option>
            </select>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-bold mb-2" style="color: #4A3B33;">Progreso (%)</label>
            <div class="flex items-center gap-4">
              <input 
                type="range" 
                [(ngModel)]="editingNode.progress"
                min="0"
                max="100"
                class="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style="background-color: #EAE3DB;">
              <input 
                type="number" 
                [(ngModel)]="editingNode.progress"
                min="0"
                max="100"
                class="w-20 rounded-xl px-3 py-2 text-center font-bold focus:outline-none focus:ring-2 transition-all"
                style="border: 2px solid #EAE3DB; color: #2D2622;">
            </div>
            <div class="mt-2 w-full rounded-full h-2" style="background-color: #EAE3DB;">
              <div 
                class="h-2 rounded-full transition-all"
                [style.width.%]="editingNode.progress"
                [style.background-color]="editingNode.progress === 0 ? '#EAE3DB' : editingNode.progress === 100 ? '#22c55e' : '#8B5E3C'">
              </div>
            </div>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-bold mb-2" style="color: #4A3B33;">Fecha límite (opcional)</label>
            <input 
              type="date"
              [(ngModel)]="editingNode.dueDate"
              class="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all"
              style="border: 2px solid #EAE3DB; color: #2D2622;">
          </div>

          <div class="mb-6">
            <label class="block text-sm font-bold mb-2" style="color: #4A3B33;">Notas</label>
            <textarea 
              [(ngModel)]="editingNode.notes"
              rows="4"
              placeholder="Agrega notas sobre tu progreso, recursos útiles, etc."
              class="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all resize-none"
              style="border: 2px solid #EAE3DB; color: #2D2622;"></textarea>
          </div>

          <div class="flex gap-3 justify-end">
            <button 
              (click)="showUpdateModal = false"
              class="font-semibold px-6 py-3 rounded-xl transition-all"
              style="background-color: #F2E9E1; color: #4A3B33;">
              Cancelar
            </button>
            <button 
              (click)="saveNodeUpdate()"
              class="text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
              style="background-color: #8B5E3C;">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div 
        *ngIf="showDeleteConfirmation" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="showDeleteConfirmation = false">
        <div class="bg-white rounded-2xl p-8 w-full max-w-md" style="box-shadow: 0 4px 20px rgba(74, 59, 51, 0.1);" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-4">
            <svg class="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <h3 class="text-2xl font-bold" style="color: #2D2622;">Confirmar eliminación</h3>
          </div>
          
          <p class="mb-6" style="color: #4A3B33;">
            ¿Estás seguro de que quieres eliminar <span class="font-bold" style="color: #2D2622;">"{{ nodeToDeleteName }}"</span> de tu roadmap?
            Esta acción no se puede deshacer.
          </p>

          <div class="flex gap-3 justify-end">
            <button 
              (click)="showDeleteConfirmation = false"
              class="font-semibold px-6 py-3 rounded-xl transition-all"
              style="background-color: #F2E9E1; color: #4A3B33;">
              Cancelar
            </button>
            <button 
              (click)="deleteNode(nodeToDelete)"
              class="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-all">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RoadmapComponent implements OnInit {
  // Constants
  private readonly STATUS_LABELS: { [key: string]: string } = {
    'not-started': 'No iniciado',
    'in-progress': 'En progreso',
    'completed': 'Completado',
    'mastered': 'Dominado'
  };

  private readonly DIFFICULTY_LABELS: { [key: string]: string } = {
    'beginner': 'Principiante',
    'intermediate': 'Intermedio',
    'advanced': 'Avanzado',
    'expert': 'Experto'
  };

  private readonly DIFFICULTY_ORDER: { [key: string]: number } = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3,
    'expert': 4
  };

  private readonly ERROR_MESSAGES = {
    LOAD_ROADMAP: 'No se pudo cargar el roadmap. Por favor intenta nuevamente.',
    ADD_THEME: 'No se pudo agregar el tema al roadmap.',
    UPDATE_NODE: 'No se pudo actualizar el progreso.',
    DELETE_NODE: 'No se pudo eliminar el tema.'
  };

  nodes: PersonalNode[] = [];
  filteredNodes: PersonalNode[] = [];
  availableThemes: Theme[] = [];
  loading = false;
  error: string | null = null;
  showAddThemeModal = false;
  showUpdateModal = false;
  showDeleteConfirmation = false;
  selectedThemeId = '';
  selectedView: 'personal' | 'members' = 'personal';
  currentUserId: string | null = null;
  
  // Filter and search properties
  searchQuery = '';
  filterStatus = '';
  sortBy = 'name';
  
  // Delete confirmation properties
  nodeToDelete: string | null = null;
  nodeToDeleteName = '';
  
  editingNode: {
    _id: string;
    themeId: string;
    status: string;
    progress: number;
    notes: string;
    dueDate?: string;
  } | null = null;

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
    this.loadThemes();
  }

  onViewChange(): void {
    this.loadRoadmap();
  }

  loadRoadmap(): void {
    if (!this.currentUserId) return;

    this.loading = true;
    this.error = null;
    
    const observable = this.selectedView === 'personal'
      ? this.roadmapService.getPersonalRoadmap(this.currentUserId)
      : this.roadmapService.getMembersRoadmaps(this.currentUserId);

    observable.subscribe({
      next: (response) => {
        this.nodes = response.data.roadmap;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = this.ERROR_MESSAGES.LOAD_ROADMAP;
        this.loading = false;
        console.error('Error loading roadmap:', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.nodes];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(node => 
        node.themeId?.name?.toLowerCase().includes(query) ||
        node.themeId?.description?.toLowerCase().includes(query) ||
        node.themeId?.category?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.filterStatus) {
      filtered = filtered.filter(node => node.status === this.filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          const nameA = a.themeId?.name || '';
          const nameB = b.themeId?.name || '';
          return nameA.localeCompare(nameB);
        case 'progress':
          return b.progress - a.progress;
        case 'lastPracticed':
          const dateA = a.lastPracticed ? new Date(a.lastPracticed).getTime() : 0;
          const dateB = b.lastPracticed ? new Date(b.lastPracticed).getTime() : 0;
          return dateB - dateA;
        case 'difficulty':
          const diffA = this.DIFFICULTY_ORDER[a.themeId?.difficulty || ''] || 0;
          const diffB = this.DIFFICULTY_ORDER[b.themeId?.difficulty || ''] || 0;
          return diffA - diffB;
        default:
          return 0;
      }
    });

    this.filteredNodes = filtered;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterStatus = '';
    this.sortBy = 'name';
    this.applyFilters();
  }

  loadThemes(): void {
    this.themesService.getThemes().subscribe({
      next: (response) => {
        this.availableThemes = response.data.themes;
      },
      error: (err) => {
        console.error('Error loading themes:', err);
      }
    });
  }

  addThemeToRoadmap(): void {
    if (!this.selectedThemeId) return;

    this.roadmapService.updateNode({
      themeId: this.selectedThemeId,
      status: 'not-started',
      progress: 0
    }).subscribe({
      next: () => {
        this.showAddThemeModal = false;
        this.selectedThemeId = '';
        this.loadRoadmap();
        this.error = null;
      },
      error: (err) => {
        this.error = this.ERROR_MESSAGES.ADD_THEME;
        console.error('Error adding theme:', err);
      }
    });
  }

  confirmDelete(nodeId: string, themeName: string): void {
    this.nodeToDelete = nodeId;
    this.nodeToDeleteName = themeName;
    this.showDeleteConfirmation = true;
  }

  editNode(node: PersonalNode): void {
    if (!node.themeId || typeof node.themeId === 'string') {
      this.error = 'Invalid theme data';
      return;
    }
    this.editingNode = {
      _id: node._id,
      themeId: node.themeId._id,
      status: node.status,
      progress: node.progress,
      notes: node.notes || '',
      dueDate: node.dueDate ? this.formatDateForInput(node.dueDate) : undefined
    };
    this.showUpdateModal = true;
  }

  formatDateForInput(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  saveNodeUpdate(): void {
    if (!this.editingNode) return;

    this.roadmapService.updateNode({
      themeId: this.editingNode.themeId,
      status: this.editingNode.status,
      progress: this.editingNode.progress,
      notes: this.editingNode.notes,
      dueDate: this.editingNode.dueDate ? new Date(this.editingNode.dueDate) : null
    }).subscribe({
      next: () => {
        this.showUpdateModal = false;
        this.editingNode = null;
        this.loadRoadmap();
        this.error = null;
      },
      error: (err) => {
        this.error = this.ERROR_MESSAGES.UPDATE_NODE;
        console.error('Error updating node:', err);
      }
    });
  }

  deleteNode(nodeId: string | null): void {
    if (!nodeId) return;

    this.roadmapService.deleteNode(nodeId).subscribe({
      next: () => {
        this.showDeleteConfirmation = false;
        this.nodeToDelete = null;
        this.nodeToDeleteName = '';
        this.loadRoadmap();
        this.error = null;
      },
      error: (err) => {
        this.error = this.ERROR_MESSAGES.DELETE_NODE;
        this.showDeleteConfirmation = false;
        console.error('Error deleting node:', err);
      }
    });
  }

  getCountByStatus(status: string): number {
    return this.nodes.filter(node => node.status === status).length;
  }

  isOverdue(dueDate: Date | undefined): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  isDueSoon(dueDate: Date | undefined): boolean {
    if (!dueDate) return false;
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }

  getUserName(node: PersonalNode): string {
    if (typeof node.userId === 'object' && node.userId !== null) {
      const user = node.userId as unknown as PopulatedUser;
      return user.username || 'Miembro';
    }
    return 'Miembro';
  }

  getStatusLabel(status: string): string {
    return this.STATUS_LABELS[status] || status;
  }

  getDifficultyLabel(difficulty: string | undefined): string {
    if (!difficulty) return 'N/A';
    return this.DIFFICULTY_LABELS[difficulty] || difficulty;
  }
}
