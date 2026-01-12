import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoadmapService, PersonalNode, Subtopic, CodeSnippet, Resource, LinkedProblem } from '../../core/services/roadmap.service';
import { ProblemsService, Problem } from '../../core/services/problems.service';
import { AuthService, User } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-subtopic-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>
      
      <div class="container mx-auto px-6 py-8">
        <!-- Header -->
        <div class="bg-white rounded-[12px] p-6 mb-6" style="border: 1px solid #EAE3DB;">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <button 
                routerLink="/roadmap"
                class="font-medium flex items-center gap-1"
                style="color: #4A3B33;">
                <!-- Lucide ArrowLeft icon -->
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
              <div>
                <h1 class="text-2xl font-semibold" style="color: #2D2622;">{{ node?.themeId?.name }}</h1>
                <p style="color: #4A3B33;">{{ node?.themeId?.description }}</p>
              </div>
            </div>
            <button 
              (click)="showAddSubtopicModal = true"
              class="text-white font-medium py-2 px-4 rounded-[12px] flex items-center gap-2"
              style="background-color: #8B5E3C;">
              <!-- Lucide Plus icon -->
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Agregar Subtema
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <!-- Lucide Loader icon -->
          <svg class="w-12 h-12 mx-auto mb-4 animate-spin" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p style="color: #4A3B33;">Cargando...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-white rounded-[12px] p-6 mb-6" style="border-left: 4px solid #8B5E3C; border-right: 1px solid #EAE3DB; border-top: 1px solid #EAE3DB; border-bottom: 1px solid #EAE3DB;">
          <div class="flex items-start">
            <!-- Lucide AlertTriangle icon -->
            <svg class="w-6 h-6 mr-3" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 class="font-semibold" style="color: #2D2622;">Error</h3>
              <p class="mt-1" style="color: #4A3B33;">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Subtopics List -->
        <div *ngIf="!loading && node" class="space-y-6">
          <div *ngFor="let subtopic of node.subtopics; let i = index" 
               class="bg-white rounded-[12px] p-6" style="border: 1px solid #EAE3DB;">
            <!-- Subtopic Header -->
            <div class="flex items-start justify-between mb-4 pb-4" style="border-bottom: 1px solid #EAE3DB;">
              <div class="flex-1">
                <h3 class="text-xl font-semibold mb-2" style="color: #2D2622;">{{ subtopic.name }}</h3>
                <p style="color: #4A3B33;">{{ subtopic.description }}</p>
              </div>
              <div class="flex gap-2">
                <button 
                  (click)="editSubtopic(subtopic)"
                  class="text-white px-3 py-1 rounded-[12px] text-sm font-medium flex items-center gap-1"
                  style="background-color: #D4A373;">
                  <!-- Lucide Edit icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  (click)="deleteSubtopic(subtopic._id || '')"
                  class="px-3 py-1 rounded-[12px] text-sm font-medium flex items-center gap-1"
                  style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #4A3B33;">
                  <!-- Lucide Trash2 icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Tabs -->
            <div class="mb-4" style="border-bottom: 1px solid #EAE3DB;">
              <div class="flex gap-2 overflow-x-auto">
                <button 
                  *ngFor="let tab of tabs"
                  (click)="activeTab[subtopic._id || i] = tab.id"
                  class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                  [ngStyle]="{
                    'border-bottom-color': activeTab[subtopic._id || i] === tab.id ? '#8B5E3C' : 'transparent',
                    'color': activeTab[subtopic._id || i] === tab.id ? '#8B5E3C' : '#4A3B33'
                  }">
                  {{ tab.icon }} {{ tab.label }}
                </button>
              </div>
            </div>

            <!-- Tab Content -->
            <div class="mt-4">
              <!-- Personal Notes -->
              <div *ngIf="activeTab[subtopic._id || i] === 'personal'">
                <div class="rounded-[12px] p-4 mb-4" style="background-color: #FCF9F5; border-left: 4px solid #D4A373;">
                  <p class="text-sm" style="color: #4A3B33;">
                    🔒 Estas notas son privadas y solo tú puedes verlas
                  </p>
                </div>
                <textarea 
                  [(ngModel)]="subtopic.personalNotes"
                  (blur)="saveSubtopic(subtopic)"
                  rows="8"
                  placeholder="Agrega tus notas personales aquí..."
                  class="w-full rounded-[12px] px-4 py-3 transition-all resize-none"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
                </textarea>
              </div>

              <!-- Shared Theory -->
              <div *ngIf="activeTab[subtopic._id || i] === 'theory'">
                <div class="rounded-[12px] p-4 mb-4" style="background-color: #FCF9F5; border-left: 4px solid #8B5E3C;">
                  <p class="text-sm" style="color: #4A3B33;">
                    🌐 Esta sección es editable por todos los miembros del equipo
                  </p>
                </div>
                <textarea 
                  [(ngModel)]="subtopic.sharedTheory"
                  (blur)="saveSubtopic(subtopic)"
                  rows="10"
                  placeholder="Agrega teoría y conceptos compartidos..."
                  class="w-full rounded-[12px] px-4 py-3 transition-all resize-none"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
                </textarea>
              </div>

              <!-- Code Editor -->
              <div *ngIf="activeTab[subtopic._id || i] === 'code'">
                <div class="space-y-4">
                  <div *ngFor="let snippet of subtopic.codeSnippets; let j = index" 
                       class="rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                    <div class="flex items-center justify-between mb-3">
                      <select 
                        [(ngModel)]="snippet.language"
                        (change)="saveSubtopic(subtopic)"
                        class="rounded-[12px] px-3 py-1 text-sm"
                        style="border: 1px solid #EAE3DB; color: #2D2622;">
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                      </select>
                      <button 
                        (click)="removeCodeSnippet(subtopic, j)"
                        class="text-sm flex items-center gap-1"
                        style="color: #4A3B33;">
                        <!-- Lucide Trash2 icon -->
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                    <input 
                      type="text"
                      [(ngModel)]="snippet.description"
                      (blur)="saveSubtopic(subtopic)"
                      placeholder="Descripción del código..."
                      class="w-full rounded-[12px] px-3 py-2 mb-2 text-sm"
                      style="border: 1px solid #EAE3DB; color: #2D2622;">
                    <pre class="rounded-[12px] p-4 overflow-x-auto" style="background-color: #2D2622;"><code><textarea 
                      [(ngModel)]="snippet.code"
                      (blur)="saveSubtopic(subtopic)"
                      rows="12"
                      placeholder="// Escribe tu código aquí..."
                      class="w-full bg-transparent font-mono text-sm border-0 focus:outline-none resize-none"
                      style="color: #D4A373;">
