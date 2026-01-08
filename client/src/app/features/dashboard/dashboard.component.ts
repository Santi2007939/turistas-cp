import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { RoadmapService, PersonalNode } from '../../core/services/roadmap.service';
import { IntegrationsService, CodeforcesUserInfo } from '../../core/services/integrations.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterModule, NavbarComponent],
    template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Welcome, {{ currentUser?.username }}!</h2>
          
          <!-- Roadmap Statistics -->
          <div *ngIf="roadmapStats" class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <h3 class="text-xl font-bold mb-4">📊 Tu Progreso en el Roadmap</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-3xl font-bold">{{ roadmapStats.total }}</div>
                <div class="text-sm opacity-90">Temas Totales</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold">{{ roadmapStats.inProgress }}</div>
                <div class="text-sm opacity-90">En Progreso</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold">{{ roadmapStats.completed }}</div>
                <div class="text-sm opacity-90">Completados</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold">{{ roadmapStats.averageProgress }}%</div>
                <div class="text-sm opacity-90">Progreso Promedio</div>
              </div>
            </div>
            <div class="mt-4">
              <div class="bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
                <div class="bg-white h-2 rounded-full transition-all duration-500" [style.width.%]="roadmapStats.averageProgress"></div>
              </div>
            </div>
          </div>

          <!-- Codeforces Stats Section -->
          <div *ngIf="currentUser?.codeforcesHandle" class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">📊 Estadísticas de Codeforces</h3>
            
            <div *ngIf="loadingCodeforcesStats" class="text-center py-4">
              <p class="text-gray-500">Cargando estadísticas de Codeforces...</p>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Rating -->
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">⭐</span>
                  <h4 class="font-semibold text-gray-800">Rating</h4>
                </div>
                <p class="text-2xl font-bold" [ngClass]="getRatingColorClass(codeforcesStats.rating)">
                  {{ codeforcesStats.rating || 'Sin rating' }}
                </p>
                <p class="text-sm text-gray-600">{{ codeforcesStats.rank || 'Unranked' }}</p>
              </div>

              <!-- Max Rating -->
              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">🏆</span>
                  <h4 class="font-semibold text-gray-800">Max Rating</h4>
                </div>
                <p class="text-2xl font-bold" [ngClass]="getRatingColorClass(codeforcesStats.maxRating)">
                  {{ codeforcesStats.maxRating || 'N/A' }}
                </p>
                <p class="text-sm text-gray-600">{{ codeforcesStats.maxRank || '' }}</p>
              </div>

              <!-- Contribution -->
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">🤝</span>
                  <h4 class="font-semibold text-gray-800">Contribución</h4>
                </div>
                <p class="text-2xl font-bold text-purple-600">{{ codeforcesStats.contribution || 0 }}</p>
                <p class="text-sm text-gray-600">Puntos</p>
              </div>

              <!-- Friend Count -->
              <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">👥</span>
                  <h4 class="font-semibold text-gray-800">Amigos</h4>
                </div>
                <p class="text-2xl font-bold text-orange-600">{{ codeforcesStats.friendOfCount || 0 }}</p>
                <p class="text-sm text-gray-600">Personas te siguen</p>
              </div>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesError" class="text-center py-4">
              <p class="text-red-500">{{ codeforcesError }}</p>
              <button 
                (click)="loadCodeforcesStats()"
                class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                Reintentar
              </button>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="mt-4 text-center">
              <a 
                [href]="'https://codeforces.com/profile/' + currentUser?.codeforcesHandle"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-800 text-sm">
                Ver perfil completo en Codeforces →
              </a>
            </div>
          </div>

          <div *ngIf="!currentUser?.codeforcesHandle" class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">📊 Estadísticas de Codeforces</h3>
            <p class="text-gray-500 text-center py-4">
              Vincula tu handle de Codeforces en tu perfil para ver tus estadísticas aquí.
            </p>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Feature cards -->
            <a routerLink="/themes" class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 class="text-lg font-semibold">📚 Learning Themes</h3>
              <p class="mt-2 text-gray-600">Browse and explore learning topics</p>
            </a>
            <a routerLink="/roadmap" class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 class="text-lg font-semibold">🗺️ My Roadmap</h3>
              <p class="mt-2 text-gray-600">Track your learning journey</p>
              <div class="mt-3 flex gap-2">
                <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">📋 Kanban</span>
                <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">📊 Gráfica</span>
              </div>
            </a>
            <a routerLink="/problems" class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 class="text-lg font-semibold">💻 Problems</h3>
              <p class="mt-2 text-gray-600">Practice and exercises</p>
            </a>
            <a routerLink="/team" class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 class="text-lg font-semibold">👥 Team Turistas</h3>
              <p class="mt-2 text-gray-600">Collaborative workspace</p>
            </a>
            <a routerLink="/calendar" class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 class="text-lg font-semibold">📅 Calendar</h3>
              <p class="mt-2 text-gray-600">Contests and events</p>
            </a>
            <a 
              routerLink="/statistics"
              class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 class="text-lg font-semibold">📊 Statistics</h3>
              <p class="mt-2 text-gray-600">View your progress and achievements</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  roadmapStats: {
    total: number;
    inProgress: number;
    completed: number;
    averageProgress: number;
  } | null = null;

  // Codeforces stats
  codeforcesStats: CodeforcesUserInfo | null = null;
  loadingCodeforcesStats = false;
  codeforcesError: string | null = null;

  constructor(
    private authService: AuthService,
    private roadmapService: RoadmapService,
    private integrationsService: IntegrationsService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadRoadmapStats();
        if (user.codeforcesHandle) {
          this.loadCodeforcesStats();
        }
      }
    });
  }

  loadRoadmapStats(): void {
    this.roadmapService.getRoadmap().subscribe({
      next: (response) => {
        const nodes = response.data.roadmap;
        const total = nodes.length;
        const inProgress = nodes.filter(n => n.status === 'in-progress').length;
        const completed = nodes.filter(n => n.status === 'completed' || n.status === 'mastered' || n.status === 'done').length;
        const averageProgress = total > 0 
          ? Math.round(nodes.reduce((sum, n) => sum + n.progress, 0) / total) 
          : 0;

        this.roadmapStats = {
          total,
          inProgress,
          completed,
          averageProgress
        };
      },
      error: (err) => {
        console.error('Error loading roadmap stats:', err);
      }
    });
  }

  loadCodeforcesStats(): void {
    if (!this.currentUser?.codeforcesHandle) return;

    this.loadingCodeforcesStats = true;
    this.codeforcesError = null;

    this.integrationsService.getCodeforcesUser(this.currentUser.codeforcesHandle).subscribe({
      next: (response) => {
        this.codeforcesStats = response.data.userInfo;
        this.loadingCodeforcesStats = false;
      },
      error: (err) => {
        console.error('Error loading Codeforces stats:', err);
        this.codeforcesError = 'No se pudo cargar las estadísticas de Codeforces. Verifica que el handle sea correcto.';
        this.loadingCodeforcesStats = false;
      }
    });
  }

  getRatingColorClass(rating: number | undefined): string {
    if (!rating) return 'text-gray-600';
    if (rating >= 3000) return 'text-red-600'; // Legendary Grandmaster
    if (rating >= 2600) return 'text-red-500'; // International Grandmaster
    if (rating >= 2400) return 'text-red-400'; // Grandmaster
    if (rating >= 2300) return 'text-orange-500'; // International Master
    if (rating >= 2100) return 'text-orange-400'; // Master
    if (rating >= 1900) return 'text-purple-500'; // Candidate Master
    if (rating >= 1600) return 'text-blue-500'; // Expert
    if (rating >= 1400) return 'text-cyan-500'; // Specialist
    if (rating >= 1200) return 'text-green-500'; // Pupil
    return 'text-gray-500'; // Newbie
  }
}
