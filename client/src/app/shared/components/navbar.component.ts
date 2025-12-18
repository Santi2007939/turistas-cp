import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-blue-600">🏔️ Turistas CP</h1>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-4">
            <a 
              routerLink="/dashboard" 
              routerLinkActive="text-blue-600 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </a>
            <a 
              routerLink="/themes" 
              routerLinkActive="text-blue-600 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Themes
            </a>
            <a 
              routerLink="/roadmap" 
              routerLinkActive="text-blue-600 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Roadmap
            </a>
            <a 
              routerLink="/problems" 
              routerLinkActive="text-blue-600 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Problems
            </a>
            <a 
              *ngIf="currentUser?.role === 'admin'"
              routerLink="/admin" 
              routerLinkActive="text-blue-600 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Admin
            </a>
            <span class="text-gray-700">{{ currentUser?.username }}</span>
            <button
              (click)="logout()"
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Logout
            </button>
          </div>

          <!-- Mobile menu button -->
          <div class="flex items-center md:hidden">
            <button
              (click)="toggleMobileMenu()"
              type="button"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
          <a 
            routerLink="/dashboard"
            (click)="closeMobileMenu()"
            routerLinkActive="bg-blue-50 text-blue-600 font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="text-gray-700 hover:bg-gray-100 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
            Dashboard
          </a>
          <a 
            routerLink="/themes"
            (click)="closeMobileMenu()"
            routerLinkActive="bg-blue-50 text-blue-600 font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="text-gray-700 hover:bg-gray-100 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
            Themes
          </a>
          <a 
            routerLink="/roadmap"
            (click)="closeMobileMenu()"
            routerLinkActive="bg-blue-50 text-blue-600 font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="text-gray-700 hover:bg-gray-100 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
            Roadmap
          </a>
          <a 
            routerLink="/problems"
            (click)="closeMobileMenu()"
            routerLinkActive="bg-blue-50 text-blue-600 font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="text-gray-700 hover:bg-gray-100 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
            Problems
          </a>
          <a 
            *ngIf="currentUser?.role === 'admin'"
            routerLink="/admin"
            (click)="closeMobileMenu()"
            routerLinkActive="bg-blue-50 text-blue-600 font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="text-gray-700 hover:bg-gray-100 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
            Admin
          </a>
          <div class="border-t border-gray-200 pt-4 pb-3">
            <div class="flex items-center px-3">
              <div class="text-base font-medium text-gray-800">{{ currentUser?.username }}</div>
            </div>
            <div class="mt-3 px-2">
              <button
                (click)="logout()"
                class="block w-full text-left bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-base font-medium">
                Logout
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
  private destroy$ = new Subject<void>();

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
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  logout(): void {
    this.closeMobileMenu();
    this.authService.logout();
  }
}
