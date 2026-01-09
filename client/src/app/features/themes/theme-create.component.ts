import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemesService, Theme, Subtheme } from '../../core/services/themes.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-theme-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <!-- Matte-Drift Theme Create -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <div class="container mx-auto px-6 py-8">
        <div class="max-w-3xl mx-auto">
          <div class="mb-6">
            <button 
              (click)="goBack()"
              class="flex items-center hover:underline"
              style="color: #4A3B33;">
              <span class="mr-2">←</span> Back to Themes
            </button>
          </div>

          <div class="bg-white rounded-[12px] p-8" style="border: 1px solid #EAE3DB;">
            <h1 class="text-3xl font-semibold mb-6" style="color: #2D2622;">Create New Theme</h1>

            <div *ngIf="error" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #EAE3DB; color: #2D2622;">
              {{ error }}
            </div>

            <form (ngSubmit)="saveTheme()" class="space-y-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Name *</label>
                <input 
                  type="text"
                  [(ngModel)]="theme.name"
                  name="name"
                  required
                  class="w-full rounded-[12px] px-4 py-3"
                  style="border: 1px solid #EAE3DB; color: #2D2622;"
                  placeholder="e.g., Dynamic Programming">
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Description *</label>
                <textarea 
                  [(ngModel)]="theme.description"
                  name="description"
                  required
                  rows="4"
                  class="w-full rounded-[12px] px-4 py-3"
                  style="border: 1px solid #EAE3DB; color: #2D2622;"
                  placeholder="Describe the theme..."></textarea>
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Category *</label>
                <select 
                  [(ngModel)]="theme.category"
                  name="category"
                  required
                  class="w-full rounded-[12px] px-4 py-3"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
                  <option value="">Select a category...</option>
                  <option value="algorithms">Algorithms</option>
                  <option value="data-structures">Data Structures</option>
                  <option value="math">Math</option>
                  <option value="strings">Strings</option>
                  <option value="graph">Graph</option>
                  <option value="dp">Dynamic Programming</option>
                  <option value="greedy">Greedy</option>
                  <option value="geometry">Geometry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <!-- Difficulty -->
              <div>
                <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Difficulty *</label>
                <select 
                  [(ngModel)]="theme.difficulty"
                  name="difficulty"
                  required
                  class="w-full rounded-[12px] px-4 py-3"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
                  <option value="">Select difficulty...</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <!-- Tags -->
              <div>
                <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Tags (comma-separated)</label>
                <input 
                  type="text"
                  [(ngModel)]="tagsInput"
                  name="tags"
                  class="w-full rounded-[12px] px-4 py-3"
                  style="border: 1px solid #EAE3DB; color: #2D2622;"
                  placeholder="e.g., optimization, recursion, memoization">
                <p class="text-xs mt-1" style="color: #4A3B33;">Separate tags with commas</p>
              </div>

              <!-- Subthemes -->
              <div class="rounded-[12px] p-4" style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
                <label class="block text-sm font-medium mb-3 flex items-center gap-2" style="color: #2D2622;">
                  <!-- Lucide Layers icon -->
                  <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Subthemes
                </label>
                
                <div class="space-y-3 mb-3">
                  <div *ngFor="let subtheme of theme.subthemes; let i = index" class="rounded-[12px] p-3 bg-white" style="border: 1px solid #EAE3DB;">
                    <div class="flex gap-2 mb-2">
                      <input 
                        type="text"
                        [(ngModel)]="subtheme.name"
                        [name]="'subtheme-name-' + i"
                        class="flex-1 rounded-[12px] px-3 py-2"
                        style="border: 1px solid #EAE3DB; color: #2D2622;"
                        placeholder="Subtheme name">
                      <button 
                        type="button"
                        (click)="removeSubtheme(i)"
                        class="px-3"
                        style="color: #4A3B33;">
                        <!-- Lucide X icon -->
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <textarea 
                      [(ngModel)]="subtheme.description"
                      [name]="'subtheme-desc-' + i"
                      rows="2"
                      class="w-full rounded-[12px] px-3 py-2"
                      style="border: 1px solid #EAE3DB; color: #2D2622;"
                      placeholder="Subtheme description (optional)"></textarea>
                  </div>
                </div>

                <button 
                  type="button"
                  (click)="addSubtheme()"
                  class="w-full border-2 border-dashed rounded-[12px] py-2 transition-colors flex items-center justify-center gap-2"
                  style="border-color: #EAE3DB; color: #4A3B33;">
                  <!-- Lucide Plus icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Subtheme
                </button>
              </div>

              <!-- Resources -->
              <div class="rounded-[12px] p-4" style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
                <label class="block text-sm font-medium mb-3 flex items-center gap-2" style="color: #2D2622;">
                  <!-- Lucide BookOpen icon -->
                  <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Learning Resources
                </label>
                
                <div class="space-y-3 mb-3">
                  <div *ngFor="let resource of theme.resources; let i = index" class="rounded-[12px] p-3 bg-white" style="border: 1px solid #EAE3DB;">
                    <div class="flex gap-2 mb-2">
                      <input 
                        type="text"
                        [(ngModel)]="resource.title"
                        [name]="'resource-title-' + i"
                        class="flex-1 rounded-[12px] px-3 py-2"
                        style="border: 1px solid #EAE3DB; color: #2D2622;"
                        placeholder="Resource title">
                      <select 
                        [(ngModel)]="resource.type"
                        [name]="'resource-type-' + i"
                        class="rounded-[12px] px-3 py-2"
                        style="border: 1px solid #EAE3DB; color: #2D2622;">
                        <option value="article">Article</option>
                        <option value="video">Video</option>
                        <option value="book">Book</option>
                        <option value="tutorial">Tutorial</option>
                        <option value="other">Other</option>
                      </select>
                      <button 
                        type="button"
                        (click)="removeResource(i)"
                        class="px-3"
                        style="color: #4A3B33;">
                        <!-- Lucide X icon -->
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <input 
                      type="url"
                      [(ngModel)]="resource.url"
                      [name]="'resource-url-' + i"
                      class="w-full rounded-[12px] px-3 py-2"
                      style="border: 1px solid #EAE3DB; color: #2D2622;"
                      placeholder="https://...">
                  </div>
                </div>

                <button 
                  type="button"
                  (click)="addResource()"
                  class="w-full border-2 border-dashed rounded-[12px] py-2 transition-colors flex items-center justify-center gap-2"
                  style="border-color: #EAE3DB; color: #4A3B33;">
                  <!-- Lucide Plus icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Resource
                </button>
              </div>

              <!-- Submit Buttons -->
              <div class="flex gap-2 justify-end pt-4">
                <button 
                  type="button"
                  (click)="goBack()"
                  class="px-6 py-2 rounded-[12px]"
                  style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                  Cancel
                </button>
                <button 
                  type="submit"
                  [disabled]="!isFormValid() || saving"
                  class="text-white px-6 py-2 rounded-[12px] disabled:opacity-50 flex items-center gap-2"
                  style="background-color: #8B5E3C;">
                  <!-- Lucide Save icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {{ saving ? 'Creating...' : 'Create Theme' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ThemeCreateComponent {
  theme: Partial<Theme> = {
    name: '',
    description: '',
    tags: [],
    subthemes: [],
    resources: [],
    isPublic: true
  };

  tagsInput: string = '';
  error: string | null = null;
  saving = false;

  constructor(
    private themesService: ThemesService,
    private router: Router
  ) {}

  addSubtheme(): void {
    this.theme.subthemes = this.theme.subthemes || [];
    this.theme.subthemes.push({ name: '', description: '' });
  }

  removeSubtheme(index: number): void {
    this.theme.subthemes?.splice(index, 1);
  }

  addResource(): void {
    this.theme.resources = this.theme.resources || [];
    this.theme.resources.push({
      title: '',
      url: '',
      type: 'article'
    });
  }

  removeResource(index: number): void {
    this.theme.resources?.splice(index, 1);
  }

  isFormValid(): boolean {
    return !!(
      this.theme.name &&
      this.theme.description &&
      this.theme.category &&
      this.theme.difficulty
    );
  }

  saveTheme(): void {
    if (!this.isFormValid()) return;

    this.saving = true;
    this.error = null;

    // Parse tags from input
    this.theme.tags = this.tagsInput
      ? this.tagsInput.split(',').map(t => t.trim()).filter(t => t)
      : [];

    // Filter out empty subthemes and resources
    this.theme.subthemes = (this.theme.subthemes || []).filter(s => s.name);
    this.theme.resources = (this.theme.resources || []).filter(r => r.title && r.url);

    this.themesService.createTheme(this.theme).subscribe({
      next: (response) => {
        this.saving = false;
        this.router.navigate(['/themes']);
      },
      error: (err) => {
        this.error = 'Failed to create theme. Please try again.';
        this.saving = false;
        console.error('Error creating theme:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/themes']);
  }
}
