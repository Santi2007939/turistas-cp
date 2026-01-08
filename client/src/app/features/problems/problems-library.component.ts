import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProblemsService, Problem, PopulatedUser } from '../../core/services/problems.service';
import { AuthService, User } from '../../core/services/auth.service';
import { ThemesService, Theme } from '../../core/services/themes.service';
import { RoadmapService } from '../../core/services/roadmap.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-problems-library',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-deep-sea">Biblioteca de Problemas</h1>
          <button 
            (click)="openAddProblemModal()"
            class="bg-electric-blue hover:opacity-90 text-deep-sea font-bold py-2 px-4 rounded-kinetic">
            Agregar Problema
          </button>
        </div>

      <!-- Subtopic Filter Banner -->
      <div *ngIf="subtopicFilter" class="mb-6 bg-electric-blue/10 border-l-4 border-electric-blue rounded-kinetic p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xl text-icon-gray">🎯</span>
            <div>
              <h3 class="font-bold text-deep-sea">Filtrando por subtema</h3>
              <p class="text-sm text-icon-gray">{{ subtopicName || 'Cargando...' }}</p>
            </div>
          </div>
          <button 
            (click)="clearSubtopicFilter()"
            class="bg-deep-sea hover:opacity-90 text-white px-4 py-2 rounded-kinetic text-sm font-medium">
            ✕ Limpiar filtro
          </button>
        </div>
      </div>

      <!-- Selector for problem view -->
      <div class="mb-6 flex gap-4 items-center">
        <label class="font-bold text-deep-sea">Ver:</label>
        <select 
          [(ngModel)]="selectedView"
          (change)="onViewChange()"
          class="border border-card-border rounded-kinetic px-4 py-2 bg-white focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20">
          <option value="personal">Mi cuenta</option>
          <option value="team">Equipo</option>
          <option value="members">Miembros</option>
        </select>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p class="text-icon-gray">Cargando problemas...</p>
      </div>

      <div *ngIf="error" class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-kinetic mb-4">
        {{ error }}
      </div>

      <!-- Problems Grid - New Design -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let problem of problems" 
          class="bg-card-bg border border-card-border rounded-kinetic p-6 hover:border-electric-blue transition-colors border-l-4"
          [ngClass]="{
            'border-l-card-border': problem.status === 'pending',
            'border-l-green-500': problem.status === 'ac',
            'border-l-red-500': problem.status === 'wa'
          }">
          
          <!-- Problem Header -->
          <div class="mb-4">
            <div class="flex justify-between items-start mb-2">
              <h2 class="text-lg font-bold text-deep-sea flex-1">{{ problem.title }}</h2>
            </div>
            
            <!-- Rating and Status Row -->
            <div class="flex gap-2 items-center mb-3">
              <span 
                *ngIf="problem.rating"
                class="px-3 py-1 text-sm font-bold rounded-kinetic bg-card-border text-deep-sea">
                ★ {{ problem.rating }}
              </span>
              
              <select
                *ngIf="canEdit(problem)"
                [(ngModel)]="problem.status"
                (change)="updateProblemStatus(problem)"
                class="px-3 py-1 text-sm rounded-kinetic border border-card-border"
                [ngClass]="{
                  'bg-white text-icon-gray': problem.status === 'pending',
                  'bg-green-100 text-green-800': problem.status === 'ac',
                  'bg-red-100 text-red-800': problem.status === 'wa'
                }">
                <option value="pending">Pendiente</option>
                <option value="ac">AC</option>
                <option value="wa">WA</option>
              </select>
              
              <span
                *ngIf="!canEdit(problem)"
                class="px-3 py-1 text-sm rounded-kinetic"
                [ngClass]="{
                  'bg-card-border text-icon-gray': problem.status === 'pending',
                  'bg-green-100 text-green-800': problem.status === 'ac',
                  'bg-red-100 text-red-800': problem.status === 'wa'
                }">
                {{ problem.status === 'pending' ? 'Pendiente' : problem.status === 'ac' ? 'AC' : 'WA' }}
              </span>
            </div>

            <!-- Platform Badge -->
            <div class="mb-3">
              <span class="bg-electric-blue/10 text-electric-blue text-xs px-2 py-1 rounded-kinetic font-medium">
                {{ problem.platform }}
              </span>
              <span 
                *ngIf="problem.owner === 'personal'"
                class="bg-card-border text-icon-gray text-xs px-2 py-1 rounded-kinetic ml-2 font-medium">
                Personal
              </span>
              <span 
                *ngIf="problem.owner === 'team'"
                class="bg-deep-sea text-white text-xs px-2 py-1 rounded-kinetic ml-2 font-medium">
                Equipo
              </span>
            </div>


          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-4">
            <a 
              [routerLink]="['/problems', problem._id]"
              class="flex-1 bg-electric-blue hover:opacity-90 text-deep-sea px-4 py-2 rounded-kinetic text-sm text-center font-medium">
              Ver Detalles
            </a>
            <a 
              *ngIf="problem.url"
              [href]="problem.url" 
              target="_blank"
              class="bg-deep-sea hover:opacity-90 text-white px-3 py-2 rounded-kinetic text-sm">
              🔗
            </a>
            <button 
              *ngIf="canEdit(problem)"
              (click)="openEditProblemModal(problem)"
              class="bg-icon-gray hover:opacity-90 text-white px-3 py-2 rounded-kinetic text-sm">
              ✎
            </button>
          </div>

          <div *ngIf="problem.createdBy" class="mt-3 text-xs text-icon-gray">
            Creado por: {{ getCreatorName(problem) }}
          </div>
        </div>
      </div>

      <div *ngIf="!loading && problems.length === 0" class="text-center py-12">
        <p class="text-icon-gray text-lg mb-4">No hay problemas en esta vista.</p>
        <button 
          *ngIf="selectedView === 'personal'"
          (click)="openAddProblemModal()"
          class="bg-electric-blue hover:opacity-90 text-deep-sea font-bold py-2 px-4 rounded-kinetic">
          Agregar Primer Problema
        </button>
      </div>

      <!-- Add/Edit Problem Modal -->
      <div 
        *ngIf="showAddProblemModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white border border-card-border rounded-kinetic p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-bold text-deep-sea mb-4">
            {{ editingProblem ? 'Editar Problema' : 'Agregar Problema' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-deep-sea text-sm font-bold mb-2">Título *</label>
              <input 
                type="text"
                [(ngModel)]="newProblem.title"
                class="w-full border border-card-border rounded-kinetic px-3 py-2 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20"
                placeholder="Nombre del problema">
            </div>

            <!-- URL Field (optional for all platforms) -->
            <div>
              <label class="block text-deep-sea text-sm font-bold mb-2">
                URL del Problema (Opcional)
              </label>
              <input 
                type="url"
                [(ngModel)]="newProblem.url"
                (ngModelChange)="onUrlChange()"
                class="w-full border border-card-border rounded-kinetic px-3 py-2 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20"
                [class.border-red-500]="urlValidationError && !isUrlWarning"
                [class.border-yellow-500]="urlValidationError && isUrlWarning"
                placeholder="https://codeforces.com/problemset/problem/1234/A">
              <p *ngIf="urlValidationError" 
                 class="text-xs mt-1"
                 [class.text-red-600]="!isUrlWarning"
                 [class.text-yellow-600]="isUrlWarning">
                {{ urlValidationError }}
              </p>
              <p class="text-xs text-icon-gray mt-1">
                La plataforma se detectará automáticamente desde la URL.
              </p>
            </div>

            <div>
              <label class="block text-deep-sea text-sm font-bold mb-2">Plataforma</label>
              <select 
                [(ngModel)]="newProblem.platform"
                class="w-full border border-card-border rounded-kinetic px-3 py-2 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20"
                [disabled]="!!editingProblem">
                <option value="codeforces">Codeforces</option>
                <option value="atcoder">AtCoder</option>
                <option value="leetcode">LeetCode</option>
                <option value="hackerrank">HackerRank</option>
                <option value="cses">CSES</option>
                <option value="uva">UVa</option>
                <option value="spoj">SPOJ</option>
                <option value="custom">Custom</option>
                <option value="other">Other</option>
              </select>
            </div>

            <!-- Codeforces Auto-Fetch Button (shown when platform is Codeforces) -->
            <div *ngIf="!editingProblem && newProblem.platform === 'codeforces' && newProblem.url" 
                 class="bg-electric-blue/10 border border-electric-blue rounded-kinetic p-4">
              <p class="text-sm text-deep-sea mb-2">
                ¿Quieres obtener automáticamente los datos de este problema de Codeforces?
              </p>
              <button 
                (click)="fetchCodeforcesData()"
                [disabled]="fetchingCodeforces || !!urlValidationError"
                class="bg-electric-blue hover:opacity-90 text-deep-sea px-4 py-2 rounded-kinetic disabled:bg-gray-300 w-full font-medium">
                {{ fetchingCodeforces ? 'Obteniendo datos...' : '🔄 Obtener Datos de Codeforces' }}
              </button>
              <p class="text-xs text-icon-gray mt-2">
                Esto llenará automáticamente el título, rating y otros detalles.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-deep-sea text-sm font-bold mb-2">Rating</label>
                <input 
                  type="number"
                  [(ngModel)]="newProblem.rating"
                  class="w-full border border-card-border rounded-kinetic px-3 py-2 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20"
                  placeholder="800, 1200, 1600...">
              </div>

              <div>
                <label class="block text-deep-sea text-sm font-bold mb-2">Estado</label>
                <select 
                  [(ngModel)]="newProblem.status"
                  class="w-full border border-card-border rounded-kinetic px-3 py-2 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20">
                  <option value="pending">Pendiente</option>
                  <option value="ac">AC</option>
                  <option value="wa">WA</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-deep-sea text-sm font-bold mb-2">Owner</label>
              <select 
                [(ngModel)]="newProblem.owner"
                class="w-full border border-card-border rounded-kinetic px-3 py-2 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20">
                <option value="personal">Personal</option>
                <option value="team">Equipo</option>
              </select>
            </div>

            <!-- Themes Section -->
            <div class="border border-card-border rounded-kinetic p-4 bg-card-bg">
              <label class="block text-deep-sea text-sm font-bold mb-3">Temas y Subtemas</label>
              
              <div class="space-y-3">
                <div *ngFor="let themeAssoc of newProblem.themes; let i = index" class="border border-card-border rounded-kinetic p-3 bg-white">
                  <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                      <select 
                        [(ngModel)]="themeAssoc.themeId"
                        (change)="onModalThemeChange(i)"
                        class="w-full border border-card-border rounded-kinetic px-3 py-2 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20">
                        <option value="">Seleccionar tema...</option>
                        <option *ngFor="let theme of availableThemes" [value]="theme._id">
                          {{ theme.name }}
                        </option>
                      </select>
                    </div>
                    <button 
                      (click)="removeModalTheme(i)"
                      class="ml-2 text-red-500 hover:text-red-600">
                      ✕
                    </button>
                  </div>

                  <div *ngIf="themeAssoc.themeId && getModalThemeSubthemes(themeAssoc.themeId).length > 0" class="mt-2">
                    <label class="block text-xs text-icon-gray mb-2">Subtemas:</label>
                    <div class="space-y-1">
                      <label 
                        *ngFor="let subtheme of getModalThemeSubthemes(themeAssoc.themeId)"
                        class="flex items-center gap-2 text-sm text-deep-sea">
                        <input 
                          type="checkbox"
                          [checked]="isModalSubthemeSelected(i, subtheme.name)"
                          (change)="toggleModalSubtheme(i, subtheme.name)"
                          class="rounded-kinetic">
                        <span>{{ subtheme.name }}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  (click)="addModalThemeAssociation()"
                  class="w-full border-2 border-dashed border-card-border rounded-kinetic py-2 text-icon-gray hover:border-electric-blue hover:text-electric-blue transition-colors text-sm">
                  + Agregar Tema
                </button>
              </div>
            </div>


          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="cancelAddProblem()"
              class="bg-icon-gray hover:opacity-90 text-white px-4 py-2 rounded-kinetic font-medium">
              Cancelar
            </button>
            <button 
              (click)="saveProblem()"
              [disabled]="!newProblem.title"
              class="bg-electric-blue hover:opacity-90 text-deep-sea px-4 py-2 rounded-kinetic font-medium disabled:bg-gray-300">
              {{ editingProblem ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProblemsLibraryComponent implements OnInit {
  problems: Problem[] = [];
  selectedView: 'personal' | 'team' | 'members' = 'personal';
  loading = false;
  error: string | null = null;
  currentUser: User | null = null;
  showAddProblemModal = false;
  
  newProblem: {
    title: string;
    platform: string;
    url: string;
    owner: string;
    rating: number | null;
    status: string;
    themes: any[];
  } = {
    title: '',
    platform: 'codeforces',
    url: '',
    owner: 'personal',
    rating: null,
    status: 'pending',
    themes: []
  };
  
  fetchingCodeforces = false;
  editingProblem: Problem | null = null;
  availableThemes: Theme[] = [];
  urlValidationError: string | null = null;
  isUrlWarning = false;
  subtopicFilter: string | null = null;
  subtopicName: string = '';
  linkedProblemIds: string[] = [];

  constructor(
    private problemsService: ProblemsService,
    private authService: AuthService,
    private themesService: ThemesService,
    private route: ActivatedRoute,
    private router: Router,
    private roadmapService: RoadmapService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadThemes();
      }
    });

    // Check for subtopic filter in query params
    this.route.queryParams.subscribe(params => {
      this.subtopicFilter = params['subtopic'] || null;
      if (this.subtopicFilter) {
        this.loadSubtopicInfo();
      }
      if (this.currentUser) {
        this.loadProblems();
      }
    });
  }

  loadThemes(): void {
    this.themesService.getThemes().subscribe({
      next: (response) => {
        this.availableThemes = response.data.themes;
      },
      error: (err) => {
        console.error('Error loading themes:', err);
      }
    });
  }

  onViewChange(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    if (!this.currentUser) return;

    this.loading = true;
    this.error = null;
    
    let observable;
    
    switch (this.selectedView) {
      case 'personal':
        observable = this.problemsService.getPersonalProblems(this.currentUser.id);
        break;
      case 'team':
        observable = this.problemsService.getTeamProblems();
        break;
      case 'members':
        observable = this.problemsService.getMembersProblems(this.currentUser.id);
        break;
    }

    observable.subscribe({
      next: (response) => {
        let problems = response.data.problems;
        
        // Filter by subtopic if filter is active
        if (this.subtopicFilter) {
          problems = this.filterProblemsBySubtopic(problems);
        }
        
        this.problems = problems;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar problemas. Inténtelo de nuevo.';
        this.loading = false;
        console.error('Error loading problems:', err);
      }
    });
  }

  /**
   * Filter problems that are linked to the selected subtopic
   */
  filterProblemsBySubtopic(problems: Problem[]): Problem[] {
    if (!this.subtopicFilter) return problems;

    if (this.linkedProblemIds.length === 0) return problems;

    // Filter problems to only show those linked to this subtopic
    return problems.filter(p => this.linkedProblemIds.includes(p._id));
  }

  canEdit(problem: Problem): boolean {
    if (!this.currentUser) return false;
    
    // Can edit personal problems created by user or team problems
    if (problem.owner === 'personal') {
      // Check if createdBy is an object with _id or a string
      const createdById = typeof problem.createdBy === 'object' && problem.createdBy !== null
        ? (problem.createdBy as PopulatedUser)._id
        : problem.createdBy;
      return createdById === this.currentUser.id;
    }
    
    // Anyone can edit team problems
    return problem.owner === 'team';
  }

  getCreatorName(problem: Problem): string {
    if (typeof problem.createdBy === 'object' && problem.createdBy !== null) {
      return (problem.createdBy as PopulatedUser).username || 'Usuario';
    }
    return 'Usuario';
  }

  openAddProblemModal(): void {
    this.editingProblem = null;
    this.showAddProblemModal = true;
    this.resetNewProblem();
  }

  openEditProblemModal(problem: Problem): void {
    this.editingProblem = problem;
    this.newProblem = {
      title: problem.title,
      platform: problem.platform,
      url: problem.url || '',
      owner: problem.owner,
      rating: problem.rating || null,
      status: problem.status,
      themes: problem.themes ? JSON.parse(JSON.stringify(problem.themes)) : []
    };
    this.urlValidationError = null;
    this.isUrlWarning = false;
    this.showAddProblemModal = true;
  }

  fetchCodeforcesData(): void {
    if (!this.newProblem.url) return;

    this.fetchingCodeforces = true;
    this.error = null;

    this.problemsService.fetchCodeforcesData(this.newProblem.url).subscribe({
      next: (response) => {
        const problemData = response.data.problem;
        this.newProblem.title = problemData.title;
        this.newProblem.platform = problemData.platform;
        this.newProblem.url = problemData.url || '';
        this.newProblem.rating = problemData.rating || null;
        this.fetchingCodeforces = false;
      },
      error: (err) => {
        this.error = 'Error al obtener datos de Codeforces. Verifica la URL.';
        this.fetchingCodeforces = false;
        console.error('Error fetching Codeforces data:', err);
      }
    });
  }

  saveProblem(): void {
    if (!this.newProblem.title) return;

    // Validate URL if provided
    if (this.newProblem.url) {
      const validation = this.validateUrl(this.newProblem.url);
      if (!validation.valid) {
        this.urlValidationError = validation.message || 'URL inválida';
        return;
      }
    }

    // Filter out themes with no themeId selected
    const validThemes = this.newProblem.themes.filter(t => t.themeId);

    const problemData: any = {
      title: this.newProblem.title,
      platform: this.newProblem.platform,
      url: this.normalizeUrl(this.newProblem.url),
      owner: this.newProblem.owner,
      rating: this.newProblem.rating,
      status: this.newProblem.status,
      themes: validThemes
    };

    if (this.editingProblem) {
      // Update existing problem
      this.problemsService.updateProblem(this.editingProblem._id, problemData).subscribe({
        next: () => {
          this.showAddProblemModal = false;
          this.resetNewProblem();
          this.editingProblem = null;
          this.loadProblems();
        },
        error: (err) => {
          this.error = 'Error al actualizar problema.';
          console.error('Error updating problem:', err);
        }
      });
    } else {
      // Create new problem
      this.problemsService.createProblem(problemData).subscribe({
        next: () => {
          this.showAddProblemModal = false;
          this.resetNewProblem();
          this.loadProblems();
        },
        error: (err) => {
          this.error = 'Error al crear problema.';
          console.error('Error creating problem:', err);
        }
      });
    }
  }

  updateProblemStatus(problem: Problem): void {
    if (!this.canEdit(problem)) return;

    this.problemsService.updateProblem(problem._id, { status: problem.status }).subscribe({
      next: () => {
        // Status updated successfully
      },
      error: (err) => {
        this.error = 'Error al actualizar estado.';
        console.error('Error updating status:', err);
        this.loadProblems(); // Reload to revert changes
      }
    });
  }



  cancelAddProblem(): void {
    this.showAddProblemModal = false;
    this.resetNewProblem();
    this.editingProblem = null;
    this.urlValidationError = null;
    this.isUrlWarning = false;
  }

  resetNewProblem(): void {
    this.newProblem = {
      title: '',
      platform: 'codeforces',
      url: '',
      owner: 'personal',
      rating: null,
      status: 'pending',
      themes: []
    };
    this.urlValidationError = null;
    this.isUrlWarning = false;
  }

  // Theme management methods for modal
  getModalThemeSubthemes(themeId: string): any[] {
    const theme = this.availableThemes.find(t => t._id === themeId);
    return theme?.subthemes || [];
  }

  isModalSubthemeSelected(themeIndex: number, subthemeName: string): boolean {
    return this.newProblem.themes[themeIndex]?.subthemes?.includes(subthemeName) || false;
  }

  toggleModalSubtheme(themeIndex: number, subthemeName: string): void {
    if (!this.newProblem.themes[themeIndex]) return;
    
    if (!this.newProblem.themes[themeIndex].subthemes) {
      this.newProblem.themes[themeIndex].subthemes = [];
    }
    
    const index = this.newProblem.themes[themeIndex].subthemes.indexOf(subthemeName);
    if (index > -1) {
      this.newProblem.themes[themeIndex].subthemes.splice(index, 1);
    } else {
      this.newProblem.themes[themeIndex].subthemes.push(subthemeName);
    }
  }

  onModalThemeChange(index: number): void {
    // Reset subthemes when theme changes
    this.newProblem.themes[index].subthemes = [];
  }

  addModalThemeAssociation(): void {
    this.newProblem.themes.push({ themeId: '', subthemes: [] });
  }

  removeModalTheme(index: number): void {
    this.newProblem.themes.splice(index, 1);
  }

  /**
   * Normalize URL by trimming whitespace and returning undefined for empty strings
   */
  normalizeUrl(url: string | null | undefined): string | undefined {
    return url?.trim() || undefined;
  }

  /**
   * Detect platform from URL
   */
  detectPlatformFromUrl(url: string): string | null {
    if (!url) return null;

    const platformPatterns = [
      { pattern: /^https?:\/\/(www\.)?codeforces\.com\//i, platform: 'codeforces' },
      { pattern: /^https?:\/\/(www\.)?atcoder\.jp\//i, platform: 'atcoder' },
      { pattern: /^https?:\/\/(www\.)?leetcode\.com\//i, platform: 'leetcode' },
      { pattern: /^https?:\/\/(www\.)?hackerrank\.com\//i, platform: 'hackerrank' },
      { pattern: /^https?:\/\/(www\.)?cses\.fi\//i, platform: 'cses' },
      { pattern: /^https?:\/\/(www\.)?uva\.onlinejudge\.org\//i, platform: 'uva' },
      { pattern: /^https?:\/\/(www\.)?spoj\.com\//i, platform: 'spoj' }
    ];

    for (const { pattern, platform } of platformPatterns) {
      if (pattern.test(url)) {
        return platform;
      }
    }

    return null;
  }

  /**
   * Validate URL format for known platforms
   */
  validateUrl(url: string): { valid: boolean; message?: string; warning?: boolean } {
    if (!url?.trim()) {
      return { valid: true }; // Empty URL is valid (optional field)
    }

    // Basic URL format validation
    try {
      new URL(url);
    } catch {
      return { valid: false, message: 'URL inválida. Debe ser una URL completa (ej: https://...)' };
    }

    const detectedPlatform = this.detectPlatformFromUrl(url);
    
    if (!detectedPlatform) {
      return { valid: true, message: 'Plataforma no reconocida. Puedes continuar de todas formas.', warning: true };
    }

    // Platform-specific validation with fully anchored patterns to prevent URL manipulation
    const validationPatterns: { [key: string]: RegExp } = {
      // Codeforces supports three URL formats:
      // 1. problemset/problem/1234/A - general problemset
      // 2. contest/1500/problem/B - specific contest
      // 3. gym/102001/problem/A - gym contests
      codeforces: /^https?:\/\/(www\.)?codeforces\.com\/(?:problemset\/problem\/\d+\/[A-Za-z]\d?|contest\/\d+\/problem\/[A-Za-z]\d?|gym\/\d+\/problem\/[A-Za-z]\d?)(?:\/.*)?$/i,
      atcoder: /^https?:\/\/(www\.)?atcoder\.jp\/contests\/[^\/]+\/tasks\/[^\/]+(?:\/.*)?$/i,
      leetcode: /^https?:\/\/(www\.)?leetcode\.com\/problems\/[^\/]+(?:\/.*)?$/i,
      hackerrank: /^https?:\/\/(www\.)?hackerrank\.com\/challenges\/[^\/]+(?:\/.*)?$/i,
      cses: /^https?:\/\/(www\.)?cses\.fi\/problemset\/task\/\d+(?:\/.*)?$/i,
      uva: /^https?:\/\/(www\.)?uva\.onlinejudge\.org\/.*problem=\d+.*$/i,
      spoj: /^https?:\/\/(www\.)?spoj\.com\/problems\/[^\/]+(?:\/.*)?$/i
    };

    const pattern = validationPatterns[detectedPlatform];
    if (pattern && !pattern.test(url)) {
      return { 
        valid: false, 
        message: `URL de ${detectedPlatform} no válida. Verifica el formato.` 
      };
    }

    return { valid: true };
  }

  /**
   * Handle URL change and auto-detect platform
   */
  onUrlChange(): void {
    this.urlValidationError = null;
    this.isUrlWarning = false;

    if (!this.newProblem.url) {
      return;
    }

    // Validate URL
    const validation = this.validateUrl(this.newProblem.url);
    if (!validation.valid) {
      this.urlValidationError = validation.message || 'URL inválida';
      this.isUrlWarning = false;
      return;
    }

    // Show warning message if platform not recognized but URL is valid
    if (validation.warning && validation.message) {
      this.urlValidationError = validation.message;
      this.isUrlWarning = true;
    }

    // Auto-detect and update platform (only when creating new problems)
    const detectedPlatform = this.detectPlatformFromUrl(this.newProblem.url);
    if (detectedPlatform && !this.editingProblem) {
      this.newProblem.platform = detectedPlatform;
    }
  }

  /**
   * Load subtopic information for display
   */
  loadSubtopicInfo(): void {
    if (!this.currentUser || !this.subtopicFilter) return;

    this.roadmapService.getPersonalRoadmap(this.currentUser.id).subscribe({
      next: (response) => {
        // Find the subtopic by ID across all nodes
        for (const node of response.data.roadmap) {
          if (node.subtopics) {
            const subtopic = node.subtopics.find(st => st._id === this.subtopicFilter);
            if (subtopic) {
              this.subtopicName = subtopic.name;
              
              // Store linked problem IDs for filtering
              if (subtopic.linkedProblems) {
                this.linkedProblemIds = subtopic.linkedProblems.map(lp => lp.problemId);
              }
              break;
            }
          }
        }
      },
      error: (err) => {
        console.error('Error loading subtopic info:', err);
      }
    });
  }

  /**
   * Clear subtopic filter
   */
  clearSubtopicFilter(): void {
    this.router.navigate(['/problems']);
  }
}
