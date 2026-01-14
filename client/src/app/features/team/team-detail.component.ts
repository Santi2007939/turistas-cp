import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamService, TeamConfig, TeamMember } from '../../core/services/team.service';
import { TeamUtils } from '../../shared/utils/team.utils';
import { IntegrationsService } from '../../core/services/integrations.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <!-- Matte-Drift Team Detail -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
      <div *ngIf="loading" class="text-center py-8">
        <p style="color: #4A3B33;">Loading team...</p>
      </div>

      <div *ngIf="error" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #EAE3DB; color: #2D2622;">
        {{ error }}
      </div>

      <div *ngIf="successMessage" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #D4A373; color: #8B5E3C;">
        {{ successMessage }}
      </div>

      <div *ngIf="team && !loading">
        <div class="bg-white rounded-[12px] p-8 mb-6" style="border: 1px solid #EAE3DB;">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h1 class="text-3xl font-semibold mb-2" style="color: #2D2622;">{{ team.name }}</h1>
              <p style="color: #4A3B33;">{{ team.description || 'No description' }}</p>
            </div>
            <button 
              (click)="goBack()"
              class="px-4 py-2 rounded-[12px] font-medium"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Back to Dashboard
            </button>
          </div>

          <div class="flex gap-2 mb-6">
            <span 
              *ngIf="team.settings.isPublic"
              class="px-3 py-1 rounded-[12px]"
              style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
              Public Team
            </span>
            <span 
              *ngIf="!team.settings.isPublic"
              class="px-3 py-1 rounded-[12px]"
              style="background-color: #FCF9F5; color: #4A3B33; border: 1px solid #EAE3DB;">
              Private Team
            </span>
            <span 
              *ngIf="team.settings.allowJoinRequests"
              class="px-3 py-1 rounded-[12px]"
              style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
              Open to Join Requests
            </span>
          </div>

          <!-- Team Statistics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
              <p class="text-sm mb-1" style="color: #4A3B33;">Total Problems Solved</p>
              <p class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ team.statistics.totalProblemsSolved }}</p>
            </div>
            <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
              <p class="text-sm mb-1" style="color: #4A3B33;">Total Contests</p>
              <p class="text-2xl font-bold font-mono" style="color: #D4A373;">{{ team.statistics.totalContests }}</p>
            </div>
            <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
              <p class="text-sm mb-1" style="color: #4A3B33;">Average Rating</p>
              <p class="text-2xl font-bold font-mono" style="color: #8B5E3C;">{{ team.statistics.averageRating || 'N/A' }}</p>
            </div>
          </div>

          <!-- Team Members -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold mb-3" style="color: #2D2622;">
              Active Members ({{ getActiveMembers().length }} / 3)
            </h2>
            <div class="space-y-2 mb-4">
              <div 
                *ngFor="let member of getActiveMembers()" 
                class="flex justify-between items-center bg-white rounded-[12px] p-3"
                style="border: 1px solid #D4A373;">
                <div>
                  <p class="font-semibold" style="color: #2D2622;">
                    {{ member.userId?.username || 'Member' }}
                  </p>
                  <p class="text-sm" style="color: #4A3B33;">
                    Joined {{ member.joinedAt | date:'mediumDate' }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-[12px] text-sm" style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                    Member
                  </span>
                  <button
                    *ngIf="isTeamMemberOrCoach()"
                    (click)="toggleMemberActive(member, false)"
                    class="text-white px-3 py-1 rounded-[12px] text-sm"
                    style="background-color: #D4A373;">
                    Set Inactive
                  </button>
                </div>
              </div>
              <div *ngIf="getActiveMembers().length === 0" class="text-center py-4" style="color: #4A3B33;">
                No active members yet
              </div>
            </div>

            <h2 class="text-xl font-semibold mb-3 mt-6" style="color: #2D2622;">
              Inactive Members ({{ getInactiveMembers().length }})
            </h2>
            <div class="space-y-2">
              <div 
                *ngFor="let member of getInactiveMembers()" 
                class="flex justify-between items-center bg-white rounded-[12px] p-3"
                style="border: 1px solid #EAE3DB;">
                <div>
                  <p class="font-semibold" style="color: #2D2622;">
                    {{ member.userId?.username || 'Member' }}
                  </p>
                  <p class="text-sm" style="color: #4A3B33;">
                    Joined {{ member.joinedAt | date:'mediumDate' }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-[12px] text-sm" style="background-color: #FCF9F5; color: #4A3B33; border: 1px solid #EAE3DB;">
                    Inactive
                  </span>
                  <button
                    *ngIf="isTeamMemberOrCoach() && getActiveMembers().length < 3"
                    (click)="toggleMemberActive(member, true)"
                    class="text-white px-3 py-1 rounded-[12px] text-sm"
                    style="background-color: #8B5E3C;">
                    Set Active
                  </button>
                </div>
              </div>
              <div *ngIf="getInactiveMembers().length === 0" class="text-center py-4" style="color: #4A3B33;">
                No inactive members
              </div>
            </div>
          </div>

          <!-- Team Links Section -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold mb-3" style="color: #2D2622;">Team Links</h2>
            <div class="bg-white rounded-[12px] p-4 space-y-3" style="border: 1px solid #EAE3DB;">
              <!-- WhatsApp Group -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <!-- WhatsApp Logo SVG -->
                  <svg class="w-8 h-8" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 0C10.745 0 0 10.745 0 24c0 4.197 1.083 8.14 2.978 11.566L0 48l12.722-3.338A23.852 23.852 0 0024 48c13.255 0 24-10.745 24-24S37.255 0 24 0z" fill="#25D366"/>
                    <path d="M35.372 33.243c-.556 1.563-2.746 2.868-4.507 3.243-1.199.251-2.769.453-8.05-1.729-6.778-2.801-11.143-9.685-11.488-10.129-.333-.444-2.769-3.685-2.769-7.028 0-3.343 1.755-4.989 2.378-5.667.622-.677 1.356-.846 1.81-.846.453 0 .906.004 1.302.024.418.02.979-.159 1.531 1.167.555 1.333 1.898 4.63 2.064 4.967.166.337.277.73.055 1.174-.221.444-.332.722-.666 1.112-.333.389-.7.87-1 1.167-.333.332-.678.69-.29 1.356.389.666 1.731 2.858 3.718 4.632 2.555 2.28 4.707 2.986 5.373 3.323.666.337 1.055.277 1.444-.166.388-.444 1.676-1.952 2.122-2.619.444-.666.89-.555 1.499-.332.611.222 3.883 1.833 4.55 2.167.666.333 1.11.5 1.276.777.166.277.166 1.611-.388 3.174z" fill="#fff"/>
                  </svg>
                  <span class="font-medium" style="color: #2D2622;">WhatsApp Group</span>
                </div>
                <div class="flex gap-2">
                  <a 
                    *ngIf="team.links?.whatsappGroup"
                    [href]="team.links?.whatsappGroup || ''" 
                    target="_blank"
                    class="text-white px-4 py-2 rounded-[12px] text-sm font-medium flex items-center gap-2"
                    style="background-color: #25D366;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    Join Group
                  </a>
                  <button 
                    *ngIf="isCoachOrAdmin()"
                    (click)="openEditWhatsAppModal()"
                    class="px-4 py-2 rounded-[12px] text-sm"
                    style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                    {{ team.links?.whatsappGroup ? 'Edit Link' : 'Add Link' }}
                  </button>
                </div>
              </div>

              <!-- Discord Server -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <!-- Discord Logo SVG -->
                  <svg class="w-8 h-8" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0)">
                      <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="#5865F2"/>
                    </g>
                    <defs>
                      <clipPath id="clip0">
                        <rect width="71" height="55" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <span class="font-medium" style="color: #2D2622;">Discord Server</span>
                </div>
                <div class="flex gap-2">
                  <a 
                    *ngIf="team.links?.discordServer"
                    [href]="team.links?.discordServer || ''" 
                    target="_blank"
                    class="text-white px-4 py-2 rounded-[12px] text-sm font-medium flex items-center gap-2"
                    style="background-color: #5865F2;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    Join Server
                  </a>
                  <button 
                    *ngIf="isCoachOrAdmin()"
                    (click)="openEditDiscordModal()"
                    class="px-4 py-2 rounded-[12px] text-sm"
                    style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                    {{ team.links?.discordServer ? 'Edit Link' : 'Add Link' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Service Integrations Section -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold mb-3" style="color: #2D2622;">Service Integrations</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- USACO IDE Sessions -->
              <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                <div class="flex items-center gap-2 mb-2">
                  <!-- Lucide Code icon -->
                  <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <h3 class="font-semibold" style="color: #2D2622;">USACO IDE Sessions</h3>
                </div>
                <p class="text-sm mb-3" style="color: #4A3B33;">Manage shareable IDE links with code templates</p>
                <div class="flex gap-2">
                  <button 
                    (click)="openAddSessionModal()"
                    class="flex-1 text-white px-4 py-2 rounded-[12px] text-sm"
                    style="background-color: #8B5E3C;">
                    Add session
                  </button>
                  <button 
                    (click)="openViewTemplatesModal()"
                    class="flex-1 px-4 py-2 rounded-[12px] text-sm"
                    style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                    View templates
                  </button>
                </div>
              </div>

              <!-- Excalidraw Sessions -->
              <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                <div class="flex items-center gap-2 mb-2">
                  <!-- Lucide Pencil/Edit icon -->
                  <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h3 class="font-semibold" style="color: #2D2622;">Excalidraw Sessions</h3>
                </div>
                <p class="text-sm mb-3" style="color: #4A3B33;">Managed sessions for diagrams and visualizations</p>
                <button 
                  (click)="openAddExcalidrawSessionModal()"
                  class="w-full text-white px-4 py-2 rounded-[12px] text-sm"
                  style="background-color: #8B5E3C;">
                  Add session
                </button>
              </div>

              <!-- RPC Contests -->
              <div class="bg-white rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                <div class="flex items-center gap-2 mb-2">
                  <!-- Lucide Trophy icon -->
                  <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 3v6a6 6 0 006 6v0a6 6 0 006-6V3M9 21h6M12 15v6" />
                  </svg>
                  <h3 class="font-semibold" style="color: #2D2622;">RPC Contests</h3>
                </div>
                <p class="text-sm mb-3" style="color: #4A3B33;">View calendar and register for contests</p>
                <button 
                  (click)="openRPCContestsModal()"
                  class="w-full text-white px-4 py-2 rounded-[12px] text-sm"
                  style="background-color: #D4A373;">
                  View contests
                </button>
              </div>
            </div>
          </div>

          <!-- Code Sessions List -->
          <div *ngIf="team.codeSessions && team.codeSessions.length > 0" class="mb-6">
            <h2 class="text-xl font-semibold mb-3" style="color: #2D2622;">USACO IDE Sessions</h2>
            <div class="space-y-3">
              <div 
                *ngFor="let session of team.codeSessions" 
                class="bg-white rounded-[12px] p-4"
                style="border: 1px solid #EAE3DB;">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex-1">
                    <p class="font-semibold" style="color: #2D2622;">{{ session.name }}</p>
                    <p class="text-sm" style="color: #4A3B33;">Created {{ session.createdAt | date:'mediumDate' }}</p>
                  </div>
                  <div class="flex gap-2">
                    <a 
                      [href]="session.link" 
                      target="_blank"
                      class="text-white px-4 py-2 rounded-[12px] text-sm"
                      style="background-color: #8B5E3C;">
                      Open IDE
                    </a>
                    <button
                      *ngIf="isUserInTeam()"
                      (click)="openRenameSessionModal(session)"
                      class="px-3 py-2 rounded-[12px] text-sm"
                      style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                      Rename
                    </button>
                    <button
                      *ngIf="isUserInTeam() && session._id"
                      (click)="deleteSession(session._id!)"
                      class="px-3 py-2 rounded-[12px] text-sm text-red-600"
                      style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
                      Delete
                    </button>
                  </div>
                </div>
                <!-- Linked Excalidraw Sessions -->
                <div *ngIf="getLinkedExcalidrawSessions(session).length > 0" class="mt-3 pl-4" style="border-left: 2px solid #D4A373;">
                  <p class="text-sm font-medium mb-2" style="color: #4A3B33;">Linked Excalidraw Sessions:</p>
                  <div class="space-y-1">
                    <div *ngFor="let excSession of getLinkedExcalidrawSessions(session)" class="flex items-center gap-2">
                      <!-- Lucide Pencil icon -->
                      <svg class="w-4 h-4" style="color: #8B5E3C;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <a [href]="excSession.url" target="_blank" class="text-sm hover:underline" style="color: #8B5E3C;">
                        {{ excSession.name }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Excalidraw Sessions -->
          <div *ngIf="team.excalidrawSessions && team.excalidrawSessions.length > 0" class="mb-6">
            <h2 class="text-xl font-semibold mb-3" style="color: #2D2622;">Excalidraw Sessions</h2>
            <div class="space-y-2">
              <div 
                *ngFor="let excSession of team.excalidrawSessions" 
                class="flex justify-between items-center bg-white rounded-[12px] p-3"
                style="border: 1px solid #EAE3DB;">
                <div class="flex-1">
                  <p class="font-semibold" style="color: #2D2622;">{{ excSession.name }}</p>
                  <p class="text-sm" style="color: #4A3B33;">Created {{ excSession.createdAt | date:'mediumDate' }}</p>
                  <p *ngIf="excSession.linkedToCodeSessionId" class="text-sm mt-1 flex items-center gap-1" style="color: #8B5E3C;">
                    <!-- Lucide Link icon -->
                    <svg class="w-3 h-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Linked to: {{ getCodeSessionName(excSession.linkedToCodeSessionId) }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <a 
                    [href]="excSession.url" 
                    target="_blank"
                    class="text-white px-4 py-2 rounded-[12px] text-sm"
                    style="background-color: #8B5E3C;">
                    Open board
                  </a>
                  <button
                    *ngIf="isUserInTeam()"
                    (click)="openEditExcalidrawSessionModal(excSession)"
                    class="px-3 py-2 rounded-[12px] text-sm"
                    style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                    Edit
                  </button>
                  <button
                    *ngIf="isUserInTeam() && excSession._id"
                    (click)="deleteExcalidrawSession(excSession._id!)"
                    class="px-3 py-2 rounded-[12px] text-sm text-red-600"
                    style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Excalidraw Rooms -->
          <div *ngIf="team.excalidrawRooms && team.excalidrawRooms.length > 0" class="mb-6">
            <h2 class="text-xl font-semibold mb-3" style="color: #2D2622;">Collaboration Rooms</h2>
            <div class="space-y-2">
              <div 
                *ngFor="let room of team.excalidrawRooms" 
                class="flex justify-between items-center bg-white rounded-[12px] p-3"
                style="border: 1px solid #EAE3DB;">
                <div>
                  <p class="font-semibold" style="color: #2D2622;">{{ room.name }}</p>
                  <p class="text-sm" style="color: #4A3B33;">Created {{ room.createdAt | date:'mediumDate' }}</p>
                </div>
                <a 
                  [href]="room.url" 
                  target="_blank"
                  class="text-white px-4 py-2 rounded-[12px] text-sm"
                  style="background-color: #8B5E3C;">
                  Open Room
                </a>
              </div>
            </div>
          </div>

          <!-- Team Settings -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold mb-3" style="color: #2D2622;">Team Settings</h2>
            <div class="bg-white rounded-[12px] p-4 space-y-2" style="border: 1px solid #EAE3DB;">
              <div class="flex justify-between">
                <span style="color: #4A3B33;">Shared Roadmap:</span>
                <span class="font-semibold" style="color: #2D2622;">{{ team.settings.sharedRoadmap ? 'Yes' : 'No' }}</span>
              </div>
              <div class="flex justify-between">
                <span style="color: #4A3B33;">Shared Calendar:</span>
                <span class="font-semibold" style="color: #2D2622;">{{ team.settings.sharedCalendar ? 'Yes' : 'No' }}</span>
              </div>
              <div class="flex justify-between">
                <span style="color: #4A3B33;">Max Members:</span>
                <span class="font-semibold font-mono" style="color: #2D2622;">{{ team.maxMembers }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button 
              *ngIf="!isUserInTeam()"
              (click)="joinTeam()"
              class="text-white font-medium py-2 px-6 rounded-[12px]"
              style="background-color: #8B5E3C;">
              Join Team
            </button>
          </div>
        </div>
      </div>

      <!-- WhatsApp Edit Modal -->
      <div 
        *ngIf="showEditWhatsAppModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        (click)="showEditWhatsAppModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-md" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">Edit WhatsApp Group Link</h3>
          <input 
            type="url"
            [(ngModel)]="editedWhatsAppLink"
            placeholder="https://chat.whatsapp.com/..."
            class="w-full rounded-[12px] px-4 py-3 mb-4"
            style="border: 1px solid #EAE3DB; color: #2D2622;">
          <div class="flex gap-2 justify-end">
            <button 
              (click)="showEditWhatsAppModal = false"
              class="px-4 py-2 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancel
            </button>
            <button 
              (click)="saveWhatsAppLink()"
              class="text-white px-4 py-2 rounded-[12px]"
              style="background-color: #8B5E3C;">
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- Discord Edit Modal -->
      <div 
        *ngIf="showEditDiscordModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        (click)="showEditDiscordModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-md" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">Edit Discord Server Link</h3>
          <input 
            type="url"
            [(ngModel)]="editedDiscordLink"
            placeholder="https://discord.gg/..."
            class="w-full rounded-[12px] px-4 py-3 mb-4"
            style="border: 1px solid #EAE3DB; color: #2D2622;">
          <div class="flex gap-2 justify-end">
            <button 
              (click)="showEditDiscordModal = false"
              class="px-4 py-2 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancel
            </button>
            <button 
              (click)="saveDiscordLink()"
              class="text-white px-4 py-2 rounded-[12px]"
              style="background-color: #8B5E3C;">
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- Code Template Edit Modal -->
      <div 
        *ngIf="showEditTemplateModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="showEditTemplateModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">Edit Code Template</h3>
          <p class="text-sm mb-4" style="color: #4A3B33;">
            This template will be used when creating USACO IDE links for your team.
          </p>
          <textarea 
            [(ngModel)]="editedTemplate"
            rows="20"
            placeholder="// Your code template here..."
            class="w-full rounded-[12px] px-4 py-3 mb-4 font-mono text-sm"
            style="border: 1px solid #EAE3DB; color: #2D2622;">
          </textarea>
          <div class="flex gap-2 justify-end">
            <button 
              (click)="showEditTemplateModal = false"
              class="px-4 py-2 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancel
            </button>
            <button 
              (click)="saveTemplate()"
              class="text-white px-4 py-2 rounded-[12px]"
              style="background-color: #8B5E3C;">
              Save Template
            </button>
          </div>
        </div>
      </div>

      <!-- Create Excalidraw Room Modal -->
      <div 
        *ngIf="showCreateExcalidrawModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        (click)="showCreateExcalidrawModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-md" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">Create Excalidraw Room</h3>
          <input 
            type="text"
            [(ngModel)]="newRoomName"
            placeholder="Room name..."
            class="w-full rounded-[12px] px-4 py-3 mb-4"
            style="border: 1px solid #EAE3DB; color: #2D2622;">
          <div class="flex gap-2 justify-end">
            <button 
              (click)="showCreateExcalidrawModal = false"
              class="px-4 py-2 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancel
            </button>
            <button 
              (click)="createExcalidrawRoom()"
              [disabled]="!newRoomName || creatingRoom"
              class="text-white px-4 py-2 rounded-[12px] disabled:opacity-50"
              style="background-color: #8B5E3C;">
              {{ creatingRoom ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </div>
      </div>

      <!-- RPC Contests Modal -->
      <div 
        *ngIf="showRPCContestsModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="showRPCContestsModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">RPC Contest Schedule</h3>
          
          <div *ngIf="loadingRPCContests" class="text-center py-8">
            <p style="color: #4A3B33;">Loading contests...</p>
          </div>

          <div *ngIf="rpcContestsError" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #EAE3DB; color: #2D2622;">
            {{ rpcContestsError }}
          </div>

          <div *ngIf="!loadingRPCContests && rpcContests.length === 0" class="text-center py-8" style="color: #4A3B33;">
            No upcoming contests found.
          </div>

          <div *ngIf="!loadingRPCContests && rpcContests.length > 0" class="space-y-3 mb-4">
            <div *ngFor="let contest of rpcContests" class="rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
              <h4 class="font-semibold mb-2" style="color: #2D2622;">{{ contest.name || 'Contest' }}</h4>
              <div class="text-sm space-y-1" style="color: #4A3B33;">
                <p><strong>Start:</strong> {{ contest.startTime }}</p>
                <p><strong>Duration:</strong> {{ contest.duration }}</p>
              </div>
              <a 
                [href]="contest.registrationUrl" 
                target="_blank"
                class="mt-3 inline-block text-white px-4 py-2 rounded-[12px] text-sm"
                style="background-color: #D4A373;">
                Register
              </a>
            </div>
          </div>

          <div class="flex justify-end">
            <button 
              (click)="showRPCContestsModal = false"
              class="px-4 py-2 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- USACO Link Result Modal -->
      <div 
        *ngIf="showUsacoLinkModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        (click)="showUsacoLinkModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-md" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">USACO IDE Link Created</h3>
          <p class="text-sm mb-4" style="color: #4A3B33;">
            Share this link with your team. The code template is already loaded.
          </p>
          <div class="rounded-[12px] p-3 mb-4 break-all" style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
            <a [href]="usacoLinkUrl" target="_blank" class="hover:underline" style="color: #8B5E3C;">
              {{ usacoLinkUrl }}
            </a>
          </div>
          <div class="flex gap-2 justify-end">
            <button 
              (click)="copyUsacoLink()"
              class="text-white px-4 py-2 rounded-[12px]"
              style="background-color: #8B5E3C;">
              Copy Link
            </button>
            <button 
              (click)="showUsacoLinkModal = false"
              class="px-4 py-2 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Add Session Modal -->
      <div 
        *ngIf="showAddSessionModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        (click)="showAddSessionModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-md" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">Add Code Session</h3>
          <input 
            type="text"
            [(ngModel)]="newSessionName"
            placeholder="Session name (e.g., Practice Session 1)"
            class="w-full rounded-[12px] px-4 py-3 mb-3"
            style="border: 1px solid #EAE3DB; color: #2D2622;">
          <div class="mb-3">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Choose an option:</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="radio" [(ngModel)]="sessionLinkOption" value="auto" class="mr-2">
                <span class="text-sm" style="color: #4A3B33;">Auto-generate link with template</span>
              </label>
              <label class="flex items-center">
                <input type="radio" [(ngModel)]="sessionLinkOption" value="manual" class="mr-2">
                <span class="text-sm" style="color: #4A3B33;">Provide custom link</span>
              </label>
            </div>
          </div>
          <div *ngIf="sessionLinkOption === 'auto'" class="mb-3">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Language:</label>
            <select 
              [(ngModel)]="selectedLanguage"
              class="w-full rounded-[12px] px-4 py-3 text-sm"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
          </div>
          <div *ngIf="sessionLinkOption === 'manual'" class="mb-3">
            <input 
              type="url"
              [(ngModel)]="customSessionLink"
              placeholder="https://ide.usaco.guide/..."
              class="w-full rounded-[12px] px-4 py-3"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
          </div>
          <div class="flex gap-2 justify-end">
            <button 
              (click)="showAddSessionModal = false"
              class="px-4 py-2 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancel
            </button>
            <button 
              (click)="addSession()"
              [disabled]="!newSessionName || addingSession || (sessionLinkOption === 'manual' && !customSessionLink)"
              class="text-white px-4 py-2 rounded-[12px] disabled:opacity-50"
              style="background-color: #8B5E3C;">
              {{ addingSession ? 'Adding...' : 'Add Session' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Rename Session Modal -->
      <div 
        *ngIf="showRenameSessionModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        (click)="showRenameSessionModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-md" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">Rename Session</h3>
          <input 
            type="text"
            [(ngModel)]="renameSessionName"
            placeholder="New session name"
            class="w-full rounded-[12px] px-4 py-3 mb-4"
            style="border: 1px solid #EAE3DB; color: #2D2622;">
          <div class="flex gap-2 justify-end">
            <button 
              (click)="showRenameSessionModal = false"
              class="px-4 py-2 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancel
            </button>
            <button 
              (click)="renameSession()"
              [disabled]="!renameSessionName"
              class="text-white px-4 py-2 rounded-[12px] disabled:opacity-50"
              style="background-color: #8B5E3C;">
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- View Templates Modal -->
      <div 
        *ngIf="showViewTemplatesModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="showViewTemplatesModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">Code Templates</h3>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Select Language:</label>
            <select 
              [(ngModel)]="viewTemplateLanguage"
              (ngModelChange)="loadTemplateForLanguage($event)"
              class="w-full rounded-[12px] px-4 py-3"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Template Code:</label>
            <textarea 
              [(ngModel)]="viewTemplateCode"
              rows="20"
              readonly
              class="w-full rounded-[12px] px-4 py-3 font-mono text-sm"
              style="border: 1px solid #EAE3DB; color: #2D2622; background-color: #FCF9F5;">
            </textarea>
          </div>
          <div *ngIf="isCoachOrAdmin()" class="mb-4">
            <button 
              (click)="openEditTemplateModal()"
              class="text-white px-4 py-2 rounded-[12px]"
              style="background-color: #8B5E3C;">
              Edit Template
            </button>
          </div>
          <div class="flex justify-end">
            <button 
              (click)="showViewTemplatesModal = false"
              class="px-4 py-2 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Add Excalidraw Session Modal -->
      <div 
        *ngIf="showAddExcalidrawSessionModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        (click)="showAddExcalidrawSessionModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-md" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">Add Excalidraw Session</h3>
          <input 
            type="text"
            [(ngModel)]="newExcalidrawSessionName"
            placeholder="Session name (e.g., Algorithm Design Board)"
            class="w-full rounded-[12px] px-4 py-3 mb-3"
            style="border: 1px solid #EAE3DB; color: #2D2622;">
          <div class="mb-3">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Link to Code Session (Optional):</label>
            <select 
              [(ngModel)]="linkedCodeSessionId"
              class="w-full rounded-[12px] px-4 py-3 text-sm"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
              <option [ngValue]="null">-- No Link --</option>
              <option *ngFor="let session of team?.codeSessions" [ngValue]="session._id">
                {{ session.name }}
              </option>
            </select>
          </div>
          <div class="flex gap-2 justify-end">
            <button 
              (click)="showAddExcalidrawSessionModal = false"
              class="px-4 py-2 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancel
            </button>
            <button 
              (click)="addExcalidrawSession()"
              [disabled]="!newExcalidrawSessionName || addingExcalidrawSession"
              class="text-white px-4 py-2 rounded-[12px] disabled:opacity-50"
              style="background-color: #8B5E3C;">
              {{ addingExcalidrawSession ? 'Adding...' : 'Add Session' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Excalidraw Session Modal -->
      <div 
        *ngIf="showEditExcalidrawSessionModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        (click)="showEditExcalidrawSessionModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-md" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">Edit Excalidraw Session</h3>
          <input 
            type="text"
            [(ngModel)]="editExcalidrawSessionName"
            placeholder="Session name"
            class="w-full rounded-[12px] px-4 py-3 mb-3"
            style="border: 1px solid #EAE3DB; color: #2D2622;">
          <div class="mb-3">
            <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Link to Code Session (Optional):</label>
            <select 
              [(ngModel)]="editLinkedCodeSessionId"
              class="w-full rounded-[12px] px-4 py-3 text-sm"
              style="border: 1px solid #EAE3DB; color: #2D2622;">
              <option [ngValue]="null">-- No Link --</option>
              <option *ngFor="let session of team?.codeSessions" [ngValue]="session._id">
                {{ session.name }}
              </option>
            </select>
          </div>
          <div class="flex gap-2 justify-end">
            <button 
              (click)="showEditExcalidrawSessionModal = false"
              class="px-4 py-2 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancel
            </button>
            <button 
              (click)="saveExcalidrawSession()"
              [disabled]="!editExcalidrawSessionName"
              class="text-white px-4 py-2 rounded-[12px] disabled:opacity-50"
              style="background-color: #8B5E3C;">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  `
})
export class TeamDetailComponent implements OnInit, OnDestroy {
  team: TeamConfig | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  teamId: string | null = null;
  currentUserId: string | null = null;

  // Modal states
  showEditWhatsAppModal = false;
  showEditDiscordModal = false;
  showEditTemplateModal = false;
  showCreateExcalidrawModal = false;
  showRPCContestsModal = false;
  showUsacoLinkModal = false;
  showAddSessionModal = false;
  showRenameSessionModal = false;
  showViewTemplatesModal = false;
  showAddExcalidrawSessionModal = false;
  showEditExcalidrawSessionModal = false;

  // Edit fields
  editedWhatsAppLink = '';
  editedDiscordLink = '';
  editedTemplate = '';
  newRoomName = '';
  newSessionName = '';
  customSessionLink = '';
  sessionLinkOption = 'auto';
  renameSessionName = '';
  renameSessionId = '';
  viewTemplateLanguage = 'cpp';
  viewTemplateCode = '';
  newExcalidrawSessionName = '';
  linkedCodeSessionId: string | null = null;
  editExcalidrawSessionName = '';
  editExcalidrawSessionId = '';
  editLinkedCodeSessionId: string | null = null;

  // Integration states
  creatingRoom = false;
  creatingUsacoLink = false;
  addingSession = false;
  addingExcalidrawSession = false;
  loadingRPCContests = false;
  rpcContestsError: string | null = null;
  rpcContests: any[] = [];
  usacoLinkUrl = '';
  selectedLanguage = 'cpp';
  
  // Timeout IDs for success message auto-hide
  private successMessageTimeoutId: number | null = null;

  constructor(
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router,
    private integrationsService: IntegrationsService
  ) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentUserId = user.id;
    }
  }

  ngOnInit(): void {
    this.teamId = this.route.snapshot.paramMap.get('id');
    if (this.teamId) {
      this.loadTeam(this.teamId);
    }
  }

  ngOnDestroy(): void {
    // Clear any pending success message timeout
    if (this.successMessageTimeoutId !== null) {
      clearTimeout(this.successMessageTimeoutId);
    }
  }

  private showSuccessMessage(message: string): void {
    // Clear any existing timeout
    if (this.successMessageTimeoutId !== null) {
      clearTimeout(this.successMessageTimeoutId);
    }
    
    this.successMessage = message;
    
    // Auto-hide after 5 seconds
    this.successMessageTimeoutId = window.setTimeout(() => {
      this.successMessage = null;
      this.successMessageTimeoutId = null;
    }, 5000);
  }

  loadTeam(id: string): void {
    this.loading = true;
    this.error = null;
    
    this.teamService.getTeam(id).subscribe({
      next: (response) => {
        this.team = response.data.team;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load team. Please try again later.';
        this.loading = false;
        console.error('Error loading team:', err);
      }
    });
  }

  isUserInTeam(): boolean {
    if (!this.team) return false;
    return TeamUtils.isUserInTeam(this.team, this.currentUserId);
  }

  joinTeam(): void {
    if (!this.teamId) return;
    
    this.teamService.joinTeam(this.teamId).subscribe({
      next: () => {
        this.loadTeam(this.teamId!);
      },
      error: (err) => {
        this.error = 'Failed to join team.';
        console.error('Error joining team:', err);
      }
    });
  }

  leaveTeam(): void {
    if (!this.teamId) return;
    
    if (!confirm('Are you sure you want to leave this team?')) {
      return;
    }

    this.teamService.leaveTeam(this.teamId).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = 'Failed to leave team.';
        console.error('Error leaving team:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  isCoachOrAdmin(): boolean {
    if (!this.team || !this.currentUserId) return false;
    return this.team.coach?._id === this.currentUserId;
  }

  isTeamMemberOrCoach(): boolean {
    if (!this.team || !this.currentUserId) return false;
    const isMember = this.team.members.some(m => 
      (typeof m.userId === 'object' ? m.userId._id : m.userId) === this.currentUserId
    );
    return isMember || this.team.coach?._id === this.currentUserId;
  }

  openEditWhatsAppModal(): void {
    this.editedWhatsAppLink = this.team?.links?.whatsappGroup || '';
    this.showEditWhatsAppModal = true;
  }

  openEditDiscordModal(): void {
    this.editedDiscordLink = this.team?.links?.discordServer || '';
    this.showEditDiscordModal = true;
  }

  openEditTemplateModal(): void {
    this.editedTemplate = this.team?.codeTemplate || '';
    this.showEditTemplateModal = true;
  }

  openRPCContestsModal(): void {
    this.showRPCContestsModal = true;
    this.loadRPCContests();
  }

  saveWhatsAppLink(): void {
    if (!this.teamId) return;
    
    this.teamService.updateTeamLinks(this.teamId, { 
      whatsappGroup: this.editedWhatsAppLink 
    }).subscribe({
      next: (response) => {
        this.team = response.data.team;
        this.showEditWhatsAppModal = false;
        this.editedWhatsAppLink = '';
      },
      error: (err) => {
        this.error = 'Failed to update WhatsApp link.';
        console.error('Error updating WhatsApp link:', err);
      }
    });
  }

  saveDiscordLink(): void {
    if (!this.teamId) return;
    
    this.teamService.updateTeamLinks(this.teamId, { 
      discordServer: this.editedDiscordLink 
    }).subscribe({
      next: (response) => {
        this.team = response.data.team;
        this.showEditDiscordModal = false;
        this.editedDiscordLink = '';
      },
      error: (err) => {
        this.error = 'Failed to update Discord link.';
        console.error('Error updating Discord link:', err);
      }
    });
  }

  saveTemplate(): void {
    if (!this.teamId) return;
    
    this.teamService.updateTeamTemplate(this.teamId, this.editedTemplate).subscribe({
      next: (response) => {
        this.team = response.data.team;
        this.showEditTemplateModal = false;
      },
      error: (err) => {
        this.error = 'Failed to update code template.';
        console.error('Error updating template:', err);
      }
    });
  }

  createExcalidrawRoom(): void {
    if (!this.newRoomName || !this.teamId) return;
    
    this.creatingRoom = true;
    this.integrationsService.createExcalidrawRoom(this.newRoomName, this.teamId).subscribe({
      next: () => {
        this.showCreateExcalidrawModal = false;
        this.newRoomName = '';
        this.creatingRoom = false;
        this.loadTeam(this.teamId!);
      },
      error: (err) => {
        this.error = 'Failed to create Excalidraw room.';
        this.creatingRoom = false;
        console.error('Error creating room:', err);
      }
    });
  }

  createUsacoLink(language: string = 'cpp'): void {
    if (!this.teamId) return;
    
    this.creatingUsacoLink = true;
    this.integrationsService.createUsacoPermalink(language, this.teamId).subscribe({
      next: (response) => {
        if (response.ok && response.url) {
          this.usacoLinkUrl = response.url;
          this.showUsacoLinkModal = true;
        } else {
          this.error = 'Failed to create USACO link: ' + (response.reason || 'Unknown error');
        }
        this.creatingUsacoLink = false;
      },
      error: (err) => {
        this.error = 'Failed to create USACO link.';
        this.creatingUsacoLink = false;
        console.error('Error creating USACO link:', err);
      }
    });
  }

  loadRPCContests(): void {
    this.loadingRPCContests = true;
    this.rpcContestsError = null;
    
    this.integrationsService.getRPCContests().subscribe({
      next: (response) => {
        this.rpcContests = response.contests || [];
        this.loadingRPCContests = false;
      },
      error: (err) => {
        this.rpcContestsError = 'Failed to load RPC contests.';
        this.loadingRPCContests = false;
        console.error('Error loading RPC contests:', err);
      }
    });
  }

  copyUsacoLink(): void {
    if (!this.usacoLinkUrl) return;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(this.usacoLinkUrl).then(() => {
        console.log('Link copied to clipboard');
        // Show success feedback
      }).catch(err => {
        console.error('Failed to copy link:', err);
        this.fallbackCopy();
      });
    } else {
      // Fallback for browsers without clipboard API
      this.fallbackCopy();
    }
  }

  private fallbackCopy(): void {
    // Create temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = this.usacoLinkUrl;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      console.log('Link copied using fallback method');
    } catch (err) {
      console.error('Fallback copy failed:', err);
      this.error = 'Failed to copy link. Please copy it manually.';
    } finally {
      document.body.removeChild(textarea);
    }
  }

  getActiveMembers(): TeamMember[] {
    if (!this.team) return [];
    return this.team.members.filter(m => m.isActive === true);
  }

  getInactiveMembers(): TeamMember[] {
    if (!this.team) return [];
    return this.team.members.filter(m => m.isActive === false);
  }

  toggleMemberActive(member: TeamMember, isActive: boolean): void {
    if (!this.teamId) return;
    
    const userId = typeof member.userId === 'object' ? member.userId._id : member.userId;
    
    this.teamService.toggleMemberActive(this.teamId, userId, isActive).subscribe({
      next: (response) => {
        this.team = response.data.team;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update member status.';
        console.error('Error updating member status:', err);
      }
    });
  }

  openAddSessionModal(): void {
    this.newSessionName = '';
    this.customSessionLink = '';
    this.sessionLinkOption = 'auto';
    this.selectedLanguage = 'cpp';
    this.showAddSessionModal = true;
  }

  addSession(): void {
    if (!this.teamId || !this.newSessionName) return;

    this.addingSession = true;
    this.error = null;
    this.successMessage = null;

    if (this.sessionLinkOption === 'auto') {
      // Auto-generate link
      this.integrationsService.createUsacoPermalink(this.selectedLanguage, this.teamId).subscribe({
        next: (response) => {
          if (response.ok && response.url) {
            // Add session with generated link
            this.teamService.addCodeSession(this.teamId!, this.newSessionName, response.url).subscribe({
              next: (teamResponse) => {
                this.team = teamResponse.data.team;
                this.showAddSessionModal = false;
                this.showSuccessMessage(`Code session "${this.newSessionName}" created successfully with auto-generated link!`);
                this.newSessionName = '';
                this.customSessionLink = '';
                this.addingSession = false;
              },
              error: (err) => {
                this.error = 'Failed to add code session.';
                this.addingSession = false;
                console.error('Error adding session:', err);
              }
            });
          } else {
            this.error = 'Failed to generate USACO link: ' + (response.reason || 'Unknown error');
            this.addingSession = false;
          }
        },
        error: (err) => {
          this.error = 'Failed to generate USACO link.';
          this.addingSession = false;
          console.error('Error generating link:', err);
        }
      });
    } else {
      // Use custom link
      if (!this.customSessionLink) {
        this.addingSession = false;
        return;
      }

      this.teamService.addCodeSession(this.teamId, this.newSessionName, this.customSessionLink).subscribe({
        next: (response) => {
          this.team = response.data.team;
          this.showAddSessionModal = false;
          this.showSuccessMessage(`Code session "${this.newSessionName}" created successfully!`);
          this.newSessionName = '';
          this.customSessionLink = '';
          this.addingSession = false;
        },
        error: (err) => {
          this.error = 'Failed to add code session.';
          this.addingSession = false;
          console.error('Error adding session:', err);
        }
      });
    }
  }

  openRenameSessionModal(session: any): void {
    this.renameSessionId = session._id;
    this.renameSessionName = session.name;
    this.showRenameSessionModal = true;
  }

  renameSession(): void {
    if (!this.teamId || !this.renameSessionId || !this.renameSessionName) return;

    this.teamService.updateCodeSession(this.teamId, this.renameSessionId, this.renameSessionName).subscribe({
      next: (response) => {
        this.team = response.data.team;
        this.showRenameSessionModal = false;
        this.showSuccessMessage(`Session renamed to "${this.renameSessionName}" successfully!`);
        this.renameSessionId = '';
        this.renameSessionName = '';
      },
      error: (err) => {
        this.error = 'Failed to rename session.';
        console.error('Error renaming session:', err);
      }
    });
  }

  deleteSession(sessionId: string): void {
    if (!this.teamId || !sessionId) return;

    if (!confirm('Are you sure you want to delete this code session?')) {
      return;
    }

    this.teamService.deleteCodeSession(this.teamId, sessionId).subscribe({
      next: (response) => {
        this.team = response.data.team;
        this.showSuccessMessage('Code session deleted successfully!');
      },
      error: (err) => {
        this.error = 'Failed to delete session.';
        console.error('Error deleting session:', err);
      }
    });
  }

  openViewTemplatesModal(): void {
    this.viewTemplateLanguage = 'cpp';
    this.loadTemplateForLanguage('cpp');
    this.showViewTemplatesModal = true;
  }

  loadTemplateForLanguage(language: string): void {
    if (!this.teamId) return;

    this.integrationsService.getCodeTemplate(language, this.teamId).subscribe({
      next: (response) => {
        this.viewTemplateCode = response.data.template || '';
      },
      error: (err) => {
        this.error = 'Failed to load template.';
        console.error('Error loading template:', err);
      }
    });
  }

  openExcalidraw(): void {
    // Open Excalidraw in a new tab with a unique room
    const roomId = this.generateRoomId();
    const roomKey = this.generateRoomKey();
    const excalidrawUrl = `https://excalidraw.com/#room=${roomId},${roomKey}`;
    window.open(excalidrawUrl, '_blank');
  }

  private generateRoomId(): string {
    // Generate a cryptographically secure random 20-character hex ID
    const array = new Uint8Array(10);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private generateRoomKey(): string {
    // Generate a cryptographically secure random 22-character key (base64url-like)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const array = new Uint8Array(22);
    crypto.getRandomValues(array);
    return Array.from(array, byte => chars.charAt(byte % chars.length)).join('');
  }

  openAddExcalidrawSessionModal(): void {
    this.newExcalidrawSessionName = '';
    this.linkedCodeSessionId = null;
    this.showAddExcalidrawSessionModal = true;
  }

  addExcalidrawSession(): void {
    if (!this.teamId || !this.newExcalidrawSessionName) return;

    this.addingExcalidrawSession = true;
    this.error = null;

    this.teamService.addExcalidrawSession(
      this.teamId, 
      this.newExcalidrawSessionName, 
      this.linkedCodeSessionId || undefined
    ).subscribe({
      next: (response) => {
        this.team = response.data.team;
        this.showAddExcalidrawSessionModal = false;
        this.showSuccessMessage(`Excalidraw session "${this.newExcalidrawSessionName}" created successfully!`);
        this.newExcalidrawSessionName = '';
        this.linkedCodeSessionId = null;
        this.addingExcalidrawSession = false;
      },
      error: (err) => {
        this.error = 'Failed to add Excalidraw session.';
        this.addingExcalidrawSession = false;
        console.error('Error adding Excalidraw session:', err);
      }
    });
  }

  openEditExcalidrawSessionModal(session: any): void {
    this.editExcalidrawSessionId = session._id;
    this.editExcalidrawSessionName = session.name;
    this.editLinkedCodeSessionId = session.linkedToCodeSessionId || null;
    this.showEditExcalidrawSessionModal = true;
  }

  saveExcalidrawSession(): void {
    if (!this.teamId || !this.editExcalidrawSessionId || !this.editExcalidrawSessionName) return;

    this.teamService.updateExcalidrawSession(
      this.teamId,
      this.editExcalidrawSessionId,
      this.editExcalidrawSessionName,
      this.editLinkedCodeSessionId
    ).subscribe({
      next: (response) => {
        this.team = response.data.team;
        this.showEditExcalidrawSessionModal = false;
        this.showSuccessMessage(`Excalidraw session updated successfully!`);
        this.editExcalidrawSessionId = '';
        this.editExcalidrawSessionName = '';
        this.editLinkedCodeSessionId = null;
      },
      error: (err) => {
        this.error = 'Failed to update Excalidraw session.';
        console.error('Error updating Excalidraw session:', err);
      }
    });
  }

  deleteExcalidrawSession(sessionId: string): void {
    if (!this.teamId || !sessionId) return;

    if (!confirm('Are you sure you want to delete this Excalidraw session?')) {
      return;
    }

    this.teamService.deleteExcalidrawSession(this.teamId, sessionId).subscribe({
      next: (response) => {
        this.team = response.data.team;
        this.showSuccessMessage('Excalidraw session deleted successfully!');
      },
      error: (err) => {
        this.error = 'Failed to delete Excalidraw session.';
        console.error('Error deleting Excalidraw session:', err);
      }
    });
  }

  getLinkedExcalidrawSessions(codeSession: any): any[] {
    if (!this.team || !this.team.excalidrawSessions || !codeSession.linkedExcalidrawSessions) {
      return [];
    }
    
    return this.team.excalidrawSessions.filter(excSession => 
      codeSession.linkedExcalidrawSessions.includes(excSession._id)
    );
  }

  getCodeSessionName(codeSessionId: string): string {
    if (!this.team || !this.team.codeSessions) {
      return 'Unknown';
    }
    
    const session = this.team.codeSessions.find(s => s._id === codeSessionId);
    return session ? session.name : 'Unknown';
  }
}
