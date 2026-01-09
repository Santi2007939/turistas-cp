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
    <!-- Matte-Drift Problems Library -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <div class="container mx-auto px-6 py-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-semibold" style="color: #2D2622;">Biblioteca de Problemas</h1>
          <button 
            (click)="openAddProblemModal()"
            class="text-white font-medium py-3 px-6 rounded-[12px]"
            style="background-color: #8B5E3C;">
            Agregar Problema
          </button>
        </div>

      <!-- Subtopic Filter Banner -->
      <div *ngIf="subtopicFilter" class="mb-6 bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🎯</span>
            <div>
              <h3 class="font-semibold" style="color: #2D2622;">Filtrando por subtema</h3>
              <p class="text-sm" style="color: #4A3B33;">{{ subtopicName || 'Cargando...' }}</p>
            </div>
          </div>
          <button 
            (click)="clearSubtopicFilter()"
            class="text-white px-4 py-2 rounded-[12px] text-sm font-medium"
            style="background-color: #8B5E3C;">
            ✕ Limpiar filtro
          </button>
        </div>
      </div>

      <!-- Selector for problem view -->
      <div class="mb-6 flex gap-4 items-center">
        <label class="font-medium" style="color: #2D2622;">Ver:</label>
        <select 
          [(ngModel)]="selectedView"
          (change)="onViewChange()"
          class="rounded-[12px] px-4 py-2 bg-white"
          style="border: 1px solid #EAE3DB; color: #2D2622;">
          <option value="personal">Mi cuenta</option>
          <option value="team">Equipo</option>
          <option value="members">Miembros</option>
        </select>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p style="color: #4A3B33;">Cargando problemas...</p>
      </div>

      <div *ngIf="error" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #EAE3DB; color: #2D2622;">
        {{ error }}
      </div>

      <!-- Problems Grid - Matte-Drift Design -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let problem of problems" 
          class="bg-white rounded-[12px] p-6 border-l-4"
          style="border-right: 1px solid #EAE3DB; border-top: 1px solid #EAE3DB; border-bottom: 1px solid #EAE3DB;"
          [ngStyle]="{
            'border-left-color': problem.status === 'pending' ? '#EAE3DB' : problem.status === 'ac' ? '#D4A373' : '#8B5E3C'
          }">
          
          <!-- Problem Header -->
          <div class="mb-4">
            <div class="flex justify-between items-start mb-2">
              <h2 class="text-lg font-semibold flex-1" style="color: #2D2622;">{{ problem.title }}</h2>
            </div>
            
            <!-- Rating and Status Row -->
            <div class="flex gap-2 items-center mb-3">
              <span 
                *ngIf="problem.rating"
                class="px-3 py-1 text-sm font-semibold font-mono rounded-[12px]"
                style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                ★ {{ problem.rating }}
              </span>
              
              <select
                *ngIf="canEdit(problem)"
                [(ngModel)]="problem.status"
                (change)="updateProblemStatus(problem)"
                class="px-3 py-1 text-sm rounded-[12px]"
                style="border: 1px solid #EAE3DB; background-color: #FCF9F5; color: #2D2622;">
                <option value="pending">Pendiente</option>
                <option value="ac">AC</option>
                <option value="wa">WA</option>
              </select>
              
              <span
                *ngIf="!canEdit(problem)"
                class="px-3 py-1 text-sm rounded-[12px]"
                style="background-color: #FCF9F5; color: #2D2622; border: 1px solid #EAE3DB;">
                {{ problem.status === 'pending' ? 'Pendiente' : problem.status === 'ac' ? 'AC' : 'WA' }}
              </span>
            </div>

            <!-- Platform Badge -->
            <div class="mb-3">
              <span class="text-xs px-2 py-1 rounded-[12px]" style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                {{ problem.platform }}
              </span>
              <span 
                *ngIf="problem.owner === 'personal'"
                class="text-xs px-2 py-1 rounded-[12px] ml-2"
                style="background-color: #FCF9F5; color: #2D2622; border: 1px solid #EAE3DB;">
                Personal
              </span>
              <span 
                *ngIf="problem.owner === 'team'"
                class="text-xs px-2 py-1 rounded-[12px] ml-2"
                style="background-color: #FCF9F5; color: #2D2622; border: 1px solid #EAE3DB;">
                Equipo
              </span>
            </div>


          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-4">
            <a 
              [routerLink]="['/problems', problem._id]"
              class="flex-1 text-white px-4 py-2 rounded-[12px] text-sm text-center font-medium"
              style="background-color: #8B5E3C;">
              Ver Detalles
            </a>
            <a 
              *ngIf="problem.url"
              [href]="problem.url" 
              target="_blank"
              class="px-3 py-2 rounded-[12px] text-sm font-medium"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #4A3B33;">
              🔗
            </a>
            <button 
              *ngIf="canEdit(problem)"
              (click)="openEditProblemModal(problem)"
              class="px-3 py-2 rounded-[12px] text-sm font-medium"
              style="background-color: #D4A373; color: white;">
              ✎
            </button>
          </div>

          <div *ngIf="problem.createdBy" class="mt-3 text-xs" style="color: #4A3B33;">
            Creado por: {{ getCreatorName(problem) }}
          </div>
        </div>
      </div>

      <div *ngIf="!loading && problems.length === 0" class="text-center py-12">
        <p class="text-lg mb-4" style="color: #4A3B33;">No hay problemas en esta vista.</p>
        <button 
          *ngIf="selectedView === 'personal'"
          (click)="openAddProblemModal()"
          class="text-white font-medium py-3 px-6 rounded-[12px]"
          style="background-color: #8B5E3C;">
          Agregar Primer Problema
        </button>
      </div>

      <!-- Add/Edit Problem Modal -->
      <div 
        *ngIf="showAddProblemModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style="border: 1px solid #EAE3DB;">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">
            {{ editingProblem ? 'Editar Problema' : 'Agregar Problema' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Título *</label>
              <input 
                type="text"
                [(ngModel)]="newProblem.title"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="Nombre del problema">
            </div>

            <!-- URL Field (optional for all platforms) -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">
                URL del Problema (Opcional)
              </label>
              <input 
                type="url"
                [(ngModel)]="newProblem.url"
                (ngModelChange)="onUrlChange()"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="https://codeforces.com/problemset/problem/1234/A">
              <p *ngIf="urlValidationError" 
                 class="text-xs mt-1"
                 [style.color]="isUrlWarning ? '#D4A373' : '#dc2626'">
                {{ urlValidationError }}
              </p>
              <p class="text-xs mt-1" style="color: #4A3B33;">
                La plataforma se detectará automáticamente desde la URL.
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Plataforma</label>
              <select 
                [(ngModel)]="newProblem.platform"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
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
                 class="bg-white rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
              <p class="text-sm mb-2" style="color: #2D2622;">
                ¿Quieres obtener automáticamente los datos de este problema de Codeforces?
              </p>
              <button 
                (click)="fetchCodeforcesData()"
                [disabled]="fetchingCodeforces || !!urlValidationError"
                class="text-white px-4 py-2 rounded-[12px] disabled:opacity-50 w-full font-medium"
                style="background-color: #8B5E3C;">
                {{ fetchingCodeforces ? 'Obteniendo datos...' : '🔄 Obtener Datos de Codeforces' }}
              </button>
              <p class="text-xs mt-2" style="color: #4A3B33;">
                Esto llenará automáticamente el título, rating y otros detalles.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Rating</label>
                <input 
                  type="number"
                  [(ngModel)]="newProblem.rating"
                  class="w-full rounded-[12px] px-4 py-3 font-mono"
                  style="border: 1px solid #EAE3DB; color: #2D2622;"
                  placeholder="800, 1200, 1600...">
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Estado</label>
                <select 
                  [(ngModel)]="newProblem.status"
                  class="w-full rounded-[12px] px-4 py-3"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
                  <option value="pending">Pendiente</option>
                  <option value="ac">AC</option>
                  <option value="wa">WA</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Owner</label>
              <select 
                [(ngModel)]="newProblem.owner"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
                <option value="personal">Personal</option>
                <option value="team">Equipo</option>
              </select>
            </div>

            <!-- Themes Section -->
            <div class="rounded-[12px] p-4" style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
              <label class="block text-sm font-medium mb-3" style="color: #2D2622;">Temas y Subtemas</label>
              
              <div class="space-y-3">
                <div *ngFor="let themeAssoc of newProblem.themes; let i = index" class="rounded-[12px] p-3 bg-white" style="border: 1px solid #EAE3DB;">
                  <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                      <select 
                        [(ngModel)]="themeAssoc.themeId"
                        (change)="onModalThemeChange(i)"
                        class="w-full rounded-[12px] px-3 py-2"
                        style="border: 1px solid #EAE3DB; color: #2D2622;">
                        <option value="">Seleccionar tema...</option>
                        <option *ngFor="let theme of availableThemes" [value]="theme._id">
                          {{ theme.name }}
                        </option>
                      </select>
                    </div>
                    <button 
                      (click)="removeModalTheme(i)"
                      class="ml-2 text-red-600 hover:text-red-800">
                      ✕
                    </button>
                  </div>

                  <div *ngIf="themeAssoc.themeId && getModalThemeSubthemes(themeAssoc.themeId).length > 0" class="mt-2">
                    <label class="block text-xs mb-2" style="color: #4A3B33;">Subtemas:</label>
                    <div class="space-y-1">
                      <label 
                        *ngFor="let subtheme of getModalThemeSubthemes(themeAssoc.themeId)"
                        class="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox"
                          [checked]="isModalSubthemeSelected(i, subtheme.name)"
                          (change)="toggleModalSubtheme(i, subtheme.name)"
                          class="rounded">
                        <span style="color: #2D2622;">{{ subtheme.name }}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  (click)="addModalThemeAssociation()"
                  class="w-full border-2 border-dashed rounded-[12px] py-2 text-sm transition-colors"
                  style="border-color: #EAE3DB; color: #4A3B33;">
                  + Agregar Tema
                </button>
              </div>
            </div>


          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="cancelAddProblem()"
              class="px-4 py-2 rounded-[12px] font-medium"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancelar
            </button>
            <button 
              (click)="saveProblem()"
              [disabled]="!newProblem.title"
              class="text-white px-4 py-2 rounded-[12px] font-medium disabled:opacity-50"
              style="background-color: #8B5E3C;">
              {{ editingProblem ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Duplicate Problem Modal -->
      <div 
        *ngIf="showDuplicateModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-lg" style="border: 1px solid #EAE3DB;">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">
            ⚠️ Problema Existente Detectado
          </h3>
          
          <p class="mb-4" style="color: #4A3B33;">
            Este problema ya ha sido agregado por otro miembro del equipo. 
            ¿Deseas crear tu propia copia personal para registrar tu propio enfoque y progreso?
          </p>

          <div class="space-y-3 mb-6">
            <p class="text-sm font-medium" style="color: #2D2622;">Problemas existentes:</p>
            <div 
              *ngFor="let dup of duplicateProblems" 
              class="p-3 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium" style="color: #2D2622;">{{ dup.title }}</p>
                  <p class="text-xs" style="color: #4A3B33;">
                    Creado por: {{ dup.createdBy?.username || 'Usuario' }} 
                    ({{ dup.owner === 'team' ? 'Equipo' : 'Personal' }})
                  </p>
                </div>
                <span class="text-xs px-2 py-1 rounded-[12px]" 
                      style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                  {{ dup.platform }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-3 justify-end">
            <button 
              (click)="cancelCreateDuplicate()"
              class="px-4 py-2 rounded-[12px] font-medium"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancelar
            </button>
            <button 
              (click)="confirmCreateDuplicate()"
              class="text-white px-4 py-2 rounded-[12px] font-medium"
              style="background-color: #8B5E3C;">
              Crear mi copia personal
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
  
  // Duplicate detection
  showDuplicateModal = false;
  duplicateProblems: any[] = [];
  pendingProblemData: any = null;

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
      // Update existing problem - no duplicate check needed
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
      // Check for duplicates when creating new personal problems
      if (problemData.owner === 'personal' && problemData.url) {
        this.pendingProblemData = problemData;
        this.checkForDuplicates(problemData);
      } else {
        // Create directly without duplicate check
        this.createProblemDirectly(problemData, false);
      }
    }
  }

  checkForDuplicates(problemData: any): void {
    this.problemsService.checkDuplicate({
      url: problemData.url,
      platform: problemData.platform,
      owner: problemData.owner
    }).subscribe({
      next: (response) => {
        if (response.data.exists && response.data.problems.length > 0) {
          // Show duplicate modal
          this.duplicateProblems = response.data.problems;
          this.showDuplicateModal = true;
        } else {
          // No duplicates, create directly
          this.createProblemDirectly(problemData, false);
        }
      },
      error: (err) => {
        // If check fails, proceed with creation anyway
        console.error('Error checking duplicates:', err);
        this.createProblemDirectly(problemData, false);
      }
    });
  }

  createProblemDirectly(problemData: any, forceCreate: boolean): void {
    this.problemsService.createProblem(problemData, forceCreate).subscribe({
      next: () => {
        this.showAddProblemModal = false;
        this.showDuplicateModal = false;
        this.resetNewProblem();
        this.pendingProblemData = null;
        this.duplicateProblems = [];
        this.loadProblems();
      },
      error: (err) => {
        this.error = 'Error al crear problema.';
        console.error('Error creating problem:', err);
      }
    });
  }

  confirmCreateDuplicate(): void {
    if (this.pendingProblemData) {
      this.createProblemDirectly(this.pendingProblemData, true);
    }
  }

  cancelCreateDuplicate(): void {
    this.showDuplicateModal = false;
    this.pendingProblemData = null;
    this.duplicateProblems = [];
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
    this.showDuplicateModal = false;
    this.pendingProblemData = null;
    this.duplicateProblems = [];
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
