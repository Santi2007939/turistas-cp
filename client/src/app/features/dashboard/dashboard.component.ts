import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User } from '../../core/services/auth.service';
import { RoadmapService, PersonalNode } from '../../core/services/roadmap.service';
import { IntegrationsService, CodeforcesUserInfo } from '../../core/services/integrations.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterModule, NavbarComponent],
    template: `
    <!-- Safe Room Dashboard -->
    <div class="min-h-screen bg-[#F4F4F4]">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 px-6">
        <div class="py-6">
          <h2 class="text-2xl font-bold text-[#1A1A1A] mb-6 font-mono">Welcome, {{ currentUser?.username }}!</h2>
          
          <!-- Roadmap Statistics - Safe Room Style -->
          <div *ngIf="roadmapStats" class="bg-[#1A1A1A] p-6 mb-6 text-white border-2 border-[#1A1A1A]">
            <h3 class="text-xl font-bold mb-4 font-mono">📊 Tu Progreso en el Roadmap</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-3xl font-bold font-mono">{{ roadmapStats.total }}</div>
                <div class="text-sm opacity-90">Temas Totales</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold font-mono text-[#FFB400]">{{ roadmapStats.inProgress }}</div>
                <div class="text-sm opacity-90">En Progreso</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold font-mono">{{ roadmapStats.completed }}</div>
                <div class="text-sm opacity-90">Completados</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold font-mono">{{ roadmapStats.averageProgress }}%</div>
                <div class="text-sm opacity-90">Progreso Promedio</div>
              </div>
            </div>
            <div class="mt-4">
              <div class="bg-gray-700 h-2 overflow-hidden">
                <div class="bg-[#FFB400] h-2 transition-all duration-500" [style.width.%]="roadmapStats.averageProgress"></div>
              </div>
            </div>
          </div>

          <!-- Codeforces Stats Section - Safe Room Style -->
          <div *ngIf="currentUser?.codeforcesHandle" class="bg-white p-6 mb-6 border-2 border-[#D1D1D1]">
            <h3 class="text-xl font-bold text-[#1A1A1A] mb-4 font-mono">📊 Estadísticas de Codeforces</h3>
            
            <div *ngIf="loadingCodeforcesStats" class="text-center py-4">
              <p class="text-gray-500">Cargando estadísticas de Codeforces...</p>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Rating -->
              <div class="bg-[#F4F4F4] p-4 border-2 border-[#D1D1D1]">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">⭐</span>
                  <h4 class="font-semibold text-[#1A1A1A]">Rating</h4>
                </div>
                <p class="text-2xl font-bold font-mono" [ngClass]="getRatingColorClass(codeforcesStats.rating)">
                  {{ codeforcesStats.rating || 'Sin rating' }}
                </p>
                <p class="text-sm text-gray-600">{{ codeforcesStats.rank || 'Unranked' }}</p>
              </div>

              <!-- Max Rating -->
              <div class="bg-[#F4F4F4] p-4 border-2 border-[#D1D1D1]">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">🏆</span>
                  <h4 class="font-semibold text-[#1A1A1A]">Max Rating</h4>
                </div>
                <p class="text-2xl font-bold font-mono" [ngClass]="getRatingColorClass(codeforcesStats.maxRating)">
                  {{ codeforcesStats.maxRating || 'N/A' }}
                </p>
                <p class="text-sm text-gray-600">{{ codeforcesStats.maxRank || '' }}</p>
              </div>

              <!-- Contribution -->
              <div class="bg-[#F4F4F4] p-4 border-2 border-[#D1D1D1]">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">🤝</span>
                  <h4 class="font-semibold text-[#1A1A1A]">Contribución</h4>
                </div>
                <p class="text-2xl font-bold font-mono text-[#1A1A1A]">{{ codeforcesStats.contribution || 0 }}</p>
                <p class="text-sm text-gray-600">Puntos</p>
              </div>

              <!-- Friend Count -->
              <div class="bg-[#F4F4F4] p-4 border-2 border-[#D1D1D1]">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">👥</span>
                  <h4 class="font-semibold text-[#1A1A1A]">Amigos</h4>
                </div>
                <p class="text-2xl font-bold font-mono text-[#1A1A1A]">{{ codeforcesStats.friendOfCount || 0 }}</p>
                <p class="text-sm text-gray-600">Personas te siguen</p>
              </div>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesError" class="text-center py-4">
              <p class="text-red-600">{{ codeforcesError }}</p>
              <button 
                (click)="loadCodeforcesStats()"
                class="mt-2 bg-[#1A1A1A] hover:bg-gray-800 text-white px-4 py-2 text-sm">
                Reintentar
              </button>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="mt-4 text-center">
              <a 
                [href]="'https://codeforces.com/profile/' + currentUser?.codeforcesHandle"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[#1A1A1A] hover:text-[#FFB400] text-sm">
                Ver perfil completo en Codeforces →
              </a>
            </div>
          </div>

          <div *ngIf="!currentUser?.codeforcesHandle" class="bg-white p-6 mb-6 border-2 border-[#D1D1D1]">
            <h3 class="text-xl font-bold text-[#1A1A1A] mb-4 font-mono">📊 Estadísticas de Codeforces</h3>
            <p class="text-gray-500 text-center py-4">
              Vincula tu handle de Codeforces en tu perfil para ver tus estadísticas aquí.
            </p>
          </div>

          <!-- Quick Actions - Safe Room Style Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Feature cards -->
            <a routerLink="/themes" class="bg-white p-6 border-2 border-[#D1D1D1] hover:border-[#1A1A1A] transition-colors cursor-pointer">
              <h3 class="text-lg font-semibold font-mono">📚 Learning Themes</h3>
              <p class="mt-2 text-gray-600">Browse and explore learning topics</p>
            </a>
            <a routerLink="/roadmap" class="bg-white p-6 border-2 border-[#D1D1D1] hover:border-[#1A1A1A] transition-colors cursor-pointer">
              <h3 class="text-lg font-semibold font-mono">🗺️ My Roadmap</h3>
              <p class="mt-2 text-gray-600">Track your learning journey</p>
              <div class="mt-3 flex gap-2">
                <span class="bg-[#F4F4F4] text-[#1A1A1A] text-xs px-2 py-1 border border-[#D1D1D1]">📋 Kanban</span>
                <span class="bg-[#F4F4F4] text-[#1A1A1A] text-xs px-2 py-1 border border-[#D1D1D1]">📊 Gráfica</span>
              </div>
            </a>
            <a routerLink="/problems" class="bg-white p-6 border-2 border-[#D1D1D1] hover:border-[#1A1A1A] transition-colors cursor-pointer">
              <h3 class="text-lg font-semibold font-mono">💻 Problems</h3>
              <p class="mt-2 text-gray-600">Practice and exercises</p>
            </a>
            <a routerLink="/team" class="bg-white p-6 border-2 border-[#D1D1D1] hover:border-[#1A1A1A] transition-colors cursor-pointer">
              <h3 class="text-lg font-semibold font-mono">👥 Team Turistas</h3>
              <p class="mt-2 text-gray-600">Collaborative workspace</p>
            </a>
            <a routerLink="/calendar" class="bg-white p-6 border-2 border-[#D1D1D1] hover:border-[#1A1A1A] transition-colors cursor-pointer">
              <h3 class="text-lg font-semibold font-mono">📅 Calendar</h3>
              <p class="mt-2 text-gray-600">Contests and events</p>
            </a>
            <a 
              routerLink="/statistics"
              class="bg-white p-6 border-2 border-[#D1D1D1] hover:border-[#1A1A1A] transition-colors cursor-pointer">
              <h3 class="text-lg font-semibold font-mono">📊 Statistics</h3>
              <p class="mt-2 text-gray-600">View your progress and achievements</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class DashboardComponent implements OnInit, OnDestroy {
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

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private roadmapService: RoadmapService,
    private integrationsService: IntegrationsService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadRoadmapStats();
          if (user.codeforcesHandle) {
            this.loadCodeforcesStats();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
