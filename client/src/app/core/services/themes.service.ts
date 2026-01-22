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

export interface SubtopicContent {
  name: string;
  description: string;
  sharedTheory: string;
  codeSnippets: Array<{
    language: 'python' | 'cpp';
    code: string;
    description?: string;
  }>;
  linkedProblems: Array<{
    problemId?: string;
    title: string;
    description?: string;
    link?: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  }>;
  resources: Array<{
    name: string;
    link: string;
  }>;
  userHasThemeInRoadmap: boolean;
  personalNotes: string;
}

export interface SubtopicContentResponse {
  success: boolean;
  data: {
    subtopic: SubtopicContent;
    theme: {
      _id: string;
      name: string;
    };
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

  /**
   * Get aggregated subtopic content for a theme
   */
  getSubtopicContent(themeId: string, subtopicName: string): Observable<SubtopicContentResponse> {
    const encodedName = encodeURIComponent(subtopicName);
    return this.api.get<SubtopicContentResponse>(`/api/themes/${themeId}/subtopics/${encodedName}`);
  }

  /**
   * Delete subtopic globally (admin only)
   */
  deleteSubtopicGlobally(themeId: string, subtopicName: string): Observable<any> {
    const encodedName = encodeURIComponent(subtopicName);
    return this.api.delete(`/api/themes/${themeId}/subtopics/${encodedName}`);
  }

  /**
   * Update subtopic shared content (theory, code snippets, resources, problems)
   */
  updateSubtopicSharedContent(themeId: string, subtopicName: string, content: { 
    sharedTheory?: string;
    codeSnippets?: Array<{ language: string; code: string; description?: string }>;
    linkedProblems?: Array<{ problemId?: string; title: string; description?: string; link?: string; difficulty: string }>;
    resources?: Array<{ name: string; link: string }>;
  }): Observable<any> {
    const encodedName = encodeURIComponent(subtopicName);
    return this.api.put(`/api/themes/${themeId}/subtopics/${encodedName}/shared`, content);
  }
}
