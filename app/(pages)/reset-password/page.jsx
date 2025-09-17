"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) setError(data.error);
      else {
        setMessage(data.message);
        setTimeout(() => router.push("/signin"), 2000);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] px-4">
      {/* ✅ Logo top-left */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-20">
        <Link href="/" className="flex items-center">
          <div className="h-10 sm:h-14 w-auto flex items-center">
            <Image
              src="/logo2.png"
              alt="Pharma Aldenhoven"
              width={220}
              height={80}
              priority
              className="h-full w-auto object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Animated blobs */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/2 -right-32 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Card */}
      <div className="relative bg-white/95 backdrop-blur-md w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl border border-green-100 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="bg-green-100 text-[var(--color-primary)] p-3 rounded-full shadow-sm">
              <Leaf className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Reset Password
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Enter your new password below
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 text-center bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 text-center bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition shadow-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition shadow-sm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] hover:bg-green-900 text-white text-sm sm:text-base font-semibold py-2.5 sm:py-3 rounded-lg shadow-md transition duration-200 disabled:opacity-70"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Back to sign in */}
        <div className="mt-5 text-center">
          <Link
            href="/signin"
            className="text-xs sm:text-sm text-[var(--color-primary)] font-medium hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>

      {/* Tailwind keyframes */}
      <style jsx>{`
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}
