import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ReminderSettings {
  enabled: boolean;
  minutesBefore: number;
  sent?: boolean;
  sentAt?: Date;
}

export interface CalendarEvent {
  _id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: 'contest' | 'practice' | 'training' | 'meeting' | 'deadline' | 'roadmap' | 'problem' | 'clase_gpc' | 'rpc' | 'other';
  eventScope: 'personal' | 'team' | 'public';
  isPublic: boolean;
  teamId?: string;
  contestId?: string;
  problemId?: string;
  participants?: Array<{ _id: string; username: string }>;
  createdBy?: { _id: string; username: string } | string;
  ownerId?: { _id: string; username: string } | string;
  reminder?: ReminderSettings;
}

export interface CalendarResponse {
  success: boolean;
  count?: number;
  data: {
    events: CalendarEvent[];
  };
}

export interface SingleEventResponse {
  success: boolean;
  data: {
    event: CalendarEvent;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  constructor(private api: ApiService) { }

  getEvents(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    scope?: string;
    teamId?: string;
  }): Observable<CalendarResponse> {
    let queryString = '';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.type) queryParams.append('type', params.type);
      if (params.scope) queryParams.append('scope', params.scope);
      if (params.teamId) queryParams.append('teamId', params.teamId);
      queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    }
    return this.api.get<CalendarResponse>(`/api/calendar${queryString}`);
  }

  getEvent(id: string): Observable<SingleEventResponse> {
    return this.api.get<SingleEventResponse>(`/api/calendar/${id}`);
  }

  createEvent(event: Partial<CalendarEvent>): Observable<SingleEventResponse> {
    return this.api.post<SingleEventResponse>('/api/calendar', event);
  }

  updateEvent(id: string, event: Partial<CalendarEvent>): Observable<SingleEventResponse> {
    return this.api.put<SingleEventResponse>(`/api/calendar/${id}`, event);
  }

  deleteEvent(id: string): Observable<any> {
    return this.api.delete(`/api/calendar/${id}`);
  }
}
