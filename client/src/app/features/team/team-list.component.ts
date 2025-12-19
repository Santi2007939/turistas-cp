import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TeamService, TeamConfig } from '../../core/services/team.service';
import { environment } from '../../../environments/environment';

/**
 * TeamListComponent now redirects directly to Team Turistas detail page
 * This component ensures there's only one team - Team Turistas
 */
@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="text-center">
        <div *ngIf="loading">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading {{ teamName }}...</p>
        </div>
        
        <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p class="font-semibold mb-2">Error</p>
          <p>{{ error }}</p>
          <button 
            (click)="retry()"
            class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Retry
          </button>
        </div>
      </div>
    </div>
  `
})
export class TeamListComponent implements OnInit {
  loading = true;
  error: string | null = null;
  teamName = environment.teamName;

  constructor(
    private teamService: TeamService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.redirectToTeamTuristas();
  }

  redirectToTeamTuristas(): void {
    this.loading = true;
    this.error = null;
    
    // Get all teams and find Team Turistas
    this.teamService.getTeams().subscribe({
      next: (response) => {
        const teams = response.data.teams;
        
        // Find Team Turistas by name from environment config
        const teamTuristas = teams.find(team => 
          team.name === this.teamName
        );
        
        if (teamTuristas) {
          // Redirect to Team Turistas detail page
          this.router.navigate(['/team', teamTuristas._id]);
        } else {
          // Team Turistas not found
          this.error = `${this.teamName} not found. Please contact an administrator to initialize the team.`;
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to load team information. Please try again later.';
        this.loading = false;
        console.error('Error loading teams:', err);
      }
    });
  }

  retry(): void {
    this.redirectToTeamTuristas();
  }
}
