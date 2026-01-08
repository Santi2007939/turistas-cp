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
    <!-- Safe Room Themes List -->
    <div class="min-h-screen bg-[#F4F4F4]">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-[#1A1A1A] font-mono">Learning Themes</h1>
        <button 
          (click)="navigateToCreate()"
          class="bg-[#1A1A1A] hover:bg-gray-800 text-white font-medium py-2 px-4">
          Create New Theme
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-600">Loading themes...</p>
      </div>

      <div *ngIf="error" class="bg-red-50 border-2 border-red-600 text-red-700 px-6 py-4 mb-4">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let theme of themes" 
          class="bg-white p-6 border-2 border-[#D1D1D1] hover:border-[#1A1A1A] transition-colors cursor-pointer"
          (click)="navigateToDetail(theme._id)">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-semibold text-[#1A1A1A] font-mono">{{ theme.name }}</h2>
            <span 
              class="px-3 py-1 text-xs font-semibold"
              [ngClass]="{
                'bg-[#F4F4F4] text-[#1A1A1A] border border-[#D1D1D1]': theme.difficulty === 'beginner',
                'bg-[#FFB400] text-[#1A1A1A]': theme.difficulty === 'intermediate',
                'bg-[#1A1A1A] text-white': theme.difficulty === 'advanced',
                'bg-red-600 text-white': theme.difficulty === 'expert'
              }">
              {{ theme.difficulty }}
            </span>
          </div>
          
          <p class="text-gray-600 mb-4">{{ theme.description || 'No description available' }}</p>
          
          <div class="mb-4">
            <span class="inline-block bg-[#F4F4F4] px-3 py-1 text-sm font-medium text-[#1A1A1A] border border-[#D1D1D1] mr-2">
              {{ theme.category }}
            </span>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <span 
              *ngFor="let tag of theme.tags" 
              class="inline-block bg-white px-2 py-1 text-xs text-gray-600 border border-[#D1D1D1]">
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && themes.length === 0" class="text-center py-12">
        <p class="text-gray-600 text-lg">No themes available yet.</p>
        <button 
          (click)="navigateToCreate()"
          class="mt-4 bg-[#1A1A1A] hover:bg-gray-800 text-white font-medium py-2 px-4">
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
