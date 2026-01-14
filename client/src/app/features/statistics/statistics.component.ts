import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';
import { RoadmapService, PersonalNode } from '../../core/services/roadmap.service';
import { ProblemsService } from '../../core/services/problems.service';
import { AchievementsService, Achievement } from '../../core/services/achievements.service';
import { CustomAchievementsService, CustomAchievement, CreateCustomAchievementData } from '../../core/services/custom-achievements.service';
import { TeamService, TeamConfig } from '../../core/services/team.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <!-- Matte-Drift Statistics -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 px-6">
        <div class="py-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold flex items-center gap-2" style="color: #2D2622;">
              <!-- Lucide BarChart2 icon -->
              <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 20V10m-6 10V4M6 20v-6" />
              </svg>
              Statistics and Achievements
            </h2>
            <a routerLink="/dashboard" class="px-4 py-2 rounded-[12px] font-medium" style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Back to Dashboard
            </a>
          </div>

          <!-- Success/Error Messages -->
          <div *ngIf="successMessage" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #D4A373; color: #8B5E3C;">
            {{ successMessage }}
          </div>
          <div *ngIf="errorMessage" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #8B5E3C; color: #8B5E3C;">
            {{ errorMessage }}
          </div>

          <!-- Roadmap Statistics - Matte-Drift Card -->
          <div *ngIf="roadmapStats" class="bg-white rounded-[12px] p-6 mb-6" style="border: 1px solid #EAE3DB;">
            <h3 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: #2D2622;">
              <!-- Lucide TrendingUp icon -->
              <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Your Roadmap Progress
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold font-mono" style="color: #8B5E3C;">{{ roadmapStats.total }}</div>
                <div class="text-sm" style="color: #4A3B33;">Total Themes</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold font-mono" style="color: #D4A373;">{{ roadmapStats.inProgress }}</div>
                <div class="text-sm" style="color: #4A3B33;">In Progress</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold font-mono" style="color: #8B5E3C;">{{ roadmapStats.completed }}</div>
                <div class="text-sm" style="color: #4A3B33;">Completed</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold font-mono" style="color: #8B5E3C;">{{ roadmapStats.averageProgress }}%</div>
                <div class="text-sm" style="color: #4A3B33;">Average Progress</div>
              </div>
            </div>
            <div class="mt-6">
              <div class="rounded-[12px] h-3 overflow-hidden" style="background-color: #EAE3DB;">
                <div class="h-3 rounded-[12px] transition-all duration-500" style="background-color: #D4A373;" [style.width.%]="roadmapStats.averageProgress"></div>
              </div>
            </div>
          </div>

          <!-- Problem Statistics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- Codeforces Card - Codeforces themed -->
            <div class="bg-white rounded-[12px] p-6" style="border: 2px solid #4A90A4; background: linear-gradient(135deg, #FFFFFF 0%, #E8F4F8 100%);">
              <div class="flex items-center gap-2 mb-2">
                <!-- Lucide LineChart icon -->
                <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v18h18M7 17l4-4 3 3 4-4" />
                </svg>
                <h4 class="font-semibold" style="color: #2D2622;">Codeforces</h4>
                <span class="px-2 py-0.5 text-xs font-medium rounded-[12px]" style="background-color: #E8F4F8; color: #4A90A4; border: 1px solid #4A90A4;">CF</span>
              </div>
              <p class="text-2xl font-bold font-mono" style="color: #4A90A4;">{{ currentUser?.codeforcesHandle || 'No handle' }}</p>
              <p class="text-sm" style="color: #4A3B33;">Linked handle</p>
            </div>

            <div class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
              <div class="flex items-center gap-2 mb-2">
                <!-- Lucide CheckCircle icon -->
                <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 class="font-semibold" style="color: #2D2622;">Problems Solved</h4>
              </div>
              <p class="text-2xl font-bold font-mono" style="color: #D4A373;">{{ problemStats.solved }}</p>
              <p class="text-sm" style="color: #4A3B33;">of {{ problemStats.total }} total</p>
            </div>

            <div class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
              <div class="flex items-center gap-2 mb-2">
                <!-- Lucide Flame icon -->
                <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 2c0 5.523 4 8 4 12a6 6 0 11-8 0c0-4 4-6.477 4-12z" />
                </svg>
                <h4 class="font-semibold" style="color: #2D2622;">Activity</h4>
              </div>
              <p class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ activityStreak }}</p>
              <p class="text-sm" style="color: #4A3B33;">Days active this month</p>
            </div>
          </div>

          <!-- System Achievements Section -->
          <div class="bg-white rounded-[12px] p-6 mb-6" style="border: 1px solid #EAE3DB;">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2" style="color: #2D2622;">
              <!-- Lucide Award icon -->
              <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="8" r="6" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l-2 7 5-3 5 3-2-7" />
              </svg>
              System Achievements
            </h3>
            <p class="text-sm mb-4" style="color: #4A3B33;">
              System achievements are automatic recognitions that unlock when reaching certain milestones, 
              such as solving a specific number of problems, participating in contests, or maintaining an activity streak.
              Currently, the automatic achievements system is under development. For now, you can create your own custom achievements below.
            </p>
            
            <div *ngIf="loadingAchievements" class="text-center py-4">
              <p style="color: #4A3B33;">Loading achievements...</p>
            </div>

            <div *ngIf="!loadingAchievements && systemAchievements.length === 0" class="text-center py-4">
              <p style="color: #4A3B33;">You haven't unlocked any system achievements yet! Keep practicing to earn automatic badges.</p>
            </div>

            <div *ngIf="!loadingAchievements && systemAchievements.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div 
                *ngFor="let achievement of systemAchievements" 
                class="bg-white rounded-[12px] p-3 text-center"
                style="border: 1px solid #EAE3DB;">
                <div class="text-3xl mb-1">{{ achievement.icon || getDefaultAchievementIcon(achievement.type) }}</div>
                <p class="text-sm font-medium truncate" style="color: #2D2622;" [title]="achievement.name">{{ achievement.name }}</p>
                <span class="text-xs px-2 py-0.5 rounded-[12px] mt-1 inline-block" style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                  {{ achievement.rarity }}
                </span>
              </div>
            </div>
          </div>

          <!-- Custom Achievements (Logros) Section -->
          <div class="bg-white rounded-[12px] p-6 mb-6" style="border: 1px solid #EAE3DB;">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold flex items-center gap-2" style="color: #2D2622;">
                <!-- Lucide Trophy icon -->
                <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 3v6a6 6 0 006 6v0a6 6 0 006-6V3M9 21h6M12 15v6" />
                </svg>
                My Custom Achievements
              </h3>
              <button 
                (click)="openCreateAchievementModal()"
                class="text-white px-4 py-2 rounded-[12px] font-medium flex items-center gap-2"
                style="background-color: #8B5E3C;">
                <!-- Lucide Plus icon -->
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Achievement
              </button>
            </div>

            <!-- Filter tabs -->
            <div class="flex gap-2 mb-4">
              <button 
                (click)="filterAchievements = 'all'"
                class="px-4 py-2 rounded-[12px] text-sm font-medium"
                [ngStyle]="{
                  'background-color': filterAchievements === 'all' ? '#8B5E3C' : '#FCF9F5',
                  'color': filterAchievements === 'all' ? '#FFFFFF' : '#2D2622',
                  'border': '1px solid ' + (filterAchievements === 'all' ? '#8B5E3C' : '#EAE3DB')
                }">
                All
              </button>
              <button 
                (click)="filterAchievements = 'personal'"
                class="px-4 py-2 rounded-[12px] text-sm font-medium"
                [ngStyle]="{
                  'background-color': filterAchievements === 'personal' ? '#8B5E3C' : '#FCF9F5',
                  'color': filterAchievements === 'personal' ? '#FFFFFF' : '#2D2622',
                  'border': '1px solid ' + (filterAchievements === 'personal' ? '#8B5E3C' : '#EAE3DB')
                }">
                Personal
              </button>
              <button 
                (click)="filterAchievements = 'team'"
                class="px-4 py-2 rounded-[12px] text-sm font-medium"
                [ngStyle]="{
                  'background-color': filterAchievements === 'team' ? '#8B5E3C' : '#FCF9F5',
                  'color': filterAchievements === 'team' ? '#FFFFFF' : '#2D2622',
                  'border': '1px solid ' + (filterAchievements === 'team' ? '#8B5E3C' : '#EAE3DB')
                }">
                Team
              </button>
            </div>

            <!-- Category filter -->
            <div class="flex gap-2 mb-4">
              <button 
                (click)="filterCategory = 'all'"
                class="px-3 py-1 rounded-[12px] text-xs font-medium"
                [ngStyle]="{
                  'background-color': filterCategory === 'all' ? '#D4A373' : '#FCF9F5',
                  'color': filterCategory === 'all' ? '#FFFFFF' : '#2D2622',
                  'border': '1px solid ' + (filterCategory === 'all' ? '#D4A373' : '#EAE3DB')
                }">
                Todas las Categorías
              </button>
              <button 
                (click)="filterCategory = 'rating'"
                class="px-3 py-1 rounded-[12px] text-xs font-medium flex items-center gap-1"
                [ngStyle]="{
                  'background-color': filterCategory === 'rating' ? '#D4A373' : '#FCF9F5',
                  'color': filterCategory === 'rating' ? '#FFFFFF' : '#2D2622',
                  'border': '1px solid ' + (filterCategory === 'rating' ? '#D4A373' : '#EAE3DB')
                }">
                <!-- Lucide Star icon -->
                <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Rating
              </button>
              <button 
                (click)="filterCategory = 'contest'"
                class="px-3 py-1 rounded-[12px] text-xs font-medium flex items-center gap-1"
                [ngStyle]="{
                  'background-color': filterCategory === 'contest' ? '#D4A373' : '#FCF9F5',
                  'color': filterCategory === 'contest' ? '#FFFFFF' : '#2D2622',
                  'border': '1px solid ' + (filterCategory === 'contest' ? '#D4A373' : '#EAE3DB')
                }">
                <!-- Lucide Trophy icon -->
                <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 3v6a6 6 0 006 6v0a6 6 0 006-6V3M9 21h6M12 15v6" />
                </svg>
                Contest
              </button>
            </div>

            <div *ngIf="loadingCustomAchievements" class="text-center py-4">
              <p style="color: #4A3B33;">Loading custom achievements...</p>
            </div>

            <div *ngIf="!loadingCustomAchievements && getFilteredAchievements().length === 0" class="text-center py-8">
              <p class="mb-2" style="color: #4A3B33;">No achievements in this category.</p>
              <p class="text-sm" style="color: #4A3B33;">Create your first achievement to save your memories and inspiration!</p>
            </div>

            <div *ngIf="!loadingCustomAchievements && getFilteredAchievements().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                *ngFor="let achievement of getFilteredAchievements()" 
                class="bg-white rounded-[12px] p-6 relative"
                style="border: 1px solid #EAE3DB;">
                
                <!-- Scope badge -->
                <div class="absolute top-4 right-4">
                  <span 
                    class="text-xs px-2 py-1 rounded-[12px] flex items-center gap-1"
                    style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #8B5E3C;">
                    <ng-container *ngIf="achievement.scope === 'team'">
                      <!-- Lucide Users icon -->
                      <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Team
                    </ng-container>
                    <ng-container *ngIf="achievement.scope !== 'team'">
                      <!-- Lucide User icon -->
                      <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal
                    </ng-container>
                  </span>
                </div>

                <!-- Photo -->
                <div *ngIf="achievement.photo" class="mb-3">
                  <img 
                    [src]="achievement.photo" 
                    [alt]="achievement.name"
                    class="w-full h-32 object-cover rounded-[12px]">
                </div>

                <!-- Category icon -->
                <div class="mb-2">
                  <ng-container *ngIf="achievement.category === 'rating'">
                    <!-- Lucide Star icon -->
                    <svg class="w-8 h-8" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </ng-container>
                  <ng-container *ngIf="achievement.category !== 'rating'">
                    <!-- Lucide Trophy icon -->
                    <svg class="w-8 h-8" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 3v6a6 6 0 006 6v0a6 6 0 006-6V3M9 21h6M12 15v6" />
                    </svg>
                  </ng-container>
                </div>

                <h4 class="font-semibold mb-1" style="color: #2D2622;">{{ achievement.name }}</h4>
                <p class="text-sm mb-2 truncate" style="color: #4A3B33;" [title]="achievement.description">{{ achievement.description }}</p>

                <div class="text-xs mb-2 flex items-center gap-1" style="color: #4A3B33;">
                  <!-- Lucide Calendar icon -->
                  <svg class="w-3 h-3" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ achievement.achievedAt | date:'mediumDate' }}</span>
                  <span class="ml-2">by {{ achievement.createdBy?.username }}</span>
                </div>

                <div *ngIf="achievement.scope === 'team' && achievement.teamId" class="text-xs mb-2 flex items-center gap-1" style="color: #8B5E3C;">
                  <!-- Lucide Building icon -->
                  <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {{ achievement.teamId.name }}
                </div>

                <!-- Actions (only show for editable achievements) -->
                <div *ngIf="canEditAchievement(achievement)" class="flex gap-2 mt-3">
                  <button 
                    (click)="openEditAchievementModal(achievement)"
                    class="flex-1 text-white px-3 py-1 rounded-[12px] text-sm font-medium"
                    style="background-color: #8B5E3C;">
                    Edit
                  </button>
                  <button 
                    (click)="deleteAchievement(achievement)"
                    class="px-3 py-1 rounded-[12px] text-sm font-medium flex items-center justify-center"
                    style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                    <!-- Lucide Trash2 icon -->
                    <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Achievement Modal -->
      <div 
        *ngIf="showAchievementModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="closeAchievementModal()">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">
            {{ editingAchievement ? 'Edit Achievement' : 'New Achievement' }}
          </h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Name *</label>
              <input 
                type="text"
                [(ngModel)]="achievementFormData.name"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="E.g.: First Top 100 on Codeforces"
                maxlength="100">
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Description *</label>
              <textarea 
                [(ngModel)]="achievementFormData.description"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                rows="3"
                placeholder="Describe the achievement and why it is special to you"
                maxlength="500"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">URL de Foto (opcional)</label>
              <input 
                type="url"
                [(ngModel)]="achievementFormData.photo"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="https://ejemplo.com/foto.jpg">
              <p class="text-xs mt-1" style="color: #4A3B33;">Puedes usar una URL de imagen externa</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Categoría *</label>
              <div class="flex gap-2">
                <button 
                  type="button"
                  (click)="achievementFormData.category = 'rating'"
                  class="flex-1 px-4 py-2 rounded-[12px] font-medium flex items-center justify-center gap-1"
                  [ngStyle]="{
                    'background-color': achievementFormData.category === 'rating' ? '#8B5E3C' : '#FCF9F5',
                    'color': achievementFormData.category === 'rating' ? '#FFFFFF' : '#2D2622',
                    'border': '1px solid ' + (achievementFormData.category === 'rating' ? '#8B5E3C' : '#EAE3DB')
                  }">
                  <!-- Lucide Star icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Rating
                </button>
                <button 
                  type="button"
                  (click)="achievementFormData.category = 'contest'"
                  class="flex-1 px-4 py-2 rounded-[12px] font-medium flex items-center justify-center gap-1"
                  [ngStyle]="{
                    'background-color': achievementFormData.category === 'contest' ? '#8B5E3C' : '#FCF9F5',
                    'color': achievementFormData.category === 'contest' ? '#FFFFFF' : '#2D2622',
                    'border': '1px solid ' + (achievementFormData.category === 'contest' ? '#8B5E3C' : '#EAE3DB')
                  }">
                  <!-- Lucide Trophy icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 3v6a6 6 0 006 6v0a6 6 0 006-6V3M9 21h6M12 15v6" />
                  </svg>
                  Contest
                </button>
              </div>
            </div>

            <!-- Scope field - Personal or Team -->
            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Tipo de Logro *</label>
              <div class="flex gap-2">
                <button 
                  type="button"
                  (click)="achievementFormData.scope = 'personal'"
                  class="flex-1 px-4 py-2 rounded-[12px] font-medium"
                  [ngStyle]="{
                    'background-color': achievementFormData.scope === 'personal' ? '#8B5E3C' : '#FCF9F5',
                    'color': achievementFormData.scope === 'personal' ? '#FFFFFF' : '#2D2622',
                    'border': '1px solid ' + (achievementFormData.scope === 'personal' ? '#8B5E3C' : '#EAE3DB')
                  }">
                  <!-- Lucide User icon -->
                  <svg class="w-4 h-4 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal
                </button>
                <button 
                  type="button"
                  (click)="achievementFormData.scope = 'team'"
                  class="flex-1 px-4 py-2 rounded-[12px] font-medium"
                  [ngStyle]="{
                    'background-color': achievementFormData.scope === 'team' ? '#8B5E3C' : '#FCF9F5',
                    'color': achievementFormData.scope === 'team' ? '#FFFFFF' : '#2D2622',
                    'border': '1px solid ' + (achievementFormData.scope === 'team' ? '#8B5E3C' : '#EAE3DB')
                  }">
                  <!-- Lucide Users icon -->
                  <svg class="w-4 h-4 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Team
                </button>
              </div>
              <p class="text-xs mt-1" style="color: #4A3B33;">
                {{ achievementFormData.scope === 'personal' ? 'This achievement is yours and only you will see it.' : 'This achievement will be visible to all team members.' }}
              </p>
            </div>

            <!-- Team info message (shown only when scope is team) -->
            <div *ngIf="achievementFormData.scope === 'team' && userTeams.length === 0" class="rounded-[12px] p-3" style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
              <p class="text-sm" style="color: #4A3B33;">You don't belong to any active team. Team achievements require team membership.</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Achievement Date</label>
              <input 
                type="date"
                [(ngModel)]="achievementFormData.achievedAt"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="closeAchievementModal()"
              class="px-4 py-2 rounded-[12px] font-medium"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancel
            </button>
            <button 
              (click)="saveAchievement()"
              [disabled]="savingAchievement || !isAchievementFormValid()"
              class="text-white px-4 py-2 rounded-[12px] font-medium disabled:opacity-50"
              style="background-color: #8B5E3C;">
              {{ savingAchievement ? 'Saving...' : (editingAchievement ? 'Update' : 'Create') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class StatisticsComponent implements OnInit {
  private readonly PROBLEM_STATUS_ACCEPTED = 'ac' as const;

  currentUser: User | null = null;

  // Roadmap stats
  roadmapStats: {
    total: number;
    inProgress: number;
    completed: number;
    averageProgress: number;
  } | null = null;

  // Problem stats
  problemStats = {
    total: 0,
    solved: 0
  };
  activityStreak = 0;

  // System achievements
  systemAchievements: Achievement[] = [];
  loadingAchievements = false;

  // Custom achievements
  customAchievements: CustomAchievement[] = [];
  loadingCustomAchievements = false;
  filterAchievements: 'all' | 'personal' | 'team' = 'all';
  filterCategory: 'all' | 'rating' | 'contest' = 'all';

  // Achievement modal
  showAchievementModal = false;
  editingAchievement: CustomAchievement | null = null;
  savingAchievement = false;
  achievementFormData: {
    name: string;
    description: string;
    photo: string;
    category: 'rating' | 'contest';
    scope: 'personal' | 'team';
    teamId: string;
    achievedAt: string;
  } = {
    name: '',
    description: '',
    photo: '',
    category: 'contest',
    scope: 'personal',
    teamId: '',
    achievedAt: ''
  };

  // Teams
  userTeams: TeamConfig[] = [];

  // Messages
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private roadmapService: RoadmapService,
    private problemsService: ProblemsService,
    private achievementsService: AchievementsService,
    private customAchievementsService: CustomAchievementsService,
    private teamService: TeamService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadRoadmapStats();
        this.loadProblemStats();
        this.loadSystemAchievements();
        this.loadCustomAchievements();
        this.loadUserTeams();
      }
    });
  }

  // Stats loading methods
  loadRoadmapStats(): void {
    this.roadmapService.getRoadmap().subscribe({
      next: (response) => {
        const nodes = response.data.roadmap;
        const total = nodes.length;
        const inProgress = nodes.filter(n => n.status === 'in-progress').length;
        const completed = nodes.filter(n => n.status === 'completed' || n.status === 'mastered' || n.status === 'done').length;
        const averageProgress = total > 0 
          ? Math.round(nodes.reduce((sum, n) => sum + n.progress, 0) / total) 
          : 0;

        this.roadmapStats = { total, inProgress, completed, averageProgress };
        this.calculateActivityStreak(nodes);
      },
      error: (err) => console.error('Error loading roadmap stats:', err)
    });
  }

  loadProblemStats(): void {
    if (!this.currentUser) return;

    this.problemsService.getPersonalProblems(this.currentUser.id).subscribe({
      next: (response) => {
        const problems = response.data.problems;
        this.problemStats.total = problems.length;
        this.problemStats.solved = problems.filter(p => p.status === this.PROBLEM_STATUS_ACCEPTED).length;
      },
      error: (err) => console.error('Error loading problem stats:', err)
    });
  }

  calculateActivityStreak(nodes: PersonalNode[]): void {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const activeDays = new Set<string>();
    nodes.forEach(node => {
      const updatedDate = new Date(node.updatedAt);
      if (updatedDate >= startOfMonth) {
        activeDays.add(updatedDate.toDateString());
      }
    });
    
    this.activityStreak = activeDays.size;
  }

  loadSystemAchievements(): void {
    if (!this.currentUser) return;

    this.loadingAchievements = true;
    this.achievementsService.getUserAchievements(this.currentUser.id).subscribe({
      next: (response) => {
        this.systemAchievements = response.data.achievements;
        this.loadingAchievements = false;
      },
      error: (err) => {
        console.error('Error loading system achievements:', err);
        this.loadingAchievements = false;
      }
    });
  }

  loadCustomAchievements(): void {
    this.loadingCustomAchievements = true;
    this.customAchievementsService.getCustomAchievements().subscribe({
      next: (response) => {
        this.customAchievements = response.data.achievements;
        this.loadingCustomAchievements = false;
      },
      error: (err) => {
        console.error('Error loading custom achievements:', err);
        this.loadingCustomAchievements = false;
      }
    });
  }

  loadUserTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (response) => {
        // Filter teams where current user is an active member
        this.userTeams = response.data.teams.filter(team => 
          team.members.some(m => {
            const memberId = this.extractUserId(m.userId);
            return memberId === this.currentUser?.id && m.isActive === true;
          })
        );
      },
      error: (err) => console.error('Error loading teams:', err)
    });
  }

  /**
   * Extract user ID from a populated or non-populated userId field
   */
  private extractUserId(userId: any): string | null {
    if (!userId) return null;
    if (typeof userId === 'string') return userId;
    if (typeof userId === 'object' && userId._id) return userId._id;
    return null;
  }

  // Custom achievements methods
  getFilteredAchievements(): CustomAchievement[] {
    return this.customAchievements.filter(a => {
      const scopeMatch = this.filterAchievements === 'all' || a.scope === this.filterAchievements;
      const categoryMatch = this.filterCategory === 'all' || a.category === this.filterCategory;
      return scopeMatch && categoryMatch;
    });
  }

  canEditAchievement(achievement: CustomAchievement): boolean {
    if (!this.currentUser) return false;
    
    if (achievement.scope === 'personal') {
      return achievement.createdBy._id === this.currentUser.id;
    } else {
      // For team achievements, check if user is active member
      return this.userTeams.some(t => t._id === achievement.teamId?._id);
    }
  }

  openCreateAchievementModal(): void {
    this.editingAchievement = null;
    this.achievementFormData = {
      name: '',
      description: '',
      photo: '',
      category: 'contest',
      scope: 'personal',
      teamId: '',
      achievedAt: new Date().toISOString().split('T')[0]
    };
    this.showAchievementModal = true;
  }

  openEditAchievementModal(achievement: CustomAchievement): void {
    this.editingAchievement = achievement;
    this.achievementFormData = {
      name: achievement.name,
      description: achievement.description,
      photo: achievement.photo || '',
      category: achievement.category,
      scope: achievement.scope,
      teamId: achievement.teamId?._id || '',
      achievedAt: new Date(achievement.achievedAt).toISOString().split('T')[0]
    };
    this.showAchievementModal = true;
  }

  closeAchievementModal(): void {
    this.showAchievementModal = false;
    this.editingAchievement = null;
  }

  isAchievementFormValid(): boolean {
    const { name, description, category, scope } = this.achievementFormData;
    if (!name || !description || !category || !scope) return false;
    // For team scope, we auto-select the first team, so just check if user has teams
    if (scope === 'team' && this.userTeams.length === 0) return false;
    return true;
  }

  saveAchievement(): void {
    if (!this.isAchievementFormValid()) return;

    this.savingAchievement = true;
    // For new achievements, auto-select first team (defaults to turistas team)
    // For editing, preserve the original team
    const teamIdToUse = this.editingAchievement 
      ? this.achievementFormData.teamId 
      : (this.userTeams.length > 0 ? this.userTeams[0]._id : undefined);
    
    const data: CreateCustomAchievementData = {
      name: this.achievementFormData.name,
      description: this.achievementFormData.description,
      photo: this.achievementFormData.photo || undefined,
      category: this.achievementFormData.category,
      scope: this.achievementFormData.scope,
      teamId: this.achievementFormData.scope === 'team' ? teamIdToUse : undefined,
      achievedAt: this.achievementFormData.achievedAt ? new Date(this.achievementFormData.achievedAt) : undefined
    };

    if (this.editingAchievement) {
      this.customAchievementsService.updateCustomAchievement(this.editingAchievement._id, data).subscribe({
        next: () => {
          this.savingAchievement = false;
          this.closeAchievementModal();
          this.loadCustomAchievements();
          this.showSuccess('Achievement updated successfully');
        },
        error: (err) => {
          this.savingAchievement = false;
          this.showError(err.error?.message || 'Error updating achievement');
        }
      });
    } else {
      this.customAchievementsService.createCustomAchievement(data).subscribe({
        next: () => {
          this.savingAchievement = false;
          this.closeAchievementModal();
          this.loadCustomAchievements();
          this.showSuccess('Achievement created successfully');
        },
        error: (err) => {
          this.savingAchievement = false;
          this.showError(err.error?.message || 'Error creating achievement');
        }
      });
    }
  }

  deleteAchievement(achievement: CustomAchievement): void {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    this.customAchievementsService.deleteCustomAchievement(achievement._id).subscribe({
      next: () => {
        this.loadCustomAchievements();
        this.showSuccess('Achievement deleted successfully');
      },
      error: (err) => {
        this.showError(err.error?.message || 'Error deleting achievement');
      }
    });
  }

  // Helper methods for system achievements
  getAchievementClass(rarity: string): string {
    const classes: { [key: string]: string } = {
      'common': 'from-gray-50 to-gray-100 border-gray-300',
      'rare': 'from-blue-50 to-blue-100 border-blue-300',
      'epic': 'from-purple-50 to-purple-100 border-purple-300',
      'legendary': 'from-yellow-50 to-amber-100 border-yellow-400'
    };
    return classes[rarity] || classes['common'];
  }

  getAchievementBadgeClass(rarity: string): string {
    const classes: { [key: string]: string } = {
      'common': 'bg-gray-200 text-gray-700',
      'rare': 'bg-blue-200 text-blue-700',
      'epic': 'bg-purple-200 text-purple-700',
      'legendary': 'bg-yellow-200 text-yellow-700'
    };
    return classes[rarity] || classes['common'];
  }

  getDefaultAchievementIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'problem-solving': '💡',
      'contest': '🏆',
      'streak': '🔥',
      'rating': '⭐',
      'contribution': '🤝',
      'special': '🎁'
    };
    return icons[type] || '🎖️';
  }

  // Message helpers
  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = null, 5000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = null, 5000);
  }
}
