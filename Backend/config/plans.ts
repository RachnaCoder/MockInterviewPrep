import { PlanType } from '../models/User.ts';

export interface PlanConfig {
  id: PlanType;
  name: string;
  interviewLimit: number; // Monthly limit
  maxDurationPerInterview: number; // In minutes
  features: {
    detailedFeedback: boolean;
    premiumVoices: boolean;
    transcriptHistory: boolean;
    prioritySupport: boolean;
  };
}

export const PLANS: Record<PlanType, PlanConfig> = {
  [PlanType.FREE]: {
    id: PlanType.FREE,
    name: 'Free',
    interviewLimit: 3,
    maxDurationPerInterview: 6,
    features: {
      detailedFeedback: false,
      premiumVoices: false,
      transcriptHistory: false,
      prioritySupport: false,
    },
  },
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'Pro',
    interviewLimit: 15,
    maxDurationPerInterview: 10,
    features: {
      detailedFeedback: true,
      premiumVoices: true,
      transcriptHistory: true,
      prioritySupport: true,
    },
  },
  [PlanType.CUSTOM]: {
    id: PlanType.CUSTOM,
    name: 'Custom',
    interviewLimit: 25,
    maxDurationPerInterview: 15,
    features: {
      detailedFeedback: true,
      premiumVoices: true,
      transcriptHistory: true,
      prioritySupport: true,
    },
  },
};
