import Theme from '../models/Theme.js';
import PersonalNode from '../models/PersonalNode.js';
import { asyncHandler } from '../middlewares/error.js';

// Helper function to aggregate subtopics from roadmap nodes for a single theme
const aggregateSubtopicsFromRoadmap = async (themeId) => {
  const roadmapNodes = await PersonalNode.find({ themeId });
  return extractSubtopicsFromNodes(roadmapNodes);
};

// Helper function to aggregate subtopics from roadmap nodes for multiple themes
const aggregateSubtopicsFromRoadmapBatch = async (themeIds) => {
  const roadmapNodes = await PersonalNode.find({ themeId: { $in: themeIds } });
  
  // Group nodes by themeId
  const nodesByTheme = new Map();
  for (const node of roadmapNodes) {
    const themeIdStr = node.themeId.toString();
    if (!nodesByTheme.has(themeIdStr)) {
      nodesByTheme.set(themeIdStr, []);
    }
    nodesByTheme.get(themeIdStr).push(node);
  }
  
  // Extract subtopics for each theme
  const subtopicsByTheme = new Map();
  for (const [themeIdStr, nodes] of nodesByTheme) {
    subtopicsByTheme.set(themeIdStr, extractSubtopicsFromNodes(nodes));
  }
  
  return subtopicsByTheme;
};

// Helper function to extract unique subtopics from nodes
const extractSubtopicsFromNodes = (nodes) => {
  const subtopicMap = new Map();
  
  for (const node of nodes) {
    if (node.subtopics && node.subtopics.length > 0) {
      for (const subtopic of node.subtopics) {
        // Use normalized name as unique key (case-insensitive, handle accented characters)
        const key = subtopic.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        if (!subtopicMap.has(key)) {
          subtopicMap.set(key, {
            name: subtopic.name,
            description: subtopic.description || ''
          });
        }
      }
    }
  }
  
  return Array.from(subtopicMap.values());
};

// @desc    Get all themes
// @route   GET /api/themes
// @access  Private
export const getThemes = asyncHandler(async (req, res) => {
  const themes = await Theme.find({ isPublic: true }).populate('createdBy', 'username');

  // Batch aggregate subtopics from roadmap nodes for all themes
  const themeIds = themes.map(theme => theme._id);
  const subtopicsByTheme = await aggregateSubtopicsFromRoadmapBatch(themeIds);

  // Merge subtopics with each theme
  const themesWithAggregatedSubtopics = themes.map(theme => {
    const themeObj = theme.toObject();
    const themeIdStr = theme._id.toString();
    const roadmapSubtopics = subtopicsByTheme.get(themeIdStr) || [];
    
    // Merge theme's own subthemes with roadmap subtopics
    const existingNames = new Set(
      themeObj.subthemes.map(s => s.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim())
    );
    const newSubtopics = roadmapSubtopics.filter(
      s => !existingNames.has(s.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim())
    );
    
    themeObj.subthemes = [...themeObj.subthemes, ...newSubtopics];
    return themeObj;
  });

  res.json({
    success: true,
    count: themesWithAggregatedSubtopics.length,
    data: { themes: themesWithAggregatedSubtopics }
  });
});

// @desc    Get single theme
// @route   GET /api/themes/:id
// @access  Private
export const getTheme = asyncHandler(async (req, res) => {
  const theme = await Theme.findById(req.params.id).populate('createdBy', 'username');

  if (!theme) {
    return res.status(404).json({
      success: false,
      message: 'Theme not found'
    });
  }

  // Aggregate subtopics from roadmap nodes
  const themeObj = theme.toObject();
  const roadmapSubtopics = await aggregateSubtopicsFromRoadmap(theme._id);
  
  // Merge theme's own subthemes with roadmap subtopics
  const existingNames = new Set(
    themeObj.subthemes.map(s => s.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim())
  );
  const newSubtopics = roadmapSubtopics.filter(
    s => !existingNames.has(s.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim())
  );
  
  themeObj.subthemes = [...themeObj.subthemes, ...newSubtopics];

  res.json({
    success: true,
    data: { theme: themeObj }
  });
});

// @desc    Create theme
// @route   POST /api/themes
// @access  Private
export const createTheme = asyncHandler(async (req, res) => {
  const themeData = {
    ...req.body,
    createdBy: req.user._id
  };

  const theme = await Theme.create(themeData);

  res.status(201).json({
    success: true,
    message: 'Theme created successfully',
    data: { theme }
  });
});

// @desc    Update theme
// @route   PUT /api/themes/:id
// @access  Private
export const updateTheme = asyncHandler(async (req, res) => {
  let theme = await Theme.findById(req.params.id);

  if (!theme) {
    return res.status(404).json({
      success: false,
      message: 'Theme not found'
    });
  }

  // Check ownership
  if (theme.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this theme'
    });
  }

  theme = await Theme.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    message: 'Theme updated successfully',
    data: { theme }
  });
});

// @desc    Delete theme
// @route   DELETE /api/themes/:id
// @access  Private (Admin only)
export const deleteTheme = asyncHandler(async (req, res) => {
  // Only admins can delete themes
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only administrators can delete themes'
    });
  }

  const theme = await Theme.findById(req.params.id);

  if (!theme) {
    return res.status(404).json({
      success: false,
      message: 'Theme not found'
    });
  }

  await theme.deleteOne();

  res.json({
    success: true,
    message: 'Theme deleted successfully'
  });
});
