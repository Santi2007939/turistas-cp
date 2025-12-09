import express from 'express';
import Contest from '../models/Contest.js';
import { protect } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get all contests
// @route   GET /api/contests
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { platform, upcoming } = req.query;
  const query = { isPublic: true };

  if (platform) query.platform = platform;
  if (upcoming === 'true') {
    query.startTime = { $gte: new Date() };
  }

  const contests = await Contest.find(query)
    .sort({ startTime: -1 })
    .populate('createdBy problems', 'username title');

  res.json({
    success: true,
    count: contests.length,
    data: { contests }
  });
}));

// @desc    Get single contest
// @route   GET /api/contests/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id)
    .populate('createdBy problems participants.userId');

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  res.json({
    success: true,
    data: { contest }
  });
}));

// @desc    Create contest
// @route   POST /api/contests
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const contestData = {
    ...req.body,
    createdBy: req.user._id
  };

  const contest = await Contest.create(contestData);

  res.status(201).json({
    success: true,
    message: 'Contest created successfully',
    data: { contest }
  });
}));

// @desc    Update contest
// @route   PUT /api/contests/:id
// @access  Private
router.put('/:id', asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  const updatedContest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    message: 'Contest updated successfully',
    data: { contest: updatedContest }
  });
}));

// @desc    Delete contest
// @route   DELETE /api/contests/:id
// @access  Private/Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  await contest.deleteOne();

  res.json({
    success: true,
    message: 'Contest deleted successfully'
  });
}));

export default router;
