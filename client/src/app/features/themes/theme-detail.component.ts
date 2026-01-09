import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ThemesService, Theme } from '../../core/services/themes.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-theme-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <!-- Matte-Drift Theme Detail -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
      <div *ngIf="loading" class="text-center py-8">
        <p style="color: #4A3B33;">Loading theme...</p>
      </div>

      <div *ngIf="error" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #EAE3DB; color: #2D2622;">
        {{ error }}
      </div>

      <div *ngIf="theme && !loading" class="bg-white rounded-[12px] p-8" style="border: 1px solid #EAE3DB;">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-3xl font-semibold mb-2" style="color: #2D2622;">{{ theme.name }}</h1>
            <div class="flex gap-2 items-center">
              <span 
                class="px-3 py-1 text-sm font-semibold rounded-[12px]"
                [ngStyle]="getDifficultyStyle(theme.difficulty)">
                {{ theme.difficulty }}
              </span>
              <span class="rounded-[12px] px-3 py-1 text-sm font-semibold" style="background-color: #FCF9F5; color: #4A3B33; border: 1px solid #EAE3DB;">
                {{ theme.category }}
              </span>
            </div>
          </div>
          <button 
            (click)="goBack()"
            class="font-medium py-2 px-4 rounded-[12px]"
            style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
            Back to Themes
          </button>
        </div>

        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2" style="color: #2D2622;">Description</h2>
          <p style="color: #4A3B33;">{{ theme.description || 'No description available' }}</p>
        </div>

        <div class="mb-6" *ngIf="theme.tags && theme.tags.length > 0">
          <h2 class="text-xl font-semibold mb-2" style="color: #2D2622;">Tags</h2>
          <div class="flex flex-wrap gap-2">
            <span 
              *ngFor="let tag of theme.tags" 
              class="inline-block rounded-[12px] px-3 py-1 text-sm"
              style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
              #{{ tag }}
            </span>
          </div>
        </div>

        <div class="mb-6" *ngIf="theme.resources && theme.resources.length > 0">
          <h2 class="text-xl font-semibold mb-3" style="color: #2D2622;">Learning Resources</h2>
          <div class="space-y-3">
            <div 
              *ngFor="let resource of theme.resources" 
              class="rounded-[12px] p-4"
              style="border: 1px solid #EAE3DB;">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold" style="color: #2D2622;">{{ resource.title }}</h3>
                  <a 
                    [href]="resource.url" 
                    target="_blank"
                    class="text-sm break-all hover:underline"
                    style="color: #8B5E3C;">
                    {{ resource.url }}
                  </a>
                </div>
                <span class="text-xs px-2 py-1 rounded-[12px]" style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                  {{ resource.type }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-6" style="border-top: 1px solid #EAE3DB;">
          <button 
            routerLink="/roadmap"
            class="text-white font-medium py-2 px-6 rounded-[12px]"
            style="background-color: #8B5E3C;">
            Add to My Roadmap
          </button>
        </div>
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

  getDifficultyStyle(difficulty: string): { [key: string]: string } {
    // Matte-Drift palette with subtle variations for difficulty levels
    const difficultyStyles: { [key: string]: { [key: string]: string } } = {
      'beginner': { 'background-color': '#FCF9F5', 'color': '#4A3B33', 'border': '1px solid #EAE3DB' },
      'intermediate': { 'background-color': '#FCF9F5', 'color': '#D4A373', 'border': '1px solid #D4A373' },
      'advanced': { 'background-color': '#FCF9F5', 'color': '#8B5E3C', 'border': '1px solid #8B5E3C' },
      'expert': { 'background-color': '#FCF9F5', 'color': '#A05E4A', 'border': '1px solid #A05E4A' }
    };
    return difficultyStyles[difficulty] || difficultyStyles['beginner'];
  }
}
