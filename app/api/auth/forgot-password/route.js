import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email } = await req.json();
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 400 }
      );
    }

    // Generate token & expiry
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail", // or SMTP settings
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link is valid for 15 minutes.</p>
      `,
    });

    return NextResponse.json({
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
