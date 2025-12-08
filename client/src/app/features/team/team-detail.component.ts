import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TeamService, TeamConfig } from '../../core/services/team.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
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
    </div>
  `
})
export class TeamDetailComponent implements OnInit {
  team: TeamConfig | null = null;
  loading = false;
  error: string | null = null;
  teamId: string | null = null;
  currentUserId: string | null = null;

  constructor(
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router
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
    if (!this.team || !this.currentUserId) return false;
    return this.team.members.some(member => 
      member.userId === this.currentUserId || member.userId._id === this.currentUserId
    );
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
}
