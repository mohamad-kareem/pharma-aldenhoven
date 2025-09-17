"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react"; // still using the leaf icon for inside the card
import Image from "next/image";
import Link from "next/link";
export default function SignInPage() {
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      name: form.name,
      password: form.password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] px-4">
      {/* Logo in top-left */}
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

      {/* Animated background blobs */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/2 -right-32 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Card */}
      <div className="relative bg-white/95 backdrop-blur-md w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl border border-green-100 p-6 sm:p-8">
        {/* Header with leaf icon */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="bg-green-100 text-[var(--color-primary)] p-3 rounded-full shadow-sm">
              <Leaf className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-center bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition shadow-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--color-primary)] hover:bg-green-900 text-white text-sm sm:text-base font-semibold py-2.5 sm:py-3 rounded-lg shadow-md transition duration-200"
          >
            Sign In
          </button>
        </form>

        {/* Forgot password */}
        <div className="mt-5 text-center">
          <a
            href="/forgot-password"
            className="text-xs sm:text-sm text-[var(--color-primary)] font-medium hover:underline"
          >
            Forgot your password?
          </a>
        </div>
      </div>

      {/* Tailwind keyframes for animated blobs */}
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
