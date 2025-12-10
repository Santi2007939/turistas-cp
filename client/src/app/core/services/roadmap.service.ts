import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Theme } from './themes.service';

export interface PopulatedUser {
  _id: string;
  username: string;
  fullName?: string;
}

export interface PersonalNode {
  _id: string;
  userId: string | PopulatedUser;
  themeId: Theme;
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  progress: number;
  notes: string;
  problemsSolved: any[];
  startedAt?: Date;
  completedAt?: Date;
  lastPracticed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoadmapResponse {
  success: boolean;
  count: number;
  data: {
    roadmap: PersonalNode[];
  };
}

export interface NodeResponse {
  success: boolean;
  message: string;
  data: {
    node: PersonalNode;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {
  constructor(private api: ApiService) { }

  /**
   * Get user's roadmap
   */
  getRoadmap(): Observable<RoadmapResponse> {
    return this.api.get<RoadmapResponse>('/api/roadmap');
  }

  /**
   * Get personal roadmap for a specific user
   */
  getPersonalRoadmap(userId: string): Observable<RoadmapResponse> {
    return this.api.get<RoadmapResponse>(`/api/roadmap/personal/${userId}`);
  }

  /**
   * Get other members' roadmaps
   */
  getMembersRoadmaps(userId: string): Observable<RoadmapResponse> {
    return this.api.get<RoadmapResponse>(`/api/roadmap/members/${userId}`);
  }

  /**
   * Create or update a roadmap node
   */
  updateNode(data: {
    themeId: string;
    status?: string;
    progress?: number;
    notes?: string;
  }): Observable<NodeResponse> {
    return this.api.post<NodeResponse>('/api/roadmap', data);
  }

  /**
   * Delete roadmap node
   */
  deleteNode(nodeId: string): Observable<any> {
    return this.api.delete(`/api/roadmap/${nodeId}`);
  }
}
