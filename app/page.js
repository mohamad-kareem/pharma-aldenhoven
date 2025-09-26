"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Users,
  ClipboardList,
  LayoutGrid,
  Factory,
  Calendar,
  Settings,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLinkClick = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: "Produktionsverwaltung",
      description: "Verwalten Sie Produktionslinien und Prozesse effizient",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Mitarbeiter Management",
      description: "Dienstpläne und Personalressourcen optimal koordinieren",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Admin System",
      description: "Sichere Verwaltung von Benutzerkonten und Berechtigungen",
    },
  ];

  const handleDashboardClick = (e) => {
    e.preventDefault();
    if (status === "authenticated") {
      router.push("/dashboard");
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-green-950 to-emerald-950 flex flex-col">
      {/* Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`w-full fixed top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-gradient-to-r from-green-950/90 to-gray-900/90 backdrop-blur-md border-b border-gray-800 py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="h-10 sm:h-14 md:h-15 w-auto flex items-center"
            >
              <Image
                src="/logo2.png"
                alt="Pharma Aldenhoven"
                width={220}
                height={80}
                priority
                className="h-full w-auto object-contain"
              />
            </motion.div>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section with Background Image */}
      <section className="flex-1 relative flex items-center justify-center pt-16 min-h-[80vh]">
        {/* Background image with creative overlay */}
        <div className="absolute inset-0">
          <Image
            src="/landing.png"
            alt="Pharma Aldenhoven Produktion"
            fill
            priority
            className="object-center md:object-cover"
          />

          {/* Creative gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-green-950/60 to-emerald-950/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-emerald-950/30" />
          {/* Animated grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              y: [0, -20, 0],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-4 h-4 bg-emerald-400 rounded-full blur-sm"
          />
          <motion.div
            animate={{
              y: [0, 15, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-32 right-20 w-3 h-3 bg-green-400 rounded-full blur-sm"
          />
          <motion.div
            animate={{
              x: [0, 10, 0],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute top-40 right-1/4 w-2 h-2 bg-teal-400 rounded-full blur-sm"
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center text-white px-4 py-40 md:py-40 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-emerald-500/30 backdrop-blur-sm"
              >
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white font-medium">
                  Administratorzugang
                </span>
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold  bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent leading-tight"
            >
              Admin Portal
              <br />
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white mt-2 block"></span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-sm sm:text-xl md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Ihre zentrale Plattform zur Verwaltung von Prozessen bei Pharma
              Aldenhoven.
            </motion.p>

            {/* Smart Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              whileHover={{
                scale: 1.05,
                background: "linear-gradient(to right, #10b981, #059669)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDashboardClick}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-900 text-white font-semibold hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 group"
            >
              <LayoutGrid className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {status === "authenticated" ? "Zum Dashboard" : "Jetzt anmelden"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 bg-gradient-to-b from-green-950 to-green-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Umfassende Verwaltungsfunktionen
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Alle Tools die Sie für die effiziente Unternehmensführung
              benötigen
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                <div className="relative bg-gradient-to-br from-gray-900/80 to-emerald-950/80 border border-gray-800 rounded-xl p-8 backdrop-blur-sm group-hover:border-emerald-500/50 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-950 to-gray-950 border-t border-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Pharma Aldenhoven</p>
                <p className="text-sm">
                  © {new Date().getFullYear()} Alle Rechte vorbehalten.
                </p>
              </div>
            </div>

            <div className="flex gap-8 text-sm">
              <Link
                href="/impressum"
                className="hover:text-emerald-400 transition-colors"
                onClick={handleLinkClick}
              >
                Impressum
              </Link>
              <Link
                href="/datenschutz"
                className="hover:text-emerald-400 transition-colors"
                onClick={handleLinkClick}
              >
                Datenschutz
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
