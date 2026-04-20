import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { adminMiddleware } from "../middleware/admin.middleware.ts";
import { User } from "../models/User.ts";
import mongoose from "mongoose";

const router = express.Router();

// Apply both middlewares
router.use(authMiddleware, adminMiddleware);

// 📌 GET ALL USERS
router.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// 📌 DELETE USER
router.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// 📌 GET ALL INTERVIEWS
router.get("/interviews", async (req, res) => {
  const Interview = mongoose.model("Interview");
  const interviews = await Interview.find().populate("userId", "email");
  res.json(interviews);
});

export default router;