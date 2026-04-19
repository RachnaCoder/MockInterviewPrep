import type { Request, Response } from 'express';
import crypto from 'crypto';
import { User, PlanType, SubscriptionStatus } from '../models/User.ts';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_placeholder';

/**
 * Controller to handle Razorpay webhook events.
 */
export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = JSON.stringify(req.body);

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`Razorpay Webhook Event: ${event}`);

    switch (event) {
      case 'subscription.activated':
        await handleSubscriptionActivated(payload.subscription.entity);
        break;
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload.subscription.entity);
        break;
      default:
        console.log(`Unhandled event: ${event}`);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Handle subscription activation.
 */
const handleSubscriptionActivated = async (subscription: any) => {
  const user = await User.findOne({ 'subscription.id': subscription.id });
  if (!user) return console.error(`User not found for subscription: ${subscription.id}`);

  // Find plan name from Razorpay plan ID (reverse mapping)
  const RAZORPAY_PLAN_MAP: Record<string, PlanType> = {
    [process.env.RAZORPAY_PRO_PLAN_ID || 'plan_pro_placeholder']: PlanType.PRO,
    [process.env.RAZORPAY_CUSTOM_PLAN_ID || 'plan_custom_placeholder']: PlanType.CUSTOM,
  };

  const planType = RAZORPAY_PLAN_MAP[subscription.plan_id] || PlanType.FREE;

  user.plan = planType;
  user.subscription.status = SubscriptionStatus.ACTIVE;
  user.subscription.currentPeriodStart = new Date(subscription.current_start * 1000);
  user.subscription.currentPeriodEnd = new Date(subscription.current_end * 1000);
  user.usage.lastResetDate = new Date(); // Reset usage on activation
  user.usage.interviewsThisMonth = 0;
  user.usage.minutesThisMonth = 0;

  await user.save();
  console.log(`Subscription activated for user: ${user.email}`);
};

/**
 * Handle payment captured (renewal or initial).
 */
const handlePaymentCaptured = async (payment: any) => {
  // Update billing cycle if needed
  if (payment.subscription_id) {
    const user = await User.findOne({ 'subscription.id': payment.subscription_id });
    if (user) {
      user.subscription.status = SubscriptionStatus.ACTIVE;
      user.subscription.paymentMethod = payment.method;
      await user.save();
    }
  }
};

/**
 * Handle payment failure.
 */
const handlePaymentFailed = async (payment: any) => {
  if (payment.subscription_id) {
    const user = await User.findOne({ 'subscription.id': payment.subscription_id });
    if (user) {
      user.subscription.status = SubscriptionStatus.PAST_DUE;
      await user.save();
      // Notify user about payment failure (email service)
    }
  }
};

/**
 * Handle subscription cancellation.
 */
const handleSubscriptionCancelled = async (subscription: any) => {
  const user = await User.findOne({ 'subscription.id': subscription.id });
  if (user) {
    // Auto downgrade to free on expiration
    user.plan = PlanType.FREE;
    user.subscription.status = SubscriptionStatus.CANCELLED;
    user.subscription.id = undefined;
    await user.save();
    console.log(`Subscription cancelled and user downgraded: ${user.email}`);
  }
};
