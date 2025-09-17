// models/Activity.js
import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String,
  page: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Activity ||
  mongoose.model("Activity", ActivitySchema);
