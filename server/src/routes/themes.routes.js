import express from 'express';
import { getThemes, getTheme, createTheme, updateTheme, deleteTheme } from '../controllers/themes.controller.js';
import { protect } from '../middlewares/auth.js';
import { validateId } from '../middlewares/validation.js';

const router = express.Router();

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

export default router;
