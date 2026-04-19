import type { Request, Response } from 'express';
import { User, PlanType, SubscriptionStatus } from '../models/User.ts';
import { PLANS } from '../config/plans.ts';
import mongoose from 'mongoose';

// Define Interview Schema
const InterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transcript: { type: Array, required: true },
  resumeText: { type: String },
  jobDescriptionText: { type: String },
  feedback: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

const Interview = mongoose.model('Interview', InterviewSchema);

export const startInterview = async (req: any, res: Response) => {
  try {
    const user = req.user;
    const planConfig = PLANS[user.plan];
    
    // Check if plan is expired (for paid plans)
    if (user.plan !== PlanType.FREE && user.subscription.status !== SubscriptionStatus.ACTIVE) {
      return res.status(403).json({ 
        code: 'PLAN_EXPIRED',
        message: 'Your subscription is no longer active. Please upgrade or renew to continue.' 
      });
    }

    // Check interview limit
    if (user.usage.interviewsThisMonth >= planConfig.interviewLimit) {
      return res.status(403).json({ 
        code: 'LIMIT_REACHED',
        message: `You have reached your monthly limit of ${planConfig.interviewLimit} interviews. Please upgrade for more.` 
      });
    }

    // Increment usage
    user.usage.interviewsThisMonth += 1;
    await user.save();

    res.status(200).json({ 
      message: 'Interview started successfully', 
      usage: user.usage,
      maxDuration: planConfig.maxDurationPerInterview 
    });
  } catch (error) {
    console.error('Start Interview Error:', error);
    res.status(500).json({ message: 'Failed to start interview' });
  }
};

export const saveInterview = async (req: any, res: Response) => {
  try {
    const { transcript, resumeText, jobDescriptionText, feedback } = req.body;
    const user = req.user;

    const interview = await Interview.create({
      userId: user._id,
      transcript,
      resumeText,
      jobDescriptionText,
      feedback,
    });

    res.status(201).json({ success: true, interviewId: interview._id });
  } catch (error) {
    console.error('Save Interview Error:', error);
    res.status(500).json({ message: 'Failed to save interview' });
  }
};

export const getInterviews = async (req: any, res: Response) => {
  try {
    const user = req.user;
    const interviews = await Interview.find({ userId: user._id }).sort({ createdAt: -1 });
    
    res.json({ interviews });
  } catch (error) {
    console.error('Get Interviews Error:', error);
    res.status(500).json({ message: 'Failed to fetch interviews' });
  }
};

export const getInterviewFeedback = async (req: any, res: Response) => {
  // This is a placeholder for detailed AI feedback logic
  res.status(200).json({ message: 'Detailed feedback retrieved' });
};

export const getPremiumVoices = async (req: any, res: Response) => {
  res.status(200).json({ message: 'Premium voices available' });
};
