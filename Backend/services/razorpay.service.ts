import Razorpay from 'razorpay';

// These should be in environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;



export const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export const createSubscription = async (planId: string, customerId?: string) => {
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // For 1 year, or as per requirement
      // start_at: Math.floor(Date.now() / 1000) + 3600, // Optional
    });
    return subscription;
  } catch (error: any) {
    console.error('Razorpay Subscription Error:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const result = await razorpay.subscriptions.cancel(subscriptionId);
    return result;
  } catch (error) {
    console.error('Razorpay Cancel Error:', error);
    throw error;
  }
};

export const fetchSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Razorpay Fetch Error:', error);
    throw error;
  }
};
