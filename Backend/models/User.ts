// import mongoose, { Schema, Document } from 'mongoose';

// export enum PlanType {
//   FREE = 'free',
//   PRO = 'pro',
//   CUSTOM = 'custom',
// }

// export enum SubscriptionStatus {
//   ACTIVE = 'active',
//   INACTIVE = 'inactive',
//   CANCELLED = 'cancelled',
//   PAST_DUE = 'past_due',
// }

// export interface IUser extends Document {
//   email: string;
//   name?: string;
//   phone?: string;
//   password?: string;
//   plan: PlanType;
//   subscription: {
//     id?: string; // Razorpay Subscription ID
//     status: SubscriptionStatus;
//     currentPeriodStart?: Date;
//     currentPeriodEnd?: Date;
//     cancelAtPeriodEnd: boolean;
//     paymentMethod?: string;
//   };
//   usage: {
//     interviewsThisMonth: number;
//     minutesThisMonth: number;
//     lastResetDate: Date;
//   };
//   createdAt: Date;
//   updatedAt: Date;
// }

// const UserSchema: Schema = new Schema(
//   {
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     name: { type: String, trim: true },
//     phone: { type: String, trim: true },
//     password: { type: String, select: false },
//     plan: {
//       type: String,
//       enum: Object.values(PlanType),
//       default: PlanType.FREE,
//     },
//     subscription: {
//       id: { type: String },
//       status: {
//         type: String,
//         enum: Object.values(SubscriptionStatus),
//         default: SubscriptionStatus.INACTIVE,
//       },
//       currentPeriodStart: { type: Date },
//       currentPeriodEnd: { type: Date },
//       cancelAtPeriodEnd: { type: Boolean, default: false },
//       paymentMethod: { type: String },
//     },
//     usage: {
//       interviewsThisMonth: { type: Number, default: 0 },
//       minutesThisMonth: { type: Number, default: 0 },
//       lastResetDate: { type: Date, default: Date.now },
//     },
//   },
//   { timestamps: true }
// );

// // Index for faster lookups by subscription ID (for webhooks)
// UserSchema.index({ 'subscription.id': 1 });

// export const User = mongoose.model<IUser>('User', UserSchema);


import mongoose, { Schema, Document } from 'mongoose';

//  JS-safe objects (instead of enums)
export const PlanType = {
  FREE: 'free',
  PRO: 'pro',
  CUSTOM: 'custom',
} as const;

export const SubscriptionStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due',
} as const;

//  TypeScript types (same as enum behavior)
export type PlanType = typeof PlanType[keyof typeof PlanType];
export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

// Interface
export interface IUser extends Document {
  email: string;
  name?: string;
  phone?: string;
  password?: string;
  plan: PlanType;
  subscription: {
    id?: string; // Razorpay Subscription ID
    status: SubscriptionStatus;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd: boolean;
    paymentMethod?: string;
  };
  usage: {
    interviewsThisMonth: number;
    minutesThisMonth: number;
    lastResetDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

//  Schema
const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, select: false },

    plan: {
      type: String,
      enum: Object.values(PlanType), // ['free', 'pro', 'custom']
      default: PlanType.FREE,
    },

    subscription: {
      id: { type: String },

      status: {
        type: String,
        enum: Object.values(SubscriptionStatus),
        default: SubscriptionStatus.INACTIVE,
      },

      currentPeriodStart: { type: Date },
      currentPeriodEnd: { type: Date },
      cancelAtPeriodEnd: { type: Boolean, default: false },
      paymentMethod: { type: String },
    },

    usage: {
      interviewsThisMonth: { type: Number, default: 0 },
      minutesThisMonth: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: Date.now },
    },

  role: {
   type: String,
   enum: ["user", "admin"],
   default: "user"
},
  },
  {
    timestamps: true,
  }
);

// Index for webhook performance
UserSchema.index({ 'subscription.id': 1 });

//  Model export
export const User = mongoose.model<IUser>('User', UserSchema);