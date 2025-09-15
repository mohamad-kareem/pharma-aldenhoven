import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Employee from "@/models/Employee";

export async function GET() {
  await connectDB();
  const employees = await Employee.find().lean();
  return NextResponse.json(employees);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json(); // { name, role }
  try {
    const employee = await Employee.findOneAndUpdate(
      { name: body.name.trim() },
      { $setOnInsert: { name: body.name.trim(), role: body.role } },
      { new: true, upsert: true }
    );
    return NextResponse.json(employee);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
