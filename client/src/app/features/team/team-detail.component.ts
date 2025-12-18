import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamService, TeamConfig } from '../../core/services/team.service';
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
              Back to Teams
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
              Team Members ({{ team.members.length }} / {{ team.maxMembers }})
            </h2>
            <div class="space-y-2">
              <div 
                *ngFor="let member of team.members" 
                class="flex justify-between items-center bg-gray-50 rounded p-3">
                <div>
                  <p class="font-semibold text-gray-800">
                    {{ member.userId?.username || 'Member' }}
                  </p>
                  <p class="text-sm text-gray-600">
                    Joined {{ member.joinedAt | date:'mediumDate' }}
                  </p>
                </div>
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
              </div>
            </div>
          </div>

          <!-- Team Links Section -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-3">Team Links</h2>
            <div class="bg-gray-50 rounded p-4 space-y-3">
              <!-- WhatsApp Group -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">💬</span>
                  <span class="text-gray-700 font-medium">WhatsApp Group</span>
                </div>
                <div class="flex gap-2">
                  <a 
                    *ngIf="team.links?.whatsappGroup"
                    [href]="team.links.whatsappGroup" 
                    target="_blank"
                    class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm">
                    Open
                  </a>
                  <button 
                    *ngIf="isTeamLeader()"
                    (click)="openEditWhatsAppModal()"
                    class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
                    {{ team.links?.whatsappGroup ? 'Edit' : 'Add' }}
                  </button>
                </div>
              </div>

              <!-- Discord Server -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">💬</span>
                  <span class="text-gray-700 font-medium">Discord Server</span>
                </div>
                <div class="flex gap-2">
                  <a 
                    *ngIf="team.links?.discordServer"
                    [href]="team.links.discordServer" 
                    target="_blank"
                    class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm">
                    Open
                  </a>
                  <button 
                    *ngIf="isTeamLeader()"
                    (click)="openEditDiscordModal()"
                    class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
                    {{ team.links?.discordServer ? 'Edit' : 'Add' }}
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
                <button 
                  (click)="createUsacoLink()"
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
        this.router.navigate(['/team']);
      },
      error: (err) => {
        this.error = 'Failed to leave team.';
        console.error('Error leaving team:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/team']);
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

  createUsacoLink(): void {
    if (!this.teamId) return;
    
    this.creatingUsacoLink = true;
    this.integrationsService.createUsacoPermalink('cpp', this.teamId).subscribe({
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
    if (this.usacoLinkUrl) {
      navigator.clipboard.writeText(this.usacoLinkUrl).then(() => {
        // Could show a toast notification here
        console.log('Link copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy link:', err);
      });
    }
  }
}
