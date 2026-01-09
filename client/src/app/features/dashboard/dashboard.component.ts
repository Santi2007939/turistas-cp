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
            <h3 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: #2D2622;">
              <!-- Lucide BarChart2 icon -->
              <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 20V10m-6 10V4M6 20v-6" />
              </svg>
              Tu Progreso en el Roadmap
            </h3>
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

          <!-- Codeforces Stats Section - Codeforces themed with adjusted tones -->
          <div *ngIf="currentUser?.codeforcesHandle" class="bg-white rounded-[12px] p-6 mb-6" style="border: 2px solid #4A90A4;">
            <div class="flex items-center gap-3 mb-6">
              <!-- Lucide BarChart2 icon -->
              <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 20V10m-6 10V4M6 20v-6" />
              </svg>
              <h3 class="text-xl font-semibold" style="color: #2D2622;">Estadísticas de Codeforces</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-[12px]" style="background-color: #E8F4F8; color: #4A90A4; border: 1px solid #4A90A4;">Codeforces</span>
            </div>
            
            <div *ngIf="loadingCodeforcesStats" class="text-center py-4">
              <p style="color: #4A3B33;">Cargando estadísticas de Codeforces...</p>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Rating -->
              <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #4A90A4; background: linear-gradient(135deg, #FFFFFF 0%, #E8F4F8 100%);">
                <div class="flex items-center gap-2 mb-2">
                  <!-- Lucide Star icon -->
                  <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <h4 class="font-semibold" style="color: #2D2622;">Rating</h4>
                </div>
                <p class="text-2xl font-bold font-mono" style="color: #4A90A4;">
                  {{ codeforcesStats.rating || 'Sin rating' }}
                </p>
                <p class="text-sm" style="color: #4A3B33;">{{ codeforcesStats.rank || 'Unranked' }}</p>
              </div>

              <!-- Max Rating -->
              <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #4A90A4; background: linear-gradient(135deg, #FFFFFF 0%, #E8F4F8 100%);">
                <div class="flex items-center gap-2 mb-2">
                  <!-- Lucide Trophy icon -->
                  <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 3v6a6 6 0 006 6v0a6 6 0 006-6V3M9 21h6M12 15v6" />
                  </svg>
                  <h4 class="font-semibold" style="color: #2D2622;">Max Rating</h4>
                </div>
                <p class="text-2xl font-bold font-mono" style="color: #3A7A8A;">
                  {{ codeforcesStats.maxRating || 'N/A' }}
                </p>
                <p class="text-sm" style="color: #4A3B33;">{{ codeforcesStats.maxRank || '' }}</p>
              </div>

              <!-- Contribution -->
              <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #4A90A4; background: linear-gradient(135deg, #FFFFFF 0%, #E8F4F8 100%);">
                <div class="flex items-center gap-2 mb-2">
                  <!-- Lucide Heart icon -->
                  <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h4 class="font-semibold" style="color: #2D2622;">Contribución</h4>
                </div>
                <p class="text-2xl font-bold font-mono" style="color: #4A90A4;">{{ codeforcesStats.contribution || 0 }}</p>
                <p class="text-sm" style="color: #4A3B33;">Puntos</p>
              </div>

              <!-- Friend Count -->
              <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #4A90A4; background: linear-gradient(135deg, #FFFFFF 0%, #E8F4F8 100%);">
                <div class="flex items-center gap-2 mb-2">
                  <!-- Lucide Users icon -->
                  <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h4 class="font-semibold" style="color: #2D2622;">Amigos</h4>
                </div>
                <p class="text-2xl font-bold font-mono" style="color: #3A7A8A;">{{ codeforcesStats.friendOfCount || 0 }}</p>
                <p class="text-sm" style="color: #4A3B33;">Personas te siguen</p>
              </div>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesError" class="text-center py-4">
              <p class="text-red-500">{{ codeforcesError }}</p>
              <button 
                (click)="loadCodeforcesStats()"
                class="mt-2 text-white px-4 py-2 rounded-[12px] text-sm font-medium"
                style="background-color: #4A90A4;">
                Reintentar
              </button>
            </div>

            <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="mt-6 text-center">
              <a 
                [href]="'https://codeforces.com/profile/' + currentUser?.codeforcesHandle"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm hover:underline font-medium"
                style="color: #4A90A4;">
                Ver perfil completo en Codeforces →
              </a>
            </div>
          </div>

          <div *ngIf="!currentUser?.codeforcesHandle" class="bg-white rounded-[12px] p-6 mb-6" style="border: 2px solid #4A90A4;">
            <div class="flex items-center gap-3 mb-4">
              <!-- Lucide BarChart2 icon -->
              <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 20V10m-6 10V4M6 20v-6" />
              </svg>
              <h3 class="text-xl font-semibold" style="color: #2D2622;">Estadísticas de Codeforces</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-[12px]" style="background-color: #E8F4F8; color: #4A90A4; border: 1px solid #4A90A4;">Codeforces</span>
            </div>
            <p class="text-center py-4" style="color: #4A3B33;">
              Vincula tu handle de Codeforces en tu perfil para ver tus estadísticas aquí.
            </p>
          </div>

          <!-- Quick Actions - Matte-Drift Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a routerLink="/themes" class="bg-white overflow-hidden rounded-[12px] p-6 transition-colors cursor-pointer" style="border: 1px solid #EAE3DB;">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                <!-- Lucide BookOpen icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Learning Themes
              </h3>
              <p class="mt-2" style="color: #4A3B33;">Browse and explore learning topics</p>
            </a>
            <a routerLink="/roadmap" class="bg-white overflow-hidden rounded-[12px] p-6 transition-colors cursor-pointer" style="border: 1px solid #EAE3DB;">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                <!-- Lucide Map icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                My Roadmap
              </h3>
              <p class="mt-2" style="color: #4A3B33;">Track your learning journey</p>
              <div class="mt-3 flex gap-2">
                <span class="text-xs px-2 py-1 rounded-[12px] flex items-center gap-1" style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                  <!-- Lucide LayoutList icon -->
                  <svg class="w-3 h-3" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Kanban
                </span>
                <span class="text-xs px-2 py-1 rounded-[12px] flex items-center gap-1" style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                  <!-- Lucide BarChart2 icon -->
                  <svg class="w-3 h-3" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 20V10m-6 10V4M6 20v-6" />
                  </svg>
                  Gráfica
                </span>
              </div>
            </a>
            <a routerLink="/problems" class="bg-white overflow-hidden rounded-[12px] p-6 transition-colors cursor-pointer" style="border: 1px solid #EAE3DB;">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                <!-- Lucide Code icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Problems
              </h3>
              <p class="mt-2" style="color: #4A3B33;">Practice and exercises</p>
            </a>
            <a routerLink="/team" class="bg-white overflow-hidden rounded-[12px] p-6 transition-colors cursor-pointer" style="border: 1px solid #EAE3DB;">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                <!-- Lucide Users icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Team Turistas
              </h3>
              <p class="mt-2" style="color: #4A3B33;">Collaborative workspace</p>
            </a>
            <a routerLink="/calendar" class="bg-white overflow-hidden rounded-[12px] p-6 transition-colors cursor-pointer" style="border: 1px solid #EAE3DB;">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                <!-- Lucide Calendar icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </h3>
              <p class="mt-2" style="color: #4A3B33;">Contests and events</p>
            </a>
            <a 
              routerLink="/statistics"
              class="bg-white overflow-hidden rounded-[12px] p-6 transition-colors cursor-pointer" style="border: 1px solid #EAE3DB;">
              <h3 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                <!-- Lucide BarChart2 icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 20V10m-6 10V4M6 20v-6" />
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
