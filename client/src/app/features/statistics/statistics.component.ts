import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';
import { RoadmapService, PersonalNode } from '../../core/services/roadmap.service';
import { ProblemsService } from '../../core/services/problems.service';
import { AchievementsService, Achievement } from '../../core/services/achievements.service';
import { CustomAchievementsService, CustomAchievement, CreateCustomAchievementData } from '../../core/services/custom-achievements.service';
import { TeamService, TeamConfig } from '../../core/services/team.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">📊 Estadísticas y Logros</h2>
            <a routerLink="/dashboard" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
              Volver al Dashboard
            </a>
          </div>

          <!-- Success/Error Messages -->
          <div *ngIf="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ successMessage }}
          </div>
          <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ errorMessage }}
          </div>

          <!-- Roadmap Statistics -->
          <div *ngIf="roadmapStats" class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <h3 class="text-xl font-bold mb-4">📈 Tu Progreso en el Roadmap</h3>
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
              <div class="bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
                <div class="bg-white h-3 rounded-full transition-all duration-500" [style.width.%]="roadmapStats.averageProgress"></div>
              </div>
            </div>
          </div>

          <!-- Problem Statistics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">📈</span>
                <h4 class="font-semibold text-gray-800">Codeforces</h4>
              </div>
              <p class="text-2xl font-bold text-blue-600">{{ currentUser?.codeforcesHandle || 'Sin handle' }}</p>
              <p class="text-sm text-gray-600">Handle vinculado</p>
            </div>

            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">✅</span>
                <h4 class="font-semibold text-gray-800">Ejercicios Resueltos</h4>
              </div>
              <p class="text-2xl font-bold text-green-600">{{ problemStats.solved }}</p>
              <p class="text-sm text-gray-600">de {{ problemStats.total }} totales</p>
            </div>

            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">🔥</span>
                <h4 class="font-semibold text-gray-800">Actividad</h4>
              </div>
              <p class="text-2xl font-bold text-orange-600">{{ activityStreak }}</p>
              <p class="text-sm text-gray-600">Días activo este mes</p>
            </div>
          </div>

          <!-- System Achievements Section -->
          <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">🎖️ Logros del Sistema</h3>
            <p class="text-sm text-gray-500 mb-4">
              Los logros del sistema son reconocimientos automáticos que se desbloquean al alcanzar ciertos hitos, 
              como resolver un número específico de problemas, participar en contests, o mantener una racha de actividad.
              Actualmente, el sistema de logros automáticos está en desarrollo. Por ahora, puedes crear tus propios logros personalizados abajo.
            </p>
            
            <div *ngIf="loadingAchievements" class="text-center py-4">
              <p class="text-gray-500">Cargando logros...</p>
            </div>

            <div *ngIf="!loadingAchievements && systemAchievements.length === 0" class="text-center py-4">
              <p class="text-gray-500">¡Aún no has desbloqueado logros del sistema! Sigue practicando para ganar medallas automáticas.</p>
            </div>

            <div *ngIf="!loadingAchievements && systemAchievements.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div 
                *ngFor="let achievement of systemAchievements" 
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
          </div>

          <!-- Custom Achievements (Logros) Section -->
          <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold text-gray-800">🏆 Mis Logros Personalizados</h3>
              <button 
                (click)="openCreateAchievementModal()"
                class="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                <span>➕</span>
                Nuevo Logro
              </button>
            </div>

            <!-- Filter tabs -->
            <div class="flex gap-2 mb-4">
              <button 
                (click)="filterAchievements = 'all'"
                [ngClass]="{'bg-blue-500 text-white': filterAchievements === 'all', 'bg-gray-200 text-gray-700': filterAchievements !== 'all'}"
                class="px-4 py-2 rounded-lg text-sm font-medium">
                Todos
              </button>
              <button 
                (click)="filterAchievements = 'personal'"
                [ngClass]="{'bg-blue-500 text-white': filterAchievements === 'personal', 'bg-gray-200 text-gray-700': filterAchievements !== 'personal'}"
                class="px-4 py-2 rounded-lg text-sm font-medium">
                Personales
              </button>
              <button 
                (click)="filterAchievements = 'team'"
                [ngClass]="{'bg-blue-500 text-white': filterAchievements === 'team', 'bg-gray-200 text-gray-700': filterAchievements !== 'team'}"
                class="px-4 py-2 rounded-lg text-sm font-medium">
                Del Equipo
              </button>
            </div>

            <!-- Category filter -->
            <div class="flex gap-2 mb-4">
              <button 
                (click)="filterCategory = 'all'"
                [ngClass]="{'bg-purple-500 text-white': filterCategory === 'all', 'bg-gray-200 text-gray-700': filterCategory !== 'all'}"
                class="px-3 py-1 rounded-lg text-xs font-medium">
                Todas las Categorías
              </button>
              <button 
                (click)="filterCategory = 'rating'"
                [ngClass]="{'bg-purple-500 text-white': filterCategory === 'rating', 'bg-gray-200 text-gray-700': filterCategory !== 'rating'}"
                class="px-3 py-1 rounded-lg text-xs font-medium">
                ⭐ Rating
              </button>
              <button 
                (click)="filterCategory = 'contest'"
                [ngClass]="{'bg-purple-500 text-white': filterCategory === 'contest', 'bg-gray-200 text-gray-700': filterCategory !== 'contest'}"
                class="px-3 py-1 rounded-lg text-xs font-medium">
                🏆 Contest
              </button>
            </div>

            <div *ngIf="loadingCustomAchievements" class="text-center py-4">
              <p class="text-gray-500">Cargando logros personalizados...</p>
            </div>

            <div *ngIf="!loadingCustomAchievements && getFilteredAchievements().length === 0" class="text-center py-8">
              <p class="text-gray-500 mb-2">No hay logros en esta categoría.</p>
              <p class="text-sm text-gray-400">¡Crea tu primer logro para guardar tus recuerdos e inspiración!</p>
            </div>

            <div *ngIf="!loadingCustomAchievements && getFilteredAchievements().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                *ngFor="let achievement of getFilteredAchievements()" 
                class="bg-gradient-to-br rounded-lg p-4 border-2 relative"
                [ngClass]="achievement.scope === 'team' ? 'from-blue-50 to-blue-100 border-blue-300' : 'from-yellow-50 to-orange-100 border-yellow-300'">
                
                <!-- Scope badge -->
                <div class="absolute top-2 right-2">
                  <span 
                    class="text-xs px-2 py-1 rounded-full"
                    [ngClass]="achievement.scope === 'team' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'">
                    {{ achievement.scope === 'team' ? '👥 Equipo' : '👤 Personal' }}
                  </span>
                </div>

                <!-- Photo -->
                <div *ngIf="achievement.photo" class="mb-3">
                  <img 
                    [src]="achievement.photo" 
                    [alt]="achievement.name"
                    class="w-full h-32 object-cover rounded-lg">
                </div>

                <!-- Category icon -->
                <div class="text-3xl mb-2">
                  {{ achievement.category === 'rating' ? '⭐' : '🏆' }}
                </div>

                <h4 class="font-bold text-gray-800 mb-1">{{ achievement.name }}</h4>
                <p class="text-sm text-gray-600 mb-2 truncate" [title]="achievement.description">{{ achievement.description }}</p>

                <div class="text-xs text-gray-500 mb-2">
                  <span>📅 {{ achievement.achievedAt | date:'mediumDate' }}</span>
                  <span class="ml-2">por {{ achievement.createdBy?.username }}</span>
                </div>

                <div *ngIf="achievement.scope === 'team' && achievement.teamId" class="text-xs text-blue-600 mb-2">
                  🏢 {{ achievement.teamId.name }}
                </div>

                <!-- Actions (only show for editable achievements) -->
                <div *ngIf="canEditAchievement(achievement)" class="flex gap-2 mt-3">
                  <button 
                    (click)="openEditAchievementModal(achievement)"
                    class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                    Editar
                  </button>
                  <button 
                    (click)="deleteAchievement(achievement)"
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Achievement Modal -->
      <div 
        *ngIf="showAchievementModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="closeAchievementModal()">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-bold mb-4">
            {{ editingAchievement ? 'Editar Logro' : 'Nuevo Logro' }}
          </h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input 
                type="text"
                [(ngModel)]="achievementFormData.name"
                class="w-full border rounded-lg px-3 py-2"
                placeholder="Ej: Primer Top 100 en Codeforces"
                maxlength="100">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea 
                [(ngModel)]="achievementFormData.description"
                class="w-full border rounded-lg px-3 py-2"
                rows="3"
                placeholder="Describe el logro y por qué es especial para ti"
                maxlength="500"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL de Foto (opcional)</label>
              <input 
                type="url"
                [(ngModel)]="achievementFormData.photo"
                class="w-full border rounded-lg px-3 py-2"
                placeholder="https://ejemplo.com/foto.jpg">
              <p class="text-xs text-gray-500 mt-1">Puedes usar una URL de imagen externa</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <div class="flex gap-2">
                <button 
                  type="button"
                  (click)="achievementFormData.category = 'rating'"
                  [ngClass]="{'bg-purple-500 text-white': achievementFormData.category === 'rating', 'bg-gray-200 text-gray-700': achievementFormData.category !== 'rating'}"
                  class="flex-1 px-4 py-2 rounded-lg font-medium">
                  ⭐ Rating
                </button>
                <button 
                  type="button"
                  (click)="achievementFormData.category = 'contest'"
                  [ngClass]="{'bg-purple-500 text-white': achievementFormData.category === 'contest', 'bg-gray-200 text-gray-700': achievementFormData.category !== 'contest'}"
                  class="flex-1 px-4 py-2 rounded-lg font-medium">
                  🏆 Contest
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <div class="flex gap-2">
                <button 
                  type="button"
                  (click)="achievementFormData.scope = 'personal'"
                  [ngClass]="{'bg-yellow-500 text-white': achievementFormData.scope === 'personal', 'bg-gray-200 text-gray-700': achievementFormData.scope !== 'personal'}"
                  class="flex-1 px-4 py-2 rounded-lg font-medium">
                  👤 Personal
                </button>
                <button 
                  type="button"
                  (click)="achievementFormData.scope = 'team'"
                  [ngClass]="{'bg-blue-500 text-white': achievementFormData.scope === 'team', 'bg-gray-200 text-gray-700': achievementFormData.scope !== 'team'}"
                  class="flex-1 px-4 py-2 rounded-lg font-medium">
                  👥 Equipo
                </button>
              </div>
            </div>

            <div *ngIf="achievementFormData.scope === 'team'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar Equipo *</label>
              <select 
                [(ngModel)]="achievementFormData.teamId"
                class="w-full border rounded-lg px-3 py-2">
                <option value="">-- Selecciona un equipo --</option>
                <option *ngFor="let team of userTeams" [value]="team._id">
                  {{ team.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha del Logro</label>
              <input 
                type="date"
                [(ngModel)]="achievementFormData.achievedAt"
                class="w-full border rounded-lg px-3 py-2">
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="closeAchievementModal()"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
              Cancelar
            </button>
            <button 
              (click)="saveAchievement()"
              [disabled]="savingAchievement || !isAchievementFormValid()"
              class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300">
              {{ savingAchievement ? 'Guardando...' : (editingAchievement ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class StatisticsComponent implements OnInit {
  private readonly PROBLEM_STATUS_ACCEPTED = 'ac' as const;

  currentUser: User | null = null;

  // Roadmap stats
  roadmapStats: {
    total: number;
    inProgress: number;
    completed: number;
    averageProgress: number;
  } | null = null;

  // Problem stats
  problemStats = {
    total: 0,
    solved: 0
  };
  activityStreak = 0;

  // System achievements
  systemAchievements: Achievement[] = [];
  loadingAchievements = false;

  // Custom achievements
  customAchievements: CustomAchievement[] = [];
  loadingCustomAchievements = false;
  filterAchievements: 'all' | 'personal' | 'team' = 'all';
  filterCategory: 'all' | 'rating' | 'contest' = 'all';

  // Achievement modal
  showAchievementModal = false;
  editingAchievement: CustomAchievement | null = null;
  savingAchievement = false;
  achievementFormData: {
    name: string;
    description: string;
    photo: string;
    category: 'rating' | 'contest';
    scope: 'personal' | 'team';
    teamId: string;
    achievedAt: string;
  } = {
    name: '',
    description: '',
    photo: '',
    category: 'contest',
    scope: 'personal',
    teamId: '',
    achievedAt: ''
  };

  // Teams
  userTeams: TeamConfig[] = [];

  // Messages
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private roadmapService: RoadmapService,
    private problemsService: ProblemsService,
    private achievementsService: AchievementsService,
    private customAchievementsService: CustomAchievementsService,
    private teamService: TeamService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadRoadmapStats();
        this.loadProblemStats();
        this.loadSystemAchievements();
        this.loadCustomAchievements();
        this.loadUserTeams();
      }
    });
  }

  // Stats loading methods
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

        this.roadmapStats = { total, inProgress, completed, averageProgress };
        this.calculateActivityStreak(nodes);
      },
      error: (err) => console.error('Error loading roadmap stats:', err)
    });
  }

  loadProblemStats(): void {
    if (!this.currentUser) return;

    this.problemsService.getPersonalProblems(this.currentUser.id).subscribe({
      next: (response) => {
        const problems = response.data.problems;
        this.problemStats.total = problems.length;
        this.problemStats.solved = problems.filter(p => p.status === this.PROBLEM_STATUS_ACCEPTED).length;
      },
      error: (err) => console.error('Error loading problem stats:', err)
    });
  }

  calculateActivityStreak(nodes: PersonalNode[]): void {
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

  loadSystemAchievements(): void {
    if (!this.currentUser) return;

    this.loadingAchievements = true;
    this.achievementsService.getUserAchievements(this.currentUser.id).subscribe({
      next: (response) => {
        this.systemAchievements = response.data.achievements;
        this.loadingAchievements = false;
      },
      error: (err) => {
        console.error('Error loading system achievements:', err);
        this.loadingAchievements = false;
      }
    });
  }

  loadCustomAchievements(): void {
    this.loadingCustomAchievements = true;
    this.customAchievementsService.getCustomAchievements().subscribe({
      next: (response) => {
        this.customAchievements = response.data.achievements;
        this.loadingCustomAchievements = false;
      },
      error: (err) => {
        console.error('Error loading custom achievements:', err);
        this.loadingCustomAchievements = false;
      }
    });
  }

  loadUserTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (response) => {
        // Filter teams where current user is an active member
        this.userTeams = response.data.teams.filter(team => 
          team.members.some(m => {
            const memberId = this.extractUserId(m.userId);
            return memberId === this.currentUser?.id && m.isActive === true;
          })
        );
      },
      error: (err) => console.error('Error loading teams:', err)
    });
  }

  /**
   * Extract user ID from a populated or non-populated userId field
   */
  private extractUserId(userId: any): string | null {
    if (!userId) return null;
    if (typeof userId === 'string') return userId;
    if (typeof userId === 'object' && userId._id) return userId._id;
    return null;
  }

  // Custom achievements methods
  getFilteredAchievements(): CustomAchievement[] {
    return this.customAchievements.filter(a => {
      const scopeMatch = this.filterAchievements === 'all' || a.scope === this.filterAchievements;
      const categoryMatch = this.filterCategory === 'all' || a.category === this.filterCategory;
      return scopeMatch && categoryMatch;
    });
  }

  canEditAchievement(achievement: CustomAchievement): boolean {
    if (!this.currentUser) return false;
    
    if (achievement.scope === 'personal') {
      return achievement.createdBy._id === this.currentUser.id;
    } else {
      // For team achievements, check if user is active member
      return this.userTeams.some(t => t._id === achievement.teamId?._id);
    }
  }

  openCreateAchievementModal(): void {
    this.editingAchievement = null;
    this.achievementFormData = {
      name: '',
      description: '',
      photo: '',
      category: 'contest',
      scope: 'personal',
      teamId: '',
      achievedAt: new Date().toISOString().split('T')[0]
    };
    this.showAchievementModal = true;
  }

  openEditAchievementModal(achievement: CustomAchievement): void {
    this.editingAchievement = achievement;
    this.achievementFormData = {
      name: achievement.name,
      description: achievement.description,
      photo: achievement.photo || '',
      category: achievement.category,
      scope: achievement.scope,
      teamId: achievement.teamId?._id || '',
      achievedAt: new Date(achievement.achievedAt).toISOString().split('T')[0]
    };
    this.showAchievementModal = true;
  }

  closeAchievementModal(): void {
    this.showAchievementModal = false;
    this.editingAchievement = null;
  }

  isAchievementFormValid(): boolean {
    const { name, description, category, scope, teamId } = this.achievementFormData;
    if (!name || !description || !category || !scope) return false;
    if (scope === 'team' && !teamId) return false;
    return true;
  }

  saveAchievement(): void {
    if (!this.isAchievementFormValid()) return;

    this.savingAchievement = true;
    const data: CreateCustomAchievementData = {
      name: this.achievementFormData.name,
      description: this.achievementFormData.description,
      photo: this.achievementFormData.photo || undefined,
      category: this.achievementFormData.category,
      scope: this.achievementFormData.scope,
      teamId: this.achievementFormData.scope === 'team' ? this.achievementFormData.teamId : undefined,
      achievedAt: this.achievementFormData.achievedAt ? new Date(this.achievementFormData.achievedAt) : undefined
    };

    if (this.editingAchievement) {
      this.customAchievementsService.updateCustomAchievement(this.editingAchievement._id, data).subscribe({
        next: () => {
          this.savingAchievement = false;
          this.closeAchievementModal();
          this.loadCustomAchievements();
          this.showSuccess('Logro actualizado correctamente');
        },
        error: (err) => {
          this.savingAchievement = false;
          this.showError(err.error?.message || 'Error al actualizar el logro');
        }
      });
    } else {
      this.customAchievementsService.createCustomAchievement(data).subscribe({
        next: () => {
          this.savingAchievement = false;
          this.closeAchievementModal();
          this.loadCustomAchievements();
          this.showSuccess('Logro creado correctamente');
        },
        error: (err) => {
          this.savingAchievement = false;
          this.showError(err.error?.message || 'Error al crear el logro');
        }
      });
    }
  }

  deleteAchievement(achievement: CustomAchievement): void {
    if (!confirm('¿Estás seguro de eliminar este logro?')) return;

    this.customAchievementsService.deleteCustomAchievement(achievement._id).subscribe({
      next: () => {
        this.loadCustomAchievements();
        this.showSuccess('Logro eliminado correctamente');
      },
      error: (err) => {
        this.showError(err.error?.message || 'Error al eliminar el logro');
      }
    });
  }

  // Helper methods for system achievements
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

  // Message helpers
  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = null, 5000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = null, 5000);
  }
}
