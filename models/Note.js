// models/Note.js
import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true }, // linked to day
    week: { type: Number, required: true },
    year: { type: Number, required: true },
    text: { type: String, required: true },
    author: { type: String }, // optional: who wrote the note
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
