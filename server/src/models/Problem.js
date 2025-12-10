import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  platform: {
    type: String,
    enum: ['codeforces', 'atcoder', 'leetcode', 'hackerrank', 'cses', 'uva', 'spoj', 'custom', 'other'],
    default: 'other'
  },
  platformId: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'very-hard'],
    default: 'medium'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5000
  },
  tags: [{
    type: String,
    trim: true
  }],
  themes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theme'
  }],
  timeLimit: {
    type: String,
    trim: true
  },
  memoryLimit: {
    type: String,
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  owner: {
    type: String,
    enum: ['personal', 'team'],
    default: 'team'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  solveCount: {
    type: Number,
    default: 0
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

// Index for searching problems
problemSchema.index({ title: 'text', tags: 'text' });
problemSchema.index({ platform: 1, platformId: 1 }, { unique: true, sparse: true });

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
