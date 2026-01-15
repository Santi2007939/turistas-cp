import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { NavbarComponent } from '../../shared/components/navbar.component';

interface UserManagement extends User {
  _id: string;
  createdAt?: string;
  lastLogin?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <!-- Matte-Drift Admin Dashboard -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 px-6">
        <div class="py-6">
          <h2 class="text-2xl font-semibold mb-6" style="color: #2D2622;">User Management</h2>

          <!-- Error Message -->
          <div *ngIf="error" class="mb-4 bg-white rounded-[12px] px-4 py-3" style="border: 1px solid #EAE3DB; color: #2D2622;">
            {{ error }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="mb-4 bg-white rounded-[12px] px-4 py-3" style="border: 1px solid #D4A373; color: #8B5E3C;">
            {{ successMessage }}
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-8">
            <p style="color: #4A3B33;">Loading users...</p>
          </div>

          <!-- Users Table -->
          <div *ngIf="!loading" class="bg-white rounded-[12px] overflow-hidden" style="border: 1px solid #EAE3DB;">
            <table class="min-w-full">
              <thead style="background-color: #FCF9F5; border-bottom: 1px solid #EAE3DB;">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: #4A3B33;">
                    Username
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: #4A3B33;">
                    Email
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: #4A3B33;">
                    Role
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: #4A3B33;">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: #4A3B33;">
                    Current Member
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: #4A3B33;">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users" 
                    style="border-bottom: 1px solid #EAE3DB;"
                    [ngStyle]="{'background-color': !user.isActive ? '#FCF9F5' : '#FFFFFF'}">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" style="color: #2D2622;">
                    {{ user.username }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm" style="color: #4A3B33;">
                    {{ user.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-[12px]"
                          [ngStyle]="{
                            'background-color': user.role === 'admin' ? '#FCF9F5' : '#FCF9F5',
                            'color': user.role === 'admin' ? '#8B5E3C' : '#4A3B33',
                            'border': '1px solid #EAE3DB'
                          }">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-[12px]"
                          [ngStyle]="{
                            'background-color': '#FCF9F5',
                            'color': user.isActive ? '#8B5E3C' : '#4A3B33',
                            'border': '1px solid ' + (user.isActive ? '#D4A373' : '#EAE3DB')
                          }">
                      {{ user.isActive ? 'Activo' : 'En espera' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-[12px]"
                          [ngStyle]="{
                            'background-color': '#FCF9F5',
                            'color': user.isCurrentMember ? '#8B5E3C' : '#4A3B33',
                            'border': '1px solid ' + (user.isCurrentMember ? '#D4A373' : '#EAE3DB')
                          }">
                      {{ user.isCurrentMember ? 'Sí' : 'No' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      *ngIf="!user.isActive"
                      (click)="approveUser(user._id)"
                      class="hover:underline"
                      style="color: #8B5E3C;"
                      title="Approve user"
                    >
                      ✓ Approve
                    </button>
                    <button
                      *ngIf="user.isActive && user.role !== 'admin'"
                      (click)="deactivateUser(user._id)"
                      class="text-red-600 hover:text-red-900"
                      title="Deactivate user"
                    >
                      ✗ Deactivate
                    </button>
                    <button
                      *ngIf="user.role !== 'admin'"
                      (click)="toggleCurrentMember(user._id, !user.isCurrentMember)"
                      [ngStyle]="{'color': !user.isCurrentMember ? '#8B5E3C' : '#4A3B33'}"
                      class="hover:underline"
                      title="{{ user.isCurrentMember ? 'Remove from current members' : 'Mark as current member' }}"
                    >
                      {{ user.isCurrentMember ? '★ Remove Member' : '☆ Mark Member' }}
                    </button>
                    <button
                      *ngIf="user.role !== 'admin'"
                      (click)="deleteUser(user._id, user.username)"
                      class="text-red-600 hover:text-red-900 hover:underline"
                      title="Delete user permanently"
                    >
                      ✕ Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && users.length === 0" class="text-center py-8">
            <p style="color: #4A3B33;">No users found</p>
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
        this.error = err.error?.message || 'Error loading users';
        this.loading = false;
      }
    });
  }

  approveUser(userId: string): void {
    console.log("ID que intento enviar:", userId);
    console.log("Tipo de dato:", typeof userId);
    
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

  deleteUser(userId: string, username: string): void {
    if (!confirm(`Are you sure you want to permanently delete user "${username}"? This action cannot be undone and will also remove them from any teams.`)) {
      return;
    }
    
    this.error = '';
    this.successMessage = '';
    
    this.http.delete(
      `${environment.apiUrl}/api/users/${userId}`
    ).subscribe({
      next: () => {
        this.successMessage = `User "${username}" deleted successfully`;
        this.loadUsers();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error deleting user';
      }
    });
  }
}
