import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-card-bg border border-card-border p-8 rounded-kinetic">
        <div>
          <h2 class="mt-6 text-center text-3xl font-bold text-deep-sea">
            🏔️ Turistas CP
          </h2>
          <p class="mt-2 text-center text-sm text-icon-gray">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <!-- Success message from registration -->
        <div *ngIf="successMessage" class="bg-electric-blue/10 border border-electric-blue text-deep-sea px-4 py-3 rounded-kinetic relative">
          {{ successMessage }}
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div class="rounded-kinetic -space-y-px">
            <div>
              <label for="email" class="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                [(ngModel)]="credentials.email"
                required
                class="appearance-none rounded-t-kinetic relative block w-full px-3 py-2 border border-card-border placeholder-icon-gray text-deep-sea focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
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
                class="appearance-none rounded-b-kinetic relative block w-full px-3 py-2 border border-card-border placeholder-icon-gray text-deep-sea focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
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
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-kinetic text-deep-sea bg-electric-blue hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue disabled:opacity-50"
            >
              {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
            </button>
          </div>

          <div class="text-center text-sm">
            <span class="text-icon-gray">¿No tienes cuenta? </span>
            <a routerLink="/auth/register" class="font-medium text-electric-blue hover:opacity-80">
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
