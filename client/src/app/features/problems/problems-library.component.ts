import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProblemsService, Problem } from '../../core/services/problems.service';
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
          (click)="showAddProblemModal = true"
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

      <!-- Problems Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let problem of problems" 
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="mb-4">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ problem.title }}</h2>
            <p class="text-gray-600 text-sm line-clamp-2">{{ problem.description || 'Sin descripción' }}</p>
          </div>

          <div class="flex gap-2 mb-3 flex-wrap">
            <span 
              class="px-3 py-1 text-sm rounded-full"
              [ngClass]="{
                'bg-green-100 text-green-800': problem.difficulty === 'easy',
                'bg-yellow-100 text-yellow-800': problem.difficulty === 'medium',
                'bg-orange-100 text-orange-800': problem.difficulty === 'hard',
                'bg-red-100 text-red-800': problem.difficulty === 'very-hard'
              }">
              {{ problem.difficulty }}
            </span>
            <span class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {{ problem.platform }}
            </span>
            <span 
              *ngIf="problem.owner === 'personal'"
              class="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
              Personal
            </span>
            <span 
              *ngIf="problem.owner === 'team'"
              class="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">
              Equipo
            </span>
          </div>

          <div *ngIf="problem.tags && problem.tags.length > 0" class="mb-3">
            <div class="flex flex-wrap gap-1">
              <span 
                *ngFor="let tag of problem.tags.slice(0, 3)" 
                class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                #{{ tag }}
              </span>
              <span 
                *ngIf="problem.tags.length > 3"
                class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                +{{ problem.tags.length - 3 }}
              </span>
            </div>
          </div>

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
              (click)="editProblem(problem)"
              class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm">
              Editar
            </button>
          </div>

          <div *ngIf="problem.createdBy" class="mt-3 text-xs text-gray-500">
            Creado por: {{ problem.createdBy.username || 'Usuario' }}
          </div>
        </div>
      </div>

      <div *ngIf="!loading && problems.length === 0" class="text-center py-12">
        <p class="text-gray-600 text-lg mb-4">No hay problemas en esta vista.</p>
        <button 
          *ngIf="selectedView === 'personal'"
          (click)="showAddProblemModal = true"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Agregar Primer Problema
        </button>
      </div>

      <!-- Add Problem Modal -->
      <div 
        *ngIf="showAddProblemModal" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-bold mb-4">Agregar Problema</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Título *</label>
              <input 
                type="text"
                [(ngModel)]="newProblem.title"
                class="w-full border rounded px-3 py-2"
                placeholder="Nombre del problema">
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
              <textarea 
                [(ngModel)]="newProblem.description"
                rows="3"
                class="w-full border rounded px-3 py-2"
                placeholder="Descripción del problema"></textarea>
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Plataforma</label>
              <select 
                [(ngModel)]="newProblem.platform"
                class="w-full border rounded px-3 py-2">
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

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">URL</label>
              <input 
                type="url"
                [(ngModel)]="newProblem.url"
                class="w-full border rounded px-3 py-2"
                placeholder="https://...">
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
              <label class="block text-gray-700 text-sm font-bold mb-2">Owner</label>
              <select 
                [(ngModel)]="newProblem.owner"
                class="w-full border rounded px-3 py-2">
                <option value="personal">Personal</option>
                <option value="team">Equipo</option>
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
              Guardar
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
  } = {
    title: '',
    description: '',
    platform: 'codeforces',
    url: '',
    difficulty: 'medium',
    owner: 'personal',
    tagsInput: ''
  };

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
        ? (problem.createdBy as any)._id
        : problem.createdBy;
      return createdById === this.currentUser.id;
    }
    
    // Anyone can edit team problems
    return problem.owner === 'team';
  }

  editProblem(problem: Problem): void {
    // TODO: Implement edit functionality
    console.log('Edit problem:', problem);
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
      tags: this.newProblem.tagsInput 
        ? this.newProblem.tagsInput.split(',').map(t => t.trim()).filter(t => t)
        : []
    };

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

  cancelAddProblem(): void {
    this.showAddProblemModal = false;
    this.resetNewProblem();
  }

  resetNewProblem(): void {
    this.newProblem = {
      title: '',
      description: '',
      platform: 'codeforces',
      url: '',
      difficulty: 'medium',
      owner: 'personal',
      tagsInput: ''
    };
  }
}
