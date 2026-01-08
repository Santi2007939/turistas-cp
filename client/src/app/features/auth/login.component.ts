import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style="background-color: #FCF9F5;">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl" style="box-shadow: 0 4px 20px rgba(74, 59, 51, 0.1);">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold flex items-center justify-center gap-2" style="color: #8B5E3C;">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3l4 8 5-5 5 15H2L8 3z"/>
            </svg>
            Turistas CP
          </h2>
          <p class="mt-2 text-center text-sm" style="color: #4A3B33;">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <!-- Success message from registration -->
        <div *ngIf="successMessage" class="border rounded-xl px-4 py-3 relative" style="background-color: #F2E9E1; border-color: #D4A373; color: #2D2622;">
          {{ successMessage }}
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div class="rounded-xl overflow-hidden" style="border: 1px solid #EAE3DB;">
            <div>
              <label for="email" class="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                [(ngModel)]="credentials.email"
                required
                class="appearance-none relative block w-full px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm"
                style="color: #2D2622; border-bottom: 1px solid #EAE3DB;"
                placeholder="Email"
              />
            </div>
            <div>
              <label for="password" class="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                [(ngModel)]="credentials.password"
                required
                class="appearance-none relative block w-full px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm"
                style="color: #2D2622;"
                placeholder="Contraseña"
              />
            </div>
          </div>

          <div *ngIf="error" class="text-red-500 text-sm text-center">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              [disabled]="loading"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
              style="background-color: #8B5E3C;"
            >
              {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
            </button>
          </div>

          <div class="text-center text-sm">
            <span style="color: #4A3B33;">¿No tienes cuenta? </span>
            <a routerLink="/auth/register" class="font-medium hover:underline" style="color: #8B5E3C;">
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
