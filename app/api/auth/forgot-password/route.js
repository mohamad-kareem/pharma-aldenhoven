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
        { error: "Kein Benutzer mit dieser E-Mail gefunden" },
        { status: 400 }
      );
    }

    // Token & Ablauf generieren
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 Minuten

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // E-Mail versenden
    const transporter = nodemailer.createTransport({
      service: "gmail", // oder SMTP-Einstellungen
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Passwort-Zurücksetzung",
      html: `
        <p>Hallo ${user.name},</p>
        <p>Sie haben eine Zurücksetzung Ihres Passworts angefordert. Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Dieser Link ist 15 Minuten gültig.</p>
      `,
    });

    return NextResponse.json({
      message:
        "Ein Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail gesendet",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
