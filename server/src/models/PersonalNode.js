import mongoose from 'mongoose';

const personalNodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  themeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theme',
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'mastered'],
    default: 'not-started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  problemsSolved: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  lastPracticed: {
    type: Date
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

// Ensure a user can have only one node per theme
personalNodeSchema.index({ userId: 1, themeId: 1 }, { unique: true });

const PersonalNode = mongoose.model('PersonalNode', personalNodeSchema);

export default PersonalNode;
