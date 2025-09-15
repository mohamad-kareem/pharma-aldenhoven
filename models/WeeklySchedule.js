import mongoose from "mongoose";

const WeeklyScheduleSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    week: { type: Number, required: true },
    date: { type: Date, required: true }, // make sure this exists!
    shift: { type: String, enum: ["Früh", "Spät", "Nacht"], required: true },
    line: { type: String, default: "" }, // "" for global roles
    position: { type: String, required: true },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
  },
  { timestamps: true }
);

WeeklyScheduleSchema.index(
  { date: 1, shift: 1, line: 1, position: 1 },
  { unique: true }
);

export default mongoose.models.WeeklySchedule ||
  mongoose.model("WeeklySchedule", WeeklyScheduleSchema);
