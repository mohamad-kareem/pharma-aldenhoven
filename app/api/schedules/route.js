import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Weekly from "@/models/WeeklySchedule";
import Absence from "@/models/Absence";
import Employee from "@/models/Employee";

/* ---------- Helpers ---------- */
function dayStartUTC(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
function isoWeek(d) {
  const date = dayStartUTC(d);
  // Thursday in current week decides the year.
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return { week: weekNo, year: date.getUTCFullYear() };
}

/* ---------- GET: fetch schedules ---------- */
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const date = searchParams.get("date"); // optional filter
  const filter = {};
  if (date) filter.date = dayStartUTC(date);

  try {
    const rows = await Weekly.find(filter).populate("employee").lean();
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ---------- POST: create/update schedule ---------- */
export async function POST(req) {
  await connectDB();
  const { date, shift, line, position, employeeId, customName, color } =
    await req.json();

  if (!date || !shift || !position) {
    return NextResponse.json(
      { error: "Missing required fields (date, shift, position)" },
      { status: 400 }
    );
  }

  const d = dayStartUTC(date);
  const { week, year } = isoWeek(d);

  let employee = null;

  // If employeeId is provided → validate employee
  if (employeeId) {
    employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Absence block: K, U, ZA, Feiertag
    const absence = await Absence.findOne({
      employee: employeeId,
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

    // Packer restriction
    if (
      employee.role === "Packer" &&
      ["Maschine/Linienbediner", "Maschine/Anlagenführer AZUBIS"].includes(
        position
      )
    ) {
      return NextResponse.json(
        { error: "Packer dürfen hier nicht eingeplant werden." },
        { status: 400 }
      );
    }
  }

  try {
    const saved = await Weekly.findOneAndUpdate(
      { date: d, shift, line: line || "", position },
      {
        year,
        week,
        date: d,
        shift,
        line: line || "",
        position,
        employee: employee ? employee._id : null,
        customName: employee ? "" : customName || "",
        color: color || null,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("employee");

    return NextResponse.json(saved);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

/* ---------- DELETE: remove schedule ---------- */
export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const date = searchParams.get("date");
  const shift = searchParams.get("shift");
  const line = searchParams.get("line") || "";
  const position = searchParams.get("position");

  if (!date || !shift || !position) {
    return NextResponse.json(
      { error: "Missing required params (date, shift, position)" },
      { status: 400 }
    );
  }

  try {
    const d = dayStartUTC(date);
    const res = await Weekly.findOneAndDelete({
      date: d,
      shift,
      line,
      position,
    });
    return NextResponse.json(res || { success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
