import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamService, TeamConfig } from '../../core/services/team.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <!-- Matte-Drift Team Create -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
        <div class="bg-white rounded-[12px] p-8 max-w-2xl mx-auto" style="border: 1px solid #EAE3DB;">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-semibold" style="color: #2D2622;">Create New Team</h1>
            <button 
              (click)="goBack()"
              class="px-4 py-2 rounded-[12px] font-medium"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Back
            </button>
          </div>

          <div *ngIf="error" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #EAE3DB; color: #2D2622;">
            {{ error }}
          </div>

          <form (ngSubmit)="createTeam()" #teamForm="ngForm">
            <!-- Team Name -->
            <div class="mb-4">
              <label for="name" class="block font-medium mb-2" style="color: #2D2622;">
                Team Name *
              </label>
              <input 
                type="text"
                id="name"
                name="name"
                [(ngModel)]="teamData.name"
                required
                class="w-full rounded-[12px] px-4 py-3 focus:outline-none"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="Enter team name">
            </div>

            <!-- Description -->
            <div class="mb-4">
              <label for="description" class="block font-medium mb-2" style="color: #2D2622;">
                Description
              </label>
              <textarea 
                id="description"
                name="description"
                [(ngModel)]="teamData.description"
                rows="3"
                class="w-full rounded-[12px] px-4 py-3 focus:outline-none"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="Describe your team...">
              </textarea>
            </div>

            <!-- Max Members -->
            <div class="mb-4">
              <label for="maxMembers" class="block font-medium mb-2" style="color: #2D2622;">
                Maximum Members *
              </label>
              <input 
                type="number"
                id="maxMembers"
                name="maxMembers"
                [(ngModel)]="teamData.maxMembers"
                required
                min="2"
                max="50"
                class="w-full rounded-[12px] px-4 py-3 focus:outline-none font-mono"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="e.g., 10">
            </div>

            <!-- Settings -->
            <div class="mb-6">
              <h2 class="text-xl font-semibold mb-3" style="color: #2D2622;">Team Settings</h2>
              
              <div class="space-y-3">
                <div class="flex items-center">
                  <input 
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    [(ngModel)]="teamData.settings.isPublic"
                    class="mr-2 rounded">
                  <label for="isPublic" style="color: #4A3B33;">
                    Public Team (visible to all users)
                  </label>
                </div>

                <div class="flex items-center">
                  <input 
                    type="checkbox"
                    id="allowJoinRequests"
                    name="allowJoinRequests"
                    [(ngModel)]="teamData.settings.allowJoinRequests"
                    class="mr-2 rounded">
                  <label for="allowJoinRequests" style="color: #4A3B33;">
                    Allow Join Requests
                  </label>
                </div>

                <div class="flex items-center">
                  <input 
                    type="checkbox"
                    id="sharedRoadmap"
                    name="sharedRoadmap"
                    [(ngModel)]="teamData.settings.sharedRoadmap"
                    class="mr-2 rounded">
                  <label for="sharedRoadmap" style="color: #4A3B33;">
                    Shared Roadmap (team members can view each other's progress)
                  </label>
                </div>

                <div class="flex items-center">
                  <input 
                    type="checkbox"
                    id="sharedCalendar"
                    name="sharedCalendar"
                    [(ngModel)]="teamData.settings.sharedCalendar"
                    class="mr-2 rounded">
                  <label for="sharedCalendar" style="color: #4A3B33;">
                    Shared Calendar (team events and contests)
                  </label>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-2">
              <button 
                type="button"
                (click)="goBack()"
                class="flex-1 px-4 py-3 rounded-[12px] font-medium"
                style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                Cancel
              </button>
              <button 
                type="submit"
                [disabled]="!teamForm.valid || creating"
                class="flex-1 text-white px-4 py-3 rounded-[12px] font-medium disabled:opacity-50"
                style="background-color: #8B5E3C;">
                {{ creating ? 'Creating...' : 'Create Team' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TeamCreateComponent {
  creating = false;
  error: string | null = null;

  teamData = {
    name: '',
    description: '',
    maxMembers: 10,
    settings: {
      isPublic: true,
      allowJoinRequests: true,
      sharedRoadmap: true,
      sharedCalendar: true
    }
  };

  constructor(
    private teamService: TeamService,
    private router: Router
  ) {}

  createTeam(): void {
    if (!this.teamData.name) {
      this.error = 'Team name is required.';
      return;
    }

    this.creating = true;
    this.error = null;

    this.teamService.createTeam(this.teamData).subscribe({
      next: (response) => {
        // Navigate to the new team's detail page
        if (response?.data?.team?._id) {
          this.router.navigate(['/team', response.data.team._id]);
        } else {
          // If no ID is returned, navigate to team list
          this.router.navigate(['/team']);
        }
      },
      error: (err) => {
        this.error = 'Failed to create team. Please try again.';
        this.creating = false;
        console.error('Error creating team:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/team']);
  }
}
