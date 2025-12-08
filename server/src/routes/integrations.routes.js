import express from 'express';
import {
  getCodeforcesUser,
  getCodeforcesRating,
  getCodeforcesContests,
  createExcalidrawRoom,
  getRPCContests,
  getRPCRegistrationUrl,
  executeCode,
  getSupportedLanguages,
  getCodeTemplate
} from '../controllers/integrations.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Codeforces routes
router.get('/codeforces/user/:handle', getCodeforcesUser);
router.get('/codeforces/rating/:handle', getCodeforcesRating);
router.get('/codeforces/contests', getCodeforcesContests);

// Excalidraw routes
router.post('/excalidraw/room', createExcalidrawRoom);

// RPC routes
router.get('/rpc/contests', getRPCContests);
router.get('/rpc/register/:contestId?', getRPCRegistrationUrl);

// USACO IDE routes
router.post('/usaco-ide/execute', executeCode);
router.get('/usaco-ide/languages', getSupportedLanguages);
router.get('/usaco-ide/template/:language', getCodeTemplate);

export default router;
