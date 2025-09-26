"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Loader } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔒 Password validation
  function validatePassword(password) {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validatePassword(form.password)) {
      setError(
        "Passwort muss mindestens 8 Zeichen haben und Großbuchstaben, Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/signin");
      } else {
        const data = await res.json();
        setError(data.error);
      }
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
          <Image
            src="/logo2.png"
            alt="Pharma Aldenhoven"
            width={220}
            height={80}
            priority
            className="h-10 sm:h-14 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Animated background blobs */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/2 -right-32 w-72 h-72 bg-teal-400/10 rounded-full blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-green-500/10 rounded-full blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-gray-900 to-emerald-950 backdrop-blur-md w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl border border-gray-700 p-6 sm:p-8"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-3 rounded-full shadow-lg">
              <Leaf className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Admin-Konto erstellen
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Füllen Sie die Details aus, um sich zu registrieren
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 text-center bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Eindeutiger Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Geben Sie einen eindeutigen Namen ein"
              className="w-full border border-gray-600 bg-gray-800 text-white p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 transition"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              E-Mail
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Geben Sie Ihre E-Mail-Adresse ein"
              className="w-full border border-gray-600 bg-gray-800 text-white p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 transition"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Passwort
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Erstellen Sie ein sicheres Passwort"
              className="w-full border border-gray-600 bg-gray-800 text-white p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 transition"
              required
              disabled={loading}
            />
            {form.password && !validatePassword(form.password) && (
              <p className="mt-1 text-xs text-red-400">
                Mindestens 8 Zeichen, inkl. Groß- & Kleinbuchstaben, Zahl &
                Sonderzeichen.
              </p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-60 text-white text-sm sm:text-base font-semibold py-2.5 sm:py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Wird registriert...
              </>
            ) : (
              "Registrieren"
            )}
          </motion.button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            Bereits ein Konto?{" "}
            <Link
              href="/signin"
              className="text-emerald-400 font-medium hover:text-emerald-300 underline"
            >
              Zur Anmeldung
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Blob animation keyframes */}
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
