import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

// Feature components are lazy-loaded so each view ships in its own chunk
// and the initial bundle stays within the build budget.
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'auth/login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'auth/register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'admin', loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [AuthGuard] },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'statistics', loadComponent: () => import('./features/statistics/statistics.component').then(m => m.StatisticsComponent), canActivate: [AuthGuard] },
  { path: 'themes', loadComponent: () => import('./features/themes/themes-list.component').then(m => m.ThemesListComponent), canActivate: [AuthGuard] },
  { path: 'themes/create', loadComponent: () => import('./features/themes/theme-create.component').then(m => m.ThemeCreateComponent), canActivate: [AuthGuard] },
  { path: 'themes/:id/edit', loadComponent: () => import('./features/themes/theme-edit.component').then(m => m.ThemeEditComponent), canActivate: [AuthGuard] },
  { path: 'themes/:id', loadComponent: () => import('./features/themes/theme-detail.component').then(m => m.ThemeDetailComponent), canActivate: [AuthGuard] },
  { path: 'themes/:id/subtopics/:subtopicName', loadComponent: () => import('./features/themes/subtopic-content.component').then(m => m.SubtopicContentComponent), canActivate: [AuthGuard] },
  { path: 'roadmap', loadComponent: () => import('./features/roadmap/roadmap.component').then(m => m.RoadmapComponent), canActivate: [AuthGuard] },
  { path: 'roadmap/kanban', loadComponent: () => import('./features/roadmap/roadmap-kanban.component').then(m => m.RoadmapKanbanComponent), canActivate: [AuthGuard] },
  { path: 'roadmap/graph', loadComponent: () => import('./features/roadmap/roadmap-graph.component').then(m => m.RoadmapGraphComponent), canActivate: [AuthGuard] },
  { path: 'roadmap/nodes', loadComponent: () => import('./features/roadmap/roadmap-nodes.component').then(m => m.RoadmapNodesComponent), canActivate: [AuthGuard] },
  { path: 'roadmap/:id/subtopics', loadComponent: () => import('./features/roadmap/subtopic-detail.component').then(m => m.SubtopicDetailComponent), canActivate: [AuthGuard] },
  { path: 'problems', loadComponent: () => import('./features/problems/problems-library.component').then(m => m.ProblemsLibraryComponent), canActivate: [AuthGuard] },
  { path: 'problems/:id', loadComponent: () => import('./features/problems/problem-detail.component').then(m => m.ProblemDetailComponent), canActivate: [AuthGuard] },
  { path: 'calendar', loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent), canActivate: [AuthGuard] },
  { path: 'simulations', loadComponent: () => import('./features/simulations/simulations-list.component').then(m => m.SimulationsListComponent), canActivate: [AuthGuard] },
  { path: 'simulations/new', loadComponent: () => import('./features/simulations/simulation-create.component').then(m => m.SimulationCreateComponent), canActivate: [AuthGuard] },
  { path: 'simulations/:id', loadComponent: () => import('./features/simulations/simulation-board.component').then(m => m.SimulationBoardComponent), canActivate: [AuthGuard] },
  { path: 'team', loadComponent: () => import('./features/team/team-list.component').then(m => m.TeamListComponent), canActivate: [AuthGuard] },
  { path: 'team/:id', loadComponent: () => import('./features/team/team-detail.component').then(m => m.TeamDetailComponent), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
