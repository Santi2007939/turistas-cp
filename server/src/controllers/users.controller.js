import User from '../models/User.js';
import { asyncHandler } from '../middlewares/error.js';

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');

  res.json({
    success: true,
    count: users.length,
    data: { users }
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
});

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive, isCurrentMember } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (isCurrentMember !== undefined) user.isCurrentMember = isCurrentMember;

  await user.save();

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
});

// @desc    Update user status (Admin)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActive must be a boolean value'
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.isActive = isActive;
  await user.save();

  res.json({
    success: true,
    message: 'User status updated successfully',
    data: { user }
  });
});

// @desc    Update user member status (Admin)
// @route   PUT /api/users/:id/member
// @access  Private/Admin
export const updateUserMember = asyncHandler(async (req, res) => {
  const { isCurrentMember } = req.body;

  if (typeof isCurrentMember !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isCurrentMember must be a boolean value'
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.isCurrentMember = isCurrentMember;
  await user.save();

  res.json({
    success: true,
    message: 'User member status updated successfully',
    data: { user }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});
