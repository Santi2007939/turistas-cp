import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoadmapService, PersonalNode, Subtopic, CodeSnippet, Resource, LinkedProblem } from '../../core/services/roadmap.service';
import { ProblemsService, Problem } from '../../core/services/problems.service';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-subtopic-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <button 
                routerLink="/roadmap"
                class="text-gray-600 hover:text-gray-800">
                ← Volver
              </button>
              <div>
                <h1 class="text-3xl font-bold text-gray-800">{{ node?.themeId?.name }}</h1>
                <p class="text-gray-600">{{ node?.themeId?.description }}</p>
              </div>
            </div>
            <button 
              (click)="showAddSubtopicModal = true"
              class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
              ➕ Agregar Subtema
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <div class="text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Cargando...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
          <div class="flex items-start">
            <span class="text-2xl mr-3">⚠️</span>
            <div>
              <h3 class="text-red-800 font-semibold">Error</h3>
              <p class="text-red-700 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Subtopics List -->
        <div *ngIf="!loading && node" class="space-y-6">
          <div *ngFor="let subtopic of node.subtopics; let i = index" 
               class="bg-white rounded-lg shadow-sm p-6">
            <!-- Subtopic Header -->
            <div class="flex items-start justify-between mb-4 pb-4 border-b">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-800 mb-2">{{ subtopic.name }}</h3>
                <p class="text-gray-600">{{ subtopic.description }}</p>
              </div>
              <div class="flex gap-2">
                <button 
                  (click)="editSubtopic(subtopic)"
                  class="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm">
                  ✏️
                </button>
                <button 
                  (click)="deleteSubtopic(subtopic._id || '')"
                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                  🗑️
                </button>
              </div>
            </div>

            <!-- Tabs -->
            <div class="border-b mb-4">
              <div class="flex gap-2 overflow-x-auto">
                <button 
                  *ngFor="let tab of tabs"
                  (click)="activeTab[subtopic._id || i] = tab.id"
                  class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                  [ngClass]="{
                    'border-blue-500 text-blue-600': activeTab[subtopic._id || i] === tab.id,
                    'border-transparent text-gray-600 hover:text-gray-800': activeTab[subtopic._id || i] !== tab.id
                  }">
                  {{ tab.icon }} {{ tab.label }}
                </button>
              </div>
            </div>

            <!-- Tab Content -->
            <div class="mt-4">
              <!-- Personal Notes -->
              <div *ngIf="activeTab[subtopic._id || i] === 'personal'">
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p class="text-sm text-yellow-800">
                    🔒 Estas notas son privadas y solo tú puedes verlas
                  </p>
                </div>
                <textarea 
                  [(ngModel)]="subtopic.personalNotes"
                  (blur)="saveSubtopic(subtopic)"
                  rows="8"
                  placeholder="Agrega tus notas personales aquí..."
                  class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none">
                </textarea>
              </div>

              <!-- Shared Theory -->
              <div *ngIf="activeTab[subtopic._id || i] === 'theory'">
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <p class="text-sm text-blue-800">
                    🌐 Esta sección es editable por todos los miembros del equipo
                  </p>
                </div>
                <textarea 
                  [(ngModel)]="subtopic.sharedTheory"
                  (blur)="saveSubtopic(subtopic)"
                  rows="10"
                  placeholder="Agrega teoría y conceptos compartidos..."
                  class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none">
                </textarea>
              </div>

              <!-- Code Editor -->
              <div *ngIf="activeTab[subtopic._id || i] === 'code'">
                <div class="space-y-4">
                  <div *ngFor="let snippet of subtopic.codeSnippets; let j = index" 
                       class="border-2 border-gray-300 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <select 
                        [(ngModel)]="snippet.language"
                        (change)="saveSubtopic(subtopic)"
                        class="border border-gray-300 rounded px-3 py-1 text-sm">
                        <option value="python">🐍 Python</option>
                        <option value="cpp">⚡ C++</option>
                      </select>
                      <button 
                        (click)="removeCodeSnippet(subtopic, j)"
                        class="text-red-600 hover:text-red-800 text-sm">
                        🗑️ Eliminar
                      </button>
                    </div>
                    <input 
                      type="text"
                      [(ngModel)]="snippet.description"
                      (blur)="saveSubtopic(subtopic)"
                      placeholder="Descripción del código..."
                      class="w-full border border-gray-300 rounded px-3 py-2 mb-2 text-sm">
                    <pre class="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto"><code><textarea 
                      [(ngModel)]="snippet.code"
                      (blur)="saveSubtopic(subtopic)"
                      rows="12"
                      placeholder="// Escribe tu código aquí..."
                      class="w-full bg-transparent text-green-400 font-mono text-sm border-0 focus:outline-none resize-none">
