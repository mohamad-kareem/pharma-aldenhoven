import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: [
        "Vorarbeiter/in",
        "QK",
        "Bucher",
        "Zubr.Außen",
        "Zubr.Reinraum",
        "Lager",
        "UmbautenTechnik",
        "Linienführer",
        "Maschinenführer",
        "Reinraum",
        "Maschine/Linienbediner",
        "Maschine/Anlagenführer AZUBIS",
        "Packer",
        "Teilzeitkraft",
        "Staplerfahrer",
        "Zubringer Reinraum",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Employee ||
  mongoose.model("Employee", EmployeeSchema);
