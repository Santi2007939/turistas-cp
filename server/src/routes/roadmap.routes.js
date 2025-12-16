import express from 'express';
import PersonalNode from '../models/PersonalNode.js';
import { protect } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get user roadmap
// @route   GET /api/roadmap
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const nodes = await PersonalNode.find({ userId: req.user._id })
    .populate('themeId')
    .populate('problemsSolved');

  res.json({
    success: true,
    count: nodes.length,
    data: { roadmap: nodes }
  });
}));

// @desc    Create/Update roadmap node
// @route   POST /api/roadmap
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const { themeId, status, progress, notes } = req.body;

  const node = await PersonalNode.findOneAndUpdate(
    { userId: req.user._id, themeId },
    { status, progress, notes, lastPracticed: new Date() },
    { new: true, upsert: true, runValidators: true }
  ).populate('themeId');

  res.json({
    success: true,
    message: 'Roadmap updated successfully',
    data: { node }
  });
}));

// @desc    Delete roadmap node
// @route   DELETE /api/roadmap/:id
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
  const node = await PersonalNode.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!node) {
    return res.status(404).json({
      success: false,
      message: 'Roadmap node not found'
    });
  }

  await node.deleteOne();

  res.json({
    success: true,
    message: 'Roadmap node deleted successfully'
  });
}));

export default router;
