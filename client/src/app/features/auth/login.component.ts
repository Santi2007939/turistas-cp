import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <!-- Matte-Drift Login -->
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style="background-color: #FCF9F5;">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-[12px]" style="border: 1px solid #EAE3DB;">
        <div>
          <h2 class="mt-6 text-center text-3xl font-semibold" style="color: #8B5E3C;">
            🏔️ Turistas CP
          </h2>
          <p class="mt-2 text-center text-sm" style="color: #4A3B33;">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <!-- Success message from registration -->
        <div *ngIf="successMessage" class="bg-white rounded-[12px] px-4 py-3" style="border: 1px solid #D4A373; color: #8B5E3C;">
          {{ successMessage }}
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium mb-1" style="color: #2D2622;">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                [(ngModel)]="credentials.email"
                required
                class="appearance-none relative block w-full px-4 py-3 rounded-[12px] focus:outline-none sm:text-sm"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium mb-1" style="color: #2D2622;">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                [(ngModel)]="credentials.password"
                required
                class="appearance-none relative block w-full px-4 py-3 rounded-[12px] focus:outline-none sm:text-sm"
                style="border: 1px solid #EAE3DB; color: #2D2622;"
                placeholder="••••••••"
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
              class="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-[12px] text-white focus:outline-none disabled:opacity-50"
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
