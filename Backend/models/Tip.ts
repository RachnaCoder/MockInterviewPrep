import mongoose from "mongoose";

const tipSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
}, { timestamps: true });

export const Tip = mongoose.model("Tip", tipSchema);