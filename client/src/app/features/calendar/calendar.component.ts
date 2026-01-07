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
  type: 'contest' | 'practice' | 'meeting' | 'deadline' | 'other';
  eventScope: 'personal' | 'team' | 'public';
  startTime: string;
  endTime: string;
  isPublic: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">📅 Calendar</h2>
            <button 
              (click)="showCreateModal = true"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Add Event
            </button>
          </div>

          <!-- Error Message -->
          <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ error }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ successMessage }}
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-8">
            <p class="text-gray-600">Loading events...</p>
          </div>

          <!-- Events List -->
          <div *ngIf="!loading" class="space-y-4">
            <div *ngIf="events.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
              <p class="text-gray-600">No events found. Create your first event!</p>
            </div>

            <div 
              *ngFor="let event of events" 
              class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-xl font-semibold text-gray-800">{{ event.title }}</h3>
                    <span class="text-2xl">{{ getEventIcon(event.type) }}</span>
                  </div>
                  <p *ngIf="event.description" class="text-gray-600 mb-3">{{ event.description }}</p>
                  <div class="text-sm text-gray-500 space-y-1">
                    <p><strong>Start:</strong> {{ event.startTime | date:'medium' }}</p>
                    <p><strong>End:</strong> {{ event.endTime | date:'medium' }}</p>
                    <div class="flex gap-2 mt-2">
                      <span class="px-2 py-1 rounded text-xs" [ngClass]="getEventTypeClass(event.type)">
                        {{ event.type }}
                      </span>
                      <span class="px-2 py-1 rounded text-xs" [ngClass]="getEventScopeClass(event.eventScope)">
                        {{ event.eventScope }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 ml-4">
                  <button 
                    *ngIf="canEditEvent(event)"
                    (click)="editEvent(event)"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                    Edit
                  </button>
                  <button 
                    *ngIf="canDeleteEvent(event)"
                    (click)="deleteEvent(event._id!)"
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                    Delete
                  </button>
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
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
          <h3 class="text-xl font-bold mb-4">{{ editingEvent ? 'Edit Event' : 'Create New Event' }}</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input 
                type="text"
                [(ngModel)]="formEvent.title"
                placeholder="Event title"
                class="w-full border rounded px-3 py-2">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                [(ngModel)]="formEvent.description"
                placeholder="Event description"
                rows="3"
                class="w-full border rounded px-3 py-2">
              </textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select 
                [(ngModel)]="formEvent.type"
                class="w-full border rounded px-3 py-2">
                <option value="contest">Contest</option>
                <option value="practice">Practice</option>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Scope *</label>
              <select 
                [(ngModel)]="formEvent.eventScope"
                class="w-full border rounded px-3 py-2">
                <option value="personal">Personal</option>
                <option value="team">Team</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <input 
                type="datetime-local"
                [(ngModel)]="formEvent.startTime"
                class="w-full border rounded px-3 py-2">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
              <input 
                type="datetime-local"
                [(ngModel)]="formEvent.endTime"
                class="w-full border rounded px-3 py-2">
            </div>

            <div class="flex items-center">
              <input 
                type="checkbox"
                [(ngModel)]="formEvent.isPublic"
                id="isPublic"
                class="mr-2">
              <label for="isPublic" class="text-sm text-gray-700">Make this event public</label>
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-6">
            <button 
              (click)="closeModal()"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Cancel
            </button>
            <button 
              (click)="saveEvent()"
              [disabled]="saving || !isFormValid()"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300">
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
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  showCreateModal = false;
  saving = false;
  editingEvent: CalendarEvent | null = null;
  currentUser: User | null = null;

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

    this.calendarService.getEvents().subscribe({
      next: (response) => {
        this.events = response.data.events;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load events. Please try again later.';
        this.loading = false;
        console.error('Error loading events:', err);
      }
    });
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
      'meeting': '👥',
      'deadline': '⏰',
      'other': '📌'
    };
    return icons[type] || '📌';
  }

  getEventTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'contest': 'bg-yellow-100 text-yellow-800',
      'practice': 'bg-blue-100 text-blue-800',
      'meeting': 'bg-green-100 text-green-800',
      'deadline': 'bg-red-100 text-red-800',
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
