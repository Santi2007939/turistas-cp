import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProblemsService, Problem, PopulatedUser } from '../../core/services/problems.service';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-problems-library',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Biblioteca de Problemas</h1>
        <button 
          (click)="openAddProblemModal()"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Agregar Problema
        </button>
      </div>

      <!-- Selector for problem view -->
      <div class="mb-6 flex gap-4 items-center">
        <label class="font-semibold text-gray-700">Ver:</label>
        <select 
          [(ngModel)]="selectedView"
          (change)="onViewChange()"
          class="border rounded px-4 py-2 bg-white">
          <option value="personal">Mi cuenta</option>
          <option value="team">Equipo</option>
          <option value="members">Miembros</option>
        </select>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-600">Cargando problemas...</p>
      </div>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <!-- Problems Grid - New Design -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let problem of problems" 
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4"
          [ngClass]="{
            'border-gray-400': problem.status === 'pending',
            'border-green-500': problem.status === 'ac',
            'border-red-500': problem.status === 'wa'
          }">
          
          <!-- Problem Header -->
          <div class="mb-4">
            <div class="flex justify-between items-start mb-2">
              <h2 class="text-lg font-bold text-gray-800 flex-1">{{ problem.title }}</h2>
            </div>
            
            <!-- Rating and Status Row -->
            <div class="flex gap-2 items-center mb-3">
              <span 
                *ngIf="problem.rating"
                class="px-3 py-1 text-sm font-semibold rounded"
                [ngClass]="{
                  'bg-gray-200 text-gray-800': problem.rating < 1200,
                  'bg-green-200 text-green-800': problem.rating >= 1200 && problem.rating < 1400,
                  'bg-cyan-200 text-cyan-800': problem.rating >= 1400 && problem.rating < 1600,
                  'bg-blue-200 text-blue-800': problem.rating >= 1600 && problem.rating < 1900,
                  'bg-purple-200 text-purple-800': problem.rating >= 1900 && problem.rating < 2100,
                  'bg-orange-200 text-orange-800': problem.rating >= 2100 && problem.rating < 2400,
                  'bg-red-200 text-red-800': problem.rating >= 2400
                }">
                ★ {{ problem.rating }}
              </span>
              
              <select
                *ngIf="canEdit(problem)"
                [(ngModel)]="problem.status"
                (change)="updateProblemStatus(problem)"
                class="px-3 py-1 text-sm rounded border"
                [ngClass]="{
                  'bg-gray-100 text-gray-800 border-gray-300': problem.status === 'pending',
                  'bg-green-100 text-green-800 border-green-300': problem.status === 'ac',
                  'bg-red-100 text-red-800 border-red-300': problem.status === 'wa'
                }">
                <option value="pending">Pendiente</option>
                <option value="ac">AC</option>
                <option value="wa">WA</option>
              </select>
              
              <span
                *ngIf="!canEdit(problem)"
                class="px-3 py-1 text-sm rounded"
                [ngClass]="{
                  'bg-gray-100 text-gray-800': problem.status === 'pending',
                  'bg-green-100 text-green-800': problem.status === 'ac',
                  'bg-red-100 text-red-800': problem.status === 'wa'
                }">
                {{ problem.status === 'pending' ? 'Pendiente' : problem.status === 'ac' ? 'AC' : 'WA' }}
              </span>
            </div>

            <!-- Platform Badge -->
            <div class="mb-3">
              <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {{ problem.platform }}
              </span>
              <span 
                *ngIf="problem.owner === 'personal'"
                class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded ml-2">
                Personal
              </span>
              <span 
                *ngIf="problem.owner === 'team'"
                class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded ml-2">
                Equipo
              </span>
            </div>

            <!-- Notes Section -->
            <div *ngIf="problem.notes || canEdit(problem)" class="mb-3">
              <label class="text-xs font-semibold text-gray-600 block mb-1">Notas:</label>
              <textarea 
                *ngIf="canEdit(problem)"
                [(ngModel)]="problem.notes"
                (blur)="updateProblemNotes(problem)"
                rows="2"
                class="w-full text-sm border rounded px-2 py-1 text-gray-700"
                placeholder="Notas técnicas o estratégicas..."></textarea>
              <p *ngIf="!canEdit(problem) && problem.notes" class="text-sm text-gray-600">
                {{ problem.notes }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-4">
            <a 
              *ngIf="problem.url"
              [href]="problem.url" 
              target="_blank"
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm text-center">
              Ver Problema
            </a>
            <button 
              *ngIf="canEdit(problem)"
              (click)="openEditProblemModal(problem)"
              class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm">
              ✎
            </button>
          </div>

          <div *ngIf="problem.createdBy" class="mt-3 text-xs text-gray-500">
            Creado por: {{ getCreatorName(problem) }}
          </div>
        </div>
      </div>

      <div *ngIf="!loading && problems.length === 0" class="text-center py-12">
        <p class="text-gray-600 text-lg mb-4">No hay problemas en esta vista.</p>
        <button 
          *ngIf="selectedView === 'personal'"
          (click)="openAddProblemModal()"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Agregar Primer Problema
        </button>
      </div>

      <!-- Add/Edit Problem Modal -->
      <div 
        *ngIf="showAddProblemModal" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-bold mb-4">
            {{ editingProblem ? 'Editar Problema' : 'Agregar Problema' }}
          </h3>
          
          <div class="space-y-4">
            <!-- Codeforces URL Fetcher (only for Codeforces and when adding) -->
            <div *ngIf="!editingProblem && newProblem.platform === 'codeforces'" 
                 class="bg-blue-50 border border-blue-200 rounded p-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Obtener datos de Codeforces (Opcional)
              </label>
              <div class="flex gap-2">
                <input 
                  type="url"
                  [(ngModel)]="newProblem.url"
                  class="flex-1 border rounded px-3 py-2"
                  placeholder="https://codeforces.com/problemset/problem/1234/A">
                <button 
                  (click)="fetchCodeforcesData()"
                  [disabled]="!newProblem.url || fetchingCodeforces"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300">
                  {{ fetchingCodeforces ? 'Cargando...' : 'Obtener' }}
                </button>
              </div>
              <p class="text-xs text-gray-600 mt-1">
                Si no usas esta opción, puedes llenar los campos manualmente.
              </p>
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Título *</label>
              <input 
                type="text"
                [(ngModel)]="newProblem.title"
                class="w-full border rounded px-3 py-2"
                placeholder="Nombre del problema">
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Plataforma</label>
              <select 
                [(ngModel)]="newProblem.platform"
                class="w-full border rounded px-3 py-2"
                [disabled]="!!editingProblem">
                <option value="codeforces">Codeforces</option>
                <option value="atcoder">AtCoder</option>
                <option value="leetcode">LeetCode</option>
                <option value="hackerrank">HackerRank</option>
                <option value="cses">CSES</option>
                <option value="uva">UVa</option>
                <option value="spoj">SPOJ</option>
                <option value="custom">Custom</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div *ngIf="editingProblem || newProblem.platform !== 'codeforces'">
              <label class="block text-gray-700 text-sm font-bold mb-2">URL</label>
              <input 
                type="url"
                [(ngModel)]="newProblem.url"
                class="w-full border rounded px-3 py-2"
                placeholder="https://...">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Rating</label>
                <input 
                  type="number"
                  [(ngModel)]="newProblem.rating"
                  class="w-full border rounded px-3 py-2"
                  placeholder="800, 1200, 1600...">
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Estado</label>
                <select 
                  [(ngModel)]="newProblem.status"
                  class="w-full border rounded px-3 py-2">
                  <option value="pending">Pendiente</option>
                  <option value="ac">AC</option>
                  <option value="wa">WA</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Notas Técnicas/Estratégicas</label>
              <textarea 
                [(ngModel)]="newProblem.notes"
                rows="3"
                class="w-full border rounded px-3 py-2"
                placeholder="Notas sobre el problema, estrategias, técnicas usadas..."></textarea>
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Owner</label>
              <select 
                [(ngModel)]="newProblem.owner"
                class="w-full border rounded px-3 py-2">
                <option value="personal">Personal</option>
                <option value="team">Equipo</option>
              </select>
            </div>

            <!-- Optional fields collapsed -->
            <details class="border rounded p-3">
              <summary class="cursor-pointer font-semibold text-gray-700">Campos Opcionales</summary>
              <div class="mt-3 space-y-3">
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
                  <textarea 
                    [(ngModel)]="newProblem.description"
                    rows="3"
                    class="w-full border rounded px-3 py-2"
                    placeholder="Descripción del problema"></textarea>
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">Dificultad</label>
                  <select 
                    [(ngModel)]="newProblem.difficulty"
                    class="w-full border rounded px-3 py-2">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="very-hard">Very Hard</option>
                  </select>
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">Tags (separados por coma)</label>
                  <input 
                    type="text"
                    [(ngModel)]="newProblem.tagsInput"
                    class="w-full border rounded px-3 py-2"
                    placeholder="dp, graphs, binary-search">
                </div>
              </div>
            </details>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="cancelAddProblem()"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Cancelar
            </button>
            <button 
              (click)="saveProblem()"
              [disabled]="!newProblem.title"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300">
              {{ editingProblem ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProblemsLibraryComponent implements OnInit {
  problems: Problem[] = [];
  selectedView: 'personal' | 'team' | 'members' = 'personal';
  loading = false;
  error: string | null = null;
  currentUser: User | null = null;
  showAddProblemModal = false;
  
  newProblem: {
    title: string;
    description: string;
    platform: string;
    url: string;
    difficulty: string;
    owner: string;
    tagsInput: string;
    rating: number | null;
    status: string;
    notes: string;
  } = {
    title: '',
    description: '',
    platform: 'codeforces',
    url: '',
    difficulty: 'medium',
    owner: 'personal',
    tagsInput: '',
    rating: null,
    status: 'pending',
    notes: ''
  };
  
  fetchingCodeforces = false;
  editingProblem: Problem | null = null;

  constructor(
    private problemsService: ProblemsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadProblems();
      }
    });
  }

  onViewChange(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    if (!this.currentUser) return;

    this.loading = true;
    this.error = null;
    
    let observable;
    
    switch (this.selectedView) {
      case 'personal':
        observable = this.problemsService.getPersonalProblems(this.currentUser.id);
        break;
      case 'team':
        observable = this.problemsService.getTeamProblems();
        break;
      case 'members':
        observable = this.problemsService.getMembersProblems(this.currentUser.id);
        break;
    }

    observable.subscribe({
      next: (response) => {
        this.problems = response.data.problems;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar problemas. Inténtelo de nuevo.';
        this.loading = false;
        console.error('Error loading problems:', err);
      }
    });
  }

  canEdit(problem: Problem): boolean {
    if (!this.currentUser) return false;
    
    // Can edit personal problems created by user or team problems
    if (problem.owner === 'personal') {
      // Check if createdBy is an object with _id or a string
      const createdById = typeof problem.createdBy === 'object' && problem.createdBy !== null
        ? (problem.createdBy as PopulatedUser)._id
        : problem.createdBy;
      return createdById === this.currentUser.id;
    }
    
    // Anyone can edit team problems
    return problem.owner === 'team';
  }

  getCreatorName(problem: Problem): string {
    if (typeof problem.createdBy === 'object' && problem.createdBy !== null) {
      return (problem.createdBy as PopulatedUser).username || 'Usuario';
    }
    return 'Usuario';
  }

  openAddProblemModal(): void {
    this.editingProblem = null;
    this.showAddProblemModal = true;
    this.resetNewProblem();
  }

  openEditProblemModal(problem: Problem): void {
    this.editingProblem = problem;
    this.newProblem = {
      title: problem.title,
      description: problem.description || '',
      platform: problem.platform,
      url: problem.url || '',
      difficulty: problem.difficulty,
      owner: problem.owner,
      tagsInput: problem.tags.join(', '),
      rating: problem.rating || null,
      status: problem.status,
      notes: problem.notes || ''
    };
    this.showAddProblemModal = true;
  }

  fetchCodeforcesData(): void {
    if (!this.newProblem.url) return;

    this.fetchingCodeforces = true;
    this.error = null;

    this.problemsService.fetchCodeforcesData(this.newProblem.url).subscribe({
      next: (response) => {
        const problemData = response.data.problem;
        this.newProblem.title = problemData.title;
        this.newProblem.platform = problemData.platform;
        this.newProblem.url = problemData.url;
        this.newProblem.rating = problemData.rating;
        this.newProblem.tagsInput = problemData.tags.join(', ');
        this.fetchingCodeforces = false;
      },
      error: (err) => {
        this.error = 'Error al obtener datos de Codeforces. Verifica la URL.';
        this.fetchingCodeforces = false;
        console.error('Error fetching Codeforces data:', err);
      }
    });
  }

  saveProblem(): void {
    if (!this.newProblem.title) return;

    const problemData: any = {
      title: this.newProblem.title,
      description: this.newProblem.description,
      platform: this.newProblem.platform,
      url: this.newProblem.url,
      difficulty: this.newProblem.difficulty,
      owner: this.newProblem.owner,
      rating: this.newProblem.rating,
      status: this.newProblem.status,
      notes: this.newProblem.notes,
      tags: this.newProblem.tagsInput 
        ? this.newProblem.tagsInput.split(',').map(t => t.trim()).filter(t => t)
        : []
    };

    if (this.editingProblem) {
      // Update existing problem
      this.problemsService.updateProblem(this.editingProblem._id, problemData).subscribe({
        next: () => {
          this.showAddProblemModal = false;
          this.resetNewProblem();
          this.editingProblem = null;
          this.loadProblems();
        },
        error: (err) => {
          this.error = 'Error al actualizar problema.';
          console.error('Error updating problem:', err);
        }
      });
    } else {
      // Create new problem
      this.problemsService.createProblem(problemData).subscribe({
        next: () => {
          this.showAddProblemModal = false;
          this.resetNewProblem();
          this.loadProblems();
        },
        error: (err) => {
          this.error = 'Error al crear problema.';
          console.error('Error creating problem:', err);
        }
      });
    }
  }

  updateProblemStatus(problem: Problem): void {
    if (!this.canEdit(problem)) return;

    this.problemsService.updateProblem(problem._id, { status: problem.status }).subscribe({
      next: () => {
        // Status updated successfully
      },
      error: (err) => {
        this.error = 'Error al actualizar estado.';
        console.error('Error updating status:', err);
        this.loadProblems(); // Reload to revert changes
      }
    });
  }

  updateProblemNotes(problem: Problem): void {
    if (!this.canEdit(problem)) return;

    this.problemsService.updateProblem(problem._id, { notes: problem.notes }).subscribe({
      next: () => {
        // Notes updated successfully
      },
      error: (err) => {
        this.error = 'Error al actualizar notas.';
        console.error('Error updating notes:', err);
        this.loadProblems(); // Reload to revert changes
      }
    });
  }

  cancelAddProblem(): void {
    this.showAddProblemModal = false;
    this.resetNewProblem();
    this.editingProblem = null;
  }

  resetNewProblem(): void {
    this.newProblem = {
      title: '',
      description: '',
      platform: 'codeforces',
      url: '',
      difficulty: 'medium',
      owner: 'personal',
      tagsInput: '',
      rating: null,
      status: 'pending',
      notes: ''
    };
  }
}
