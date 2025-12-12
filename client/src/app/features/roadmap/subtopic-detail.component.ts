import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoadmapService, PersonalNode, Subtopic, CodeSnippet, Resource } from '../../core/services/roadmap.service';

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
                <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                  <p class="text-sm text-green-800">
                    💻 Problemas vinculados a este subtema
                  </p>
                </div>
                <div class="space-y-2">
                  <div *ngFor="let problemId of subtopic.linkedProblems" 
                       class="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span class="text-sm text-gray-700">Problem ID: {{ problemId }}</span>
                    <button 
                      (click)="removeProblem(subtopic, problemId)"
                      class="text-red-600 hover:text-red-800 text-sm">
                      🗑️
                    </button>
                  </div>
                  <button 
                    (click)="showAddProblemModal(subtopic)"
                    class="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors">
                    ➕ Vincular problema
                  </button>
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roadmapService: RoadmapService
  ) {}

  ngOnInit(): void {
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

  showAddProblemModal(subtopic: Subtopic): void {
    // Simple prompt for now - can be enhanced with a full modal later
    const problemId = prompt('Ingresa el ID del problema a vincular:');
    if (problemId && problemId.trim()) {
      if (!subtopic.linkedProblems) {
        subtopic.linkedProblems = [];
      }
      subtopic.linkedProblems.push(problemId.trim());
      this.saveSubtopic(subtopic);
    }
  }

  removeProblem(subtopic: Subtopic, problemId: any): void {
    if (subtopic.linkedProblems) {
      const index = subtopic.linkedProblems.indexOf(problemId);
      if (index > -1) {
        subtopic.linkedProblems.splice(index, 1);
        this.saveSubtopic(subtopic);
      }
    }
  }
}
