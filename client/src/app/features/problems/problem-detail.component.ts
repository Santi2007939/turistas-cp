import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProblemsService, Problem, MetacognitionEntry } from '../../core/services/problems.service';
import { ThemesService, Theme } from '../../core/services/themes.service';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-problem-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <!-- Matte-Drift Problem Detail -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Header with back button -->
      <div class="bg-white" style="border-bottom: 1px solid #EAE3DB;">
        <div class="max-w-5xl mx-auto px-6 py-4">
          <button 
            (click)="goBack()"
            class="flex items-center transition-colors font-medium"
            style="color: #4A3B33;">
            <!-- Lucide ArrowLeft icon -->
            <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Problemas
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-5xl mx-auto px-6 py-8">
        <div *ngIf="loading" class="text-center py-12">
          <p style="color: #4A3B33;">Cargando problema...</p>
        </div>

        <div *ngIf="error" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #EAE3DB; color: #8B5E3C;">
          {{ error }}
        </div>

        <div *ngIf="problem && !loading" class="space-y-6">
          <!-- Title Section -->
          <div class="bg-white rounded-[12px] p-8" style="border: 1px solid #EAE3DB;">
            <h1 class="text-3xl font-semibold mb-4" style="color: #2D2622;">{{ problem.title }}</h1>
            
            <!-- Metadata Row -->
            <div class="flex flex-wrap gap-3 items-center mb-6">
              <!-- Platform Badge -->
              <span class="text-sm px-3 py-1 rounded-[12px] font-medium" style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                {{ problem.platform }}
              </span>

              <!-- Rating Badge -->
              <span 
                *ngIf="problem.rating"
                class="px-3 py-1 text-sm font-semibold font-mono rounded-[12px] flex items-center gap-1"
                style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                <!-- Lucide Activity icon for rating -->
                <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                {{ problem.rating }}
              </span>

              <!-- Status Badge -->
              <select
                *ngIf="canEdit"
                [(ngModel)]="problem.status"
                (change)="updateStatus()"
                class="px-3 py-1 text-sm rounded-[12px] font-medium"
                [ngStyle]="{
                  'background-color': '#FCF9F5',
                  'color': problem.status === 'pending' ? '#4A3B33' : problem.status === 'ac' ? '#8B5E3C' : '#A05E4A',
                  'border': '1px solid ' + (problem.status === 'pending' ? '#EAE3DB' : problem.status === 'ac' ? '#D4A373' : '#A05E4A')
                }">
                <option value="pending">Pendiente</option>
                <option value="ac">✓ AC</option>
                <option value="wa">✗ WA</option>
              </select>

              <span
                *ngIf="!canEdit"
                class="px-3 py-1 text-sm rounded-[12px] font-medium"
                [ngStyle]="{
                  'background-color': '#FCF9F5',
                  'color': problem.status === 'pending' ? '#4A3B33' : problem.status === 'ac' ? '#8B5E3C' : '#A05E4A',
                  'border': '1px solid ' + (problem.status === 'pending' ? '#EAE3DB' : problem.status === 'ac' ? '#D4A373' : '#A05E4A')
                }">
                {{ problem.status === 'pending' ? 'Pendiente' : problem.status === 'ac' ? '✓ AC' : '✗ WA' }}
              </span>

              <!-- Owner Badge -->
              <span 
                class="px-3 py-1 text-sm rounded-[12px] font-medium flex items-center gap-1"
                style="background-color: #FCF9F5; color: #2D2622; border: 1px solid #EAE3DB;">
                <!-- Lucide User or Users icon -->
                <svg *ngIf="problem.owner === 'personal'" class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <svg *ngIf="problem.owner === 'team'" class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {{ problem.owner === 'personal' ? 'Personal' : 'Equipo' }}
              </span>
            </div>

            <!-- Link -->
            <div *ngIf="problem.url" class="mb-6">
              <a 
                [href]="problem.url" 
                target="_blank"
                class="inline-flex items-center font-medium"
                style="color: #8B5E3C;">
                <!-- Lucide ExternalLink icon -->
                <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ver problema en {{ problem.platform }}
              </a>
            </div>

            <!-- Description -->
            <div *ngIf="problem.description" class="leading-relaxed" style="color: #4A3B33;">
              <p class="whitespace-pre-wrap">{{ problem.description }}</p>
            </div>

            <!-- Themes and Subthemes -->
            <div *ngIf="problem.themes && problem.themes.length > 0" class="mt-6">
              <h3 class="text-sm font-semibold mb-3" style="color: #2D2622;">Temas:</h3>
              <div class="space-y-2">
                <div *ngFor="let themeAssoc of problem.themes" class="flex flex-wrap items-center gap-2">
                  <span class="text-sm px-3 py-1 rounded-[12px]" style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                    {{ getThemeName(themeAssoc.themeId) }}
                  </span>
                  <span *ngIf="themeAssoc.subthemes && themeAssoc.subthemes.length > 0" style="color: #EAE3DB;">→</span>
                  <span 
                    *ngFor="let subtheme of themeAssoc.subthemes"
                    class="text-xs px-2 py-1 rounded-[12px]"
                    style="background-color: #FCF9F5; color: #4A3B33; border: 1px solid #EAE3DB;">
                    {{ subtheme }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Edit Themes Button -->
            <button 
              *ngIf="canEdit"
              (click)="openThemesModal()"
              class="mt-4 text-sm font-medium"
              style="color: #8B5E3C;">
              <!-- Lucide Plus icon -->
              <svg class="w-4 h-4 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Editar temas
            </button>
          </div>

          <!-- Metacognition Section -->
          <div class="bg-white rounded-[12px] p-8" style="border: 1px solid #EAE3DB;">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-semibold" style="color: #2D2622;">🧠 Metacognición</h2>
              <button 
                *ngIf="canEdit"
                (click)="addMetacognitionEntry()"
                class="text-white px-4 py-2 rounded-[12px] text-sm font-medium transition-colors"
                style="background-color: #8B5E3C;">
                <!-- Lucide Plus icon -->
                <svg class="w-4 h-4 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Agregar Entrada
              </button>
            </div>

            <div *ngIf="problem.metacognition && problem.metacognition.length === 0" class="italic" style="color: #4A3B33;">
              No hay entradas de metacognición aún.
            </div>

            <div class="space-y-4">
              <div 
                *ngFor="let entry of problem.metacognition; let i = index"
                class="border-l-4 p-4 rounded-r-[12px]"
                style="border-left-color: #D4A373; background-color: #FCF9F5;">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-semibold font-mono px-2 py-1 rounded-[12px]" style="background-color: #D4A373; color: #2D2622;">
                      {{ entry.time }} min
                    </span>
                    <span *ngIf="entry.createdAt" class="text-xs" style="color: #4A3B33;">
                      {{ formatDate(entry.createdAt) }}
                    </span>
                  </div>
                  <button 
                    *ngIf="canEdit"
                    (click)="deleteMetacognitionEntry(i)"
                    class="text-sm"
                    style="color: #A05E4A;">
                    <!-- Lucide X icon -->
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p class="leading-relaxed whitespace-pre-wrap" style="color: #2D2622;">{{ entry.description }}</p>
              </div>
            </div>
          </div>

          <!-- Takeaways Section -->
          <div class="bg-white rounded-[12px] p-8" style="border: 1px solid #EAE3DB;">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-semibold" style="color: #2D2622;">💡 Aprendizajes Clave</h2>
              <button 
                *ngIf="canEdit"
                (click)="addTakeaway()"
                class="text-white px-4 py-2 rounded-[12px] text-sm font-medium transition-colors"
                style="background-color: #D4A373;">
                <!-- Lucide Plus icon -->
                <svg class="w-4 h-4 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Agregar
              </button>
            </div>

            <div *ngIf="problem.takeaways && problem.takeaways.length === 0" class="italic" style="color: #4A3B33;">
              No hay aprendizajes registrados aún.
            </div>

            <ul class="space-y-3">
              <li 
                *ngFor="let takeaway of problem.takeaways; let i = index"
                class="flex items-start gap-3 p-3 rounded-[12px] transition-colors"
                style="background-color: #FCF9F5;">
                <!-- Lucide Check icon -->
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color: #D4A373;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span class="flex-1" style="color: #2D2622;">{{ takeaway }}</span>
                <button 
                  *ngIf="canEdit"
                  (click)="deleteTakeaway(i)"
                  class="text-sm flex-shrink-0"
                  style="color: #A05E4A;">
                  <!-- Lucide X icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            </ul>
          </div>

          <!-- Analysis Section -->
          <div class="bg-white rounded-[12px] p-8" style="border: 1px solid #EAE3DB;">
            <h2 class="text-2xl font-semibold mb-6" style="color: #2D2622;">📊 Análisis</h2>
            
            <div *ngIf="canEdit" class="space-y-4">
              <textarea
                [(ngModel)]="problem.analysis"
                (blur)="updateAnalysis()"
                rows="8"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="Escribe tu análisis del problema aquí...&#10;&#10;Puedes incluir:&#10;- Approach utilizado&#10;- Complejidad temporal y espacial&#10;- Dificultades encontradas&#10;- Optimizaciones consideradas"></textarea>
            </div>

            <div *ngIf="!canEdit && problem.analysis" class="prose max-w-none">
              <p class="leading-relaxed whitespace-pre-wrap" style="color: #2D2622;">{{ problem.analysis }}</p>
            </div>

            <div *ngIf="!canEdit && !problem.analysis" class="italic" style="color: #4A3B33;">
              No hay análisis disponible.
            </div>
          </div>


        </div>
      </div>

      <!-- Metacognition Entry Modal -->
      <div 
        *ngIf="showMetacognitionModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="cancelMetacognitionEntry()">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-lg" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">Nueva Entrada de Metacognición</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Tiempo (minutos)</label>
              <input 
                type="number"
                [(ngModel)]="newMetacognition.time"
                min="0"
                class="w-full rounded-[12px] px-4 py-3 font-mono"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="30">
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Descripción</label>
              <textarea 
                [(ngModel)]="newMetacognition.description"
                rows="5"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="¿Qué estabas pensando en este momento? ¿Qué estrategias consideraste?"></textarea>
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="cancelMetacognitionEntry()"
              class="px-4 py-2 rounded-[12px] font-medium"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancelar
            </button>
            <button 
              (click)="saveMetacognitionEntry()"
              [disabled]="!newMetacognition.time || !newMetacognition.description"
              class="text-white px-4 py-2 rounded-[12px] font-medium disabled:opacity-50"
              style="background-color: #8B5E3C;">
              Guardar
            </button>
          </div>
        </div>
      </div>

      <!-- Takeaway Modal -->
      <div 
        *ngIf="showTakeawayModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="cancelTakeaway()">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-lg" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">Nuevo Aprendizaje Clave</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Aprendizaje</label>
              <textarea 
                [(ngModel)]="newTakeaway"
                rows="3"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="Describe lo que aprendiste de este problema..."></textarea>
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="cancelTakeaway()"
              class="px-4 py-2 rounded-[12px] font-medium"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancelar
            </button>
            <button 
              (click)="saveTakeaway()"
              [disabled]="!newTakeaway"
              class="text-white px-4 py-2 rounded-[12px] font-medium disabled:opacity-50"
              style="background-color: #D4A373;">
              Guardar
            </button>
          </div>
        </div>
      </div>

      <!-- Themes Modal -->
      <div 
        *ngIf="showThemesModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="cancelThemes()">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">Editar Temas y Subtemas</h3>
          
          <div class="space-y-4">
            <div *ngFor="let themeAssoc of editingThemes; let i = index" class="rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Tema</label>
                  <select 
                    [(ngModel)]="themeAssoc.themeId"
                    (change)="onThemeChange(i)"
                    class="w-full rounded-[12px] px-4 py-3"
                    style="border: 1px solid #EAE3DB; color: #2D2622;">
                    <option value="">Seleccionar tema...</option>
                    <option *ngFor="let theme of availableThemes" [value]="theme._id">
                      {{ theme.name }}
                    </option>
                  </select>
                </div>
                <button 
                  (click)="removeTheme(i)"
                  class="ml-2 mt-8"
                  style="color: #A05E4A;">
                  <!-- Lucide X icon -->
                  <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div *ngIf="themeAssoc.themeId && getThemeSubthemes(themeAssoc.themeId).length > 0">
                <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Subtemas</label>
                <div class="space-y-2">
                  <label 
                    *ngFor="let subtheme of getThemeSubthemes(themeAssoc.themeId)"
                    class="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      [checked]="isSubthemeSelected(i, subtheme.name)"
                      (change)="toggleSubtheme(i, subtheme.name)"
                      class="rounded">
                    <span class="text-sm" style="color: #2D2622;">{{ subtheme.name }}</span>
                  </label>
                </div>
              </div>
            </div>

            <button 
              (click)="addThemeAssociation()"
              class="w-full border-2 border-dashed rounded-[12px] py-3 transition-colors"
              style="border-color: #EAE3DB; color: #4A3B33;">
              <!-- Lucide Plus icon -->
              <svg class="w-4 h-4 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Agregar Tema
            </button>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="cancelThemes()"
              class="px-4 py-2 rounded-[12px] font-medium"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancelar
            </button>
            <button 
              (click)="saveThemes()"
              class="text-white px-4 py-2 rounded-[12px] font-medium"
              style="background-color: #8B5E3C;">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .prose {
      max-width: none;
    }
  `]
})
export class ProblemDetailComponent implements OnInit {
  problem: Problem | null = null;
  loading = false;
  error: string | null = null;
  canEdit = false;

  showMetacognitionModal = false;
  newMetacognition = {
    time: 0,
    description: ''
  };

  showTakeawayModal = false;
  newTakeaway = '';

  showThemesModal = false;
  availableThemes: Theme[] = [];
  editingThemes: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private problemsService: ProblemsService,
    private themesService: ThemesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProblem(id);
        this.loadThemes();
      }
    });
  }

  loadProblem(id: string): void {
    this.loading = true;
    this.error = null;

    this.problemsService.getProblem(id).subscribe({
      next: (response) => {
        this.problem = response.data.problem;
        this.checkEditPermissions();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el problema. Inténtelo de nuevo.';
        this.loading = false;
        console.error('Error loading problem:', err);
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

  checkEditPermissions(): void {
    if (!this.problem) return;

    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.canEdit = false;
        return;
      }

      if (this.problem!.owner === 'personal') {
        const createdById = typeof this.problem!.createdBy === 'object' && this.problem!.createdBy !== null
          ? (this.problem!.createdBy as any)._id
          : this.problem!.createdBy;
        this.canEdit = createdById === user.id;
      } else {
        this.canEdit = true; // Team problems can be edited by anyone
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/problems']);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getThemeName(themeId: string): string {
    const theme = this.availableThemes.find(t => t._id === themeId);
    return theme ? theme.name : 'Tema desconocido';
  }

  getThemeSubthemes(themeId: string): any[] {
    const theme = this.availableThemes.find(t => t._id === themeId);
    return theme?.subthemes || [];
  }

  isSubthemeSelected(themeIndex: number, subthemeName: string): boolean {
    return this.editingThemes[themeIndex]?.subthemes?.includes(subthemeName) || false;
  }

  toggleSubtheme(themeIndex: number, subthemeName: string): void {
    if (!this.editingThemes[themeIndex]) return;
    
    if (!this.editingThemes[themeIndex].subthemes) {
      this.editingThemes[themeIndex].subthemes = [];
    }
    
    const index = this.editingThemes[themeIndex].subthemes.indexOf(subthemeName);
    if (index > -1) {
      this.editingThemes[themeIndex].subthemes.splice(index, 1);
    } else {
      this.editingThemes[themeIndex].subthemes.push(subthemeName);
    }
  }

  onThemeChange(index: number): void {
    // Reset subthemes when theme changes
    this.editingThemes[index].subthemes = [];
  }

  addThemeAssociation(): void {
    this.editingThemes.push({ themeId: '', subthemes: [] });
  }

  removeTheme(index: number): void {
    this.editingThemes.splice(index, 1);
  }

  openThemesModal(): void {
    if (!this.problem) return;
    
    // Initialize editingThemes with a copy of current themes
    this.editingThemes = this.problem.themes 
      ? JSON.parse(JSON.stringify(this.problem.themes))
      : [];
    
    this.showThemesModal = true;
  }

  cancelThemes(): void {
    this.showThemesModal = false;
    this.editingThemes = [];
  }

  saveThemes(): void {
    if (!this.problem) return;

    // Filter out themes with no themeId selected
    const validThemes = this.editingThemes.filter(t => t.themeId);
    
    this.problemsService.updateProblem(this.problem._id, { themes: validThemes }).subscribe({
      next: (response) => {
        this.problem = response.data.problem;
        this.showThemesModal = false;
        this.editingThemes = [];
      },
      error: (err) => {
        this.error = 'Error al actualizar temas.';
        console.error('Error updating themes:', err);
      }
    });
  }

  // Metacognition methods
  addMetacognitionEntry(): void {
    this.showMetacognitionModal = true;
    this.newMetacognition = { time: 0, description: '' };
  }

  cancelMetacognitionEntry(): void {
    this.showMetacognitionModal = false;
    this.newMetacognition = { time: 0, description: '' };
  }

  saveMetacognitionEntry(): void {
    if (!this.problem || !this.newMetacognition.time || !this.newMetacognition.description) return;

    const currentMetacognition = this.problem.metacognition || [];
    const updatedMetacognition = [
      ...currentMetacognition,
      { ...this.newMetacognition, createdAt: new Date() }
    ];

    this.problemsService.updateProblem(this.problem._id, { metacognition: updatedMetacognition }).subscribe({
      next: (response) => {
        this.problem = response.data.problem;
        this.showMetacognitionModal = false;
        this.newMetacognition = { time: 0, description: '' };
      },
      error: (err) => {
        this.error = 'Error al agregar entrada de metacognición.';
        console.error('Error adding metacognition entry:', err);
      }
    });
  }

  deleteMetacognitionEntry(index: number): void {
    if (!this.problem) return;

    const updatedMetacognition = [...this.problem.metacognition];
    updatedMetacognition.splice(index, 1);

    this.problemsService.updateProblem(this.problem._id, { metacognition: updatedMetacognition }).subscribe({
      next: (response) => {
        this.problem = response.data.problem;
      },
      error: (err) => {
        this.error = 'Error al eliminar entrada.';
        console.error('Error deleting metacognition entry:', err);
      }
    });
  }

  // Takeaways methods
  addTakeaway(): void {
    this.showTakeawayModal = true;
    this.newTakeaway = '';
  }

  cancelTakeaway(): void {
    this.showTakeawayModal = false;
    this.newTakeaway = '';
  }

  saveTakeaway(): void {
    if (!this.problem || !this.newTakeaway) return;

    const currentTakeaways = this.problem.takeaways || [];
    const updatedTakeaways = [
      ...currentTakeaways,
      this.newTakeaway
    ];

    this.problemsService.updateProblem(this.problem._id, { takeaways: updatedTakeaways }).subscribe({
      next: (response) => {
        this.problem = response.data.problem;
        this.showTakeawayModal = false;
        this.newTakeaway = '';
      },
      error: (err) => {
        this.error = 'Error al agregar aprendizaje.';
        console.error('Error adding takeaway:', err);
      }
    });
  }

  deleteTakeaway(index: number): void {
    if (!this.problem) return;

    const updatedTakeaways = [...this.problem.takeaways];
    updatedTakeaways.splice(index, 1);

    this.problemsService.updateProblem(this.problem._id, { takeaways: updatedTakeaways }).subscribe({
      next: (response) => {
        this.problem = response.data.problem;
      },
      error: (err) => {
        this.error = 'Error al eliminar aprendizaje.';
        console.error('Error deleting takeaway:', err);
      }
    });
  }

  // Update methods
  updateStatus(): void {
    if (!this.problem) return;

    this.problemsService.updateProblem(this.problem._id, { status: this.problem.status }).subscribe({
      next: () => {
        // Status updated successfully
      },
      error: (err) => {
        this.error = 'Error al actualizar estado.';
        console.error('Error updating status:', err);
      }
    });
  }

  updateAnalysis(): void {
    if (!this.problem) return;

    this.problemsService.updateProblem(this.problem._id, { analysis: this.problem.analysis }).subscribe({
      next: () => {
        // Analysis updated successfully
      },
      error: (err) => {
        this.error = 'Error al actualizar análisis.';
        console.error('Error updating analysis:', err);
      }
    });
  }


}
