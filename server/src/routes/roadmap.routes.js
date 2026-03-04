import express from 'express';
import mongoose from 'mongoose';
import PersonalNode from '../models/PersonalNode.js';
import User from '../models/User.js';
import { protect } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Helper function to recalculate progress based on completed problems vs total linked problems
const recalculateProgress = (node) => {
  let totalProblems = 0;
  const currentIdentifiers = new Set();
  if (node.subtopics) {
    for (const subtopic of node.subtopics) {
      if (subtopic.linkedProblems) {
        totalProblems += subtopic.linkedProblems.length;
        for (const problem of subtopic.linkedProblems) {
          const id = problem.problemId ? problem.problemId.toString() : problem.title;
          currentIdentifiers.add(id);
        }
      }
    }
  }
  const validCompletedCount = (node.completedProblems || []).filter(id => currentIdentifiers.has(id)).length;
  return totalProblems > 0 ? Math.round((validCompletedCount / totalProblems) * 100) : 0;
};

// All routes require authentication
router.use(protect);

// Rate limiters for different operations
const readRateLimiter = createRateLimiter(30, 60000, 'Too many read requests');
const writeRateLimiter = createRateLimiter(10, 60000, 'Too many write requests');

// @desc    Get personal roadmap
// @route   GET /api/roadmap/personal/:userId
// @access  Private
router.get('/personal/:userId', readRateLimiter, asyncHandler(async (req, res) => {
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
router.get('/members/:userId', readRateLimiter, asyncHandler(async (req, res) => {
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

// @desc    Get list of team members with roadmaps
// @route   GET /api/roadmap/team-members
// @access  Private
router.get('/team-members', readRateLimiter, asyncHandler(async (req, res) => {
  // Get all users who have roadmap entries (excluding current user)
  const membersWithRoadmaps = await PersonalNode.distinct('userId', {
    userId: { $ne: req.user._id }
  });
  
  // Get user details for those members
  const members = await User.find({
    _id: { $in: membersWithRoadmaps }
  }).select('_id username fullName');
  
  res.json({
    success: true,
    count: members.length,
    data: { members }
  });
}));

// @desc    Get a specific member's roadmap (read-only view)
// @route   GET /api/roadmap/member/:memberId
// @access  Private
router.get('/member/:memberId', readRateLimiter, asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  
  // Get the member's roadmap
  const memberRoadmap = await PersonalNode.find({ userId: memberId })
    .populate('themeId')
    .populate('problemsSolved')
    .populate('userId', 'username fullName');
  
  if (memberRoadmap.length === 0) {
    return res.json({
      success: true,
      count: 0,
      data: { roadmap: [], isOwner: false }
    });
  }
  
  // Check if current user is the owner
  const isOwner = memberId === req.user._id.toString();
  
  res.json({
    success: true,
    count: memberRoadmap.length,
    data: { 
      roadmap: memberRoadmap,
      isOwner
    }
  });
}));

// @desc    Get a specific roadmap node by ID (for viewing subtopics)
// @route   GET /api/roadmap/node/:nodeId
// @access  Private
router.get('/node/:nodeId', readRateLimiter, asyncHandler(async (req, res) => {
  const { nodeId } = req.params;
  
  // Validate that nodeId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(nodeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid node ID format'
    });
  }
  
  // Get the specific node
  const node = await PersonalNode.findById(nodeId)
    .populate('themeId')
    .populate('problemsSolved')
    .populate('userId', 'username fullName');
  
  if (!node) {
    return res.status(404).json({
      success: false,
      message: 'Roadmap node not found'
    });
  }
  
  // Check if current user is the owner
  const isOwner = node.userId._id.toString() === req.user._id.toString();
  
  res.json({
    success: true,
    data: { 
      node,
      isOwner
    }
  });
}));

// @desc    Update node order (for drag-and-drop)
// @route   PUT /api/roadmap/reorder
// @access  Private
router.put('/reorder', writeRateLimiter, asyncHandler(async (req, res) => {
  const { nodeOrders } = req.body;
  
  if (!Array.isArray(nodeOrders)) {
    return res.status(400).json({
      success: false,
      message: 'nodeOrders must be an array'
    });
  }
  
  // Update order for each node (only for user's own nodes)
  const updatePromises = nodeOrders.map((item, index) => 
    PersonalNode.findOneAndUpdate(
      { _id: item.nodeId, userId: req.user._id },
      { order: item.order !== undefined ? item.order : index },
      { new: true }
    )
  );
  
  await Promise.all(updatePromises);
  
  res.json({
    success: true,
    message: 'Node order updated successfully'
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
  ).populate(['themeId', 'subtopics.linkedProblems.problemId']);

  res.json({
    success: true,
    message: 'Roadmap updated successfully',
    data: { node }
  });
}));

// @desc    Toggle problem completion for a user's roadmap node
// @route   POST /api/roadmap/:id/toggle-problem
// @access  Private
router.post('/:id/toggle-problem', writeRateLimiter, asyncHandler(async (req, res) => {
  const { problemIdentifier } = req.body;

  if (!problemIdentifier) {
    return res.status(400).json({
      success: false,
      message: 'problemIdentifier is required'
    });
  }

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

  if (!node.completedProblems) {
    node.completedProblems = [];
  }

  const index = node.completedProblems.indexOf(problemIdentifier);
  if (index > -1) {
    // Remove from completed
    node.completedProblems.splice(index, 1);
    node.markModified('completedProblems');
  } else {
    // Add to completed
    node.completedProblems.push(problemIdentifier);
  }

  node.progress = recalculateProgress(node);
  node.lastPracticed = new Date();
  await node.save();

  res.json({
    success: true,
    message: index > -1 ? 'Problem unmarked as completed' : 'Problem marked as completed',
    data: { 
      completedProblems: node.completedProblems,
      progress: node.progress
    }
  });
}));

// @desc    Toggle problem completion by themeId (for themes view)
// @route   POST /api/roadmap/toggle-problem-by-theme
// @access  Private
router.post('/toggle-problem-by-theme', writeRateLimiter, asyncHandler(async (req, res) => {
  const { themeId, problemIdentifier } = req.body;

  if (!themeId || !problemIdentifier) {
    return res.status(400).json({
      success: false,
      message: 'themeId and problemIdentifier are required'
    });
  }

  const node = await PersonalNode.findOne({
    userId: req.user._id,
    themeId
  });

  if (!node) {
    return res.status(404).json({
      success: false,
      message: 'Theme not found in your roadmap'
    });
  }

  if (!node.completedProblems) {
    node.completedProblems = [];
  }

  const index = node.completedProblems.indexOf(problemIdentifier);
  if (index > -1) {
    node.completedProblems.splice(index, 1);
    node.markModified('completedProblems');
  } else {
    node.completedProblems.push(problemIdentifier);
  }

  node.progress = recalculateProgress(node);
  node.lastPracticed = new Date();
  await node.save();

  res.json({
    success: true,
    message: index > -1 ? 'Problem unmarked as completed' : 'Problem marked as completed',
    data: { 
      completedProblems: node.completedProblems,
      progress: node.progress
    }
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

  // Prevent duplicate subtopics with the same name (case-insensitive)
  const normalizedName = name?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const duplicate = node.subtopics.find(
    s => s.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() === normalizedName
  );
  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: 'A subtopic with this name already exists in this node'
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

  // Recalculate progress after subtopic deletion and clean up stale completedProblems
  const validProblemIds = new Set();
  if (node.subtopics) {
    for (const s of node.subtopics) {
      if (s.linkedProblems) {
        for (const problem of s.linkedProblems) {
          const id = problem.problemId ? problem.problemId.toString() : problem.title;
          validProblemIds.add(id);
        }
      }
    }
  }
  node.completedProblems = (node.completedProblems || []).filter(id => validProblemIds.has(id));
  node.progress = recalculateProgress(node);

  await node.save();

  res.json({
    success: true,
    message: 'Subtopic deleted successfully',
    data: { node }
  });
}));

export default router;
