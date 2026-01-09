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
    <!-- Matte-Drift Navbar: Pure white with thin bottom border -->
    <nav class="bg-white fixed top-0 left-0 right-0 z-50" style="border-bottom: 1px solid #EAE3DB;">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex justify-between h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <h1 class="text-2xl font-semibold" style="color: #8B5E3C;">🏔️ Turistas CP</h1>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-6">
            <a 
              routerLink="/dashboard" 
              routerLinkActive="nav-active"
              [routerLinkActiveOptions]="{exact: false}"
              class="nav-link">
              <!-- Lucide Home icon -->
              <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </a>
            <a 
              routerLink="/themes" 
              routerLinkActive="nav-active"
              [routerLinkActiveOptions]="{exact: false}"
              class="nav-link">
              <!-- Lucide BookOpen icon -->
              <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Themes
            </a>
            <a 
              routerLink="/roadmap" 
              routerLinkActive="nav-active"
              [routerLinkActiveOptions]="{exact: false}"
              class="nav-link">
              <!-- Lucide Map icon -->
              <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Roadmap
            </a>
            <a 
              routerLink="/problems" 
              routerLinkActive="nav-active"
              [routerLinkActiveOptions]="{exact: false}"
              class="nav-link">
              <!-- Lucide Code icon -->
              <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Problems
            </a>
            <a 
              routerLink="/team" 
              routerLinkActive="nav-active"
              [routerLinkActiveOptions]="{exact: false}"
              class="nav-link">
              <!-- Lucide Users icon -->
              <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Team
            </a>
            <a 
              *ngIf="currentUser?.role === 'admin'"
              routerLink="/admin" 
              routerLinkActive="nav-active"
              [routerLinkActiveOptions]="{exact: false}"
              class="nav-link">
              <!-- Lucide Settings icon -->
              <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </a>
            
            <!-- Profile Dropdown -->
            <div class="relative profile-dropdown-container">
              <button
                (click)="toggleProfileDropdown()"
                class="nav-link">
                <!-- Lucide User icon -->
                <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{{ currentUser?.username }}</span>
                <svg class="w-4 h-4 transition-transform" [ngClass]="{'rotate-180': profileDropdownOpen}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown Menu -->
              <div 
                *ngIf="profileDropdownOpen"
                class="absolute right-0 mt-2 w-80 bg-white rounded-[12px] py-2 z-50"
                style="border: 1px solid #EAE3DB;">
                
                <!-- Profile Info Section -->
                <div class="px-6 py-4" style="border-bottom: 1px solid #EAE3DB;">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 rounded-[12px] flex items-center justify-center text-white text-xl font-bold" style="background-color: #8B5E3C;">
                      {{ currentUser?.username?.charAt(0)?.toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-semibold" style="color: #2D2622;">{{ currentUser?.username }}</p>
                      <p class="text-sm" style="color: #4A3B33;">{{ currentUser?.email }}</p>
                    </div>
                  </div>
                  
                  <!-- Profile Details -->
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span style="color: #4A3B33;">Nombre completo:</span>
                      <span class="font-medium" style="color: #2D2622;">{{ currentUser?.fullName || 'No especificado' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span style="color: #4A3B33;">Codeforces Handle:</span>
                      <span *ngIf="currentUser?.codeforcesHandle" class="font-medium" style="color: #8B5E3C;">
                        <a [href]="'https://codeforces.com/profile/' + currentUser?.codeforcesHandle" target="_blank" rel="noopener noreferrer" class="hover:underline">
                          {{ currentUser?.codeforcesHandle }}
                        </a>
                      </span>
                      <span *ngIf="!currentUser?.codeforcesHandle" style="color: #EAE3DB;">No vinculado</span>
                    </div>
                    <div class="flex justify-between">
                      <span style="color: #4A3B33;">Rol:</span>
                      <span class="font-medium capitalize" style="color: #2D2622;">{{ currentUser?.role }}</span>
                    </div>
                  </div>
                </div>

                <!-- Edit Profile Button -->
                <div class="px-6 py-3" style="border-bottom: 1px solid #EAE3DB;">
                  <button 
                    *ngIf="!editingProfile"
                    (click)="startEditProfile()"
                    class="w-full text-left text-sm font-medium py-1 flex items-center gap-2"
                    style="color: #8B5E3C;">
                    <!-- Lucide Edit icon -->
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Perfil
                  </button>
                  
                  <!-- Edit Form -->
                  <div *ngIf="editingProfile" class="space-y-3">
                    <div>
                      <label class="block text-xs font-medium mb-1" style="color: #4A3B33;">Nombre Completo</label>
                      <input 
                        type="text"
                        [(ngModel)]="editProfileData.fullName"
                        class="w-full px-3 py-2 text-sm rounded-[12px]"
                        style="border: 1px solid #EAE3DB; color: #2D2622;"
                        placeholder="Tu nombre completo">
                    </div>
                    <div>
                      <label class="block text-xs font-medium mb-1" style="color: #4A3B33;">Handle de Codeforces</label>
                      <input 
                        type="text"
                        [(ngModel)]="editProfileData.codeforcesHandle"
                        class="w-full px-3 py-2 text-sm rounded-[12px]"
                        style="border: 1px solid #EAE3DB; color: #2D2622;"
                        placeholder="tu_handle">
                    </div>
                    <div class="flex gap-2">
                      <button 
                        (click)="saveProfile()"
                        [disabled]="savingProfile"
                        class="flex-1 text-white px-3 py-2 rounded-[12px] text-sm font-medium disabled:opacity-50"
                        style="background-color: #8B5E3C;">
                        {{ savingProfile ? 'Guardando...' : 'Guardar' }}
                      </button>
                      <button 
                        (click)="cancelEditProfile()"
                        class="px-3 py-2 rounded-[12px] text-sm font-medium"
                        style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                        Cancelar
                      </button>
                    </div>
                    <p *ngIf="profileError" class="text-red-500 text-xs">{{ profileError }}</p>
                    <p *ngIf="profileSuccess" class="text-xs" style="color: #8B5E3C;">{{ profileSuccess }}</p>
                  </div>
                </div>

                <!-- Links -->
                <div class="px-6 py-3">
                  <a 
                    routerLink="/statistics"
                    (click)="closeProfileDropdown()"
                    class="flex items-center gap-2 text-sm py-1"
                    style="color: #2D2622;">
                    <!-- Lucide BarChart icon -->
                    <svg class="w-4 h-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Ver Estadísticas y Logros
                  </a>
                </div>

                <!-- Logout -->
                <div class="px-6 py-3" style="border-top: 1px solid #EAE3DB;">
                  <button
                    (click)="logout()"
                    class="w-full text-left text-sm font-medium py-1 flex items-center gap-2 text-red-600 hover:text-red-800">
                    <!-- Lucide LogOut icon -->
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
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
              class="inline-flex items-center justify-center p-2 rounded-[12px] transition-colors"
              style="color: #4A3B33;"
              aria-controls="mobile-menu"
              [attr.aria-expanded]="mobileMenuOpen">
              <span class="sr-only">Open main menu</span>
              <!-- Lucide Menu icon -->
              <svg 
                *ngIf="!mobileMenuOpen"
                class="block h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="1.5" 
                aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <!-- Lucide X icon -->
              <svg 
                *ngIf="mobileMenuOpen"
                class="block h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                stroke-width="1.5" 
                aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
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
        <div class="px-6 pt-4 pb-6 space-y-2 bg-white" style="border-top: 1px solid #EAE3DB;">
          <a 
            routerLink="/dashboard"
            (click)="closeMobileMenu()"
            routerLinkActive="mobile-nav-active"
            [routerLinkActiveOptions]="{exact: false}"
            class="mobile-nav-link">
            Dashboard
          </a>
          <a 
            routerLink="/themes"
            (click)="closeMobileMenu()"
            routerLinkActive="mobile-nav-active"
            [routerLinkActiveOptions]="{exact: false}"
            class="mobile-nav-link">
            Themes
          </a>
          <a 
            routerLink="/roadmap"
            (click)="closeMobileMenu()"
            routerLinkActive="mobile-nav-active"
            [routerLinkActiveOptions]="{exact: false}"
            class="mobile-nav-link">
            Roadmap
          </a>
          <a 
            routerLink="/problems"
            (click)="closeMobileMenu()"
            routerLinkActive="mobile-nav-active"
            [routerLinkActiveOptions]="{exact: false}"
            class="mobile-nav-link">
            Problems
          </a>
          <a 
            routerLink="/team"
            (click)="closeMobileMenu()"
            routerLinkActive="mobile-nav-active"
            [routerLinkActiveOptions]="{exact: false}"
            class="mobile-nav-link">
            Team
          </a>
          <a 
            *ngIf="currentUser?.role === 'admin'"
            routerLink="/admin"
            (click)="closeMobileMenu()"
            routerLinkActive="mobile-nav-active"
            [routerLinkActiveOptions]="{exact: false}"
            class="mobile-nav-link">
            Admin
          </a>
          
          <!-- Mobile Profile Section -->
          <div class="pt-4 pb-3" style="border-top: 1px solid #EAE3DB;">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-bold mr-3" style="background-color: #8B5E3C;">
                {{ currentUser?.username?.charAt(0)?.toUpperCase() }}
              </div>
              <div>
                <div class="text-base font-medium" style="color: #2D2622;">{{ currentUser?.username }}</div>
                <div class="text-sm" style="color: #4A3B33;">{{ currentUser?.email }}</div>
              </div>
            </div>
            
            <div class="space-y-2 text-sm mb-4">
              <div class="flex justify-between">
                <span style="color: #4A3B33;">Nombre:</span>
                <span style="color: #2D2622;">{{ currentUser?.fullName || 'No especificado' }}</span>
              </div>
              <div class="flex justify-between">
                <span style="color: #4A3B33;">Codeforces:</span>
                <span style="color: #8B5E3C;">{{ currentUser?.codeforcesHandle || 'No vinculado' }}</span>
              </div>
            </div>

            <div class="space-y-3">
              <a
                routerLink="/statistics"
                (click)="closeMobileMenu()"
                class="block w-full text-center text-white px-4 py-3 rounded-[12px] text-base font-medium"
                style="background-color: #8B5E3C;">
                Estadísticas y Logros
              </a>
              <button
                (click)="logout()"
                class="block w-full text-center px-4 py-3 rounded-[12px] text-base font-medium"
                style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <!-- Spacer to prevent content from being hidden under fixed navbar -->
    <div class="h-16"></div>
  `,
  styles: [`
    /* Matte-Drift Navigation Link Styles */
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #2D2622;
      transition: background-color 0.2s ease;
    }

    .nav-link:hover {
      background-color: #FCF9F5;
    }

    .nav-active {
      color: #8B5E3C !important;
      font-weight: 600;
    }

    .mobile-nav-link {
      display: block;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 500;
      color: #2D2622;
      transition: background-color 0.2s ease;
    }

    .mobile-nav-link:hover {
      background-color: #FCF9F5;
    }

    .mobile-nav-active {
      background-color: #FCF9F5 !important;
      color: #8B5E3C !important;
      font-weight: 600;
    }
  `]
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