</textarea></code></pre>
                  </div>
                  <button 
                    (click)="addCodeSnippet(subtopic)"
                    class="w-full border-2 border-dashed rounded-[12px] py-3 transition-colors flex items-center justify-center gap-2"
                    style="border-color: #EAE3DB; color: #4A3B33;">
                    <!-- Lucide Plus icon -->
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar fragmento de código
                  </button>
                </div>
              </div>

              <!-- Problems -->
              <div *ngIf="activeTab[subtopic._id || i] === 'problems'">
                <div class="rounded-[12px] p-4 mb-4 flex items-center justify-between" style="background-color: #FCF9F5; border-left: 4px solid #8B5E3C;">
                  <p class="text-sm" style="color: #4A3B33;">
                    💻 Problemas vinculados a este subtema
                  </p>
                  <button 
                    (click)="navigateToFilteredProblems(subtopic)"
                    class="text-white px-3 py-1 rounded-[12px] text-xs flex items-center gap-1 font-medium"
                    style="background-color: #8B5E3C;">
                    Ver todos →
                  </button>
                </div>
                <div class="space-y-3">
                  <!-- Problem Cards -->
                  <div *ngFor="let problem of subtopic.linkedProblems" 
                       class="border-l-4 rounded-[12px] p-4 bg-white transition-shadow hover:shadow-md"
                       [ngStyle]="{
                         'border-left-color': problem.difficulty === 'easy' ? '#D4A373' : problem.difficulty === 'medium' ? '#8B5E3C' : problem.difficulty === 'hard' ? '#4A3B33' : '#2D2622',
                         'border-right': '1px solid #EAE3DB',
                         'border-top': '1px solid #EAE3DB',
                         'border-bottom': '1px solid #EAE3DB'
                       }">
                    <!-- Problem Header -->
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex-1">
                        <h4 class="font-semibold mb-1" style="color: #2D2622;">{{ problem.title }}</h4>
                        <p *ngIf="problem.description" class="text-sm mb-2" style="color: #4A3B33;">
                          {{ problem.description }}
                        </p>
                      </div>
                      <button 
                        (click)="removeProblemFromSubtopic(subtopic, problem)"
                        class="text-sm ml-2"
                        style="color: #4A3B33;">
                        <!-- Lucide X icon -->
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <!-- Problem Footer -->
                    <div class="flex items-center justify-between">
                      <span 
                        class="text-xs px-2 py-1 rounded-[12px] font-medium"
                        style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #8B5E3C;">
                        {{ getDifficultyLabel(problem.difficulty) }}
                      </span>
                      
                      <div class="flex gap-2">
                        <a 
                          *ngIf="problem.link"
                          [href]="problem.link" 
                          target="_blank"
                          class="text-xs flex items-center gap-1"
                          style="color: #8B5E3C;">
                          <!-- Lucide ExternalLink icon -->
                          <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Abrir
                        </a>
                        <a 
                          [routerLink]="['/problems', problem.problemId]"
                          class="text-xs"
                          style="color: #8B5E3C;">
                          Ver detalles
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Add Problem Button -->
                  <button 
                    (click)="openProblemPicker(subtopic)"
                    class="w-full border-2 border-dashed rounded-[12px] py-3 transition-colors"
                    style="border-color: #EAE3DB; color: #4A3B33;">
                    ➕ Vincular problema
                  </button>
                  
                  <!-- Empty State -->
                  <div *ngIf="!subtopic.linkedProblems || subtopic.linkedProblems.length === 0"
                       class="text-center py-8" style="color: #4A3B33;">
                    <div class="text-4xl mb-2">📝</div>
                    <p class="text-sm">No hay problemas vinculados</p>
                    <p class="text-xs mt-1">Haz clic en "Vincular problema" para agregar</p>
                  </div>
                </div>
              </div>

              <!-- Resources -->
              <div *ngIf="activeTab[subtopic._id || i] === 'resources'">
                <div class="rounded-[12px] p-4 mb-4" style="background-color: #FCF9F5; border-left: 4px solid #D4A373;">
                  <p class="text-sm" style="color: #4A3B33;">
                    📚 Recursos de aprendizaje editables por todos
                  </p>
                </div>
                <div class="space-y-3">
                  <div *ngFor="let resource of subtopic.resources; let k = index" 
                       class="rounded-[12px] p-4" style="border: 1px solid #EAE3DB;">
                    <div class="flex items-start gap-3">
                      <div class="flex-1 space-y-2">
                        <input 
                          type="text"
                          [(ngModel)]="resource.name"
                          (blur)="saveSubtopic(subtopic)"
                          placeholder="Nombre del recurso"
                          class="w-full rounded-[12px] px-3 py-2 text-sm"
                          style="border: 1px solid #EAE3DB; color: #2D2622;">
                        <input 
                          type="url"
                          [(ngModel)]="resource.link"
                          (blur)="saveSubtopic(subtopic)"
                          placeholder="https://..."
                          class="w-full rounded-[12px] px-3 py-2 text-sm"
                          style="border: 1px solid #EAE3DB; color: #2D2622;">
                      </div>
                      <button 
                        (click)="removeResource(subtopic, k)"
                        class="text-sm mt-2"
                        style="color: #4A3B33;">
                        <!-- Lucide X icon -->
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <a *ngIf="resource.link" 
                       [href]="resource.link" 
                       target="_blank"
                       class="text-xs mt-2 inline-flex items-center gap-1"
                       style="color: #8B5E3C;">
                      <!-- Lucide ExternalLink icon -->
                      <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Abrir enlace
                    </a>
                  </div>
                  <button 
                    (click)="addResource(subtopic)"
                    class="w-full border-2 border-dashed rounded-[12px] py-3 transition-colors flex items-center justify-center gap-2"
                    style="border-color: #EAE3DB; color: #4A3B33;">
                    <!-- Lucide Plus icon -->
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar recurso
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!node.subtopics || node.subtopics.length === 0" 
               class="bg-white rounded-[12px] p-12 text-center" style="border: 1px solid #EAE3DB;">
            <!-- Lucide FileText icon -->
            <svg class="w-16 h-16 mx-auto mb-4" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="text-2xl font-semibold mb-3" style="color: #2D2622;">No hay subtemas</h3>
            <p class="mb-6" style="color: #4A3B33;">
              Agrega subtemas para organizar tu contenido de aprendizaje
            </p>
            <button 
              (click)="showAddSubtopicModal = true"
              class="text-white font-medium py-3 px-8 rounded-[12px] flex items-center justify-center gap-2 mx-auto"
              style="background-color: #8B5E3C;">
              <!-- Lucide Plus icon -->
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Agregar primer subtema
            </button>
          </div>
        </div>
      </div>

      <!-- Add Subtopic Modal -->
      <div 
        *ngIf="showAddSubtopicModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="showAddSubtopicModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-lg" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: #2D2622;">
            <!-- Lucide Plus icon -->
            <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Subtema
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Nombre</label>
              <input 
                type="text"
                [(ngModel)]="newSubtopic.name"
                placeholder="Nombre del subtema"
                class="w-full rounded-[12px] px-4 py-3 transition-all"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Descripción</label>
              <textarea 
                [(ngModel)]="newSubtopic.description"
                rows="3"
                placeholder="Descripción breve"
                class="w-full rounded-[12px] px-4 py-3 transition-all resize-none"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
              </textarea>
            </div>
          </div>

          <div class="flex gap-3 justify-end mt-6">
            <button 
              (click)="showAddSubtopicModal = false"
              class="font-medium px-6 py-3 rounded-[12px] transition-all"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancelar
            </button>
            <button 
              (click)="createSubtopic()"
              [disabled]="!newSubtopic.name"
              class="text-white font-medium px-6 py-3 rounded-[12px] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              style="background-color: #8B5E3C;">
              <!-- Lucide Save icon -->
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Crear subtema
            </button>
          </div>
        </div>
      </div>

      <!-- Problem Picker Modal -->
      <div 
        *ngIf="showProblemPickerModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="closeProblemPicker()">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: #2D2622;">
            <!-- Lucide Link icon -->
            <svg class="w-5 h-5" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Vincular Problema
          </h3>
          
          <!-- Search and Filter -->
          <div class="mb-6 space-y-3">
            <div class="relative">
              <!-- Lucide Search icon -->
              <svg class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text"
                [(ngModel)]="problemSearchQuery"
                (ngModelChange)="filterProblems()"
                placeholder="Buscar problemas..."
                class="w-full rounded-[12px] pl-10 pr-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
            </div>
            
            <div class="flex gap-3">
              <select 
                [(ngModel)]="problemFilterDifficulty"
                (change)="filterProblems()"
                class="rounded-[12px] px-4 py-2"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
                <option value="">Todas las dificultades</option>
                <option value="easy">Fácil</option>
                <option value="medium">Media</option>
                <option value="hard">Difícil</option>
                <option value="very-hard">Muy Difícil</option>
              </select>
              
              <select 
                [(ngModel)]="problemFilterView"
                (change)="loadAvailableProblems()"
                class="rounded-[12px] px-4 py-2"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
                <option value="personal">Mis problemas</option>
                <option value="team">Problemas del equipo</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loadingProblems" class="text-center py-8">
            <!-- Lucide Loader icon -->
            <svg class="w-12 h-12 mx-auto mb-4 animate-spin" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p style="color: #4A3B33;">Cargando problemas...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="problemPickerError" class="rounded-[12px] p-4 mb-4" style="background-color: #FCF9F5; border-left: 4px solid #8B5E3C;">
            <p style="color: #8B5E3C;">{{ problemPickerError }}</p>
          </div>

          <!-- Available Problems List -->
          <div *ngIf="!loadingProblems" class="space-y-3 mb-6 max-h-96 overflow-y-auto">
            <div 
              *ngFor="let problem of filteredProblems" 
              (click)="selectProblemForLinking(problem)"
              class="rounded-[12px] p-4 cursor-pointer transition-all"
              [ngStyle]="{
                'border': selectedProblemForLink?._id === problem._id ? '2px solid #8B5E3C' : '1px solid #EAE3DB',
                'background-color': selectedProblemForLink?._id === problem._id ? '#FCF9F5' : '#FFFFFF'
              }">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold mb-1" style="color: #2D2622;">{{ problem.title }}</h4>
                  <div class="flex gap-2 items-center">
                    <span 
                      *ngIf="problem.rating"
                      class="text-xs px-2 py-1 rounded-[12px] font-mono flex items-center gap-1"
                      style="background-color: #FCF9F5; color: #8B5E3C; border: 1px solid #EAE3DB;">
                      <!-- Lucide Gauge icon for rating -->
                      <svg class="w-3 h-3" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" />
                      </svg>
                      {{ problem.rating }}
                    </span>
                    <span class="text-xs px-2 py-1 rounded-[12px]"
                          style="background-color: #FCF9F5; color: #4A3B33; border: 1px solid #EAE3DB;">
                      {{ problem.platform }}
                    </span>
                  </div>
                </div>
                <div 
                  *ngIf="selectedProblemForLink?._id === problem._id"
                  class="text-2xl"
                  style="color: #8B5E3C;">
                  ✓
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="filteredProblems.length === 0" class="text-center py-8" style="color: #4A3B33;">
              <div class="text-4xl mb-2">🔍</div>
              <p class="text-sm">No se encontraron problemas</p>
            </div>
          </div>

          <!-- Problem Metadata Form (shown when problem selected) -->
          <div *ngIf="selectedProblemForLink" class="rounded-[12px] p-6 mb-6" style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
            <h4 class="font-semibold mb-4" style="color: #2D2622;">Detalles del problema a vincular</h4>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Título *</label>
                <input 
                  type="text"
                  [(ngModel)]="problemLinkMetadata.title"
                  class="w-full rounded-[12px] px-4 py-2"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Descripción breve</label>
                <textarea 
                  [(ngModel)]="problemLinkMetadata.description"
                  rows="2"
                  placeholder="Descripción opcional del problema..."
                  class="w-full rounded-[12px] px-4 py-2 resize-none"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
                </textarea>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Link</label>
                <input 
                  type="url"
                  [(ngModel)]="problemLinkMetadata.link"
                  class="w-full rounded-[12px] px-4 py-2"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" style="color: #2D2622;">Dificultad *</label>
                <select 
                  [(ngModel)]="problemLinkMetadata.difficulty"
                  class="w-full rounded-[12px] px-4 py-2"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
                  <option value="easy">Fácil</option>
                  <option value="medium">Media</option>
                  <option value="hard">Difícil</option>
                  <option value="very-hard">Muy Difícil</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 justify-end">
            <button 
              (click)="closeProblemPicker()"
              class="font-medium px-6 py-3 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancelar
            </button>
            <button 
              (click)="confirmProblemLink()"
              [disabled]="!selectedProblemForLink || !problemLinkMetadata.title || !problemLinkMetadata.difficulty"
              class="text-white font-medium px-6 py-3 rounded-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
              style="background-color: #8B5E3C;">
              Vincular problema
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SubtopicDetailComponent implements OnInit {
  tabs = [
    { id: 'personal', label: 'Notas Personales', icon: '🔒' },
    { id: 'theory', label: 'Teoría Compartida', icon: '📖' },
    { id: 'code', label: 'Código', icon: '💻' },
    { id: 'problems', label: 'Problemas', icon: '🎯' },
    { id: 'resources', label: 'Recursos', icon: '📚' }
  ];

  node: PersonalNode | null = null;
  nodeId: string = '';
  loading = false;
  error: string | null = null;
  activeTab: { [key: string]: string } = {};
  showAddSubtopicModal = false;
  
  newSubtopic: Subtopic = {
    name: '',
    description: '',
    personalNotes: '',
    sharedTheory: '',
    codeSnippets: [],
    linkedProblems: [],
    resources: []
  };

  // Problem picker modal state
  showProblemPickerModal = false;
  currentSubtopicForProblem: Subtopic | null = null;
  availableProblems: Problem[] = [];
  filteredProblems: Problem[] = [];
  selectedProblemForLink: Problem | null = null;
  loadingProblems = false;
  problemPickerError: string | null = null;
  problemSearchQuery = '';
  problemFilterDifficulty = '';
  problemFilterView: 'personal' | 'team' = 'personal';
  currentUser: User | null = null;
  
  problemLinkMetadata: {
    title: string;
    description: string;
    link: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  } = {
    title: '',
    description: '',
    link: '',
    difficulty: 'medium'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roadmapService: RoadmapService,
    private problemsService: ProblemsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.route.params.subscribe(params => {
      this.nodeId = params['id'];
      if (this.nodeId) {
        this.loadNode();
      }
    });
  }

  loadNode(): void {
    this.loading = true;
    this.error = null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    
    this.roadmapService.getPersonalRoadmap(user.id).subscribe({
      next: (response) => {
        this.node = response.data.roadmap.find(n => n._id === this.nodeId) || null;
        
        // Initialize active tabs
        if (this.node?.subtopics) {
          this.node.subtopics.forEach((subtopic, index) => {
            const key = subtopic._id || index;
            this.activeTab[key] = 'personal';
          });
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar el tema.';
        this.loading = false;
        console.error('Error loading node:', err);
      }
    });
  }

  createSubtopic(): void {
    if (!this.newSubtopic.name || !this.nodeId) return;

    this.roadmapService.addSubtopic(this.nodeId, this.newSubtopic).subscribe({
      next: () => {
        this.showAddSubtopicModal = false;
        this.newSubtopic = {
          name: '',
          description: '',
          personalNotes: '',
          sharedTheory: '',
          codeSnippets: [],
          linkedProblems: [],
          resources: []
        };
        this.loadNode();
      },
      error: (err) => {
        this.error = 'No se pudo crear el subtema.';
        console.error('Error creating subtopic:', err);
      }
    });
  }

  editSubtopic(subtopic: Subtopic): void {
    // Set the subtopic as the one being edited
    this.newSubtopic = {
      name: subtopic.name,
      description: subtopic.description || '',
      personalNotes: subtopic.personalNotes,
      sharedTheory: subtopic.sharedTheory,
      codeSnippets: subtopic.codeSnippets,
      linkedProblems: subtopic.linkedProblems,
      resources: subtopic.resources
    };
    this.showAddSubtopicModal = true;
  }

  saveSubtopic(subtopic: Subtopic): void {
    if (!subtopic._id || !this.nodeId) return;

    this.roadmapService.updateSubtopic(this.nodeId, subtopic._id, subtopic).subscribe({
      error: (err) => {
        this.error = 'No se pudo guardar los cambios.';
        console.error('Error saving subtopic:', err);
      }
    });
  }

  deleteSubtopic(subtopicId: string): void {
    if (!confirm('¿Estás seguro de eliminar este subtema?')) return;

    this.roadmapService.deleteSubtopic(this.nodeId, subtopicId).subscribe({
      next: () => {
        this.loadNode();
      },
      error: (err) => {
        this.error = 'No se pudo eliminar el subtema.';
        console.error('Error deleting subtopic:', err);
      }
    });
  }

  addCodeSnippet(subtopic: Subtopic): void {
    if (!subtopic.codeSnippets) {
      subtopic.codeSnippets = [];
    }
    subtopic.codeSnippets.push({
      language: 'python',
      code: '',
      description: ''
    });
    this.saveSubtopic(subtopic);
  }

  removeCodeSnippet(subtopic: Subtopic, index: number): void {
    if (subtopic.codeSnippets) {
      subtopic.codeSnippets.splice(index, 1);
      this.saveSubtopic(subtopic);
    }
  }

  addResource(subtopic: Subtopic): void {
    if (!subtopic.resources) {
      subtopic.resources = [];
    }
    subtopic.resources.push({
      name: '',
      link: ''
    });
    this.saveSubtopic(subtopic);
  }

  removeResource(subtopic: Subtopic, index: number): void {
    if (subtopic.resources) {
      subtopic.resources.splice(index, 1);
      this.saveSubtopic(subtopic);
    }
  }

  // Problem linking methods
  openProblemPicker(subtopic: Subtopic): void {
    this.currentSubtopicForProblem = subtopic;
    this.showProblemPickerModal = true;
    this.problemPickerError = null;
    this.selectedProblemForLink = null;
    this.problemSearchQuery = '';
    this.problemFilterDifficulty = '';
    this.resetProblemMetadata();
    this.loadAvailableProblems();
  }

  closeProblemPicker(): void {
    this.showProblemPickerModal = false;
    this.currentSubtopicForProblem = null;
    this.selectedProblemForLink = null;
    this.availableProblems = [];
    this.filteredProblems = [];
    this.resetProblemMetadata();
  }

  loadAvailableProblems(): void {
    if (!this.currentUser) return;

    this.loadingProblems = true;
    this.problemPickerError = null;

    const userId = this.currentUser.id;
    const observable = this.problemFilterView === 'personal'
      ? this.problemsService.getPersonalProblems(userId)
      : this.problemsService.getTeamProblems();

    observable.subscribe({
      next: (response) => {
        this.availableProblems = response.data.problems;
        this.filterProblems();
        this.loadingProblems = false;
      },
      error: (err) => {
        this.problemPickerError = 'Error al cargar problemas.';
        this.loadingProblems = false;
        console.error('Error loading problems:', err);
      }
    });
  }

  filterProblems(): void {
    let filtered = [...this.availableProblems];

    // Filter by search query
    if (this.problemSearchQuery.trim()) {
      const query = this.problemSearchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.platform.toLowerCase().includes(query)
      );
    }

    // Filter by difficulty (if we add difficulty to Problem model in the future)
    // For now, filter by rating ranges that correspond to difficulties
    if (this.problemFilterDifficulty) {
      const difficultyRanges: { [key: string]: [number, number] } = {
        'easy': [0, 1400],
        'medium': [1400, 1900],
        'hard': [1900, 2400],
        'very-hard': [2400, 5000]
      };
      
      const [min, max] = difficultyRanges[this.problemFilterDifficulty] || [0, 5000];
      filtered = filtered.filter(p => {
        if (!p.rating) return false;
        return p.rating >= min && p.rating < max;
      });
    }

    // Filter out already linked problems
    const linkedProblemIds = this.currentSubtopicForProblem?.linkedProblems?.map(lp => lp.problemId) || [];
    filtered = filtered.filter(p => !linkedProblemIds.includes(p._id));

    this.filteredProblems = filtered;
  }

  selectProblemForLinking(problem: Problem): void {
    this.selectedProblemForLink = problem;
    
    // Pre-fill metadata from problem
    this.problemLinkMetadata = {
      title: problem.title,
      description: '',
      link: problem.url || '',
      difficulty: this.getDifficultyFromRating(problem.rating)
    };
  }

  getDifficultyFromRating(rating?: number): 'easy' | 'medium' | 'hard' | 'very-hard' {
    if (!rating) return 'medium';
    if (rating < 1400) return 'easy';
    if (rating < 1900) return 'medium';
    if (rating < 2400) return 'hard';
    return 'very-hard';
  }

  resetProblemMetadata(): void {
    this.problemLinkMetadata = {
      title: '',
      description: '',
      link: '',
      difficulty: 'medium'
    };
  }

  confirmProblemLink(): void {
    if (!this.selectedProblemForLink || !this.currentSubtopicForProblem) return;
    if (!this.problemLinkMetadata.title || !this.problemLinkMetadata.difficulty) return;

    // Check for duplicates
    const alreadyLinked = this.currentSubtopicForProblem.linkedProblems?.some(
      lp => lp.problemId === this.selectedProblemForLink!._id
    );
    
    if (alreadyLinked) {
      this.problemPickerError = 'Este problema ya está vinculado a este subtema.';
      return;
    }

    // Create linked problem object
    const linkedProblem: LinkedProblem = {
      problemId: this.selectedProblemForLink._id,
      title: this.problemLinkMetadata.title,
      description: this.problemLinkMetadata.description,
      link: this.problemLinkMetadata.link,
      difficulty: this.problemLinkMetadata.difficulty
    };

    // Add to subtopic
    if (!this.currentSubtopicForProblem.linkedProblems) {
      this.currentSubtopicForProblem.linkedProblems = [];
    }
    this.currentSubtopicForProblem.linkedProblems.push(linkedProblem);

    // Save subtopic
    this.saveSubtopic(this.currentSubtopicForProblem);

    // Close modal
    this.closeProblemPicker();
  }

  removeProblemFromSubtopic(subtopic: Subtopic, problem: LinkedProblem): void {
    if (!confirm('¿Estás seguro de desvincular este problema?')) return;

    if (subtopic.linkedProblems) {
      const index = subtopic.linkedProblems.findIndex(lp => lp.problemId === problem.problemId);
      if (index > -1) {
        subtopic.linkedProblems.splice(index, 1);
        this.saveSubtopic(subtopic);
      }
    }
  }

  getDifficultyLabel(difficulty: string): string {
    const labels: { [key: string]: string } = {
      'easy': 'Fácil',
      'medium': 'Media',
      'hard': 'Difícil',
      'very-hard': 'Muy Difícil'
    };
    return labels[difficulty] || difficulty;
  }

  navigateToFilteredProblems(subtopic: Subtopic): void {
    // Navigate to problems library with subtopic filter
    const subtopicId = subtopic._id;
    if (subtopicId) {
      this.router.navigate(['/problems'], {
        queryParams: { subtopic: subtopicId }
      });
    }
  }
}
