"use client";
import { useState } from "react";
import { Leaf, Loader } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) setError(data.error);
      else setMessage(data.message);
    } catch (err) {
      setError("Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 to-emerald-950 px-4">
      {/* Logo top-left */}
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

      {/* Animated blobs - matching dashboard theme */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/2 -right-32 w-72 h-72 bg-teal-400/10 rounded-full mix-blend-screen filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-green-500/10 rounded-full mix-blend-screen filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Card - matching dashboard design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-gray-900 to-emerald-950 backdrop-blur-md w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl border border-gray-700 p-6 sm:p-8"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-3 rounded-full shadow-lg">
              <Leaf className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Passwort vergessen
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Geben Sie Ihre E-Mail-Adresse ein, um Ihr Passwort zurückzusetzen
          </p>
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 text-center bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 text-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg text-sm"
          >
            {message}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              E-Mail-Adresse
            </label>
            <input
              type="email"
              placeholder="Geben Sie Ihre E-Mail-Adresse ein"
              className="w-full border border-gray-600 bg-gray-800 text-white p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-sm placeholder-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-emerald-800 disabled:to-green-800 text-white text-sm sm:text-base font-semibold py-2.5 sm:py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              "Link zum Zurücksetzen senden"
            )}
          </motion.button>
        </form>

        {/* Back to sign in */}
        <div className="mt-5 text-center">
          <Link
            href="/signin"
            className="text-xs sm:text-sm text-emerald-400 font-medium hover:text-emerald-300 transition-colors hover:underline"
          >
            Zurück zur Anmeldung
          </Link>
        </div>
      </motion.div>

      {/* Background glow effects matching dashboard */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl"></div>
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
