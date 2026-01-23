import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemesService, SubtopicContent } from '../../core/services/themes.service';
import { ProblemsService, Problem } from '../../core/services/problems.service';
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
              You can edit shared content. Add this theme to your roadmap to track progress and add Personal Notes.
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
                  <!-- Folder icon for resources -->
                  <svg *ngSwitchCase="'resources'" class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </ng-container>
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="mt-4">
            <!-- Shared Theory -->
            <div *ngIf="activeTab === 'theory'">
              <div class="rounded-[12px] p-4 mb-4" style="background-color: #FCF9F5; border-left: 4px solid #8B5E3C;">
                <p class="text-sm flex items-center gap-2" style="color: #4A3B33;">
                  <!-- Lucide Globe icon -->
                  <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Shared theory editable by all team members
                </p>
              </div>
              
              <!-- Editable textarea for shared theory -->
              <div *ngIf="!editingSharedTheory" class="relative">
                <div 
                  class="w-full rounded-[12px] px-4 py-3 min-h-[200px] whitespace-pre-wrap cursor-pointer hover:bg-white transition-colors"
                  style="border: 1px solid #EAE3DB; color: #2D2622; background-color: #FCF9F5;"
                  (click)="startEditingSharedTheory()">
                  {{ subtopic.sharedTheory || 'No shared theory content yet. Click to add.' }}
                </div>
                <button 
                  (click)="startEditingSharedTheory()"
                  class="absolute top-2 right-2 px-3 py-1 rounded-[12px] text-sm font-medium flex items-center gap-1"
                  style="background-color: #8B5E3C; color: white;">
                  <!-- Lucide Edit icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>
              
              <!-- Edit mode -->
              <div *ngIf="editingSharedTheory">
                <textarea 
                  [(ngModel)]="editedSharedTheory"
                  rows="12"
                  placeholder="Write shared theory here..."
                  class="w-full rounded-[12px] px-4 py-3 resize-none transition-all"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
                </textarea>
                <div class="flex gap-2 justify-end mt-3">
                  <button 
                    (click)="cancelEditingSharedTheory()"
                    class="px-4 py-2 rounded-[12px] font-medium"
                    style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                    Cancel
                  </button>
                  <button 
                    (click)="saveSharedTheory()"
                    [disabled]="savingSharedTheory"
                    class="text-white px-4 py-2 rounded-[12px] font-medium disabled:opacity-50"
                    style="background-color: #8B5E3C;">
                    {{ savingSharedTheory ? 'Saving...' : 'Save' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Code Snippets -->
            <div *ngIf="activeTab === 'code'">
              <div class="space-y-4">
                <div *ngFor="let snippet of subtopic.codeSnippets; let j = index" 
                     class="rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                  <div class="flex items-center justify-between mb-3">
                    <!-- Language selector (only in edit mode) -->
                    <select 
                      *ngIf="editingCodeSnippetIndex === j"
                      [(ngModel)]="snippet.language"
                      class="rounded-[12px] px-3 py-1 text-sm"
                      style="border: 1px solid #EAE3DB; color: #2D2622;">
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                    </select>
                    <!-- Language badge (in view mode) -->
                    <span 
                      *ngIf="editingCodeSnippetIndex !== j"
                      class="text-xs px-3 py-1 rounded-[12px] font-medium"
                      style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #8B5E3C;">
                      {{ snippet.language === 'python' ? 'Python' : 'C++' }}
                    </span>
                    <!-- Action buttons -->
                    <div class="flex items-center gap-2">
                      <!-- Edit button (in view mode) -->
                      <button 
                        *ngIf="editingCodeSnippetIndex !== j"
                        (click)="startEditingCodeSnippet(j)"
                        class="text-sm flex items-center gap-1 px-3 py-1 rounded-[12px]"
                        style="background-color: #8B5E3C; color: white;">
                        <!-- Lucide Edit icon -->
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <!-- Save button (in edit mode) -->
                      <button 
                        *ngIf="editingCodeSnippetIndex === j"
                        (click)="saveAndCloseCodeSnippet()"
                        [disabled]="savingCodeSnippet"
                        class="text-sm flex items-center gap-1 px-3 py-1 rounded-[12px] disabled:opacity-50"
                        style="background-color: #8B5E3C; color: white;">
                        <!-- Lucide Save icon -->
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        {{ savingCodeSnippet ? 'Saving...' : 'Save' }}
                      </button>
                      <!-- Cancel button (in edit mode) -->
                      <button 
                        *ngIf="editingCodeSnippetIndex === j"
                        (click)="cancelEditingCodeSnippet()"
                        class="text-sm flex items-center gap-1 px-3 py-1 rounded-[12px]"
                        style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #4A3B33;">
                        Cancel
                      </button>
                      <!-- Delete button -->
                      <button 
                        (click)="confirmDeleteCodeSnippet(j)"
                        class="text-sm flex items-center gap-1 px-3 py-1 rounded-[12px]"
                        style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #4A3B33;">
                        <!-- Lucide Trash2 icon -->
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                  <!-- Description field -->
                  <input 
                    *ngIf="editingCodeSnippetIndex === j"
                    type="text"
                    [(ngModel)]="snippet.description"
                    placeholder="Code description..."
                    class="w-full rounded-[12px] px-3 py-2 mb-2 text-sm"
                    style="border: 1px solid #EAE3DB; color: #2D2622;">
                  <p 
                    *ngIf="editingCodeSnippetIndex !== j && snippet.description"
                    class="text-sm mb-2"
                    style="color: #4A3B33;">
                    {{ snippet.description }}
                  </p>
                  <!-- Code editor (in edit mode) -->
                  <textarea 
                    *ngIf="editingCodeSnippetIndex === j"
                    [(ngModel)]="snippet.code"
                    rows="12"
                    placeholder="// Write your code here..."
                    class="w-full rounded-[12px] p-4 font-mono text-sm resize-none"
                    style="background-color: #2D2622; color: #F8F8F2; border: 1px solid #2D2622;">
                  </textarea>
                  <!-- Code viewer with syntax highlighting (in view mode) -->
                  <pre 
                    *ngIf="editingCodeSnippetIndex !== j"
                    class="rounded-[12px] p-4 overflow-x-auto font-mono text-sm"
                    style="background-color: #2D2622; margin: 0;"><code style="color: #F8F8F2;" [innerHTML]="highlightCode(snippet.code, snippet.language)"></code></pre>
                </div>
                <button 
                  (click)="addCodeSnippet()"
                  class="w-full border-2 border-dashed rounded-[12px] py-3 transition-colors flex items-center justify-center gap-2"
                  style="border-color: #EAE3DB; color: #4A3B33;">
                  <!-- Lucide Plus icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add code snippet
                </button>
                
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
              <div class="rounded-[12px] p-4 mb-4 flex items-center justify-between" style="background-color: #FCF9F5; border-left: 4px solid #8B5E3C;">
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
                <div *ngFor="let problem of subtopic.linkedProblems; let k = index" 
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
                    <button 
                      (click)="removeProblem(k)"
                      class="text-sm ml-2"
                      style="color: #4A3B33;">
                      <!-- Lucide X icon -->
                      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
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
                        *ngIf="problem.problemId"
                        [routerLink]="['/problems', problem.problemId]"
                        class="text-xs"
                        style="color: #8B5E3C;">
                        View details
                      </a>
                    </div>
                  </div>
                </div>
                
                <!-- Add Problem Buttons -->
                <div class="flex gap-3">
                  <button 
                    (click)="openProblemPicker()"
                    class="flex-1 border-2 border-dashed rounded-[12px] py-3 transition-colors flex items-center justify-center gap-2"
                    style="border-color: #EAE3DB; color: #4A3B33;">
                    <!-- Lucide Link icon -->
                    <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Link from library
                  </button>
                  <button 
                    (click)="openCreateProblemModal()"
                    class="flex-1 border-2 border-dashed rounded-[12px] py-3 transition-colors flex items-center justify-center gap-2"
                    style="border-color: #D4A373; color: #8B5E3C;">
                    <!-- Lucide Plus icon -->
                    <svg class="w-4 h-4" style="color: #8B5E3C;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create problem
                  </button>
                </div>
                
                <!-- Empty State -->
                <div *ngIf="!subtopic.linkedProblems || subtopic.linkedProblems.length === 0"
                     class="text-center py-8" style="color: #4A3B33;">
                  <!-- Lucide FileText icon -->
                  <svg class="w-10 h-10 mx-auto mb-2" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-sm">No linked problems</p>
                  <p class="text-xs mt-1">Click "Link from library" or "Create problem" to add</p>
                </div>
              </div>
            </div>

            <!-- Resources -->
            <div *ngIf="activeTab === 'resources'">
              <div class="rounded-[12px] p-4 mb-4 flex items-center justify-between" style="background-color: #FCF9F5; border-left: 4px solid #D4A373;">
                <p class="text-sm flex items-center gap-2" style="color: #4A3B33;">
                  <!-- Lucide BookOpen icon -->
                  <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Learning resources shared by team members
                </p>
                <!-- Edit toggle button -->
                <button 
                  *ngIf="!editingResources && subtopic.resources && subtopic.resources.length > 0"
                  (click)="startEditingResources()"
                  class="text-sm flex items-center gap-1 px-3 py-1 rounded-[12px]"
                  style="background-color: #8B5E3C; color: white;">
                  <!-- Lucide Edit icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <div *ngIf="editingResources" class="flex items-center gap-2">
                  <button 
                    (click)="saveAndCloseResources()"
                    [disabled]="savingResources"
                    class="text-sm flex items-center gap-1 px-3 py-1 rounded-[12px] disabled:opacity-50"
                    style="background-color: #8B5E3C; color: white;">
                    <!-- Lucide Save icon -->
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {{ savingResources ? 'Saving...' : 'Save' }}
                  </button>
                  <button 
                    (click)="cancelEditingResources()"
                    class="text-sm flex items-center gap-1 px-3 py-1 rounded-[12px]"
                    style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #4A3B33;">
                    Cancel
                  </button>
                </div>
              </div>
              <div class="space-y-3">
                <div *ngFor="let resource of subtopic.resources; let r = index" 
                     class="rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                  <!-- View mode -->
                  <div *ngIf="!editingResources" class="flex items-center justify-between">
                    <div class="flex-1">
                      <h4 class="font-medium" style="color: #2D2622;">{{ resource.name || 'Unnamed Resource' }}</h4>
                      <a *ngIf="resource.link" 
                         [href]="resource.link" 
                         target="_blank"
                         class="text-sm inline-flex items-center gap-1 mt-1"
                         style="color: #8B5E3C;">
                        <!-- Lucide ExternalLink icon -->
                        <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open link
                      </a>
                    </div>
                  </div>
                  <!-- Edit mode -->
                  <div *ngIf="editingResources" class="flex items-start gap-3">
                    <div class="flex-1 space-y-2">
                      <input 
                        type="text"
                        [(ngModel)]="resource.name"
                        placeholder="Resource name"
                        class="w-full rounded-[12px] px-3 py-2 text-sm"
                        style="border: 1px solid #EAE3DB; color: #2D2622;">
                      <input 
                        type="url"
                        [(ngModel)]="resource.link"
                        placeholder="https://..."
                        class="w-full rounded-[12px] px-3 py-2 text-sm"
                        style="border: 1px solid #EAE3DB; color: #2D2622;">
                    </div>
                    <button 
                      (click)="removeResource(r)"
                      class="text-sm mt-2 px-2 py-1 rounded-[12px]"
                      style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #4A3B33;">
                      <!-- Lucide X icon -->
                      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button 
                  *ngIf="editingResources || !subtopic.resources || subtopic.resources.length === 0"
                  (click)="addResource()"
                  class="w-full border-2 border-dashed rounded-[12px] py-3 transition-colors flex items-center justify-center gap-2"
                  style="border-color: #EAE3DB; color: #4A3B33;">
                  <!-- Lucide Plus icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add resource
                </button>
                
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

    <!-- Problem Picker Modal -->
    <div 
      *ngIf="showProblemPickerModal" 
      class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
      (click)="closeProblemPicker()">
      <div class="bg-white rounded-[12px] p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
        <h3 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: #2D2622;">
          <!-- Lucide Link icon -->
          <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Link Problem
        </h3>
        
        <!-- Search and Filter -->
        <div class="mb-6 space-y-3">
          <div class="relative">
            <!-- Lucide Search icon -->
            <svg class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text"
              [(ngModel)]="problemSearchQuery"
              (ngModelChange)="filterProblems()"
              placeholder="Search problems..."
              class="w-full rounded-[12px] pl-10 pr-4 py-3"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
          </div>
          
          <div class="flex gap-3">
            <select 
              [(ngModel)]="problemFilterDifficulty"
              (change)="filterProblems()"
              class="rounded-[12px] px-4 py-2"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
              <option value="">All difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="very-hard">Very Hard</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loadingProblems" class="text-center py-8">
          <!-- Lucide Loader icon -->
          <svg class="w-12 h-12 mx-auto mb-4 animate-spin" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p style="color: #4A3B33;">Loading problems...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="problemPickerError" class="rounded-[12px] p-4 mb-4" style="background-color: #FCF9F5; border-left: 4px solid #8B5E3C;">
          <p style="color: #8B5E3C;">{{ problemPickerError }}</p>
        </div>

        <!-- Available Problems List -->
        <div *ngIf="!loadingProblems" class="space-y-3 mb-6 max-h-96 overflow-y-auto">
          <div 
            *ngFor="let problem of filteredProblems" 
            (click)="selectProblemForLinking(problem)"
            class="rounded-[12px] p-4 cursor-pointer transition-all"
            [ngStyle]="{
              'border': selectedProblemForLink?._id === problem._id ? '2px solid #8B5E3C' : '1px solid #EAE3DB',
              'background-color': selectedProblemForLink?._id === problem._id ? '#FCF9F5' : '#FFFFFF'
            }">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-semibold mb-1" style="color: #2D2622;">{{ problem.title }}</h4>
                <div class="flex gap-2 items-center">
                  <span 
                    *ngIf="problem.rating"
                    class="text-xs px-2 py-1 rounded-[12px] font-mono flex items-center gap-1"
                    style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                    <!-- Lucide Activity icon for rating -->
                    <svg class="w-3 h-3" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    {{ problem.rating }}
                  </span>
                  <span class="text-xs px-2 py-1 rounded-[12px]"
                        style="background-color: #FCF9F5; color: #4A3B33; border: 1px solid #EAE3DB;">
                    {{ problem.platform }}
                  </span>
                </div>
              </div>
              <div 
                *ngIf="selectedProblemForLink?._id === problem._id"
                class="text-2xl"
                style="color: #8B5E3C;">
                ✓
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredProblems.length === 0" class="text-center py-8" style="color: #4A3B33;">
            <!-- Lucide Search icon -->
            <svg class="w-10 h-10 mx-auto mb-2" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-sm">No problems found</p>
          </div>
        </div>

        <!-- Problem Metadata Form (shown when problem selected) -->
        <div *ngIf="selectedProblemForLink" class="rounded-[12px] p-6 mb-6" style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
          <h4 class="font-semibold mb-4" style="color: #2D2622;">Problem details to link</h4>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Title *</label>
              <input 
                type="text"
                [(ngModel)]="problemLinkMetadata.title"
                class="w-full rounded-[12px] px-4 py-2"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Brief description</label>
              <textarea 
                [(ngModel)]="problemLinkMetadata.description"
                rows="2"
                placeholder="Optional problem description..."
                class="w-full rounded-[12px] px-4 py-2 resize-none"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
              </textarea>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Link</label>
              <input 
                type="url"
                [(ngModel)]="problemLinkMetadata.link"
                class="w-full rounded-[12px] px-4 py-2"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Difficulty *</label>
              <select 
                [(ngModel)]="problemLinkMetadata.difficulty"
                class="w-full rounded-[12px] px-4 py-2"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="very-hard">Very Hard</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 justify-end">
          <button 
            (click)="closeProblemPicker()"
            class="font-medium px-6 py-3 rounded-[12px]"
            style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
            Cancel
          </button>
          <button 
            (click)="confirmProblemLink()"
            [disabled]="!selectedProblemForLink || !problemLinkMetadata.title || !problemLinkMetadata.difficulty"
            class="text-white font-medium px-6 py-3 rounded-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
            style="background-color: #8B5E3C;">
            Link problem
          </button>
        </div>
      </div>
    </div>

    <!-- Create Problem Modal -->
    <div 
      *ngIf="showCreateProblemModal" 
      class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
      (click)="closeCreateProblemModal()">
      <div class="bg-white rounded-[12px] p-6 w-full max-w-lg" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
        <h3 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: #2D2622;">
          <!-- Lucide Plus icon -->
          <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Problem
        </h3>
        
        <div class="rounded-[12px] p-4 mb-4" style="background-color: #FCF9F5; border-left: 4px solid #D4A373;">
          <p class="text-sm flex items-center gap-2" style="color: #4A3B33;">
            <!-- Lucide Info icon -->
            <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            This creates a theoretical problem directly linked to this subtopic without adding it to the problem library.
          </p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Title *</label>
            <input 
              type="text"
              [(ngModel)]="newInlineProblem.title"
              placeholder="Problem title..."
              class="w-full rounded-[12px] px-4 py-3 transition-all"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Description</label>
            <textarea 
              [(ngModel)]="newInlineProblem.description"
              rows="3"
              placeholder="Problem description (optional)..."
              class="w-full rounded-[12px] px-4 py-3 transition-all resize-none"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
            </textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Link (optional)</label>
            <input 
              type="url"
              [(ngModel)]="newInlineProblem.link"
              placeholder="https://..."
              class="w-full rounded-[12px] px-4 py-3 transition-all"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Difficulty *</label>
            <select 
              [(ngModel)]="newInlineProblem.difficulty"
              class="w-full rounded-[12px] px-4 py-3 transition-all"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="very-hard">Very Hard</option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 justify-end mt-6">
          <button 
            (click)="closeCreateProblemModal()"
            class="font-medium px-6 py-3 rounded-[12px] transition-all"
            style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
            Cancel
          </button>
          <button 
            (click)="createInlineProblem()"
            [disabled]="!newInlineProblem.title || !newInlineProblem.difficulty"
            class="text-white font-medium px-6 py-3 rounded-[12px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style="background-color: #8B5E3C;">
            Create problem
          </button>
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

    <!-- Delete Code Snippet Confirmation Modal -->
    <div 
      *ngIf="showDeleteCodeSnippetModal" 
      class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
      (click)="cancelDeleteCodeSnippet()">
      <div class="bg-white rounded-[12px] p-8 w-full max-w-md" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
        <div class="flex items-center gap-3 mb-4">
          <svg class="w-10 h-10" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-2xl font-semibold" style="color: #2D2622;">Delete Code Snippet</h3>
        </div>
        
        <p class="mb-6" style="color: #4A3B33;">
          Are you sure you want to delete this code snippet? This action cannot be undone.
        </p>

        <div class="flex gap-3 justify-end">
          <button 
            (click)="cancelDeleteCodeSnippet()"
            class="font-medium px-6 py-3 rounded-[12px] transition-all"
            style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
            Cancel
          </button>
          <button 
            (click)="executeDeleteCodeSnippet()"
            class="font-medium px-6 py-3 rounded-[12px] transition-all"
            style="background-color: #8B5E3C; color: white;">
            Delete
          </button>
        </div>
      </div>
    </div>
  `
})
export class SubtopicContentComponent implements OnInit {
  // Personal Notes are only available in Roadmap, not in Themes view
  allTabs = [
    { id: 'theory', label: 'Shared Theory' },
    { id: 'code', label: 'Code' },
    { id: 'problems', label: 'Problems' },
    { id: 'resources', label: 'Resources' }
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
  
  // Shared theory editing state
  editingSharedTheory = false;
  editedSharedTheory = '';
  savingSharedTheory = false;

  // Code snippet editing state
  editingCodeSnippetIndex: number | null = null;
  savingCodeSnippet = false;
  showDeleteCodeSnippetModal = false;
  codeSnippetToDeleteIndex: number | null = null;

  // Resources editing state
  editingResources = false;
  savingResources = false;
  originalResources: Array<{ name: string; link: string }> = [];

  // Problem picker state
  showProblemPickerModal = false;
  showCreateProblemModal = false;
  loadingProblems = false;
  problemPickerError: string | null = null;
  availableProblems: Problem[] = [];
  filteredProblems: Problem[] = [];
  selectedProblemForLink: Problem | null = null;
  problemSearchQuery = '';
  problemFilterDifficulty = '';
  
  problemLinkMetadata = {
    title: '',
    description: '',
    link: '',
    difficulty: 'easy'
  };
  
  newInlineProblem = {
    title: '',
    description: '',
    link: '',
    difficulty: 'easy'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private themesService: ThemesService,
    private problemsService: ProblemsService,
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
    // Personal Notes tab is only available in Roadmap, not in Themes view
    return this.allTabs;
  }

  loadSubtopicContent(): void {
    this.loading = true;
    this.error = null;

    this.themesService.getSubtopicContent(this.themeId, this.subtopicName).subscribe({
      next: (response) => {
        this.subtopic = response.data.subtopic;
        this.themeName = response.data.theme.name;
        
        // Default to theory tab in themes view (Personal Notes only in Roadmap)
        this.activeTab = 'theory';
        
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

  // Shared theory editing methods
  startEditingSharedTheory(): void {
    this.editedSharedTheory = this.subtopic?.sharedTheory || '';
    this.editingSharedTheory = true;
  }

  cancelEditingSharedTheory(): void {
    this.editingSharedTheory = false;
    this.editedSharedTheory = '';
  }

  saveSharedTheory(): void {
    if (!this.subtopic) return;

    this.savingSharedTheory = true;
    this.themesService.updateSubtopicSharedContent(this.themeId, this.subtopicName, {
      sharedTheory: this.editedSharedTheory
    }).subscribe({
      next: () => {
        // Update the local subtopic data
        if (this.subtopic) {
          this.subtopic.sharedTheory = this.editedSharedTheory;
        }
        this.savingSharedTheory = false;
        this.editingSharedTheory = false;
        this.editedSharedTheory = '';
      },
      error: (err) => {
        this.savingSharedTheory = false;
        this.error = 'Failed to save shared theory. Please try again.';
        console.error('Error saving shared theory:', err);
      }
    });
  }

  // Code snippet methods
  addCodeSnippet(): void {
    if (!this.subtopic) return;
    if (!this.subtopic.codeSnippets) {
      this.subtopic.codeSnippets = [];
    }
    const newIndex = this.subtopic.codeSnippets.length;
    this.subtopic.codeSnippets.push({
      language: 'python',
      code: '',
      description: ''
    });
    // Start editing the new snippet immediately
    this.editingCodeSnippetIndex = newIndex;
  }

  startEditingCodeSnippet(index: number): void {
    this.editingCodeSnippetIndex = index;
  }

  cancelEditingCodeSnippet(): void {
    this.editingCodeSnippetIndex = null;
  }

  saveAndCloseCodeSnippet(): void {
    if (!this.subtopic) return;
    this.savingCodeSnippet = true;
    // Filter out code snippets with empty code to avoid saving unnecessary data
    const validCodeSnippets = this.subtopic.codeSnippets?.filter(
      snippet => snippet.code && snippet.code.trim() !== ''
    ) || [];
    this.themesService.updateSubtopicSharedContent(this.themeId, this.subtopicName, {
      codeSnippets: validCodeSnippets
    }).subscribe({
      next: () => {
        this.savingCodeSnippet = false;
        this.editingCodeSnippetIndex = null;
      },
      error: (err) => {
        this.savingCodeSnippet = false;
        this.error = 'Failed to save code snippets. Please try again.';
        console.error('Error saving code snippets:', err);
      }
    });
  }

  confirmDeleteCodeSnippet(index: number): void {
    this.codeSnippetToDeleteIndex = index;
    this.showDeleteCodeSnippetModal = true;
  }

  cancelDeleteCodeSnippet(): void {
    this.showDeleteCodeSnippetModal = false;
    this.codeSnippetToDeleteIndex = null;
  }

  executeDeleteCodeSnippet(): void {
    if (this.codeSnippetToDeleteIndex !== null && this.subtopic && this.subtopic.codeSnippets) {
      this.subtopic.codeSnippets.splice(this.codeSnippetToDeleteIndex, 1);
      this.saveCodeSnippets();
      if (this.editingCodeSnippetIndex === this.codeSnippetToDeleteIndex) {
        this.editingCodeSnippetIndex = null;
      }
    }
    this.showDeleteCodeSnippetModal = false;
    this.codeSnippetToDeleteIndex = null;
  }

  saveCodeSnippets(): void {
    if (!this.subtopic) return;
    // Filter out code snippets with empty code to avoid saving unnecessary data
    const validCodeSnippets = this.subtopic.codeSnippets?.filter(
      snippet => snippet.code && snippet.code.trim() !== ''
    ) || [];
    this.themesService.updateSubtopicSharedContent(this.themeId, this.subtopicName, {
      codeSnippets: validCodeSnippets
    }).subscribe({
      next: () => {
        // Successfully saved
      },
      error: (err) => {
        this.error = 'Failed to save code snippets. Please try again.';
        console.error('Error saving code snippets:', err);
      }
    });
  }

  // Syntax highlighting helper
  highlightCode(code: string, language: 'python' | 'cpp'): string {
    if (!code) return '<span style="color: #6272A4;">// No code yet</span>';
    
    // Escape HTML entities
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    if (language === 'python') {
      // Python keywords
      const pythonKeywords = /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|not|or|pass|raise|return|try|while|with|yield|None|True|False)\b/g;
      escaped = escaped.replace(pythonKeywords, '<span style="color: #FF79C6;">$1</span>');
      
      // Python built-in functions
      const pythonBuiltins = /\b(print|len|range|int|str|float|list|dict|set|tuple|input|open|type|sum|min|max|abs|sorted|enumerate|zip|map|filter)\b/g;
      escaped = escaped.replace(pythonBuiltins, '<span style="color: #8BE9FD;">$1</span>');
      
      // Strings (single and double quotes)
      escaped = escaped.replace(/(["'])((?:\\.|(?!\1)[^\\])*)(\1)/g, '<span style="color: #F1FA8C;">$1$2$3</span>');
      
      // Comments
      escaped = escaped.replace(/(#.*$)/gm, '<span style="color: #6272A4;">$1</span>');
      
      // Numbers
      escaped = escaped.replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #BD93F9;">$1</span>');
      
    } else if (language === 'cpp') {
      // C++ keywords
      const cppKeywords = /\b(alignas|alignof|and|and_eq|asm|auto|bitand|bitor|bool|break|case|catch|char|char8_t|char16_t|char32_t|class|compl|concept|const|consteval|constexpr|constinit|const_cast|continue|co_await|co_return|co_yield|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|false|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|not|not_eq|nullptr|operator|or|or_eq|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|true|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while|xor|xor_eq)\b/g;
      escaped = escaped.replace(cppKeywords, '<span style="color: #FF79C6;">$1</span>');
      
      // C++ preprocessor directives
      escaped = escaped.replace(/(#\s*(include|define|undef|ifdef|ifndef|if|else|elif|endif|pragma|error|warning).*$)/gm, '<span style="color: #FFB86C;">$1</span>');
      
      // Standard library
      const cppStdLib = /\b(std|cout|cin|endl|vector|string|map|set|queue|stack|pair|sort|find|begin|end|push_back|pop_back|size|empty|clear)\b/g;
      escaped = escaped.replace(cppStdLib, '<span style="color: #8BE9FD;">$1</span>');
      
      // Strings
      escaped = escaped.replace(/(["'])((?:\\.|(?!\1)[^\\])*)(\1)/g, '<span style="color: #F1FA8C;">$1$2$3</span>');
      
      // Single-line comments
      escaped = escaped.replace(/(\/\/.*$)/gm, '<span style="color: #6272A4;">$1</span>');
      
      // Multi-line comments
      escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6272A4;">$1</span>');
      
      // Numbers
      escaped = escaped.replace(/\b(\d+\.?\d*[fFlL]?)\b/g, '<span style="color: #BD93F9;">$1</span>');
    }
    
    return escaped;
  }

  // Resource methods
  addResource(): void {
    if (!this.subtopic) return;
    if (!this.subtopic.resources) {
      this.subtopic.resources = [];
    }
    this.subtopic.resources.push({
      name: '',
      link: ''
    });
    // Start editing mode when adding a resource
    this.editingResources = true;
  }

  startEditingResources(): void {
    if (!this.subtopic) return;
    // Save original state in case of cancel
    this.originalResources = JSON.parse(JSON.stringify(this.subtopic.resources || []));
    this.editingResources = true;
  }

  cancelEditingResources(): void {
    if (!this.subtopic) return;
    // Restore original state
    this.subtopic.resources = JSON.parse(JSON.stringify(this.originalResources));
    this.editingResources = false;
    this.originalResources = [];
  }

  saveAndCloseResources(): void {
    if (!this.subtopic) return;
    this.savingResources = true;
    // Filter out resources with empty name or link to avoid validation errors
    const validResources = this.subtopic.resources?.filter(
      r => r.name && r.name.trim() !== '' && r.link && r.link.trim() !== ''
    ) || [];
    this.themesService.updateSubtopicSharedContent(this.themeId, this.subtopicName, {
      resources: validResources
    }).subscribe({
      next: () => {
        this.savingResources = false;
        this.editingResources = false;
        this.originalResources = [];
      },
      error: (err) => {
        this.savingResources = false;
        this.error = 'Failed to save resources. Please try again.';
        console.error('Error saving resources:', err);
      }
    });
  }

  removeResource(index: number): void {
    if (!this.subtopic || !this.subtopic.resources) return;
    this.subtopic.resources.splice(index, 1);
  }

  saveResources(): void {
    if (!this.subtopic) return;
    // Filter out resources with empty name or link to avoid validation errors
    const validResources = this.subtopic.resources?.filter(
      r => r.name && r.name.trim() !== '' && r.link && r.link.trim() !== ''
    ) || [];
    this.themesService.updateSubtopicSharedContent(this.themeId, this.subtopicName, {
      resources: validResources
    }).subscribe({
      next: () => {
        // Successfully saved
      },
      error: (err) => {
        this.error = 'Failed to save resources. Please try again.';
        console.error('Error saving resources:', err);
      }
    });
  }

  // Problem methods
  openProblemPicker(): void {
    this.showProblemPickerModal = true;
    this.loadAvailableProblems();
  }

  closeProblemPicker(): void {
    this.showProblemPickerModal = false;
    this.selectedProblemForLink = null;
    this.problemSearchQuery = '';
    this.problemFilterDifficulty = '';
    this.problemLinkMetadata = {
      title: '',
      description: '',
      link: '',
      difficulty: 'easy'
    };
  }

  loadAvailableProblems(): void {
    this.loadingProblems = true;
    this.problemPickerError = null;
    
    this.problemsService.getProblems().subscribe({
      next: (response) => {
        this.availableProblems = response.data.problems;
        this.filterProblems();
        this.loadingProblems = false;
      },
      error: (err) => {
        this.loadingProblems = false;
        this.problemPickerError = 'Failed to load problems. Please try again.';
        console.error('Error loading problems:', err);
      }
    });
  }

  filterProblems(): void {
    const query = this.problemSearchQuery.toLowerCase().trim();
    const difficulty = this.problemFilterDifficulty;
    
    this.filteredProblems = this.availableProblems.filter(p => {
      // Filter by search query
      if (query && !p.title.toLowerCase().includes(query) && 
          !(p.description?.toLowerCase().includes(query))) {
        return false;
      }
      
      // Filter by difficulty
      if (difficulty && p.difficulty !== difficulty) {
        return false;
      }
      
      return true;
    });
  }

  selectProblemForLinking(problem: Problem): void {
    this.selectedProblemForLink = problem;
    this.problemLinkMetadata = {
      title: problem.title,
      description: problem.description || '',
      link: problem.url || '',
      difficulty: problem.difficulty
    };
  }

  confirmProblemLink(): void {
    if (!this.subtopic || !this.selectedProblemForLink) return;
    
    if (!this.subtopic.linkedProblems) {
      this.subtopic.linkedProblems = [];
    }
    
    // Add the problem with metadata
    this.subtopic.linkedProblems.push({
      problemId: this.selectedProblemForLink._id,
      title: this.problemLinkMetadata.title,
      description: this.problemLinkMetadata.description,
      link: this.problemLinkMetadata.link,
      difficulty: this.problemLinkMetadata.difficulty as 'easy' | 'medium' | 'hard' | 'very-hard'
    });
    
    this.saveProblems();
    this.closeProblemPicker();
  }

  openCreateProblemModal(): void {
    this.showCreateProblemModal = true;
  }

  closeCreateProblemModal(): void {
    this.showCreateProblemModal = false;
    this.newInlineProblem = {
      title: '',
      description: '',
      link: '',
      difficulty: 'easy'
    };
  }

  createInlineProblem(): void {
    if (!this.subtopic) return;
    
    if (!this.subtopic.linkedProblems) {
      this.subtopic.linkedProblems = [];
    }
    
    // Add inline problem (without problemId, meaning it's not in the library)
    this.subtopic.linkedProblems.push({
      problemId: undefined, // undefined for inline problem - will be filtered before save
      title: this.newInlineProblem.title,
      description: this.newInlineProblem.description,
      link: this.newInlineProblem.link,
      difficulty: this.newInlineProblem.difficulty as 'easy' | 'medium' | 'hard' | 'very-hard'
    });
    
    this.saveProblems();
    this.closeCreateProblemModal();
  }

  removeProblem(index: number): void {
    if (!this.subtopic || !this.subtopic.linkedProblems) return;
    this.subtopic.linkedProblems.splice(index, 1);
    this.saveProblems();
  }

  saveProblems(): void {
    if (!this.subtopic) return;
    // Transform linkedProblems to ensure problemId is undefined (not empty string) for inline problems
    const transformedProblems = this.subtopic.linkedProblems?.map(problem => ({
      ...problem,
      // Convert empty string problemId to undefined for MongoDB compatibility
      problemId: problem.problemId && problem.problemId !== '' ? problem.problemId : undefined
    }));
    this.themesService.updateSubtopicSharedContent(this.themeId, this.subtopicName, {
      linkedProblems: transformedProblems
    }).subscribe({
      next: () => {
        // Successfully saved
      },
      error: (err) => {
        this.error = 'Failed to save problems. Please try again.';
        console.error('Error saving problems:', err);
      }
    });
  }
}
