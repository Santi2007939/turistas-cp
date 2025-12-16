import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProblemService, Problem } from '../../core/services/problem.service';

@Component({
  selector: 'app-problems-list',
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
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-3xl font-bold text-gray-800">📚 Biblioteca de Problemas</h2>
            <a
              routerLink="/problems/new"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              ➕ Agregar Problema
            </a>
          </div>

          <!-- Filters -->
          <div class="bg-white rounded-lg shadow p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Plataforma</label>
                <select
                  [(ngModel)]="filterPlatform"
                  (change)="loadProblems()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
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
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                <select
                  [(ngModel)]="filterDifficulty"
                  (change)="loadProblems()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="easy">Fácil</option>
                  <option value="medium">Media</option>
                  <option value="hard">Difícil</option>
                  <option value="very-hard">Muy Difícil</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ error }}
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p class="mt-4 text-gray-600">Cargando problemas...</p>
          </div>

          <!-- Problems List -->
          <div *ngIf="!loading && problems.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plataforma</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dificultad</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let problem of problems" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <a
                      *ngIf="problem.url"
                      [href]="problem.url"
                      target="_blank"
                      class="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {{ problem.title }}
                    </a>
                    <span *ngIf="!problem.url" class="font-medium">{{ problem.title }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {{ problem.platform }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800': problem.difficulty === 'easy',
                        'bg-yellow-100 text-yellow-800': problem.difficulty === 'medium',
                        'bg-orange-100 text-orange-800': problem.difficulty === 'hard',
                        'bg-red-100 text-red-800': problem.difficulty === 'very-hard'
                      }"
                    >
                      {{ getDifficultyLabel(problem.difficulty) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ problem.rating || '-' }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                      <span
                        *ngFor="let tag of problem.tags?.slice(0, 3)"
                        class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {{ tag }}
                      </span>
                      <span
                        *ngIf="problem.tags && problem.tags.length > 3"
                        class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        +{{ problem.tags.length - 3 }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      (click)="deleteProblem(problem._id!)"
                      class="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && problems.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
            <p class="text-gray-500 text-lg">No hay problemas registrados.</p>
            <a
              routerLink="/problems/new"
              class="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md"
            >
              Agregar el primer problema
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProblemsListComponent implements OnInit {
  problems: Problem[] = [];
  loading = false;
  error = '';
  filterPlatform = '';
  filterDifficulty = '';

  constructor(private problemService: ProblemService) { }

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.loading = true;
    this.error = '';

    const filters: any = {};
    if (this.filterPlatform) filters.platform = this.filterPlatform;
    if (this.filterDifficulty) filters.difficulty = this.filterDifficulty;

    this.problemService.getProblems(filters).subscribe({
      next: (response) => {
        this.problems = response.data.problems;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los problemas';
        this.loading = false;
        console.error('Error loading problems:', err);
      }
    });
  }

  deleteProblem(id: string): void {
    if (!confirm('¿Estás seguro de eliminar este problema?')) {
      return;
    }

    this.problemService.deleteProblem(id).subscribe({
      next: () => {
        this.loadProblems();
      },
      error: (err) => {
        this.error = 'Error al eliminar el problema';
        console.error('Error deleting problem:', err);
      }
    });
  }

  getDifficultyLabel(difficulty: string): string {
    const labels: any = {
      'easy': 'Fácil',
      'medium': 'Media',
      'hard': 'Difícil',
      'very-hard': 'Muy Difícil'
    };
    return labels[difficulty] || difficulty;
  }
}
