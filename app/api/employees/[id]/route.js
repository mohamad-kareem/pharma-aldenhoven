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
