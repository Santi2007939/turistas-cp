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
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <div class="container mx-auto px-4 py-8">
        <div class="max-w-3xl mx-auto">
          <div class="mb-6">
            <button 
              (click)="goBack()"
              class="text-gray-600 hover:text-gray-900 flex items-center">
              <span class="mr-2">←</span> Back to Themes
            </button>
          </div>

          <div class="bg-white rounded-lg shadow-md p-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-6">Create New Theme</h1>

            <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {{ error }}
            </div>

            <form (ngSubmit)="saveTheme()" class="space-y-6">
              <!-- Name -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Name *</label>
                <input 
                  type="text"
                  [(ngModel)]="theme.name"
                  name="name"
                  required
                  class="w-full border rounded px-3 py-2"
                  placeholder="e.g., Dynamic Programming">
              </div>

              <!-- Description -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Description *</label>
                <textarea 
                  [(ngModel)]="theme.description"
                  name="description"
                  required
                  rows="4"
                  class="w-full border rounded px-3 py-2"
                  placeholder="Describe the theme..."></textarea>
              </div>

              <!-- Category -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Category *</label>
                <select 
                  [(ngModel)]="theme.category"
                  name="category"
                  required
                  class="w-full border rounded px-3 py-2">
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
                <label class="block text-gray-700 text-sm font-bold mb-2">Difficulty *</label>
                <select 
                  [(ngModel)]="theme.difficulty"
                  name="difficulty"
                  required
                  class="w-full border rounded px-3 py-2">
                  <option value="">Select difficulty...</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <!-- Tags -->
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Tags (comma-separated)</label>
                <input 
                  type="text"
                  [(ngModel)]="tagsInput"
                  name="tags"
                  class="w-full border rounded px-3 py-2"
                  placeholder="e.g., optimization, recursion, memoization">
                <p class="text-xs text-gray-600 mt-1">Separate tags with commas</p>
              </div>

              <!-- Subthemes -->
              <div class="border rounded p-4 bg-gray-50">
                <label class="block text-gray-700 text-sm font-bold mb-3">Subthemes</label>
                
                <div class="space-y-3 mb-3">
                  <div *ngFor="let subtheme of theme.subthemes; let i = index" class="border rounded p-3 bg-white">
                    <div class="flex gap-2 mb-2">
                      <input 
                        type="text"
                        [(ngModel)]="subtheme.name"
                        [name]="'subtheme-name-' + i"
                        class="flex-1 border rounded px-3 py-2"
                        placeholder="Subtheme name">
                      <button 
                        type="button"
                        (click)="removeSubtheme(i)"
                        class="text-red-600 hover:text-red-800 px-3">
                        ✕
                      </button>
                    </div>
                    <textarea 
                      [(ngModel)]="subtheme.description"
                      [name]="'subtheme-desc-' + i"
                      rows="2"
                      class="w-full border rounded px-3 py-2"
                      placeholder="Subtheme description (optional)"></textarea>
                  </div>
                </div>

                <button 
                  type="button"
                  (click)="addSubtheme()"
                  class="w-full border-2 border-dashed border-gray-300 rounded py-2 text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors">
                  + Add Subtheme
                </button>
              </div>

              <!-- Resources -->
              <div class="border rounded p-4 bg-gray-50">
                <label class="block text-gray-700 text-sm font-bold mb-3">Learning Resources</label>
                
                <div class="space-y-3 mb-3">
                  <div *ngFor="let resource of theme.resources; let i = index" class="border rounded p-3 bg-white">
                    <div class="flex gap-2 mb-2">
                      <input 
                        type="text"
                        [(ngModel)]="resource.title"
                        [name]="'resource-title-' + i"
                        class="flex-1 border rounded px-3 py-2"
                        placeholder="Resource title">
                      <select 
                        [(ngModel)]="resource.type"
                        [name]="'resource-type-' + i"
                        class="border rounded px-3 py-2">
                        <option value="article">Article</option>
                        <option value="video">Video</option>
                        <option value="book">Book</option>
                        <option value="tutorial">Tutorial</option>
                        <option value="other">Other</option>
                      </select>
                      <button 
                        type="button"
                        (click)="removeResource(i)"
                        class="text-red-600 hover:text-red-800 px-3">
                        ✕
                      </button>
                    </div>
                    <input 
                      type="url"
                      [(ngModel)]="resource.url"
                      [name]="'resource-url-' + i"
                      class="w-full border rounded px-3 py-2"
                      placeholder="https://...">
                  </div>
                </div>

                <button 
                  type="button"
                  (click)="addResource()"
                  class="w-full border-2 border-dashed border-gray-300 rounded py-2 text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors">
                  + Add Resource
                </button>
              </div>

              <!-- Submit Buttons -->
              <div class="flex gap-2 justify-end pt-4">
                <button 
                  type="button"
                  (click)="goBack()"
                  class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded">
                  Cancel
                </button>
                <button 
                  type="submit"
                  [disabled]="!isFormValid() || saving"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-300">
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
