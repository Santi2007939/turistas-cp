import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export type Verdict = 'AC' | 'WA' | 'TLE' | 'RE';
export type SimulationStatus = 'pending' | 'running' | 'finished';

export interface SimulationMember {
  _id: string;
  username: string;
  fullName?: string;
  codeforcesHandle?: string;
}

export interface SimulationProblem {
  _id?: string;
  letter: string;
  title?: string;
  color: string;
}

export interface SimulationSubmission {
  _id: string;
  problemLetter: string;
  verdict: Verdict;
  minute: number;
  submittedBy?: SimulationMember | string;
  createdAt: string;
}

export interface Simulation {
  _id: string;
  name: string;
  createdBy?: SimulationMember | string;
  participants: SimulationMember[];
  problems: SimulationProblem[];
  durationMinutes: number;
  status: SimulationStatus;
  startTime?: string;
  endTime?: string;
  submissions: SimulationSubmission[];
  links: { usaco: string; excalidraw: string };
  createdAt: string;
}

export interface CreateSimulationData {
  name: string;
  participants: string[];
  problemCount: number;
  problemTitles?: string[];
  durationMinutes: number;
  links: { usaco: string; excalidraw: string };
}

export interface SimulationResponse {
  success: boolean;
  data: { simulation: Simulation; serverTime?: string };
}

/** Penalty minutes added per rejected attempt before AC (ICPC rules). */
export const PENALTY_PER_WRONG = 20;

/** Same palette the server assigns to problems A, B, C, ... (used for previews). */
export const BALLOON_COLORS = [
  '#E53935', '#1E88E5', '#43A047', '#FDD835', '#8E24AA', '#FB8C00',
  '#00ACC1', '#D81B60', '#6D4C41', '#3949AB', '#7CB342', '#F4511E',
  '#5E35B1', '#00897B', '#C0CA33', '#546E7A', '#EC407A', '#26A69A',
  '#FFB300', '#29B6F6', '#AB47BC', '#9CCC65', '#EF5350', '#5C6BC0',
  '#8D6E63', '#26C6DA'
];

@Injectable({
  providedIn: 'root'
})
export class SimulationsService {
  constructor(private api: ApiService) {}

  getMembers(): Observable<{ success: boolean; data: { members: SimulationMember[] } }> {
    return this.api.get('/simulations/members');
  }

  getSimulations(): Observable<{ success: boolean; data: { simulations: Simulation[] } }> {
    return this.api.get('/simulations');
  }

  getSimulation(id: string): Observable<SimulationResponse> {
    return this.api.get(`/simulations/${id}`);
  }

  createSimulation(data: CreateSimulationData): Observable<SimulationResponse> {
    return this.api.post('/simulations', data);
  }

  updateLinks(id: string, links: { usaco?: string; excalidraw?: string }): Observable<SimulationResponse> {
    return this.api.put(`/simulations/${id}/links`, links);
  }

  start(id: string): Observable<SimulationResponse> {
    return this.api.post(`/simulations/${id}/start`, {});
  }

  finish(id: string): Observable<SimulationResponse> {
    return this.api.post(`/simulations/${id}/finish`, {});
  }

  submit(id: string, problemLetter: string, verdict: Verdict): Observable<SimulationResponse> {
    return this.api.post(`/simulations/${id}/submissions`, { problemLetter, verdict });
  }

  undoSubmission(id: string, submissionId: string): Observable<SimulationResponse> {
    return this.api.delete(`/simulations/${id}/submissions/${submissionId}`);
  }

  deleteSimulation(id: string): Observable<{ success: boolean }> {
    return this.api.delete(`/simulations/${id}`);
  }
}
