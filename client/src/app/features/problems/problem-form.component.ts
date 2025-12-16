import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProblemService, Problem } from '../../core/services/problem.service';

@Component({
  selector: 'app-problem-form',
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation -->
      <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-blue-600">🏔️ Turistas CP</h1>
            </div>
            <div class="flex items-center space-x-4">
              <a routerLink="/dashboard" class="text-gray-700 hover:text-blue-600">Dashboard</a>
              <a routerLink="/themes" class="text-gray-700 hover:text-blue-600">Themes</a>
              <a routerLink="/roadmap" class="text-gray-700 hover:text-blue-600">Roadmap</a>
              <a routerLink="/team" class="text-gray-700 hover:text-blue-600">Team</a>
              <a routerLink="/problems" class="text-blue-600 font-semibold">Biblioteca</a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="mb-6">
            <a routerLink="/problems" class="text-blue-600 hover:text-blue-800">
              ← Volver a la lista
            </a>
          </div>

          <h2 class="text-3xl font-bold text-gray-800 mb-6">➕ Agregar Problema</h2>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ successMessage }}
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ errorMessage }}
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <form (ngSubmit)="onSubmit()" #problemForm="ngForm">
              <!-- URL Field (Optional) -->
              <div class="mb-4">
                <label for="url" class="block text-sm font-medium text-gray-700 mb-1">
                  URL del Problema <span class="text-gray-500 text-sm">(opcional)</span>
                </label>
                <div class="flex gap-2">
                  <input
                    type="url"
                    id="url"
                    name="url"
                    [(ngModel)]="problem.url"
                    (blur)="onUrlChange()"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://codeforces.com/contest/123/problem/A"
                  />
                  <button
                    type="button"
                    *ngIf="showCodeforcesFetch"
                    (click)="fetchCodeforcesData()"
                    [disabled]="fetchingCF"
                    class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {{ fetchingCF ? '⏳ Cargando...' : '🔄 Auto-rellenar CF' }}
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Ingresa la URL del problema para detectar automáticamente la plataforma
                </p>
              </div>

              <!-- Platform Detection Info -->
              <div *ngIf="detectedPlatform" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p class="text-sm text-blue-800">
                  ✅ Plataforma detectada: <strong>{{ detectedPlatform }}</strong>
                </p>
              </div>

              <!-- Manual Platform Selection -->
              <div class="mb-4">
                <label for="platform" class="block text-sm font-medium text-gray-700 mb-1">
                  Plataforma <span class="text-red-500">*</span>
                </label>
                <select
                  id="platform"
                  name="platform"
                  [(ngModel)]="problem.platform"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona una plataforma</option>
                  <option value="codeforces">Codeforces</option>
                  <option value="leetcode">LeetCode</option>
                  <option value="atcoder">AtCoder</option>
                  <option value="hackerrank">HackerRank</option>
                  <option value="cses">CSES</option>
                  <option value="uva">UVA</option>
                  <option value="spoj">SPOJ</option>
                  <option value="custom">Custom</option>
                  <option value="other">Otra</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                  La plataforma se detecta automáticamente desde la URL, pero puedes cambiarla manualmente
                </p>
              </div>

              <!-- Title Field -->
              <div class="mb-4">
                <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                  Título <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  [(ngModel)]="problem.title"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del problema"
                />
              </div>

              <!-- Description Field -->
              <div class="mb-4">
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span class="text-gray-500 text-sm">(opcional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  [(ngModel)]="problem.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción breve del problema"
                ></textarea>
              </div>

              <!-- Difficulty Field -->
              <div class="mb-4">
                <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-1">
                  Dificultad <span class="text-red-500">*</span>
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  [(ngModel)]="problem.difficulty"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Fácil</option>
                  <option value="medium">Media</option>
                  <option value="hard">Difícil</option>
                  <option value="very-hard">Muy Difícil</option>
                </select>
              </div>

              <!-- Rating Field -->
              <div class="mb-4">
                <label for="rating" class="block text-sm font-medium text-gray-700 mb-1">
                  Rating <span class="text-gray-500 text-sm">(opcional)</span>
                </label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  [(ngModel)]="problem.rating"
                  min="0"
                  max="5000"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="800, 1200, 1600, etc."
                />
              </div>

              <!-- Tags Field -->
              <div class="mb-4">
                <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">
                  Tags <span class="text-gray-500 text-sm">(separados por comas)</span>
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  [(ngModel)]="tagsInput"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="dp, graphs, greedy"
                />
                <div *ngIf="problem.tags && problem.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
                  <span
                    *ngFor="let tag of problem.tags"
                    class="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Platform ID -->
              <div class="mb-4">
                <label for="platformId" class="block text-sm font-medium text-gray-700 mb-1">
                  ID de Plataforma <span class="text-gray-500 text-sm">(opcional)</span>
                </label>
                <input
                  type="text"
                  id="platformId"
                  name="platformId"
                  [(ngModel)]="problem.platformId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123A, two-sum, etc."
                />
              </div>

              <!-- Submit Button -->
              <div class="flex gap-4">
                <button
                  type="submit"
                  [disabled]="!problemForm.form.valid || submitting"
                  class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {{ submitting ? '⏳ Guardando...' : '✅ Guardar Problema' }}
                </button>
                <button
                  type="button"
                  (click)="cancel()"
                  class="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProblemFormComponent implements OnInit {
  problem: Problem = {
    title: '',
    platform: 'other',
    difficulty: 'medium',
    tags: []
  };

  tagsInput = '';
  detectedPlatform = '';
  showCodeforcesFetch = false;
  fetchingCF = false;
  submitting = false;
  successMessage = '';
  errorMessage = '';
  cfContestId = '';
  cfIndex = '';

  constructor(
    private problemService: ProblemService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialize
  }

  onUrlChange(): void {
    if (!this.problem.url) {
      this.detectedPlatform = '';
      this.showCodeforcesFetch = false;
      return;
    }

    const detection = this.problemService.detectPlatformFromUrl(this.problem.url);
    
    if (detection) {
      this.problem.platform = detection.platform;
      this.detectedPlatform = detection.platform;

      // Check if it's Codeforces and we have contest/problem info
      if (detection.platform === 'codeforces' && detection.contestId && detection.index) {
        this.showCodeforcesFetch = true;
        this.cfContestId = detection.contestId;
        this.cfIndex = detection.index;
      } else {
        this.showCodeforcesFetch = false;
      }
    }
  }

  fetchCodeforcesData(): void {
    if (!this.cfContestId || !this.cfIndex) {
      this.errorMessage = 'No se pudo extraer el Contest ID y el índice del problema de la URL';
      return;
    }

    this.fetchingCF = true;
    this.errorMessage = '';

    this.problemService.getCodeforcesProblemDetails(this.cfContestId, this.cfIndex).subscribe({
      next: (response) => {
        const cfProblem = response.data.problem;
        
        // Auto-fill the form
        this.problem.title = cfProblem.title;
        this.problem.tags = cfProblem.tags || [];
        this.tagsInput = (cfProblem.tags || []).join(', ');
        this.problem.rating = cfProblem.rating;
        this.problem.platformId = `${cfProblem.contestId}${cfProblem.index}`;
        
        // Map rating to difficulty
        if (cfProblem.rating) {
          if (cfProblem.rating < 1200) {
            this.problem.difficulty = 'easy';
          } else if (cfProblem.rating < 1800) {
            this.problem.difficulty = 'medium';
          } else if (cfProblem.rating < 2400) {
            this.problem.difficulty = 'hard';
          } else {
            this.problem.difficulty = 'very-hard';
          }
        }

        this.fetchingCF = false;
        this.successMessage = '✅ Datos cargados desde Codeforces API';
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.fetchingCF = false;
        this.errorMessage = 'Error al obtener datos de Codeforces. Verifica que el problema exista.';
        console.error('Error fetching CF data:', err);
      }
    });
  }

  onSubmit(): void {
    // Validate required fields
    if (!this.problem.title || !this.problem.platform) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      return;
    }

    // Parse tags from input
    if (this.tagsInput) {
      this.problem.tags = this.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }

    // Clear empty/undefined fields
    if (!this.problem.url) delete this.problem.url;
    if (!this.problem.description) delete this.problem.description;
    if (!this.problem.platformId) delete this.problem.platformId;
    if (!this.problem.rating) delete this.problem.rating;

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.problemService.createProblem(this.problem).subscribe({
      next: (response) => {
        this.submitting = false;
        this.successMessage = '✅ Problema creado exitosamente';
        
        // Redirect to problems list after 1 second
        setTimeout(() => {
          this.router.navigate(['/problems']);
        }, 1000);
      },
      error: (err) => {
        this.submitting = false;
        
        // Parse error message
        if (err.error?.message) {
          this.errorMessage = `Error: ${err.error.message}`;
        } else if (err.status === 11000 || err.error?.code === 11000) {
          this.errorMessage = 'Este problema ya existe en la base de datos (duplicado de plataforma + ID)';
        } else {
          this.errorMessage = 'Error al crear el problema. Por favor intenta de nuevo.';
        }
        
        console.error('Error creating problem:', err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/problems']);
  }
}
