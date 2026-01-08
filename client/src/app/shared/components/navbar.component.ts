import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="bg-deep-sea fixed top-0 left-0 right-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-white">🏔️ Turistas CP</h1>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-4">
            <a 
              routerLink="/dashboard" 
              routerLinkActive="!opacity-100 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-white opacity-80 hover:opacity-100 transition-opacity px-3 py-2 rounded-kinetic text-sm font-medium">
              Dashboard
            </a>
            <a 
              routerLink="/themes" 
              routerLinkActive="!opacity-100 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-white opacity-80 hover:opacity-100 transition-opacity px-3 py-2 rounded-kinetic text-sm font-medium">
              Themes
            </a>
            <a 
              routerLink="/roadmap" 
              routerLinkActive="!opacity-100 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-white opacity-80 hover:opacity-100 transition-opacity px-3 py-2 rounded-kinetic text-sm font-medium">
              Roadmap
            </a>
            <a 
              routerLink="/problems" 
              routerLinkActive="!opacity-100 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-white opacity-80 hover:opacity-100 transition-opacity px-3 py-2 rounded-kinetic text-sm font-medium">
              Problems
            </a>
            <a 
              routerLink="/team" 
              routerLinkActive="!opacity-100 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-white opacity-80 hover:opacity-100 transition-opacity px-3 py-2 rounded-kinetic text-sm font-medium">
              Team
            </a>
            <a 
              *ngIf="currentUser?.role === 'admin'"
              routerLink="/admin" 
              routerLinkActive="!opacity-100 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-white opacity-80 hover:opacity-100 transition-opacity px-3 py-2 rounded-kinetic text-sm font-medium">
              Admin
            </a>
            
            <!-- Profile Dropdown -->
            <div class="relative profile-dropdown-container">
              <button
                (click)="toggleProfileDropdown()"
                class="flex items-center gap-2 text-white opacity-80 hover:opacity-100 transition-opacity px-3 py-2 rounded-kinetic text-sm font-medium">
                <span>👤</span>
                <span>{{ currentUser?.username }}</span>
                <svg class="w-4 h-4 transition-transform" [ngClass]="{'rotate-180': profileDropdownOpen}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown Menu -->
              <div 
                *ngIf="profileDropdownOpen"
                class="absolute right-0 mt-2 w-80 bg-white rounded-kinetic border border-card-border py-2 z-50">
                
                <!-- Profile Info Section -->
                <div class="px-4 py-3 border-b border-card-border">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 rounded-kinetic bg-electric-blue flex items-center justify-center text-deep-sea text-xl font-bold">
                      {{ currentUser?.username?.charAt(0)?.toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-bold text-deep-sea">{{ currentUser?.username }}</p>
                      <p class="text-sm text-icon-gray">{{ currentUser?.email }}</p>
                    </div>
                  </div>
                  
                  <!-- Profile Details -->
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-icon-gray">Nombre completo:</span>
                      <span class="text-deep-sea font-medium">{{ currentUser?.fullName || 'No especificado' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-icon-gray">Codeforces Handle:</span>
                      <span *ngIf="currentUser?.codeforcesHandle" class="text-electric-blue font-medium">
                        <a [href]="'https://codeforces.com/profile/' + currentUser?.codeforcesHandle" target="_blank" rel="noopener noreferrer" class="hover:underline">
                          {{ currentUser?.codeforcesHandle }}
                        </a>
                      </span>
                      <span *ngIf="!currentUser?.codeforcesHandle" class="text-icon-gray">No vinculado</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-icon-gray">Rol:</span>
                      <span class="text-deep-sea font-medium capitalize">{{ currentUser?.role }}</span>
                    </div>
                  </div>
                </div>

                <!-- Edit Profile Button -->
                <div class="px-4 py-2 border-b border-card-border">
                  <button 
                    *ngIf="!editingProfile"
                    (click)="startEditProfile()"
                    class="w-full text-left text-electric-blue hover:opacity-80 text-sm font-medium py-1">
                    ✏️ Editar Perfil
                  </button>
                  
                  <!-- Edit Form -->
                  <div *ngIf="editingProfile" class="space-y-3">
                    <div>
                      <label class="block text-xs font-medium text-icon-gray mb-1">Nombre Completo</label>
                      <input 
                        type="text"
                        [(ngModel)]="editProfileData.fullName"
                        class="w-full border border-card-border rounded-kinetic px-2 py-1 text-sm"
                        placeholder="Tu nombre completo">
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-icon-gray mb-1">Handle de Codeforces</label>
                      <input 
                        type="text"
                        [(ngModel)]="editProfileData.codeforcesHandle"
                        class="w-full border border-card-border rounded-kinetic px-2 py-1 text-sm"
                        placeholder="tu_handle">
                    </div>
                    <div class="flex gap-2">
                      <button 
                        (click)="saveProfile()"
                        [disabled]="savingProfile"
                        class="flex-1 bg-electric-blue hover:opacity-90 text-deep-sea px-3 py-1 rounded-kinetic text-sm disabled:bg-gray-300">
                        {{ savingProfile ? 'Guardando...' : 'Guardar' }}
                      </button>
                      <button 
                        (click)="cancelEditProfile()"
                        class="bg-icon-gray hover:opacity-90 text-white px-3 py-1 rounded-kinetic text-sm">
                        Cancelar
                      </button>
                    </div>
                    <p *ngIf="profileError" class="text-red-500 text-xs">{{ profileError }}</p>
                    <p *ngIf="profileSuccess" class="text-electric-blue text-xs">{{ profileSuccess }}</p>
                  </div>
                </div>

                <!-- Links -->
                <div class="px-4 py-2">
                  <a 
                    routerLink="/statistics"
                    (click)="closeProfileDropdown()"
                    class="block text-deep-sea hover:text-electric-blue text-sm py-1">
                    📊 Ver Estadísticas y Logros
                  </a>
                </div>

                <!-- Logout -->
                <div class="px-4 py-2 border-t border-card-border">
                  <button
                    (click)="logout()"
                    class="w-full text-left text-red-500 hover:text-red-600 text-sm font-medium py-1">
                    🚪 Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="flex items-center md:hidden">
            <button
              (click)="toggleMobileMenu()"
              type="button"
              class="inline-flex items-center justify-center p-2 rounded-kinetic text-white opacity-80 hover:opacity-100 focus:outline-none"
              aria-controls="mobile-menu"
              [attr.aria-expanded]="mobileMenuOpen">
              <span class="sr-only">Open main menu</span>
              <!-- Hamburger icon -->
              <svg 
                *ngIf="!mobileMenuOpen"
                class="block h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <!-- Close icon -->
              <svg 
                *ngIf="mobileMenuOpen"
                class="block h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div 
        *ngIf="mobileMenuOpen" 
        class="md:hidden" 
        id="mobile-menu">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card-bg border-t border-card-border">
          <a 
            routerLink="/dashboard"
            (click)="closeMobileMenu()"
            routerLinkActive="bg-electric-blue/10 text-electric-blue font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="text-deep-sea hover:bg-card-bg hover:text-electric-blue block px-3 py-2 rounded-kinetic text-base font-medium">
            Dashboard
          </a>
          <a 
            routerLink="/themes"
            (click)="closeMobileMenu()"
            routerLinkActive="bg-electric-blue/10 text-electric-blue font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="text-deep-sea hover:bg-card-bg hover:text-electric-blue block px-3 py-2 rounded-kinetic text-base font-medium">
            Themes
          </a>
          <a 
            routerLink="/roadmap"
            (click)="closeMobileMenu()"
            routerLinkActive="bg-electric-blue/10 text-electric-blue font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="text-deep-sea hover:bg-card-bg hover:text-electric-blue block px-3 py-2 rounded-kinetic text-base font-medium">
            Roadmap
          </a>
          <a 
            routerLink="/problems"
            (click)="closeMobileMenu()"
            routerLinkActive="bg-electric-blue/10 text-electric-blue font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="text-deep-sea hover:bg-card-bg hover:text-electric-blue block px-3 py-2 rounded-kinetic text-base font-medium">
            Problems
          </a>
          <a 
            routerLink="/team"
            (click)="closeMobileMenu()"
            routerLinkActive="bg-electric-blue/10 text-electric-blue font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="text-deep-sea hover:bg-card-bg hover:text-electric-blue block px-3 py-2 rounded-kinetic text-base font-medium">
            Team
          </a>
          <a 
            *ngIf="currentUser?.role === 'admin'"
            routerLink="/admin"
            (click)="closeMobileMenu()"
            routerLinkActive="bg-electric-blue/10 text-electric-blue font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="text-deep-sea hover:bg-card-bg hover:text-electric-blue block px-3 py-2 rounded-kinetic text-base font-medium">
            Admin
          </a>
          
          <!-- Mobile Profile Section -->
          <div class="border-t border-card-border pt-4 pb-3">
            <div class="flex items-center px-3 mb-3">
              <div class="w-10 h-10 rounded-kinetic bg-electric-blue flex items-center justify-center text-deep-sea font-bold mr-3">
                {{ currentUser?.username?.charAt(0)?.toUpperCase() }}
              </div>
              <div>
                <div class="text-base font-bold text-deep-sea">{{ currentUser?.username }}</div>
                <div class="text-sm text-icon-gray">{{ currentUser?.email }}</div>
              </div>
            </div>
            
            <div class="px-3 space-y-2 text-sm mb-3">
              <div class="flex justify-between">
                <span class="text-icon-gray">Nombre:</span>
                <span class="text-deep-sea">{{ currentUser?.fullName || 'No especificado' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-icon-gray">Codeforces:</span>
                <span class="text-electric-blue">{{ currentUser?.codeforcesHandle || 'No vinculado' }}</span>
              </div>
            </div>

            <div class="mt-3 px-2 space-y-2">
              <a
                routerLink="/statistics"
                (click)="closeMobileMenu()"
                class="block w-full text-left bg-electric-blue hover:opacity-90 text-deep-sea px-3 py-2 rounded-kinetic text-base font-medium">
                📊 Estadísticas y Logros
              </a>
              <button
                (click)="logout()"
                class="block w-full text-left bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-kinetic text-base font-medium">
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <!-- Spacer to prevent content from being hidden under fixed navbar -->
    <div class="h-16"></div>
  `,
  styles: []
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  mobileMenuOpen = false;
  profileDropdownOpen = false;
  editingProfile = false;
  savingProfile = false;
  profileError: string | null = null;
  profileSuccess: string | null = null;
  editProfileData = {
    fullName: '',
    codeforcesHandle: ''
  };
  private destroy$ = new Subject<void>();
  private profileSuccessTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.profileSuccessTimeout) {
      clearTimeout(this.profileSuccessTimeout);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown-container')) {
      this.profileDropdownOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.profileDropdownOpen = false;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleProfileDropdown(): void {
    this.profileDropdownOpen = !this.profileDropdownOpen;
    if (!this.profileDropdownOpen) {
      this.editingProfile = false;
      this.profileError = null;
      this.profileSuccess = null;
    }
  }

  closeProfileDropdown(): void {
    this.profileDropdownOpen = false;
    this.editingProfile = false;
    this.profileError = null;
    this.profileSuccess = null;
  }

  startEditProfile(): void {
    this.editProfileData = {
      fullName: this.currentUser?.fullName || '',
      codeforcesHandle: this.currentUser?.codeforcesHandle || ''
    };
    this.editingProfile = true;
    this.profileError = null;
    this.profileSuccess = null;
  }

  cancelEditProfile(): void {
    this.editingProfile = false;
    this.profileError = null;
    this.profileSuccess = null;
  }

  saveProfile(): void {
    this.savingProfile = true;
    this.profileError = null;
    this.profileSuccess = null;
    
    // Clear any existing timeout
    if (this.profileSuccessTimeout) {
      clearTimeout(this.profileSuccessTimeout);
    }

    this.authService.updateProfile(this.editProfileData).subscribe({
      next: () => {
        this.savingProfile = false;
        this.profileSuccess = 'Perfil actualizado correctamente';
        this.profileSuccessTimeout = setTimeout(() => {
          this.editingProfile = false;
          this.profileSuccess = null;
        }, 1500);
      },
      error: (err) => {
        this.savingProfile = false;
        this.profileError = 'Error al actualizar el perfil';
        console.error('Error updating profile:', err);
      }
    });
  }

  logout(): void {
    this.closeMobileMenu();
    this.closeProfileDropdown();
    this.authService.logout();
  }
}
