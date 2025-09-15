"use client";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo / App name */}
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">
            Pharma Aldenhoven
          </h1>

          {/* Nav links */}
          <nav className="mr-20">
            <ul className="flex gap-6 text-gray-700 font-medium">
              <li>
                <Link
                  href="/signin"
                  className="hover:text-[var(--color-primary)]"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="hover:text-[var(--color-primary)]"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[var(--color-primary)]"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[var(--color-primary)]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 relative flex items-center justify-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/landing.png"
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" /> {/* dark overlay */}
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center text-white px-6">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Willkommen im Admin-Portal
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Ihre zentrale Plattform zur Verwaltung von Prozessen, Mitarbeitern
            und Unternehmensressourcen.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/signin"
              className="px-6 py-3 rounded-lg bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-dark)] transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg bg-white text-[var(--color-primary)] font-semibold hover:bg-gray-200 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} Pharma Aldenhoven. Alle Rechte
            vorbehalten.
          </p>

          <div className="flex gap-6 text-sm">
            <Link href="/impressum" className="hover:text-white">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-white">
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
