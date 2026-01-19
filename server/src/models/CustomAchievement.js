import mongoose from 'mongoose';

const customAchievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Achievement name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  photo: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['rating', 'contest'],
    required: [true, 'Category is required'],
    default: 'contest'
  },
  scope: {
    type: String,
    enum: ['personal', 'team'],
    required: [true, 'Scope (personal/team) is required'],
    default: 'personal'
  },
  // For personal achievements
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // For team achievements (optional)
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamConfig'
  },
  // Date when the achievement was earned
  achievedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
customAchievementSchema.index({ createdBy: 1, scope: 1 });
customAchievementSchema.index({ teamId: 1, scope: 1 });
customAchievementSchema.index({ category: 1 });

const CustomAchievement = mongoose.model('CustomAchievement', customAchievementSchema);

export default CustomAchievement;
