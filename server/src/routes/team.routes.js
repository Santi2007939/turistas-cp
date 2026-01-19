import express from 'express';
import TeamConfig from '../models/TeamConfig.js';
import User from '../models/User.js';
import { protect, authorize } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Rate limiter for team join/leave operations (max 5 requests per minute per user)
const teamActionLimiter = createRateLimiter(5, 60000, 'Too many team join/leave requests. Please try again later.');

// Rate limiter for team management operations (max 10 requests per minute per user)
const teamManagementLimiter = createRateLimiter(10, 60000, 'Too many team management requests. Please try again later.');

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
    coach: req.user._id
  };

  // Get all current members (users with isCurrentMember flag)
  const User = (await import('../models/User.js')).default;
  const currentMembers = await User.find({ 
    isCurrentMember: true,
    role: { $ne: 'admin' } // Exclude admin users
  });

  // Add current members to the team (excluding admin)
  teamData.members = currentMembers.map((member, index) => ({
    userId: member._id,
    isActive: index < 3 // First 3 members are active
  }));

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

  team.members.push({ 
    userId, 
    isActive: team.members.length <= 2 // First 3 members are active (0, 1, 2)
  });
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

  const updatedTeam = await TeamConfig.findById(req.params.id)
    .populate('coach members.userId', 'username email fullName');

  res.json({
    success: true,
    message: 'Member removed successfully',
    data: { team: updatedTeam }
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

  // Validate WhatsApp URL
  if (whatsappGroup !== undefined) {
    if (whatsappGroup && !whatsappGroup.match(/^https?:\/\/(chat\.)?whatsapp\.com\/.+/i)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid WhatsApp group URL format'
      });
    }
    team.links = team.links || {};
    team.links.whatsappGroup = whatsappGroup;
  }

  // Validate Discord URL
  if (discordServer !== undefined) {
    if (discordServer && !discordServer.match(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\/.+/i)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Discord server URL format'
      });
    }
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
    // Validate template size (max 100KB)
    if (codeTemplate.length > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Code template is too large (max 100KB)'
      });
    }
    team.codeTemplate = codeTemplate;
    await team.save();
  }

  res.json({
    success: true,
    message: 'Team code template updated successfully',
    data: { team }
  });
}));

// @desc    Join a team
// @route   POST /api/team/:id/join
// @access  Private
router.post('/:id/join', teamActionLimiter, asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
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
  if (team.members.some(m => m.userId.toString() === req.user._id.toString())) {
    return res.status(400).json({
      success: false,
      message: 'You are already a member of this team'
    });
  }

  // Check if team allows join requests (admins can bypass this setting)
  if (!team.settings.allowJoinRequests) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This team does not allow join requests'
      });
    }
    // Admin bypass - could log this for audit trail
    console.log(`Admin user ${req.user.username} joined team ${team.name} bypassing join restrictions`);
  }

  team.members.push({ 
    userId: req.user._id, 
    isActive: team.members.length <= 2 // First 3 members are active (0, 1, 2)
  });
  await team.save();

  const updatedTeam = await TeamConfig.findById(req.params.id)
    .populate('coach members.userId', 'username email fullName');

  res.json({
    success: true,
    message: 'Successfully joined the team',
    data: { team: updatedTeam }
  });
}));

