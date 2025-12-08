import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation -->
      <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-primary-600">🏔️ Turistas CP</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">{{ currentUser?.username }}</span>
              <button
                (click)="logout()"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Feature cards will go here -->
            <div class="bg-white overflow-hidden shadow rounded-lg p-6">
              <h3 class="text-lg font-semibold">🗺️ Roadmap</h3>
              <p class="mt-2 text-gray-600">Mi ruta de aprendizaje</p>
            </div>
            <div class="bg-white overflow-hidden shadow rounded-lg p-6">
              <h3 class="text-lg font-semibold">💻 Problemas</h3>
              <p class="mt-2 text-gray-600">Práctica y ejercicios</p>
            </div>
            <div class="bg-white overflow-hidden shadow rounded-lg p-6">
              <h3 class="text-lg font-semibold">📅 Calendario</h3>
              <p class="mt-2 text-gray-600">Concursos y eventos</p>
            </div>
            <div class="bg-white overflow-hidden shadow rounded-lg p-6">
              <h3 class="text-lg font-semibold">📊 Estadísticas</h3>
              <p class="mt-2 text-gray-600">Mi progreso</p>
            </div>
            <div class="bg-white overflow-hidden shadow rounded-lg p-6">
              <h3 class="text-lg font-semibold">👥 Equipo</h3>
              <p class="mt-2 text-gray-600">Mi equipo</p>
            </div>
            <div class="bg-white overflow-hidden shadow rounded-lg p-6">
              <h3 class="text-lg font-semibold">🏆 Logros</h3>
              <p class="mt-2 text-gray-600">Mis logros</p>
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
