// src/app/api/weekly/route.js
import { NextResponse } from "next/server";
import WeeklySchedule from "@/models/WeeklySchedule";
import Absence from "@/models/Absence";
import Employee from "@/models/Employee";
import { connectDB } from "@/lib/mongoose";

function dayStartUTC(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export async function GET() {
  await connectDB();
  const schedule = await WeeklySchedule.find().populate("employee").lean();
  return NextResponse.json(schedule);
}

export async function POST(req) {
  await connectDB();
  const { week, year, day, shift, line, position, employeeName, employeeRole } =
    await req.json();

  try {
    // ensure employee exists or create
    let employee = await Employee.findOne({ name: employeeName });
    if (!employee) {
      employee = await Employee.create({
        name: employeeName,
        role: employeeRole,
      });
    }

    const d = dayStartUTC(day);

    // Absence block: K, U, ZA, Feiertag
    const absence = await Absence.findOne({
      employee: employee._id,
      date: d,
      type: { $in: ["K", "U", "ZA", "Feiertag"] },
    });

    if (absence) {
      const labels = {
        K: "krank",
        U: "im Urlaub",
        ZA: "im Zeitausgleich",
        Feiertag: "Feiertag",
      };
      return NextResponse.json(
        {
          error: `${employee.name} ist ${labels[absence.type]} an diesem Tag.`,
        },
        { status: 400 }
      );
    }

    // Role restriction
    if (
      employee.role === "Packer" &&
      ["Maschine/Linienbediner", "Maschine/Anlagenführer AZUBIS"].includes(
        position
      )
    ) {
      return NextResponse.json(
        { error: "Packer cannot work in this role" },
        { status: 400 }
      );
    }

    // Save assignment
    const assignment = await WeeklySchedule.create({
      week,
      year,
      day: d,
      shift,
      line,
      position,
      employee: employee._id,
    });

    return NextResponse.json(await assignment.populate("employee"));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
