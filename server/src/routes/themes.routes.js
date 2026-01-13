import express from 'express';
import { getThemes, getTheme, createTheme, updateTheme, deleteTheme, getSubtopicContent, deleteSubtopicGlobally } from '../controllers/themes.controller.js';
import { protect } from '../middlewares/auth.js';
import { validateId } from '../middlewares/validation.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Rate limiters for subtopic operations
const subtopicReadLimiter = createRateLimiter(30, 60000, 'Too many subtopic requests. Please try again later.');
const subtopicWriteLimiter = createRateLimiter(10, 60000, 'Too many subtopic modification requests. Please try again later.');

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getThemes)
  .post(createTheme);

router.route('/:id')
  .get(validateId(), getTheme)
  .put(validateId(), updateTheme)
  .delete(validateId(), deleteTheme);

// Subtopic routes - must come after /:id routes
router.route('/:id/subtopics/:subtopicName')
  .get(validateId(), subtopicReadLimiter, getSubtopicContent)
  .delete(validateId(), subtopicWriteLimiter, deleteSubtopicGlobally);

export default router;
