import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Employee from "@/models/Employee";
import Weekly from "@/models/WeeklySchedule";
import Absence from "@/models/Absence";

export async function DELETE(req, { params }) {
  await connectDB();

  try {
    const employee = await Employee.findByIdAndDelete(params.id);

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Clean up related schedules + absences
    await Weekly.deleteMany({ employee: params.id });
    await Absence.deleteMany({ employee: params.id });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  const { name, role } = await req.json();

  if (!name || !role) {
    return NextResponse.json(
      { error: "Name and role are required" },
      { status: 400 }
    );
  }

  try {
    // Optional: prevent duplicate names (except the same record)
    const dup = await Employee.findOne({
      name: name.trim(),
      _id: { $ne: id },
    }).lean();
    if (dup) {
      return NextResponse.json(
        { error: "An employee with this name already exists." },
        { status: 409 }
      );
    }

    const updated = await Employee.findByIdAndUpdate(
      id,
      { $set: { name: name.trim(), role } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
