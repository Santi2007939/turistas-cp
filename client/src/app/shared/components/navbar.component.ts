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
    <nav class="bg-white fixed top-0 left-0 right-0 z-50 border-b" style="border-color: #EAE3DB;">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <h1 class="text-2xl font-bold" style="color: #8B5E3C;">
              <svg class="inline-block w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3l4 8 5-5 5 15H2L8 3z"/>
              </svg>
              Turistas CP
            </h1>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-2">
            <a 
              routerLink="/dashboard" 
              routerLinkActive="font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style="color: #2D2622;"
              routerLinkActive="bg-caracal-badge">
              <svg class="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Dashboard
            </a>
            <a 
              routerLink="/themes" 
              routerLinkActive="font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style="color: #2D2622;"
              routerLinkActive="bg-caracal-badge">
              <svg class="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              Themes
            </a>
            <a 
              routerLink="/roadmap" 
              routerLinkActive="font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style="color: #2D2622;"
              routerLinkActive="bg-caracal-badge">
              <svg class="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/>
                <line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
              Roadmap
            </a>
            <a 
              routerLink="/problems" 
              routerLinkActive="font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style="color: #2D2622;"
              routerLinkActive="bg-caracal-badge">
              <svg class="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              Problems
            </a>
            <a 
              routerLink="/team" 
              routerLinkActive="font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style="color: #2D2622;"
              routerLinkActive="bg-caracal-badge">
              <svg class="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Team
            </a>
            <a 
              *ngIf="currentUser?.role === 'admin'"
              routerLink="/admin" 
              routerLinkActive="font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style="color: #2D2622;"
              routerLinkActive="bg-caracal-badge">
              <svg class="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Admin
            </a>
            
            <!-- Profile Dropdown -->
            <div class="relative profile-dropdown-container ml-2">
              <button
                (click)="toggleProfileDropdown()"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style="color: #2D2622;">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>{{ currentUser?.username }}</span>
                <svg class="w-4 h-4 transition-transform" [ngClass]="{'rotate-180': profileDropdownOpen}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              
              <!-- Dropdown Menu -->
              <div 
                *ngIf="profileDropdownOpen"
                class="absolute right-0 mt-2 w-80 bg-white rounded-2xl py-2 z-50 border"
                style="box-shadow: 0 4px 20px rgba(74, 59, 51, 0.1); border-color: #EAE3DB;">
                
                <!-- Profile Info Section -->
                <div class="px-5 py-4 border-b" style="border-color: #EAE3DB;">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style="background-color: #8B5E3C;">
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
                      <span *ngIf="!currentUser?.codeforcesHandle" style="color: #4A3B33;">No vinculado</span>
                    </div>
                    <div class="flex justify-between">
                      <span style="color: #4A3B33;">Rol:</span>
                      <span class="font-medium capitalize" style="color: #2D2622;">{{ currentUser?.role }}</span>
                    </div>
                  </div>
                </div>

                <!-- Edit Profile Button -->
                <div class="px-5 py-3 border-b" style="border-color: #EAE3DB;">
                  <button 
                    *ngIf="!editingProfile"
                    (click)="startEditProfile()"
                    class="w-full text-left text-sm font-medium py-1 flex items-center gap-2"
                    style="color: #8B5E3C;">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
                        class="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
                        style="border-color: #EAE3DB;"
                        placeholder="Tu nombre completo">
                    </div>
                    <div>
                      <label class="block text-xs font-medium mb-1" style="color: #4A3B33;">Handle de Codeforces</label>
                      <input 
                        type="text"
                        [(ngModel)]="editProfileData.codeforcesHandle"
                        class="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
                        style="border-color: #EAE3DB;"
                        placeholder="tu_handle">
                    </div>
                    <div class="flex gap-2">
                      <button 
                        (click)="saveProfile()"
                        [disabled]="savingProfile"
                        class="flex-1 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-50"
                        style="background-color: #8B5E3C;">
                        {{ savingProfile ? 'Guardando...' : 'Guardar' }}
                      </button>
                      <button 
                        (click)="cancelEditProfile()"
                        class="px-4 py-2 rounded-xl text-sm"
                        style="background-color: #F2E9E1; color: #4A3B33;">
                        Cancelar
                      </button>
                    </div>
                    <p *ngIf="profileError" class="text-red-500 text-xs">{{ profileError }}</p>
                    <p *ngIf="profileSuccess" class="text-green-600 text-xs">{{ profileSuccess }}</p>
                  </div>
                </div>

                <!-- Links -->
                <div class="px-5 py-3">
                  <a 
                    routerLink="/statistics"
                    (click)="closeProfileDropdown()"
                    class="flex items-center gap-2 text-sm py-2"
                    style="color: #2D2622;">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                    Ver Estadísticas y Logros
                  </a>
                </div>

                <!-- Logout -->
                <div class="px-5 py-3 border-t" style="border-color: #EAE3DB;">
                  <button
                    (click)="logout()"
                    class="w-full text-left text-sm font-medium py-1 flex items-center gap-2 text-red-600 hover:text-red-700">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
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
              class="inline-flex items-center justify-center p-2 rounded-xl transition-colors focus:outline-none focus:ring-2"
              style="color: #4A3B33;"
              aria-controls="mobile-menu"
              [attr.aria-expanded]="mobileMenuOpen">
              <span class="sr-only">Open main menu</span>
              <!-- Hamburger icon -->
              <svg 
                *ngIf="!mobileMenuOpen"
                class="block h-6 w-6" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <!-- Close icon -->
              <svg 
                *ngIf="mobileMenuOpen"
                class="block h-6 w-6" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
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
        <div class="px-4 pt-2 pb-4 space-y-1 bg-white border-t" style="border-color: #EAE3DB;">
          <a 
            routerLink="/dashboard"
            (click)="closeMobileMenu()"
            routerLinkActive="font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium"
            style="color: #2D2622;"
            routerLinkActive="bg-caracal-badge">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </a>
          <a 
            routerLink="/themes"
            (click)="closeMobileMenu()"
            routerLinkActive="font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium"
            style="color: #2D2622;"
            routerLinkActive="bg-caracal-badge">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            Themes
          </a>
          <a 
            routerLink="/roadmap"
            (click)="closeMobileMenu()"
            routerLinkActive="font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium"
            style="color: #2D2622;"
            routerLinkActive="bg-caracal-badge">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
            Roadmap
          </a>
          <a 
            routerLink="/problems"
            (click)="closeMobileMenu()"
            routerLinkActive="font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium"
            style="color: #2D2622;"
            routerLinkActive="bg-caracal-badge">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            Problems
          </a>
          <a 
            routerLink="/team"
            (click)="closeMobileMenu()"
            routerLinkActive="font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium"
            style="color: #2D2622;"
            routerLinkActive="bg-caracal-badge">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Team
          </a>
          <a 
            *ngIf="currentUser?.role === 'admin'"
            routerLink="/admin"
            (click)="closeMobileMenu()"
            routerLinkActive="font-semibold"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium"
            style="color: #2D2622;"
            routerLinkActive="bg-caracal-badge">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4A3B33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Admin
          </a>
          
          <!-- Mobile Profile Section -->
          <div class="border-t pt-4 pb-3 mt-4" style="border-color: #EAE3DB;">
            <div class="flex items-center px-4 mb-4">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3" style="background-color: #8B5E3C;">
                {{ currentUser?.username?.charAt(0)?.toUpperCase() }}
              </div>
              <div>
                <div class="text-base font-medium" style="color: #2D2622;">{{ currentUser?.username }}</div>
                <div class="text-sm" style="color: #4A3B33;">{{ currentUser?.email }}</div>
              </div>
            </div>
            
            <div class="px-4 space-y-2 text-sm mb-4">
              <div class="flex justify-between">
                <span style="color: #4A3B33;">Nombre:</span>
                <span style="color: #2D2622;">{{ currentUser?.fullName || 'No especificado' }}</span>
              </div>
              <div class="flex justify-between">
                <span style="color: #4A3B33;">Codeforces:</span>
                <span style="color: #8B5E3C;">{{ currentUser?.codeforcesHandle || 'No vinculado' }}</span>
              </div>
            </div>

            <div class="mt-4 px-4 space-y-2">
              <a
                routerLink="/statistics"
                (click)="closeMobileMenu()"
                class="flex items-center justify-center gap-2 w-full text-white px-4 py-3 rounded-xl text-base font-medium"
                style="background-color: #8B5E3C;">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Estadísticas y Logros
              </a>
              <button
                (click)="logout()"
                class="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl text-base font-medium">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
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
    .bg-caracal-badge {
      background-color: #F2E9E1;
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
