import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ExcalidrawRoom {
  name: string;
  roomId: string;
  url: string;
  createdAt: Date;
}

export interface RPCContest {
  id: string;
  name: string;
  startTime: string;
  duration: string;
  registrationUrl: string;
}

export interface UsacoPermalinkResponse {
  ok: boolean;
  url?: string;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IntegrationsService {
  constructor(private api: ApiService) { }

  /**
   * Create Excalidraw room for team collaboration
   */
  createExcalidrawRoom(roomName: string, teamId?: string): Observable<any> {
    return this.api.post('/api/integrations/excalidraw/room', { roomName, teamId });
  }

  /**
   * Get RPC upcoming contests
   */
  getRPCContests(): Observable<any> {
    return this.api.get('/api/integrations/rpc/contests');
  }

  /**
   * Get RPC registration URL
   */
  getRPCRegistrationUrl(contestId?: string): Observable<any> {
    const url = contestId 
      ? `/api/integrations/rpc/register/${contestId}`
      : '/api/integrations/rpc/register';
    return this.api.get(url);
  }

  /**
   * Create USACO IDE permalink with optional team template
   */
  createUsacoPermalink(language: string = 'cpp', teamId?: string): Observable<UsacoPermalinkResponse> {
    const params: any = { language };
    if (teamId) {
      params.teamId = teamId;
    }
    return this.api.post<UsacoPermalinkResponse>('/api/integrations/usaco-ide/permalink', params);
  }

  /**
   * Get code template (optionally from team)
   */
  getCodeTemplate(language: string, teamId?: string): Observable<any> {
    const params = teamId ? `?teamId=${teamId}` : '';
    return this.api.get(`/api/integrations/usaco-ide/template/${language}${params}`);
  }

  /**
   * Get USACO permalink service status
   */
  getUsacoPermalinkStatus(): Observable<any> {
    return this.api.get('/api/integrations/usaco-ide/status');
  }
}
