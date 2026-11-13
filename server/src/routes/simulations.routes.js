import express from 'express';
import Simulation, { BALLOON_COLORS, VERDICTS } from '../models/Simulation.js';
import User from '../models/User.js';
import { protect } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';
import { validateId } from '../middlewares/validation.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Max 30 verdict/link changes per minute per user
const simulationActionLimiter = createRateLimiter(30, 60000, 'Too many simulation actions. Please try again later.');

const MAX_PROBLEMS = 26;
const USER_FIELDS = 'username fullName codeforcesHandle';

router.use(protect);

// ---------- helpers ----------

const isParticipant = (simulation, user) =>
  simulation.participants.some(p => (p._id || p).toString() === user._id.toString());

const sanitizeLink = (value) => {
  if (value === undefined || value === null) return '';
  const link = String(value).trim();
  if (!link) return '';
  try {
    const url = new URL(link);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return link;
  } catch {
    return null;
  }
};

const problemLetter = (index) => String.fromCharCode(65 + index);

// Marks a running simulation as finished once its time is over
const refreshStatus = async (simulation) => {
  if (simulation.status === 'running' && simulation.endTime && Date.now() >= simulation.endTime.getTime()) {
    simulation.status = 'finished';
    await simulation.save();
  }
  return simulation;
};

const loadSimulation = async (id) => {
  const simulation = await Simulation.findById(id)
    .populate('participants', USER_FIELDS)
    .populate('createdBy', USER_FIELDS)
    .populate('submissions.submittedBy', USER_FIELDS);
  return simulation ? refreshStatus(simulation) : null;
};

const notFound = (res) => res.status(404).json({ success: false, message: 'Simulation not found' });

const forbidden = (res) => res.status(403).json({
  success: false,
  message: 'Only the selected members of this simulation can modify it'
});

// ---------- routes ----------

// @desc    Current members that can be selected for a simulation
// @route   GET /api/simulations/members
// @access  Private
router.get('/members', asyncHandler(async (req, res) => {
  const members = await User.find({ isCurrentMember: true, isActive: true })
    .select(USER_FIELDS)
    .sort({ username: 1 });

  res.json({ success: true, data: { members } });
}));

// @desc    List simulations
// @route   GET /api/simulations
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const simulations = await Simulation.find()
    .select('-submissions.submittedBy')
    .populate('participants', USER_FIELDS)
    .sort({ createdAt: -1 });

  await Promise.all(simulations.map(refreshStatus));

  res.json({ success: true, count: simulations.length, data: { simulations } });
}));

// @desc    Get one simulation
// @route   GET /api/simulations/:id
// @access  Private
router.get('/:id', validateId(), asyncHandler(async (req, res) => {
  const simulation = await loadSimulation(req.params.id);
  if (!simulation) return notFound(res);

  res.json({ success: true, data: { simulation, serverTime: new Date() } });
}));

// @desc    Create simulation
// @route   POST /api/simulations
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const { name, participants, problemCount, problemTitles, durationMinutes, links } = req.body;

  const count = Number(problemCount);
  if (!Number.isInteger(count) || count < 1 || count > MAX_PROBLEMS) {
    return res.status(400).json({ success: false, message: `Problem count must be between 1 and ${MAX_PROBLEMS}` });
  }

  if (!Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({ success: false, message: 'Select at least one member' });
  }

  const uniqueIds = [...new Set(participants.map(String))];
  if (uniqueIds.some(id => !/^[0-9a-fA-F]{24}$/.test(id))) {
    return res.status(400).json({ success: false, message: 'Invalid member id' });
  }

  const validMembers = await User.countDocuments({ _id: { $in: uniqueIds }, isCurrentMember: true, isActive: true });
  if (validMembers !== uniqueIds.length) {
    return res.status(400).json({ success: false, message: 'All participants must be current members' });
  }

  const usaco = sanitizeLink(links?.usaco);
  const excalidraw = sanitizeLink(links?.excalidraw);
  if (usaco === null || excalidraw === null) {
    return res.status(400).json({ success: false, message: 'Links must be valid http(s) URLs' });
  }

  const titles = Array.isArray(problemTitles) ? problemTitles : [];
  const problems = Array.from({ length: count }, (_, i) => ({
    letter: problemLetter(i),
    title: typeof titles[i] === 'string' ? titles[i].trim().slice(0, 120) : '',
    color: BALLOON_COLORS[i % BALLOON_COLORS.length]
  }));

  const simulation = await Simulation.create({
    name,
    createdBy: req.user._id,
    participants: uniqueIds,
    problems,
    durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
    links: { usaco, excalidraw }
  });

  res.status(201).json({ success: true, data: { simulation } });
}));

