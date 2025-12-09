import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface UserManagement extends User {
  createdAt?: string;
  lastLogin?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation -->
      <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-blue-600">🏔️ Turistas CP - Admin Panel</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">{{ currentUser?.username }} (Admin)</span>
              <button
                (click)="logout()"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">User Management</h2>

          <!-- Error Message -->
          <div *ngIf="error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {{ error }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {{ successMessage }}
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-8">
            <p class="text-gray-600">Loading users...</p>
          </div>

          <!-- Users Table -->
          <div *ngIf="!loading" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Member
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let user of users" [class.bg-gray-50]="!user.isActive">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ user.username }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [class.bg-purple-100]="user.role === 'admin'"
                          [class.text-purple-800]="user.role === 'admin'"
                          [class.bg-blue-100]="user.role === 'student'"
                          [class.text-blue-800]="user.role === 'student'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [class.bg-green-100]="user.isActive"
                          [class.text-green-800]="user.isActive"
                          [class.bg-red-100]="!user.isActive"
                          [class.text-red-800]="!user.isActive">
                      {{ user.isActive ? 'Activo' : 'En espera' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [class.bg-green-100]="user.isCurrentMember"
                          [class.text-green-800]="user.isCurrentMember"
                          [class.bg-gray-100]="!user.isCurrentMember"
                          [class.text-gray-800]="!user.isCurrentMember">
                      {{ user.isCurrentMember ? 'Sí' : 'No' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      *ngIf="!user.isActive"
                      (click)="approveUser(user.id)"
                      class="text-green-600 hover:text-green-900"
                      title="Approve user"
                    >
                      ✓ Approve
                    </button>
                    <button
                      *ngIf="user.isActive && user.role !== 'admin'"
                      (click)="deactivateUser(user.id)"
                      class="text-red-600 hover:text-red-900"
                      title="Deactivate user"
                    >
                      ✗ Deactivate
                    </button>
                    <button
                      *ngIf="user.role !== 'admin'"
                      (click)="toggleCurrentMember(user.id, !user.isCurrentMember)"
                      [class.text-blue-600]="!user.isCurrentMember"
                      [class.hover:text-blue-900]="!user.isCurrentMember"
                      [class.text-gray-600]="user.isCurrentMember"
                      [class.hover:text-gray-900]="user.isCurrentMember"
                      title="{{ user.isCurrentMember ? 'Remove from current members' : 'Mark as current member' }}"
                    >
                      {{ user.isCurrentMember ? '★ Remove Member' : '☆ Mark Member' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && users.length === 0" class="text-center py-8">
            <p class="text-gray-600">No users found</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  users: UserManagement[] = [];
  loading = true;
  error = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    
    this.http.get<UserManagement[]>(
      `${environment.apiUrl}/api/admin/users`
    ).subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || err.error?.message || 'Error loading users';
        this.loading = false;
      }
    });
  }

  approveUser(userId: string): void {
    this.error = '';
    this.successMessage = '';
    
    this.http.put(
      `${environment.apiUrl}/api/users/${userId}/status`,
      { isActive: true }
    ).subscribe({
      next: () => {
        this.successMessage = 'User approved successfully';
        this.loadUsers();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error approving user';
      }
    });
  }

  deactivateUser(userId: string): void {
    this.error = '';
    this.successMessage = '';
    
    this.http.put(
      `${environment.apiUrl}/api/users/${userId}/status`,
      { isActive: false }
    ).subscribe({
      next: () => {
        this.successMessage = 'User deactivated successfully';
        this.loadUsers();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error deactivating user';
      }
    });
  }

  toggleCurrentMember(userId: string, isCurrentMember: boolean): void {
    this.error = '';
    this.successMessage = '';
    
    this.http.put(
      `${environment.apiUrl}/api/users/${userId}/member`,
      { isCurrentMember }
    ).subscribe({
      next: () => {
        this.successMessage = isCurrentMember 
          ? 'User marked as current member' 
          : 'User removed from current members';
        this.loadUsers();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error updating member status';
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
