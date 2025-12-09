import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../middlewares/error.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, fullName, codeforcesHandle } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: userExists.email === email ? 'Email already registered' : 'Username already taken'
    });
  }

  // Check if this is the first user
  const userCount = await User.countDocuments();
  const isFirstUser = userCount === 0;

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    fullName,
    codeforcesHandle,
    role: isFirstUser ? 'admin' : 'student',
    isActive: true,
    isCurrentMember: isFirstUser ? true : false
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: isFirstUser ? 'Admin account created successfully' : 'User registered successfully',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is inactive'
    });
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        codeforcesHandle: user.codeforcesHandle
      },
      token
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        codeforcesHandle: user.codeforcesHandle,
        isCurrentMember: user.isCurrentMember,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, codeforcesHandle } = req.body;

  const user = await User.findById(req.user._id);

  if (fullName !== undefined) user.fullName = fullName;
  if (codeforcesHandle !== undefined) user.codeforcesHandle = codeforcesHandle;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        codeforcesHandle: user.codeforcesHandle
      }
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Check if users exist in database
// @route   GET /api/auth/check-users
// @access  Public
export const checkUsers = asyncHandler(async (req, res) => {
  const userCount = await User.countDocuments();
  
  res.json({
    success: true,
    data: {
      usersExist: userCount > 0
    }
  });
});
