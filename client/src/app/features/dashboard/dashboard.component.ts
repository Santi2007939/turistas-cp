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
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <h2 class="text-2xl font-bold text-deep-sea mb-6">Welcome, {{ currentUser?.username }}!</h2>
          
          <!-- Roadmap Statistics -->
          <div *ngIf="roadmapStats" class="bg-card-bg border border-card-border rounded-kinetic p-6 mb-6">
            <h3 class="text-xl font-bold text-deep-sea mb-4">📊 Tu Progreso en el Roadmap</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-4xl font-bold text-deep-sea">{{ roadmapStats.total }}</div>
                <div class="text-sm text-icon-gray font-medium">Temas Totales</div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold text-deep-sea">{{ roadmapStats.inProgress }}</div>
                <div class="text-sm text-icon-gray font-medium">En Progreso</div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold text-deep-sea">{{ roadmapStats.completed }}</div>
                <div class="text-sm text-icon-gray font-medium">Completados</div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold text-electric-blue">{{ roadmapStats.averageProgress }}%</div>
                <div class="text-sm text-icon-gray font-medium">Progreso Promedio</div>
              </div>
            </div>
            <div class="mt-4">
              <div class="bg-card-border rounded-kinetic h-2 overflow-hidden">
                <div class="bg-electric-blue h-2 rounded-kinetic transition-all duration-500" [style.width.%]="roadmapStats.averageProgress"></div>
              </div>
            </div>
          </div>

          <!-- Codeforces Stats Section -->
          <div *ngIf="currentUser?.codeforcesHandle" class="bg-card-bg border border-card-border rounded-kinetic p-6 mb-6">
            <h3 class="text-xl font-bold text-deep-sea mb-4">📊 Estadísticas de Codeforces</h3>
            
            <div *ngIf="loadingCodeforcesStats" class="text-center py-4">
              <p class="text-icon-gray">Cargando estadísticas de Codeforces...</p>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Rating -->
              <div class="bg-white border border-card-border rounded-kinetic p-4">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-icon-gray text-xl">⭐</span>
                  <h4 class="font-bold text-deep-sea">Rating</h4>
                </div>
                <p class="text-3xl font-bold text-deep-sea">
                  {{ codeforcesStats.rating || 'Sin rating' }}
                </p>
                <p class="text-sm text-icon-gray">{{ codeforcesStats.rank || 'Unranked' }}</p>
              </div>

              <!-- Max Rating -->
              <div class="bg-white border border-card-border rounded-kinetic p-4">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-icon-gray text-xl">🏆</span>
                  <h4 class="font-bold text-deep-sea">Max Rating</h4>
                </div>
                <p class="text-3xl font-bold text-deep-sea">
                  {{ codeforcesStats.maxRating || 'N/A' }}
                </p>
                <p class="text-sm text-icon-gray">{{ codeforcesStats.maxRank || '' }}</p>
              </div>

              <!-- Contribution -->
              <div class="bg-white border border-card-border rounded-kinetic p-4">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-icon-gray text-xl">🤝</span>
                  <h4 class="font-bold text-deep-sea">Contribución</h4>
                </div>
                <p class="text-3xl font-bold text-deep-sea">{{ codeforcesStats.contribution || 0 }}</p>
                <p class="text-sm text-icon-gray">Puntos</p>
              </div>

              <!-- Friend Count -->
              <div class="bg-white border border-card-border rounded-kinetic p-4">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-icon-gray text-xl">👥</span>
                  <h4 class="font-bold text-deep-sea">Amigos</h4>
                </div>
                <p class="text-3xl font-bold text-deep-sea">{{ codeforcesStats.friendOfCount || 0 }}</p>
                <p class="text-sm text-icon-gray">Personas te siguen</p>
              </div>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesError" class="text-center py-4">
              <p class="text-red-500">{{ codeforcesError }}</p>
              <button 
                (click)="loadCodeforcesStats()"
                class="mt-2 bg-electric-blue hover:opacity-90 text-deep-sea px-4 py-2 rounded-kinetic text-sm font-medium">
                Reintentar
              </button>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="mt-4 text-center">
              <a 
                [href]="'https://codeforces.com/profile/' + currentUser?.codeforcesHandle"
                target="_blank"
                rel="noopener noreferrer"
                class="text-electric-blue hover:opacity-80 text-sm font-medium">
                Ver perfil completo en Codeforces →
              </a>
            </div>
          </div>

          <div *ngIf="!currentUser?.codeforcesHandle" class="bg-card-bg border border-card-border rounded-kinetic p-6 mb-6">
            <h3 class="text-xl font-bold text-deep-sea mb-4">📊 Estadísticas de Codeforces</h3>
            <p class="text-icon-gray text-center py-4">
              Vincula tu handle de Codeforces en tu perfil para ver tus estadísticas aquí.
            </p>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Feature cards -->
            <a routerLink="/themes" class="bg-card-bg border border-card-border overflow-hidden rounded-kinetic p-6 hover:border-electric-blue transition-colors cursor-pointer">
              <h3 class="text-lg font-bold text-deep-sea">📚 Learning Themes</h3>
              <p class="mt-2 text-icon-gray">Browse and explore learning topics</p>
            </a>
            <a routerLink="/roadmap" class="bg-card-bg border border-card-border overflow-hidden rounded-kinetic p-6 hover:border-electric-blue transition-colors cursor-pointer">
              <h3 class="text-lg font-bold text-deep-sea">🗺️ My Roadmap</h3>
              <p class="mt-2 text-icon-gray">Track your learning journey</p>
              <div class="mt-3 flex gap-2">
                <span class="bg-electric-blue/10 text-electric-blue text-xs px-2 py-1 rounded-kinetic font-medium">📋 Kanban</span>
                <span class="bg-electric-blue/10 text-electric-blue text-xs px-2 py-1 rounded-kinetic font-medium">📊 Gráfica</span>
              </div>
            </a>
            <a routerLink="/problems" class="bg-card-bg border border-card-border overflow-hidden rounded-kinetic p-6 hover:border-electric-blue transition-colors cursor-pointer">
              <h3 class="text-lg font-bold text-deep-sea">💻 Problems</h3>
              <p class="mt-2 text-icon-gray">Practice and exercises</p>
            </a>
            <a routerLink="/team" class="bg-card-bg border border-card-border overflow-hidden rounded-kinetic p-6 hover:border-electric-blue transition-colors cursor-pointer">
              <h3 class="text-lg font-bold text-deep-sea">👥 Team Turistas</h3>
              <p class="mt-2 text-icon-gray">Collaborative workspace</p>
            </a>
            <a routerLink="/calendar" class="bg-card-bg border border-card-border overflow-hidden rounded-kinetic p-6 hover:border-electric-blue transition-colors cursor-pointer">
              <h3 class="text-lg font-bold text-deep-sea">📅 Calendar</h3>
              <p class="mt-2 text-icon-gray">Contests and events</p>
            </a>
            <a 
              routerLink="/statistics"
              class="bg-card-bg border border-card-border overflow-hidden rounded-kinetic p-6 hover:border-electric-blue transition-colors cursor-pointer">
              <h3 class="text-lg font-bold text-deep-sea">📊 Statistics</h3>
              <p class="mt-2 text-icon-gray">View your progress and achievements</p>
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
