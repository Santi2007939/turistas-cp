import express from 'express';
import PersonalNode from '../models/PersonalNode.js';
import { protect } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get personal roadmap
// @route   GET /api/roadmap/personal/:userId
// @access  Private
router.get('/personal/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Users can only view their own personal roadmap
  if (userId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view personal roadmap of other users'
    });
  }
  
  const personalRoadmap = await PersonalNode.find({ userId })
    .populate('themeId')
    .populate('problemsSolved');

  res.json({
    success: true,
    count: personalRoadmap.length,
    data: { roadmap: personalRoadmap }
  });
}));

// @desc    Get other members' roadmaps
// @route   GET /api/roadmap/members/:userId
// @access  Private
router.get('/members/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Verify the userId matches the authenticated user
  if (userId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view members roadmaps from another user perspective'
    });
  }
  
  const memberRoadmaps = await PersonalNode.find({ userId: { $ne: userId } })
    .populate('themeId')
    .populate('problemsSolved')
    .populate('userId', 'username fullName');

  res.json({
    success: true,
    count: memberRoadmaps.length,
    data: { roadmap: memberRoadmaps }
  });
}));

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
  const { themeId, status, progress, notes, dueDate, subtopics } = req.body;

  const updateData = { 
    status, 
    progress, 
    notes, 
    lastPracticed: new Date() 
  };
  
  if (dueDate !== undefined) {
    updateData.dueDate = dueDate;
  }
  
  if (subtopics !== undefined) {
    updateData.subtopics = subtopics;
  }

  // Users can only update their own roadmap
  const node = await PersonalNode.findOneAndUpdate(
    { userId: req.user._id, themeId },
    updateData,
    { new: true, upsert: true, runValidators: true }
  ).populate('themeId').populate('subtopics.linkedProblems');

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

// @desc    Add subtopic to roadmap node
// @route   POST /api/roadmap/:id/subtopics
// @access  Private
router.post('/:id/subtopics', asyncHandler(async (req, res) => {
  const { name, description, personalNotes, sharedTheory, codeSnippets, linkedProblems, resources } = req.body;

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

  const subtopic = {
    name,
    description,
    personalNotes,
    sharedTheory,
    codeSnippets: codeSnippets || [],
    linkedProblems: linkedProblems || [],
    resources: resources || [],
    order: node.subtopics.length
  };

  node.subtopics.push(subtopic);
  await node.save();

  res.json({
    success: true,
    message: 'Subtopic added successfully',
    data: { node }
  });
}));

// @desc    Update subtopic in roadmap node
// @route   PUT /api/roadmap/:id/subtopics/:subtopicId
// @access  Private
router.put('/:id/subtopics/:subtopicId', asyncHandler(async (req, res) => {
  const { name, description, personalNotes, sharedTheory, codeSnippets, linkedProblems, resources } = req.body;

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

  const subtopic = node.subtopics.id(req.params.subtopicId);
  if (!subtopic) {
    return res.status(404).json({
      success: false,
      message: 'Subtopic not found'
    });
  }

  if (name !== undefined) subtopic.name = name;
  if (description !== undefined) subtopic.description = description;
  if (personalNotes !== undefined) subtopic.personalNotes = personalNotes;
  if (sharedTheory !== undefined) subtopic.sharedTheory = sharedTheory;
  if (codeSnippets !== undefined) subtopic.codeSnippets = codeSnippets;
  if (linkedProblems !== undefined) subtopic.linkedProblems = linkedProblems;
  if (resources !== undefined) subtopic.resources = resources;

  await node.save();

  res.json({
    success: true,
    message: 'Subtopic updated successfully',
    data: { node }
  });
}));

// @desc    Delete subtopic from roadmap node
// @route   DELETE /api/roadmap/:id/subtopics/:subtopicId
// @access  Private
router.delete('/:id/subtopics/:subtopicId', asyncHandler(async (req, res) => {
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

  const subtopic = node.subtopics.id(req.params.subtopicId);
  if (!subtopic) {
    return res.status(404).json({
      success: false,
      message: 'Subtopic not found'
    });
  }

  subtopic.deleteOne();
  await node.save();

  res.json({
    success: true,
    message: 'Subtopic deleted successfully',
    data: { node }
  });
}));

export default router;
