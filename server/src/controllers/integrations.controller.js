import codeforcesService from '../services/codeforces.service.js';
import excalidrawService from '../services/excalidraw.service.js';
import rpcService from '../services/rpc.service.js';
import usacoIDEService from '../services/usaco-ide.service.js';
import { asyncHandler } from '../middlewares/error.js';

// Codeforces Integration

// @desc    Get Codeforces user info
// @route   GET /api/integrations/codeforces/user/:handle
// @access  Private
export const getCodeforcesUser = asyncHandler(async (req, res) => {
  const { handle } = req.params;
  const userInfo = await codeforcesService.getUserInfo(handle);

  res.json({
    success: true,
    data: { userInfo }
  });
});

// @desc    Get Codeforces rating history
// @route   GET /api/integrations/codeforces/rating/:handle
// @access  Private
export const getCodeforcesRating = asyncHandler(async (req, res) => {
  const { handle } = req.params;
  const ratingHistory = await codeforcesService.getRatingHistory(handle);

  res.json({
    success: true,
    data: { ratingHistory }
  });
});

// @desc    Get upcoming Codeforces contests
// @route   GET /api/integrations/codeforces/contests
// @access  Private
export const getCodeforcesContests = asyncHandler(async (req, res) => {
  const contests = await codeforcesService.getUpcomingContests();

  res.json({
    success: true,
    data: { contests }
  });
});

// Excalidraw Integration

// @desc    Create Excalidraw room
// @route   POST /api/integrations/excalidraw/room
// @access  Private
export const createExcalidrawRoom = asyncHandler(async (req, res) => {
  const { roomName, teamId } = req.body;
  const room = await excalidrawService.createRoom(roomName, teamId);

  res.status(201).json({
    success: true,
    message: 'Excalidraw room created successfully',
    data: { room }
  });
});

// RPC Integration

// @desc    Get RPC upcoming contests
// @route   GET /api/integrations/rpc/contests
// @access  Private
export const getRPCContests = asyncHandler(async (req, res) => {
  const contests = await rpcService.getUpcomingContests();

  res.json({
    success: true,
    data: contests
  });
});

// @desc    Get RPC registration URL
// @route   GET /api/integrations/rpc/register/:contestId?
// @access  Private
export const getRPCRegistrationUrl = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const url = rpcService.getRegistrationUrl(contestId);

  res.json({
    success: true,
    data: { registrationUrl: url }
  });
});

// USACO IDE Integration

// @desc    Execute code in USACO IDE
// @route   POST /api/integrations/usaco-ide/execute
// @access  Private
export const executeCode = asyncHandler(async (req, res) => {
  const { code, language, input } = req.body;
  const result = await usacoIDEService.executeCode(code, language, input);

  res.json({
    success: true,
    data: { result }
  });
});

// @desc    Get supported languages
// @route   GET /api/integrations/usaco-ide/languages
// @access  Private
export const getSupportedLanguages = asyncHandler(async (req, res) => {
  const languages = usacoIDEService.getSupportedLanguages();

  res.json({
    success: true,
    data: { languages }
  });
});

// @desc    Get code template
// @route   GET /api/integrations/usaco-ide/template/:language
// @access  Private
export const getCodeTemplate = asyncHandler(async (req, res) => {
  const { language } = req.params;
  const { teamId } = req.query;
  
  let template = usacoIDEService.getTemplate(language);
  
  // If teamId is provided, try to get team's custom template
  if (teamId) {
    const TeamConfig = (await import('../models/TeamConfig.js')).default;
    const team = await TeamConfig.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user is a member of the team
    const isMember = team.members.some(m => m.userId.toString() === req.user._id.toString());
    const isCoach = team.coach && team.coach.toString() === req.user._id.toString();
    
    if (!isMember && !isCoach && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this team\'s template'
      });
    }
    
    if (team.codeTemplate) {
      template = team.codeTemplate;
    }
  }

  res.json({
    success: true,
    data: { template, language }
  });
})