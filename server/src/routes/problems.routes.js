import express from 'express';
import Problem from '../models/Problem.js';
import { protect } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';
import codeforcesService from '../services/codeforces.service.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

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

// @desc    Fetch Codeforces problem details
// @route   GET /api/problems/codeforces/:contestId/:index
// @access  Private
router.get('/codeforces/:contestId/:index', asyncHandler(async (req, res) => {
  const { contestId, index } = req.params;

  const problemDetails = await codeforcesService.getProblemDetails(contestId, index);

  res.json({
    success: true,
    data: { problem: problemDetails }
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

// @desc    Create problem
// @route   POST /api/problems
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const problemData = {
    ...req.body,
    addedBy: req.user._id
  };

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
