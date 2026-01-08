import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { RoadmapService, PersonalNode } from '../../core/services/roadmap.service';
import { ProblemsService, Problem } from '../../core/services/problems.service';
import { AchievementsService, Achievement } from '../../core/services/achievements.service';
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

          <!-- Team Achievements & Statistics Section -->
          <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold text-gray-800">🏆 Logros del Equipo y Estadísticas</h3>
              <button 
                *ngIf="!statisticsUnlocked"
                (click)="unlockStatistics()"
                class="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all">
                <span>🔓</span>
                Activar Estadísticas
              </button>
            </div>

            <!-- Statistics Grid (Locked/Unlocked) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <!-- Codeforces Progress -->
              <div class="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200" 
                   [ngClass]="{'opacity-60': !statisticsUnlocked}">
                <div *ngIf="!statisticsUnlocked" class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-10 rounded-lg">
                  <span class="text-3xl">🔒</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">📈</span>
                  <h4 class="font-semibold text-gray-800">Codeforces</h4>
                </div>
                <div *ngIf="statisticsUnlocked">
                  <p class="text-2xl font-bold text-blue-600">{{ currentUser?.codeforcesHandle || 'Sin handle' }}</p>
                  <p class="text-sm text-gray-600">Handle vinculado</p>
                </div>
                <div *ngIf="!statisticsUnlocked">
                  <p class="text-sm text-gray-500">Activa las estadísticas para ver tu progreso</p>
                </div>
              </div>

              <!-- Problems Solved -->
              <div class="relative bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200"
                   [ngClass]="{'opacity-60': !statisticsUnlocked}">
                <div *ngIf="!statisticsUnlocked" class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-10 rounded-lg">
                  <span class="text-3xl">🔒</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">✅</span>
                  <h4 class="font-semibold text-gray-800">Ejercicios Resueltos</h4>
                </div>
                <div *ngIf="statisticsUnlocked">
                  <p class="text-2xl font-bold text-green-600">{{ problemStats.solved }}</p>
                  <p class="text-sm text-gray-600">de {{ problemStats.total }} totales</p>
                </div>
                <div *ngIf="!statisticsUnlocked">
                  <p class="text-sm text-gray-500">Activa las estadísticas para ver tu desempeño</p>
                </div>
              </div>

              <!-- Performance -->
              <div class="relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200"
                   [ngClass]="{'opacity-60': !statisticsUnlocked}">
                <div *ngIf="!statisticsUnlocked" class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-10 rounded-lg">
                  <span class="text-3xl">🔒</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">🎯</span>
                  <h4 class="font-semibold text-gray-800">Desempeño</h4>
                </div>
                <div *ngIf="statisticsUnlocked">
                  <p class="text-2xl font-bold text-purple-600">{{ problemStats.successRate }}%</p>
                  <p class="text-sm text-gray-600">Tasa de éxito</p>
                </div>
                <div *ngIf="!statisticsUnlocked">
                  <p class="text-sm text-gray-500">Activa las estadísticas para ver tu rendimiento</p>
                </div>
              </div>

              <!-- Activity -->
              <div class="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200"
                   [ngClass]="{'opacity-60': !statisticsUnlocked}">
                <div *ngIf="!statisticsUnlocked" class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-10 rounded-lg">
                  <span class="text-3xl">🔒</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">🔥</span>
                  <h4 class="font-semibold text-gray-800">Actividad</h4>
                </div>
                <div *ngIf="statisticsUnlocked">
                  <p class="text-2xl font-bold text-orange-600">{{ activityStreak }}</p>
                  <p class="text-sm text-gray-600">Días activo este mes</p>
                </div>
                <div *ngIf="!statisticsUnlocked">
                  <p class="text-sm text-gray-500">Activa las estadísticas para ver tu actividad</p>
                </div>
              </div>
            </div>

            <!-- Achievements Section -->
            <div class="border-t pt-4">
              <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>🎖️</span>
                Logros Desbloqueados
              </h4>
              
              <div *ngIf="loadingAchievements" class="text-center py-4">
                <p class="text-gray-500">Cargando logros...</p>
              </div>

              <div *ngIf="!loadingAchievements && achievements.length === 0" class="text-center py-4">
                <p class="text-gray-500">¡Aún no has desbloqueado logros! Sigue practicando para ganar medallas.</p>
              </div>

              <div *ngIf="!loadingAchievements && achievements.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div 
                  *ngFor="let achievement of achievements.slice(0, 6)" 
                  class="bg-gradient-to-br rounded-lg p-3 text-center border"
                  [ngClass]="getAchievementClass(achievement.rarity)">
                  <div class="text-3xl mb-1">{{ achievement.icon || getDefaultAchievementIcon(achievement.type) }}</div>
                  <p class="text-sm font-medium truncate" [title]="achievement.name">{{ achievement.name }}</p>
                  <span class="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                        [ngClass]="getAchievementBadgeClass(achievement.rarity)">
                    {{ achievement.rarity }}
                  </span>
                </div>
              </div>

              <div *ngIf="!loadingAchievements && allAchievements.length > 0" class="mt-4 border-t pt-4">
                <h5 class="font-medium text-gray-700 mb-3">Logros Disponibles</h5>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div 
                    *ngFor="let achievement of getLockedAchievements().slice(0, 6)" 
                    class="bg-gray-100 rounded-lg p-3 text-center border border-gray-200 opacity-60">
                    <div class="text-3xl mb-1 grayscale">{{ achievement.icon || getDefaultAchievementIcon(achievement.type) }}</div>
                    <p class="text-sm font-medium truncate text-gray-500" [title]="achievement.name">{{ achievement.name }}</p>
                    <span class="text-xs px-2 py-0.5 rounded-full mt-1 inline-block bg-gray-200 text-gray-600">
                      Bloqueado
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
              routerLink="/dashboard"
              (click)="scrollToAchievements()"
              class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              [ngClass]="{'opacity-100': statisticsUnlocked, 'opacity-70': !statisticsUnlocked}">
              <h3 class="text-lg font-semibold">📊 Statistics</h3>
              <p class="mt-2 text-gray-600">{{ statisticsUnlocked ? 'View your progress and achievements' : 'Unlock statistics above!' }}</p>
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

  // Statistics state
  statisticsUnlocked = false;
  problemStats = {
    total: 0,
    solved: 0,
    successRate: 0
  };
  activityStreak = 0;

  // Achievements
  achievements: Achievement[] = [];
  allAchievements: Achievement[] = [];
  loadingAchievements = false;

  constructor(
    private authService: AuthService,
    private roadmapService: RoadmapService,
    private problemsService: ProblemsService,
    private achievementsService: AchievementsService
  ) { }

  ngOnInit(): void {
    // Load statistics unlock state from localStorage
    this.statisticsUnlocked = localStorage.getItem('statisticsUnlocked') === 'true';

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadRoadmapStats();
        this.loadAchievements();
        if (this.statisticsUnlocked) {
          this.loadProblemStats();
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

        // Calculate activity streak based on roadmap updates
        this.calculateActivityStreak(nodes);
      },
      error: (err) => {
        console.error('Error loading roadmap stats:', err);
      }
    });
  }

  loadProblemStats(): void {
    if (!this.currentUser) return;

    this.problemsService.getPersonalProblems(this.currentUser.id).subscribe({
      next: (response) => {
        const problems = response.data.problems;
        this.problemStats.total = problems.length;
        this.problemStats.solved = problems.filter(p => p.status === 'ac').length;
        this.problemStats.successRate = this.problemStats.total > 0 
          ? Math.round((this.problemStats.solved / this.problemStats.total) * 100)
          : 0;
      },
      error: (err) => {
        console.error('Error loading problem stats:', err);
      }
    });
  }

  loadAchievements(): void {
    if (!this.currentUser) return;

    this.loadingAchievements = true;

    // Load all achievements first
    this.achievementsService.getAchievements().subscribe({
      next: (response) => {
        this.allAchievements = response.data.achievements;
        
        // Then load user's unlocked achievements
        this.achievementsService.getUserAchievements(this.currentUser!.id).subscribe({
          next: (userResponse) => {
            this.achievements = userResponse.data.achievements;
            this.loadingAchievements = false;
          },
          error: (err) => {
            console.error('Error loading user achievements:', err);
            this.loadingAchievements = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading achievements:', err);
        this.loadingAchievements = false;
      }
    });
  }

  calculateActivityStreak(nodes: PersonalNode[]): void {
    // Calculate how many days the user has been active this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const activeDays = new Set<string>();
    nodes.forEach(node => {
      const updatedDate = new Date(node.updatedAt);
      if (updatedDate >= startOfMonth) {
        activeDays.add(updatedDate.toDateString());
      }
    });
    
    this.activityStreak = activeDays.size;
  }

  unlockStatistics(): void {
    this.statisticsUnlocked = true;
    localStorage.setItem('statisticsUnlocked', 'true');
    this.loadProblemStats();
  }

  scrollToAchievements(): void {
    // Scroll to the achievements section
    const element = document.querySelector('.bg-white.rounded-lg.shadow-lg');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getLockedAchievements(): Achievement[] {
    const unlockedIds = new Set(this.achievements.map(a => a._id));
    return this.allAchievements.filter(a => !unlockedIds.has(a._id));
  }

  getAchievementClass(rarity: string): string {
    const classes: { [key: string]: string } = {
      'common': 'from-gray-50 to-gray-100 border-gray-300',
      'rare': 'from-blue-50 to-blue-100 border-blue-300',
      'epic': 'from-purple-50 to-purple-100 border-purple-300',
      'legendary': 'from-yellow-50 to-amber-100 border-yellow-400'
    };
    return classes[rarity] || classes['common'];
  }

  getAchievementBadgeClass(rarity: string): string {
    const classes: { [key: string]: string } = {
      'common': 'bg-gray-200 text-gray-700',
      'rare': 'bg-blue-200 text-blue-700',
      'epic': 'bg-purple-200 text-purple-700',
      'legendary': 'bg-yellow-200 text-yellow-700'
    };
    return classes[rarity] || classes['common'];
  }

  getDefaultAchievementIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'problem-solving': '💡',
      'contest': '🏆',
      'streak': '🔥',
      'rating': '⭐',
      'contribution': '🤝',
      'special': '🎁'
    };
    return icons[type] || '🎖️';
  }
}
