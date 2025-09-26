"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  UserPlus,
  Umbrella,
  Stethoscope,
  Clock,
  ChevronRight,
  Users,
  Grid,
  LayoutGrid,
} from "lucide-react";
import { motion } from "framer-motion";

const ROLE_ORDER = [
  "Vorarbeiter/in",
  "QK",
  "Bucher",
  "Zubr.Außen",
  "Zubr.Reinraum",
  "Lager",
  "UmbautenTechnik",
  "Maschinen/Linienführer",
  "Linienführer",
  "Maschinenführer",
  "Maschine/Linienbediner",
  "Maschine/Anlagenführer AZUBIS",
  "Packer",
  "Teilzeitkraft",
  "Staplerfahrer",
  "Zubringer Reinraum",
];

// Normalize to UTC start of day
function dayStartUTC(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const ROLE_COLORS = {
    "Vorarbeiter/in":
      "bg-emerald-500/40 text-emerald-300 border-emerald-500/30",
    QK: "bg-teal-500/40 text-teal-300 border-teal-500/30",
    Bucher: "bg-lime-500/40 text-lime-300 border-lime-500/30",
    "Zubr.Außen": "bg-green-500/40 text-green-300 border-green-500/30",
    "Zubr.Reinraum": "bg-cyan-500/40 text-cyan-300 border-cyan-500/30",
    Lager: "bg-yellow-500/40 text-yellow-300 border-yellow-500/30",
    UmbautenTechnik: "bg-orange-500/40 text-orange-300 border-orange-500/30",
    "Maschinen/Linienführer": "bg-red-500/40 text-red-300 border-red-500/30",
    Linienführer: "bg-pink-500/40 text-pink-300 border-pink-500/30",
    Maschinenführer: "bg-purple-500/40 text-purple-300 border-purple-500/30",
    "Maschine/Linienbediner":
      "bg-fuchsia-500/40 text-fuchsia-300 border-fuchsia-500/30",
    "Maschine/Anlagenführer AZUBIS":
      "bg-violet-500/40 text-violet-300 border-violet-500/30",
    Packer: "bg-sky-500/40 text-sky-300 border-sky-500/30",
    Teilzeitkraft: "bg-emerald-600/40 text-emerald-400 border-emerald-600/30",
    Staplerfahrer: "bg-lime-500/40 text-lime-300 border-lime-500/30",
    "Zubringer Reinraum": "bg-green-600/40 text-green-400 border-green-600/30",
  };

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/employees").then((r) => r.json()),
        fetch(`/api/urlaub?ym=${new Date().toISOString().slice(0, 7)}`).then(
          (r) => r.json()
        ),
      ])
        .then(([employeeData, absenceData]) => {
          setEmployees(employeeData);
          setAbsences(absenceData);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-emerald-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-sm text-gray-300">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/signin");
    return null;
  }

  // First name
  const firstName = session.user.name.split(" ")[0];

  // Today formatted for header
  const todayStr = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Compute role counts
  const roleCounts = employees.reduce((acc, employee) => {
    acc[employee.role] = (acc[employee.role] || 0) + 1;
    return acc;
  }, {});

  // --- Filter absences for TODAY only ---
  const today = dayStartUTC(new Date());
  const todayISO = today.toISOString();

  const urlaubEmployees = absences
    .filter(
      (a) => a.type === "U" && new Date(a.date).toISOString() === todayISO
    )
    .map((a) => a.employee?.name)
    .filter(Boolean);

  const krankEmployees = absences
    .filter(
      (a) => a.type === "K" && new Date(a.date).toISOString() === todayISO
    )
    .map((a) => a.employee?.name)
    .filter(Boolean);

  const zaEmployees = absences
    .filter(
      (a) => a.type === "ZA" && new Date(a.date).toISOString() === todayISO
    )
    .map((a) => a.employee?.name)
    .filter(Boolean);

  // Navigation cards
  const cards = [
    {
      title: "Produktion",
      href: "/medicine",
      description: "Verwaltung der Produktionslinien",
      icon: <ClipboardList className="w-4 h-4" />,
      color: "emerald",
    },
    {
      title: "Dienstpläne",
      href: "/Mitarbeiter",
      description: "Dienstpläne und Mitarbeiter verwalten",
      icon: <CalendarDays className="w-4 h-4" />,
      color: "teal",
    },
    {
      title: "+Admin",
      href: "/signup",
      description: "Neue Konten erstellen",
      icon: <UserPlus className="w-4 h-4" />,
      color: "lime",
    },
  ];

  const colorMap = {
    emerald: "from-lime-500 to-emerald-500",
    teal: "from-teal-500 to-cyan-700",
    lime: "from-yellow-500 to-yellow-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-emerald-950 text-white overflow-hidden">
      {/* Floating Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-gradient-to-r from-green-950 to-gray-900 backdrop-blur-md border-b border-gray-800"
      >
        <div className="w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-800 to-green-600 p-1.5 rounded-lg">
                <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5 text-gray-200" />
              </div>
              <motion.header
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="ml-2"
              >
                <h1 className="text-base md:text-lg lg:text-xl font-bold">
                  Willkommen,{" "}
                  <span className="bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
                    {firstName}
                  </span>
                </h1>
                <p className="hidden sm:text-xs text-gray-400">{todayStr}</p>
              </motion.header>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto px-4 py-6">
        {/* Quick Navigation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8"
        >
          {cards.map((card) => (
            <Link key={card.title} href={card.href}>
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="relative h-full bg-gradient-to-br from-gray-900 to-emerald-950 rounded-xl p-4 overflow-hidden border border-gray-700 shadow-lg">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      colorMap[card.color]
                    } opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${
                      colorMap[card.color]
                    } opacity-0 group-hover:opacity-20 blur transition-opacity duration-500`}
                  />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${
                          colorMap[card.color]
                        } text-white shadow-md`}
                      >
                        {card.icon}
                      </div>
                      <h3 className="text-sm font-semibold">{card.title}</h3>
                    </div>
                    <p className="text-gray-400 text-xs flex-grow">
                      {card.description}
                    </p>
                    <div className="mt-auto flex items-center text-xs text-green-400 group-hover:text-gray-300">
                      Entdecken
                      <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Team + Absence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-emerald-950 rounded-xl border border-gray-700 p-5 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-white">
                Teamverteilung
              </h2>
              <span className="text-xs text-gray-400">
                {employees.length} Mitarbeiter
              </span>
            </div>
            <div className="space-y-3">
              {ROLE_ORDER.filter((r) => (roleCounts[r] || 0) > 0).map((r) => (
                <div key={r}>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{r}</span>
                    <span>{roleCounts[r]}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        ROLE_COLORS[r]?.split(" ")[0] || "bg-emerald-500"
                      }`}
                      style={{
                        width: `${
                          ((roleCounts[r] || 0) /
                            Math.max(1, employees.length)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Absence Overview */}
          <div className="space-y-4">
            {[
              {
                title: "Urlaub",
                employees: urlaubEmployees,
                color: "emerald",
                icon: <Umbrella className="w-4 h-4 text-emerald-400" />,
              },
              {
                title: "Krankheit",
                employees: krankEmployees,
                color: "red",
                icon: <Stethoscope className="w-4 h-4 text-red-400" />,
              },
              {
                title: "Zeitausgleich",
                employees: zaEmployees,
                color: "cyan",
                icon: <Clock className="w-4 h-4 text-cyan-400" />,
              },
            ].map((section, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-900 to-emerald-950 rounded-lg border border-gray-700 p-4 shadow-md"
              >
                <div className="flex items-center mb-3">
                  <div className="p-1.5 rounded bg-gray-700 mr-2">
                    {section.icon}
                  </div>
                  <h2 className="text-sm font-semibold text-white">
                    {section.title}
                  </h2>
                  <span className="ml-auto bg-green-900 text-gray-200 text-xs px-2 py-0.5 rounded-full">
                    {section.employees.length}
                  </span>
                </div>
                {section.employees.length > 0 ? (
                  <ul className="space-y-1.5">
                    {section.employees.map((name, idx) => (
                      <li
                        key={idx}
                        className="px-2 py-1.5 bg-gray-800 text-xs text-gray-200 flex items-center rounded"
                      >
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 py-2">
                    Heute keine Mitarbeiter in dieser Kategorie
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Background glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}
