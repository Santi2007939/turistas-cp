import mongoose from 'mongoose';

// Subtopic schema with detailed sections
const subtopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  personalNotes: {
    type: String,
    trim: true,
    default: ''
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
      required: true
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
  }],
  order: {
    type: Number,
    default: 0
  }
});

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
    enum: ['not-started', 'in-progress', 'completed', 'mastered', 'todo', 'done'],
    default: 'not-started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  dueDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  subtopics: [subtopicSchema],
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
