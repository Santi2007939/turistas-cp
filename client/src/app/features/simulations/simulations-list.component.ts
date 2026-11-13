import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { Simulation, SimulationsService } from '../../core/services/simulations.service';
import { BalloonComponent } from './balloon.component';

@Component({
  selector: 'app-simulations-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, BalloonComponent],
  template: `
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <app-navbar></app-navbar>

      <div class="container mx-auto px-4 sm:px-6 py-8">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl font-bold" style="color: #2D2622;">Simulations</h1>
            <p class="text-sm" style="color: #4A3B33;">ICPC-style team practice contests</p>
          </div>
          <a routerLink="/simulations/new"
             class="text-white px-4 py-2 rounded-[12px] font-medium"
             style="background-color: #8B5E3C;">
            New simulation
          </a>
        </div>

        <div *ngIf="loading" class="text-center py-8" style="color: #4A3B33;">Loading simulations...</div>

        <div *ngIf="error" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #EAE3DB; color: #2D2622;">
          {{ error }}
        </div>

        <div *ngIf="!loading && !error && simulations.length === 0"
             class="bg-white rounded-[12px] p-8 text-center" style="border: 1px solid #EAE3DB; color: #4A3B33;">
          No simulations yet. Create the first one.
        </div>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a *ngFor="let sim of simulations"
             [routerLink]="['/simulations', sim._id]"
             class="block bg-white rounded-[12px] p-5 transition hover:shadow-md"
             style="border: 1px solid #EAE3DB;">
            <div class="flex items-start justify-between gap-2 mb-2">
              <h2 class="font-semibold" style="color: #2D2622;">{{ sim.name }}</h2>
              <span class="text-xs px-2 py-1 rounded-full font-medium" [ngStyle]="statusStyle(sim.status)">
                {{ statusLabel(sim.status) }}
              </span>
            </div>
            <p class="text-sm mb-3" style="color: #4A3B33;">
              {{ sim.problems.length }} problems · {{ sim.durationMinutes }} min ·
              {{ solvedCount(sim) }}/{{ sim.problems.length }} solved
            </p>
            <div class="flex flex-wrap gap-1 mb-3">
              <app-balloon *ngFor="let p of sim.problems"
                           [color]="isSolved(sim, p.letter) ? p.color : '#E5DED6'"
                           [size]="16"></app-balloon>
            </div>
            <p class="text-xs" style="color: #8C7B70;">
              {{ memberNames(sim) }} · {{ sim.createdAt | date:'mediumDate' }}
            </p>
          </a>
        </div>
      </div>
    </div>
  `
})
export class SimulationsListComponent implements OnInit {
  simulations: Simulation[] = [];
  loading = true;
  error: string | null = null;

  constructor(private simulationsService: SimulationsService) {}

  ngOnInit(): void {
    this.simulationsService.getSimulations().subscribe({
      next: (res) => {
        this.simulations = res.data.simulations;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load simulations';
        this.loading = false;
      }
    });
  }

  isSolved(sim: Simulation, letter: string): boolean {
    return sim.submissions.some(s => s.problemLetter === letter && s.verdict === 'AC');
  }

  solvedCount(sim: Simulation): number {
    return sim.problems.filter(p => this.isSolved(sim, p.letter)).length;
  }

  memberNames(sim: Simulation): string {
    return sim.participants.map(p => p.username).join(', ');
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = { pending: 'Not started', running: 'Running', finished: 'Finished' };
    return labels[status] || status;
  }

  statusStyle(status: string): Record<string, string> {
    if (status === 'running') return { 'background-color': '#E3F2E1', color: '#2E7D32' };
    if (status === 'finished') return { 'background-color': '#EAE3DB', color: '#4A3B33' };
    return { 'background-color': '#FDF0E1', color: '#8B5E3C' };
  }
}
