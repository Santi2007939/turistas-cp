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
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-4 py-8">
        <!-- Header Section -->
        <div class="bg-card-bg border border-card-border rounded-kinetic p-6 mb-6">
          <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 class="text-3xl font-bold text-deep-sea mb-2">🗺️ Mi Roadmap</h1>
              <p class="text-icon-gray">Gestiona tu ruta de aprendizaje personalizada</p>
            </div>
            <div class="flex gap-2">
              <button 
                routerLink="/roadmap/kanban"
                class="bg-deep-sea hover:opacity-90 text-white font-bold py-2 px-4 rounded-kinetic transition-all">
                📋 Kanban
              </button>
              <button 
                routerLink="/roadmap/graph"
                class="bg-deep-sea hover:opacity-90 text-white font-bold py-2 px-4 rounded-kinetic transition-all">
                📊 Gráfica
              </button>
              <button 
                *ngIf="selectedView === 'personal'"
                (click)="showAddThemeModal = true"
                class="bg-electric-blue hover:opacity-90 text-deep-sea font-bold py-3 px-6 rounded-kinetic transition-all flex items-center gap-2">
                <span class="text-xl">+</span>
                <span>Agregar Tema</span>
              </button>
            </div>
          </div>

          <!-- View Selector and Filters -->
          <div class="mt-6 flex flex-col md:flex-row gap-4">
            <!-- View Selector -->
            <div class="flex gap-2 items-center">
              <label class="font-bold text-deep-sea text-sm">Vista:</label>
              <select 
                [(ngModel)]="selectedView"
                (change)="onViewChange()"
                class="border border-card-border rounded-kinetic px-4 py-2 bg-white hover:border-electric-blue focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 transition-all">
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
                class="w-full border border-card-border rounded-kinetic px-4 py-2 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 transition-all">
            </div>

            <!-- Filter by Status -->
            <div class="flex gap-2 items-center">
              <label class="font-bold text-deep-sea text-sm">Estado:</label>
              <select 
                [(ngModel)]="filterStatus"
                (change)="applyFilters()"
                class="border border-card-border rounded-kinetic px-4 py-2 bg-white hover:border-electric-blue focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 transition-all">
                <option value="">Todos</option>
                <option value="not-started">No iniciado</option>
                <option value="in-progress">En progreso</option>
                <option value="completed">Completado</option>
                <option value="mastered">Dominado</option>
              </select>
            </div>

            <!-- Sort Options -->
            <div class="flex gap-2 items-center">
              <label class="font-bold text-deep-sea text-sm">Ordenar:</label>
              <select 
                [(ngModel)]="sortBy"
                (change)="applyFilters()"
                class="border border-card-border rounded-kinetic px-4 py-2 bg-white hover:border-electric-blue focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 transition-all">
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
          <div class="bg-card-bg border border-card-border rounded-kinetic p-6 animate-pulse">
            <div class="h-4 bg-card-border rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-card-border rounded w-1/2 mb-4"></div>
            <div class="h-2 bg-card-border rounded w-full"></div>
          </div>
          <div class="bg-card-bg border border-card-border rounded-kinetic p-6 animate-pulse">
            <div class="h-4 bg-card-border rounded w-2/3 mb-4"></div>
            <div class="h-4 bg-card-border rounded w-1/3 mb-4"></div>
            <div class="h-2 bg-card-border rounded w-full"></div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border-l-4 border-red-500 rounded-kinetic p-6 mb-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <span class="text-2xl">⚠️</span>
            </div>
            <div class="ml-3">
              <h3 class="text-red-800 font-bold">Error al cargar roadmap</h3>
              <p class="text-red-700 mt-1">{{ error }}</p>
              <button 
                (click)="loadRoadmap()"
                class="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-kinetic text-sm font-bold transition-all">
                Reintentar
              </button>
            </div>
          </div>
        </div>

        <!-- Progress Overview -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" *ngIf="!loading && filteredNodes.length > 0">
          <div class="bg-card-bg border border-card-border rounded-kinetic p-4 hover:border-electric-blue transition-colors">
            <div class="flex items-center gap-3">
              <div class="text-2xl text-icon-gray">⏳</div>
              <div class="flex-1">
                <p class="text-icon-gray text-sm font-bold">No iniciado</p>
                <p class="text-3xl font-bold text-deep-sea">{{ getCountByStatus('not-started') }}</p>
              </div>
            </div>
          </div>
          <div class="bg-card-bg border border-card-border rounded-kinetic p-4 hover:border-electric-blue transition-colors">
            <div class="flex items-center gap-3">
              <div class="text-2xl text-icon-gray">🔄</div>
              <div class="flex-1">
                <p class="text-icon-gray text-sm font-bold">En progreso</p>
                <p class="text-3xl font-bold text-deep-sea">{{ getCountByStatus('in-progress') }}</p>
              </div>
            </div>
          </div>
          <div class="bg-card-bg border border-card-border rounded-kinetic p-4 hover:border-electric-blue transition-colors">
            <div class="flex items-center gap-3">
              <div class="text-2xl text-icon-gray">✅</div>
              <div class="flex-1">
                <p class="text-icon-gray text-sm font-bold">Completado</p>
                <p class="text-3xl font-bold text-deep-sea">{{ getCountByStatus('completed') }}</p>
              </div>
            </div>
          </div>
          <div class="bg-card-bg border border-card-border rounded-kinetic p-4 hover:border-electric-blue transition-colors">
            <div class="flex items-center gap-3">
              <div class="text-2xl text-icon-gray">🏆</div>
              <div class="flex-1">
                <p class="text-icon-gray text-sm font-bold">Dominado</p>
                <p class="text-3xl font-bold text-deep-sea">{{ getCountByStatus('mastered') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Results Count -->
        <div class="mb-4" *ngIf="!loading && nodes.length > 0">
          <p class="text-sm text-icon-gray">
            Mostrando <span class="font-bold text-deep-sea">{{ filteredNodes.length }}</span> de <span class="font-bold text-deep-sea">{{ nodes.length }}</span> temas
          </p>
        </div>

        <!-- Roadmap Nodes -->
        <div class="space-y-4">
          <div 
            *ngFor="let node of filteredNodes" 
          class="bg-card-bg border border-card-border rounded-kinetic p-6 hover:border-electric-blue transition-all border-l-4"
          [ngClass]="{
            'border-l-card-border': node.status === 'not-started',
            'border-l-electric-blue': node.status === 'in-progress',
            'border-l-green-500': node.status === 'completed',
            'border-l-deep-sea': node.status === 'mastered'
          }">
          <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div class="flex-1">
              <div class="flex items-start gap-3 mb-3">
                <div class="text-2xl text-icon-gray">
                  {{ node.status === 'not-started' ? '⏳' : node.status === 'in-progress' ? '🔄' : node.status === 'completed' ? '✅' : '🏆' }}
                </div>
                <div class="flex-1">
                  <h2 class="text-xl font-bold text-deep-sea mb-1">
                    {{ node.themeId?.name || 'Theme' }}
                  </h2>
                  <p class="text-icon-gray text-sm">{{ node.themeId?.description || '' }}</p>
                </div>
              </div>
              
              <div class="flex flex-wrap gap-2 mb-3">
                <span 
                  class="px-3 py-1 text-xs font-bold rounded-kinetic"
                  [ngClass]="{
                    'bg-card-border text-icon-gray': node.status === 'not-started',
                    'bg-electric-blue/10 text-electric-blue': node.status === 'in-progress',
                    'bg-green-100 text-green-700': node.status === 'completed',
                    'bg-deep-sea text-white': node.status === 'mastered'
                  }">
                  {{ getStatusLabel(node.status) }}
                </span>
                <span class="bg-card-border text-icon-gray rounded-kinetic px-3 py-1 text-xs font-bold">
                  📚 {{ node.themeId?.category }}
                </span>
                <span 
                  class="px-3 py-1 text-xs font-bold rounded-kinetic"
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
                <div class="flex justify-between text-sm font-bold mb-2">
                  <span class="text-deep-sea">Progreso</span>
                  <span class="text-electric-blue">{{ node.progress }}%</span>
                </div>
                <div class="w-full bg-card-border rounded-kinetic h-3 overflow-hidden">
                  <div 
                    class="h-3 rounded-kinetic transition-all duration-500 ease-out bg-electric-blue"
                    [style.width.%]="node.progress">
                  </div>
                </div>
              </div>

              <div *ngIf="node.notes" class="bg-white border border-card-border rounded-kinetic p-3 mb-3">
                <p class="text-xs text-icon-gray font-bold mb-1">Notas:</p>
                <p class="text-sm text-deep-sea">{{ node.notes }}</p>
              </div>

              <div class="flex items-center gap-4 text-xs">
                <div *ngIf="node.lastPracticed" class="flex items-center gap-2 text-icon-gray">
                  <span>🕐</span>
                  <span>Última práctica: {{ node.lastPracticed | date:'short' }}</span>
                </div>
                <div *ngIf="node.dueDate" class="flex items-center gap-2"
                     [ngClass]="{
                       'text-red-600 font-bold': isOverdue(node.dueDate),
                       'text-orange-600': isDueSoon(node.dueDate),
                       'text-icon-gray': !isOverdue(node.dueDate) && !isDueSoon(node.dueDate)
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
                class="bg-electric-blue hover:opacity-90 text-deep-sea px-4 py-2 rounded-kinetic text-sm font-bold transition-all text-center">
                📝 Subtemas
              </a>
              <button 
                *ngIf="selectedView === 'personal'"
                (click)="editNode(node)"
                class="bg-deep-sea hover:opacity-90 text-white px-4 py-2 rounded-kinetic text-sm font-bold transition-all">
                ✏️ Actualizar
              </button>
              <button 
                *ngIf="selectedView === 'personal'"
                (click)="confirmDelete(node._id, node.themeId?.name || 'este tema')"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-kinetic text-sm font-bold transition-all">
                🗑️ Eliminar
              </button>
              <div 
                *ngIf="selectedView === 'members'"
                class="bg-electric-blue/10 rounded-kinetic px-4 py-2 text-center">
                <p class="text-xs text-icon-gray font-bold mb-1">Miembro</p>
                <p class="text-sm text-electric-blue font-bold">{{ getUserName(node) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && nodes.length === 0" class="bg-card-bg border border-card-border rounded-kinetic p-12 text-center">
        <div class="text-6xl mb-4">🗺️</div>
        <h3 class="text-2xl font-bold text-deep-sea mb-3">Tu roadmap está vacío</h3>
        <p class="text-icon-gray mb-6 max-w-md mx-auto">
          Comienza a agregar temas a tu roadmap para hacer seguimiento de tu progreso de aprendizaje.
        </p>
        <button 
          *ngIf="selectedView === 'personal'"
          (click)="showAddThemeModal = true"
          class="bg-electric-blue hover:opacity-90 text-deep-sea font-bold py-3 px-8 rounded-kinetic transition-all">
          ➕ Agregar mi primer tema
        </button>
      </div>

      <!-- No Results State -->
      <div *ngIf="!loading && nodes.length > 0 && filteredNodes.length === 0" class="bg-card-bg border border-card-border rounded-kinetic p-12 text-center">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-2xl font-bold text-deep-sea mb-3">No se encontraron resultados</h3>
        <p class="text-icon-gray mb-6">
          Intenta ajustar los filtros o la búsqueda para encontrar lo que buscas.
        </p>
        <button 
          (click)="clearFilters()"
          class="bg-icon-gray hover:opacity-90 text-white font-bold py-3 px-8 rounded-kinetic transition-all">
          Limpiar filtros
        </button>
      </div>
    </div>

      <!-- Add Theme Modal -->
      <div 
        *ngIf="showAddThemeModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="showAddThemeModal = false">
        <div class="bg-white border border-card-border rounded-kinetic p-8 w-full max-w-lg" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-6">
            <span class="text-2xl text-icon-gray">➕</span>
            <h3 class="text-2xl font-bold text-deep-sea">Agregar Tema al Roadmap</h3>
          </div>
          
          <div class="mb-6">
            <label class="block text-deep-sea text-sm font-bold mb-2">Selecciona un tema</label>
            <select 
              [(ngModel)]="selectedThemeId"
              class="w-full border border-card-border rounded-kinetic px-4 py-3 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 transition-all">
              <option value="">Elige un tema...</option>
              <option *ngFor="let theme of availableThemes" [value]="theme._id">
                {{ theme.name }} ({{ theme.category }} - {{ theme.difficulty }})
              </option>
            </select>
            <p class="text-xs text-icon-gray mt-2">
              El tema se agregará con estado "No iniciado" y progreso 0%
            </p>
          </div>

          <div class="flex gap-3 justify-end">
            <button 
              (click)="showAddThemeModal = false"
              class="bg-card-bg hover:bg-card-border text-deep-sea font-bold px-6 py-3 rounded-kinetic transition-all">
              Cancelar
            </button>
            <button 
              (click)="addThemeToRoadmap()"
              [disabled]="!selectedThemeId"
              class="bg-electric-blue hover:opacity-90 text-deep-sea font-bold px-6 py-3 rounded-kinetic disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">
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
        <div class="bg-white border border-card-border rounded-kinetic p-8 w-full max-w-lg" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-6">
            <span class="text-2xl text-icon-gray">✏️</span>
            <h3 class="text-2xl font-bold text-deep-sea">Actualizar Progreso</h3>
          </div>
          
          <div class="mb-5">
            <label class="block text-deep-sea text-sm font-bold mb-2">Estado</label>
            <select 
              [(ngModel)]="editingNode.status"
              class="w-full border border-card-border rounded-kinetic px-4 py-3 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 transition-all">
              <option value="not-started">⏳ No iniciado</option>
              <option value="in-progress">🔄 En progreso</option>
              <option value="completed">✅ Completado</option>
              <option value="mastered">🏆 Dominado</option>
            </select>
          </div>

          <div class="mb-5">
            <label class="block text-deep-sea text-sm font-bold mb-2">Progreso (%)</label>
            <div class="flex items-center gap-4">
              <input 
                type="range" 
                [(ngModel)]="editingNode.progress"
                min="0"
                max="100"
                class="flex-1 h-2 bg-card-border rounded-kinetic appearance-none cursor-pointer">
              <input 
                type="number" 
                [(ngModel)]="editingNode.progress"
                min="0"
                max="100"
                class="w-20 border border-card-border rounded-kinetic px-3 py-2 text-center font-bold focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 transition-all">
            </div>
            <div class="mt-2 w-full bg-card-border rounded-kinetic h-2">
              <div 
                class="h-2 rounded-kinetic transition-all bg-electric-blue"
                [style.width.%]="editingNode.progress">
              </div>
            </div>
          </div>

          <div class="mb-5">
            <label class="block text-deep-sea text-sm font-bold mb-2">Fecha límite (opcional)</label>
            <input 
              type="date"
              [(ngModel)]="editingNode.dueDate"
              class="w-full border border-card-border rounded-kinetic px-4 py-3 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 transition-all">
          </div>

          <div class="mb-6">
            <label class="block text-deep-sea text-sm font-bold mb-2">Notas</label>
            <textarea 
              [(ngModel)]="editingNode.notes"
              rows="4"
              placeholder="Agrega notas sobre tu progreso, recursos útiles, etc."
              class="w-full border border-card-border rounded-kinetic px-4 py-3 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 transition-all resize-none"></textarea>
          </div>

          <div class="flex gap-3 justify-end">
            <button 
              (click)="showUpdateModal = false"
              class="bg-card-bg hover:bg-card-border text-deep-sea font-bold px-6 py-3 rounded-kinetic transition-all">
              Cancelar
            </button>
            <button 
              (click)="saveNodeUpdate()"
              class="bg-electric-blue hover:opacity-90 text-deep-sea font-bold px-6 py-3 rounded-kinetic transition-all">
              💾 Guardar cambios
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div 
        *ngIf="showDeleteConfirmation" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="showDeleteConfirmation = false">
        <div class="bg-white border border-card-border rounded-kinetic p-8 w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl text-icon-gray">⚠️</span>
            <h3 class="text-2xl font-bold text-deep-sea">Confirmar eliminación</h3>
          </div>
          
          <p class="text-icon-gray mb-6">
            ¿Estás seguro de que quieres eliminar <span class="font-bold text-deep-sea">"{{ nodeToDeleteName }}"</span> de tu roadmap?
            Esta acción no se puede deshacer.
          </p>

          <div class="flex gap-3 justify-end">
            <button 
              (click)="showDeleteConfirmation = false"
              class="bg-card-bg hover:bg-card-border text-deep-sea font-bold px-6 py-3 rounded-kinetic transition-all">
              Cancelar
            </button>
            <button 
              (click)="deleteNode(nodeToDelete)"
              class="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-kinetic transition-all">
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
