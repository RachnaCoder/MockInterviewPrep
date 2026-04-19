import express from 'express';
import { signup, signin, me, signout } from '../controllers/auth.controller.ts';
import { authMiddleware } from '../middleware/auth.middleware.ts';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', authMiddleware, me);
router.post('/signout', signout);

export default router;

