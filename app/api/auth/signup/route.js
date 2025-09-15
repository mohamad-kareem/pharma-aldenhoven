import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    await connectDB();

    // check if name already exists
    const existingName = await User.findOne({ name });
    if (existingName) {
      return NextResponse.json(
        { error: "Name is already taken" },
        { status: 400 }
      );
    }

    // check if email exists (optional)
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "User created successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
