"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close mobile menu when clicking on a link
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Add scroll effect to navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header
        className={`w-full fixed top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-black shadow-md py-2" : " py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Logo / App name */}
          <h1
            className={`text-xl sm:text-2xl font-bold transition-colors ${
              isScrolled || isMenuOpen
                ? "text-[var(--color-primary)]"
                : "text-black"
            }`}
          >
            Pharma Aldenhoven
          </h1>

          {/* Desktop Nav links - hidden on mobile */}
          <nav className="hidden md:block">
            <ul className="flex gap-6 text-white font-medium mr-20">
              <li>
                <Link
                  href="/signin"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-md transition-colors ${
              isScrolled || isMenuOpen
                ? "text-[var(--color-primary)]"
                : "text-black"
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <nav className="px-4 pt-2 pb-4">
              <ul className="flex flex-col space-y-3">
                <li>
                  <Link
                    href="/signin"
                    className="block py-2 text-gray-700 hover:text-[var(--color-primary)] transition-colors"
                    onClick={handleLinkClick}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="block py-2 text-gray-700 hover:text-[var(--color-primary)] transition-colors"
                    onClick={handleLinkClick}
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="block py-2 text-gray-700 hover:text-[var(--color-primary)] transition-colors"
                    onClick={handleLinkClick}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="block py-2 text-gray-700 hover:text-[var(--color-primary)] transition-colors"
                    onClick={handleLinkClick}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="flex-1 relative flex items-center justify-center mt-16 md:mt-0">
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
        <div className="relative z-10 text-center text-white px-4 py-12 md:py-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Willkommen im Admin-Portal
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
            Ihre zentrale Plattform zur Verwaltung von Prozessen, Mitarbeitern
            und Unternehmensressourcen.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/signin"
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-dark)] transition"
              onClick={handleLinkClick}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-white text-[var(--color-primary)] font-semibold hover:bg-gray-200 transition"
              onClick={handleLinkClick}
            >
              Register
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-center md:text-left">
            © {new Date().getFullYear()} Pharma Aldenhoven. Alle Rechte
            vorbehalten.
          </p>

          <div className="flex gap-4 sm:gap-6 text-sm">
            <Link
              href="/impressum"
              className="hover:text-white transition-colors"
              onClick={handleLinkClick}
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="hover:text-white transition-colors"
              onClick={handleLinkClick}
            >
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
