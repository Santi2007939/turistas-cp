import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { RoadmapService, PersonalNode, TeamMember, PopulatedUser } from '../../core/services/roadmap.service';
import { ThemesService, Theme } from '../../core/services/themes.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-roadmap-nodes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule, NavbarComponent],
  template: `
    <!-- Matte-Drift Modern Node-Based Roadmap -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
        <!-- Header Section -->
        <div class="bg-white rounded-[12px] p-6 mb-6" style="border: 1px solid #EAE3DB;">
          <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 class="text-3xl font-semibold mb-2 flex items-center gap-2" style="color: #2D2622;">
                <!-- Node icon -->
                <svg class="w-7 h-7" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="4" cy="8" r="2" />
                  <circle cx="20" cy="8" r="2" />
                  <circle cx="4" cy="16" r="2" />
                  <circle cx="20" cy="16" r="2" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 8h3m6 0h3M6 16h3m6 0h3M12 9V6m0 12v-3" />
                </svg>
                Roadmap Nodes
              </h1>
              <p style="color: #4A3B33;">Modern node-based view with drag &amp; drop</p>
            </div>
            <div class="flex gap-3">
              <button 
                routerLink="/roadmap"
                class="font-medium py-2 px-4 rounded-[12px] transition-all flex items-center gap-2"
                style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
                List View
              </button>
              <button 
                routerLink="/roadmap/kanban"
                class="font-medium py-2 px-4 rounded-[12px] transition-all flex items-center gap-2"
                style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Kanban
              </button>
              <button 
                *ngIf="selectedView === 'personal'"
                (click)="showAddThemeModal = true"
                class="text-white font-medium py-3 px-6 rounded-[12px] transition-all flex items-center gap-2"
                style="background-color: #8B5E3C;">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Theme</span>
              </button>
            </div>
          </div>

          <!-- View Selector and Member Selector -->
          <div class="mt-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <!-- View Selector -->
            <div class="flex gap-2 items-center">
              <label class="font-medium text-sm" style="color: #2D2622;">View:</label>
              <select 
                [(ngModel)]="selectedView"
                (change)="onViewChange()"
                class="rounded-[12px] px-4 py-2 bg-white transition-all"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
                <option value="personal">My roadmap</option>
                <option value="members">Members</option>
              </select>
            </div>

            <!-- Member Selector (only visible when Members view is selected) -->
            <div *ngIf="selectedView === 'members'" class="flex gap-2 items-center">
              <label class="font-medium text-sm" style="color: #2D2622;">Member:</label>
              <select 
                [(ngModel)]="selectedMemberId"
                (change)="onMemberChange()"
                class="rounded-[12px] px-4 py-2 bg-white transition-all min-w-[200px]"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
                <option value="">Select a member...</option>
                <option *ngFor="let member of teamMembers" [value]="member._id">
                  {{ member.fullName || member.username }}
                </option>
              </select>
            </div>

            <!-- Read-only indicator -->
            <div *ngIf="selectedView === 'members' && selectedMemberId && !isOwner" 
                 class="flex items-center gap-2 px-4 py-2 rounded-[12px]"
                 style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
              <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span class="text-sm font-medium" style="color: #4A3B33;">View only mode</span>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="space-y-4">
          <div class="bg-white rounded-[12px] p-6 animate-pulse" style="border: 1px solid #EAE3DB;">
            <div class="h-4 rounded w-3/4 mb-4" style="background-color: #EAE3DB;"></div>
            <div class="h-4 rounded w-1/2 mb-4" style="background-color: #EAE3DB;"></div>
            <div class="h-2 rounded w-full" style="background-color: #EAE3DB;"></div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-white rounded-[12px] p-6 mb-6 border-l-4" style="border-color: #8B5E3C; border-right: 1px solid #EAE3DB; border-top: 1px solid #EAE3DB; border-bottom: 1px solid #EAE3DB;">
          <div class="flex items-start">
            <!-- Lucide AlertTriangle icon -->
            <svg class="w-6 h-6 mr-3" style="color: #8B5E3C;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 class="font-semibold" style="color: #8B5E3C;">Error</h3>
              <p class="mt-1" style="color: #2D2622;">{{ error }}</p>
              <button 
                (click)="loadRoadmap()"
                class="mt-3 text-white px-4 py-2 rounded-[12px] text-sm font-medium"
                style="background-color: #8B5E3C;">
                Retry
              </button>
            </div>
          </div>
        </div>

        <!-- Progress Overview -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6" *ngIf="!loading && nodes.length > 0">
          <div class="bg-white rounded-[12px] p-4 transition-colors" style="border: 1px solid #EAE3DB;">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" />
              </svg>
              <div class="flex-1">
                <p class="text-sm font-medium" style="color: #4A3B33;">Not Started</p>
                <p class="text-2xl font-bold font-mono" style="color: #2D2622;">{{ getCountByStatus('not-started') }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-[12px] p-4 transition-colors" style="border: 1px solid #EAE3DB;">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8" style="color: #D4A373;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              <div class="flex-1">
                <p class="text-sm font-medium" style="color: #4A3B33;">In Progress</p>
                <p class="text-2xl font-bold font-mono" style="color: #D4A373;">{{ getCountByStatus('in-progress') }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-[12px] p-4 transition-colors" style="border: 1px solid #EAE3DB;">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8" style="color: #8B5E3C;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <p class="text-sm font-medium" style="color: #4A3B33;">Completed</p>
                <p class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ getCountByStatus('completed') }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-[12px] p-4 transition-colors" style="border: 1px solid #EAE3DB;">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 3v6a6 6 0 006 6v0a6 6 0 006-6V3M9 21h6M12 15v6" />
              </svg>
              <div class="flex-1">
                <p class="text-sm font-medium" style="color: #4A3B33;">Mastered</p>
                <p class="text-2xl font-bold font-mono" style="color: #2D2622;">{{ getCountByStatus('mastered') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Node-based Grid (Drag & Drop) -->
        <div *ngIf="!loading && nodes.length > 0" class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold flex items-center gap-2" style="color: #2D2622;">
              <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Theme Nodes
              <span *ngIf="canEdit" class="text-sm font-normal" style="color: #4A3B33;">(drag to reorder)</span>
            </h2>
            <span class="text-sm" style="color: #4A3B33;">{{ nodes.length }} themes</span>
          </div>

          <!-- Drag & Drop Grid -->
          <div 
            cdkDropList 
            cdkDropListOrientation="mixed"
            (cdkDropListDropped)="onNodeDrop($event)"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div 
              *ngFor="let node of nodes; let i = index"
              cdkDrag
              [cdkDragDisabled]="!canEdit"
              class="relative group"
              [ngClass]="{'cursor-move': canEdit, 'cursor-default': !canEdit}">
              
              <!-- Node Card -->
              <div 
                class="bg-white rounded-[16px] p-5 transition-all border-2 hover:shadow-lg"
                [ngStyle]="{
                  'border-color': getStatusColor(node.status)
                }">
                
                <!-- Drag Handle (only if editable) -->
                <div *ngIf="canEdit" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                <!-- Node Number -->
                <div 
                  class="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
                  [ngStyle]="{'background-color': getStatusColor(node.status)}">
                  {{ i + 1 }}
                </div>

                <!-- Status Icon -->
                <div class="flex justify-center mb-4 mt-2">
                  <div 
                    class="w-16 h-16 rounded-full flex items-center justify-center"
                    [ngStyle]="{
                      'background-color': getStatusColor(node.status) + '20'
                    }">
                    <ng-container [ngSwitch]="node.status">
                      <svg *ngSwitchCase="'not-started'" class="w-8 h-8" [ngStyle]="{'color': getStatusColor(node.status)}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" />
                      </svg>
                      <svg *ngSwitchCase="'in-progress'" class="w-8 h-8 animate-spin" style="animation-duration: 3s;" [ngStyle]="{'color': getStatusColor(node.status)}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <svg *ngSwitchCase="'completed'" class="w-8 h-8" [ngStyle]="{'color': getStatusColor(node.status)}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <svg *ngSwitchDefault class="w-8 h-8" [ngStyle]="{'color': getStatusColor(node.status)}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 3v6a6 6 0 006 6v0a6 6 0 006-6V3M9 21h6M12 15v6" />
                      </svg>
                    </ng-container>
                  </div>
                </div>

                <!-- Theme Name -->
                <h3 class="text-center font-semibold mb-2 line-clamp-2" style="color: #2D2622;">
                  {{ node.themeId?.name || 'Theme' }}
                </h3>

                <!-- Progress Ring -->
                <div class="flex justify-center mb-3">
                  <div class="relative w-20 h-20">
                    <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#EAE3DB"
                        stroke-width="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        [attr.stroke]="getStatusColor(node.status)"
                        stroke-width="3"
                        [attr.stroke-dasharray]="node.progress + ', 100'"
                        stroke-linecap="round"
                      />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-lg font-bold font-mono" [ngStyle]="{'color': getStatusColor(node.status)}">{{ node.progress }}%</span>
                    </div>
                  </div>
                </div>

                <!-- Category & Difficulty Tags -->
                <div class="flex flex-wrap justify-center gap-1 mb-3">
                  <span class="text-xs px-2 py-1 rounded-full" style="background-color: #FCF9F5; color: #4A3B33; border: 1px solid #EAE3DB;">
                    {{ node.themeId?.category }}
                  </span>
                  <span class="text-xs px-2 py-1 rounded-full" style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                    {{ getDifficultyLabel(node.themeId?.difficulty) }}
                  </span>
                </div>

                <!-- Member badge (when viewing others) -->
                <div *ngIf="selectedView === 'members' && !isOwner" class="text-center mb-3">
                  <span class="text-xs px-3 py-1 rounded-full font-medium" style="background-color: #D4A373; color: white;">
                    {{ getUserName(node) }}
                  </span>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-center gap-2 mt-3">
                  <a 
                    [routerLink]="['/roadmap', node._id, 'subtopics']"
                    class="px-3 py-2 rounded-[12px] text-xs font-medium transition-all flex items-center gap-1"
                    [ngStyle]="{
                      'background-color': canEdit ? '#8B5E3C' : '#FCF9F5',
                      'color': canEdit ? 'white' : '#4A3B33',
                      'border': canEdit ? 'none' : '1px solid #EAE3DB'
                    }">
                    <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </a>
                  <button 
                    *ngIf="canEdit"
                    (click)="editNode(node)"
                    class="text-white px-3 py-2 rounded-[12px] text-xs font-medium transition-all flex items-center gap-1"
                    style="background-color: #D4A373;">
                    <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && nodes.length === 0" class="bg-white rounded-[12px] p-12 text-center" style="border: 1px solid #EAE3DB;">
          <svg class="w-16 h-16 mx-auto mb-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="3" />
            <circle cx="4" cy="8" r="2" />
            <circle cx="20" cy="8" r="2" />
            <circle cx="4" cy="16" r="2" />
            <circle cx="20" cy="16" r="2" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 8h3m6 0h3M6 16h3m6 0h3M12 9V6m0 12v-3" />
          </svg>
          <h3 class="text-2xl font-semibold mb-3" style="color: #2D2622;">
            {{ selectedView === 'personal' ? 'Your roadmap is empty' : (selectedMemberId ? 'No themes found for this member' : 'Select a member to view their roadmap') }}
          </h3>
          <p class="mb-6 max-w-md mx-auto" style="color: #4A3B33;">
            {{ selectedView === 'personal' ? 'Start adding themes to your roadmap to track your learning progress.' : (selectedMemberId ? 'This member has not added any themes yet.' : 'Choose a team member from the dropdown above.') }}
          </p>
          <button 
            *ngIf="selectedView === 'personal'"
            (click)="showAddThemeModal = true"
            class="text-white font-medium py-3 px-8 rounded-[12px] transition-all flex items-center justify-center gap-2 mx-auto"
            style="background-color: #8B5E3C;">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add my first theme
          </button>
        </div>
      </div>

      <!-- Add Theme Modal -->
      <div 
        *ngIf="showAddThemeModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="showAddThemeModal = false">
        <div class="bg-white rounded-[12px] p-8 w-full max-w-lg" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-6">
            <svg class="w-8 h-8" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <h3 class="text-2xl font-semibold" style="color: #2D2622;">Add Theme to Roadmap</h3>
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Select a theme</label>
            <select 
              [(ngModel)]="selectedThemeId"
              class="w-full rounded-[12px] px-4 py-3 transition-all"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
              <option value="">Choose a theme...</option>
              <option *ngFor="let theme of availableThemes" [value]="theme._id">
                {{ theme.name }} ({{ theme.category }} - {{ theme.difficulty }})
              </option>
            </select>
            <p class="text-xs mt-2" style="color: #4A3B33;">
              The theme will be added with "Not Started" status and 0% progress
            </p>
          </div>

          <div class="flex gap-3 justify-end">
            <button 
              (click)="showAddThemeModal = false"
              class="font-medium px-6 py-3 rounded-[12px] transition-all"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancel
            </button>
            <button 
              (click)="addThemeToRoadmap()"
              [disabled]="!selectedThemeId"
              class="text-white font-medium px-6 py-3 rounded-[12px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style="background-color: #8B5E3C;">
              Add theme
            </button>
          </div>
        </div>
      </div>

      <!-- Update Node Modal -->
      <div 
        *ngIf="showUpdateModal && editingNode" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="showUpdateModal = false">
        <div class="bg-white rounded-[12px] p-8 w-full max-w-lg" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-6">
            <svg class="w-8 h-8" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 class="text-2xl font-semibold" style="color: #2D2622;">Update Progress</h3>
          </div>
          
          <div class="mb-5">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Status</label>
            <select 
              [(ngModel)]="editingNode.status"
              class="w-full rounded-[12px] px-4 py-3 transition-all"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Progress (%)</label>
            <div class="flex items-center gap-4">
              <input 
                type="range" 
                [(ngModel)]="editingNode.progress"
                min="0"
                max="100"
                class="flex-1 h-2 rounded-[12px] appearance-none cursor-pointer"
                style="background-color: #EAE3DB;">
              <input 
                type="number" 
                [(ngModel)]="editingNode.progress"
                min="0"
                max="100"
                class="w-20 rounded-[12px] px-3 py-2 text-center font-bold font-mono transition-all"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
            </div>
            <div class="mt-2 w-full rounded-[12px] h-2" style="background-color: #EAE3DB;">
              <div 
                class="h-2 rounded-[12px] transition-all"
                style="background-color: #D4A373;"
                [style.width.%]="editingNode.progress">
              </div>
            </div>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Due Date (optional)</label>
            <input 
              type="date"
              [(ngModel)]="editingNode.dueDate"
              class="w-full rounded-[12px] px-4 py-3 transition-all"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Notes</label>
            <textarea 
              [(ngModel)]="editingNode.notes"
              rows="4"
              placeholder="Add notes about your progress..."
              class="w-full rounded-[12px] px-4 py-3 transition-all resize-none"
              style="border: 1px solid #EAE3DB; color: #2D2622;"></textarea>
          </div>

          <div class="flex gap-3 justify-end">
            <button 
              (click)="showUpdateModal = false"
              class="font-medium px-6 py-3 rounded-[12px] transition-all"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancel
            </button>
            <button 
              (click)="saveNodeUpdate()"
              class="text-white font-medium px-6 py-3 rounded-[12px] transition-all flex items-center gap-2"
              style="background-color: #8B5E3C;">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RoadmapNodesComponent implements OnInit {
  // Status colors
  private readonly STATUS_COLORS: { [key: string]: string } = {
    'not-started': '#EAE3DB',
    'in-progress': '#D4A373',
    'completed': '#8B5E3C',
    'mastered': '#4A3B33',
    'todo': '#EAE3DB',
    'done': '#8B5E3C'
  };

  private readonly DIFFICULTY_LABELS: { [key: string]: string } = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
    'expert': 'Expert'
  };

  nodes: PersonalNode[] = [];
  teamMembers: TeamMember[] = [];
  availableThemes: Theme[] = [];
  loading = false;
  error: string | null = null;
  showAddThemeModal = false;
  showUpdateModal = false;
  selectedThemeId = '';
  selectedView: 'personal' | 'members' = 'personal';
  selectedMemberId = '';
  currentUserId: string | null = null;
  isOwner = true;

  editingNode: {
    _id: string;
    themeId: string;
    status: string;
    progress: number;
    notes: string;
    dueDate?: string;
  } | null = null;

  get canEdit(): boolean {
    return this.selectedView === 'personal' || this.isOwner;
  }

  constructor(
    private roadmapService: RoadmapService,
    private themesService: ThemesService
  ) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentUserId = user.id;
    }
  }

  ngOnInit(): void {
    this.loadRoadmap();
    this.loadThemes();
    this.loadTeamMembers();
  }

  onViewChange(): void {
    if (this.selectedView === 'personal') {
      this.selectedMemberId = '';
      this.isOwner = true;
      this.loadRoadmap();
    } else {
      this.nodes = [];
      this.loadTeamMembers();
    }
  }

  onMemberChange(): void {
    if (this.selectedMemberId) {
      this.loadMemberRoadmap();
    } else {
      this.nodes = [];
    }
  }

  loadTeamMembers(): void {
    this.roadmapService.getTeamMembers().subscribe({
      next: (response) => {
        this.teamMembers = response.data.members;
      },
      error: (err) => {
        console.error('Error loading team members:', err);
      }
    });
  }

  loadMemberRoadmap(): void {
    if (!this.selectedMemberId) return;

    this.loading = true;
    this.error = null;

    this.roadmapService.getMemberRoadmap(this.selectedMemberId).subscribe({
      next: (response) => {
        this.nodes = response.data.roadmap;
        this.isOwner = response.data.isOwner || false;
        this.sortNodesByOrder();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not load member roadmap.';
        this.loading = false;
        console.error('Error loading member roadmap:', err);
      }
    });
  }

  loadRoadmap(): void {
    if (!this.currentUserId) return;

    this.loading = true;
    this.error = null;

    this.roadmapService.getPersonalRoadmap(this.currentUserId).subscribe({
      next: (response) => {
        this.nodes = response.data.roadmap;
        this.sortNodesByOrder();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not load roadmap. Please try again.';
        this.loading = false;
        console.error('Error loading roadmap:', err);
      }
    });
  }

  sortNodesByOrder(): void {
    this.nodes.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  loadThemes(): void {
    this.themesService.getThemes().subscribe({
      next: (response) => {
        this.availableThemes = response.data.themes;
      },
      error: (err) => {
        console.error('Error loading themes:', err);
      }
    });
  }

  onNodeDrop(event: CdkDragDrop<PersonalNode[]>): void {
    if (!this.canEdit) return;

    moveItemInArray(this.nodes, event.previousIndex, event.currentIndex);
    
    // Update order on backend
    const nodeOrders = this.nodes.map((node, index) => ({
      nodeId: node._id,
      order: index
    }));

    this.roadmapService.updateNodeOrder(nodeOrders).subscribe({
      error: (err) => {
        console.error('Error updating node order:', err);
        // Revert on error
        moveItemInArray(this.nodes, event.currentIndex, event.previousIndex);
      }
    });
  }

  addThemeToRoadmap(): void {
    if (!this.selectedThemeId) return;

    this.roadmapService.updateNode({
      themeId: this.selectedThemeId,
      status: 'not-started',
      progress: 0
    }).subscribe({
      next: () => {
        this.showAddThemeModal = false;
        this.selectedThemeId = '';
        this.loadRoadmap();
      },
      error: (err) => {
        this.error = 'Could not add theme to roadmap.';
        console.error('Error adding theme:', err);
      }
    });
  }

  editNode(node: PersonalNode): void {
    if (!this.canEdit) return;
    if (!node.themeId || typeof node.themeId === 'string') {
      this.error = 'Invalid theme data';
      return;
    }

    this.editingNode = {
      _id: node._id,
      themeId: node.themeId._id,
      status: node.status,
      progress: node.progress,
      notes: node.notes || '',
      dueDate: node.dueDate ? this.formatDateForInput(node.dueDate) : undefined
    };
    this.showUpdateModal = true;
  }

  formatDateForInput(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  saveNodeUpdate(): void {
    if (!this.editingNode || !this.canEdit) return;

    this.roadmapService.updateNode({
      themeId: this.editingNode.themeId,
      status: this.editingNode.status,
      progress: this.editingNode.progress,
      notes: this.editingNode.notes,
      dueDate: this.editingNode.dueDate ? new Date(this.editingNode.dueDate) : null
    }).subscribe({
      next: () => {
        this.showUpdateModal = false;
        this.editingNode = null;
        this.loadRoadmap();
      },
      error: (err) => {
        this.error = 'Could not update progress.';
        console.error('Error updating node:', err);
      }
    });
  }

  getCountByStatus(status: string): number {
    return this.nodes.filter(node => node.status === status).length;
  }

  getStatusColor(status: string): string {
    return this.STATUS_COLORS[status] || '#EAE3DB';
  }

  getDifficultyLabel(difficulty: string | undefined): string {
    if (!difficulty) return 'N/A';
    return this.DIFFICULTY_LABELS[difficulty] || difficulty;
  }

  getUserName(node: PersonalNode): string {
    if (typeof node.userId === 'object' && node.userId !== null) {
      const user = node.userId as PopulatedUser;
      return user.fullName || user.username || 'Member';
    }
    return 'Member';
  }
}