// @desc    Toggle member active status
// @route   PUT /api/team/:id/members/:userId/active
// @access  Private/Team Member/Admin
router.put('/:id/members/:userId/active', teamManagementLimiter, asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is a team member or admin
  const isMember = team.members.some(m => 
    m.userId.toString() === req.user._id.toString()
  );
  const isCoach = team.coach && team.coach.toString() === req.user._id.toString();
  
  if (!isMember && !isCoach && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update member status'
    });
  }

  // Find the member to update
  const member = team.members.find(m => m.userId.toString() === req.params.userId);
  
  if (!member) {
    return res.status(404).json({
      success: false,
      message: 'Member not found in team'
    });
  }

  const { isActive } = req.body;
  
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActive must be a boolean value'
    });
  }

  // Count current active members
  const activeCount = team.members.filter(m => m.isActive).length;
  
  // If trying to activate and already at limit (3), prevent it
  if (isActive && !member.isActive && activeCount >= 3) {
    return res.status(400).json({
      success: false,
      message: 'Cannot activate member: maximum of 3 active members allowed'
    });
  }

  // Update the member's active status
  member.isActive = isActive;
  await team.save();

  const updatedTeam = await TeamConfig.findById(req.params.id)
    .populate('coach members.userId', 'username email fullName');

  res.json({
    success: true,
    message: `Member ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: { team: updatedTeam }
  });
}));

// @desc    Leave a team
// @route   POST /api/team/:id/leave
// @access  Private
router.post('/:id/leave', teamActionLimiter, asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is a member
  const memberIndex = team.members.findIndex(m => m.userId.toString() === req.user._id.toString());
  
  if (memberIndex === -1) {
    return res.status(400).json({
      success: false,
      message: 'You are not a member of this team'
    });
  }

  team.members.splice(memberIndex, 1);
  await team.save();

  res.json({
    success: true,
    message: 'Successfully left the team'
  });
}));

// @desc    Add code session to team
// @route   POST /api/team/:id/code-sessions
// @access  Private/Team Member/Admin
router.post('/:id/code-sessions', teamManagementLimiter, asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is a team member or admin
  const isMember = team.members.some(m => 
    m.userId.toString() === req.user._id.toString()
  );
  
  if (!isMember && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add code sessions'
    });
  }

  const { name, link } = req.body;

  if (!name || !link) {
    return res.status(400).json({
      success: false,
      message: 'Name and link are required'
    });
  }

  // Validate link format (basic URL validation)
  try {
    new URL(link);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid URL format for link'
    });
  }

  // Initialize codeSessions array if it doesn't exist
  if (!team.codeSessions) {
    team.codeSessions = [];
  }

  team.codeSessions.push({ name, link });
  await team.save();

  const updatedTeam = await TeamConfig.findById(req.params.id)
    .populate('coach members.userId', 'username email fullName');

  res.status(201).json({
    success: true,
    message: 'Code session added successfully',
    data: { team: updatedTeam }
  });
}));

// @desc    Update code session name
// @route   PUT /api/team/:id/code-sessions/:sessionId
// @access  Private/Team Member/Admin
router.put('/:id/code-sessions/:sessionId', teamManagementLimiter, asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is a team member or admin
  const isMember = team.members.some(m => 
    m.userId.toString() === req.user._id.toString()
  );
  
  if (!isMember && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update code sessions'
    });
  }

  const session = team.codeSessions.id(req.params.sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Code session not found'
    });
  }

  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Name is required'
    });
  }

  session.name = name;
  await team.save();

  const updatedTeam = await TeamConfig.findById(req.params.id)
    .populate('coach members.userId', 'username email fullName');

  res.json({
    success: true,
    message: 'Code session updated successfully',
    data: { team: updatedTeam }
  });
}));

// @desc    Delete code session
// @route   DELETE /api/team/:id/code-sessions/:sessionId
// @access  Private/Team Member/Admin
router.delete('/:id/code-sessions/:sessionId', teamManagementLimiter, asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is a team member or admin
  const isMember = team.members.some(m => 
    m.userId.toString() === req.user._id.toString()
  );
  
  if (!isMember && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete code sessions'
    });
  }

  const session = team.codeSessions.id(req.params.sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Code session not found'
    });
  }

  session.deleteOne();
  await team.save();

  const updatedTeam = await TeamConfig.findById(req.params.id)
    .populate('coach members.userId', 'username email fullName');

  res.json({
    success: true,
    message: 'Code session deleted successfully',
    data: { team: updatedTeam }
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

// @desc    Add Excalidraw session to team
// @route   POST /api/team/:id/excalidraw-sessions
// @access  Private/Team Member/Admin
router.post('/:id/excalidraw-sessions', teamManagementLimiter, asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is a team member or admin
  const isMember = team.members.some(m => 
    m.userId.toString() === req.user._id.toString()
  );
  
  if (!isMember && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add Excalidraw sessions'
    });
  }

  const { name, linkedToCodeSessionId } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Session name is required'
    });
  }

  // Import and use excalidraw service
  const excalidrawService = (await import('../services/excalidraw.service.js')).default;
  const roomId = excalidrawService.generateRoomId();
  const roomKey = excalidrawService.generateRoomKey();
  const url = excalidrawService.getShareableLink(roomId, roomKey);

  // Initialize excalidrawSessions array if it doesn't exist
  if (!team.excalidrawSessions) {
    team.excalidrawSessions = [];
  }

  const newSession = {
    name,
    roomId,
    roomKey,
    url,
    linkedToCodeSessionId: linkedToCodeSessionId || null
  };

  team.excalidrawSessions.push(newSession);

  // If linking to a code session, update that session too
  if (linkedToCodeSessionId) {
    const codeSession = team.codeSessions.id(linkedToCodeSessionId);
    if (codeSession) {
      if (!codeSession.linkedExcalidrawSessions) {
        codeSession.linkedExcalidrawSessions = [];
      }
      const sessionId = team.excalidrawSessions[team.excalidrawSessions.length - 1]._id;
      codeSession.linkedExcalidrawSessions.push(sessionId);
    }
  }

  await team.save();

  const updatedTeam = await TeamConfig.findById(req.params.id)
    .populate('coach members.userId', 'username email fullName');

  res.status(201).json({
    success: true,
    message: 'Excalidraw session added successfully',
    data: { team: updatedTeam }
  });
}));

// @desc    Update Excalidraw session
// @route   PUT /api/team/:id/excalidraw-sessions/:sessionId
// @access  Private/Team Member/Admin
router.put('/:id/excalidraw-sessions/:sessionId', teamManagementLimiter, asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is a team member or admin
  const isMember = team.members.some(m => 
    m.userId.toString() === req.user._id.toString()
  );
  
  if (!isMember && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update Excalidraw sessions'
    });
  }

  const session = team.excalidrawSessions.id(req.params.sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Excalidraw session not found'
    });
  }

  const { name, linkedToCodeSessionId } = req.body;

  if (name) {
    session.name = name;
  }

  // Handle linking/unlinking
  if (linkedToCodeSessionId !== undefined) {
    const oldLinkedSessionId = session.linkedToCodeSessionId;

    // Remove from old code session if exists
    if (oldLinkedSessionId) {
      const oldCodeSession = team.codeSessions.id(oldLinkedSessionId);
      if (oldCodeSession && oldCodeSession.linkedExcalidrawSessions) {
        oldCodeSession.linkedExcalidrawSessions = oldCodeSession.linkedExcalidrawSessions.filter(
          id => id.toString() !== req.params.sessionId
        );
      }
    }

    // Add to new code session if provided
    if (linkedToCodeSessionId) {
      const newCodeSession = team.codeSessions.id(linkedToCodeSessionId);
      if (newCodeSession) {
        if (!newCodeSession.linkedExcalidrawSessions) {
          newCodeSession.linkedExcalidrawSessions = [];
        }
        newCodeSession.linkedExcalidrawSessions.push(req.params.sessionId);
      }
    }

    session.linkedToCodeSessionId = linkedToCodeSessionId || null;
  }

  await team.save();

  const updatedTeam = await TeamConfig.findById(req.params.id)
    .populate('coach members.userId', 'username email fullName');

  res.json({
    success: true,
    message: 'Excalidraw session updated successfully',
    data: { team: updatedTeam }
  });
}));

// @desc    Delete Excalidraw session
// @route   DELETE /api/team/:id/excalidraw-sessions/:sessionId
// @access  Private/Team Member/Admin
router.delete('/:id/excalidraw-sessions/:sessionId', teamManagementLimiter, asyncHandler(async (req, res) => {
  const team = await TeamConfig.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is a team member or admin
  const isMember = team.members.some(m => 
    m.userId.toString() === req.user._id.toString()
  );
  
  if (!isMember && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete Excalidraw sessions'
    });
  }

  const session = team.excalidrawSessions.id(req.params.sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Excalidraw session not found'
    });
  }

  // Remove from linked code session if exists
  if (session.linkedToCodeSessionId) {
    const codeSession = team.codeSessions.id(session.linkedToCodeSessionId);
    if (codeSession && codeSession.linkedExcalidrawSessions) {
      codeSession.linkedExcalidrawSessions = codeSession.linkedExcalidrawSessions.filter(
        id => id.toString() !== req.params.sessionId
      );
    }
  }

  session.deleteOne();
  await team.save();

  const updatedTeam = await TeamConfig.findById(req.params.id)
    .populate('coach members.userId', 'username email fullName');

  res.json({
    success: true,
    message: 'Excalidraw session deleted successfully',
    data: { team: updatedTeam }
  });
}));

export default router;
