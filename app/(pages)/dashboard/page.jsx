"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  ClipboardList,
  UserPlus,
  Umbrella,
  Stethoscope,
  Clock,
  ChevronRight,
} from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600 mb-4"></div>
          <p className="text-sm text-gray-600">Loading dashboard...</p>
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
      title: "Medicine ",
      href: "/medicine",
      description: "Production lines management",
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      title: "Schedules",
      href: "/Mitarbeiter",
      description: "Manage schedules and employees",
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      title: "+Admin",
      href: "/signup",
      description: "Create new accounts",
      icon: <UserPlus className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-gray-100 to-green-200">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-1  shadow-lg">
        <div className="w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-2xl font-bold">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-green-100">{todayStr}</p>
          </div>
        </div>
        {/* Leaf background accents */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-[100%]"></div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto space-y-6">
          {/* Quick Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {cards.map((card, index) => {
              const colorSchemes = [
                {
                  gradient: "from-green-500 to-emerald-600",
                  text: "text-green-600",
                  bg: "from-green-100 to-emerald-100",
                },
                {
                  gradient: "from-pink-500 to-red-900",
                  text: "text-red-600",
                  bg: "from-red-100 to-red-100",
                },
                {
                  gradient: "from-yellow-500 to-yellow-900",
                  text: "text-yellow-600",
                  bg: "from-amber-100 to-yellow-100",
                },
              ];
              const colors = colorSchemes[index % colorSchemes.length];

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group relative bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row sm:items-start gap-3 overflow-hidden"
                >
                  {/* Icon inside leaf shape */}
                  <div
                    className={`relative z-10 p-2 w-10 h-8 bg-gradient-to-r ${colors.gradient} text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300 rounded-tl-full rounded-br-full rotate-45`}
                  >
                    <div className="-rotate-45">{card.icon}</div>
                  </div>

                  {/* Title + Description */}
                  <div className="flex flex-col flex-1">
                    <h3 className="relative z-10 text-sm font-semibold text-gray-800 mb-1 group-hover:text-gray-900 transition-colors">
                      {card.title}
                    </h3>
                    <p className="relative z-10 text-xs text-gray-600 leading-snug flex-1">
                      {card.description}
                    </p>

                    {/* Action link */}
                    <div
                      className={`mt-2 relative z-10 flex items-center ${
                        colors.text
                      } group-hover:${colors.text.replace(
                        "600",
                        "700"
                      )} transition-colors`}
                    >
                      <span className="text-xs font-medium">Explore</span>
                      <ChevronRight className="ml-1 h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}
                  ></div>
                </Link>
              );
            })}
          </div>

          {/* Team Distribution + Absence Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Team Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  Team Distribution
                </h2>
                <span className="text-xs text-gray-500">
                  {employees.length} employees
                </span>
              </div>

              <div className="space-y-3">
                {ROLE_ORDER.filter((r) => roleCounts[r] > 0).map((r) => (
                  <div key={r} className="flex items-center">
                    <div className="w-40 text-xs text-gray-600 truncate">
                      {r}
                    </div>
                    <div className="flex-1 mx-2">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${
                              ((roleCounts[r] || 0) /
                                Math.max(1, employees.length)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-700 w-6 text-right">
                      {roleCounts[r] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Absence Overview */}
            <div className="space-y-4">
              {[
                {
                  title: "On Vacation",
                  employees: urlaubEmployees,
                  color: "green",
                  icon: <Umbrella className="w-4 h-4 text-green-600" />,
                },
                {
                  title: "Sick Leave",
                  employees: krankEmployees,
                  color: "red",
                  icon: <Stethoscope className="w-4 h-4 text-red-600" />,
                },
                {
                  title: "Zeitausgleich",
                  employees: zaEmployees,
                  color: "sky",
                  icon: <Clock className="w-4 h-4 text-sky-600" />,
                },
              ].map((section, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                >
                  <div className="flex items-center mb-3">
                    <div
                      className={`bg-${section.color}-100 p-1.5 rounded mr-2`}
                    >
                      {section.icon}
                    </div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      {section.title}
                    </h2>
                    <span
                      className={`ml-auto bg-${section.color}-100 text-${section.color}-800 text-xs px-2 py-0.5 rounded-full`}
                    >
                      {section.employees.length}
                    </span>
                  </div>
                  {section.employees.length > 0 ? (
                    <ul className="space-y-1.5">
                      {section.employees.map((name, idx) => (
                        <li
                          key={idx}
                          className={`px-2 py-1.5 bg-${section.color}-50  text-xs text-${section.color}-800 flex items-center`}
                        >
                          <span
                            className={`w-1.5 h-1.5 bg-${section.color}-500 rounded-full mr-2`}
                          ></span>
                          {name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500 py-2">
                      No employees in this category today
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
