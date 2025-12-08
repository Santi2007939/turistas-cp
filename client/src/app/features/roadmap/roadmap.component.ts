import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoadmapService, PersonalNode } from '../../core/services/roadmap.service';
import { ThemesService, Theme } from '../../core/services/themes.service';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">My Learning Roadmap</h1>
        <button 
          (click)="showAddThemeModal = true"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Theme to Roadmap
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-600">Loading your roadmap...</p>
      </div>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <!-- Progress Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" *ngIf="!loading && nodes.length > 0">
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-600 text-sm">Not Started</p>
          <p class="text-2xl font-bold text-gray-700">{{ getCountByStatus('not-started') }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-600 text-sm">In Progress</p>
          <p class="text-2xl font-bold text-blue-600">{{ getCountByStatus('in-progress') }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-600 text-sm">Completed</p>
          <p class="text-2xl font-bold text-green-600">{{ getCountByStatus('completed') }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <p class="text-gray-600 text-sm">Mastered</p>
          <p class="text-2xl font-bold text-purple-600">{{ getCountByStatus('mastered') }}</p>
        </div>
      </div>

      <!-- Roadmap Nodes -->
      <div class="space-y-4">
        <div 
          *ngFor="let node of nodes" 
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-gray-800 mb-2">
                {{ node.themeId?.name || 'Theme' }}
              </h2>
              <p class="text-gray-600 mb-3">{{ node.themeId?.description || '' }}</p>
              
              <div class="flex gap-2 mb-3">
                <span 
                  class="px-3 py-1 text-sm rounded-full"
                  [ngClass]="{
                    'bg-gray-200 text-gray-800': node.status === 'not-started',
                    'bg-blue-100 text-blue-800': node.status === 'in-progress',
                    'bg-green-100 text-green-800': node.status === 'completed',
                    'bg-purple-100 text-purple-800': node.status === 'mastered'
                  }">
                  {{ node.status }}
                </span>
                <span class="bg-gray-200 rounded-full px-3 py-1 text-sm text-gray-700">
                  {{ node.themeId?.category }}
                </span>
                <span 
                  class="px-3 py-1 text-sm rounded-full"
                  [ngClass]="{
                    'bg-green-100 text-green-800': node.themeId?.difficulty === 'beginner',
                    'bg-yellow-100 text-yellow-800': node.themeId?.difficulty === 'intermediate',
                    'bg-orange-100 text-orange-800': node.themeId?.difficulty === 'advanced',
                    'bg-red-100 text-red-800': node.themeId?.difficulty === 'expert'
                  }">
                  {{ node.themeId?.difficulty }}
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="mb-3">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{{ node.progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full transition-all"
                    [style.width.%]="node.progress">
                  </div>
                </div>
              </div>

              <div *ngIf="node.notes" class="text-sm text-gray-600 italic">
                Notes: {{ node.notes }}
              </div>

              <div *ngIf="node.lastPracticed" class="text-xs text-gray-500 mt-2">
                Last practiced: {{ node.lastPracticed | date:'medium' }}
              </div>
            </div>

            <div class="flex gap-2 ml-4">
              <button 
                (click)="editNode(node)"
                class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                Update
              </button>
              <button 
                (click)="deleteNode(node._id)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && nodes.length === 0" class="text-center py-12">
        <p class="text-gray-600 text-lg mb-4">Your roadmap is empty. Start adding themes to track your progress!</p>
        <button 
          (click)="showAddThemeModal = true"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Your First Theme
        </button>
      </div>

      <!-- Add Theme Modal -->
      <div 
        *ngIf="showAddThemeModal" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 class="text-xl font-bold mb-4">Add Theme to Roadmap</h3>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Select Theme</label>
            <select 
              [(ngModel)]="selectedThemeId"
              class="w-full border rounded px-3 py-2">
              <option value="">Choose a theme...</option>
              <option *ngFor="let theme of availableThemes" [value]="theme._id">
                {{ theme.name }} ({{ theme.category }})
              </option>
            </select>
          </div>

          <div class="flex gap-2 justify-end">
            <button 
              (click)="showAddThemeModal = false"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Cancel
            </button>
            <button 
              (click)="addThemeToRoadmap()"
              [disabled]="!selectedThemeId"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300">
              Add to Roadmap
            </button>
          </div>
        </div>
      </div>

      <!-- Update Node Modal -->
      <div 
        *ngIf="showUpdateModal && editingNode" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 class="text-xl font-bold mb-4">Update Progress</h3>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select 
              [(ngModel)]="editingNode.status"
              class="w-full border rounded px-3 py-2">
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Progress (%)</label>
            <input 
              type="number" 
              [(ngModel)]="editingNode.progress"
              min="0"
              max="100"
              class="w-full border rounded px-3 py-2">
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Notes</label>
            <textarea 
              [(ngModel)]="editingNode.notes"
              rows="3"
              class="w-full border rounded px-3 py-2"></textarea>
          </div>

          <div class="flex gap-2 justify-end">
            <button 
              (click)="showUpdateModal = false"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Cancel
            </button>
            <button 
              (click)="saveNodeUpdate()"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RoadmapComponent implements OnInit {
  nodes: PersonalNode[] = [];
  availableThemes: Theme[] = [];
  loading = false;
  error: string | null = null;
  showAddThemeModal = false;
  showUpdateModal = false;
  selectedThemeId = '';
  editingNode: any = null;

  constructor(
    private roadmapService: RoadmapService,
    private themesService: ThemesService
  ) {}

  ngOnInit(): void {
    this.loadRoadmap();
    this.loadThemes();
  }

  loadRoadmap(): void {
    this.loading = true;
    this.error = null;
    
    this.roadmapService.getRoadmap().subscribe({
      next: (response) => {
        this.nodes = response.data.roadmap;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load roadmap. Please try again later.';
        this.loading = false;
        console.error('Error loading roadmap:', err);
      }
    });
  }

  loadThemes(): void {
    this.themesService.getThemes().subscribe({
      next: (response) => {
        this.availableThemes = response.data.themes;
      },
      error: (err) => {
        console.error('Error loading themes:', err);
      }
    });
  }

  addThemeToRoadmap(): void {
    if (!this.selectedThemeId) return;

    this.roadmapService.updateNode({
      themeId: this.selectedThemeId,
      status: 'not-started',
      progress: 0
    }).subscribe({
      next: () => {
        this.showAddThemeModal = false;
        this.selectedThemeId = '';
        this.loadRoadmap();
      },
      error: (err) => {
        this.error = 'Failed to add theme to roadmap.';
        console.error('Error adding theme:', err);
      }
    });
  }

  editNode(node: PersonalNode): void {
    this.editingNode = {
      _id: node._id,
      themeId: node.themeId._id,
      status: node.status,
      progress: node.progress,
      notes: node.notes || ''
    };
    this.showUpdateModal = true;
  }

  saveNodeUpdate(): void {
    if (!this.editingNode) return;

    this.roadmapService.updateNode({
      themeId: this.editingNode.themeId,
      status: this.editingNode.status,
      progress: this.editingNode.progress,
      notes: this.editingNode.notes
    }).subscribe({
      next: () => {
        this.showUpdateModal = false;
        this.editingNode = null;
        this.loadRoadmap();
      },
      error: (err) => {
        this.error = 'Failed to update node.';
        console.error('Error updating node:', err);
      }
    });
  }

  deleteNode(nodeId: string): void {
    if (!confirm('Are you sure you want to remove this theme from your roadmap?')) {
      return;
    }

    this.roadmapService.deleteNode(nodeId).subscribe({
      next: () => {
        this.loadRoadmap();
      },
      error: (err) => {
        this.error = 'Failed to delete node.';
        console.error('Error deleting node:', err);
      }
    });
  }

  getCountByStatus(status: string): number {
    return this.nodes.filter(node => node.status === status).length;
  }
}
