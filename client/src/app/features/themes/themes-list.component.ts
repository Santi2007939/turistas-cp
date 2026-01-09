import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemesService, Theme } from '../../core/services/themes.service';
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
          class="bg-white rounded-[12px] p-6 cursor-pointer transition-colors"
          style="border: 1px solid #EAE3DB;"
          (click)="navigateToDetail(theme._id)">
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
              {{ theme.subthemes.length }} subtema{{ theme.subthemes.length !== 1 ? 's' : '' }}
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
  `
})
export class ThemesListComponent implements OnInit {
  themes: Theme[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private themesService: ThemesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadThemes();
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
}
