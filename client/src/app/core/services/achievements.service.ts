import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  type: 'problem-solving' | 'contest' | 'streak' | 'rating' | 'contribution' | 'special';
  icon?: string;
  criteria: {
    type: 'problem-count' | 'contest-count' | 'rating-milestone' | 'streak-days' | 'custom';
    threshold: number;
    description?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedBy: Array<{
    userId: string;
    unlockedAt: Date;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementsResponse {
  success: boolean;
  count: number;
  data: {
    achievements: Achievement[];
  };
}

export interface AchievementResponse {
  success: boolean;
  message?: string;
  data: {
    achievement: Achievement;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AchievementsService {
  constructor(private api: ApiService) { }

  /**
   * Get all achievements
   */
  getAchievements(): Observable<AchievementsResponse> {
    return this.api.get<AchievementsResponse>('/api/achievements');
  }

  /**
   * Get achievements unlocked by a specific user
   */
  getUserAchievements(userId: string): Observable<AchievementsResponse> {
    return this.api.get<AchievementsResponse>(`/api/achievements/user/${userId}`);
  }

  /**
   * Get a single achievement by ID
   */
  getAchievement(id: string): Observable<AchievementResponse> {
    return this.api.get<AchievementResponse>(`/api/achievements/${id}`);
  }

  /**
   * Unlock an achievement for the current user
   */
  unlockAchievement(id: string): Observable<AchievementResponse> {
    return this.api.post<AchievementResponse>(`/api/achievements/${id}/unlock`, {});
  }
}
