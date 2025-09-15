// src/app/api/absences/route.js
import { NextResponse } from "next/server";
import Absence from "@/models/Absence";
import { connectDB } from "@/lib/mongoose";

export async function GET() {
  await connectDB();
  const absences = await Absence.find().populate("employee").lean();
  return NextResponse.json(absences);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  try {
    const absence = await Absence.create(data);
    return NextResponse.json(absence);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
