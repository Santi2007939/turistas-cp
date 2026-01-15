import User from '../models/User.js';
import TeamConfig from '../models/TeamConfig.js';
import { asyncHandler } from '../middlewares/error.js';

/**
 * Helper function to add a user to the main team as a member
 * @param {string} userId - The user's ID
 */
const addUserToTeam = async (userId) => {
  const teamName = process.env.TEAM_NAME || 'Team Turistas';
  const team = await TeamConfig.findOne({ name: teamName });
  
  if (!team) {
    console.log(`⚠️  Team "${teamName}" not found. User will not be added to team.`);
    return;
  }

  // Check if user is already a member
  const isAlreadyMember = team.members.some(m => m.userId.toString() === userId.toString());
  
  if (isAlreadyMember) {
    return; // User is already a member
  }

  // Check if team is full
  if (team.members.length >= team.maxMembers) {
    console.log(`⚠️  Team "${teamName}" is full. User will not be added.`);
    return;
  }

  // Add user to team (inactive by default, unless there are fewer than 3 members)
  team.members.push({
    userId: userId,
    isActive: team.members.filter(m => m.isActive).length < 3,
    joinedAt: new Date()
  });

  await team.save();
  console.log(`✅ User ${userId} added to team "${teamName}"`);
};

/**
 * Helper function to remove a user from the main team
 * @param {string} userId - The user's ID
 */
const removeUserFromTeam = async (userId) => {
  const teamName = process.env.TEAM_NAME || 'Team Turistas';
  const team = await TeamConfig.findOne({ name: teamName });
  
  if (!team) {
    return;
  }

  team.members = team.members.filter(m => m.userId.toString() !== userId.toString());
  await team.save();
};

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

  const wasActive = user.isActive;
  const wasCurrentMember = user.isCurrentMember;

  if (role !== undefined) user.role = role;
  if (isActive !== undefined) {
    user.isActive = isActive;
    // When activating a user, also set isCurrentMember to true (for non-admin users)
    if (isActive && !wasActive && user.role !== 'admin') {
      user.isCurrentMember = true;
    }
  }
  if (isCurrentMember !== undefined) user.isCurrentMember = isCurrentMember;

  await user.save();

  // If user became a current member, add them to the team
  if (user.isCurrentMember && !wasCurrentMember && user.role !== 'admin') {
    await addUserToTeam(user._id);
  }
  // If user is no longer a current member, remove them from the team
  if (!user.isCurrentMember && wasCurrentMember) {
    await removeUserFromTeam(user._id);
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
});

// Helper function for updating user boolean fields
const updateUserBooleanField = async (userId, fieldName, fieldValue) => {
  if (typeof fieldValue !== 'boolean') {
    const error = new Error(`${fieldName} must be a boolean value`);
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user[fieldName] = fieldValue;
  await user.save();

  return user;
};

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

  const wasActive = user.isActive;
  const wasCurrentMember = user.isCurrentMember;

  user.isActive = isActive;

  // When activating a user, also set isCurrentMember to true (for non-admin users)
  if (isActive && !wasActive && user.role !== 'admin') {
    user.isCurrentMember = true;
  }

  await user.save();

  // If user became a current member, add them to the team
  if (user.isCurrentMember && !wasCurrentMember && user.role !== 'admin') {
    await addUserToTeam(user._id);
  }
  
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

  const wasCurrentMember = user.isCurrentMember;

  user.isCurrentMember = isCurrentMember;
  await user.save();

  // If user became a current member, add them to the team
  if (isCurrentMember && !wasCurrentMember && user.role !== 'admin') {
    await addUserToTeam(user._id);
  }
  // If user is no longer a current member, remove them from the team
  if (!isCurrentMember && wasCurrentMember) {
    await removeUserFromTeam(user._id);
  }
  
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

  // Remove user from all teams they belong to
  await TeamConfig.updateMany(
    { 'members.userId': user._id },
    { $pull: { members: { userId: user._id } } }
  );

  await user.deleteOne();

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});
