import mongoose from 'mongoose';

// Balloon colors, one per problem (A, B, C, ...)
export const BALLOON_COLORS = [
  '#E53935', '#1E88E5', '#43A047', '#FDD835', '#8E24AA', '#FB8C00',
  '#00ACC1', '#D81B60', '#6D4C41', '#3949AB', '#7CB342', '#F4511E',
  '#5E35B1', '#00897B', '#C0CA33', '#546E7A', '#EC407A', '#26A69A',
  '#FFB300', '#29B6F6', '#AB47BC', '#9CCC65', '#EF5350', '#5C6BC0',
  '#8D6E63', '#26C6DA'
];

export const VERDICTS = ['AC', 'WA', 'TLE', 'RE'];

// ICPC penalty minutes per rejected attempt before AC
export const PENALTY_PER_WRONG = 20;

const simulationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Simulation name is required'],
    trim: true,
    maxlength: 120
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  problems: [{
    letter: { type: String, required: true },
    title: { type: String, trim: true, default: '' },
    color: { type: String, required: true }
  }],
  durationMinutes: {
    type: Number,
    default: 300,
    min: 1,
    max: 1440
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'finished'],
    default: 'pending'
  },
  startTime: Date,
  endTime: Date,
  submissions: [{
    problemLetter: { type: String, required: true },
    verdict: { type: String, enum: VERDICTS, required: true },
    minute: { type: Number, required: true },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  links: {
    usaco: { type: String, trim: true, default: '' },
    excalidraw: { type: String, trim: true, default: '' }
  }
}, {
  timestamps: true
});

simulationSchema.index({ createdAt: -1 });

const Simulation = mongoose.model('Simulation', simulationSchema);

export default Simulation;
