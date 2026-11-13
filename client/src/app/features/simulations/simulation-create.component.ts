import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import {
  BALLOON_COLORS,
  SimulationMember,
  SimulationsService
} from '../../core/services/simulations.service';
import { BalloonComponent } from './balloon.component';

@Component({
  selector: 'app-simulation-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, BalloonComponent],
  template: `
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <app-navbar></app-navbar>

      <div class="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
        <a routerLink="/simulations" class="text-sm hover:underline" style="color: #8B5E3C;">← Back to simulations</a>
        <h1 class="text-2xl font-bold mt-2 mb-6" style="color: #2D2622;">New simulation</h1>

        <div *ngIf="error" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #E53935; color: #B71C1C;">
          {{ error }}
        </div>

        <form (ngSubmit)="create()" class="space-y-6">
          <!-- Name & duration -->
          <section class="bg-white rounded-[12px] p-5 space-y-4" style="border: 1px solid #EAE3DB;">
            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Name</label>
              <input [(ngModel)]="name" name="name" required maxlength="120"
                     placeholder="e.g. Simulation ICPC Regional 2025"
                     class="w-full rounded-[10px] px-3 py-2 outline-none" style="border: 1px solid #EAE3DB;" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Number of problems</label>
                <input type="number" [(ngModel)]="problemCount" name="problemCount" min="1" max="26"
                       (ngModelChange)="syncTitles()"
                       class="w-full rounded-[10px] px-3 py-2 outline-none" style="border: 1px solid #EAE3DB;" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Duration (minutes)</label>
                <input type="number" [(ngModel)]="durationMinutes" name="durationMinutes" min="1" max="1440"
                       class="w-full rounded-[10px] px-3 py-2 outline-none" style="border: 1px solid #EAE3DB;" />
              </div>
            </div>
          </section>

          <!-- Members -->
          <section class="bg-white rounded-[12px] p-5" style="border: 1px solid #EAE3DB;">
            <h2 class="font-semibold mb-1" style="color: #2D2622;">Members</h2>
            <p class="text-xs mb-3" style="color: #8C7B70;">Only the selected members can mark verdicts and edit this simulation.</p>
            <div *ngIf="loadingMembers" class="text-sm" style="color: #4A3B33;">Loading members...</div>
            <div class="grid sm:grid-cols-2 gap-2">
              <label *ngFor="let m of members"
                     class="flex items-center gap-3 rounded-[10px] px-3 py-2 cursor-pointer"
                     [ngStyle]="{ border: '1px solid ' + (selected.has(m._id) ? '#8B5E3C' : '#EAE3DB'),
                                  'background-color': selected.has(m._id) ? '#FDF6EE' : '#FFFFFF' }">
                <input type="checkbox" [checked]="selected.has(m._id)" (change)="toggleMember(m._id)" />
                <span style="color: #2D2622;">{{ m.username }}</span>
                <span *ngIf="m.fullName" class="text-xs truncate" style="color: #8C7B70;">{{ m.fullName }}</span>
              </label>
            </div>
          </section>

          <!-- Problems preview -->
          <section class="bg-white rounded-[12px] p-5" style="border: 1px solid #EAE3DB;">
            <h2 class="font-semibold mb-3" style="color: #2D2622;">Problems</h2>
            <div class="space-y-2">
              <div *ngFor="let letter of letters; let i = index" class="flex items-center gap-3">
                <app-balloon [color]="colors[i]" [letter]="letter" [size]="22"></app-balloon>
                <input [(ngModel)]="titles[i]" [name]="'title' + i" maxlength="120"
                       placeholder="Title (optional)"
                       class="flex-1 rounded-[10px] px-3 py-1.5 text-sm outline-none" style="border: 1px solid #EAE3DB;" />
              </div>
            </div>
          </section>

          <!-- Links -->
          <section class="bg-white rounded-[12px] p-5 space-y-4" style="border: 1px solid #EAE3DB;">
            <h2 class="font-semibold" style="color: #2D2622;">Links</h2>
            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">USACO IDE session</label>
              <input [(ngModel)]="usacoLink" name="usacoLink" type="url" placeholder="https://ide.usaco.guide/..."
                     class="w-full rounded-[10px] px-3 py-2 outline-none" style="border: 1px solid #EAE3DB;" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Excalidraw</label>
              <input [(ngModel)]="excalidrawLink" name="excalidrawLink" type="url" placeholder="https://excalidraw.com/#room=..."
                     class="w-full rounded-[10px] px-3 py-2 outline-none" style="border: 1px solid #EAE3DB;" />
            </div>
          </section>

          <div class="flex justify-end">
            <button type="submit" [disabled]="saving"
                    class="text-white px-5 py-2 rounded-[12px] font-medium disabled:opacity-60"
                    style="background-color: #8B5E3C;">
              {{ saving ? 'Creating...' : 'Create simulation' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SimulationCreateComponent implements OnInit {
  name = '';
  problemCount = 12;
  durationMinutes = 300;
  titles: string[] = [];
  usacoLink = '';
  excalidrawLink = '';

  members: SimulationMember[] = [];
  selected = new Set<string>();
  loadingMembers = true;
  saving = false;
  error: string | null = null;

  constructor(
    private simulationsService: SimulationsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.syncTitles();
    this.simulationsService.getMembers().subscribe({
      next: (res) => {
        this.members = res.data.members;
        const me = this.authService.currentUserValue?.id;
        if (me && this.members.some(m => m._id === me)) this.selected.add(me);
        this.loadingMembers = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load members';
        this.loadingMembers = false;
      }
    });
  }

  get count(): number {
    const n = Math.floor(Number(this.problemCount) || 0);
    return Math.max(0, Math.min(26, n));
  }

  get letters(): string[] {
    return Array.from({ length: this.count }, (_, i) => String.fromCharCode(65 + i));
  }

  get colors(): string[] {
    return BALLOON_COLORS;
  }

  syncTitles(): void {
    this.titles.length = this.count;
    for (let i = 0; i < this.count; i++) this.titles[i] = this.titles[i] ?? '';
  }

  toggleMember(id: string): void {
    if (this.selected.has(id)) this.selected.delete(id);
    else this.selected.add(id);
  }

  create(): void {
    this.error = null;
    if (!this.name.trim()) { this.error = 'Name is required'; return; }
    if (this.count < 1) { this.error = 'Number of problems must be between 1 and 26'; return; }
    if (this.selected.size === 0) { this.error = 'Select at least one member'; return; }

    this.saving = true;
    this.simulationsService.createSimulation({
      name: this.name.trim(),
      participants: [...this.selected],
      problemCount: this.count,
      problemTitles: this.titles.slice(0, this.count),
      durationMinutes: Number(this.durationMinutes) || 300,
      links: { usaco: this.usacoLink.trim(), excalidraw: this.excalidrawLink.trim() }
    }).subscribe({
      next: (res) => this.router.navigate(['/simulations', res.data.simulation._id]),
      error: (err) => {
        this.error = err.error?.message || 'Failed to create simulation';
        this.saving = false;
      }
    });
  }
}
