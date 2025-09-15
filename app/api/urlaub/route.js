import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Absence from "@/models/Absence";

function dayStartUTC(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const ym = searchParams.get("ym"); // "2026-01" optional
  let filter = {};
  if (ym) {
    const start = dayStartUTC(`${ym}-01`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    filter.date = { $gte: start, $lt: end };
  }
  const items = await Absence.find(filter).populate("employee").lean();
  return NextResponse.json(items);
}

export async function POST(req) {
  await connectDB();
  const { employeeId, date, type } = await req.json(); // type in ["U","ZA","K","Feiertag"] or "NONE"
  const d = dayStartUTC(date);
  try {
    if (type === "NONE") {
      await Absence.findOneAndDelete({ employee: employeeId, date: d });
      return NextResponse.json({ ok: true, removed: true });
    }
    const doc = await Absence.findOneAndUpdate(
      { employee: employeeId, date: d },
      { employee: employeeId, date: d, type },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("employee");
    return NextResponse.json(doc);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
