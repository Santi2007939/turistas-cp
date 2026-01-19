import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ThemesService, Theme } from '../../core/services/themes.service';
import { AuthService, User } from '../../core/services/auth.service';
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
          <div class="flex gap-2">
            <!-- Delete button for admin users -->
            <button 
              *ngIf="isAdmin"
              (click)="confirmDelete()"
              class="font-medium py-2 px-4 rounded-[12px] flex items-center gap-2"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #4A3B33;">
              <!-- Lucide Trash2 icon -->
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button 
              (click)="goBack()"
              class="font-medium py-2 px-4 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Back to Themes
            </button>
          </div>
        </div>

        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2" style="color: #2D2622;">Description</h2>
          <p style="color: #4A3B33;">{{ theme.description || 'No description available' }}</p>
        </div>

        <!-- Subthemes Section (Global visibility) -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-3 flex items-center gap-2" style="color: #2D2622;">
            <!-- Lucide Layers icon -->
            <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Subtopics
          </h2>
          
          <!-- Subtopics list when available -->
          <div *ngIf="theme.subthemes && theme.subthemes.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div 
              *ngFor="let subtheme of theme.subthemes" 
              class="rounded-[12px] p-4 cursor-pointer transition-all hover:shadow-md group relative"
              style="border: 1px solid #EAE3DB; background-color: #FCF9F5;"
              (click)="navigateToSubtopic(subtheme.name)">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold mb-1 flex items-center gap-2" style="color: #2D2622;">
                    {{ subtheme.name }}
                    <!-- Arrow icon to indicate clickable -->
                    <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style="color: #8B5E3C;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </h3>
                  <p *ngIf="subtheme.description" class="text-sm" style="color: #4A3B33;">{{ subtheme.description }}</p>
                </div>
                <!-- Admin delete button for subtopic -->
                <button 
                  *ngIf="isAdmin"
                  (click)="confirmDeleteSubtopic(subtheme, $event)"
                  class="p-2 rounded-[12px] transition-colors opacity-0 group-hover:opacity-100"
                  style="background-color: white; border: 1px solid #EAE3DB;"
                  title="Delete subtopic">
                  <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Empty state when no subtopics -->
          <div *ngIf="!theme.subthemes || theme.subthemes.length === 0" class="rounded-[12px] p-4 text-center" style="border: 1px solid #EAE3DB; background-color: #FCF9F5;">
            <p class="text-sm mb-2" style="color: #4A3B33;">No subtopics defined for this theme yet.</p>
          </div>
          
          <!-- Call to action to add subtopics via roadmap -->
          <div class="rounded-[12px] p-4 flex items-center gap-3" style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
            <!-- Lucide Info icon -->
            <svg class="w-5 h-5 flex-shrink-0" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4m0-4h.01" />
            </svg>
            <div class="flex-1">
              <p class="text-sm" style="color: #4A3B33;">
                Click on any subtopic to view and edit its content. Add this theme to your roadmap to track progress and add Personal Notes.
              </p>
            </div>
            <a 
              routerLink="/roadmap"
              class="text-white font-medium py-2 px-4 rounded-[12px] text-sm flex items-center gap-2"
              style="background-color: #8B5E3C;">
              <!-- Lucide ArrowRight icon -->
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Go to Roadmap
            </a>
          </div>
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
          Are you sure you want to delete <span class="font-semibold" style="color: #2D2622;">"{{ theme?.name }}"</span>?
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

    <!-- Subtopic Delete Confirmation Modal -->
    <div 
      *ngIf="showDeleteSubtopicConfirmation" 
      class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
      (click)="cancelDeleteSubtopic()">
      <div class="bg-white rounded-[12px] p-8 w-full max-w-md" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
        <div class="flex items-center gap-3 mb-4">
          <svg class="w-10 h-10" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-2xl font-semibold" style="color: #2D2622;">Delete Subtopic</h3>
        </div>
        
        <p class="mb-4" style="color: #4A3B33;">
          Are you sure you want to delete <span class="font-semibold" style="color: #2D2622;">"{{ subtopicToDelete?.name }}"</span>?
        </p>
        <p class="mb-6 text-sm" style="color: #4A3B33;">
          This will remove this subtopic from all users' roadmaps, including their personal notes and all shared content. This action cannot be undone.
        </p>

        <div class="flex gap-3 justify-end">
          <button 
            (click)="cancelDeleteSubtopic()"
            class="font-medium px-6 py-3 rounded-[12px] transition-all"
            style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
            Cancel
          </button>
          <button 
            (click)="deleteSubtopic()"
            [disabled]="deletingSubtopic"
            class="font-medium px-6 py-3 rounded-[12px] transition-all disabled:opacity-50"
            style="background-color: #8B5E3C; color: white;">
            {{ deletingSubtopic ? 'Deleting...' : 'Delete' }}
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
  currentUser: User | null = null;
  showDeleteConfirmation = false;
  deleting = false;
  showDeleteSubtopicConfirmation = false;
  subtopicToDelete: { name: string; description?: string } | null = null;
  deletingSubtopic = false;

  constructor(
    private themesService: ThemesService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeId = this.route.snapshot.paramMap.get('id');
    if (this.themeId) {
      this.loadTheme(this.themeId);
    }
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
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

  confirmDelete(): void {
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
  }

  deleteTheme(): void {
    if (!this.themeId) return;

    this.deleting = true;
    this.themesService.deleteTheme(this.themeId).subscribe({
      next: () => {
        this.deleting = false;
        this.router.navigate(['/themes']);
      },
      error: (err) => {
        this.deleting = false;
        this.error = 'Failed to delete theme. Please try again.';
        console.error('Error deleting theme:', err);
      }
    });
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

  navigateToSubtopic(subtopicName: string): void {
    if (this.themeId) {
      this.router.navigate(['/themes', this.themeId, 'subtopics', encodeURIComponent(subtopicName)]);
    }
  }

  confirmDeleteSubtopic(subtheme: { name: string; description?: string }, event: Event): void {
    event.stopPropagation();
    this.subtopicToDelete = subtheme;
    this.showDeleteSubtopicConfirmation = true;
  }

  cancelDeleteSubtopic(): void {
    this.showDeleteSubtopicConfirmation = false;
    this.subtopicToDelete = null;
  }

  deleteSubtopic(): void {
    if (!this.themeId || !this.subtopicToDelete) return;

    this.deletingSubtopic = true;
    this.themesService.deleteSubtopicGlobally(this.themeId, this.subtopicToDelete.name).subscribe({
      next: () => {
        this.deletingSubtopic = false;
        this.showDeleteSubtopicConfirmation = false;
        this.subtopicToDelete = null;
        // Reload theme to reflect changes
        this.loadTheme(this.themeId!);
      },
      error: (err) => {
        this.deletingSubtopic = false;
        this.error = 'Failed to delete subtopic. Please try again.';
        console.error('Error deleting subtopic:', err);
      }
    });
  }
}
