import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Achievement name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['problem-solving', 'contest', 'streak', 'rating', 'contribution', 'special'],
    default: 'problem-solving'
  },
  icon: {
    type: String,
    trim: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['problem-count', 'contest-count', 'rating-milestone', 'streak-days', 'custom'],
      required: true
    },
    threshold: {
      type: Number,
      required: true
    },
    description: String
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    default: 10,
    min: 0
  },
  unlockedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
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

const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;
