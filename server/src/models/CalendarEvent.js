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
    enum: ['contest', 'practice', 'training', 'meeting', 'deadline', 'roadmap', 'problem', 'clase_gpc', 'rpc', 'other'],
    default: 'other'
  },
  eventScope: {
    type: String,
    enum: ['personal', 'team', 'public'],
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
  // Notification/Reminder settings
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    minutesBefore: {
      type: Number,
      default: 30,
      enum: [5, 10, 15, 30, 60, 120, 1440] // 5min, 10min, 15min, 30min, 1h, 2h, 1 day
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date
    }
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
// Index for reminder queries
calendarEventSchema.index({ 'reminder.enabled': 1, 'reminder.sent': 1, startTime: 1 });

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

export default CalendarEvent;
