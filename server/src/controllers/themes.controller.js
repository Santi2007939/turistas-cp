import Theme from '../models/Theme.js';
import { asyncHandler } from '../middlewares/error.js';

// @desc    Get all themes
// @route   GET /api/themes
// @access  Private
export const getThemes = asyncHandler(async (req, res) => {
  const themes = await Theme.find({ isPublic: true }).populate('createdBy', 'username');

  res.json({
    success: true,
    count: themes.length,
    data: { themes }
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

  res.json({
    success: true,
    data: { theme }
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
// @access  Private
export const deleteTheme = asyncHandler(async (req, res) => {
  const theme = await Theme.findById(req.params.id);

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
      message: 'Not authorized to delete this theme'
    });
  }

  await theme.deleteOne();

  res.json({
    success: true,
    message: 'Theme deleted successfully'
  });
});
