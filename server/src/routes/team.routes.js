import express from 'express';
import TeamConfig from '../models/TeamConfig.js';
import User from '../models/User.js';
import { protect, authorize } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get all teams
// @route   GET /api/team
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { 'settings.isPublic': true };
  
  const teams = await TeamConfig.find(query)
    .populate('coach members.userId', 'username email fullName');

  res.json({
    success: true,
    count: teams.length,
    data: { teams }
  });
}));

// @desc    Get single team
// @route   GET /api/team/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id)
    .populate('coach members.userId', 'username email fullName codeforcesHandle');

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  res.json({
    success: true,
    data: { team }
  });
}));

// @desc    Create team
// @route   POST /api/team
// @access  Private/Admin
router.post('/', authorize('admin'), asyncHandler(async (req, res) => {
  const teamData = {
    ...req.body,
    coach: req.user._id,
    members: [{
      userId: req.user._id,
      role: 'leader'
    }]
  };

  const team = await TeamConfig.create(teamData);

  res.status(201).json({
    success: true,
    message: 'Team created successfully',
    data: { team }
  });
}));

// @desc    Update team
// @route   PUT /api/team/:id
// @access  Private/Team Owner/Admin
router.put('/:id', asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is team owner or admin
  if (team.coach.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this team'
    });
  }

  const updatedTeam = await TeamConfig.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('coach members.userId');

  res.json({
    success: true,
    message: 'Team updated successfully',
    data: { team: updatedTeam }
  });
}));

// @desc    Add member to team
// @route   POST /api/team/:id/members
// @access  Private/Team Owner/Admin
router.post('/:id/members', asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is team owner or admin
  if (team.coach.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add members to this team'
    });
  }

  // Check if team is full
  if (team.members.length >= team.maxMembers) {
    return res.status(400).json({
      success: false,
      message: 'Team is full'
    });
  }

  // Check if user is already a member
  if (team.members.some(m => m.userId.toString() === userId)) {
    return res.status(400).json({
      success: false,
      message: 'User is already a member'
    });
  }

  team.members.push({ userId, role: 'member' });
  await team.save();

  res.json({
    success: true,
    message: 'Member added successfully',
    data: { team }
  });
}));

// @desc    Remove member from team
// @route   DELETE /api/team/:id/members/:userId
// @access  Private/Team Owner/Admin
router.delete('/:id/members/:userId', asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is team owner or admin
  if (team.coach.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to remove members from this team'
    });
  }

  team.members = team.members.filter(m => m.userId.toString() !== req.params.userId);
  await team.save();

  res.json({
    success: true,
    message: 'Member removed successfully',
    data: { team }
  });
}));

// @desc    Update team links (WhatsApp, Discord)
// @route   PUT /api/team/:id/links
// @access  Private/Team Owner/Admin
router.put('/:id/links', asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is team owner or admin
  if (team.coach.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update team links'
    });
  }

  const { whatsappGroup, discordServer } = req.body;

  if (whatsappGroup !== undefined) {
    team.links = team.links || {};
    team.links.whatsappGroup = whatsappGroup;
  }

  if (discordServer !== undefined) {
    team.links = team.links || {};
    team.links.discordServer = discordServer;
  }

  await team.save();

  res.json({
    success: true,
    message: 'Team links updated successfully',
    data: { team }
  });
}));

// @desc    Update team code template
// @route   PUT /api/team/:id/template
// @access  Private/Team Owner/Admin
router.put('/:id/template', asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is team owner or admin
  if (team.coach.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update team template'
    });
  }

  const { codeTemplate } = req.body;

  if (codeTemplate !== undefined) {
    team.codeTemplate = codeTemplate;
    await team.save();
  }

  res.json({
    success: true,
    message: 'Team code template updated successfully',
    data: { team }
  });
}));

// @desc    Delete team
// @route   DELETE /api/team/:id
// @access  Private/Admin
router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  await team.deleteOne();

  res.json({
    success: true,
    message: 'Team deleted successfully'
  });
}));

export default router;
