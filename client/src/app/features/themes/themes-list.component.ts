import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemesService, Theme } from '../../core/services/themes.service';

@Component({
  selector: 'app-themes-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Learning Themes</h1>
        <button 
          (click)="navigateToCreate()"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create New Theme
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-600">Loading themes...</p>
      </div>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let theme of themes" 
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          (click)="navigateToDetail(theme._id)">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-semibold text-gray-800">{{ theme.name }}</h2>
            <span 
              class="px-3 py-1 text-xs font-semibold rounded-full"
              [ngClass]="{
                'bg-green-100 text-green-800': theme.difficulty === 'beginner',
                'bg-yellow-100 text-yellow-800': theme.difficulty === 'intermediate',
                'bg-orange-100 text-orange-800': theme.difficulty === 'advanced',
                'bg-red-100 text-red-800': theme.difficulty === 'expert'
              }">
              {{ theme.difficulty }}
            </span>
          </div>
          
          <p class="text-gray-600 mb-4">{{ theme.description || 'No description available' }}</p>
          
          <div class="mb-4">
            <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
              {{ theme.category }}
            </span>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <span 
              *ngFor="let tag of theme.tags" 
              class="inline-block bg-blue-100 rounded-full px-2 py-1 text-xs text-blue-800">
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && themes.length === 0" class="text-center py-12">
        <p class="text-gray-600 text-lg">No themes available yet.</p>
        <button 
          (click)="navigateToCreate()"
          class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create First Theme
        </button>
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
