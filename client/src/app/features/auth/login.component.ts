import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <!-- Safe Room Login -->
    <div class="min-h-screen flex items-center justify-center bg-[#F4F4F4] py-12 px-4">
      <div class="max-w-md w-full space-y-8 bg-white p-8 border-2 border-[#D1D1D1]">
        <div>
          <h2 class="mt-6 text-center text-3xl font-bold text-[#1A1A1A] font-mono">
            🏔️ Turistas CP
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <!-- Success message from registration -->
        <div *ngIf="successMessage" class="bg-green-50 border-2 border-green-600 text-green-700 px-4 py-3">
          {{ successMessage }}
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                [(ngModel)]="credentials.email"
                required
                class="appearance-none relative block w-full px-4 py-3 border-2 border-[#D1D1D1] placeholder-gray-400 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                [(ngModel)]="credentials.password"
                required
                class="appearance-none relative block w-full px-4 py-3 border-2 border-[#D1D1D1] placeholder-gray-400 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] text-sm"
                placeholder="Contraseña"
              />
            </div>
          </div>

          <div *ngIf="error" class="text-red-600 text-sm text-center">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              [disabled]="loading"
              class="group relative w-full flex justify-center py-3 px-4 border-2 border-[#1A1A1A] text-sm font-medium text-white bg-[#1A1A1A] hover:bg-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
            </button>
          </div>

          <div class="text-center text-sm">
            <span class="text-gray-600">¿No tienes cuenta? </span>
            <a routerLink="/auth/register" class="font-medium text-[#1A1A1A] hover:text-[#FFB400]">
              Regístrate
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: []
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  loading = false;
  error = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Check for success message from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;
    if (state && state['message']) {
      this.successMessage = state['message'];
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        const user = response.data.user;
        // Redirect based on user role
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }
}
