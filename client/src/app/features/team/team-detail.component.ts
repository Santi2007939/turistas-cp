import { Component, OnInit } from '@angular/core';
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
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-4 py-8">
      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-600">Loading team...</p>
      </div>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <div *ngIf="team && !loading">
        <div class="bg-white rounded-lg shadow-md p-8 mb-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ team.name }}</h1>
              <p class="text-gray-600">{{ team.description || 'No description' }}</p>
            </div>
            <button 
              (click)="goBack()"
              class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Back to Dashboard
            </button>
          </div>

          <div class="flex gap-2 mb-6">
            <span 
              *ngIf="team.settings.isPublic"
              class="bg-green-100 text-green-800 px-3 py-1 rounded">
              Public Team
            </span>
            <span 
              *ngIf="!team.settings.isPublic"
              class="bg-gray-100 text-gray-800 px-3 py-1 rounded">
              Private Team
            </span>
            <span 
              *ngIf="team.settings.allowJoinRequests"
              class="bg-blue-100 text-blue-800 px-3 py-1 rounded">
              Open to Join Requests
            </span>
          </div>

          <!-- Team Statistics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-50 rounded p-4">
              <p class="text-gray-600 text-sm mb-1">Total Problems Solved</p>
              <p class="text-2xl font-bold text-gray-800">{{ team.statistics.totalProblemsSolved }}</p>
            </div>
            <div class="bg-gray-50 rounded p-4">
              <p class="text-gray-600 text-sm mb-1">Total Contests</p>
              <p class="text-2xl font-bold text-gray-800">{{ team.statistics.totalContests }}</p>
            </div>
            <div class="bg-gray-50 rounded p-4">
              <p class="text-gray-600 text-sm mb-1">Average Rating</p>
              <p class="text-2xl font-bold text-gray-800">{{ team.statistics.averageRating || 'N/A' }}</p>
            </div>
          </div>

          <!-- Team Members -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-3">
              Active Members ({{ getActiveMembers().length }} / 3)
            </h2>
            <div class="space-y-2 mb-4">
              <div 
                *ngFor="let member of getActiveMembers()" 
                class="flex justify-between items-center bg-green-50 border border-green-200 rounded p-3">
                <div>
                  <p class="font-semibold text-gray-800">
                    {{ member.userId?.username || 'Member' }}
                  </p>
                  <p class="text-sm text-gray-600">
                    Joined {{ member.joinedAt | date:'mediumDate' }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span 
                    *ngIf="member.role === 'leader'"
                    class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm">
                    Leader
                  </span>
                  <span 
                    *ngIf="member.role === 'member'"
                    class="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                    Member
                  </span>
                  <button
                    *ngIf="isTeamLeader() && member.role !== 'leader'"
                    (click)="toggleMemberActive(member, false)"
                    class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm">
                    Set Inactive
                  </button>
                </div>
              </div>
              <div *ngIf="getActiveMembers().length === 0" class="text-center py-4 text-gray-500">
                No active members yet
              </div>
            </div>

            <h2 class="text-xl font-semibold text-gray-800 mb-3 mt-6">
              Inactive Members ({{ getInactiveMembers().length }})
            </h2>
            <div class="space-y-2">
              <div 
                *ngFor="let member of getInactiveMembers()" 
                class="flex justify-between items-center bg-gray-100 border border-gray-300 rounded p-3">
                <div>
                  <p class="font-semibold text-gray-800">
                    {{ member.userId?.username || 'Member' }}
                  </p>
                  <p class="text-sm text-gray-600">
                    Joined {{ member.joinedAt | date:'mediumDate' }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm">
                    Inactive
                  </span>
                  <button
                    *ngIf="isTeamLeader() && getActiveMembers().length < 3"
                    (click)="toggleMemberActive(member, true)"
                    class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                    Set Active
                  </button>
                </div>
              </div>
              <div *ngIf="getInactiveMembers().length === 0" class="text-center py-4 text-gray-500">
                No inactive members
              </div>
            </div>
          </div>

          <!-- Team Links Section -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-3">Team Links</h2>
            <div class="bg-gray-50 rounded p-4 space-y-3">
              <!-- WhatsApp Group -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <!-- WhatsApp Logo SVG -->
                  <svg class="w-8 h-8" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 0C10.745 0 0 10.745 0 24c0 4.197 1.083 8.14 2.978 11.566L0 48l12.722-3.338A23.852 23.852 0 0024 48c13.255 0 24-10.745 24-24S37.255 0 24 0z" fill="#25D366"/>
                    <path d="M35.372 33.243c-.556 1.563-2.746 2.868-4.507 3.243-1.199.251-2.769.453-8.05-1.729-6.778-2.801-11.143-9.685-11.488-10.129-.333-.444-2.769-3.685-2.769-7.028 0-3.343 1.755-4.989 2.378-5.667.622-.677 1.356-.846 1.81-.846.453 0 .906.004 1.302.024.418.02.979-.159 1.531 1.167.555 1.333 1.898 4.63 2.064 4.967.166.337.277.73.055 1.174-.221.444-.332.722-.666 1.112-.333.389-.7.87-1 1.167-.333.332-.678.69-.29 1.356.389.666 1.731 2.858 3.718 4.632 2.555 2.28 4.707 2.986 5.373 3.323.666.337 1.055.277 1.444-.166.388-.444 1.676-1.952 2.122-2.619.444-.666.89-.555 1.499-.332.611.222 3.883 1.833 4.55 2.167.666.333 1.11.5 1.276.777.166.277.166 1.611-.388 3.174z" fill="#fff"/>
                  </svg>
                  <span class="text-gray-700 font-medium">WhatsApp Group</span>
                </div>
                <div class="flex gap-2">
                  <a 
                    *ngIf="team.links?.whatsappGroup"
                    [href]="team.links?.whatsappGroup || ''" 
                    target="_blank"
                    class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    Join Group
                  </a>
                  <button 
                    *ngIf="isTeamLeader()"
                    (click)="openEditWhatsAppModal()"
                    class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
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
                  <span class="text-gray-700 font-medium">Discord Server</span>
                </div>
                <div class="flex gap-2">
                  <a 
                    *ngIf="team.links?.discordServer"
                    [href]="team.links?.discordServer || ''" 
                    target="_blank"
                    class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    Join Server
                  </a>
                  <button 
                    *ngIf="isTeamLeader()"
                    (click)="openEditDiscordModal()"
                    class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
                    {{ team.links?.discordServer ? 'Edit Link' : 'Add Link' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Service Integrations Section -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-3">Service Integrations</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- USACO IDE -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">💻</span>
                  <h3 class="font-semibold text-gray-800">USACO IDE</h3>
                </div>
                <p class="text-sm text-gray-600 mb-3">Create shareable IDE links with your team's code template</p>
                <select 
                  [(ngModel)]="selectedLanguage"
                  class="w-full border rounded px-3 py-2 mb-2 text-sm">
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                </select>
                <button 
                  (click)="createUsacoLink(selectedLanguage)"
                  [disabled]="creatingUsacoLink"
                  class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:bg-gray-300">
                  {{ creatingUsacoLink ? 'Creating...' : 'Create IDE Link' }}
                </button>
                <button 
                  *ngIf="isTeamLeader()"
                  (click)="openEditTemplateModal()"
                  class="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
                  Edit Code Template
                </button>
              </div>

              <!-- Excalidraw -->
              <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">✏️</span>
                  <h3 class="font-semibold text-gray-800">Excalidraw</h3>
                </div>
                <p class="text-sm text-gray-600 mb-3">Collaborate on diagrams and visualizations</p>
                <button 
                  (click)="showCreateExcalidrawModal = true"
                  class="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm">
                  Create Room
                </button>
              </div>

              <!-- RPC Contests -->
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">🏆</span>
                  <h3 class="font-semibold text-gray-800">RPC Contests</h3>
                </div>
                <p class="text-sm text-gray-600 mb-3">View schedule and register for contests</p>
                <button 
                  (click)="openRPCContestsModal()"
                  class="w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded text-sm">
                  View Contests
                </button>
              </div>
            </div>
          </div>

          <!-- Excalidraw Rooms -->
          <div *ngIf="team.excalidrawRooms && team.excalidrawRooms.length > 0" class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-3">Collaboration Rooms</h2>
            <div class="space-y-2">
              <div 
                *ngFor="let room of team.excalidrawRooms" 
                class="flex justify-between items-center bg-gray-50 rounded p-3">
                <div>
                  <p class="font-semibold text-gray-800">{{ room.name }}</p>
                  <p class="text-sm text-gray-600">Created {{ room.createdAt | date:'mediumDate' }}</p>
                </div>
                <a 
                  [href]="room.url" 
                  target="_blank"
                  class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm">
                  Open Room
                </a>
              </div>
            </div>
          </div>

          <!-- Team Settings -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-3">Team Settings</h2>
            <div class="bg-gray-50 rounded p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-700">Shared Roadmap:</span>
                <span class="font-semibold">{{ team.settings.sharedRoadmap ? 'Yes' : 'No' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">Shared Calendar:</span>
                <span class="font-semibold">{{ team.settings.sharedCalendar ? 'Yes' : 'No' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">Max Members:</span>
                <span class="font-semibold">{{ team.maxMembers }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button 
              *ngIf="!isUserInTeam()"
              (click)="joinTeam()"
              class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded">
              Join Team
            </button>
            <button 
              *ngIf="isUserInTeam()"
              (click)="leaveTeam()"
              class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded">
              Leave Team
            </button>
          </div>
        </div>
      </div>

      <!-- WhatsApp Edit Modal -->
      <div 
        *ngIf="showEditWhatsAppModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        (click)="showEditWhatsAppModal = false">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-bold mb-4">Edit WhatsApp Group Link</h3>
          <input 
            type="url"
            [(ngModel)]="editedWhatsAppLink"
            placeholder="https://chat.whatsapp.com/..."
            class="w-full border rounded px-3 py-2 mb-4">
          <div class="flex gap-2 justify-end">
            <button 
              (click)="showEditWhatsAppModal = false"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Cancel
            </button>
            <button 
              (click)="saveWhatsAppLink()"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- Discord Edit Modal -->
      <div 
        *ngIf="showEditDiscordModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        (click)="showEditDiscordModal = false">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-bold mb-4">Edit Discord Server Link</h3>
          <input 
            type="url"
            [(ngModel)]="editedDiscordLink"
            placeholder="https://discord.gg/..."
            class="w-full border rounded px-3 py-2 mb-4">
          <div class="flex gap-2 justify-end">
            <button 
              (click)="showEditDiscordModal = false"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Cancel
            </button>
            <button 
              (click)="saveDiscordLink()"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- Code Template Edit Modal -->
      <div 
        *ngIf="showEditTemplateModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="showEditTemplateModal = false">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-bold mb-4">Edit Code Template</h3>
          <p class="text-sm text-gray-600 mb-4">
            This template will be used when creating USACO IDE links for your team.
          </p>
          <textarea 
            [(ngModel)]="editedTemplate"
            rows="20"
            placeholder="// Your code template here..."
            class="w-full border rounded px-3 py-2 mb-4 font-mono text-sm">
          </textarea>
          <div class="flex gap-2 justify-end">
            <button 
              (click)="showEditTemplateModal = false"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Cancel
            </button>
            <button 
              (click)="saveTemplate()"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Save Template
            </button>
          </div>
        </div>
      </div>

      <!-- Create Excalidraw Room Modal -->
      <div 
        *ngIf="showCreateExcalidrawModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        (click)="showCreateExcalidrawModal = false">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-bold mb-4">Create Excalidraw Room</h3>
          <input 
            type="text"
            [(ngModel)]="newRoomName"
            placeholder="Room name..."
            class="w-full border rounded px-3 py-2 mb-4">
          <div class="flex gap-2 justify-end">
            <button 
              (click)="showCreateExcalidrawModal = false"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Cancel
            </button>
            <button 
              (click)="createExcalidrawRoom()"
              [disabled]="!newRoomName || creatingRoom"
              class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:bg-gray-300">
              {{ creatingRoom ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </div>
      </div>

      <!-- RPC Contests Modal -->
      <div 
        *ngIf="showRPCContestsModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="showRPCContestsModal = false">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-bold mb-4">RPC Contest Schedule</h3>
          
          <div *ngIf="loadingRPCContests" class="text-center py-8">
            <p class="text-gray-600">Loading contests...</p>
          </div>

          <div *ngIf="rpcContestsError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ rpcContestsError }}
          </div>

          <div *ngIf="!loadingRPCContests && rpcContests.length === 0" class="text-center py-8 text-gray-600">
            No upcoming contests found.
          </div>

          <div *ngIf="!loadingRPCContests && rpcContests.length > 0" class="space-y-3 mb-4">
            <div *ngFor="let contest of rpcContests" class="border rounded-lg p-4 hover:bg-gray-50">
              <h4 class="font-semibold text-gray-800 mb-2">{{ contest.name || 'Contest' }}</h4>
              <div class="text-sm text-gray-600 space-y-1">
                <p><strong>Start:</strong> {{ contest.startTime }}</p>
                <p><strong>Duration:</strong> {{ contest.duration }}</p>
              </div>
              <a 
                [href]="contest.registrationUrl" 
                target="_blank"
                class="mt-3 inline-block bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded text-sm">
                Register
              </a>
            </div>
          </div>

          <div class="flex justify-end">
            <button 
              (click)="showRPCContestsModal = false"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- USACO Link Result Modal -->
      <div 
        *ngIf="showUsacoLinkModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        (click)="showUsacoLinkModal = false">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-bold mb-4">USACO IDE Link Created</h3>
          <p class="text-sm text-gray-600 mb-4">
            Share this link with your team. The code template is already loaded.
          </p>
          <div class="bg-gray-50 border rounded p-3 mb-4 break-all">
            <a [href]="usacoLinkUrl" target="_blank" class="text-blue-600 hover:underline">
              {{ usacoLinkUrl }}
            </a>
          </div>
          <div class="flex gap-2 justify-end">
            <button 
              (click)="copyUsacoLink()"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Copy Link
            </button>
            <button 
              (click)="showUsacoLinkModal = false"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  `
})
export class TeamDetailComponent implements OnInit {
  team: TeamConfig | null = null;
  loading = false;
  error: string | null = null;
  teamId: string | null = null;
  currentUserId: string | null = null;

  // Modal states
  showEditWhatsAppModal = false;
  showEditDiscordModal = false;
  showEditTemplateModal = false;
  showCreateExcalidrawModal = false;
  showRPCContestsModal = false;
  showUsacoLinkModal = false;

  // Edit fields
  editedWhatsAppLink = '';
  editedDiscordLink = '';
  editedTemplate = '';
  newRoomName = '';

  // Integration states
  creatingRoom = false;
  creatingUsacoLink = false;
  loadingRPCContests = false;
  rpcContestsError: string | null = null;
  rpcContests: any[] = [];
  usacoLinkUrl = '';
  selectedLanguage = 'cpp';

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

  isTeamLeader(): boolean {
    if (!this.team || !this.currentUserId) return false;
    const member = this.team.members.find(m => 
      (typeof m.userId === 'object' ? m.userId._id : m.userId) === this.currentUserId
    );
    return member?.role === 'leader' || this.team.coach?._id === this.currentUserId;
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
}
