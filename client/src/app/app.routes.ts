import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { ThemesListComponent } from './features/themes/themes-list.component';
import { ThemeDetailComponent } from './features/themes/theme-detail.component';
import { ThemeCreateComponent } from './features/themes/theme-create.component';
import { RoadmapComponent } from './features/roadmap/roadmap.component';
import { RoadmapKanbanComponent } from './features/roadmap/roadmap-kanban.component';
import { RoadmapGraphComponent } from './features/roadmap/roadmap-graph.component';
import { SubtopicDetailComponent } from './features/roadmap/subtopic-detail.component';
import { ProblemsLibraryComponent } from './features/problems/problems-library.component';
import { ProblemDetailComponent } from './features/problems/problem-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'themes', component: ThemesListComponent, canActivate: [AuthGuard] },
  { path: 'themes/create', component: ThemeCreateComponent, canActivate: [AuthGuard] },
  { path: 'themes/:id', component: ThemeDetailComponent, canActivate: [AuthGuard] },
  { path: 'roadmap', component: RoadmapComponent, canActivate: [AuthGuard] },
  { path: 'roadmap/kanban', component: RoadmapKanbanComponent, canActivate: [AuthGuard] },
  { path: 'roadmap/graph', component: RoadmapGraphComponent, canActivate: [AuthGuard] },
  { path: 'roadmap/:id/subtopics', component: SubtopicDetailComponent, canActivate: [AuthGuard] },
  { path: 'problems', component: ProblemsLibraryComponent, canActivate: [AuthGuard] },
  { path: 'problems/:id', component: ProblemDetailComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
