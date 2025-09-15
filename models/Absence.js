import mongoose from "mongoose";
const AbsenceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: { type: Date, required: true }, // store midnight UTC for the day
    type: { type: String, enum: ["U", "ZA", "K", "Feiertag"], required: true },
  },
  { timestamps: true, index: true }
);

AbsenceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.models.Absence ||
  mongoose.model("Absence", AbsenceSchema);
