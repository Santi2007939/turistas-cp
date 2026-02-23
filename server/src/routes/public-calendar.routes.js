import express from 'express';
import CalendarEvent from '../models/CalendarEvent.js';
import { asyncHandler } from '../middlewares/error.js';

const router = express.Router();

// @desc    Get upcoming public calendar events
// @route   GET /api/public/calendar/upcoming?days=7
// @access  Public (no auth required)
router.get('/upcoming', asyncHandler(async (req, res) => {
  const { days } = req.query;

  // Default to 7 days if not provided
  const daysValue = days !== undefined ? Number(days) : 7;

  // Validate days parameter
  if (!Number.isInteger(daysValue) || daysValue < 1 || daysValue > 365) {
    return res.status(400).json({
      success: false,
      message: 'Parameter "days" must be an integer between 1 and 365'
    });
  }

  const now = new Date();
  const until = new Date(now.getTime() + daysValue * 24 * 60 * 60 * 1000);

  const events = await CalendarEvent.find({
    isPublic: true,
    startTime: { $gte: now, $lte: until }
  })
    .sort({ startTime: 1 })
    .select('-createdBy -ownerId -participants -reminder -reminderSent -__v');

  res.json({
    success: true,
    count: events.length,
    data: { events }
  });
}));

export default router;
