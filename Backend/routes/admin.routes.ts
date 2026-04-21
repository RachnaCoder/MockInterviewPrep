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
// router.delete("/users/:id", async (req, res) => {
//   await User.findByIdAndDelete(req.params.id);
//   res.json({ success: true });
// });

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});



// 📌 GET ALL INTERVIEWS
router.get("/interviews", async (req, res) => {
  const Interview = mongoose.model("Interview");
  const interviews = await Interview.find().populate("userId", "email");
  res.json(interviews);
});

// interview delete api

router.delete("/interviews/:id", async (req, res) => {
  try {
    const Interview = mongoose.model("Interview");

    const deleted = await Interview.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Interview delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});
export default router;