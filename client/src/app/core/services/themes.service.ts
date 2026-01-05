import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Subtheme {
  name: string;
  description?: string;
  _id?: string;
}

export interface Theme {
  _id: string;
  name: string;
  description: string;
  category: 'algorithms' | 'data-structures' | 'math' | 'strings' | 'graph' | 'dp' | 'greedy' | 'geometry' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  subthemes: Subtheme[];
  resources: Array<{
    title: string;
    url: string;
    type: 'article' | 'video' | 'book' | 'tutorial' | 'other';
  }>;
  createdBy: any;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemesResponse {
  success: boolean;
  count: number;
  data: {
    themes: Theme[];
  };
}

export interface ThemeResponse {
  success: boolean;
  data: {
    theme: Theme;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemesService {
  constructor(private api: ApiService) { }

  /**
   * Get all themes
   */
  getThemes(): Observable<ThemesResponse> {
    return this.api.get<ThemesResponse>('/api/themes');
  }

  /**
   * Get single theme by ID
   */
  getTheme(id: string): Observable<ThemeResponse> {
    return this.api.get<ThemeResponse>(`/api/themes/${id}`);
  }

  /**
   * Create a new theme
   */
  createTheme(theme: Partial<Theme>): Observable<ThemeResponse> {
    return this.api.post<ThemeResponse>('/api/themes', theme);
  }

  /**
   * Update existing theme
   */
  updateTheme(id: string, theme: Partial<Theme>): Observable<ThemeResponse> {
    return this.api.put<ThemeResponse>(`/api/themes/${id}`, theme);
  }

  /**
   * Delete theme
   */
  deleteTheme(id: string): Observable<any> {
    return this.api.delete(`/api/themes/${id}`);
  }
}
