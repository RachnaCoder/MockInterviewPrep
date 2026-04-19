// test-env.ts
import dotenv from "dotenv";

dotenv.config();

console.log("KEY:", process.env.RAZORPAY_KEY_ID);