import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CalendarEvent {
  _id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: 'contest' | 'practice' | 'meeting' | 'deadline' | 'other';
  eventScope: 'personal' | 'team' | 'public';
  isPublic: boolean;
  teamId?: string;
  contestId?: string;
  problemId?: string;
  participants?: any[];
  createdBy?: any;
  ownerId?: any;
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
    return this.api.get<CalendarResponse>('/api/calendar', params);
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
