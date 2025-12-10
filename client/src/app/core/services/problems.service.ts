import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PopulatedUser {
  _id: string;
  username: string;
  fullName?: string;
}

export interface Problem {
  _id: string;
  title: string;
  description?: string;
  platform: string;
  platformId?: string;
  url?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  rating?: number;
  tags: string[];
  themes: any[];
  timeLimit?: string;
  memoryLimit?: string;
  addedBy: any;
  owner: 'personal' | 'team';
  createdBy: string | PopulatedUser;
  isPublic: boolean;
  solveCount: number;
  status: 'pending' | 'ac' | 'wa';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProblemsResponse {
  success: boolean;
  count: number;
  data: {
    problems: Problem[];
  };
}

export interface ProblemResponse {
  success: boolean;
  message: string;
  data: {
    problem: Problem;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProblemsService {
  constructor(private api: ApiService) { }

  /**
   * Get all problems
   */
  getProblems(params?: { platform?: string; difficulty?: string; tags?: string }): Observable<ProblemsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.platform) queryParams.append('platform', params.platform);
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.tags) queryParams.append('tags', params.tags);
    
    const queryString = queryParams.toString();
    return this.api.get<ProblemsResponse>(`/api/problems${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Get personal problems for a user
   */
  getPersonalProblems(userId: string): Observable<ProblemsResponse> {
    return this.api.get<ProblemsResponse>(`/api/problems/personal/${userId}`);
  }

  /**
   * Get team problems
   */
  getTeamProblems(): Observable<ProblemsResponse> {
    return this.api.get<ProblemsResponse>('/api/problems/team');
  }

  /**
   * Get other members' problems
   */
  getMembersProblems(userId: string): Observable<ProblemsResponse> {
    return this.api.get<ProblemsResponse>(`/api/problems/members/${userId}`);
  }

  /**
   * Get single problem by ID
   */
  getProblem(id: string): Observable<ProblemResponse> {
    return this.api.get<ProblemResponse>(`/api/problems/${id}`);
  }

  /**
   * Create a new problem
   */
  createProblem(problem: Partial<Problem>): Observable<ProblemResponse> {
    return this.api.post<ProblemResponse>('/api/problems', problem);
  }

  /**
   * Update existing problem
   */
  updateProblem(id: string, problem: Partial<Problem>): Observable<ProblemResponse> {
    return this.api.put<ProblemResponse>(`/api/problems/${id}`, problem);
  }

  /**
   * Delete problem
   */
  deleteProblem(id: string): Observable<any> {
    return this.api.delete(`/api/problems/${id}`);
  }

  /**
   * Fetch problem data from Codeforces URL
   */
  fetchCodeforcesData(url: string): Observable<ProblemResponse> {
    return this.api.post<ProblemResponse>('/api/problems/fetch-codeforces', { url });
  }
}
