import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Theme name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['algorithms', 'data-structures', 'math', 'strings', 'graph', 'dp', 'greedy', 'geometry', 'other'],
    default: 'other'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  tags: [{
    type: String,
    trim: true
  }],
  subthemes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    sharedTheory: {
      type: String,
      trim: true,
      default: ''
    },
    codeSnippets: [{
      language: {
        type: String,
        enum: ['python', 'cpp'],
        default: 'python'
      },
      code: {
        type: String,
        default: ''
      },
      description: {
        type: String,
        trim: true
      }
    }],
    linkedProblems: [{
      problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: false
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      link: {
        type: String,
        trim: true
      },
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'very-hard'],
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    resources: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      link: {
        type: String,
        required: true,
        trim: true
      }
    }]
  }],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['article', 'video', 'book', 'tutorial', 'other']
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
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

const Theme = mongoose.model('Theme', themeSchema);

export default Theme;