// @desc    Update links (USACO session / Excalidraw)
// @route   PUT /api/simulations/:id/links
// @access  Private (participants)
router.put('/:id/links', validateId(), simulationActionLimiter, asyncHandler(async (req, res) => {
  const simulation = await Simulation.findById(req.params.id);
  if (!simulation) return notFound(res);
  if (!isParticipant(simulation, req.user)) return forbidden(res);

  const { usaco, excalidraw } = req.body;
  if (usaco !== undefined) {
    const link = sanitizeLink(usaco);
    if (link === null) return res.status(400).json({ success: false, message: 'Invalid USACO link' });
    simulation.links.usaco = link;
  }
  if (excalidraw !== undefined) {
    const link = sanitizeLink(excalidraw);
    if (link === null) return res.status(400).json({ success: false, message: 'Invalid Excalidraw link' });
    simulation.links.excalidraw = link;
  }

  await simulation.save();
  res.json({ success: true, data: { simulation: await loadSimulation(simulation._id) } });
}));

// @desc    Start simulation
// @route   POST /api/simulations/:id/start
// @access  Private (participants)
router.post('/:id/start', validateId(), asyncHandler(async (req, res) => {
  const simulation = await Simulation.findById(req.params.id);
  if (!simulation) return notFound(res);
  if (!isParticipant(simulation, req.user)) return forbidden(res);
  if (simulation.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Simulation already started' });
  }

  const now = new Date();
  simulation.status = 'running';
  simulation.startTime = now;
  simulation.endTime = new Date(now.getTime() + simulation.durationMinutes * 60000);
  await simulation.save();

  res.json({ success: true, data: { simulation: await loadSimulation(simulation._id), serverTime: new Date() } });
}));

// @desc    Finish simulation early
// @route   POST /api/simulations/:id/finish
// @access  Private (participants)
router.post('/:id/finish', validateId(), asyncHandler(async (req, res) => {
  const simulation = await Simulation.findById(req.params.id);
  if (!simulation) return notFound(res);
  if (!isParticipant(simulation, req.user)) return forbidden(res);
  if (simulation.status !== 'running') {
    return res.status(400).json({ success: false, message: 'Simulation is not running' });
  }

  simulation.status = 'finished';
  simulation.endTime = new Date();
  await simulation.save();

  res.json({ success: true, data: { simulation: await loadSimulation(simulation._id), serverTime: new Date() } });
}));

// @desc    Register a team verdict for a problem
// @route   POST /api/simulations/:id/submissions
// @access  Private (participants)
router.post('/:id/submissions', validateId(), simulationActionLimiter, asyncHandler(async (req, res) => {
  const simulation = await Simulation.findById(req.params.id);
  if (!simulation) return notFound(res);
  if (!isParticipant(simulation, req.user)) return forbidden(res);
  await refreshStatus(simulation);
  if (simulation.status !== 'running') {
    return res.status(400).json({ success: false, message: 'Simulation is not running' });
  }

  const { problemLetter: letter, verdict } = req.body;
  if (!VERDICTS.includes(verdict)) {
    return res.status(400).json({ success: false, message: 'Invalid verdict' });
  }
  if (!simulation.problems.some(p => p.letter === letter)) {
    return res.status(400).json({ success: false, message: 'Invalid problem' });
  }
  if (simulation.submissions.some(s => s.problemLetter === letter && s.verdict === 'AC')) {
    return res.status(400).json({ success: false, message: 'Problem already accepted' });
  }

  const now = new Date();
  simulation.submissions.push({
    problemLetter: letter,
    verdict,
    minute: Math.floor((now.getTime() - simulation.startTime.getTime()) / 60000),
    submittedBy: req.user._id,
    createdAt: now
  });
  await simulation.save();

  res.status(201).json({ success: true, data: { simulation: await loadSimulation(simulation._id), serverTime: new Date() } });
}));

// @desc    Undo a submission
// @route   DELETE /api/simulations/:id/submissions/:submissionId
// @access  Private (participants)
router.delete('/:id/submissions/:submissionId', validateId(), validateId('submissionId'), simulationActionLimiter, asyncHandler(async (req, res) => {
  const simulation = await Simulation.findById(req.params.id);
  if (!simulation) return notFound(res);
  if (!isParticipant(simulation, req.user)) return forbidden(res);

  const submission = simulation.submissions.id(req.params.submissionId);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  submission.deleteOne();
  await simulation.save();

  res.json({ success: true, data: { simulation: await loadSimulation(simulation._id), serverTime: new Date() } });
}));

// @desc    Delete simulation
// @route   DELETE /api/simulations/:id
// @access  Private (participants or admin)
router.delete('/:id', validateId(), asyncHandler(async (req, res) => {
  const simulation = await Simulation.findById(req.params.id);
  if (!simulation) return notFound(res);
  if (!isParticipant(simulation, req.user) && req.user.role !== 'admin') return forbidden(res);

  await simulation.deleteOne();
  res.json({ success: true, message: 'Simulation deleted' });
}));

export default router;
