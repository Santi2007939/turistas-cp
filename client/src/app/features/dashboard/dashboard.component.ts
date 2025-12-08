import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation -->
      <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-blue-600">🏔️ Turistas CP</h1>
            </div>
            <div class="flex items-center space-x-4">
              <a routerLink="/dashboard" class="text-gray-700 hover:text-blue-600">Dashboard</a>
              <a routerLink="/themes" class="text-gray-700 hover:text-blue-600">Themes</a>
              <a routerLink="/roadmap" class="text-gray-700 hover:text-blue-600">Roadmap</a>
              <a routerLink="/team" class="text-gray-700 hover:text-blue-600">Team</a>
              <span class="text-gray-700">{{ currentUser?.username }}</span>
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
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Welcome, {{ currentUser?.username }}!</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Feature cards -->
            <a routerLink="/themes" class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 class="text-lg font-semibold">📚 Learning Themes</h3>
              <p class="mt-2 text-gray-600">Browse and explore learning topics</p>
            </a>
            <a routerLink="/roadmap" class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 class="text-lg font-semibold">🗺️ My Roadmap</h3>
              <p class="mt-2 text-gray-600">Track your learning journey</p>
            </a>
            <a routerLink="/team" class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 class="text-lg font-semibold">👥 Teams</h3>
              <p class="mt-2 text-gray-600">Collaborate with your team</p>
            </a>
            <div class="bg-white overflow-hidden shadow rounded-lg p-6 opacity-50">
              <h3 class="text-lg font-semibold">💻 Problems</h3>
              <p class="mt-2 text-gray-600">Practice and exercises (Coming soon)</p>
            </div>
            <div class="bg-white overflow-hidden shadow rounded-lg p-6 opacity-50">
              <h3 class="text-lg font-semibold">📅 Calendar</h3>
              <p class="mt-2 text-gray-600">Contests and events (Coming soon)</p>
            </div>
            <div class="bg-white overflow-hidden shadow rounded-lg p-6 opacity-50">
              <h3 class="text-lg font-semibold">📊 Statistics</h3>
              <p class="mt-2 text-gray-600">View your progress (Coming soon)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
