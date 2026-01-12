import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemesService, Theme } from '../../core/services/themes.service';
import { AuthService, User } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-themes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <!-- Matte-Drift Themes List -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-semibold" style="color: #2D2622;">Learning Themes</h1>
        <button 
          (click)="navigateToCreate()"
          class="text-white font-medium py-3 px-6 rounded-[12px]"
          style="background-color: #8B5E3C;">
          Create New Theme
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p style="color: #4A3B33;">Loading themes...</p>
      </div>

      <div *ngIf="error" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #EAE3DB; color: #2D2622;">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let theme of themes" 
          class="bg-white rounded-[12px] p-6 cursor-pointer transition-colors relative"
          style="border: 1px solid #EAE3DB;"
          (click)="navigateToDetail(theme._id)">
          
          <!-- Delete button for admin users -->
          <button 
            *ngIf="isAdmin"
            (click)="confirmDelete(theme, $event)"
            class="absolute top-3 right-3 p-2 rounded-[12px] transition-colors"
            style="background-color: #FCF9F5; border: 1px solid #EAE3DB;"
            title="Delete theme">
            <!-- Lucide Trash2 icon -->
            <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-semibold" style="color: #2D2622;">{{ theme.name }}</h2>
            <span 
              class="px-3 py-1 text-xs font-semibold rounded-[12px]"
              [ngStyle]="{
                'background-color': theme.difficulty === 'beginner' ? '#FCF9F5' : 
                                     theme.difficulty === 'intermediate' ? '#FCF9F5' : 
                                     theme.difficulty === 'advanced' ? '#FCF9F5' : '#FCF9F5',
                'color': '#8B5E3C',
                'border': '1px solid #EAE3DB'
              }">
              {{ theme.difficulty }}
            </span>
          </div>
          
          <p class="mb-4" style="color: #4A3B33;">{{ theme.description || 'No description available' }}</p>
          
          <div class="mb-4 flex flex-wrap gap-2">
            <span class="inline-block rounded-[12px] px-3 py-1 text-sm font-semibold" style="background-color: #FCF9F5; color: #2D2622; border: 1px solid #EAE3DB;">
              {{ theme.category }}
            </span>
            <!-- Subthemes count badge -->
            <span 
              *ngIf="theme.subthemes && theme.subthemes.length > 0"
              class="inline-flex items-center gap-1 rounded-[12px] px-3 py-1 text-sm font-semibold" 
              style="background-color: #FCF9F5; color: #4A3B33; border: 1px solid #EAE3DB;">
              <!-- Lucide Layers icon -->
              <svg class="w-3 h-3" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              {{ theme.subthemes.length }} subtopic{{ theme.subthemes.length !== 1 ? 's' : '' }}
            </span>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <span 
              *ngFor="let tag of theme.tags" 
              class="inline-block rounded-[12px] px-2 py-1 text-xs"
              style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && themes.length === 0" class="text-center py-12">
        <p class="text-lg mb-4" style="color: #4A3B33;">No themes available yet.</p>
        <button 
          (click)="navigateToCreate()"
          class="text-white font-medium py-3 px-6 rounded-[12px]"
          style="background-color: #8B5E3C;">
          Create First Theme
        </button>
      </div>
    </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      *ngIf="showDeleteConfirmation" 
      class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
      (click)="cancelDelete()">
      <div class="bg-white rounded-[12px] p-8 w-full max-w-md" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
        <div class="flex items-center gap-3 mb-4">
          <!-- Lucide AlertTriangle icon -->
          <svg class="w-10 h-10" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-2xl font-semibold" style="color: #2D2622;">Confirm Deletion</h3>
        </div>
        
        <p class="mb-6" style="color: #4A3B33;">
          Are you sure you want to delete <span class="font-semibold" style="color: #2D2622;">"{{ themeToDelete?.name }}"</span>?
          This action cannot be undone.
        </p>

        <div class="flex gap-3 justify-end">
          <button 
            (click)="cancelDelete()"
            class="font-medium px-6 py-3 rounded-[12px] transition-all"
            style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
            Cancel
          </button>
          <button 
            (click)="deleteTheme()"
            [disabled]="deleting"
            class="font-medium px-6 py-3 rounded-[12px] transition-all disabled:opacity-50"
            style="background-color: #8B5E3C; color: white;">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ThemesListComponent implements OnInit {
  themes: Theme[] = [];
  loading = false;
  error: string | null = null;
  currentUser: User | null = null;
  showDeleteConfirmation = false;
  themeToDelete: Theme | null = null;
  deleting = false;

  constructor(
    private themesService: ThemesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadThemes();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  loadThemes(): void {
    this.loading = true;
    this.error = null;
    
    this.themesService.getThemes().subscribe({
      next: (response) => {
        this.themes = response.data.themes;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load themes. Please try again later.';
        this.loading = false;
        console.error('Error loading themes:', err);
      }
    });
  }

  navigateToDetail(themeId: string): void {
    this.router.navigate(['/themes', themeId]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/themes/create']);
  }

  confirmDelete(theme: Theme, event: Event): void {
    event.stopPropagation();
    this.themeToDelete = theme;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.themeToDelete = null;
  }

  deleteTheme(): void {
    if (!this.themeToDelete) return;

    this.deleting = true;
    this.themesService.deleteTheme(this.themeToDelete._id).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteConfirmation = false;
        this.themeToDelete = null;
        this.loadThemes();
      },
      error: (err) => {
        this.deleting = false;
        this.error = 'Failed to delete theme. Please try again.';
        console.error('Error deleting theme:', err);
      }
    });
  }
}
