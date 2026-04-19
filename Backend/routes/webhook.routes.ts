import express from 'express';
import { handleRazorpayWebhook } from '../controllers/webhook.controller.ts';

const router = express.Router();

// Webhook endpoint should use raw body for signature verification if needed, 
// but Express json parser is usually fine for Razorpay.
router.post('/razorpay', express.json(), handleRazorpayWebhook);

export default router;
