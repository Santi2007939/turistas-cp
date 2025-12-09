# Angular Frontend Features

This document describes the Angular frontend components and their integration with the backend API.

## Overview

The Turistas CP frontend is built with Angular 19+ and uses standalone components. It provides a modern, responsive UI for competitive programming training and team collaboration.

## Core Services

### ApiService
Located at: `src/app/core/services/api.service.ts`

A wrapper around Angular's HttpClient that:
- Automatically includes JWT tokens in requests
- Provides typed HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Handles headers and authentication

### AuthService
Located at: `src/app/core/services/auth.service.ts`

Manages user authentication:
- Login and registration
- Token storage and management
- User session state
- Profile updates

### ThemesService
Located at: `src/app/core/services/themes.service.ts`

Connects to `/api/themes` endpoints:
- Get all themes
- Get single theme by ID
- Create new theme
- Update theme
- Delete theme

### RoadmapService
Located at: `src/app/core/services/roadmap.service.ts`

Connects to `/api/roadmap` endpoints:
- Get user's roadmap
- Create/update roadmap nodes
- Delete roadmap nodes

### TeamService
Located at: `src/app/core/services/team.service.ts`

Connects to `/api/team` endpoints:
- Get all teams
- Get single team by ID
- Create new team
- Update team
- Join/leave team

## Feature Modules

### Themes Module

**Components:**
- `ThemesListComponent` - Displays all available themes in a grid
- `ThemeDetailComponent` - Shows detailed information about a theme

**Features:**
- Browse themes by category and difficulty
- View theme resources (articles, videos, tutorials)
- Add themes to personal roadmap
- Visual difficulty indicators (beginner, intermediate, advanced, expert)
- Category badges

**Routes:**
- `/themes` - List all themes
- `/themes/:id` - Theme details

### Roadmap Module

**Components:**
- `RoadmapComponent` - Personal learning roadmap with progress tracking

**Features:**
- Visual progress tracking for each theme
- Status management (Not Started, In Progress, Completed, Mastered)
- Progress percentage with visual progress bars
- Personal notes for each theme
- Statistics overview (count by status)
- Add new themes to roadmap
- Update progress and notes
- Remove themes from roadmap

**Routes:**
- `/roadmap` - Personal roadmap

**UI Elements:**
- Progress overview cards showing counts by status
- Interactive modals for adding/updating themes
- Progress bars for visual feedback
- Color-coded status badges

### Team Module

**Components:**
- `TeamListComponent` - Displays all teams
- `TeamDetailComponent` - Shows detailed team information

**Features:**
- Browse all teams
- View team statistics (problems solved, contests, ratings)
- Join public teams
- View team members and their roles
- Access Excalidraw collaboration rooms
- Team settings display

**Routes:**
- `/team` - List all teams
- `/team/:id` - Team details

**Shared Utilities:**
- `TeamUtils` class provides reusable methods for:
  - Checking team membership
  - Getting user role in team
  - Handling both string and populated user IDs

## Routing

All routes are defined in `src/app/app.routes.ts` and protected by `AuthGuard`:

```typescript
{ path: 'themes', component: ThemesListComponent, canActivate: [AuthGuard] }
{ path: 'themes/:id', component: ThemeDetailComponent, canActivate: [AuthGuard] }
{ path: 'roadmap', component: RoadmapComponent, canActivate: [AuthGuard] }
{ path: 'team', component: TeamListComponent, canActivate: [AuthGuard] }
{ path: 'team/:id', component: TeamDetailComponent, canActivate: [AuthGuard] }
```

## Styling

The application uses **Tailwind CSS** for styling with a consistent design system:

### Color Scheme
- Primary: Blue (`blue-500`, `blue-600`)
- Success: Green (`green-500`, `green-600`)
- Warning: Yellow (`yellow-500`, `yellow-600`)
- Danger: Red (`red-500`, `red-600`)
- Info: Purple (`purple-500`, `purple-600`)

### Difficulty Badges
- Beginner: Green
- Intermediate: Yellow
- Advanced: Orange
- Expert: Red

### Status Indicators (Roadmap)
- Not Started: Gray
- In Progress: Blue
- Completed: Green
- Mastered: Purple

## Data Flow

1. **Component** requests data from **Service**
2. **Service** uses **ApiService** to make HTTP request
3. **ApiService** adds authentication headers and calls backend
4. **Backend** processes request and returns data
5. **Service** receives response and returns Observable
6. **Component** subscribes to Observable and updates UI

## Type Safety

All services use TypeScript interfaces for type safety:

```typescript
interface Theme {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  resources: Resource[];
  // ...
}
```

## Error Handling

All components handle errors gracefully:
- Display error messages to users
- Log errors to console
- Fallback UI states for loading and error conditions

## Best Practices

1. **Standalone Components**: All components are standalone for better tree-shaking
2. **Type Safety**: Strong typing throughout with TypeScript interfaces
3. **Reusable Utilities**: Shared logic extracted to utility classes
4. **Reactive Programming**: RxJS Observables for async operations
5. **Modular Design**: Feature-based module organization
6. **Protected Routes**: All main routes protected by authentication guard
7. **Responsive Design**: Tailwind CSS for mobile-first responsive layouts

## Future Enhancements

Planned features mentioned in the dashboard:
- Problems module (practice and exercises)
- Calendar module (contests and events)
- Statistics module (progress analytics)
- Achievements module (gamification)

## Development Guidelines

1. **Creating New Features**:
   - Create service in `core/services`
   - Create components in `features/[feature-name]`
   - Add routes in `app.routes.ts`
   - Update dashboard with navigation link

2. **Adding API Endpoints**:
   - Define TypeScript interfaces for request/response
   - Create methods in appropriate service
   - Handle errors appropriately
   - Document in this file

3. **Styling**:
   - Use Tailwind utility classes
   - Follow existing color scheme
   - Ensure responsive design
   - Test on multiple screen sizes
