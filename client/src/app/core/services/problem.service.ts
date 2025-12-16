import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Problem {
  _id?: string;
  title: string;
  description?: string;
  platform: string;
  platformId?: string;
  url?: string;
  difficulty: string;
  rating?: number;
  tags: string[];
  themes?: string[];
  timeLimit?: string;
  memoryLimit?: string;
  addedBy?: any;
  isPublic?: boolean;
  solveCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CodeforcesProblemDetails {
  title: string;
  tags: string[];
  rating: number | null;
  solveCount: number;
  contestId: number;
  index: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProblemService {
  constructor(private api: ApiService) { }

  getProblems(filters?: { platform?: string; difficulty?: string; tags?: string }): Observable<any> {
    const params: any = {};
    if (filters?.platform) params.platform = filters.platform;
    if (filters?.difficulty) params.difficulty = filters.difficulty;
    if (filters?.tags) params.tags = filters.tags;

    return this.api.get('/problems', params);
  }

  getProblem(id: string): Observable<any> {
    return this.api.get(`/problems/${id}`);
  }

  createProblem(problem: Problem): Observable<any> {
    return this.api.post('/problems', problem);
  }

  updateProblem(id: string, problem: Partial<Problem>): Observable<any> {
    return this.api.put(`/problems/${id}`, problem);
  }

  deleteProblem(id: string): Observable<any> {
    return this.api.delete(`/problems/${id}`);
  }

  getCodeforcesProblemDetails(contestId: string, index: string): Observable<any> {
    return this.api.get(`/problems/codeforces/${contestId}/${index}`);
  }

  /**
   * Detect platform from URL
   */
  detectPlatformFromUrl(url: string): { platform: string; contestId?: string; index?: string } | null {
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Codeforces patterns
      if (hostname === 'codeforces.com' || hostname === 'www.codeforces.com') {
        const codeforcesPattern = /\/(?:contest|problemset\/problem)\/(\d+)\/([A-Z]\d?)/i;
        const codeforcesMatch = urlObj.pathname.match(codeforcesPattern);
        if (codeforcesMatch) {
          return {
            platform: 'codeforces',
            contestId: codeforcesMatch[1],
            index: codeforcesMatch[2]
          };
        }
        return { platform: 'codeforces' };
      }

      // LeetCode patterns
      if (hostname === 'leetcode.com' || hostname === 'www.leetcode.com') {
        return { platform: 'leetcode' };
      }

      // AtCoder patterns
      if (hostname === 'atcoder.jp' || hostname.endsWith('.atcoder.jp')) {
        return { platform: 'atcoder' };
      }

      // HackerRank patterns
      if (hostname === 'hackerrank.com' || hostname === 'www.hackerrank.com') {
        return { platform: 'hackerrank' };
      }

      // CSES patterns
      if (hostname === 'cses.fi' || hostname === 'www.cses.fi') {
        return { platform: 'cses' };
      }

      // UVA patterns
      if (hostname === 'onlinejudge.org' || hostname === 'uva.onlinejudge.org') {
        return { platform: 'uva' };
      }

      // SPOJ patterns
      if (hostname === 'spoj.com' || hostname === 'www.spoj.com') {
        return { platform: 'spoj' };
      }

      return { platform: 'other' };
    } catch (e) {
      // Invalid URL
      return { platform: 'other' };
    }
  }
}
