import type { Request, Response, NextFunction } from 'express';
import { PLANS } from '../config/plans.ts';
import { PlanType} from '../models/User.ts';
import type { IUser} from '../models/User.ts';

import { checkAndResetUsage } from '../utils/usageReset.ts';

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * Middleware to check if the user has reached their monthly interview limit.
 */
export const checkInterviewLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  // Reset usage if billing cycle has passed
  await checkAndResetUsage(user);

  const planConfig = PLANS[user.plan];
  
  // Check interview count limit for all plans
  if (user.usage.interviewsThisMonth >= planConfig.interviewLimit) {
    const upgradeMessage = user.plan === PlanType.FREE 
      ? 'Upgrade to Pro for more interviews' 
      : 'Monthly interview limit reached. Upgrade or wait for next cycle.';
    
    return res.status(403).json({
      code: 'LIMIT_REACHED',
      message: upgradeMessage,
      limit: planConfig.interviewLimit,
    });
  }

  next();
};

/**
 * Middleware to check if the user has access to a specific feature.
 */

type PlanFeatures = typeof PLANS[keyof typeof PLANS]['features'];

export const checkFeatureAccess = (feature: keyof PlanFeatures) => {

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const planConfig = PLANS[user.plan];
    if (!planConfig.features[feature]) {
      return res.status(403).json({
        code: 'FEATURE_LOCKED',
        message: `This feature is not available on the ${planConfig.name} plan. Please upgrade.`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if the user has an active subscription.
 */
export const checkPlanAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  // If user is on a paid plan, check if subscription is active
  if (user.plan !== PlanType.FREE && user.subscription.status !== 'active') {
    return res.status(403).json({
      code: 'PLAN_EXPIRED',
      message: 'Your plan has expired or is inactive. Please upgrade or renew to continue.',
    });
  }

  next();
};
