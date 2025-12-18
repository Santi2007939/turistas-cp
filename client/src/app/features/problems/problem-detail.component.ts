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
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Header with back button -->
      <div class="bg-white border-b">
        <div class="max-w-5xl mx-auto px-6 py-4">
          <button 
            (click)="goBack()"
            class="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <span class="mr-2">←</span> Volver a Problemas
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-5xl mx-auto px-6 py-8">
        <div *ngIf="loading" class="text-center py-12">
          <p class="text-gray-600">Cargando problema...</p>
        </div>

        <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>

        <div *ngIf="problem && !loading" class="space-y-6">
          <!-- Title Section -->
          <div class="bg-white rounded-lg shadow-sm p-8 border">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ problem.title }}</h1>
            
            <!-- Metadata Row -->
            <div class="flex flex-wrap gap-3 items-center mb-6">
              <!-- Platform Badge -->
              <span class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                {{ problem.platform }}
              </span>

              <!-- Rating Badge -->
              <span 
                *ngIf="problem.rating"
                class="px-3 py-1 text-sm font-semibold rounded-full"
                [ngClass]="{
                  'bg-gray-200 text-gray-800': problem.rating < 1200,
                  'bg-green-200 text-green-800': problem.rating >= 1200 && problem.rating < 1400,
                  'bg-cyan-200 text-cyan-800': problem.rating >= 1400 && problem.rating < 1600,
                  'bg-blue-200 text-blue-800': problem.rating >= 1600 && problem.rating < 1900,
                  'bg-purple-200 text-purple-800': problem.rating >= 1900 && problem.rating < 2100,
                  'bg-orange-200 text-orange-800': problem.rating >= 2100 && problem.rating < 2400,
                  'bg-red-200 text-red-800': problem.rating >= 2400
                }">
                ★ {{ problem.rating }}
              </span>

              <!-- Status Badge -->
              <select
                *ngIf="canEdit"
                [(ngModel)]="problem.status"
                (change)="updateStatus()"
                class="px-3 py-1 text-sm rounded-full border-2 font-medium"
                [ngClass]="{
                  'bg-gray-50 text-gray-800 border-gray-300': problem.status === 'pending',
                  'bg-green-50 text-green-800 border-green-300': problem.status === 'ac',
                  'bg-red-50 text-red-800 border-red-300': problem.status === 'wa'
                }">
                <option value="pending">Pendiente</option>
                <option value="ac">✓ AC</option>
                <option value="wa">✗ WA</option>
              </select>

              <span
                *ngIf="!canEdit"
                class="px-3 py-1 text-sm rounded-full font-medium"
                [ngClass]="{
                  'bg-gray-100 text-gray-800': problem.status === 'pending',
                  'bg-green-100 text-green-800': problem.status === 'ac',
                  'bg-red-100 text-red-800': problem.status === 'wa'
                }">
                {{ problem.status === 'pending' ? 'Pendiente' : problem.status === 'ac' ? '✓ AC' : '✗ WA' }}
              </span>

              <!-- Owner Badge -->
              <span 
                class="px-3 py-1 text-sm rounded-full font-medium"
                [ngClass]="{
                  'bg-purple-100 text-purple-800': problem.owner === 'personal',
                  'bg-indigo-100 text-indigo-800': problem.owner === 'team'
                }">
                {{ problem.owner === 'personal' ? 'Personal' : 'Equipo' }}
              </span>
            </div>

            <!-- Link -->
            <div *ngIf="problem.url" class="mb-6">
              <a 
                [href]="problem.url" 
                target="_blank"
                class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                <span class="mr-2">🔗</span> Ver problema en {{ problem.platform }}
                <span class="ml-1">↗</span>
              </a>
            </div>

            <!-- Description -->
            <div *ngIf="problem.description" class="text-gray-700 leading-relaxed">
              <p class="whitespace-pre-wrap">{{ problem.description }}</p>
            </div>

            <!-- Themes and Subthemes -->
            <div *ngIf="problem.themes && problem.themes.length > 0" class="mt-6">
              <h3 class="text-sm font-semibold text-gray-600 mb-3">Temas:</h3>
              <div class="space-y-2">
                <div *ngFor="let themeAssoc of problem.themes" class="flex flex-wrap items-center gap-2">
                  <span class="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded">
                    {{ getThemeName(themeAssoc.themeId) }}
                  </span>
                  <span *ngIf="themeAssoc.subthemes && themeAssoc.subthemes.length > 0" class="text-gray-400">→</span>
                  <span 
                    *ngFor="let subtheme of themeAssoc.subthemes"
                    class="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded border border-indigo-200">
                    {{ subtheme }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Edit Themes Button -->
            <button 
              *ngIf="canEdit"
              (click)="openThemesModal()"
              class="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
              + Editar temas
            </button>
          </div>

          <!-- Metacognition Section -->
          <div class="bg-white rounded-lg shadow-sm p-8 border">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">🧠 Metacognición</h2>
              <button 
                *ngIf="canEdit"
                (click)="addMetacognitionEntry()"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                + Agregar Entrada
              </button>
            </div>

            <div *ngIf="problem.metacognition && problem.metacognition.length === 0" class="text-gray-500 italic">
              No hay entradas de metacognición aún.
            </div>

            <div class="space-y-4">
              <div 
                *ngFor="let entry of problem.metacognition; let i = index"
                class="border-l-4 border-blue-400 bg-blue-50 p-4 rounded-r-lg">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-3">
                    <span class="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                      {{ entry.time }} min
                    </span>
                    <span *ngIf="entry.createdAt" class="text-xs text-gray-500">
                      {{ formatDate(entry.createdAt) }}
                    </span>
                  </div>
                  <button 
                    *ngIf="canEdit"
                    (click)="deleteMetacognitionEntry(i)"
                    class="text-red-600 hover:text-red-800 text-sm">
                    ✕
                  </button>
                </div>
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ entry.description }}</p>
              </div>
            </div>
          </div>

          <!-- Takeaways Section -->
          <div class="bg-white rounded-lg shadow-sm p-8 border">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">💡 Aprendizajes Clave</h2>
              <button 
                *ngIf="canEdit"
                (click)="addTakeaway()"
                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                + Agregar
              </button>
            </div>

            <div *ngIf="problem.takeaways && problem.takeaways.length === 0" class="text-gray-500 italic">
              No hay aprendizajes registrados aún.
            </div>

            <ul class="space-y-3">
              <li 
                *ngFor="let takeaway of problem.takeaways; let i = index"
                class="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <span class="text-green-600 text-xl flex-shrink-0">✓</span>
                <span class="text-gray-700 flex-1">{{ takeaway }}</span>
                <button 
                  *ngIf="canEdit"
                  (click)="deleteTakeaway(i)"
                  class="text-red-600 hover:text-red-800 text-sm flex-shrink-0">
                  ✕
                </button>
              </li>
            </ul>
          </div>

          <!-- Analysis Section -->
          <div class="bg-white rounded-lg shadow-sm p-8 border">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">📊 Análisis</h2>
            
            <div *ngIf="canEdit" class="space-y-4">
              <textarea
                [(ngModel)]="problem.analysis"
                (blur)="updateAnalysis()"
                rows="8"
                class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Escribe tu análisis del problema aquí...&#10;&#10;Puedes incluir:&#10;- Approach utilizado&#10;- Complejidad temporal y espacial&#10;- Dificultades encontradas&#10;- Optimizaciones consideradas"></textarea>
            </div>

            <div *ngIf="!canEdit && problem.analysis" class="prose max-w-none">
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ problem.analysis }}</p>
            </div>

            <div *ngIf="!canEdit && !problem.analysis" class="text-gray-500 italic">
              No hay análisis disponible.
            </div>
          </div>


        </div>
      </div>

      <!-- Metacognition Entry Modal -->
      <div 
        *ngIf="showMetacognitionModal" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
          <h3 class="text-xl font-bold mb-4">Nueva Entrada de Metacognición</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Tiempo (minutos)</label>
              <input 
                type="number"
                [(ngModel)]="newMetacognition.time"
                min="0"
                class="w-full border rounded px-3 py-2"
                placeholder="30">
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
              <textarea 
                [(ngModel)]="newMetacognition.description"
                rows="5"
                class="w-full border rounded px-3 py-2"
                placeholder="¿Qué estabas pensando en este momento? ¿Qué estrategias consideraste?"></textarea>
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="cancelMetacognitionEntry()"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Cancelar
            </button>
            <button 
              (click)="saveMetacognitionEntry()"
              [disabled]="!newMetacognition.time || !newMetacognition.description"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300">
              Guardar
            </button>
          </div>
        </div>
      </div>

      <!-- Takeaway Modal -->
      <div 
        *ngIf="showTakeawayModal" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
          <h3 class="text-xl font-bold mb-4">Nuevo Aprendizaje Clave</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Aprendizaje</label>
              <textarea 
                [(ngModel)]="newTakeaway"
                rows="3"
                class="w-full border rounded px-3 py-2"
                placeholder="Describe lo que aprendiste de este problema..."></textarea>
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="cancelTakeaway()"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Cancelar
            </button>
            <button 
              (click)="saveTakeaway()"
              [disabled]="!newTakeaway"
              class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300">
              Guardar
            </button>
          </div>
        </div>
      </div>

      <!-- Themes Modal -->
      <div 
        *ngIf="showThemesModal" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-bold mb-4">Editar Temas y Subtemas</h3>
          
          <div class="space-y-4">
            <div *ngFor="let themeAssoc of editingThemes; let i = index" class="border rounded p-4">
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <label class="block text-gray-700 text-sm font-bold mb-2">Tema</label>
                  <select 
                    [(ngModel)]="themeAssoc.themeId"
                    (change)="onThemeChange(i)"
                    class="w-full border rounded px-3 py-2">
                    <option value="">Seleccionar tema...</option>
                    <option *ngFor="let theme of availableThemes" [value]="theme._id">
                      {{ theme.name }}
                    </option>
                  </select>
                </div>
                <button 
                  (click)="removeTheme(i)"
                  class="ml-2 text-red-600 hover:text-red-800 mt-8">
                  ✕
                </button>
              </div>

              <div *ngIf="themeAssoc.themeId && getThemeSubthemes(themeAssoc.themeId).length > 0">
                <label class="block text-gray-700 text-sm font-bold mb-2">Subtemas</label>
                <div class="space-y-2">
                  <label 
                    *ngFor="let subtheme of getThemeSubthemes(themeAssoc.themeId)"
                    class="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      [checked]="isSubthemeSelected(i, subtheme.name)"
                      (change)="toggleSubtheme(i, subtheme.name)"
                      class="rounded">
                    <span class="text-sm">{{ subtheme.name }}</span>
                  </label>
                </div>
              </div>
            </div>

            <button 
              (click)="addThemeAssociation()"
              class="w-full border-2 border-dashed border-gray-300 rounded py-3 text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors">
              + Agregar Tema
            </button>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="cancelThemes()"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Cancelar
            </button>
            <button 
              (click)="saveThemes()"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
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
