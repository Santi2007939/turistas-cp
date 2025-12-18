import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { RoadmapService, PersonalNode } from '../../core/services/roadmap.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterModule, NavbarComponent],
    template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Welcome, {{ currentUser?.username }}!</h2>
          
          <!-- Roadmap Statistics -->
          <div *ngIf="roadmapStats" class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <h3 class="text-xl font-bold mb-4">📊 Tu Progreso en el Roadmap</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-3xl font-bold">{{ roadmapStats.total }}</div>
                <div class="text-sm opacity-90">Temas Totales</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold">{{ roadmapStats.inProgress }}</div>
                <div class="text-sm opacity-90">En Progreso</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold">{{ roadmapStats.completed }}</div>
                <div class="text-sm opacity-90">Completados</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold">{{ roadmapStats.averageProgress }}%</div>
                <div class="text-sm opacity-90">Progreso Promedio</div>
              </div>
            </div>
            <div class="mt-4">
              <div class="bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
                <div class="bg-white h-2 rounded-full transition-all duration-500" [style.width.%]="roadmapStats.averageProgress"></div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Feature cards -->
            <a routerLink="/themes" class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 class="text-lg font-semibold">📚 Learning Themes</h3>
              <p class="mt-2 text-gray-600">Browse and explore learning topics</p>
            </a>
            <a routerLink="/roadmap" class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 class="text-lg font-semibold">🗺️ My Roadmap</h3>
              <p class="mt-2 text-gray-600">Track your learning journey</p>
              <div class="mt-3 flex gap-2">
                <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">📋 Kanban</span>
                <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">📊 Gráfica</span>
              </div>
            </a>
            <a routerLink="/problems" class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 class="text-lg font-semibold">💻 Problems</h3>
              <p class="mt-2 text-gray-600">Practice and exercises</p>
            </a>
            <div class="bg-white overflow-hidden shadow rounded-lg p-6 opacity-50">
              <h3 class="text-lg font-semibold">👥 Team Turistas</h3>
              <p class="mt-2 text-gray-600">Collaborative workspace</p>
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
  roadmapStats: {
    total: number;
    inProgress: number;
    completed: number;
    averageProgress: number;
  } | null = null;

  constructor(
    private authService: AuthService,
    private roadmapService: RoadmapService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadRoadmapStats();
      }
    });
  }

  loadRoadmapStats(): void {
    this.roadmapService.getRoadmap().subscribe({
      next: (response) => {
        const nodes = response.data.roadmap;
        const total = nodes.length;
        const inProgress = nodes.filter(n => n.status === 'in-progress').length;
        const completed = nodes.filter(n => n.status === 'completed' || n.status === 'mastered' || n.status === 'done').length;
        const averageProgress = total > 0 
          ? Math.round(nodes.reduce((sum, n) => sum + n.progress, 0) / total) 
          : 0;

        this.roadmapStats = {
          total,
          inProgress,
          completed,
          averageProgress
        };
      },
      error: (err) => {
        console.error('Error loading roadmap stats:', err);
      }
    });
  }
}
