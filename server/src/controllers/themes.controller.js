import Theme from '../models/Theme.js';
import PersonalNode from '../models/PersonalNode.js';
import { asyncHandler } from '../middlewares/error.js';

// Helper function to normalize strings for comparison (case-insensitive, handle accented characters)
const normalizeStr = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

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
        const key = normalizeStr(subtopic.name);
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

// @desc    Get aggregated subtopic content for a theme (shared content from Theme model + user's personal notes)
// @route   GET /api/themes/:id/subtopics/:subtopicName
// @access  Private
export const getSubtopicContent = asyncHandler(async (req, res) => {
  const { id, subtopicName } = req.params;
  const decodedSubtopicName = decodeURIComponent(subtopicName);
  
  // Verify theme exists
  const theme = await Theme.findById(id);
  if (!theme) {
    return res.status(404).json({
      success: false,
      message: 'Theme not found'
    });
  }

  // Find if user has this theme in their roadmap
  const userNode = await PersonalNode.findOne({ 
    userId: req.user._id, 
    themeId: id 
  });

  // Normalize subtopic name for matching
  const normalizedSearchName = normalizeStr(decodedSubtopicName);
  
  // Find the subtopic in the Theme model (primary source for shared content)
  const themeSubtopic = theme.subthemes.find(
    s => normalizeStr(s.name) === normalizedSearchName
  );
  
  // Initialize aggregated content with Theme's shared content
  let aggregatedContent = {
    name: themeSubtopic?.name || decodedSubtopicName,
    description: themeSubtopic?.description || '',
    sharedTheory: themeSubtopic?.sharedTheory || '',
    codeSnippets: themeSubtopic?.codeSnippets || [],
    linkedProblems: themeSubtopic?.linkedProblems || [],
    resources: themeSubtopic?.resources || [],
    userHasThemeInRoadmap: !!userNode,
    personalNotes: '' // Only filled if user has theme in roadmap
  };

  // If user has the theme in their roadmap, get personal notes from their node
  if (userNode && userNode.subtopics) {
    const userSubtopic = userNode.subtopics.find(
      s => normalizeStr(s.name) === normalizedSearchName
    );
    if (userSubtopic) {
      aggregatedContent.personalNotes = userSubtopic.personalNotes || '';
    }
  }

  res.json({
    success: true,
    data: { 
      subtopic: aggregatedContent,
      theme: {
        _id: theme._id,
        name: theme.name
      }
    }
  });
});

// @desc    Delete subtopic globally (admin only) - removes from all users and shared content
// @route   DELETE /api/themes/:id/subtopics/:subtopicName
// @access  Private (Admin only)
export const deleteSubtopicGlobally = asyncHandler(async (req, res) => {
  // Only admins can delete subtopics globally
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only administrators can delete subtopics globally'
    });
  }

  const { id, subtopicName } = req.params;
  const decodedSubtopicName = decodeURIComponent(subtopicName);
  
  // Verify theme exists
  const theme = await Theme.findById(id);
  if (!theme) {
    return res.status(404).json({
      success: false,
      message: 'Theme not found'
    });
  }

  // Normalize subtopic name for matching
  const normalizedSearchName = normalizeStr(decodedSubtopicName);

  // Also remove from theme's subthemes if present
  if (theme.subthemes && theme.subthemes.length > 0) {
    theme.subthemes = theme.subthemes.filter(
      s => normalizeStr(s.name) !== normalizedSearchName
    );
    await theme.save();
  }

  // Find all nodes for this theme and remove the subtopic from each
  const allNodes = await PersonalNode.find({ themeId: id });
  let deletedCount = 0;

  for (const node of allNodes) {
    if (!node.subtopics || node.subtopics.length === 0) continue;
    
    const originalLength = node.subtopics.length;
    node.subtopics = node.subtopics.filter(
      s => normalizeStr(s.name) !== normalizedSearchName
    );
    
    if (node.subtopics.length < originalLength) {
      deletedCount++;
      await node.save();
    }
  }

  res.json({
    success: true,
    message: `Subtopic "${decodedSubtopicName}" deleted successfully from ${deletedCount} user roadmap(s)`
  });
});

// @desc    Update shared content for a subtopic (stored in Theme model)
// @route   PUT /api/themes/:id/subtopics/:subtopicName/shared
// @access  Private
export const updateSubtopicSharedContent = asyncHandler(async (req, res) => {
  const { id, subtopicName } = req.params;
  const { sharedTheory, codeSnippets, linkedProblems, resources } = req.body;
  const decodedSubtopicName = decodeURIComponent(subtopicName);
  
  // Verify theme exists
  const theme = await Theme.findById(id);
  if (!theme) {
    return res.status(404).json({
      success: false,
      message: 'Theme not found'
    });
  }

  // Normalize subtopic name for matching
  const normalizedSearchName = normalizeStr(decodedSubtopicName);

  // Find the subtopic in the theme's subthemes array
  let subtopicIndex = theme.subthemes.findIndex(
    s => normalizeStr(s.name) === normalizedSearchName
  );

  // If subtopic doesn't exist, create it
  if (subtopicIndex === -1) {
    theme.subthemes.push({
      name: decodedSubtopicName,
      description: '',
      sharedTheory: '',
      codeSnippets: [],
      linkedProblems: [],
      resources: []
    });
    subtopicIndex = theme.subthemes.length - 1;
  }

  // Update shared content fields if provided
  if (sharedTheory !== undefined) {
    theme.subthemes[subtopicIndex].sharedTheory = sharedTheory;
  }
  if (codeSnippets !== undefined) {
    theme.subthemes[subtopicIndex].codeSnippets = codeSnippets;
  }
  if (linkedProblems !== undefined) {
    theme.subthemes[subtopicIndex].linkedProblems = linkedProblems;
  }
  if (resources !== undefined) {
    theme.subthemes[subtopicIndex].resources = resources;
  }

  await theme.save();

  res.json({
    success: true,
    message: `Shared content updated for subtopic "${decodedSubtopicName}"`
  });
});
