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
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold flex items-center gap-2" style="color: #2D2622;">
          <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Learning Themes
        </h1>
        <button 
          (click)="navigateToCreate()"
          class="text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2"
          style="background-color: #8B5E3C;">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create New Theme
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p style="color: #4A3B33;">Loading themes...</p>
      </div>

      <div *ngIf="error" class="bg-white rounded-2xl border-l-4 border-red-500 px-6 py-4 mb-4" style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let theme of themes" 
          class="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
          style="box-shadow: 0 2px 8px rgba(74, 59, 51, 0.05);"
          (click)="navigateToDetail(theme._id)">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-semibold" style="color: #2D2622;">{{ theme.name }}</h2>
            <span 
              class="px-3 py-1 text-xs font-medium rounded-full"
              style="background-color: #F2E9E1; color: #4A3B33;">
              {{ theme.difficulty }}
            </span>
          </div>
          
          <p class="mb-4" style="color: #4A3B33;">{{ theme.description || 'No description available' }}</p>
          
          <div class="mb-4">
            <span class="inline-block rounded-full px-3 py-1 text-sm font-medium mr-2" style="background-color: #F2E9E1; color: #4A3B33;">
              {{ theme.category }}
            </span>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <span 
              *ngFor="let tag of theme.tags" 
              class="inline-block rounded-full px-3 py-1 text-xs font-medium"
              style="background-color: #F2E9E1; color: #8B5E3C;">
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && themes.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <p class="text-lg mb-4" style="color: #4A3B33;">No themes available yet.</p>
        <button 
          (click)="navigateToCreate()"
          class="text-white font-bold py-2 px-4 rounded-xl"
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
