import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CalendarService, CalendarEvent } from '../../core/services/calendar.service';
import { AuthService, User } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar.component';

interface EventFormData {
  title: string;
  description: string;
  type: 'contest' | 'practice' | 'training' | 'meeting' | 'deadline' | 'roadmap' | 'problem' | 'clase_gpc' | 'rpc' | 'other';
  eventScope: 'personal' | 'team' | 'public';
  startTime: string;
  endTime: string;
  isPublic: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
}

interface FilterData {
  type: string;
  scope: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <!-- Matte-Drift Calendar -->
    <div class="min-h-screen" style="background-color: #FCF9F5;">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 px-6">
        <div class="py-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold flex items-center gap-2" style="color: #2D2622;">
              <!-- Lucide Calendar icon -->
              <svg class="w-6 h-6" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendario
            </h2>
            <div class="flex gap-2">
              <!-- View Toggle -->
              <div class="flex bg-white rounded-[12px] overflow-hidden" style="border: 1px solid #EAE3DB;">
                <button 
                  (click)="viewMode = 'list'"
                  class="px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1"
                  [ngStyle]="{
                    'background-color': viewMode === 'list' ? '#8B5E3C' : '#FFFFFF',
                    'color': viewMode === 'list' ? '#FFFFFF' : '#2D2622'
                  }">
                  <!-- Lucide List icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                  Lista
                </button>
                <button 
                  (click)="viewMode = 'calendar'"
                  class="px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1"
                  [ngStyle]="{
                    'background-color': viewMode === 'calendar' ? '#8B5E3C' : '#FFFFFF',
                    'color': viewMode === 'calendar' ? '#FFFFFF' : '#2D2622'
                  }">
                  <!-- Lucide CalendarDays icon -->
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendario
                </button>
              </div>
              <button 
                (click)="showCreateModal = true"
                class="text-white px-4 py-2 rounded-[12px] font-medium"
                style="background-color: #8B5E3C;">
                Agregar evento
              </button>
            </div>
          </div>

          <!-- Filters Section -->
          <div class="bg-white rounded-[12px] p-4 mb-6" style="border: 1px solid #EAE3DB;">
            <div class="flex flex-wrap gap-4 items-end">
              <div>
                <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Tipo</label>
                <select 
                  [(ngModel)]="filters.type"
                  (ngModelChange)="applyFilters()"
                  class="rounded-[12px] px-3 py-2 text-sm"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
                  <option value="">Todos los tipos</option>
                  <option value="contest">Concurso</option>
                  <option value="practice">Práctica</option>
                  <option value="training">Entrenamiento</option>
                  <option value="meeting">Reunión</option>
                  <option value="deadline">Fecha límite</option>
                  <option value="clase_gpc">Clase GPC</option>
                  <option value="rpc">RPC</option>
                  <option value="roadmap">Roadmap</option>
                  <option value="problem">Problema</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Ámbito</label>
                <select 
                  [(ngModel)]="filters.scope"
                  (ngModelChange)="applyFilters()"
                  class="rounded-[12px] px-3 py-2 text-sm"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
                  <option value="">Todos los ámbitos</option>
                  <option value="personal">Personal</option>
                  <option value="team">Equipo</option>
                  <option value="public">Público</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Fecha inicio</label>
                <input 
                  type="date"
                  [(ngModel)]="filters.startDate"
                  (ngModelChange)="applyFilters()"
                  class="rounded-[12px] px-3 py-2 text-sm"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Fecha fin</label>
                <input 
                  type="date"
                  [(ngModel)]="filters.endDate"
                  (ngModelChange)="applyFilters()"
                  class="rounded-[12px] px-3 py-2 text-sm"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
              </div>
              <button 
                (click)="clearFilters()"
                class="px-4 py-2 rounded-[12px] text-sm"
                style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                Limpiar filtros
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="error" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #EAE3DB; color: #2D2622;">
            {{ error }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="bg-white rounded-[12px] px-4 py-3 mb-4" style="border: 1px solid #D4A373; color: #8B5E3C;">
            {{ successMessage }}
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-8">
            <p style="color: #4A3B33;">Cargando eventos...</p>
          </div>

          <!-- List View -->
          <div *ngIf="!loading && viewMode === 'list'" class="space-y-4">
            <div *ngIf="filteredEvents.length === 0" class="bg-white rounded-[12px] p-8 text-center" style="border: 1px solid #EAE3DB;">
              <p style="color: #4A3B33;">No se encontraron eventos. ¡Crea tu primer evento!</p>
            </div>

            <div 
              *ngFor="let event of filteredEvents" 
              class="bg-white rounded-[12px] p-6 transition-colors"
              style="border: 1px solid #EAE3DB;">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-xl font-semibold" style="color: #2D2622;">{{ event.title }}</h3>
                    <span [innerHTML]="getEventIconSvg(event.type)"></span>
                  </div>
                  <p *ngIf="event.description" class="mb-3" style="color: #4A3B33;">{{ event.description }}</p>
                  <div class="text-sm space-y-1" style="color: #4A3B33;">
                    <p><strong>Inicio:</strong> {{ event.startTime | date:'medium' }}</p>
                    <p><strong>Fin:</strong> {{ event.endTime | date:'medium' }}</p>
                    <div class="flex gap-2 mt-2">
                      <span class="px-2 py-1 rounded-[12px] text-xs" [ngStyle]="getEventTypeStyleObject(event.type)">
                        {{ getEventTypeName(event.type) }}
                      </span>
                      <span class="px-2 py-1 rounded-[12px] text-xs" [ngStyle]="getEventScopeStyleObject(event.eventScope)">
                        {{ getEventScopeName(event.eventScope) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 ml-4">
                  <button 
                    *ngIf="canEditEvent(event)"
                    (click)="editEvent(event)"
                    class="text-white px-3 py-1 rounded-[12px] text-sm"
                    style="background-color: #D4A373;">
                    Editar
                  </button>
                  <button 
                    *ngIf="canDeleteEvent(event)"
                    (click)="deleteEvent(event._id!)"
                    class="px-3 py-1 rounded-[12px] text-sm text-red-600"
                    style="background-color: #FCF9F5; border: 1px solid #EAE3DB;">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Calendar View -->
          <div *ngIf="!loading && viewMode === 'calendar'" class="bg-white rounded-[12px]" style="border: 1px solid #EAE3DB;">
            <!-- Calendar Header -->
            <div class="flex justify-between items-center p-4" style="border-bottom: 1px solid #EAE3DB;">
              <button 
                (click)="previousMonth()"
                class="px-3 py-1 rounded-[12px]"
                style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                ← Anterior
              </button>
              <h3 class="text-lg font-semibold" style="color: #2D2622;">{{ currentMonth | date:'MMMM yyyy' }}</h3>
              <button 
                (click)="nextMonth()"
                class="px-3 py-1 rounded-[12px]"
                style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
                Siguiente →
              </button>
            </div>
            
            <!-- Calendar Grid -->
            <div class="grid grid-cols-7 gap-px" style="background-color: #EAE3DB;">
              <!-- Day Headers -->
              <div *ngFor="let day of weekDays" class="p-2 text-center text-sm font-medium" style="background-color: #FCF9F5; color: #4A3B33;">
                {{ day }}
              </div>
              
              <!-- Calendar Days -->
              <div 
                *ngFor="let day of calendarDays" 
                (click)="openCreateEventForDay(day.date)"
                class="bg-white min-h-24 p-1 cursor-pointer transition-colors"
                style="border-top: 1px solid #EAE3DB;"
                [ngStyle]="{'background-color': !day.isCurrentMonth ? '#FCF9F5' : '#FFFFFF'}">
                <div class="text-sm mb-1" [ngStyle]="{
                  'color': !day.isCurrentMonth ? '#EAE3DB' : (day.isToday ? '#8B5E3C' : '#4A3B33'),
                  'font-weight': day.isToday ? '700' : '400'
                }">
                  {{ day.date.getDate() }}
                </div>
                <div class="space-y-1">
                  <div 
                    *ngFor="let event of day.events.slice(0, 3)" 
                    (click)="editEvent(event); $event.stopPropagation()"
                    class="text-xs p-1 rounded-[12px] cursor-pointer truncate"
                    [ngStyle]="getEventTypeStyleObject(event.type)"
                    [title]="event.title">
                    {{ event.title }}
                  </div>
                  <div 
                    *ngIf="day.events.length > 3" 
                    class="text-xs pl-1"
                    style="color: #4A3B33;">
                    +{{ day.events.length - 3 }} más
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Event Modal -->
      <div 
        *ngIf="showCreateModal" 
        class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
        (click)="showCreateModal = false">
        <div class="bg-white rounded-[12px] p-6 w-full max-w-md max-h-screen overflow-y-auto" style="border: 1px solid #EAE3DB;" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-semibold mb-4" style="color: #2D2622;">{{ editingEvent ? 'Editar evento' : 'Crear nuevo evento' }}</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Título *</label>
              <input 
                type="text"
                [(ngModel)]="formEvent.title"
                placeholder="Título del evento"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Descripción</label>
              <textarea 
                [(ngModel)]="formEvent.description"
                placeholder="Descripción del evento"
                rows="3"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
              </textarea>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Tipo *</label>
              <select 
                [(ngModel)]="formEvent.type"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
                <option value="contest">Concurso</option>
                <option value="practice">Práctica</option>
                <option value="training">Entrenamiento</option>
                <option value="meeting">Reunión</option>
                <option value="deadline">Fecha límite</option>
                <option value="clase_gpc">Clase GPC</option>
                <option value="rpc">RPC</option>
                <option value="roadmap">Roadmap</option>
                <option value="problem">Problema</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Ámbito *</label>
              <select 
                [(ngModel)]="formEvent.eventScope"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
                <option value="personal">Personal</option>
                <option value="team">Equipo</option>
                <option value="public">Público</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Hora de inicio *</label>
              <input 
                type="datetime-local"
                [(ngModel)]="formEvent.startTime"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Hora de fin *</label>
              <input 
                type="datetime-local"
                [(ngModel)]="formEvent.endTime"
                class="w-full rounded-[12px] px-4 py-3"
                style="border: 1px solid #EAE3DB; color: #2D2622;">
            </div>

            <div class="flex items-center">
              <input 
                type="checkbox"
                [(ngModel)]="formEvent.isPublic"
                id="isPublic"
                class="mr-2 rounded">
              <label for="isPublic" class="text-sm" style="color: #4A3B33;">Hacer este evento público</label>
            </div>

            <!-- Reminder/Notification Settings -->
            <div class="border-t pt-4 mt-2" style="border-color: #EAE3DB;">
              <div class="flex items-center mb-3">
                <input 
                  type="checkbox"
                  [(ngModel)]="formEvent.reminderEnabled"
                  id="reminderEnabled"
                  class="mr-2 rounded">
                <label for="reminderEnabled" class="text-sm font-medium" style="color: #2D2622;">
                  <!-- Lucide Bell icon -->
                  <svg class="w-4 h-4 inline mr-1" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Habilitar recordatorio
                </label>
              </div>
              <div *ngIf="formEvent.reminderEnabled" class="ml-6">
                <label class="block text-sm font-medium mb-1" style="color: #2D2622;">Notificar antes de:</label>
                <select 
                  [(ngModel)]="formEvent.reminderMinutesBefore"
                  class="w-full rounded-[12px] px-4 py-3"
                  style="border: 1px solid #EAE3DB; color: #2D2622;">
                  <option [value]="5">5 minutos</option>
                  <option [value]="10">10 minutos</option>
                  <option [value]="15">15 minutos</option>
                  <option [value]="30">30 minutos</option>
                  <option [value]="60">1 hora</option>
                  <option [value]="120">2 horas</option>
                  <option [value]="1440">1 día</option>
                </select>
                <p class="text-xs mt-1" style="color: #4A3B33;">
                  Se mostrará una notificación en la página antes del evento
                </p>
              </div>
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="closeModal()"
              class="px-4 py-2 rounded-[12px]"
              style="background-color: #FCF9F5; border: 1px solid #EAE3DB; color: #2D2622;">
              Cancelar
            </button>
            <button 
              (click)="saveEvent()"
              [disabled]="saving || !isFormValid()"
              class="text-white px-4 py-2 rounded-[12px] disabled:opacity-50"
              style="background-color: #8B5E3C;">
              {{ saving ? 'Guardando...' : (editingEvent ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CalendarComponent implements OnInit {
  events: CalendarEvent[] = [];
  filteredEvents: CalendarEvent[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  showCreateModal = false;
  saving = false;
  editingEvent: CalendarEvent | null = null;
  currentUser: User | null = null;
  
  // View mode toggle
  viewMode: 'list' | 'calendar' = 'list';
  
  // Calendar view properties
  currentMonth: Date = new Date();
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarDays: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; events: CalendarEvent[] }> = [];

  // Filter properties
  filters: FilterData = {
    type: '',
    scope: '',
    startDate: '',
    endDate: ''
  };

  formEvent: EventFormData = {
    title: '',
    description: '',
    type: 'other',
    eventScope: 'personal',
    startTime: '',
    endTime: '',
    isPublic: false,
    reminderEnabled: false,
    reminderMinutesBefore: 30
  };

  constructor(
    private calendarService: CalendarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = null;

    // Build params object for server-side filtering
    const params = {
      ...(this.filters.startDate && { startDate: this.filters.startDate }),
      ...(this.filters.endDate && { endDate: this.filters.endDate }),
      ...(this.filters.type && { type: this.filters.type }),
      ...(this.filters.scope && { scope: this.filters.scope })
    };

    this.calendarService.getEvents(Object.keys(params).length > 0 ? params : undefined).subscribe({
      next: (response) => {
        this.events = response.data.events;
        this.filteredEvents = this.events; // Server already filtered, use directly
        this.generateCalendarDays();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load events. Please try again later.';
        this.loading = false;
        console.error('Error loading events:', err);
      }
    });
  }

  applyFilters(): void {
    this.loadEvents();
  }

  clearFilters(): void {
    this.filters = {
      type: '',
      scope: '',
      startDate: '',
      endDate: ''
    };
    this.loadEvents();
  }

  // Calendar view methods
  generateCalendarDays(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; events: CalendarEvent[] }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayDate = new Date(currentDate);
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.getTime() === today.getTime();
      
      const dayEvents = this.filteredEvents.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.getFullYear() === dayDate.getFullYear() &&
               eventDate.getMonth() === dayDate.getMonth() &&
               eventDate.getDate() === dayDate.getDate();
      });
      
      days.push({
        date: dayDate,
        isCurrentMonth,
        isToday,
        events: dayEvents
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.calendarDays = days;
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendarDays();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendarDays();
  }

  openCreateEventForDay(date: Date): void {
    // Create start time at 9:00 AM on the selected day
    const startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0);
    
    // Create end time at 10:00 AM on the selected day (1 hour duration default)
    const endTime = new Date(date);
    endTime.setHours(10, 0, 0, 0);
    
    // Reset form with the selected date pre-filled
    this.editingEvent = null;
    this.formEvent = {
      title: '',
      description: '',
      type: 'other',
      eventScope: 'personal',
      startTime: this.formatDateForInput(startTime),
      endTime: this.formatDateForInput(endTime),
      isPublic: false,
      reminderEnabled: false,
      reminderMinutesBefore: 30
    };
    this.showCreateModal = true;
  }

  editEvent(event: CalendarEvent): void {
    this.editingEvent = event;
    this.formEvent = {
      title: event.title,
      description: event.description || '',
      type: event.type,
      eventScope: event.eventScope,
      startTime: this.formatDateForInput(event.startTime),
      endTime: this.formatDateForInput(event.endTime),
      isPublic: event.isPublic,
      reminderEnabled: event.reminder?.enabled || false,
      reminderMinutesBefore: event.reminder?.minutesBefore || 30
    };
    this.showCreateModal = true;
  }

  saveEvent(): void {
    if (!this.isFormValid()) return;

    this.saving = true;
    this.error = null;

    const eventData: Partial<CalendarEvent> = {
      title: this.formEvent.title,
      description: this.formEvent.description,
      type: this.formEvent.type,
      eventScope: this.formEvent.eventScope,
      startTime: new Date(this.formEvent.startTime),
      endTime: new Date(this.formEvent.endTime),
      isPublic: this.formEvent.isPublic,
      reminder: {
        enabled: this.formEvent.reminderEnabled,
        minutesBefore: this.formEvent.reminderMinutesBefore,
        sent: false
      }
    };

    const operation = this.editingEvent
      ? this.calendarService.updateEvent(this.editingEvent._id!, eventData)
      : this.calendarService.createEvent(eventData);

    operation.subscribe({
      next: () => {
        this.successMessage = `Evento ${this.editingEvent ? 'actualizado' : 'creado'} exitosamente!`;
        setTimeout(() => this.successMessage = null, 3000);
        this.closeModal();
        this.loadEvents();
        this.saving = false;
      },
      error: (err) => {
        this.error = `Error al ${this.editingEvent ? 'actualizar' : 'crear'} el evento.`;
        this.saving = false;
        console.error('Error saving event:', err);
      }
    });
  }

  deleteEvent(id: string): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      return;
    }

    this.calendarService.deleteEvent(id).subscribe({
      next: () => {
        this.successMessage = '¡Evento eliminado exitosamente!';
        setTimeout(() => this.successMessage = null, 3000);
        this.loadEvents();
      },
      error: (err) => {
        this.error = 'Error al eliminar el evento.';
        console.error('Error deleting event:', err);
      }
    });
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.editingEvent = null;
    this.formEvent = {
      title: '',
      description: '',
      type: 'other',
      eventScope: 'personal',
      startTime: '',
      endTime: '',
      isPublic: false,
      reminderEnabled: false,
      reminderMinutesBefore: 30
    };
  }

  isFormValid(): boolean {
    return !!(
      this.formEvent.title &&
      this.formEvent.type &&
      this.formEvent.eventScope &&
      this.formEvent.startTime &&
      this.formEvent.endTime
    );
  }

  canEditEvent(event: CalendarEvent): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'admin') return true;
    
    if (event.eventScope === 'personal') {
      return this.isUserIdMatch(event.ownerId, this.currentUser.id) || 
             this.isUserIdMatch(event.createdBy, this.currentUser.id);
    }
    
    return this.isUserIdMatch(event.createdBy, this.currentUser.id);
  }

  canDeleteEvent(event: CalendarEvent): boolean {
    return this.canEditEvent(event);
  }

  private isUserIdMatch(userId: { _id: string } | string | undefined, targetId: string): boolean {
    if (!userId) return false;
    if (typeof userId === 'string') return userId === targetId;
    return userId._id === targetId;
  }

  getEventIcon(type: string): string {
    // Returns empty string - icons now handled by getEventIconSvg
    return '';
  }

  getEventIconSvg(type: string): string {
    // SVG icons for event types following the Matte-Drift design pattern
    const icons: { [key: string]: string } = {
      'contest': '<svg class="w-5 h-5 inline" style="color: #8B5E3C;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M6 3v6a6 6 0 006 6v0a6 6 0 006-6V3M9 21h6M12 15v6" /></svg>',
      'practice': '<svg class="w-5 h-5 inline" style="color: #4A90A4;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>',
      'training': '<svg class="w-5 h-5 inline" style="color: #8B5E3C;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
      'meeting': '<svg class="w-5 h-5 inline" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
      'deadline': '<svg class="w-5 h-5 inline" style="color: #A05E4A;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" /></svg>',
      'clase_gpc': '<svg class="w-5 h-5 inline" style="color: #8B5E3C;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
      'rpc': '<svg class="w-5 h-5 inline" style="color: #4A90A4;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
      'roadmap': '<svg class="w-5 h-5 inline" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>',
      'problem': '<svg class="w-5 h-5 inline" style="color: #8B5E3C;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>',
      'other': '<svg class="w-5 h-5 inline" style="color: #4A3B33;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>'
    };
    return icons[type] || icons['other'];
  }

  getEventTypeName(type: string): string {
    const names: { [key: string]: string } = {
      'contest': 'Concurso',
      'practice': 'Práctica',
      'training': 'Entrenamiento',
      'meeting': 'Reunión',
      'deadline': 'Fecha límite',
      'clase_gpc': 'Clase GPC',
      'rpc': 'RPC',
      'roadmap': 'Roadmap',
      'problem': 'Problema',
      'other': 'Otro'
    };
    return names[type] || type;
  }

  getEventScopeName(scope: string): string {
    const names: { [key: string]: string } = {
      'personal': 'Personal',
      'team': 'Equipo',
      'public': 'Público'
    };
    return names[scope] || scope;
  }

  getEventTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'contest': 'bg-yellow-100 text-yellow-800',
      'practice': 'bg-blue-100 text-blue-800',
      'training': 'bg-cyan-100 text-cyan-800',
      'meeting': 'bg-green-100 text-green-800',
      'deadline': 'bg-red-100 text-red-800',
      'clase_gpc': 'bg-orange-100 text-orange-800',
      'rpc': 'bg-pink-100 text-pink-800',
      'roadmap': 'bg-teal-100 text-teal-800',
      'problem': 'bg-violet-100 text-violet-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  }

  getEventScopeClass(scope: string): string {
    const classes: { [key: string]: string } = {
      'personal': 'bg-purple-100 text-purple-800',
      'team': 'bg-indigo-100 text-indigo-800',
      'public': 'bg-green-100 text-green-800'
    };
    return classes[scope] || 'bg-gray-100 text-gray-800';
  }

  // Matte-Drift style object methods - with subtle type variations
  getEventTypeStyleObject(type: string): { [key: string]: string } {
    // Use subtle variations within the Matte-Drift palette for different event types
    const typeStyles: { [key: string]: { [key: string]: string } } = {
      'contest': { 'background-color': '#FCF9F5', 'color': '#8B5E3C', 'border': '1px solid #D4A373' },
      'practice': { 'background-color': '#FCF9F5', 'color': '#4A90A4', 'border': '1px solid #4A90A4' },
      'training': { 'background-color': '#FCF9F5', 'color': '#8B5E3C', 'border': '1px solid #EAE3DB' },
      'meeting': { 'background-color': '#FCF9F5', 'color': '#4A3B33', 'border': '1px solid #EAE3DB' },
      'deadline': { 'background-color': '#FCF9F5', 'color': '#A05E4A', 'border': '1px solid #A05E4A' },
      'clase_gpc': { 'background-color': '#FCF9F5', 'color': '#8B5E3C', 'border': '1px solid #D4A373' },
      'rpc': { 'background-color': '#E8F4F8', 'color': '#4A90A4', 'border': '1px solid #4A90A4' },
      'roadmap': { 'background-color': '#FCF9F5', 'color': '#4A3B33', 'border': '1px solid #EAE3DB' },
      'problem': { 'background-color': '#FCF9F5', 'color': '#8B5E3C', 'border': '1px solid #EAE3DB' },
      'other': { 'background-color': '#FCF9F5', 'color': '#4A3B33', 'border': '1px solid #EAE3DB' }
    };
    return typeStyles[type] || typeStyles['other'];
  }

  getEventScopeStyleObject(scope: string): { [key: string]: string } {
    // Use subtle variations for different scopes
    const scopeStyles: { [key: string]: { [key: string]: string } } = {
      'personal': { 'background-color': '#FCF9F5', 'color': '#8B5E3C', 'border': '1px solid #D4A373' },
      'team': { 'background-color': '#E8F4F8', 'color': '#4A90A4', 'border': '1px solid #4A90A4' },
      'public': { 'background-color': '#FCF9F5', 'color': '#4A3B33', 'border': '1px solid #EAE3DB' }
    };
    return scopeStyles[scope] || scopeStyles['public'];
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
