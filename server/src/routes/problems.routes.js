import express from 'express';
import Problem from '../models/Problem.js';
import { protect } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';
import codeforcesService from '../services/codeforces.service.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Fetch problem data from Codeforces URL
// @route   POST /api/problems/fetch-codeforces
// @access  Private
router.post('/fetch-codeforces', asyncHandler(async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'URL is required'
    });
  }

  const problemData = await codeforcesService.getProblemFromUrl(url);

  res.json({
    success: true,
    message: 'Problem data fetched successfully',
    data: { problem: problemData }
  });
}));

// @desc    Get personal problems
// @route   GET /api/problems/personal/:userId
// @access  Private
router.get('/personal/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Users can only view their own personal problems
  if (userId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view personal problems of other users'
    });
  }
  
  const personalProblems = await Problem.find({ owner: 'personal', createdBy: userId })
    .populate('themes addedBy createdBy', 'name username');

  res.json({
    success: true,
    count: personalProblems.length,
    data: { problems: personalProblems }
  });
}));

// @desc    Get team problems
// @route   GET /api/problems/team
// @access  Private
router.get('/team', asyncHandler(async (req, res) => {
  const teamProblems = await Problem.find({ owner: 'team' })
    .populate('themes addedBy createdBy', 'name username');

  res.json({
    success: true,
    count: teamProblems.length,
    data: { problems: teamProblems }
  });
}));

// @desc    Get other members' problems
// @route   GET /api/problems/members/:userId
// @access  Private
router.get('/members/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Verify the userId matches the authenticated user
  if (userId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view members problems from another user perspective'
    });
  }
  
  const memberProblems = await Problem.find({ owner: 'personal', createdBy: { $ne: userId } })
    .populate('themes addedBy createdBy', 'name username');

  res.json({
    success: true,
    count: memberProblems.length,
    data: { problems: memberProblems }
  });
}));

// @desc    Get all problems
// @route   GET /api/problems
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { platform, difficulty, tags } = req.query;
  const query = { isPublic: true };

  if (platform) query.platform = platform;
  if (difficulty) query.difficulty = difficulty;
  if (tags) query.tags = { $in: tags.split(',') };

  const problems = await Problem.find(query).populate('themes addedBy', 'name username');

  res.json({
    success: true,
    count: problems.length,
    data: { problems }
  });
}));

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const problem = await Problem.findById(req.params.id).populate('themes addedBy');

  if (!problem) {
    return res.status(404).json({
      success: false,
      message: 'Problem not found'
    });
  }

  res.json({
    success: true,
    data: { problem }
  });
}));

// @desc    Check if a problem exists by URL
// @route   POST /api/problems/check-duplicate
// @access  Private
router.post('/check-duplicate', asyncHandler(async (req, res) => {
  const { url, platform, platformId, owner } = req.body;
  const userId = req.user._id.toString();

  // Only check for duplicates when creating personal problems
  if (owner !== 'personal') {
    return res.json({
      success: true,
      data: { exists: false, problems: [] }
    });
  }

  // Build query to find existing problems with same URL or platform/platformId
  const queryConditions = [];
  
  if (url) {
    queryConditions.push({ url: url });
  }
  
  if (platform && platformId) {
    queryConditions.push({ platform: platform, platformId: platformId });
  }

  if (queryConditions.length === 0) {
    return res.json({
      success: true,
      data: { exists: false, problems: [] }
    });
  }

  // Find existing problems (excluding user's own problems)
  const existingProblems = await Problem.find({
    $and: [
      { $or: queryConditions },
      { createdBy: { $ne: userId } }
    ]
  }).populate('createdBy', 'username');

  res.json({
    success: true,
    data: {
      exists: existingProblems.length > 0,
      problems: existingProblems.map(p => ({
        _id: p._id,
        title: p.title,
        platform: p.platform,
        owner: p.owner,
        createdBy: p.createdBy
      }))
    }
  });
}));

// @desc    Create problem
// @route   POST /api/problems
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const { forceCreate, ...restBody } = req.body;
  
  const problemData = {
    ...restBody,
    addedBy: req.user._id,
    createdBy: req.user._id
  };

  // For personal problems, clear platformId to avoid unique constraint issues
  // when user wants to track a problem that exists as team or another personal problem
  if (problemData.owner === 'personal' && forceCreate) {
    // Generate a unique platformId suffix for personal copies
    problemData.platformId = problemData.platformId 
      ? `${problemData.platformId}-personal-${req.user._id}` 
      : undefined;
  }

  const problem = await Problem.create(problemData);

  res.status(201).json({
    success: true,
    message: 'Problem created successfully',
    data: { problem }
  });
}));

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private
router.put('/:id', asyncHandler(async (req, res) => {
  const problem = await Problem.findById(req.params.id);

  if (!problem) {
    return res.status(404).json({
      success: false,
      message: 'Problem not found'
    });
  }

  // Check edit permissions: only personal problems owned by user or team problems can be edited
  if (problem.owner === 'personal' && problem.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to edit this problem'
    });
  }

  const updatedProblem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    message: 'Problem updated successfully',
    data: { problem: updatedProblem }
  });
}));

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const problem = await Problem.findById(req.params.id);

  if (!problem) {
    return res.status(404).json({
      success: false,
      message: 'Problem not found'
    });
  }

  await problem.deleteOne();

  res.json({
    success: true,
    message: 'Problem deleted successfully'
  });
}));

export default router;
