import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: string;
  codeforcesHandle?: string;
  team?: any;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  codeforcesHandle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    // Load user from localStorage on init
    const token = localStorage.getItem('token');
    if (token) {
      this.loadCurrentUser();
    }
  }

  /**
   * Get current user value
   */
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Register a new user
   */
  register(data: RegisterData): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/api/auth/register', data).pipe(
      tap(response => {
        if (response.success) {
          this.setSession(response.data);
        }
      })
    );
  }

  /**
   * Login user
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap(response => {
        if (response.success) {
          this.setSession(response.data);
        }
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Load current user from API
   */
  loadCurrentUser(): void {
    this.api.get<any>('/api/auth/me').subscribe({
      next: (response) => {
        if (response.success) {
          this.currentUserSubject.next(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      },
      error: () => {
        this.logout();
      }
    });
  }

  /**
   * Update user profile
   */
  updateProfile(data: Partial<User>): Observable<any> {
    return this.api.put('/api/auth/profile', data).pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSubject.next(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      })
    );
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.api.put('/api/auth/password', { currentPassword, newPassword });
  }

  /**
   * Set session data
   */
  private setSession(data: { user: User; token: string }): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    this.currentUserSubject.next(data.user);
  }
}
