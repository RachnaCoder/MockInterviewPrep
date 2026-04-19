import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.ts';
import { checkPlanAccess, checkInterviewLimit, checkFeatureAccess } from '../middleware/subscription.middleware.ts';
import { 
  startInterview, 
  saveInterview, 
  getInterviews, 
  getInterviewFeedback, 
  getPremiumVoices 
} from '../controllers/interview.controller.ts';

const router = express.Router();

router.use(authMiddleware);

/**
 * Route to start a mock interview.
 * Checks for active subscription and monthly limits.
 */
router.post('/start', checkPlanAccess, checkInterviewLimit, startInterview);

/**
 * Route to save a completed interview.
 */
router.post('/', saveInterview);

/**
 * Route to fetch all interviews for a user.
 */
router.get('/', getInterviews);

/**
 * Route to get detailed AI feedback.
 * Checks if the user's plan supports this feature.
 */
router.get('/feedback/:id', checkFeatureAccess('detailedFeedback'), getInterviewFeedback);

/**
 * Route to access premium voices.
 */
router.get('/voices', checkFeatureAccess('premiumVoices'), getPremiumVoices);

export default router;
