import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middlewares/error.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import adminRoutes from './routes/admin.routes.js';
import themesRoutes from './routes/themes.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';
import problemsRoutes from './routes/problems.routes.js';
import contestsRoutes from './routes/contests.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import achievementsRoutes from './routes/achievements.routes.js';
import integrationsRoutes from './routes/integrations.routes.js';
import teamRoutes from './routes/team.routes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Turistas CP API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/themes', themesRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/contests', contestsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/team', teamRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          🏔️  Turistas CP - API Server                     ║
║                                                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}                                    ║
║  Port: ${PORT}                                              ║
║  Database: MongoDB Atlas                                  ║
║                                                           ║
║  Server running at http://localhost:${PORT}                ║
║  Health check: http://localhost:${PORT}/health             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

export default app;
