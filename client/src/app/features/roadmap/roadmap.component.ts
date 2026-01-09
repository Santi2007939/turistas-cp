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
    <!-- Matte-Drift Roadmap -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
        <!-- Header Section -->
        <div class="bg-white rounded-[12px] p-6 mb-6" style="border: 1px solid #EAE3DB;">
          <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 class="text-3xl font-semibold mb-2" style="color: #2D2622;">🗺️ Mi Roadmap</h1>
              <p style="color: #4A3B33;">Gestiona tu ruta de aprendizaje personalizada</p>
            </div>
            <div class="flex gap-3">
              <button 
                routerLink="/roadmap/kanban"
                class="text-white font-medium py-2 px-4 rounded-[12px] transition-all"
                style="background-color: #D4A373;">
                📋 Kanban
              </button>
              <button 
                routerLink="/roadmap/graph"
                class="text-white font-medium py-2 px-4 rounded-[12px] transition-all"
                style="background-color: #D4A373;">
                📊 Gráfica
              </button>
              <button 
                *ngIf="selectedView === 'personal'"
                (click)="showAddThemeModal = true"
                class="text-white font-medium py-3 px-6 rounded-[12px] transition-all flex items-center gap-2"
                style="background-color: #8B5E3C;">
                <span class="text-xl">+</span>
                <span>Agregar Tema</span>
              </button>
            </div>
          </div>

          <!-- View Selector and Filters -->
          <div class="mt-6 flex flex-col md:flex-row gap-4">
            <!-- View Selector -->
            <div class="flex gap-2 items-center">
              <label class="font-medium text-sm" style="color: #2D2622;">Vista:</label>
              <select 
                [(ngModel)]="selectedView"
                (change)="onViewChange()"
                class="rounded-[12px] px-4 py-2 bg-white transition-all"
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
                placeholder="🔍 Buscar tema..."
                class="w-full rounded-[12px] px-4 py-2 transition-all"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
            </div>

            <!-- Filter by Status -->
            <div class="flex gap-2 items-center">
              <label class="font-medium text-sm" style="color: #2D2622;">Estado:</label>
              <select 
                [(ngModel)]="filterStatus"
                (change)="applyFilters()"
                class="rounded-[12px] px-4 py-2 bg-white transition-all"
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
              <label class="font-medium text-sm" style="color: #2D2622;">Ordenar:</label>
              <select 
                [(ngModel)]="sortBy"
                (change)="applyFilters()"
                class="rounded-[12px] px-4 py-2 bg-white transition-all"
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
          <div class="bg-white rounded-[12px] p-6 animate-pulse" style="border: 1px solid #EAE3DB;">
            <div class="h-4 rounded w-3/4 mb-4" style="background-color: #EAE3DB;"></div>
            <div class="h-4 rounded w-1/2 mb-4" style="background-color: #EAE3DB;"></div>
            <div class="h-2 rounded w-full" style="background-color: #EAE3DB;"></div>
          </div>
          <div class="bg-white rounded-[12px] p-6 animate-pulse" style="border: 1px solid #EAE3DB;">
            <div class="h-4 rounded w-2/3 mb-4" style="background-color: #EAE3DB;"></div>
            <div class="h-4 rounded w-1/3 mb-4" style="background-color: #EAE3DB;"></div>
            <div class="h-2 rounded w-full" style="background-color: #EAE3DB;"></div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-white rounded-[12px] p-6 mb-6 border-l-4" style="border-color: #8B5E3C; border-right: 1px solid #EAE3DB; border-top: 1px solid #EAE3DB; border-bottom: 1px solid #EAE3DB;">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <span class="text-2xl">⚠️</span>
            </div>
            <div class="ml-3">
              <h3 class="font-semibold" style="color: #8B5E3C;">Error al cargar roadmap</h3>
              <p class="mt-1" style="color: #2D2622;">{{ error }}</p>
              <button 
                (click)="loadRoadmap()"
                class="mt-3 text-white px-4 py-2 rounded-[12px] text-sm font-medium transition-all"
                style="background-color: #8B5E3C;">
                Reintentar
              </button>
            </div>
          </div>
        </div>

        <!-- Progress Overview -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6" *ngIf="!loading && filteredNodes.length > 0">
          <div class="bg-white rounded-[12px] p-4 transition-colors" style="border: 1px solid #EAE3DB;">
            <div class="flex items-center gap-3">
              <div class="text-3xl">⏳</div>
              <div class="flex-1">
                <p class="text-sm font-medium" style="color: #4A3B33;">No iniciado</p>
                <p class="text-2xl font-bold font-mono" style="color: #2D2622;">{{ getCountByStatus('not-started') }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-[12px] p-4 transition-colors" style="border: 1px solid #EAE3DB;">
            <div class="flex items-center gap-3">
              <div class="text-3xl">🔄</div>
              <div class="flex-1">
                <p class="text-sm font-medium" style="color: #4A3B33;">En progreso</p>
                <p class="text-2xl font-bold font-mono" style="color: #D4A373;">{{ getCountByStatus('in-progress') }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-[12px] p-4 transition-colors" style="border: 1px solid #EAE3DB;">
            <div class="flex items-center gap-3">
              <div class="text-3xl">✅</div>
              <div class="flex-1">
                <p class="text-sm font-medium" style="color: #4A3B33;">Completado</p>
                <p class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ getCountByStatus('completed') }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-[12px] p-4 transition-colors" style="border: 1px solid #EAE3DB;">
            <div class="flex items-center gap-3">
              <div class="text-3xl">🏆</div>
              <div class="flex-1">
                <p class="text-sm font-medium" style="color: #4A3B33;">Dominado</p>
                <p class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ getCountByStatus('mastered') }}</p>
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
          class="bg-white rounded-[12px] p-6 transition-all border-l-4"
          style="border-right: 1px solid #EAE3DB; border-top: 1px solid #EAE3DB; border-bottom: 1px solid #EAE3DB;"
          [ngStyle]="{
            'border-left-color': node.status === 'not-started' ? '#EAE3DB' : node.status === 'in-progress' ? '#D4A373' : node.status === 'completed' ? '#8B5E3C' : '#8B5E3C'
          }">
          <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div class="flex-1">
              <div class="flex items-start gap-3 mb-3">
                <div class="text-3xl">
                  {{ node.status === 'not-started' ? '⏳' : node.status === 'in-progress' ? '🔄' : node.status === 'completed' ? '✅' : '🏆' }}
                </div>
                <div class="flex-1">
                  <h2 class="text-xl font-semibold mb-1" style="color: #2D2622;">
                    {{ node.themeId?.name || 'Theme' }}
                  </h2>
                  <p class="text-sm" style="color: #4A3B33;">{{ node.themeId?.description || '' }}</p>
                </div>
              </div>
              
              <div class="flex flex-wrap gap-2 mb-3">
                <span 
                  class="px-3 py-1 text-xs font-medium rounded-[12px]"
                  style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                  {{ getStatusLabel(node.status) }}
                </span>
                <span class="rounded-[12px] px-3 py-1 text-xs font-medium" style="background-color: #FCF9F5; color: #2D2622; border: 1px solid #EAE3DB;">
                  📚 {{ node.themeId?.category }}
                </span>
                <span 
                  class="px-3 py-1 text-xs font-medium rounded-[12px]"
                  style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                  {{ getDifficultyLabel(node.themeId?.difficulty) }}
                </span>
              </div>

              <!-- Progress Bar - Matte-Drift Style -->
              <div class="mb-3">
                <div class="flex justify-between text-sm font-medium mb-2">
                  <span style="color: #2D2622;">Progreso</span>
                  <span class="font-mono" style="color: #8B5E3C;">{{ node.progress }}%</span>
                </div>
                <div class="w-full rounded-[12px] h-2 overflow-hidden" style="background-color: #EAE3DB;">
                  <div 
                    class="h-2 rounded-[12px] transition-all duration-500 ease-out"
                    style="background-color: #D4A373;"
                    [style.width.%]="node.progress">
                  </div>
                </div>
              </div>

              <div *ngIf="node.notes" class="rounded-[12px] p-3 mb-3" style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
                <p class="text-xs font-medium mb-1" style="color: #4A3B33;">Notas:</p>
                <p class="text-sm" style="color: #2D2622;">{{ node.notes }}</p>
              </div>

              <div class="flex items-center gap-4 text-xs">
                <div *ngIf="node.lastPracticed" class="flex items-center gap-2" style="color: #4A3B33;">
                  <span>🕐</span>
                  <span>Última práctica: {{ node.lastPracticed | date:'short' }}</span>
                </div>
                <div *ngIf="node.dueDate" class="flex items-center gap-2"
                     [ngStyle]="{
                       'color': isOverdue(node.dueDate) ? '#dc2626' : isDueSoon(node.dueDate) ? '#D4A373' : '#4A3B33',
                       'font-weight': isOverdue(node.dueDate) ? 'bold' : 'normal'
                     }">
                  <span>📅</span>
                  <span>Vence: {{ node.dueDate | date:'short' }}</span>
                  <span *ngIf="isOverdue(node.dueDate)">⚠️</span>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2" [ngClass]="{'md:ml-4': selectedView === 'personal'}">
              <a 
                *ngIf="selectedView === 'personal'"
                [routerLink]="['/roadmap', node._id, 'subtopics']"
                class="text-white px-4 py-2 rounded-[12px] text-sm font-medium transition-all text-center"
                style="background-color: #8B5E3C;">
                📝 Subtemas
              </a>
              <button 
                *ngIf="selectedView === 'personal'"
                (click)="editNode(node)"
                class="text-white px-4 py-2 rounded-[12px] text-sm font-medium transition-all"
                style="background-color: #D4A373;">
                ✏️ Actualizar
              </button>
              <button 
                *ngIf="selectedView === 'personal'"
                (click)="confirmDelete(node._id, node.themeId?.name || 'este tema')"
                class="px-4 py-2 rounded-[12px] text-sm font-medium transition-all"
                style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                🗑️ Eliminar
              </button>
              <div 
                *ngIf="selectedView === 'members'"
                class="rounded-[12px] px-4 py-2 text-center"
                style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
                <p class="text-xs font-medium mb-1" style="color: #4A3B33;">Miembro</p>
                <p class="text-sm font-semibold" style="color: #8B5E3C;">{{ getUserName(node) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && nodes.length === 0" class="bg-white rounded-[12px] p-12 text-center" style="border: 1px solid #EAE3DB;">
        <div class="text-6xl mb-4">🗺️</div>
        <h3 class="text-2xl font-semibold mb-3" style="color: #2D2622;">Tu roadmap está vacío</h3>
        <p class="mb-6 max-w-md mx-auto" style="color: #4A3B33;">
          Comienza a agregar temas a tu roadmap para hacer seguimiento de tu progreso de aprendizaje.
        </p>
        <button 
          *ngIf="selectedView === 'personal'"
          (click)="showAddThemeModal = true"
          class="text-white font-medium py-3 px-8 rounded-[12px] transition-all"
          style="background-color: #8B5E3C;">
          ➕ Agregar mi primer tema
        </button>
      </div>

      <!-- No Results State -->
      <div *ngIf="!loading && nodes.length > 0 && filteredNodes.length === 0" class="bg-white rounded-[12px] p-12 text-center" style="border: 1px solid #EAE3DB;">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-2xl font-semibold mb-3" style="color: #2D2622;">No se encontraron resultados</h3>
        <p class="mb-6" style="color: #4A3B33;">
          Intenta ajustar los filtros o la búsqueda para encontrar lo que buscas.
        </p>
        <button 
          (click)="clearFilters()"
          class="font-medium py-3 px-8 rounded-[12px] transition-all"
          style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
          Limpiar filtros
        </button>
      </div>
    </div>

      <!-- Add Theme Modal -->
      <div 
        *ngIf="showAddThemeModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="showAddThemeModal = false">
        <div class="bg-white rounded-[12px] p-8 w-full max-w-lg" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-6">
            <span class="text-3xl">➕</span>
            <h3 class="text-2xl font-semibold" style="color: #2D2622;">Agregar Tema al Roadmap</h3>
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Selecciona un tema</label>
            <select 
              [(ngModel)]="selectedThemeId"
              class="w-full rounded-[12px] px-4 py-3 transition-all"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
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
              class="font-medium px-6 py-3 rounded-[12px] transition-all"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancelar
            </button>
            <button 
              (click)="addThemeToRoadmap()"
              [disabled]="!selectedThemeId"
              class="text-white font-medium px-6 py-3 rounded-[12px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style="background-color: #8B5E3C;">
              Agregar tema
            </button>
          </div>
        </div>
      </div>

      <!-- Update Node Modal -->
      <div 
        *ngIf="showUpdateModal && editingNode" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="showUpdateModal = false">
        <div class="bg-white rounded-[12px] p-8 w-full max-w-lg" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-6">
            <span class="text-3xl">✏️</span>
            <h3 class="text-2xl font-semibold" style="color: #2D2622;">Actualizar Progreso</h3>
          </div>
          
          <div class="mb-5">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Estado</label>
            <select 
              [(ngModel)]="editingNode.status"
              class="w-full rounded-[12px] px-4 py-3 transition-all"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
              <option value="not-started">⏳ No iniciado</option>
              <option value="in-progress">🔄 En progreso</option>
              <option value="completed">✅ Completado</option>
              <option value="mastered">🏆 Dominado</option>
            </select>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Progreso (%)</label>
            <div class="flex items-center gap-4">
              <input 
                type="range" 
                [(ngModel)]="editingNode.progress"
                min="0"
                max="100"
                class="flex-1 h-2 rounded-[12px] appearance-none cursor-pointer"
                style="background-color: #EAE3DB;">
              <input 
                type="number" 
                [(ngModel)]="editingNode.progress"
                min="0"
                max="100"
                class="w-20 rounded-[12px] px-3 py-2 text-center font-bold font-mono transition-all"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
            </div>
            <div class="mt-2 w-full rounded-[12px] h-2" style="background-color: #EAE3DB;">
              <div 
                class="h-2 rounded-[12px] transition-all"
                style="background-color: #D4A373;"
                [style.width.%]="editingNode.progress">
              </div>
            </div>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Fecha límite (opcional)</label>
            <input 
              type="date"
              [(ngModel)]="editingNode.dueDate"
              class="w-full rounded-[12px] px-4 py-3 transition-all"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Notas</label>
            <textarea 
              [(ngModel)]="editingNode.notes"
              rows="4"
              placeholder="Agrega notas sobre tu progreso, recursos útiles, etc."
              class="w-full rounded-[12px] px-4 py-3 transition-all resize-none"
              style="border: 1px solid #EAE3DB; color: #2D2622;"></textarea>
          </div>

          <div class="flex gap-3 justify-end">
            <button 
              (click)="showUpdateModal = false"
              class="font-medium px-6 py-3 rounded-[12px] transition-all"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancelar
            </button>
            <button 
              (click)="saveNodeUpdate()"
              class="text-white font-medium px-6 py-3 rounded-[12px] transition-all"
              style="background-color: #8B5E3C;">
              💾 Guardar cambios
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div 
        *ngIf="showDeleteConfirmation" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="showDeleteConfirmation = false">
        <div class="bg-white rounded-[12px] p-8 w-full max-w-md" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-4xl">⚠️</span>
            <h3 class="text-2xl font-semibold" style="color: #2D2622;">Confirmar eliminación</h3>
          </div>
          
          <p class="mb-6" style="color: #4A3B33;">
            ¿Estás seguro de que quieres eliminar <span class="font-semibold" style="color: #2D2622;">"{{ nodeToDeleteName }}"</span> de tu roadmap?
            Esta acción no se puede deshacer.
          </p>

          <div class="flex gap-3 justify-end">
            <button 
              (click)="showDeleteConfirmation = false"
              class="font-medium px-6 py-3 rounded-[12px] transition-all"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancelar
            </button>
            <button 
              (click)="deleteNode(nodeToDelete)"
              class="font-medium px-6 py-3 rounded-[12px] transition-all"
              style="background-color: #8B5E3C; color: white;">
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
    'beginner': '⭐ Principiante',
    'intermediate': '⭐⭐ Intermedio',
    'advanced': '⭐⭐⭐ Avanzado',
    'expert': '⭐⭐⭐⭐ Experto'
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
