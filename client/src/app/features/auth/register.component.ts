import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-register',
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <!-- Safe Room Register -->
    <div class="min-h-screen flex items-center justify-center bg-[#F4F4F4] py-12 px-4">
      <div class="max-w-md w-full space-y-8 bg-white p-8 border-2 border-[#D1D1D1]">
        <div>
          <h2 class="mt-6 text-center text-3xl font-bold text-[#1A1A1A] font-mono">
            🏔️ Turistas CP
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            {{ usersExist ? 'Crea tu cuenta' : 'Crea la cuenta de administrador' }}
          </p>
        </div>
        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                id="username"
                name="username"
                type="text"
                [(ngModel)]="formData.username"
                required
                class="appearance-none relative block w-full px-4 py-3 border-2 border-[#D1D1D1] placeholder-gray-400 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] text-sm"
                placeholder="Nombre de usuario"
              />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                [(ngModel)]="formData.email"
                required
                class="appearance-none relative block w-full px-4 py-3 border-2 border-[#D1D1D1] placeholder-gray-400 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] text-sm"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                [(ngModel)]="formData.password"
                required
                class="appearance-none relative block w-full px-4 py-3 border-2 border-[#D1D1D1] placeholder-gray-400 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] text-sm"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Nombre completo (opcional)</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                [(ngModel)]="formData.fullName"
                class="appearance-none relative block w-full px-4 py-3 border-2 border-[#D1D1D1] placeholder-gray-400 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] text-sm"
                placeholder="Tu nombre completo"
              />
            </div>
            <div *ngIf="usersExist">
              <label for="codeforcesHandle" class="block text-sm font-medium text-gray-700 mb-1">Handle de Codeforces (opcional)</label>
              <input
                id="codeforcesHandle"
                name="codeforcesHandle"
                type="text"
                [(ngModel)]="formData.codeforcesHandle"
                class="appearance-none relative block w-full px-4 py-3 border-2 border-[#D1D1D1] placeholder-gray-400 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] text-sm"
                placeholder="tu_handle"
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
              {{ loading ? 'Registrando...' : 'Registrarse' }}
            </button>
          </div>

          <div class="text-center text-sm">
            <span class="text-gray-600">¿Ya tienes cuenta? </span>
            <a routerLink="/auth/login" class="font-medium text-[#1A1A1A] hover:text-[#FFB400]">
              Inicia sesión
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: []
})
export class RegisterComponent implements OnInit {
  formData = {
    username: '',
    email: '',
    password: '',
    fullName: '',
    codeforcesHandle: ''
  };
  loading = false;
  error = '';
  usersExist = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // Check if users exist in the database
    this.http.get<{ success: boolean; data: { usersExist: boolean } }>(
      `${environment.apiUrl}/api/auth/check-users`
    ).subscribe({
      next: (response) => {
        this.usersExist = response.data.usersExist;
      },
      error: (err) => {
        console.error('Error checking users:', err);
        // Default to true on error - better to show the field than hide it
        // This prevents confusion if the check fails
        this.usersExist = true;
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.authService.register(this.formData).subscribe({
      next: (response) => {
        const user = response.data.user;
        // If user is admin (first user), they're auto-logged in and redirected
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          // Student account created, show success and redirect to login
          this.router.navigate(['/auth/login'], {
            state: { message: response.message }
          });
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al registrarse';
        this.loading = false;
      }
    });
  }
}
