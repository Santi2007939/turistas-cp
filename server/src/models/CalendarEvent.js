import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['contest', 'training', 'meeting', 'deadline', 'roadmap', 'problem', 'other'],
    default: 'other'
  },
  eventScope: {
    type: String,
    enum: ['personal', 'team'],
    default: 'personal',
    required: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest'
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  },
  location: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamConfig'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for fetching events by date
calendarEventSchema.index({ startTime: 1 });
calendarEventSchema.index({ teamId: 1, startTime: 1 });
calendarEventSchema.index({ ownerId: 1, startTime: 1 });
calendarEventSchema.index({ eventScope: 1, teamId: 1 });

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

export default CalendarEvent;
