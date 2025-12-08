import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contest name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  platform: {
    type: String,
    enum: ['codeforces', 'atcoder', 'codechef', 'leetcode', 'hackerrank', 'rpc', 'custom', 'other'],
    default: 'other'
  },
  url: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  type: {
    type: String,
    enum: ['official', 'virtual', 'training', 'practice'],
    default: 'official'
  },
  difficulty: {
    type: String,
    enum: ['div1', 'div2', 'div3', 'div4', 'educational', 'global', 'mixed', 'other'],
    default: 'other'
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rank: Number,
    score: Number,
    problemsSolved: Number
  }],
  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
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

// Index for fetching upcoming and past contests
contestSchema.index({ startTime: -1 });
contestSchema.index({ platform: 1, startTime: -1 });

const Contest = mongoose.model('Contest', contestSchema);

export default Contest;
