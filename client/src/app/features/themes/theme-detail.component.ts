import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ThemesService, Theme } from '../../core/services/themes.service';

@Component({
  selector: 'app-theme-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-600">Loading theme...</p>
      </div>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <div *ngIf="theme && !loading" class="bg-white rounded-lg shadow-md p-8">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ theme.name }}</h1>
            <div class="flex gap-2 items-center">
              <span 
                class="px-3 py-1 text-sm font-semibold rounded-full"
                [ngClass]="{
                  'bg-green-100 text-green-800': theme.difficulty === 'beginner',
                  'bg-yellow-100 text-yellow-800': theme.difficulty === 'intermediate',
                  'bg-orange-100 text-orange-800': theme.difficulty === 'advanced',
                  'bg-red-100 text-red-800': theme.difficulty === 'expert'
                }">
                {{ theme.difficulty }}
              </span>
              <span class="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                {{ theme.category }}
              </span>
            </div>
          </div>
          <button 
            (click)="goBack()"
            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Back to Themes
          </button>
        </div>

        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Description</h2>
          <p class="text-gray-600">{{ theme.description || 'No description available' }}</p>
        </div>

        <div class="mb-6" *ngIf="theme.tags && theme.tags.length > 0">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Tags</h2>
          <div class="flex flex-wrap gap-2">
            <span 
              *ngFor="let tag of theme.tags" 
              class="inline-block bg-blue-100 rounded-full px-3 py-1 text-sm text-blue-800">
              #{{ tag }}
            </span>
          </div>
        </div>

        <div class="mb-6" *ngIf="theme.resources && theme.resources.length > 0">
          <h2 class="text-xl font-semibold text-gray-800 mb-3">Learning Resources</h2>
          <div class="space-y-3">
            <div 
              *ngFor="let resource of theme.resources" 
              class="border border-gray-200 rounded p-4 hover:bg-gray-50">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-gray-800">{{ resource.title }}</h3>
                  <a 
                    [href]="resource.url" 
                    target="_blank"
                    class="text-blue-600 hover:text-blue-800 text-sm break-all">
                    {{ resource.url }}
                  </a>
                </div>
                <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  {{ resource.type }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-200">
          <button 
            routerLink="/roadmap"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
            Add to My Roadmap
          </button>
        </div>
      </div>
    </div>
  `
})
export class ThemeDetailComponent implements OnInit {
  theme: Theme | null = null;
  loading = false;
  error: string | null = null;
  themeId: string | null = null;

  constructor(
    private themesService: ThemesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeId = this.route.snapshot.paramMap.get('id');
    if (this.themeId) {
      this.loadTheme(this.themeId);
    }
  }

  loadTheme(id: string): void {
    this.loading = true;
    this.error = null;
    
    this.themesService.getTheme(id).subscribe({
      next: (response) => {
        this.theme = response.data.theme;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load theme. Please try again later.';
        this.loading = false;
        console.error('Error loading theme:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/themes']);
  }
}
