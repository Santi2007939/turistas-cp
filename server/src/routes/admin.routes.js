import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.js';
import User from '../models/User.js';
import { asyncHandler } from '../middlewares/error.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// @desc    Get all users (including inactive ones)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.status(200).json(users);
}));

export default router;