</textarea></code></pre>
                  </div>
                  <button 
                    (click)="addCodeSnippet(subtopic)"
                    class="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors">
                    ➕ Agregar fragmento de código
                  </button>
                </div>
              </div>

              <!-- Problems -->
              <div *ngIf="activeTab[subtopic._id || i] === 'problems'">
                <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-4 flex items-center justify-between">
                  <p class="text-sm text-green-800">
                    💻 Problemas vinculados a este subtema
                  </p>
                  <button 
                    (click)="navigateToFilteredProblems(subtopic)"
                    class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1">
                    Ver todos →
                  </button>
                </div>
                <div class="space-y-3">
                  <!-- Problem Cards -->
                  <div *ngFor="let problem of subtopic.linkedProblems" 
                       class="border-2 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                       [ngClass]="{
                         'border-green-200': problem.difficulty === 'easy',
                         'border-yellow-200': problem.difficulty === 'medium',
                         'border-orange-200': problem.difficulty === 'hard',
                         'border-red-200': problem.difficulty === 'very-hard'
                       }">
                    <!-- Problem Header -->
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-800 mb-1">{{ problem.title }}</h4>
                        <p *ngIf="problem.description" class="text-sm text-gray-600 mb-2">
                          {{ problem.description }}
                        </p>
                      </div>
                      <button 
                        (click)="removeProblemFromSubtopic(subtopic, problem)"
                        class="text-red-600 hover:text-red-800 text-sm ml-2">
                        🗑️
                      </button>
                    </div>
                    
                    <!-- Problem Footer -->
                    <div class="flex items-center justify-between">
                      <span 
                        class="text-xs px-2 py-1 rounded font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-800': problem.difficulty === 'easy',
                          'bg-yellow-100 text-yellow-800': problem.difficulty === 'medium',
                          'bg-orange-100 text-orange-800': problem.difficulty === 'hard',
                          'bg-red-100 text-red-800': problem.difficulty === 'very-hard'
                        }">
                        {{ getDifficultyLabel(problem.difficulty) }}
                      </span>
                      
                      <div class="flex gap-2">
                        <a 
                          *ngIf="problem.link"
                          [href]="problem.link" 
                          target="_blank"
                          class="text-blue-600 hover:text-blue-800 text-xs">
                          🔗 Abrir
                        </a>
                        <a 
                          [routerLink]="['/problems', problem.problemId]"
                          class="text-indigo-600 hover:text-indigo-800 text-xs">
                          Ver detalles
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Add Problem Button -->
                  <button 
                    (click)="openProblemPicker(subtopic)"
                    class="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors">
                    ➕ Vincular problema
                  </button>
                  
                  <!-- Empty State -->
                  <div *ngIf="!subtopic.linkedProblems || subtopic.linkedProblems.length === 0"
                       class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">📝</div>
                    <p class="text-sm">No hay problemas vinculados</p>
                    <p class="text-xs mt-1">Haz clic en "Vincular problema" para agregar</p>
                  </div>
                </div>
              </div>

              <!-- Resources -->
              <div *ngIf="activeTab[subtopic._id || i] === 'resources'">
                <div class="bg-purple-50 border-l-4 border-purple-400 p-4 mb-4">
                  <p class="text-sm text-purple-800">
                    📚 Recursos de aprendizaje editables por todos
                  </p>
                </div>
                <div class="space-y-3">
                  <div *ngFor="let resource of subtopic.resources; let k = index" 
                       class="border-2 border-gray-300 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                      <div class="flex-1 space-y-2">
                        <input 
                          type="text"
                          [(ngModel)]="resource.name"
                          (blur)="saveSubtopic(subtopic)"
                          placeholder="Nombre del recurso"
                          class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                        <input 
                          type="url"
                          [(ngModel)]="resource.link"
                          (blur)="saveSubtopic(subtopic)"
                          placeholder="https://..."
                          class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                      </div>
                      <button 
                        (click)="removeResource(subtopic, k)"
                        class="text-red-600 hover:text-red-800 text-sm mt-2">
                        🗑️
                      </button>
                    </div>
                    <a *ngIf="resource.link" 
                       [href]="resource.link" 
                       target="_blank"
                       class="text-blue-600 hover:text-blue-800 text-xs mt-2 inline-block">
                      🔗 Abrir enlace →
                    </a>
                  </div>
                  <button 
                    (click)="addResource(subtopic)"
                    class="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors">
                    ➕ Agregar recurso
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!node.subtopics || node.subtopics.length === 0" 
               class="bg-white rounded-lg shadow-sm p-12 text-center">
            <div class="text-6xl mb-4">📝</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">No hay subtemas</h3>
            <p class="text-gray-600 mb-6">
              Agrega subtemas para organizar tu contenido de aprendizaje
            </p>
            <button 
              (click)="showAddSubtopicModal = true"
              class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg">
              ➕ Agregar primer subtema
            </button>
          </div>
        </div>
      </div>

      <!-- Add Subtopic Modal -->
      <div 
        *ngIf="showAddSubtopicModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="showAddSubtopicModal = false">
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg" (click)="$event.stopPropagation()">
          <h3 class="text-2xl font-bold text-gray-800 mb-6">➕ Nuevo Subtema</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
              <input 
                type="text"
                [(ngModel)]="newSubtopic.name"
                placeholder="Nombre del subtema"
                class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
              <textarea 
                [(ngModel)]="newSubtopic.description"
                rows="3"
                placeholder="Descripción breve"
                class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none">
              </textarea>
            </div>
          </div>

          <div class="flex gap-3 justify-end mt-6">
            <button 
              (click)="showAddSubtopicModal = false"
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-all">
              Cancelar
            </button>
            <button 
              (click)="createSubtopic()"
              [disabled]="!newSubtopic.name"
              class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">
              Crear subtema
            </button>
          </div>
        </div>
      </div>

      <!-- Problem Picker Modal -->
      <div 
        *ngIf="showProblemPickerModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="closeProblemPicker()">
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <h3 class="text-2xl font-bold text-gray-800 mb-6">🔗 Vincular Problema</h3>
          
          <!-- Search and Filter -->
          <div class="mb-6 space-y-3">
            <input 
              type="text"
              [(ngModel)]="problemSearchQuery"
              (ngModelChange)="filterProblems()"
              placeholder="Buscar problemas..."
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
            
            <div class="flex gap-3">
              <select 
                [(ngModel)]="problemFilterDifficulty"
                (change)="filterProblems()"
                class="border-2 border-gray-300 rounded-lg px-4 py-2">
                <option value="">Todas las dificultades</option>
                <option value="easy">Fácil</option>
                <option value="medium">Media</option>
                <option value="hard">Difícil</option>
                <option value="very-hard">Muy Difícil</option>
              </select>
              
              <select 
                [(ngModel)]="problemFilterView"
                (change)="loadAvailableProblems()"
                class="border-2 border-gray-300 rounded-lg px-4 py-2">
                <option value="personal">Mis problemas</option>
                <option value="team">Problemas del equipo</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loadingProblems" class="text-center py-8">
            <div class="text-4xl mb-4">⏳</div>
            <p class="text-gray-600">Cargando problemas...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="problemPickerError" class="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-4">
            <p class="text-red-700">{{ problemPickerError }}</p>
          </div>

          <!-- Available Problems List -->
          <div *ngIf="!loadingProblems" class="space-y-3 mb-6 max-h-96 overflow-y-auto">
            <div 
              *ngFor="let problem of filteredProblems" 
              (click)="selectProblemForLinking(problem)"
              class="border-2 rounded-lg p-4 cursor-pointer transition-all"
              [ngClass]="{
                'border-blue-500 bg-blue-50': selectedProblemForLink?._id === problem._id,
                'border-gray-200 hover:border-blue-300 hover:bg-gray-50': selectedProblemForLink?._id !== problem._id
              }">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-800 mb-1">{{ problem.title }}</h4>
                  <div class="flex gap-2 items-center">
                    <span 
                      *ngIf="problem.rating"
                      class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      ★ {{ problem.rating }}
                    </span>
                    <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {{ problem.platform }}
                    </span>
                  </div>
                </div>
                <div 
                  *ngIf="selectedProblemForLink?._id === problem._id"
                  class="text-blue-600 text-2xl">
                  ✓
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="filteredProblems.length === 0" class="text-center py-8 text-gray-500">
              <div class="text-4xl mb-2">🔍</div>
              <p class="text-sm">No se encontraron problemas</p>
            </div>
          </div>

          <!-- Problem Metadata Form (shown when problem selected) -->
          <div *ngIf="selectedProblemForLink" class="border-2 border-blue-200 rounded-lg p-6 mb-6 bg-blue-50">
            <h4 class="font-semibold text-gray-800 mb-4">Detalles del problema a vincular</h4>
            
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Título *</label>
                <input 
                  type="text"
                  [(ngModel)]="problemLinkMetadata.title"
                  class="w-full border-2 border-gray-300 rounded-lg px-4 py-2">
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Descripción breve</label>
                <textarea 
                  [(ngModel)]="problemLinkMetadata.description"
                  rows="2"
                  placeholder="Descripción opcional del problema..."
                  class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 resize-none">
                </textarea>
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Link</label>
                <input 
                  type="url"
                  [(ngModel)]="problemLinkMetadata.link"
                  class="w-full border-2 border-gray-300 rounded-lg px-4 py-2">
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Dificultad *</label>
                <select 
                  [(ngModel)]="problemLinkMetadata.difficulty"
                  class="w-full border-2 border-gray-300 rounded-lg px-4 py-2">
                  <option value="easy">Fácil</option>
                  <option value="medium">Media</option>
                  <option value="hard">Difícil</option>
                  <option value="very-hard">Muy Difícil</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 justify-end">
            <button 
              (click)="closeProblemPicker()"
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg">
              Cancelar
            </button>
            <button 
              (click)="confirmProblemLink()"
              [disabled]="!selectedProblemForLink || !problemLinkMetadata.title || !problemLinkMetadata.difficulty"
              class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed">
              Vincular problema
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SubtopicDetailComponent implements OnInit {
  tabs = [
    { id: 'personal', label: 'Notas Personales', icon: '🔒' },
    { id: 'theory', label: 'Teoría Compartida', icon: '📖' },
    { id: 'code', label: 'Código', icon: '💻' },
    { id: 'problems', label: 'Problemas', icon: '🎯' },
    { id: 'resources', label: 'Recursos', icon: '📚' }
  ];

  node: PersonalNode | null = null;
  nodeId: string = '';
  loading = false;
  error: string | null = null;
  activeTab: { [key: string]: string } = {};
  showAddSubtopicModal = false;
  
  newSubtopic: Subtopic = {
    name: '',
    description: '',
    personalNotes: '',
    sharedTheory: '',
    codeSnippets: [],
    linkedProblems: [],
    resources: []
  };

  // Problem picker modal state
  showProblemPickerModal = false;
  currentSubtopicForProblem: Subtopic | null = null;
  availableProblems: Problem[] = [];
  filteredProblems: Problem[] = [];
  selectedProblemForLink: Problem | null = null;
  loadingProblems = false;
  problemPickerError: string | null = null;
  problemSearchQuery = '';
  problemFilterDifficulty = '';
  problemFilterView: 'personal' | 'team' = 'personal';
  currentUser: User | null = null;
  
  problemLinkMetadata: {
    title: string;
    description: string;
    link: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  } = {
    title: '',
    description: '',
    link: '',
    difficulty: 'medium'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roadmapService: RoadmapService,
    private problemsService: ProblemsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.route.params.subscribe(params => {
      this.nodeId = params['id'];
      if (this.nodeId) {
        this.loadNode();
      }
    });
  }

  loadNode(): void {
    this.loading = true;
    this.error = null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    
    this.roadmapService.getPersonalRoadmap(user.id).subscribe({
      next: (response) => {
        this.node = response.data.roadmap.find(n => n._id === this.nodeId) || null;
        
        // Initialize active tabs
        if (this.node?.subtopics) {
          this.node.subtopics.forEach((subtopic, index) => {
            const key = subtopic._id || index;
            this.activeTab[key] = 'personal';
          });
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar el tema.';
        this.loading = false;
        console.error('Error loading node:', err);
      }
    });
  }

  createSubtopic(): void {
    if (!this.newSubtopic.name || !this.nodeId) return;

    this.roadmapService.addSubtopic(this.nodeId, this.newSubtopic).subscribe({
      next: () => {
        this.showAddSubtopicModal = false;
        this.newSubtopic = {
          name: '',
          description: '',
          personalNotes: '',
          sharedTheory: '',
          codeSnippets: [],
          linkedProblems: [],
          resources: []
        };
        this.loadNode();
      },
      error: (err) => {
        this.error = 'No se pudo crear el subtema.';
        console.error('Error creating subtopic:', err);
      }
    });
  }

  editSubtopic(subtopic: Subtopic): void {
    // Set the subtopic as the one being edited
    this.newSubtopic = {
      name: subtopic.name,
      description: subtopic.description || '',
      personalNotes: subtopic.personalNotes,
      sharedTheory: subtopic.sharedTheory,
      codeSnippets: subtopic.codeSnippets,
      linkedProblems: subtopic.linkedProblems,
      resources: subtopic.resources
    };
    this.showAddSubtopicModal = true;
  }

  saveSubtopic(subtopic: Subtopic): void {
    if (!subtopic._id || !this.nodeId) return;

    this.roadmapService.updateSubtopic(this.nodeId, subtopic._id, subtopic).subscribe({
      error: (err) => {
        this.error = 'No se pudo guardar los cambios.';
        console.error('Error saving subtopic:', err);
      }
    });
  }

  deleteSubtopic(subtopicId: string): void {
    if (!confirm('¿Estás seguro de eliminar este subtema?')) return;

    this.roadmapService.deleteSubtopic(this.nodeId, subtopicId).subscribe({
      next: () => {
        this.loadNode();
      },
      error: (err) => {
        this.error = 'No se pudo eliminar el subtema.';
        console.error('Error deleting subtopic:', err);
      }
    });
  }

  addCodeSnippet(subtopic: Subtopic): void {
    if (!subtopic.codeSnippets) {
      subtopic.codeSnippets = [];
    }
    subtopic.codeSnippets.push({
      language: 'python',
      code: '',
      description: ''
    });
    this.saveSubtopic(subtopic);
  }

  removeCodeSnippet(subtopic: Subtopic, index: number): void {
    if (subtopic.codeSnippets) {
      subtopic.codeSnippets.splice(index, 1);
      this.saveSubtopic(subtopic);
    }
  }

  addResource(subtopic: Subtopic): void {
    if (!subtopic.resources) {
      subtopic.resources = [];
    }
    subtopic.resources.push({
      name: '',
      link: ''
    });
    this.saveSubtopic(subtopic);
  }

  removeResource(subtopic: Subtopic, index: number): void {
    if (subtopic.resources) {
      subtopic.resources.splice(index, 1);
      this.saveSubtopic(subtopic);
    }
  }

  // Problem linking methods
  openProblemPicker(subtopic: Subtopic): void {
    this.currentSubtopicForProblem = subtopic;
    this.showProblemPickerModal = true;
    this.problemPickerError = null;
    this.selectedProblemForLink = null;
    this.problemSearchQuery = '';
    this.problemFilterDifficulty = '';
    this.resetProblemMetadata();
    this.loadAvailableProblems();
  }

  closeProblemPicker(): void {
    this.showProblemPickerModal = false;
    this.currentSubtopicForProblem = null;
    this.selectedProblemForLink = null;
    this.availableProblems = [];
    this.filteredProblems = [];
    this.resetProblemMetadata();
  }

  loadAvailableProblems(): void {
    if (!this.currentUser) return;

    this.loadingProblems = true;
    this.problemPickerError = null;

    const userId = this.currentUser.id;
    const observable = this.problemFilterView === 'personal'
      ? this.problemsService.getPersonalProblems(userId)
      : this.problemsService.getTeamProblems();

    observable.subscribe({
      next: (response) => {
        this.availableProblems = response.data.problems;
        this.filterProblems();
        this.loadingProblems = false;
      },
      error: (err) => {
        this.problemPickerError = 'Error al cargar problemas.';
        this.loadingProblems = false;
        console.error('Error loading problems:', err);
      }
    });
  }

  filterProblems(): void {
    let filtered = [...this.availableProblems];

    // Filter by search query
    if (this.problemSearchQuery.trim()) {
      const query = this.problemSearchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.platform.toLowerCase().includes(query)
      );
    }

    // Filter by difficulty (if we add difficulty to Problem model in the future)
    // For now, filter by rating ranges that correspond to difficulties
    if (this.problemFilterDifficulty) {
      const difficultyRanges: { [key: string]: [number, number] } = {
        'easy': [0, 1400],
        'medium': [1400, 1900],
        'hard': [1900, 2400],
        'very-hard': [2400, 5000]
      };
      
      const [min, max] = difficultyRanges[this.problemFilterDifficulty] || [0, 5000];
      filtered = filtered.filter(p => {
        if (!p.rating) return false;
        return p.rating >= min && p.rating < max;
      });
    }

    // Filter out already linked problems
    const linkedProblemIds = this.currentSubtopicForProblem?.linkedProblems?.map(lp => lp.problemId) || [];
    filtered = filtered.filter(p => !linkedProblemIds.includes(p._id));

    this.filteredProblems = filtered;
  }

  selectProblemForLinking(problem: Problem): void {
    this.selectedProblemForLink = problem;
    
    // Pre-fill metadata from problem
    this.problemLinkMetadata = {
      title: problem.title,
      description: '',
      link: problem.url || '',
      difficulty: this.getDifficultyFromRating(problem.rating)
    };
  }

  getDifficultyFromRating(rating?: number): 'easy' | 'medium' | 'hard' | 'very-hard' {
    if (!rating) return 'medium';
    if (rating < 1400) return 'easy';
    if (rating < 1900) return 'medium';
    if (rating < 2400) return 'hard';
    return 'very-hard';
  }

  resetProblemMetadata(): void {
    this.problemLinkMetadata = {
      title: '',
      description: '',
      link: '',
      difficulty: 'medium'
    };
  }

  confirmProblemLink(): void {
    if (!this.selectedProblemForLink || !this.currentSubtopicForProblem) return;
    if (!this.problemLinkMetadata.title || !this.problemLinkMetadata.difficulty) return;

    // Check for duplicates
    const alreadyLinked = this.currentSubtopicForProblem.linkedProblems?.some(
      lp => lp.problemId === this.selectedProblemForLink!._id
    );
    
    if (alreadyLinked) {
      this.problemPickerError = 'Este problema ya está vinculado a este subtema.';
      return;
    }

    // Create linked problem object
    const linkedProblem: LinkedProblem = {
      problemId: this.selectedProblemForLink._id,
      title: this.problemLinkMetadata.title,
      description: this.problemLinkMetadata.description,
      link: this.problemLinkMetadata.link,
      difficulty: this.problemLinkMetadata.difficulty
    };

    // Add to subtopic
    if (!this.currentSubtopicForProblem.linkedProblems) {
      this.currentSubtopicForProblem.linkedProblems = [];
    }
    this.currentSubtopicForProblem.linkedProblems.push(linkedProblem);

    // Save subtopic
    this.saveSubtopic(this.currentSubtopicForProblem);

    // Close modal
    this.closeProblemPicker();
  }

  removeProblemFromSubtopic(subtopic: Subtopic, problem: LinkedProblem): void {
    if (!confirm('¿Estás seguro de desvincular este problema?')) return;

    if (subtopic.linkedProblems) {
      const index = subtopic.linkedProblems.findIndex(lp => lp.problemId === problem.problemId);
      if (index > -1) {
        subtopic.linkedProblems.splice(index, 1);
        this.saveSubtopic(subtopic);
      }
    }
  }

  getDifficultyLabel(difficulty: string): string {
    const labels: { [key: string]: string } = {
      'easy': 'Fácil',
      'medium': 'Media',
      'hard': 'Difícil',
      'very-hard': 'Muy Difícil'
    };
    return labels[difficulty] || difficulty;
  }

  navigateToFilteredProblems(subtopic: Subtopic): void {
    // Navigate to problems library with subtopic filter
    const subtopicId = subtopic._id;
    if (subtopicId) {
      this.router.navigate(['/problems'], {
        queryParams: { subtopic: subtopicId }
      });
    }
  }
}
