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
    <div class="min-h-screen bg-[#F4F4F4]">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 px-6">
        <div class="py-6">
          <h2 class="text-2xl font-bold text-[#1A1A1A] mb-6 font-mono">User Management</h2>

          <!-- Error Message -->
          <div *ngIf="error" class="mb-4 bg-red-50 border-2 border-red-600 text-red-700 px-6 py-4">
            {{ error }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="mb-4 bg-green-50 border-2 border-green-600 text-green-700 px-6 py-4">
            {{ successMessage }}
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-8">
            <p class="text-gray-600">Loading users...</p>
          </div>

          <!-- Users Table - Safe Room Style -->
          <div *ngIf="!loading" class="bg-white border-2 border-[#D1D1D1] overflow-hidden">
            <table class="min-w-full">
              <thead class="bg-[#F4F4F4]">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#D1D1D1]">
                    Username
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#D1D1D1]">
                    Email
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#D1D1D1]">
                    Role
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#D1D1D1]">
                    Status
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#D1D1D1]">
                    Current Member
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#D1D1D1]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <tr *ngFor="let user of users" [class.bg-gray-50]="!user.isActive" class="border-b border-[#D1D1D1]">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A1A1A]">
                    {{ user.username }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ user.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span class="px-2 py-1 inline-flex text-xs font-semibold"
                          [ngClass]="{
                            'bg-[#1A1A1A] text-white': user.role === 'admin',
                            'bg-[#F4F4F4] text-[#1A1A1A] border border-[#D1D1D1]': user.role === 'student'
                          }">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span class="px-2 py-1 inline-flex text-xs font-semibold"
                          [ngClass]="{
                            'bg-[#FFB400] text-[#1A1A1A]': user.isActive,
                            'bg-gray-200 text-gray-600': !user.isActive
                          }">
                      {{ user.isActive ? 'Activo' : 'En espera' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span class="px-2 py-1 inline-flex text-xs font-semibold"
                          [ngClass]="{
                            'bg-[#1A1A1A] text-white': user.isCurrentMember,
                            'bg-[#F4F4F4] text-gray-600 border border-[#D1D1D1]': !user.isCurrentMember
                          }">
                      {{ user.isCurrentMember ? 'Sí' : 'No' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      *ngIf="!user.isActive"
                      (click)="approveUser(user._id)"
                      class="text-[#1A1A1A] hover:text-[#FFB400] font-medium"
                      title="Approve user">
                      ✓ Approve
                    </button>
                    <button
                      *ngIf="user.isActive && user.role !== 'admin'"
                      (click)="deactivateUser(user._id)"
                      class="text-red-600 hover:text-red-800 font-medium"
                      title="Deactivate user">
                      ✗ Deactivate
                    </button>
                    <button
                      *ngIf="user.role !== 'admin'"
                      (click)="toggleCurrentMember(user._id, !user.isCurrentMember)"
                      class="font-medium"
                      [ngClass]="{
                        'text-[#1A1A1A] hover:text-[#FFB400]': !user.isCurrentMember,
                        'text-gray-500 hover:text-gray-700': user.isCurrentMember
                      }"
                      title="{{ user.isCurrentMember ? 'Remove from current members' : 'Mark as current member' }}">
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
}
