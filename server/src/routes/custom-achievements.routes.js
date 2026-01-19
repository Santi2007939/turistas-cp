import express from 'express';
import CustomAchievement from '../models/CustomAchievement.js';
import TeamConfig from '../models/TeamConfig.js';
import { protect } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Rate limiter for achievement operations (max 30 requests per minute for reads, 10 for writes)
const achievementReadLimiter = createRateLimiter(30, 60000, 'Too many achievement requests. Please try again later.');
const achievementWriteLimiter = createRateLimiter(10, 60000, 'Too many achievement modification requests. Please try again later.');

// All routes require authentication
router.use(protect);

// @desc    Get all custom achievements (personal + team where user is member)
// @route   GET /api/custom-achievements
// @access  Private
router.get('/', achievementReadLimiter, asyncHandler(async (req, res) => {
  // Get ALL personal achievements (users can view everyone's achievements, edit only their own)
  // This follows the app pattern: "puedes ver el de todos, pero solo puedes editar el tuyo"
  const personalAchievements = await CustomAchievement.find({
    scope: 'personal',
    isActive: true
  }).populate('createdBy', 'username fullName');

  // Get user's team IDs
  const userTeams = await TeamConfig.find({
    'members.userId': req.user._id
  }).select('_id');

  const teamIds = userTeams.map(t => t._id);

  // Get team achievements
  const teamAchievements = await CustomAchievement.find({
    scope: 'team',
    teamId: { $in: teamIds },
    isActive: true
  }).populate('createdBy', 'username fullName')
    .populate('teamId', 'name');

  const achievements = [...personalAchievements, ...teamAchievements];

  res.json({
    success: true,
    count: achievements.length,
    data: { achievements }
  });
}));

// @desc    Get user's own custom achievements
// @route   GET /api/custom-achievements/my
// @access  Private
router.get('/my', achievementReadLimiter, asyncHandler(async (req, res) => {
  const achievements = await CustomAchievement.find({
    createdBy: req.user._id,
    isActive: true
  }).populate('teamId', 'name');

  res.json({
    success: true,
    count: achievements.length,
    data: { achievements }
  });
}));

// @desc    Get single custom achievement
// @route   GET /api/custom-achievements/:id
// @access  Private
router.get('/:id', achievementReadLimiter, asyncHandler(async (req, res) => {
  const achievement = await CustomAchievement.findById(req.params.id)
    .populate('createdBy', 'username fullName')
    .populate('teamId', 'name members');

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

// @desc    Create custom achievement
// @route   POST /api/custom-achievements
// @access  Private
router.post('/', achievementWriteLimiter, asyncHandler(async (req, res) => {
  const { name, description, photo, category, scope, teamId, achievedAt } = req.body;

  // If team achievement, verify user is member of the team
  if (scope === 'team') {
    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID is required for team achievements'
      });
    }

    const team = await TeamConfig.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const isActiveMember = team.members.some(m => 
      m.userId.toString() === req.user._id.toString() && m.isActive === true
    );

    if (!isActiveMember) {
      return res.status(403).json({
        success: false,
        message: 'Only active team members can create team achievements'
      });
    }
  }

  const achievement = await CustomAchievement.create({
    name,
    description,
    photo,
    category,
    scope,
    teamId: scope === 'team' ? teamId : undefined,
    createdBy: req.user._id,
    achievedAt: achievedAt || Date.now()
  });

  const populatedAchievement = await CustomAchievement.findById(achievement._id)
    .populate('createdBy', 'username fullName')
    .populate('teamId', 'name');

  res.status(201).json({
    success: true,
    message: 'Achievement created successfully',
    data: { achievement: populatedAchievement }
  });
}));

// @desc    Update custom achievement
// @route   PUT /api/custom-achievements/:id
// @access  Private (owner for personal, active team member for team)
router.put('/:id', achievementWriteLimiter, asyncHandler(async (req, res) => {
  const achievement = await CustomAchievement.findById(req.params.id);

  if (!achievement) {
    return res.status(404).json({
      success: false,
      message: 'Achievement not found'
    });
  }

  // Check permissions
  if (achievement.scope === 'personal') {
    // Only owner can edit personal achievements
    if (achievement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can edit personal achievements'
      });
    }
  } else if (achievement.scope === 'team') {
    // Active team members can edit team achievements
    const team = await TeamConfig.findById(achievement.teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const isActiveMember = team.members.some(m => 
      m.userId.toString() === req.user._id.toString() && m.isActive === true
    );

    if (!isActiveMember) {
      return res.status(403).json({
        success: false,
        message: 'Only active team members can edit team achievements'
      });
    }
  }

  const { name, description, photo, category, achievedAt } = req.body;

  if (name !== undefined) achievement.name = name;
  if (description !== undefined) achievement.description = description;
  if (photo !== undefined) achievement.photo = photo;
  if (category !== undefined) achievement.category = category;
  if (achievedAt !== undefined) achievement.achievedAt = achievedAt;

  await achievement.save();

  const updatedAchievement = await CustomAchievement.findById(achievement._id)
    .populate('createdBy', 'username fullName')
    .populate('teamId', 'name');

  res.json({
    success: true,
    message: 'Achievement updated successfully',
    data: { achievement: updatedAchievement }
  });
}));

// @desc    Delete custom achievement
// @route   DELETE /api/custom-achievements/:id
// @access  Private (owner for personal, active team member for team)
router.delete('/:id', achievementWriteLimiter, asyncHandler(async (req, res) => {
  const achievement = await CustomAchievement.findById(req.params.id);

  if (!achievement) {
    return res.status(404).json({
      success: false,
      message: 'Achievement not found'
    });
  }

  // Check permissions
  if (achievement.scope === 'personal') {
    // Only owner can delete personal achievements
    if (achievement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete personal achievements'
      });
    }
  } else if (achievement.scope === 'team') {
    // Active team members can delete team achievements
    const team = await TeamConfig.findById(achievement.teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const isActiveMember = team.members.some(m => 
      m.userId.toString() === req.user._id.toString() && m.isActive === true
    );

    if (!isActiveMember) {
      return res.status(403).json({
        success: false,
        message: 'Only active team members can delete team achievements'
      });
    }
  }

  await achievement.deleteOne();

  res.json({
    success: true,
    message: 'Achievement deleted successfully'
  });
}));

export default router;
