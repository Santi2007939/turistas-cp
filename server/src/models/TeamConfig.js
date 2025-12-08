import mongoose from 'mongoose';

const teamConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxMembers: {
    type: Number,
    default: 10,
    min: 1,
    max: 50
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowJoinRequests: {
      type: Boolean,
      default: true
    },
    sharedRoadmap: {
      type: Boolean,
      default: true
    },
    sharedCalendar: {
      type: Boolean,
      default: true
    }
  },
  statistics: {
    totalProblemsolved: {
      type: Number,
      default: 0
    },
    totalContests: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    }
  },
  excalidrawRooms: [{
    name: String,
    roomId: String,
    url: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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

// Index for team search
teamConfigSchema.index({ name: 'text', description: 'text' });

const TeamConfig = mongoose.model('TeamConfig', teamConfigSchema);

export default TeamConfig;
