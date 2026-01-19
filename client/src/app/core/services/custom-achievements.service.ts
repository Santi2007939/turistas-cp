import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CustomAchievement {
  _id: string;
  name: string;
  description: string;
  photo?: string;
  category: 'rating' | 'contest';
  scope: 'personal' | 'team';
  createdBy: {
    _id: string;
    username: string;
    fullName?: string;
  };
  teamId?: {
    _id: string;
    name: string;
  };
  achievedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomAchievementsResponse {
  success: boolean;
  count: number;
  data: {
    achievements: CustomAchievement[];
  };
}

export interface CustomAchievementResponse {
  success: boolean;
  message?: string;
  data: {
    achievement: CustomAchievement;
  };
}

export interface CreateCustomAchievementData {
  name: string;
  description: string;
  photo?: string;
  category: 'rating' | 'contest';
  scope: 'personal' | 'team';
  teamId?: string;
  achievedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CustomAchievementsService {
  constructor(private api: ApiService) { }

  /**
   * Get all custom achievements (personal + team)
   */
  getCustomAchievements(): Observable<CustomAchievementsResponse> {
    return this.api.get<CustomAchievementsResponse>('/api/custom-achievements');
  }

  /**
   * Get current user's own achievements
   */
  getMyAchievements(): Observable<CustomAchievementsResponse> {
    return this.api.get<CustomAchievementsResponse>('/api/custom-achievements/my');
  }

  /**
   * Get a single custom achievement by ID
   */
  getCustomAchievement(id: string): Observable<CustomAchievementResponse> {
    return this.api.get<CustomAchievementResponse>(`/api/custom-achievements/${id}`);
  }

  /**
   * Create a new custom achievement
   */
  createCustomAchievement(data: CreateCustomAchievementData): Observable<CustomAchievementResponse> {
    return this.api.post<CustomAchievementResponse>('/api/custom-achievements', data);
  }

  /**
   * Update an existing custom achievement
   */
  updateCustomAchievement(id: string, data: Partial<CreateCustomAchievementData>): Observable<CustomAchievementResponse> {
    return this.api.put<CustomAchievementResponse>(`/api/custom-achievements/${id}`, data);
  }

  /**
   * Delete a custom achievement
   */
  deleteCustomAchievement(id: string): Observable<any> {
    return this.api.delete(`/api/custom-achievements/${id}`);
  }
}
