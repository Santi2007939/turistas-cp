import express from 'express';
import Achievement from '../models/Achievement.js';
import { protect, authorize } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get all achievements
// @route   GET /api/achievements
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const achievements = await Achievement.find({ isActive: true });

  res.json({
    success: true,
    count: achievements.length,
    data: { achievements }
  });
}));

// @desc    Get user achievements
// @route   GET /api/achievements/user/:userId
// @access  Private
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const achievements = await Achievement.find({
    'unlockedBy.userId': req.params.userId,
    isActive: true
  });

  res.json({
    success: true,
    count: achievements.length,
    data: { achievements }
  });
}));

// @desc    Get single achievement
// @route   GET /api/achievements/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id)
    .populate('unlockedBy.userId', 'username fullName');

  if (!achievement) {
    return res.status(404).json({
      success: false,
      message: 'Achievement not found'
    });
  }

  res.json({
    success: true,
    data: { achievement }
  });
}));

// @desc    Create achievement
// @route   POST /api/achievements
// @access  Private/Admin
router.post('/', authorize('admin'), asyncHandler(async (req, res) => {
  const achievement = await Achievement.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Achievement created successfully',
    data: { achievement }
  });
}));

// @desc    Update achievement
// @route   PUT /api/achievements/:id
// @access  Private/Admin
router.put('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id);

  if (!achievement) {
    return res.status(404).json({
      success: false,
      message: 'Achievement not found'
    });
  }

  const updatedAchievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    message: 'Achievement updated successfully',
    data: { achievement: updatedAchievement }
  });
}));

// @desc    Unlock achievement for user
// @route   POST /api/achievements/:id/unlock
// @access  Private
router.post('/:id/unlock', asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id);

  if (!achievement) {
    return res.status(404).json({
      success: false,
      message: 'Achievement not found'
    });
  }

  // Check if already unlocked
  const alreadyUnlocked = achievement.unlockedBy.some(
    u => u.userId.toString() === req.user._id.toString()
  );

  if (alreadyUnlocked) {
    return res.status(400).json({
      success: false,
      message: 'Achievement already unlocked'
    });
  }

  achievement.unlockedBy.push({ userId: req.user._id });
  await achievement.save();

  res.json({
    success: true,
    message: 'Achievement unlocked successfully',
    data: { achievement }
  });
}));

// @desc    Delete achievement
// @route   DELETE /api/achievements/:id
// @access  Private/Admin
router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id);

  if (!achievement) {
    return res.status(404).json({
      success: false,
      message: 'Achievement not found'
    });
  }

  await achievement.deleteOne();

  res.json({
    success: true,
    message: 'Achievement deleted successfully'
  });
}));

export default router;
