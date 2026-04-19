import express from 'express';
import { createSubscriptionController, cancelSubscriptionController, syncSubscriptionController } from '../controllers/subscription.controller.ts';
import { authMiddleware } from '../middleware/auth.middleware.ts';

const router = express.Router();

router.use(authMiddleware);

router.post('/create', createSubscriptionController);
router.post('/cancel', cancelSubscriptionController);
router.post('/sync', syncSubscriptionController);

export default router;
