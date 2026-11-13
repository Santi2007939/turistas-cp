import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import {
  PENALTY_PER_WRONG,
  Simulation,
  SimulationProblem,
  SimulationResponse,
  SimulationSubmission,
  SimulationsService,
  Verdict
} from '../../core/services/simulations.service';
import { BalloonComponent } from './balloon.component';

interface ProblemRow {
  problem: SimulationProblem;
  attempts: number;
  solved: boolean;
  acMinute: number | null;
  acElapsed: string | null;
  penalty: number;
  lastVerdict: Verdict | null;
}

interface FlyingBalloon {
  id: number;
  color: string;
  letter: string;
  left: number;
}

const POLL_INTERVAL_MS = 10000;

@Component({
  selector: 'app-simulation-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, BalloonComponent],
  styles: [`
    @keyframes balloon-rise {
      0%   { transform: translateY(0) scale(0.6); opacity: 0; }
      10%  { opacity: 1; transform: translateY(-5vh) scale(1); }
      50%  { transform: translateY(-50vh) translateX(20px) rotate(4deg); }
      100% { transform: translateY(-110vh) translateX(-10px) rotate(-4deg); opacity: 0.9; }
    }
    .flying-balloon {
      position: fixed;
      bottom: -120px;
      z-index: 60;
      pointer-events: none;
      animation: balloon-rise 3.5s ease-in forwards;
    }
    @keyframes ac-pop {
      0% { transform: scale(0.3); }
      70% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
    .ac-pop { animation: ac-pop 0.45s ease-out; }
    .verdict-btn { min-width: 3.25rem; }
  `],
  template: `
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <app-navbar></app-navbar>

      <!-- Flying balloons on AC -->
      <div *ngFor="let b of flying; trackBy: trackFlying" class="flying-balloon" [style.left.%]="b.left">
        <app-balloon [color]="b.color" [letter]="b.letter" [size]="72"></app-balloon>
      </div>

      <div class="container mx-auto px-4 sm:px-6 py-8">
        <a routerLink="/simulations" class="text-sm hover:underline" style="color: #8B5E3C;">← Back to simulations</a>

        <div *ngIf="loading" class="text-center py-8" style="color: #4A3B33;">Loading simulation...</div>

        <div *ngIf="error" class="bg-white rounded-[12px] px-4 py-3 my-4" style="border: 1px solid #E53935; color: #B71C1C;">
          {{ error }}
        </div>

        <ng-container *ngIf="sim">
          <!-- Header -->
          <div class="flex flex-wrap items-start justify-between gap-4 mt-2 mb-6">
            <div>
              <h1 class="text-2xl font-bold" style="color: #2D2622;">{{ sim.name }}</h1>
              <p class="text-sm" style="color: #4A3B33;">
                {{ memberNames }} · {{ sim.problems.length }} problems · {{ sim.durationMinutes }} min
              </p>
              <p *ngIf="!canEdit" class="text-xs mt-1" style="color: #8C7B70;">
                View only: you are not one of the selected members.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <!-- Clock -->
              <div class="bg-white rounded-[12px] px-4 py-2 text-center" style="border: 1px solid #EAE3DB;">
                <div class="text-xs uppercase tracking-wide" style="color: #8C7B70;">{{ clockLabel }}</div>
                <div class="text-2xl font-mono font-bold" [style.color]="remainingMs < 15 * 60000 && sim.status === 'running' ? '#C62828' : '#2D2622'">
                  {{ clockText }}
                </div>
              </div>
              <!-- Totals -->
              <div class="bg-white rounded-[12px] px-4 py-2 text-center" style="border: 1px solid #EAE3DB;">
                <div class="text-xs uppercase tracking-wide" style="color: #8C7B70;">Solved / Penalty</div>
                <div class="text-2xl font-bold" style="color: #2D2622;">{{ solvedCount }} <span class="text-base font-normal" style="color: #8C7B70;">/ {{ totalPenalty }}</span></div>
              </div>

              <button *ngIf="canEdit && sim.status === 'pending'" (click)="start()" [disabled]="busy"
                      class="text-white px-4 py-2 rounded-[12px] font-medium disabled:opacity-60" style="background-color: #2E7D32;">
                Start
              </button>
              <button *ngIf="canEdit && sim.status === 'running'" (click)="finish()" [disabled]="busy"
                      class="px-4 py-2 rounded-[12px] font-medium disabled:opacity-60" style="border: 1px solid #C62828; color: #C62828;">
                Finish
              </button>
              <button *ngIf="canDelete" (click)="remove()" [disabled]="busy"
                      class="px-3 py-2 rounded-[12px] text-sm disabled:opacity-60" style="color: #8C7B70;">
                Delete
              </button>
            </div>
          </div>

          <div class="grid gap-6 lg:grid-cols-3">
            <!-- Scoreboard -->
            <div class="lg:col-span-2 bg-white rounded-[12px] overflow-x-auto" style="border: 1px solid #EAE3DB;">
              <table class="w-full text-sm">
                <thead>
                  <tr style="background-color: #F6F0E9; color: #4A3B33;">
                    <th class="text-left px-4 py-3 font-semibold">Problem</th>
                    <th class="text-center px-2 py-3 font-semibold">Tries</th>
                    <th class="text-center px-2 py-3 font-semibold">AC time</th>
                    <th class="text-right px-4 py-3 font-semibold">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let row of rows; trackBy: trackRow"
                      [style.background-color]="row.solved ? row.problem.color + '1A' : null"
                      style="border-top: 1px solid #EAE3DB;">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <span [class.ac-pop]="row.solved">
                          <app-balloon [color]="row.solved ? row.problem.color : '#E5DED6'"
                                       [letter]="row.problem.letter" [size]="26"></app-balloon>
                        </span>
                        <div>
                          <div class="font-semibold" style="color: #2D2622;">{{ row.problem.letter }}</div>
                          <div *ngIf="row.problem.title" class="text-xs" style="color: #8C7B70;">{{ row.problem.title }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="text-center px-2 py-3" style="color: #2D2622;">
                      {{ row.attempts || '–' }}
                      <div *ngIf="row.lastVerdict && !row.solved" class="text-xs font-semibold" [style.color]="verdictColor(row.lastVerdict)">
                        {{ row.lastVerdict }}
                      </div>
                    </td>
                    <td class="text-center px-2 py-3 font-mono" style="color: #2D2622;">
                      <ng-container *ngIf="row.solved; else noAc">
                        <div class="font-semibold">{{ row.acMinute }}'</div>
                        <div class="text-xs" style="color: #8C7B70;">{{ row.acElapsed }}</div>
                      </ng-container>
                      <ng-template #noAc>–</ng-template>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap justify-end gap-1">
                        <ng-container *ngIf="!row.solved; else solvedTag">
                          <button *ngFor="let v of verdicts"
                                  (click)="submit(row.problem, v)"
                                  [disabled]="!canSubmit || busy"
                                  class="verdict-btn px-2 py-1 rounded-[8px] text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                                  [style.background-color]="verdictColor(v)"
                                  [title]="verdictName(v)">
                            {{ v }}
                          </button>
                        </ng-container>
                        <ng-template #solvedTag>
                          <span class="px-3 py-1 rounded-[8px] text-xs font-bold text-white" style="background-color: #2E7D32;">Accepted</span>
                        </ng-template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p *ngIf="sim.status === 'pending'" class="text-xs px-4 py-3" style="color: #8C7B70; border-top: 1px solid #EAE3DB;">
                Press Start to begin the clock. Verdicts can be marked while the simulation is running.
              </p>
            </div>

            <div class="space-y-6">
              <!-- Links -->
              <div class="bg-white rounded-[12px] p-5" style="border: 1px solid #EAE3DB;">
                <div class="flex items-center justify-between mb-3">
                  <h2 class="font-semibold" style="color: #2D2622;">Resources</h2>
                  <button *ngIf="canEdit && !editingLinks" (click)="startEditLinks()" class="text-xs hover:underline" style="color: #8B5E3C;">Edit</button>
                </div>

                <ng-container *ngIf="!editingLinks; else linksForm">
                  <div class="space-y-2">
                    <a *ngIf="sim.links.usaco" [href]="sim.links.usaco" target="_blank" rel="noopener noreferrer"
                       class="flex items-center justify-between rounded-[10px] px-3 py-2 hover:shadow-sm" style="border: 1px solid #EAE3DB; color: #2D2622;">
                      <span>USACO IDE session</span><span style="color: #8B5E3C;">↗</span>
                    </a>
                    <a *ngIf="sim.links.excalidraw" [href]="sim.links.excalidraw" target="_blank" rel="noopener noreferrer"
                       class="flex items-center justify-between rounded-[10px] px-3 py-2 hover:shadow-sm" style="border: 1px solid #EAE3DB; color: #2D2622;">
                      <span>Excalidraw</span><span style="color: #8B5E3C;">↗</span>
                    </a>
                    <p *ngIf="!sim.links.usaco && !sim.links.excalidraw" class="text-sm" style="color: #8C7B70;">No links yet.</p>
                  </div>
                </ng-container>

                <ng-template #linksForm>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-xs font-medium mb-1" style="color: #4A3B33;">USACO IDE session</label>
                      <input [(ngModel)]="usacoDraft" type="url" placeholder="https://ide.usaco.guide/..."
                             class="w-full rounded-[10px] px-3 py-1.5 text-sm outline-none" style="border: 1px solid #EAE3DB;" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium mb-1" style="color: #4A3B33;">Excalidraw</label>
                      <input [(ngModel)]="excalidrawDraft" type="url" placeholder="https://excalidraw.com/#room=..."
                             class="w-full rounded-[10px] px-3 py-1.5 text-sm outline-none" style="border: 1px solid #EAE3DB;" />
                    </div>
                    <div class="flex justify-end gap-2">
                      <button (click)="editingLinks = false" class="text-sm px-3 py-1.5" style="color: #4A3B33;">Cancel</button>
                      <button (click)="saveLinks()" [disabled]="busy"
                              class="text-sm text-white px-3 py-1.5 rounded-[10px] disabled:opacity-60" style="background-color: #8B5E3C;">Save</button>
                    </div>
                  </div>
                </ng-template>
              </div>

              <!-- Submissions history -->
              <div class="bg-white rounded-[12px] p-5" style="border: 1px solid #EAE3DB;">
                <h2 class="font-semibold mb-3" style="color: #2D2622;">Submissions</h2>
                <p *ngIf="history.length === 0" class="text-sm" style="color: #8C7B70;">No submissions yet.</p>
                <ul class="space-y-2 max-h-[420px] overflow-y-auto">
                  <li *ngFor="let s of history" class="flex items-center gap-2 text-sm">
                    <span class="font-mono w-16 shrink-0" style="color: #4A3B33;">{{ elapsedOf(s) }}</span>
                    <app-balloon [color]="colorOf(s.problemLetter)" [size]="12"></app-balloon>
                    <span class="font-semibold" style="color: #2D2622;">{{ s.problemLetter }}</span>
                    <span class="px-1.5 py-0.5 rounded text-xs font-bold text-white" [style.background-color]="verdictColor(s.verdict)">{{ s.verdict }}</span>
                    <span class="text-xs truncate flex-1" style="color: #8C7B70;">{{ submitterName(s) }}</span>
                    <button *ngIf="canEdit" (click)="undo(s)" [disabled]="busy"
                            class="text-xs hover:underline disabled:opacity-50" style="color: #8C7B70;" title="Undo">undo</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class SimulationBoardComponent implements OnInit, OnDestroy {
  readonly verdicts: Verdict[] = ['AC', 'WA', 'TLE', 'RE'];

  sim: Simulation | null = null;
  rows: ProblemRow[] = [];
  history: SimulationSubmission[] = [];
  flying: FlyingBalloon[] = [];

  loading = true;
  busy = false;
  error: string | null = null;

  editingLinks = false;
  usacoDraft = '';
  excalidrawDraft = '';

  clockText = '--:--:--';
  clockLabel = 'Not started';
  remainingMs = 0;

  private id = '';
  private serverOffsetMs = 0;
  private knownAcIds: Set<string> | null = null;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private polling = false;
  private balloonSeq = 0;
  private audioCtx: AudioContext | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private simulationsService: SimulationsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.simulationsService.getSimulation(this.id).subscribe({
      next: (res) => {
        this.apply(res);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load simulation';
        this.loading = false;
      }
    });

    this.tickTimer = setInterval(() => this.updateClock(), 1000);
    this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.audioCtx?.close().catch(() => undefined);
  }

  // ---------- permissions ----------

  private get myId(): string | undefined {
    return this.authService.currentUserValue?.id;
  }

  get canEdit(): boolean {
    const me = this.myId;
    return !!me && !!this.sim?.participants.some(p => p._id === me);
  }

  get canSubmit(): boolean {
    return this.canEdit && this.sim?.status === 'running' && this.remainingMs > 0;
  }

  get canDelete(): boolean {
    return this.canEdit || this.authService.currentUserValue?.role === 'admin';
  }

  // ---------- derived data ----------

  get memberNames(): string {
    return this.sim?.participants.map(p => p.username).join(', ') || '';
  }

  get solvedCount(): number {
    return this.rows.filter(r => r.solved).length;
  }

  get totalPenalty(): number {
    return this.rows.reduce((acc, r) => acc + r.penalty, 0);
  }

  private apply(res: SimulationResponse): void {
    const sim = res.data.simulation;
    if (res.data.serverTime) {
      this.serverOffsetMs = new Date(res.data.serverTime).getTime() - Date.now();
    }
    this.sim = sim;
    this.buildRows(sim);
    this.detectNewAccepted(sim);
    this.updateClock();
  }

  private buildRows(sim: Simulation): void {
    const sorted = [...sim.submissions].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    this.history = [...sorted].reverse();

    this.rows = sim.problems.map(problem => {
      const subs = sorted.filter(s => s.problemLetter === problem.letter);
      const acIndex = subs.findIndex(s => s.verdict === 'AC');
      const solved = acIndex >= 0;
      const ac = solved ? subs[acIndex] : null;
      const wrongBefore = solved ? acIndex : subs.length;
      return {
        problem,
        attempts: solved ? acIndex + 1 : subs.length,
        solved,
        acMinute: ac ? ac.minute : null,
        acElapsed: ac ? this.elapsedOf(ac) : null,
        penalty: ac ? ac.minute + PENALTY_PER_WRONG * wrongBefore : 0,
        lastVerdict: subs.length ? subs[subs.length - 1].verdict : null
      };
    });
  }

  /** Celebrates every AC that appeared since the last refresh (own or from teammates). */
  private detectNewAccepted(sim: Simulation): void {
    const acs = sim.submissions.filter(s => s.verdict === 'AC');
    const ids = new Set(acs.map(s => s._id));
    if (this.knownAcIds) {
      for (const s of acs) {
        if (!this.knownAcIds.has(s._id)) this.celebrate(s.problemLetter);
      }
    }
    this.knownAcIds = ids;
  }

  // ---------- clock ----------

  private now(): number {
    return Date.now() + this.serverOffsetMs;
  }

  private updateClock(): void {
    const sim = this.sim;
    if (!sim || !sim.startTime) {
      this.clockLabel = 'Not started';
      this.clockText = this.format(sim ? sim.durationMinutes * 60000 : 0);
      this.remainingMs = sim ? sim.durationMinutes * 60000 : 0;
      return;
    }
    const start = new Date(sim.startTime).getTime();
    const end = sim.endTime ? new Date(sim.endTime).getTime() : start + sim.durationMinutes * 60000;

    if (sim.status === 'finished' || this.now() >= end) {
      this.remainingMs = 0;
      this.clockLabel = 'Finished';
      this.clockText = this.format(end - start);
      return;
    }
    this.remainingMs = end - this.now();
    this.clockLabel = 'Remaining';
    this.clockText = this.format(this.remainingMs);
  }

  private format(ms: number): string {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  elapsedOf(s: SimulationSubmission): string {
    if (!this.sim?.startTime) return '';
    return this.format(new Date(s.createdAt).getTime() - new Date(this.sim.startTime).getTime());
  }

  // ---------- actions ----------

  private poll(): void {
    if (this.polling || this.busy || !this.sim || document.hidden) return;
    this.polling = true;
    this.simulationsService.getSimulation(this.id).subscribe({
      next: (res) => { this.apply(res); this.polling = false; },
      error: () => { this.polling = false; }
    });
  }

  private run(obs: ReturnType<SimulationsService['start']>, after?: () => void): void {
    this.busy = true;
    this.error = null;
    obs.subscribe({
      next: (res) => {
        this.apply(res);
        this.busy = false;
        after?.();
      },
      error: (err) => {
        this.error = err.error?.message || 'Action failed';
        this.busy = false;
      }
    });
  }

  start(): void {
    this.unlockAudio();
    this.run(this.simulationsService.start(this.id));
  }

  finish(): void {
    if (!confirm('Finish the simulation now?')) return;
    this.run(this.simulationsService.finish(this.id));
  }

  submit(problem: SimulationProblem, verdict: Verdict): void {
    this.unlockAudio();
    this.run(this.simulationsService.submit(this.id, problem.letter, verdict));
  }

  undo(s: SimulationSubmission): void {
    if (!confirm(`Undo ${s.verdict} on problem ${s.problemLetter}?`)) return;
    this.run(this.simulationsService.undoSubmission(this.id, s._id));
  }

  startEditLinks(): void {
    this.usacoDraft = this.sim?.links.usaco || '';
    this.excalidrawDraft = this.sim?.links.excalidraw || '';
    this.editingLinks = true;
  }

  saveLinks(): void {
    this.run(
      this.simulationsService.updateLinks(this.id, {
        usaco: this.usacoDraft.trim(),
        excalidraw: this.excalidrawDraft.trim()
      }),
      () => (this.editingLinks = false)
    );
  }

  remove(): void {
    if (!confirm('Delete this simulation? This cannot be undone.')) return;
    this.busy = true;
    this.simulationsService.deleteSimulation(this.id).subscribe({
      next: () => this.router.navigate(['/simulations']),
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete simulation';
        this.busy = false;
      }
    });
  }

  // ---------- AC celebration ----------

  private celebrate(letter: string): void {
    const color = this.colorOf(letter);
    const id = ++this.balloonSeq;
    this.flying = [...this.flying, { id, color, letter, left: 15 + Math.random() * 70 }];
    setTimeout(() => (this.flying = this.flying.filter(b => b.id !== id)), 3600);
    this.playAcSound();
  }

  /** Browsers only allow audio after a user gesture, so create the context on click. */
  private unlockAudio(): void {
    try {
      if (!this.audioCtx) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (Ctx) this.audioCtx = new Ctx();
      }
      if (this.audioCtx?.state === 'suspended') this.audioCtx.resume();
    } catch {
      this.audioCtx = null;
    }
  }

  /** Short ascending "ding-ding" chime synthesized with the Web Audio API. */
  private playAcSound(): void {
    this.unlockAudio();
    const ctx = this.audioCtx;
    if (!ctx) return;
    const notes = [659.25, 783.99, 1046.5]; // E5, G5, C6
    const t0 = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = t0 + i * 0.12;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  }

  // ---------- view helpers ----------

  colorOf(letter: string): string {
    return this.sim?.problems.find(p => p.letter === letter)?.color || '#8C7B70';
  }

  submitterName(s: SimulationSubmission): string {
    const by = s.submittedBy;
    return by && typeof by === 'object' ? by.username : '';
  }

  verdictColor(v: Verdict): string {
    const colors: Record<Verdict, string> = { AC: '#2E7D32', WA: '#C62828', TLE: '#EF6C00', RE: '#6A1B9A' };
    return colors[v];
  }

  verdictName(v: Verdict): string {
    const names: Record<Verdict, string> = { AC: 'Accepted', WA: 'Wrong Answer', TLE: 'Time Limit Exceeded', RE: 'Runtime Error' };
    return names[v];
  }

  trackRow = (_: number, r: ProblemRow) => r.problem.letter;
  trackFlying = (_: number, b: FlyingBalloon) => b.id;
}
