// app/api/activities/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Activity from "@/models/Activity";

// app/api/activities/route.js
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { page } = await req.json();
  await connectDB();

  // 🚫 Don't log activity if username is "karim"
  if (session.user.name.toLowerCase() === "karim") {
    return NextResponse.json({ success: true, skipped: true });
  }

  await Activity.create({
    userId: session.user.id,
    username: session.user.name,
    page,
  });

  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.name !== "karim") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await connectDB();
  const activities = await Activity.find().sort({ timestamp: -1 }).lean();
  return NextResponse.json(activities);
}
