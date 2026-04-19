import type { IUser } from '../models/User.ts';

/**
 * Checks if the user's monthly usage needs to be reset based on their billing cycle.
 * If reset is needed, updates the user's usage and lastResetDate.
 * @param user The user document from Mongoose
 * @returns boolean indicating if a reset was performed
 */
export const checkAndResetUsage = async (user: IUser): Promise<boolean> => {
  const now = new Date();
  const lastReset = new Date(user.usage.lastResetDate);
  
  // Calculate next reset date (1 month after last reset)
  const nextReset = new Date(lastReset);
  nextReset.setMonth(nextReset.getMonth() + 1);

  if (now >= nextReset) {
    user.usage.interviewsThisMonth = 0;
    user.usage.minutesThisMonth = 0;
    user.usage.lastResetDate = now;
    await user.save();
    return true;
  }

  return false;
};
