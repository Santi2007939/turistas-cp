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
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-8 px-6 lg:px-8">
        <div class="py-6">
          <h2 class="text-2xl font-bold mb-6" style="color: #2D2622;">Welcome, {{ currentUser?.username }}!</h2>
          
          <!-- Roadmap Statistics -->
          <div *ngIf="roadmapStats" class="rounded-2xl p-6 mb-6 text-white" style="background-color: #8B5E3C; box-shadow: 0 4px 16px rgba(74, 59, 51, 0.1);">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Tu Progreso en el Roadmap
            </h3>
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
          <div *ngIf="currentUser?.codeforcesHandle" class="bg-white rounded-2xl p-6 mb-6" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2" style="color: #2D2622;">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Estadísticas de Codeforces
            </h3>
            
            <div *ngIf="loadingCodeforcesStats" class="text-center py-4">
              <p style="color: #4A3B33;">Cargando estadísticas de Codeforces...</p>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Rating -->
              <div class="rounded-2xl p-4" style="background-color: #F2E9E1;">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <h4 class="font-semibold" style="color: #2D2622;">Rating</h4>
                </div>
                <p class="text-2xl font-bold" [ngClass]="getRatingColorClass(codeforcesStats.rating)">
                  {{ codeforcesStats.rating || 'Sin rating' }}
                </p>
                <p class="text-sm" style="color: #4A3B33;">{{ codeforcesStats.rank || 'Unranked' }}</p>
              </div>

              <!-- Max Rating -->
              <div class="rounded-2xl p-4" style="background-color: #F2E9E1;">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                    <path d="M4 22h16"/>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                  </svg>
                  <h4 class="font-semibold" style="color: #2D2622;">Max Rating</h4>
                </div>
                <p class="text-2xl font-bold" [ngClass]="getRatingColorClass(codeforcesStats.maxRating)">
                  {{ codeforcesStats.maxRating || 'N/A' }}
                </p>
                <p class="text-sm" style="color: #4A3B33;">{{ codeforcesStats.maxRank || '' }}</p>
              </div>

              <!-- Contribution -->
              <div class="rounded-2xl p-4" style="background-color: #F2E9E1;">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <h4 class="font-semibold" style="color: #2D2622;">Contribución</h4>
                </div>
                <p class="text-2xl font-bold" style="color: #8B5E3C;">{{ codeforcesStats.contribution || 0 }}</p>
                <p class="text-sm" style="color: #4A3B33;">Puntos</p>
              </div>

              <!-- Friend Count -->
              <div class="rounded-2xl p-4" style="background-color: #F2E9E1;">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <h4 class="font-semibold" style="color: #2D2622;">Amigos</h4>
                </div>
                <p class="text-2xl font-bold" style="color: #D4A373;">{{ codeforcesStats.friendOfCount || 0 }}</p>
                <p class="text-sm" style="color: #4A3B33;">Personas te siguen</p>
              </div>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesError" class="text-center py-4">
              <p class="text-red-500">{{ codeforcesError }}</p>
              <button 
                (click)="loadCodeforcesStats()"
                class="mt-2 text-white px-4 py-2 rounded-xl text-sm"
                style="background-color: #8B5E3C;">
                Reintentar
              </button>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="mt-4 text-center">
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

          <div *ngIf="!currentUser?.codeforcesHandle" class="bg-white rounded-2xl p-6 mb-6" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2" style="color: #2D2622;">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Estadísticas de Codeforces
            </h3>
            <p class="text-center py-4" style="color: #4A3B33;">
              Vincula tu handle de Codeforces en tu perfil para ver tus estadísticas aquí.
            </p>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Feature cards -->
            <a routerLink="/themes" class="bg-white overflow-hidden rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                Learning Themes
              </h3>
              <p class="mt-2" style="color: #4A3B33;">Browse and explore learning topics</p>
            </a>
            <a routerLink="/roadmap" class="bg-white overflow-hidden rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                  <line x1="8" y1="2" x2="8" y2="18"/>
                  <line x1="16" y1="6" x2="16" y2="22"/>
                </svg>
                My Roadmap
              </h3>
              <p class="mt-2" style="color: #4A3B33;">Track your learning journey</p>
              <div class="mt-3 flex gap-2">
                <span class="text-xs px-3 py-1 rounded-full font-medium" style="background-color: #F2E9E1; color: #4A3B33;">Kanban</span>
                <span class="text-xs px-3 py-1 rounded-full font-medium" style="background-color: #F2E9E1; color: #4A3B33;">Gráfica</span>
              </div>
            </a>
            <a routerLink="/problems" class="bg-white overflow-hidden rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                Problems
              </h3>
              <p class="mt-2" style="color: #4A3B33;">Practice and exercises</p>
            </a>
            <a routerLink="/team" class="bg-white overflow-hidden rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Team Turistas
              </h3>
              <p class="mt-2" style="color: #4A3B33;">Collaborative workspace</p>
            </a>
            <a routerLink="/calendar" class="bg-white overflow-hidden rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Calendar
              </h3>
              <p class="mt-2" style="color: #4A3B33;">Contests and events</p>
            </a>
            <a 
              routerLink="/statistics"
              class="bg-white overflow-hidden rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Statistics
              </h3>
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
