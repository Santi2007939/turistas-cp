import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface TeamMember {
  userId: any;
  isActive?: boolean;
  joinedAt: Date;
}

export interface CodeSession {
  _id?: string;
  name: string;
  link: string;
  linkedExcalidrawSessions?: string[];
  createdAt: Date;
}

export interface ExcalidrawSession {
  _id?: string;
  name: string;
  roomId: string;
  roomKey: string;
  url: string;
  linkedToCodeSessionId?: string;
  createdAt: Date;
}

export interface TeamConfig {
  _id: string;
  name: string;
  description: string;
  coach?: any;
  members: TeamMember[];
  maxMembers: number;
  settings: {
    isPublic: boolean;
    allowJoinRequests: boolean;
    sharedRoadmap: boolean;
    sharedCalendar: boolean;
  };
  statistics: {
    totalProblemsSolved: number;
    totalContests: number;
    averageRating: number;
  };
  excalidrawRooms: Array<{
    name: string;
    roomId: string;
    url: string;
    createdAt: Date;
  }>;
  excalidrawSessions?: ExcalidrawSession[];
  links?: {
    whatsappGroup?: string;
    discordServer?: string;
  };
  codeTemplate?: string;
  codeSessions?: CodeSession[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamsResponse {
  success: boolean;
  count: number;
  data: {
    teams: TeamConfig[];
  };
}

export interface TeamResponse {
  success: boolean;
  data: {
    team: TeamConfig;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  constructor(private api: ApiService) { }

  /**
   * Get all teams
   */
  getTeams(): Observable<TeamsResponse> {
    return this.api.get<TeamsResponse>('/api/team');
  }

  /**
   * Get single team by ID
   */
  getTeam(id: string): Observable<TeamResponse> {
    return this.api.get<TeamResponse>(`/api/team/${id}`);
  }

  /**
   * Create a new team
   */
  createTeam(team: Partial<TeamConfig>): Observable<TeamResponse> {
    return this.api.post<TeamResponse>('/api/team', team);
  }

  /**
   * Update existing team
   */
  updateTeam(id: string, team: Partial<TeamConfig>): Observable<TeamResponse> {
    return this.api.put<TeamResponse>(`/api/team/${id}`, team);
  }

  /**
   * Delete team
   */
  deleteTeam(id: string): Observable<any> {
    return this.api.delete(`/api/team/${id}`);
  }

  /**
   * Join a team
   */
  joinTeam(teamId: string): Observable<any> {
    return this.api.post(`/api/team/${teamId}/join`, {});
  }

  /**
   * Leave a team
   */
  leaveTeam(teamId: string): Observable<any> {
    return this.api.post(`/api/team/${teamId}/leave`, {});
  }

  /**
   * Update team links (WhatsApp, Discord)
   */
  updateTeamLinks(teamId: string, links: { whatsappGroup?: string; discordServer?: string }): Observable<TeamResponse> {
    return this.api.put<TeamResponse>(`/api/team/${teamId}/links`, links);
  }

  /**
   * Update team code template
   */
  updateTeamTemplate(teamId: string, codeTemplate: string): Observable<TeamResponse> {
    return this.api.put<TeamResponse>(`/api/team/${teamId}/template`, { codeTemplate });
  }

  /**
   * Toggle member active status
   */
  toggleMemberActive(teamId: string, userId: string, isActive: boolean): Observable<TeamResponse> {
    return this.api.put<TeamResponse>(`/api/team/${teamId}/members/${userId}/active`, { isActive });
  }

  /**
   * Add code session
   */
  addCodeSession(teamId: string, name: string, link: string): Observable<TeamResponse> {
    return this.api.post<TeamResponse>(`/api/team/${teamId}/code-sessions`, { name, link });
  }

  /**
   * Update code session name
   */
  updateCodeSession(teamId: string, sessionId: string, name: string): Observable<TeamResponse> {
    return this.api.put<TeamResponse>(`/api/team/${teamId}/code-sessions/${sessionId}`, { name });
  }

  /**
   * Delete code session
   */
  deleteCodeSession(teamId: string, sessionId: string): Observable<TeamResponse> {
    return this.api.delete<TeamResponse>(`/api/team/${teamId}/code-sessions/${sessionId}`);
  }

  /**
   * Add Excalidraw session
   */
  addExcalidrawSession(teamId: string, name: string, linkedToCodeSessionId?: string): Observable<TeamResponse> {
    return this.api.post<TeamResponse>(`/api/team/${teamId}/excalidraw-sessions`, { name, linkedToCodeSessionId });
  }

  /**
   * Update Excalidraw session
   */
  updateExcalidrawSession(teamId: string, sessionId: string, name: string, linkedToCodeSessionId?: string | null): Observable<TeamResponse> {
    return this.api.put<TeamResponse>(`/api/team/${teamId}/excalidraw-sessions/${sessionId}`, { name, linkedToCodeSessionId });
  }

  /**
   * Delete Excalidraw session
   */
  deleteExcalidrawSession(teamId: string, sessionId: string): Observable<TeamResponse> {
    return this.api.delete<TeamResponse>(`/api/team/${teamId}/excalidraw-sessions/${sessionId}`);
  }
}
