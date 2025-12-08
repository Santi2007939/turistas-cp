import express from 'express';
import CalendarEvent from '../models/CalendarEvent.js';
import { protect } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get calendar events
// @route   GET /api/calendar
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { startDate, endDate, type } = req.query;
  const query = {
    $or: [
      { isPublic: true },
      { createdBy: req.user._id },
      { participants: req.user._id },
      ...(req.user.teamId ? [{ teamId: req.user.teamId }] : [])
    ]
  };

  if (startDate && endDate) {
    query.startTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  if (type) query.type = type;

  const events = await CalendarEvent.find(query)
    .sort({ startTime: 1 })
    .populate('createdBy contestId participants', 'username name title');

  res.json({
    success: true,
    count: events.length,
    data: { events }
  });
}));

// @desc    Get single event
// @route   GET /api/calendar/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findById(req.params.id)
    .populate('createdBy contestId participants teamId');

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  res.json({
    success: true,
    data: { event }
  });
}));

// @desc    Create event
// @route   POST /api/calendar
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const eventData = {
    ...req.body,
    createdBy: req.user._id
  };

  const event = await CalendarEvent.create(eventData);

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: { event }
  });
}));

// @desc    Update event
// @route   PUT /api/calendar/:id
// @access  Private
router.put('/:id', asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this event'
    });
  }

  const updatedEvent = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: { event: updatedEvent }
  });
}));

// @desc    Delete event
// @route   DELETE /api/calendar/:id
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this event'
    });
  }

  await event.deleteOne();

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
}));

export default router;
