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
    <!-- Matte-Drift Dashboard -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 px-6">
        <div class="py-6">
          <h2 class="text-2xl font-semibold mb-6" style="color: #2D2622;">Welcome, {{ currentUser?.username }}!</h2>
          
          <!-- Roadmap Statistics Card -->
          <div *ngIf="roadmapStats" class="bg-white rounded-[12px] p-6 mb-6" style="border: 1px solid #EAE3DB;">
            <h3 class="text-xl font-semibold mb-6" style="color: #2D2622;">📊 Tu Progreso en el Roadmap</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold font-mono" style="color: #8B5E3C;">{{ roadmapStats.total }}</div>
                <div class="text-sm" style="color: #4A3B33;">Temas Totales</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold font-mono" style="color: #D4A373;">{{ roadmapStats.inProgress }}</div>
                <div class="text-sm" style="color: #4A3B33;">En Progreso</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold font-mono" style="color: #8B5E3C;">{{ roadmapStats.completed }}</div>
                <div class="text-sm" style="color: #4A3B33;">Completados</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold font-mono" style="color: #8B5E3C;">{{ roadmapStats.averageProgress }}%</div>
                <div class="text-sm" style="color: #4A3B33;">Progreso Promedio</div>
              </div>
            </div>
            <div class="mt-6">
              <div class="rounded-[12px] h-2 overflow-hidden" style="background-color: #EAE3DB;">
                <div class="h-2 rounded-[12px] transition-all duration-500" style="background-color: #D4A373;" [style.width.%]="roadmapStats.averageProgress"></div>
              </div>
            </div>
          </div>

          <!-- Codeforces Stats Section -->
          <div *ngIf="currentUser?.codeforcesHandle" class="bg-white rounded-[12px] p-6 mb-6" style="border: 1px solid #EAE3DB;">
            <h3 class="text-xl font-semibold mb-6" style="color: #2D2622;">📊 Estadísticas de Codeforces</h3>
            
            <div *ngIf="loadingCodeforcesStats" class="text-center py-4">
              <p style="color: #4A3B33;">Cargando estadísticas de Codeforces...</p>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Rating -->
              <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">⭐</span>
                  <h4 class="font-semibold" style="color: #2D2622;">Rating</h4>
                </div>
                <p class="text-2xl font-bold font-mono" style="color: #8B5E3C;">
                  {{ codeforcesStats.rating || 'Sin rating' }}
                </p>
                <p class="text-sm" style="color: #4A3B33;">{{ codeforcesStats.rank || 'Unranked' }}</p>
              </div>

              <!-- Max Rating -->
              <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">🏆</span>
                  <h4 class="font-semibold" style="color: #2D2622;">Max Rating</h4>
                </div>
                <p class="text-2xl font-bold font-mono" style="color: #D4A373;">
                  {{ codeforcesStats.maxRating || 'N/A' }}
                </p>
                <p class="text-sm" style="color: #4A3B33;">{{ codeforcesStats.maxRank || '' }}</p>
              </div>

              <!-- Contribution -->
              <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">🤝</span>
                  <h4 class="font-semibold" style="color: #2D2622;">Contribución</h4>
                </div>
                <p class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ codeforcesStats.contribution || 0 }}</p>
                <p class="text-sm" style="color: #4A3B33;">Puntos</p>
              </div>

              <!-- Friend Count -->
              <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">👥</span>
                  <h4 class="font-semibold" style="color: #2D2622;">Amigos</h4>
                </div>
                <p class="text-2xl font-bold font-mono" style="color: #D4A373;">{{ codeforcesStats.friendOfCount || 0 }}</p>
                <p class="text-sm" style="color: #4A3B33;">Personas te siguen</p>
              </div>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesError" class="text-center py-4">
              <p class="text-red-500">{{ codeforcesError }}</p>
              <button 
                (click)="loadCodeforcesStats()"
                class="mt-2 text-white px-4 py-2 rounded-[12px] text-sm font-medium"
                style="background-color: #8B5E3C;">
                Reintentar
              </button>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="mt-6 text-center">
              <a 
                [href]="'https://codeforces.com/profile/' + currentUser?.codeforcesHandle"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm hover:underline"
                style="color: #8B5E3C;">
                Ver perfil completo en Codeforces →
              </a>
            </div>
          </div>

          <div *ngIf="!currentUser?.codeforcesHandle" class="bg-white rounded-[12px] p-6 mb-6" style="border: 1px solid #EAE3DB;">
            <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">📊 Estadísticas de Codeforces</h3>
            <p class="text-center py-4" style="color: #4A3B33;">
              Vincula tu handle de Codeforces en tu perfil para ver tus estadísticas aquí.
            </p>
          </div>

          <!-- Quick Actions - Matte-Drift Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a routerLink="/themes" class="bg-white overflow-hidden rounded-[12px] p-6 transition-colors cursor-pointer" style="border: 1px solid #EAE3DB;">
              <h3 class="text-lg font-semibold" style="color: #2D2622;">📚 Learning Themes</h3>
              <p class="mt-2" style="color: #4A3B33;">Browse and explore learning topics</p>
            </a>
            <a routerLink="/roadmap" class="bg-white overflow-hidden rounded-[12px] p-6 transition-colors cursor-pointer" style="border: 1px solid #EAE3DB;">
              <h3 class="text-lg font-semibold" style="color: #2D2622;">🗺️ My Roadmap</h3>
              <p class="mt-2" style="color: #4A3B33;">Track your learning journey</p>
              <div class="mt-3 flex gap-2">
                <span class="text-xs px-2 py-1 rounded-[12px]" style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">📋 Kanban</span>
                <span class="text-xs px-2 py-1 rounded-[12px]" style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">📊 Gráfica</span>
              </div>
            </a>
            <a routerLink="/problems" class="bg-white overflow-hidden rounded-[12px] p-6 transition-colors cursor-pointer" style="border: 1px solid #EAE3DB;">
              <h3 class="text-lg font-semibold" style="color: #2D2622;">💻 Problems</h3>
              <p class="mt-2" style="color: #4A3B33;">Practice and exercises</p>
            </a>
            <a routerLink="/team" class="bg-white overflow-hidden rounded-[12px] p-6 transition-colors cursor-pointer" style="border: 1px solid #EAE3DB;">
              <h3 class="text-lg font-semibold" style="color: #2D2622;">👥 Team Turistas</h3>
              <p class="mt-2" style="color: #4A3B33;">Collaborative workspace</p>
            </a>
            <a routerLink="/calendar" class="bg-white overflow-hidden rounded-[12px] p-6 transition-colors cursor-pointer" style="border: 1px solid #EAE3DB;">
              <h3 class="text-lg font-semibold" style="color: #2D2622;">📅 Calendar</h3>
              <p class="mt-2" style="color: #4A3B33;">Contests and events</p>
            </a>
            <a 
              routerLink="/statistics"
              class="bg-white overflow-hidden rounded-[12px] p-6 transition-colors cursor-pointer" style="border: 1px solid #EAE3DB;">
              <h3 class="text-lg font-semibold" style="color: #2D2622;">📊 Statistics</h3>
              <p class="mt-2" style="color: #4A3B33;">View your progress and achievements</p>
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
