import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemesService, SubtopicContent } from '../../core/services/themes.service';
import { AuthService, User } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-subtopic-content',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
        <!-- Header -->
        <div class="bg-white rounded-[12px] p-6 mb-6" style="border: 1px solid #EAE3DB;">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <button 
                (click)="goBack()"
                class="font-medium flex items-center gap-1"
                style="color: #4A3B33;">
                <!-- Lucide ArrowLeft icon -->
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Theme
              </button>
              <div>
                <p class="text-sm" style="color: #4A3B33;">{{ themeName }}</p>
                <h1 class="text-2xl font-semibold" style="color: #2D2622;">{{ subtopic?.name }}</h1>
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
                Delete Subtopic
              </button>
              <!-- Add to roadmap button if user doesn't have theme in roadmap -->
              <a 
                *ngIf="!subtopic?.userHasThemeInRoadmap"
                routerLink="/roadmap"
                class="text-white font-medium py-2 px-4 rounded-[12px] flex items-center gap-2"
                style="background-color: #8B5E3C;">
                Add to Roadmap
              </a>
            </div>
          </div>
          
          <!-- Description -->
          <p *ngIf="subtopic?.description" style="color: #4A3B33;">{{ subtopic?.description }}</p>
          
          <!-- Info banner when user doesn't have theme in roadmap -->
          <div *ngIf="subtopic && !subtopic.userHasThemeInRoadmap" 
               class="mt-4 rounded-[12px] p-4 flex items-center gap-3" 
               style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
            <!-- Lucide Info icon -->
            <svg class="w-5 h-5 flex-shrink-0" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4m0-4h.01" />
            </svg>
            <p class="text-sm" style="color: #4A3B33;">
              Add this theme to your roadmap to access Personal Notes and contribute your own content.
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <svg class="w-12 h-12 mx-auto mb-4 animate-spin" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p style="color: #4A3B33;">Loading subtopic content...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-white rounded-[12px] p-6 mb-6" style="border-left: 4px solid #8B5E3C; border-right: 1px solid #EAE3DB; border-top: 1px solid #EAE3DB; border-bottom: 1px solid #EAE3DB;">
          <div class="flex items-start">
            <svg class="w-6 h-6 mr-3" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 class="font-semibold" style="color: #2D2622;">Error</h3>
              <p class="mt-1" style="color: #4A3B33;">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div *ngIf="!loading && subtopic" class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
          <!-- Tabs -->
          <div class="mb-4" style="border-bottom: 1px solid #EAE3DB;">
            <div class="flex gap-2 overflow-x-auto">
              <button 
                *ngFor="let tab of getAvailableTabs()"
                (click)="activeTab = tab.id"
                class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2"
                [ngStyle]="{
                  'border-bottom-color': activeTab === tab.id ? '#8B5E3C' : 'transparent',
                  'color': activeTab === tab.id ? '#8B5E3C' : '#4A3B33'
                }">
                <ng-container [ngSwitch]="tab.id">
                  <!-- Lock icon for personal -->
                  <svg *ngSwitchCase="'personal'" class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <!-- BookOpen icon for theory -->
                  <svg *ngSwitchCase="'theory'" class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <!-- Code icon for code -->
                  <svg *ngSwitchCase="'code'" class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  <!-- Target icon for problems -->
                  <svg *ngSwitchCase="'problems'" class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                  <!-- BookOpen icon for resources -->
                  <svg *ngSwitchCase="'resources'" class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </ng-container>
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="mt-4">
            <!-- Personal Notes (only if user has theme in roadmap) -->
            <div *ngIf="activeTab === 'personal' && subtopic.userHasThemeInRoadmap">
              <div class="rounded-[12px] p-4 mb-4" style="background-color: #FCF9F5; border-left: 4px solid #D4A373;">
                <p class="text-sm flex items-center gap-2" style="color: #4A3B33;">
                  <!-- Lucide Lock icon -->
                  <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  These notes are private and only you can see them
                </p>
              </div>
              <div 
                class="w-full rounded-[12px] px-4 py-3 min-h-[200px] whitespace-pre-wrap"
                style="border: 1px solid #EAE3DB; color: #2D2622; background-color: #FCF9F5;">
                {{ subtopic.personalNotes || 'No personal notes yet. Add this theme to your roadmap to write notes.' }}
              </div>
            </div>

            <!-- Shared Theory -->
            <div *ngIf="activeTab === 'theory'">
              <div class="rounded-[12px] p-4 mb-4" style="background-color: #FCF9F5; border-left: 4px solid #8B5E3C;">
                <p class="text-sm" style="color: #4A3B33;">
                  🌐 Shared theory contributed by team members
                </p>
              </div>
              <div 
                class="w-full rounded-[12px] px-4 py-3 min-h-[200px] whitespace-pre-wrap"
                style="border: 1px solid #EAE3DB; color: #2D2622; background-color: #FCF9F5;">
                {{ subtopic.sharedTheory || 'No shared theory content yet.' }}
              </div>
            </div>

            <!-- Code Snippets -->
            <div *ngIf="activeTab === 'code'">
              <div class="space-y-4">
                <div *ngFor="let snippet of subtopic.codeSnippets; let j = index" 
                     class="rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                  <div class="flex items-center justify-between mb-3">
                    <span class="rounded-[12px] px-3 py-1 text-sm" style="border: 1px solid #EAE3DB; color: #2D2622; background-color: #FCF9F5;">
                      {{ snippet.language }}
                    </span>
                  </div>
                  <p *ngIf="snippet.description" class="text-sm mb-2" style="color: #4A3B33;">{{ snippet.description }}</p>
                  <pre class="rounded-[12px] p-4 overflow-x-auto" style="background-color: #2D2622;"><code style="color: #D4A373;">{{ snippet.code }}</code></pre>
                </div>
                
                <!-- Empty State -->
                <div *ngIf="!subtopic.codeSnippets || subtopic.codeSnippets.length === 0" 
                     class="text-center py-8" style="color: #4A3B33;">
                  <!-- Lucide Code icon -->
                  <svg class="w-10 h-10 mx-auto mb-2" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  <p class="text-sm">No code snippets yet</p>
                </div>
              </div>
            </div>

            <!-- Problems -->
            <div *ngIf="activeTab === 'problems'">
              <div class="rounded-[12px] p-4 mb-4" style="background-color: #FCF9F5; border-left: 4px solid #8B5E3C;">
                <p class="text-sm flex items-center gap-2" style="color: #4A3B33;">
                  <!-- Lucide Code icon -->
                  <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  Problems linked to this subtopic
                </p>
              </div>
              <div class="space-y-3">
                <!-- Problem Cards -->
                <div *ngFor="let problem of subtopic.linkedProblems" 
                     class="border-l-4 rounded-[12px] p-4 bg-white"
                     [ngStyle]="{
                       'border-left-color': problem.difficulty === 'easy' ? '#D4A373' : problem.difficulty === 'medium' ? '#8B5E3C' : problem.difficulty === 'hard' ? '#4A3B33' : '#2D2622',
                       'border-right': '1px solid #EAE3DB',
                       'border-top': '1px solid #EAE3DB',
                       'border-bottom': '1px solid #EAE3DB'
                     }">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <h4 class="font-semibold mb-1" style="color: #2D2622;">{{ problem.title }}</h4>
                      <p *ngIf="problem.description" class="text-sm mb-2" style="color: #4A3B33;">
                        {{ problem.description }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span 
                      class="text-xs px-2 py-1 rounded-[12px] font-medium"
                      style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #8B5E3C;">
                      {{ getDifficultyLabel(problem.difficulty) }}
                    </span>
                    
                    <div class="flex gap-2">
                      <a 
                        *ngIf="problem.link"
                        [href]="problem.link" 
                        target="_blank"
                        class="text-xs flex items-center gap-1"
                        style="color: #8B5E3C;">
                        <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open
                      </a>
                      <a 
                        [routerLink]="['/problems', problem.problemId]"
                        class="text-xs"
                        style="color: #8B5E3C;">
                        View details
                      </a>
                    </div>
                  </div>
                </div>
                
                <!-- Empty State -->
                <div *ngIf="!subtopic.linkedProblems || subtopic.linkedProblems.length === 0"
                     class="text-center py-8" style="color: #4A3B33;">
                  <!-- Lucide FileText icon -->
                  <svg class="w-10 h-10 mx-auto mb-2" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-sm">No linked problems</p>
                </div>
              </div>
            </div>

            <!-- Resources -->
            <div *ngIf="activeTab === 'resources'">
              <div class="rounded-[12px] p-4 mb-4" style="background-color: #FCF9F5; border-left: 4px solid #D4A373;">
                <p class="text-sm flex items-center gap-2" style="color: #4A3B33;">
                  <!-- Lucide BookOpen icon -->
                  <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Learning resources shared by team members
                </p>
              </div>
              <div class="space-y-3">
                <div *ngFor="let resource of subtopic.resources" 
                     class="rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                  <div class="flex items-start gap-3">
                    <div class="flex-1">
                      <h4 class="font-semibold" style="color: #2D2622;">{{ resource.name }}</h4>
                      <a 
                        [href]="resource.link" 
                        target="_blank"
                        class="text-sm flex items-center gap-1 mt-1"
                        style="color: #8B5E3C;">
                        <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {{ resource.link }}
                      </a>
                    </div>
                  </div>
                </div>
                
                <!-- Empty State -->
                <div *ngIf="!subtopic.resources || subtopic.resources.length === 0"
                     class="text-center py-8" style="color: #4A3B33;">
                  <!-- Lucide BookOpen icon -->
                  <svg class="w-10 h-10 mx-auto mb-2" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p class="text-sm">No resources yet</p>
                </div>
              </div>
            </div>
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
          <svg class="w-10 h-10" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-2xl font-semibold" style="color: #2D2622;">Delete Subtopic</h3>
        </div>
        
        <p class="mb-4" style="color: #4A3B33;">
          Are you sure you want to delete <span class="font-semibold" style="color: #2D2622;">"{{ subtopic?.name }}"</span>?
        </p>
        <p class="mb-6 text-sm" style="color: #4A3B33;">
          This will remove this subtopic from all users' roadmaps, including their personal notes and all shared content. This action cannot be undone.
        </p>

        <div class="flex gap-3 justify-end">
          <button 
            (click)="cancelDelete()"
            class="font-medium px-6 py-3 rounded-[12px] transition-all"
            style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
            Cancel
          </button>
          <button 
            (click)="deleteSubtopic()"
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
export class SubtopicContentComponent implements OnInit {
  allTabs = [
    { id: 'personal', label: 'Personal Notes', icon: '🔒' },
    { id: 'theory', label: 'Shared Theory', icon: '📖' },
    { id: 'code', label: 'Code', icon: '💻' },
    { id: 'problems', label: 'Problems', icon: '🎯' },
    { id: 'resources', label: 'Resources', icon: '📚' }
  ];

  themeId: string = '';
  subtopicName: string = '';
  themeName: string = '';
  subtopic: SubtopicContent | null = null;
  loading = false;
  error: string | null = null;
  activeTab: string = 'theory';
  currentUser: User | null = null;
  showDeleteConfirmation = false;
  deleting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private themesService: ThemesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.route.params.subscribe(params => {
      this.themeId = params['id'];
      this.subtopicName = params['subtopicName'];
      if (this.themeId && this.subtopicName) {
        this.loadSubtopicContent();
      }
    });
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  getAvailableTabs() {
    // Only show personal notes tab if user has theme in roadmap
    if (this.subtopic?.userHasThemeInRoadmap) {
      return this.allTabs;
    }
    return this.allTabs.filter(tab => tab.id !== 'personal');
  }

  loadSubtopicContent(): void {
    this.loading = true;
    this.error = null;

    this.themesService.getSubtopicContent(this.themeId, this.subtopicName).subscribe({
      next: (response) => {
        this.subtopic = response.data.subtopic;
        this.themeName = response.data.theme.name;
        
        // Set default active tab based on whether user has theme in roadmap
        if (this.subtopic.userHasThemeInRoadmap) {
          this.activeTab = 'personal';
        } else {
          this.activeTab = 'theory';
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load subtopic content. Please try again later.';
        this.loading = false;
        console.error('Error loading subtopic content:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/themes', this.themeId]);
  }

  confirmDelete(): void {
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
  }

  deleteSubtopic(): void {
    if (!this.themeId || !this.subtopicName) return;

    this.deleting = true;
    this.themesService.deleteSubtopicGlobally(this.themeId, this.subtopicName).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteConfirmation = false;
        this.router.navigate(['/themes', this.themeId]);
      },
      error: (err) => {
        this.deleting = false;
        this.error = 'Failed to delete subtopic. Please try again.';
        console.error('Error deleting subtopic:', err);
      }
    });
  }

  getDifficultyLabel(difficulty: string): string {
    const labels: { [key: string]: string } = {
      'easy': 'Easy',
      'medium': 'Medium',
      'hard': 'Hard',
      'very-hard': 'Very Hard'
    };
    return labels[difficulty] || difficulty;
  }
}
