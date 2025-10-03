// src/app/api/notes/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Note from "@/models/Note";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
function dayStartUTC(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

// GET notes for a date
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json([]);

  const d = dayStartUTC(date);
  const notes = await Note.find({ date: d }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(notes);
}

export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { date, week, year, text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "Note text required" }, { status: 400 });
  }

  const d = dayStartUTC(date);
  const saved = await Note.create({
    date: d,
    week,
    year,
    text,
    author: session?.user?.name || "Unbekannt", // fallback
  });

  return NextResponse.json(saved);
}
export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  await Note.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
