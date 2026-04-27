import express from "express";
import { Tip } from "../models/Tip.ts";

const router = express.Router();

// GET ALL TIPS
router.get("/", async (req, res) => {
  const tips = await Tip.find().sort({ createdAt: -1 });
  res.json(tips);
});

export default router;