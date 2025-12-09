import express from 'express';
import { getUsers, getUser, updateUser, updateUserStatus, updateUserMember, deleteUser } from '../controllers/users.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { validateId } from '../middlewares/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.get('/', authorize('admin'), getUsers);
router.get('/:id', validateId(), getUser);
router.put('/:id', authorize('admin'), validateId(), updateUser);
router.put('/:id/status', authorize('admin'), validateId(), updateUserStatus);
router.put('/:id/member', authorize('admin'), validateId(), updateUserMember);
router.delete('/:id', authorize('admin'), validateId(), deleteUser);

export default router;
