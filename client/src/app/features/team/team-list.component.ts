import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TeamService, TeamConfig } from '../../core/services/team.service';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Teams</h1>
        <button 
          (click)="navigateToCreate()"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create New Team
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-600">Loading teams...</p>
      </div>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let team of teams" 
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="mb-4">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ team.name }}</h2>
            <p class="text-gray-600">{{ team.description || 'No description' }}</p>
          </div>

          <div class="mb-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Members:</span>
              <span class="font-semibold">{{ team.members.length }} / {{ team.maxMembers }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Problems Solved:</span>
              <span class="font-semibold">{{ team.statistics.totalProblemsSolved }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Contests:</span>
              <span class="font-semibold">{{ team.statistics.totalContests }}</span>
            </div>
          </div>

          <div class="flex gap-2 items-center mb-4">
            <span 
              *ngIf="team.settings.isPublic"
              class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Public
            </span>
            <span 
              *ngIf="!team.settings.isPublic"
              class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
              Private
            </span>
            <span 
              *ngIf="team.settings.allowJoinRequests"
              class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              Open to Join
            </span>
          </div>

          <div class="flex gap-2">
            <button 
              (click)="navigateToDetail(team._id)"
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
              View Details
            </button>
            <button 
              *ngIf="!isUserInTeam(team)"
              (click)="joinTeam(team._id)"
              class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm">
              Join Team
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && teams.length === 0" class="text-center py-12">
        <p class="text-gray-600 text-lg">No teams available yet.</p>
        <button 
          (click)="navigateToCreate()"
          class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create First Team
        </button>
      </div>
    </div>
  `
})
export class TeamListComponent implements OnInit {
  teams: TeamConfig[] = [];
  loading = false;
  error: string | null = null;
  currentUserId: string | null = null;

  constructor(
    private teamService: TeamService,
    private router: Router
  ) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentUserId = user.id;
    }
  }

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading = true;
    this.error = null;
    
    this.teamService.getTeams().subscribe({
      next: (response) => {
        this.teams = response.data.teams;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load teams. Please try again later.';
        this.loading = false;
        console.error('Error loading teams:', err);
      }
    });
  }

  isUserInTeam(team: TeamConfig): boolean {
    if (!this.currentUserId) return false;
    return team.members.some(member => 
      member.userId === this.currentUserId || member.userId._id === this.currentUserId
    );
  }

  joinTeam(teamId: string): void {
    this.teamService.joinTeam(teamId).subscribe({
      next: () => {
        this.loadTeams();
      },
      error: (err) => {
        this.error = 'Failed to join team.';
        console.error('Error joining team:', err);
      }
    });
  }

  navigateToDetail(teamId: string): void {
    this.router.navigate(['/team', teamId]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/team/create']);
  }
}
