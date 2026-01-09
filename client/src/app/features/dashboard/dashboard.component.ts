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
    <!-- Matte-Drift Dashboard - Modern Minimalist Layout -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-8 px-6">
        <!-- Header Section -->
        <div class="mb-8">
          <h1 class="text-3xl font-semibold" style="color: #2D2622;">
            Hola, {{ currentUser?.username }}
          </h1>
          <p class="mt-1" style="color: #4A3B33;">Tu panel de control para Turistas CP</p>
        </div>

        <!-- Main Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left Column: Stats & Quick Access -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Roadmap Progress Card -->
            <div *ngIf="roadmapStats" class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-semibold flex items-center gap-2" style="color: #2D2622;">
                  <!-- Lucide TrendingUp icon -->
                  <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Progreso del Roadmap
                </h2>
                <a routerLink="/roadmap" class="text-sm font-medium hover:underline" style="color: #8B5E3C;">Ver todo →</a>
              </div>
              
              <!-- Progress Bar -->
              <div class="mb-6">
                <div class="flex justify-between text-sm mb-2">
                  <span style="color: #4A3B33;">Progreso general</span>
                  <span class="font-semibold font-mono" style="color: #8B5E3C;">{{ roadmapStats.averageProgress }}%</span>
                </div>
                <div class="rounded-full h-3 overflow-hidden" style="background-color: #EAE3DB;">
                  <div class="h-3 rounded-full transition-all duration-500" style="background-color: #8B5E3C;" [style.width.%]="roadmapStats.averageProgress"></div>
                </div>
              </div>

              <!-- Stats Row -->
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-3 rounded-[12px]" style="background-color: #FCF9F5;">
                  <div class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ roadmapStats.total }}</div>
                  <div class="text-xs" style="color: #4A3B33;">Total</div>
                </div>
                <div class="text-center p-3 rounded-[12px]" style="background-color: #FCF9F5;">
                  <div class="text-2xl font-bold font-mono" style="color: #D4A373;">{{ roadmapStats.inProgress }}</div>
                  <div class="text-xs" style="color: #4A3B33;">En Progreso</div>
                </div>
                <div class="text-center p-3 rounded-[12px]" style="background-color: #FCF9F5;">
                  <div class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ roadmapStats.completed }}</div>
                  <div class="text-xs" style="color: #4A3B33;">Completados</div>
                </div>
              </div>
            </div>

            <!-- Codeforces Stats Card -->
            <div *ngIf="currentUser?.codeforcesHandle" class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-2">
                  <h2 class="text-lg font-semibold" style="color: #2D2622;">Codeforces</h2>
                  <span class="px-2 py-0.5 text-xs font-medium rounded-full" style="background-color: #E8F4F8; color: #4A90A4;">CF</span>
                </div>
                <a 
                  [href]="'https://codeforces.com/profile/' + currentUser?.codeforcesHandle"
                  target="_blank"
                  class="text-sm font-medium hover:underline"
                  style="color: #4A90A4;">
                  Ver perfil →
                </a>
              </div>
              
              <div *ngIf="loadingCodeforcesStats" class="text-center py-4">
                <p style="color: #4A3B33;">Cargando...</p>
              </div>

              <div *ngIf="!loadingCodeforcesStats && codeforcesStats" class="grid grid-cols-4 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold font-mono" style="color: #4A90A4;">{{ codeforcesStats.rating || '-' }}</div>
                  <div class="text-xs" style="color: #4A3B33;">Rating</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold font-mono" style="color: #3A7A8A;">{{ codeforcesStats.maxRating || '-' }}</div>
                  <div class="text-xs" style="color: #4A3B33;">Max Rating</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold font-mono" style="color: #4A90A4;">{{ codeforcesStats.contribution || 0 }}</div>
                  <div class="text-xs" style="color: #4A3B33;">Contribución</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold font-mono" style="color: #3A7A8A;">{{ codeforcesStats.friendOfCount || 0 }}</div>
                  <div class="text-xs" style="color: #4A3B33;">Seguidores</div>
                </div>
              </div>

              <div *ngIf="!loadingCodeforcesStats && codeforcesError" class="text-center py-4">
                <p class="text-sm mb-2" style="color: #4A3B33;">{{ codeforcesError }}</p>
                <button 
                  (click)="loadCodeforcesStats()"
                  class="text-sm font-medium"
                  style="color: #4A90A4;">
                  Reintentar
                </button>
              </div>
            </div>

            <!-- Prompt to link Codeforces -->
            <div *ngIf="!currentUser?.codeforcesHandle" class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
              <div class="flex items-center gap-3">
                <!-- Lucide Link icon -->
                <svg class="w-8 h-8" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div class="flex-1">
                  <h3 class="font-semibold" style="color: #2D2622;">Vincula tu cuenta de Codeforces</h3>
                  <p class="text-sm" style="color: #4A3B33;">Edita tu perfil para ver tus estadísticas aquí</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Quick Navigation -->
          <div class="space-y-4">
            <h2 class="text-sm font-semibold uppercase tracking-wider" style="color: #4A3B33;">Acceso Rápido</h2>
            
            <!-- Navigation Cards -->
            <a routerLink="/themes" class="block bg-white rounded-[12px] p-4 transition-all hover:shadow-sm" style="border: 1px solid #EAE3DB;">
              <div class="flex items-center gap-3">
                <!-- Lucide BookOpen icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <div>
                  <h3 class="font-semibold" style="color: #2D2622;">Temas</h3>
                  <p class="text-xs" style="color: #4A3B33;">Explorar temas de estudio</p>
                </div>
              </div>
            </a>
            
            <a routerLink="/roadmap" class="block bg-white rounded-[12px] p-4 transition-all hover:shadow-sm" style="border: 1px solid #EAE3DB;">
              <div class="flex items-center gap-3">
                <!-- Lucide Map icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <div>
                  <h3 class="font-semibold" style="color: #2D2622;">Roadmap</h3>
                  <p class="text-xs" style="color: #4A3B33;">Tu ruta de aprendizaje</p>
                </div>
              </div>
            </a>
            
            <a routerLink="/problems" class="block bg-white rounded-[12px] p-4 transition-all hover:shadow-sm" style="border: 1px solid #EAE3DB;">
              <div class="flex items-center gap-3">
                <!-- Lucide Code icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <div>
                  <h3 class="font-semibold" style="color: #2D2622;">Problemas</h3>
                  <p class="text-xs" style="color: #4A3B33;">Práctica y ejercicios</p>
                </div>
              </div>
            </a>
            
            <a routerLink="/team" class="block bg-white rounded-[12px] p-4 transition-all hover:shadow-sm" style="border: 1px solid #EAE3DB;">
              <div class="flex items-center gap-3">
                <!-- Lucide Users icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div>
                  <h3 class="font-semibold" style="color: #2D2622;">Equipo</h3>
                  <p class="text-xs" style="color: #4A3B33;">Trabajo colaborativo</p>
                </div>
              </div>
            </a>
            
            <a routerLink="/calendar" class="block bg-white rounded-[12px] p-4 transition-all hover:shadow-sm" style="border: 1px solid #EAE3DB;">
              <div class="flex items-center gap-3">
                <!-- Lucide Calendar icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 class="font-semibold" style="color: #2D2622;">Calendario</h3>
                  <p class="text-xs" style="color: #4A3B33;">Eventos y concursos</p>
                </div>
              </div>
            </a>
            
            <a routerLink="/statistics" class="block bg-white rounded-[12px] p-4 transition-all hover:shadow-sm" style="border: 1px solid #EAE3DB;">
              <div class="flex items-center gap-3">
                <!-- Lucide BarChart2 icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 20V10m-6 10V4M6 20v-6" />
                </svg>
                <div>
                  <h3 class="font-semibold" style="color: #2D2622;">Estadísticas</h3>
                  <p class="text-xs" style="color: #4A3B33;">Progreso y logros</p>
                </div>
              </div>
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
