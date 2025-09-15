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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mb-3"></div>
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
      title: "Schedules",
      href: "/schedule?tab=weekly",
      description: "Manage weekly schedules",
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      title: "Medicine Lines",
      href: "/medicine",
      description: "Production lines management",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      title: "Employees",
      href: "/schedule?tab=employees",
      description: "Team management",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Add Admin",
      href: "/signup",
      description: "Create new accounts",
      icon: <UserPlus className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-1">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-xl font-bold tracking-tight">
              Willkommen,{" "}
              <span className="bg-gradient-to-r from-green-500 to-green-800 bg-clip-text text-transparent">
                {firstName}
              </span>
            </h1>
            <p className="text-xs text-gray-500">{todayStr}</p>
            <div className="mt-2 h-0.5 md:h-1 w-12 md:w-16 rounded-full bg-gradient-to-br from-green-600 to-black/80"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Quick Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {cards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="bg-green-200 border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-green-300 hover:shadow-sm transition-all flex flex-col"
              >
                <div className="text-green-700 mb-2 sm:mb-3 flex-shrink-0">
                  {card.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">
                  {card.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-snug">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Employees */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-orange-100 p-2 rounded-md mr-3">
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Total Employees
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {employees.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Vacation */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-md mr-3">
                  <Umbrella className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    On Vacation
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {urlaubEmployees.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Zeitausgleich */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-md mr-3">
                  <Clock className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Zeitausgleich
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {zaEmployees.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Sick Leave */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-md mr-3">
                  <Stethoscope className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Sick Leave
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {krankEmployees.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Distribution + Absence Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Team Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  Team Distribution
                </h2>
                <span className="text-xs text-gray-500">
                  {employees.length} employees
                </span>
              </div>
              <div className="space-y-3">
                {ROLE_ORDER.map((r) => (
                  <div key={r} className="flex items-center">
                    <div className="w-32 text-xs text-gray-600 truncate">
                      {r}
                    </div>
                    <div className="flex-1 mx-2">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
              {/* Vacation */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 p-1.5 rounded mr-2">
                    <Umbrella className="w-4 h-4 text-green-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    On Vacation
                  </h2>
                  <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    {urlaubEmployees.length}
                  </span>
                </div>
                {urlaubEmployees.length > 0 ? (
                  <ul className="space-y-1.5">
                    {urlaubEmployees.map((name, i) => (
                      <li
                        key={i}
                        className="px-2 py-1.5 bg-green-50 border border-green-100 rounded text-xs text-green-800 flex items-center"
                      >
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 py-2">
                    No employees on vacation today
                  </p>
                )}
              </div>

              {/* Sick Leave */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center mb-3">
                  <div className="bg-red-100 p-1.5 rounded mr-2">
                    <Stethoscope className="w-4 h-4 text-red-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Sick Leave
                  </h2>
                  <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                    {krankEmployees.length}
                  </span>
                </div>
                {krankEmployees.length > 0 ? (
                  <ul className="space-y-1.5">
                    {krankEmployees.map((name, i) => (
                      <li
                        key={i}
                        className="px-2 py-1.5 bg-red-50 border border-red-100 rounded text-xs text-red-800 flex items-center"
                      >
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 py-2">
                    No employees on sick leave today
                  </p>
                )}
              </div>

              {/* Zeitausgleich */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center mb-3">
                  <div className="bg-indigo-100 p-1.5 rounded mr-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Zeitausgleich
                  </h2>
                  <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                    {zaEmployees.length}
                  </span>
                </div>
                {zaEmployees.length > 0 ? (
                  <ul className="space-y-1.5">
                    {zaEmployees.map((name, i) => (
                      <li
                        key={i}
                        className="px-2 py-1.5 bg-indigo-50 border border-indigo-100 rounded text-xs text-indigo-800 flex items-center"
                      >
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 py-2">
                    No employees on Zeitausgleich today
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
