# Turistas CP - Angular Client

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 19.2.19.

## 🎯 Features

### Themes Module
Browse and explore learning topics for competitive programming:
- View all available themes with filtering by category and difficulty
- Detailed theme information with resources
- Add themes to personal roadmap

### Roadmap Module
Track your personal learning journey:
- Visual progress tracking for each theme
- Status management (Not Started, In Progress, Completed, Mastered)
- Progress percentage tracking
- Personal notes for each theme
- Statistics dashboard showing progress overview

### Team Module
Collaborate with your team:
- View all teams and their statistics
- Join public teams
- Team details with member list
- Team statistics (problems solved, contests, average rating)
- Excalidraw collaboration rooms

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/          # Core services
│   │   │   ├── api.service.ts        # HTTP client wrapper
│   │   │   ├── auth.service.ts       # Authentication
│   │   │   ├── themes.service.ts     # Themes API
│   │   │   ├── roadmap.service.ts    # Roadmap API
│   │   │   └── team.service.ts       # Team API
│   │   └── guards/            # Route guards
│   │       └── auth.guard.ts
│   ├── shared/
│   │   └── utils/             # Shared utilities
│   │       └── team.utils.ts         # Team helper functions
│   ├── features/              # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── dashboard/         # Main dashboard
│   │   ├── themes/            # Themes feature
│   │   ├── roadmap/           # Roadmap feature
│   │   └── team/              # Team feature
│   ├── app.routes.ts          # Application routes
│   └── app.config.ts          # Application configuration
└── ...
```

## 🚀 Development server

Run `npm start` or `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

**Note:** Make sure the backend API is running at `http://localhost:3000` for full functionality.

## 🔧 Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## 🏗️ Build

Run `npm run build` or `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## 🧪 Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration can be found in `tailwind.config.js`.

## 🔌 API Integration

All services use the `ApiService` which connects to the backend API. The API URL is configured in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

## 📝 Routes

- `/auth/login` - User login
- `/auth/register` - User registration
- `/dashboard` - Main dashboard (protected)
- `/themes` - Browse themes (protected)
- `/themes/:id` - Theme details (protected)
- `/roadmap` - Personal roadmap (protected)
- `/team` - Team list (protected)
- `/team/:id` - Team details (protected)

## 🛡️ Authentication

The application uses JWT tokens for authentication. Tokens are stored in localStorage and automatically included in API requests via the `ApiService`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
