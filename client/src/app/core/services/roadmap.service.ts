import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Theme } from './themes.service';

export interface PopulatedUser {
  _id: string;
  username: string;
  fullName?: string;
}

export interface TeamMember {
  _id: string;
  username: string;
  fullName?: string;
}

export interface CodeSnippet {
  language: 'python' | 'cpp';
  code: string;
  description?: string;
}

export interface Resource {
  name: string;
  link: string;
}

export interface LinkedProblem {
  _id?: string;
  problemId: string;
  title: string;
  description?: string;
  link?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  addedAt?: Date;
}

export interface Subtopic {
  _id?: string;
  name: string;
  description?: string;
  personalNotes?: string;
  sharedTheory?: string;
  codeSnippets?: CodeSnippet[];
  linkedProblems?: LinkedProblem[];
  resources?: Resource[];
  order?: number;
}

export interface PersonalNode {
  _id: string;
  userId: string | PopulatedUser;
  themeId: Theme;
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered' | 'todo' | 'done';
  progress: number;
  notes: string;
  dueDate?: Date;
  subtopics?: Subtopic[];
  problemsSolved: any[];
  order?: number;
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
    isOwner?: boolean;
  };
}

export interface NodeResponse {
  success: boolean;
  message: string;
  data: {
    node: PersonalNode;
  };
}

export interface TeamMembersResponse {
  success: boolean;
  count: number;
  data: {
    members: TeamMember[];
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
    dueDate?: Date | null;
    subtopics?: Subtopic[];
  }): Observable<NodeResponse> {
    return this.api.post<NodeResponse>('/api/roadmap', data);
  }

  /**
   * Delete roadmap node
   */
  deleteNode(nodeId: string): Observable<any> {
    return this.api.delete(`/api/roadmap/${nodeId}`);
  }

  /**
   * Add subtopic to a roadmap node
   */
  addSubtopic(nodeId: string, subtopic: Subtopic): Observable<NodeResponse> {
    return this.api.post<NodeResponse>(`/api/roadmap/${nodeId}/subtopics`, subtopic);
  }

  /**
   * Update subtopic in a roadmap node
   */
  updateSubtopic(nodeId: string, subtopicId: string, subtopic: Partial<Subtopic>): Observable<NodeResponse> {
    return this.api.put<NodeResponse>(`/api/roadmap/${nodeId}/subtopics/${subtopicId}`, subtopic);
  }

  /**
   * Delete subtopic from a roadmap node
   */
  deleteSubtopic(nodeId: string, subtopicId: string): Observable<any> {
    return this.api.delete(`/api/roadmap/${nodeId}/subtopics/${subtopicId}`);
  }

  /**
   * Get list of team members who have roadmaps
   */
  getTeamMembers(): Observable<TeamMembersResponse> {
    return this.api.get<TeamMembersResponse>('/api/roadmap/team-members');
  }

  /**
   * Get a specific member's roadmap (read-only)
   */
  getMemberRoadmap(memberId: string): Observable<RoadmapResponse> {
    return this.api.get<RoadmapResponse>(`/api/roadmap/member/${memberId}`);
  }

  /**
   * Update node order (for drag-and-drop)
   */
  updateNodeOrder(nodeOrders: { nodeId: string; order: number }[]): Observable<any> {
    return this.api.put('/api/roadmap/reorder', { nodeOrders });
  }
}
