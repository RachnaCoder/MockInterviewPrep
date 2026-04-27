import express from "express";
const router = express.Router();
import { User } from "../models/User.ts";


// ADD BOOKMARK
router.post("/bookmark/:tipId", async (req: any, res) => {
  const user = await User.findById(req.user._id);

  if (!user.bookmarks.includes(req.params.tipId)) {
    user.bookmarks.push(req.params.tipId);
    await user.save();
  }

  res.json({ success: true });
});

// REMOVE BOOKMARK
router.delete("/bookmark/:tipId", async (req: any, res) => {
  const user = await User.findById(req.user._id);

  user.bookmarks = user.bookmarks.filter(
    (id: any) => id.toString() !== req.params.tipId
  );

  await user.save();

  res.json({ success: true });
});