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
    <!-- Matte-Drift Team List -->
    <div class="min-h-screen flex items-center justify-center" style="background-color: #FCF9F5;">
      <div class="text-center">
        <div *ngIf="loading">
          <div class="animate-spin rounded-full h-12 w-12 mx-auto mb-4" style="border: 3px solid #EAE3DB; border-top-color: #8B5E3C;"></div>
          <p style="color: #4A3B33;">Loading {{ teamName }}...</p>
        </div>
        
        <div *ngIf="error" class="bg-white rounded-[12px] px-6 py-4" style="border: 1px solid #EAE3DB;">
          <p class="font-semibold mb-2" style="color: #2D2622;">Error</p>
          <p style="color: #4A3B33;">{{ error }}</p>
          <button 
            (click)="retry()"
            class="mt-4 text-white px-4 py-2 rounded-[12px] font-medium"
            style="background-color: #8B5E3C;">
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
