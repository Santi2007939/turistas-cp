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
    <div class="min-h-screen bg-[#F4F4F4]">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 px-6">
        <div class="py-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-[#1A1A1A] font-mono">📅 Calendar</h2>
            <div class="flex gap-2">
              <!-- View Toggle -->
              <div class="flex bg-white border-2 border-[#D1D1D1] overflow-hidden">
                <button 
                  (click)="viewMode = 'list'"
                  [ngClass]="viewMode === 'list' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'"
                  class="px-4 py-2 text-sm font-medium transition-colors">
                  📋 List
                </button>
                <button 
                  (click)="viewMode = 'calendar'"
                  [ngClass]="viewMode === 'calendar' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'"
                  class="px-4 py-2 text-sm font-medium transition-colors">
                  📅 Calendar
                </button>
              </div>
              <button 
                (click)="showCreateModal = true"
                class="bg-[#1A1A1A] hover:bg-gray-800 text-white px-4 py-2">
                Add Event
              </button>
            </div>
          </div>

          <!-- Filters Section -->
          <div class="bg-white border-2 border-[#D1D1D1] p-6 mb-6">
            <div class="flex flex-wrap gap-4 items-end">
              <div>
                <label class="block text-sm font-medium text-[#1A1A1A] mb-1">Type</label>
                <select 
                  [(ngModel)]="filters.type"
                  (ngModelChange)="applyFilters()"
                  class="border-2 border-[#D1D1D1] px-3 py-2 text-sm focus:border-[#1A1A1A] focus:outline-none">
                  <option value="">All Types</option>
                  <option value="contest">🏆 Contest</option>
                  <option value="practice">💻 Practice</option>
                  <option value="training">📚 Training</option>
                  <option value="meeting">👥 Meeting</option>
                  <option value="deadline">⏰ Deadline</option>
                  <option value="clase_gpc">🎓 Clase GPC</option>
                  <option value="rpc">🌐 RPC</option>
                  <option value="roadmap">🗺️ Roadmap</option>
                  <option value="problem">🧩 Problem</option>
                  <option value="other">📌 Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-[#1A1A1A] mb-1">Scope</label>
                <select 
                  [(ngModel)]="filters.scope"
                  (ngModelChange)="applyFilters()"
                  class="border-2 border-[#D1D1D1] px-3 py-2 text-sm focus:border-[#1A1A1A] focus:outline-none">
                  <option value="">All Scopes</option>
                  <option value="personal">Personal</option>
                  <option value="team">Team</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-[#1A1A1A] mb-1">Start Date</label>
                <input 
                  type="date"
                  [(ngModel)]="filters.startDate"
                  (ngModelChange)="applyFilters()"
                  class="border-2 border-[#D1D1D1] px-3 py-2 text-sm focus:border-[#1A1A1A] focus:outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-[#1A1A1A] mb-1">End Date</label>
                <input 
                  type="date"
                  [(ngModel)]="filters.endDate"
                  (ngModelChange)="applyFilters()"
                  class="border-2 border-[#D1D1D1] px-3 py-2 text-sm focus:border-[#1A1A1A] focus:outline-none">
              </div>
              <button 
                (click)="clearFilters()"
                class="bg-[#F4F4F4] hover:bg-gray-200 text-[#1A1A1A] px-4 py-2 text-sm border-2 border-[#D1D1D1]">
                Clear Filters
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="error" class="bg-red-50 border-2 border-red-600 text-red-700 px-6 py-4 mb-4">
            {{ error }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="bg-green-50 border-2 border-green-600 text-green-700 px-6 py-4 mb-4">
            {{ successMessage }}
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-8">
            <p class="text-gray-600">Loading events...</p>
          </div>

          <!-- List View -->
          <div *ngIf="!loading && viewMode === 'list'" class="space-y-4">
            <div *ngIf="filteredEvents.length === 0" class="bg-white border-2 border-[#D1D1D1] p-8 text-center">
              <p class="text-gray-600">No events found. Create your first event!</p>
            </div>

            <div 
              *ngFor="let event of filteredEvents" 
              class="bg-white border-2 border-[#D1D1D1] p-6 hover:border-[#1A1A1A] transition-colors">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-xl font-semibold text-[#1A1A1A] font-mono">{{ event.title }}</h3>
                    <span class="text-2xl">{{ getEventIcon(event.type) }}</span>
                  </div>
                  <p *ngIf="event.description" class="text-gray-600 mb-3">{{ event.description }}</p>
                  <div class="text-sm text-gray-500 space-y-1">
                    <p><strong>Start:</strong> {{ event.startTime | date:'medium' }}</p>
                    <p><strong>End:</strong> {{ event.endTime | date:'medium' }}</p>
                    <div class="flex gap-2 mt-2">
                      <span class="px-2 py-1 text-xs" [ngClass]="getEventTypeClass(event.type)">
                        {{ getEventTypeName(event.type) }}
                      </span>
                      <span class="px-2 py-1 text-xs" [ngClass]="getEventScopeClass(event.eventScope)">
                        {{ event.eventScope }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 ml-4">
                  <button 
                    *ngIf="canEditEvent(event)"
                    (click)="editEvent(event)"
                    class="bg-[#FFB400] hover:bg-yellow-500 text-[#1A1A1A] px-3 py-1 text-sm">
                    Edit
                  </button>
                  <button 
                    *ngIf="canDeleteEvent(event)"
                    (click)="deleteEvent(event._id!)"
                    class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Calendar View -->
          <div *ngIf="!loading && viewMode === 'calendar'" class="bg-white border-2 border-[#D1D1D1]">
            <!-- Calendar Header -->
            <div class="flex justify-between items-center p-4 border-b-2 border-[#D1D1D1]">
              <button 
                (click)="previousMonth()"
                class="bg-[#F4F4F4] hover:bg-gray-200 text-[#1A1A1A] px-3 py-1 border-2 border-[#D1D1D1]">
                ← Previous
              </button>
              <h3 class="text-lg font-semibold font-mono">{{ currentMonth | date:'MMMM yyyy' }}</h3>
              <button 
                (click)="nextMonth()"
                class="bg-[#F4F4F4] hover:bg-gray-200 text-[#1A1A1A] px-3 py-1 border-2 border-[#D1D1D1]">
                Next →
              </button>
            </div>
            
            <!-- Calendar Grid -->
            <div class="grid grid-cols-7">
              <!-- Day Headers -->
              <div *ngFor="let day of weekDays" class="bg-[#F4F4F4] p-2 text-center text-sm font-medium text-[#1A1A1A] border-b border-r border-[#D1D1D1]">
                {{ day }}
              </div>
              
              <!-- Calendar Days -->
              <div 
                *ngFor="let day of calendarDays" 
                (click)="openCreateEventForDay(day.date)"
                class="bg-white min-h-24 p-1 border-b border-r border-[#D1D1D1] cursor-pointer hover:bg-gray-50 transition-colors"
                [ngClass]="{'bg-gray-50 hover:bg-gray-100': !day.isCurrentMonth}">
                <div class="text-sm text-gray-500 mb-1" [ngClass]="{'text-gray-400': !day.isCurrentMonth, 'font-bold text-[#1A1A1A] bg-[#FFB400] inline-block px-1': day.isToday}">
                  {{ day.date.getDate() }}
                </div>
                <div class="space-y-1">
                  <div 
                    *ngFor="let event of day.events.slice(0, 3)" 
                    (click)="editEvent(event); $event.stopPropagation()"
                    class="text-xs p-1 cursor-pointer truncate"
                    [ngClass]="getEventTypeClass(event.type)"
                    [title]="event.title">
                    {{ getEventIcon(event.type) }} {{ event.title }}
                  </div>
                  <div 
                    *ngIf="day.events.length > 3" 
                    class="text-xs text-gray-500 pl-1">
                    +{{ day.events.length - 3 }} more
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
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="showCreateModal = false">
        <div class="bg-white border-2 border-[#D1D1D1] p-6 w-full max-w-md max-h-screen overflow-y-auto" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-bold mb-4 font-mono">{{ editingEvent ? 'Edit Event' : 'Create New Event' }}</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-[#1A1A1A] mb-1">Title *</label>
              <input 
                type="text"
                [(ngModel)]="formEvent.title"
                placeholder="Event title"
                class="w-full border-2 border-[#D1D1D1] px-4 py-2 focus:border-[#1A1A1A] focus:outline-none">
            </div>

            <div>
              <label class="block text-sm font-medium text-[#1A1A1A] mb-1">Description</label>
              <textarea 
                [(ngModel)]="formEvent.description"
                placeholder="Event description"
                rows="3"
                class="w-full border-2 border-[#D1D1D1] px-4 py-2 focus:border-[#1A1A1A] focus:outline-none">
              </textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-[#1A1A1A] mb-1">Type *</label>
              <select 
                [(ngModel)]="formEvent.type"
                class="w-full border-2 border-[#D1D1D1] px-4 py-2 focus:border-[#1A1A1A] focus:outline-none">
                <option value="contest">🏆 Contest</option>
                <option value="practice">💻 Practice</option>
                <option value="training">📚 Training</option>
                <option value="meeting">👥 Meeting</option>
                <option value="deadline">⏰ Deadline</option>
                <option value="clase_gpc">🎓 Clase GPC</option>
                <option value="rpc">🌐 RPC</option>
                <option value="roadmap">🗺️ Roadmap</option>
                <option value="problem">🧩 Problem</option>
                <option value="other">📌 Other</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-[#1A1A1A] mb-1">Scope *</label>
              <select 
                [(ngModel)]="formEvent.eventScope"
                class="w-full border-2 border-[#D1D1D1] px-4 py-2 focus:border-[#1A1A1A] focus:outline-none">
                <option value="personal">Personal</option>
                <option value="team">Team</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-[#1A1A1A] mb-1">Start Time *</label>
              <input 
                type="datetime-local"
                [(ngModel)]="formEvent.startTime"
                class="w-full border-2 border-[#D1D1D1] px-4 py-2 focus:border-[#1A1A1A] focus:outline-none">
            </div>

            <div>
              <label class="block text-sm font-medium text-[#1A1A1A] mb-1">End Time *</label>
              <input 
                type="datetime-local"
                [(ngModel)]="formEvent.endTime"
                class="w-full border-2 border-[#D1D1D1] px-4 py-2 focus:border-[#1A1A1A] focus:outline-none">
            </div>

            <div class="flex items-center">
              <input 
                type="checkbox"
                [(ngModel)]="formEvent.isPublic"
                id="isPublic"
                class="mr-2">
              <label for="isPublic" class="text-sm text-gray-600">Make this event public</label>
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="closeModal()"
              class="bg-white border-2 border-[#1A1A1A] hover:bg-gray-100 text-[#1A1A1A] px-4 py-2">
              Cancel
            </button>
            <button 
              (click)="saveEvent()"
              [disabled]="saving || !isFormValid()"
              class="bg-[#1A1A1A] hover:bg-gray-800 text-white px-4 py-2 disabled:bg-gray-300">
              {{ saving ? 'Saving...' : (editingEvent ? 'Update' : 'Create') }}
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
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
    isPublic: false
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
      isPublic: false
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
      isPublic: event.isPublic
    };
    this.showCreateModal = true;
  }

  saveEvent(): void {
    if (!this.isFormValid()) return;

    this.saving = true;
    this.error = null;

    const eventData = {
      title: this.formEvent.title,
      description: this.formEvent.description,
      type: this.formEvent.type,
      eventScope: this.formEvent.eventScope,
      startTime: new Date(this.formEvent.startTime),
      endTime: new Date(this.formEvent.endTime),
      isPublic: this.formEvent.isPublic
    };

    const operation = this.editingEvent
      ? this.calendarService.updateEvent(this.editingEvent._id!, eventData)
      : this.calendarService.createEvent(eventData);

    operation.subscribe({
      next: () => {
        this.successMessage = `Event ${this.editingEvent ? 'updated' : 'created'} successfully!`;
        setTimeout(() => this.successMessage = null, 3000);
        this.closeModal();
        this.loadEvents();
        this.saving = false;
      },
      error: (err) => {
        this.error = `Failed to ${this.editingEvent ? 'update' : 'create'} event.`;
        this.saving = false;
        console.error('Error saving event:', err);
      }
    });
  }

  deleteEvent(id: string): void {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    this.calendarService.deleteEvent(id).subscribe({
      next: () => {
        this.successMessage = 'Event deleted successfully!';
        setTimeout(() => this.successMessage = null, 3000);
        this.loadEvents();
      },
      error: (err) => {
        this.error = 'Failed to delete event.';
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
      isPublic: false
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
    const icons: { [key: string]: string } = {
      'contest': '🏆',
      'practice': '💻',
      'training': '📚',
      'meeting': '👥',
      'deadline': '⏰',
      'clase_gpc': '🎓',
      'rpc': '🌐',
      'roadmap': '🗺️',
      'problem': '🧩',
      'other': '📌'
    };
    return icons[type] || '📌';
  }

  getEventTypeName(type: string): string {
    const names: { [key: string]: string } = {
      'contest': 'Contest',
      'practice': 'Practice',
      'training': 'Training',
      'meeting': 'Meeting',
      'deadline': 'Deadline',
      'clase_gpc': 'Clase GPC',
      'rpc': 'RPC',
      'roadmap': 'Roadmap',
      'problem': 'Problem',
      'other': 'Other'
    };
    return names[type] || type;
  }

  getEventTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'contest': 'bg-[#FFB400] text-[#1A1A1A]',
      'practice': 'bg-[#F4F4F4] text-[#1A1A1A] border border-[#D1D1D1]',
      'training': 'bg-[#F4F4F4] text-[#1A1A1A] border border-[#D1D1D1]',
      'meeting': 'bg-[#1A1A1A] text-white',
      'deadline': 'bg-red-100 text-red-800',
      'clase_gpc': 'bg-[#FFB400] text-[#1A1A1A]',
      'rpc': 'bg-[#1A1A1A] text-white',
      'roadmap': 'bg-[#F4F4F4] text-[#1A1A1A] border border-[#D1D1D1]',
      'problem': 'bg-[#F4F4F4] text-[#1A1A1A] border border-[#D1D1D1]',
      'other': 'bg-gray-100 text-gray-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  }

  getEventScopeClass(scope: string): string {
    const classes: { [key: string]: string } = {
      'personal': 'bg-[#F4F4F4] text-[#1A1A1A] border border-[#D1D1D1]',
      'team': 'bg-[#1A1A1A] text-white',
      'public': 'bg-[#FFB400] text-[#1A1A1A]'
    };
    return classes[scope] || 'bg-gray-100 text-gray-800';
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
