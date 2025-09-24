import mongoose from "mongoose";

// 🔹 Preload all models once so they're always registered
import "@/models/Employee";
import "@/models/User";
import "@/models/Absence";
import "@/models/WeeklySchedule";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "pharma-aldenhoven",
    });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}
