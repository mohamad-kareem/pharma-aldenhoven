// src/app/api/weekly/route.js
import { NextResponse } from "next/server";
import WeeklySchedule from "@/models/WeeklySchedule";
import Absence from "@/models/Absence";
import Employee from "@/models/Employee";
import { connectDB } from "@/lib/mongoose";

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

    // Krank check
    const absence = await Absence.findOne({
      employee: employee._id,
      date: day,
      type: "K",
    });
    if (absence) {
      return NextResponse.json(
        { error: `${employee.name} is sick on this day` },
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
      day,
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
