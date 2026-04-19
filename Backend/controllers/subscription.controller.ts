import type { Request, Response } from 'express';
import { razorpay, createSubscription } from '../services/razorpay.service.ts';
import { User, PlanType, SubscriptionStatus } from '../models/User.ts';

/**
 * Controller to handle subscription creation.
 */
export const createSubscriptionController = async (req: Request, res: Response) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ message: 'Plan ID is required.' });
    }
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user already has an active subscription
    if (user.plan !== PlanType.FREE && user.subscription.status === SubscriptionStatus.ACTIVE) {
      return res.status(400).json({ message: 'User already has an active subscription.' });
    }

    // Map plan name to Razorpay plan ID (these should be in env or config)
    const RAZORPAY_PLAN_MAP: Record<string, string> = {
      [PlanType.PRO]: process.env.RAZORPAY_PRO_PLAN_ID || 'plan_pro_placeholder',
      [PlanType.CUSTOM]: process.env.RAZORPAY_CUSTOM_PLAN_ID || 'plan_custom_placeholder',
    };

    const razorpayPlanId = RAZORPAY_PLAN_MAP[planId];
    if (!razorpayPlanId || razorpayPlanId.includes('placeholder')) {
      return res.status(400).json({ 
        message: 'Razorpay Plan ID is not configured. Please set RAZORPAY_PRO_PLAN_ID and RAZORPAY_CUSTOM_PLAN_ID in environment variables.' 
      });
    }

    // Create subscription in Razorpay
    const subscription = await createSubscription(razorpayPlanId);

    // Update user with pending subscription
    await User.findByIdAndUpdate(user._id, {
      'subscription.id': subscription.id,
      'subscription.status': SubscriptionStatus.INACTIVE, // Will be activated via webhook
    });

    res.status(201).json({
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
    });
  } catch (error: any) {
    console.error('Create Subscription Error:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      message: 'Failed to create subscription.',
      error: error.message || error
    });
  }
};

/**
 * Controller to handle subscription cancellation.
 */
export const cancelSubscriptionController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.subscription.id) {
      return res.status(400).json({ message: 'No active subscription found.' });
    }

    // Cancel in Razorpay
    await razorpay.subscriptions.cancel(user.subscription.id);

    // Update user status
    await User.findByIdAndUpdate(user._id, {
      'subscription.cancelAtPeriodEnd': true,
    });

    res.status(200).json({ message: 'Subscription will be cancelled at the end of the billing period.' });
  } catch (error) {
    console.error('Cancel Subscription Error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription.' });
  }
};

/**
 * Controller to sync subscription status from Razorpay.
 */
export const syncSubscriptionController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.subscription.id) {
      return res.status(400).json({ message: 'No active subscription found.' });
    }

    // Fetch from Razorpay
    const subscription = await razorpay.subscriptions.fetch(user.subscription.id);

    // Consider 'active' or 'authenticated' as successful for UI update
    if (subscription.status === 'active' || subscription.status === 'authenticated') {
      // Map plan ID to plan type
      const RAZORPAY_PLAN_MAP: Record<string, PlanType> = {
        [process.env.RAZORPAY_PRO_PLAN_ID || 'plan_pro_placeholder']: PlanType.PRO,
        [process.env.RAZORPAY_CUSTOM_PLAN_ID || 'plan_custom_placeholder']: PlanType.CUSTOM,
      };

      const planType = RAZORPAY_PLAN_MAP[subscription.plan_id] || PlanType.FREE;

      user.plan = planType;
      user.subscription.status = SubscriptionStatus.ACTIVE;
      user.subscription.currentPeriodStart = new Date(subscription.current_start * 1000);
      user.subscription.currentPeriodEnd = new Date(subscription.current_end * 1000);
      await user.save();

      return res.json({
        success: true,
        token: (req as any).token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          plan: user.plan,
          payment_method: user.subscription?.paymentMethod || 'Razorpay',
        }
      });
    }

    res.json({
      success: false,
      token: (req as any).token,
      message: `Subscription status is ${subscription.status}`,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        plan: user.plan,
        payment_method: user.subscription?.paymentMethod,
      }
    });
  } catch (error) {
    console.error('Sync Subscription Error:', error);
    res.status(500).json({ message: 'Failed to sync subscription.' });
  }
};
