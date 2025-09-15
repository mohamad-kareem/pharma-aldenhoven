"use client";
import { useEffect, useMemo, useState } from "react";
import React from "react";
/* ---------- constants ---------- */
const LINES = [
  "Linie 0",
  "Linie 2",
  "Linie 9",
  "Linie 5",
  "Linie A",
  "Linie G",
  "Kombi",
  "Linie 7",
  "Schrumpfen",
  "Umarbeit",
];

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

const LINE_POSITIONS = ["Linienführer", "Maschinenführer", "Reinraum"];

const SHIFTS = [
  { name: "Früh", time: "06:00 - 14:15" },
  { name: "Spät", time: "14:00 - 22:15" },
  { name: "Nacht", time: "22:00 - 06:15" },
];

/* ---------- helpers ---------- */
function dayStart(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function shortenRole(role) {
  // split by space OR slash
  const words = role.split(/[\s/]+/);
  if (words.length <= 2) return role;
  return words.slice(0, 2).join(" ") + " …";
}

function dow(de) {
  return ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][de.getDay()];
}
function isoWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return { week: weekNo, year: date.getFullYear() };
}

/* ---------- Employees tab ---------- */
function EmployeesTab() {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then(setEmployees);
  }, []);

  async function add(e) {
    e.preventDefault();
    if (!name || !role) return;
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role }),
    });
    const data = await res.json();
    if (res.ok) {
      setEmployees((p) => [...p, data]);
      setName("");
      setRole("");
    } else alert(data.error);
  }

  const grouped = useMemo(
    () =>
      employees.reduce((a, e) => {
        (a[e.role] ??= []).push(e);
        return a;
      }, {}),
    [employees]
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-sm border border-gray-300">
        <h2 className="text-xl font-bold text-gray-800">Employees</h2>
      </div>

      <div className="bg-white rounded-sm border border-gray-300 p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Add New Employee
        </h3>
        <form onSubmit={add} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">-- Select role --</option>
              {ROLE_ORDER.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors">
            Add Employee
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {ROLE_ORDER.map((r) => (
          <div
            key={r}
            className="bg-white border border-gray-300 rounded-sm shadow-sm p-4"
          >
            <h3 className="text-green-800 font-semibold mb-3 pb-2 border-b border-gray-200 flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {r}
              <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {(grouped[r] ?? []).length} employees
              </span>
            </h3>
            <ul className="space-y-2">
              {(grouped[r] ?? []).length ? (
                grouped[r].map((e) => (
                  <li
                    key={e._id}
                    className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
                  >
                    <span className="text-sm">{e.name}</span>
                    <button
                      className="text-red-500 hover:text-red-700 text-xs p-1"
                      onClick={async () => {
                        if (window.confirm(`Delete ${e.name}?`)) {
                          const res = await fetch(`/api/employees/${e._id}`, {
                            method: "DELETE",
                          });
                          if (res.ok) {
                            setEmployees(
                              employees.filter((emp) => emp._id !== e._id)
                            );
                          } else {
                            alert("Error deleting employee");
                          }
                        }
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 italic text-sm py-2">
                  No employees in this role
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Weekly plan tab ---------- */
function WeeklyTab() {
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(dayStart(new Date().toISOString()));
  const [shiftData, setShiftData] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [absences, setAbsences] = useState([]);
  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then(setEmployees);
  }, []);

  useEffect(() => {
    fetch(`/api/schedules?date=${date}`)
      .then((r) => r.json())
      .then(setShiftData);
  }, [date]);
  useEffect(() => {
    fetch(`/api/urlaub?ym=${date.slice(0, 7)}`)
      .then((r) => r.json())
      .then(setAbsences);
  }, [date]);

  function isAbsent(empId, dateStr) {
    const ab = absences.find(
      (x) => x.employee?._id === empId && x.date.startsWith(dateStr)
    );
    return ab?.type; // "U", "K", "ZA", etc.
  }

  const grouped = useMemo(
    () =>
      employees.reduce((a, e) => {
        (a[e.role] ??= []).push(e);
        return a;
      }, {}),
    [employees]
  );

  async function assign({ shift, line, position, employeeId }) {
    // --- NEW: absence check ---
    if (employeeId) {
      const absence = isAbsent(employeeId, date);
      if (["U", "K", "ZA"].includes(absence)) {
        alert("⚠️ This employee is absent (" + absence + ") on this day!");
        return; // stop assignment
      }
    }

    if (!employeeId) {
      // --- Clear assignment (DELETE) ---
      await fetch(
        `/api/schedules?date=${date}&shift=${shift}&line=${
          line || ""
        }&position=${position}`,
        { method: "DELETE" }
      );
      setShiftData((p) =>
        p.filter(
          (x) =>
            !(
              x.date.startsWith(date) &&
              x.shift === shift &&
              (x.line || "") === (line || "") &&
              x.position === position
            )
        )
      );
      setActiveDropdown(null);
      return;
    }

    // --- Normal assignment (POST) ---
    const payload = { date, shift, line, position, employeeId };
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      setShiftData((p) => {
        const other = p.filter(
          (x) =>
            !(
              x.date.startsWith(date) &&
              x.shift === shift &&
              (x.line || "") === (line || "") &&
              x.position === position
            )
        );
        return [...other, data];
      });
    } else {
      alert(data.error);
    }
    setActiveDropdown(null);
  }

  function currentAssigned(line, position, shift) {
    return shiftData.find(
      (x) =>
        x.shift === shift &&
        (x.line || "") === (line || "") &&
        x.position === position
    );
  }

  const { week, year } = isoWeek(date);

  // Define the specific roles for the left side
  const LEFT_ROLES = [
    "Vorarbeiter/in",
    "QK:",
    "Bucher",
    "Zubr.Außen",
    "Zubr.Außen",
    "Zubr.Reinraum",
    "Lager",
    "UmbautenTechnik",
  ];

  // Define the positions for the right side (first three are fixed labels)
  const RIGHT_POSITIONS = ["Linienführer", "Maschinenführer", "Reinraum"];

  // Define the lines with their times
  const LINES = [
    { name: "Linie 0", time: "06:00 - 14:15" },
    { name: "Linie 2", time: "06:00 - 14:15" },
    { name: "Linie 9", time: "06:00 - 14:15" },
    { name: "Linie 5", time: "06:00 - 14:15" },
    { name: "Linie A", time: "06:00 - 14:15" },
    { name: "Linie G", time: "06:00 - 14:15" },
    { name: "Kombi", time: "06:00 - 14:15" },
    { name: "Linie 7", time: "06:00 - 14:15" },
    { name: "Schrumpfen", time: "06:00 - 14:15" },
    { name: "Umarbeit", time: "06:00 - 14:15" },
  ];

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 p-2 bg-white rounded-sm border border-gray-300">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Schichtplan – KW {week} / {year}
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-green-50 p-1 rounded-sm">
          <label className="text-xs font-medium text-gray-700">Datum:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-sm p-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Loop over Früh / Spät / Nacht */}
      {SHIFTS.map(({ name, time }) => (
        <div
          key={name}
          className="mb-4 bg-white rounded-sm border border-gray-300 overflow-hidden"
        >
          {/* Shift header */}
          <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-green-600 to-green-800 text-white">
            <div className="flex items-center gap-1">
              <div className="px-1 py-0.5 rounded-sm bg-green-900 text-white font-semibold text-xs">
                {name}
              </div>
              <div className="text-green-100 text-xs">{time}</div>
            </div>
          </div>

          <div className="flex">
            {/* LEFT: Roles with name selection - Fixed width */}
            <div className="w-48 ">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gray-100 border-b border-r border-gray-300 p-0.5 text-xs  font-medium text-gray-700 uppercase">
                      Rollen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {LEFT_ROLES.map((role, index) => {
                    const current = currentAssigned("", role, name);
                    const dropdownId = `${name}-left-${role}`;

                    return (
                      <tr
                        key={`${role}-${index}`}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border-b border-r border-gray-300 p-0.5 text-xs flex items-center justify-evenly">
                          <span className="truncate">{role}</span>
                          <div className="relative flex-shrink-0">
                            <div
                              className="w-20 p-0.5 text-xs cursor-pointer border border-transparent hover:border-green-300 rounded-sm min-h-6 flex items-center justify-end"
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown === dropdownId
                                    ? null
                                    : dropdownId
                                )
                              }
                            >
                              <span className="truncate">
                                {current?.employee?.name || ""}
                              </span>
                            </div>

                            {activeDropdown === dropdownId && (
                              <div className="absolute z-10 right-0 mt-0.5 w-36 bg-white border border-gray-300 rounded-sm shadow-lg max-h-48 overflow-y-auto">
                                <div className="p-0.5">
                                  <div
                                    className="p-1 text-xs hover:bg-green-50 cursor-pointer"
                                    onClick={() =>
                                      assign({
                                        shift: name,
                                        line: "",
                                        position: role,
                                        employeeId: null,
                                      })
                                    }
                                  >
                                    -- Clear --
                                  </div>
                                  {employees.map((emp) => (
                                    <div
                                      key={emp._id}
                                      className="p-1 text-xs hover:bg-green-50 cursor-pointer truncate"
                                      onClick={() =>
                                        assign({
                                          shift: name,
                                          line: "",
                                          position: role,
                                          employeeId: emp._id,
                                        })
                                      }
                                    >
                                      {emp.name}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* RIGHT: Lines - Compact with 8 rows total */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-r border-gray-300 p-0.5 bg-gray-100 text-center text-xs font-medium text-gray-700 w-16">
                      Rolle
                    </th>
                    {LINES.map((line) => (
                      <th
                        key={line.name}
                        className="border-b border-r border-gray-300 p-0.5  bg-gray-100 text-center"
                      >
                        <div className="font-semibold text-gray-900 text-xs">
                          {line.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* First three rows with fixed roles */}
                  {RIGHT_POSITIONS.map((pos, rowIndex) => (
                    <tr
                      key={pos}
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border-b border-r border-gray-300 p-0.5 pl-1 text-xs font-medium bg-gray-50">
                        {pos}
                      </td>
                      {LINES.map((line) => {
                        const current = currentAssigned(line.name, pos, name);
                        const options = grouped[pos] ?? employees;
                        const dropdownId = `${name}-${line.name}-${pos}`;

                        return (
                          <td
                            key={`${line.name}-${pos}`}
                            className="border-b border-r border-gray-300 p-0.5 relative"
                          >
                            <div
                              className="w-full p-0.5 text-xs cursor-pointer border border-transparent hover:border-green-300 rounded-sm min-h-6 flex items-center"
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown === dropdownId
                                    ? null
                                    : dropdownId
                                )
                              }
                            >
                              {current?.employee?.name || ""}
                            </div>

                            {activeDropdown === dropdownId && (
                              <div className="absolute z-10 left-0 mt-0.5 w-36 bg-white border border-gray-300 rounded-sm shadow-lg max-h-48 overflow-y-auto">
                                <div className="p-0.5">
                                  <div
                                    className="p-1 text-xs hover:bg-green-50 cursor-pointer"
                                    onClick={() =>
                                      assign({
                                        shift: name,
                                        line: line.name,
                                        position: pos,
                                        employeeId: null,
                                      })
                                    }
                                  >
                                    -- Clear --
                                  </div>
                                  {options.map((emp) => {
                                    const absence = isAbsent(emp._id, date);
                                    const isUnavailable = [
                                      "U",
                                      "K",
                                      "ZA",
                                    ].includes(absence);

                                    return (
                                      <div
                                        key={emp._id}
                                        className={`p-1 text-xs truncate ${
                                          isUnavailable
                                            ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                                            : "hover:bg-green-50 cursor-pointer"
                                        }`}
                                        onClick={() =>
                                          !isUnavailable &&
                                          assign({
                                            shift: name,
                                            line: line.name,
                                            position: pos,
                                            employeeId: emp._id,
                                          })
                                        }
                                      >
                                        {emp.name}{" "}
                                        {isUnavailable ? `(${absence})` : ""}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Additional rows (5 more to make total 8) with no labels */}
                  {[1, 2, 3, 4, 5, 6].map((rowNum) => (
                    <tr
                      key={rowNum}
                      className={rowNum % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border-b border-r border-gray-300 p-0.5 text-xs font-medium bg-gray-50">
                        Position {rowNum}
                      </td>
                      {LINES.map((line) => {
                        const pos = `Position ${rowNum}`;
                        const current = currentAssigned(line.name, pos, name);
                        const options = employees;
                        const dropdownId = `${name}-${line.name}-${pos}`;

                        return (
                          <td
                            key={`${line.name}-${pos}`}
                            className="border-b border-r border-gray-300 p-0.5 relative"
                          >
                            <div
                              className="w-full p-0.5 text-xs cursor-pointer border border-transparent hover:border-green-300 rounded-sm min-h-6 flex items-center"
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown === dropdownId
                                    ? null
                                    : dropdownId
                                )
                              }
                            >
                              {current?.employee?.name || ""}
                            </div>

                            {activeDropdown === dropdownId && (
                              <div className="absolute z-10 left-0 mt-0.5 w-36 bg-white border border-gray-300 rounded-sm shadow-lg max-h-48 overflow-y-auto">
                                <div className="p-0.5">
                                  <div
                                    className="p-1 text-xs hover:bg-green-50 cursor-pointer"
                                    onClick={() =>
                                      assign({
                                        shift: name,
                                        line: line.name,
                                        position: pos,
                                        employeeId: null,
                                      })
                                    }
                                  >
                                    -- Clear --
                                  </div>
                                  {options.map((emp) => {
                                    const absence = isAbsent(emp._id, date);
                                    const isUnavailable = [
                                      "U",
                                      "K",
                                      "ZA",
                                    ].includes(absence);

                                    return (
                                      <div
                                        key={emp._id}
                                        className={`p-1 text-xs truncate ${
                                          isUnavailable
                                            ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                                            : "hover:bg-green-50 cursor-pointer"
                                        }`}
                                        onClick={() =>
                                          !isUnavailable &&
                                          assign({
                                            shift: name,
                                            line: line.name,
                                            position: pos,
                                            employeeId: emp._id,
                                          })
                                        }
                                      >
                                        {emp.name}{" "}
                                        {isUnavailable ? `(${absence})` : ""}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Urlaubsplanung tab ---------- */
function UrlaubsplanungTab() {
  const [employees, setEmployees] = useState([]);
  const [ym, setYm] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [items, setItems] = useState([]);

  // Feiertage fixed for 2025 (could be moved outside)
  const FEIERTAGE = [
    "2025-01-01",
    "2025-04-18",
    "2025-04-21",
    "2025-05-01",
    "2025-05-29",
    "2025-06-09",
    "2025-06-19",
    "2025-10-03",
    "2025-11-01",
    "2025-12-25",
    "2025-12-26",
  ];

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then(setEmployees);
  }, []);

  useEffect(() => {
    fetch(`/api/urlaub?ym=${ym}`)
      .then((r) => r.json())
      .then(setItems);
  }, [ym]);

  // days of month
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const days = [];
  for (
    let d = new Date(first);
    d.getMonth() === first.getMonth();
    d.setDate(d.getDate() + 1)
  ) {
    days.push(new Date(d));
  }

  // KW groups
  const kwGroups = [];
  let curKw = null,
    start = 0;
  days.forEach((d, idx) => {
    const { week } = isoWeek(d);
    if (curKw === null) {
      curKw = week;
      start = 0;
    }
    if (week !== curKw) {
      kwGroups.push({ kw: curKw, startIdx: start, len: idx - start });
      curKw = week;
      start = idx;
    }
    if (idx === days.length - 1) {
      kwGroups.push({ kw: curKw, startIdx: start, len: idx - start + 1 });
    }
  });

  // Add F, S, N
  const colors = {
    U: "bg-green-400",
    ZA: "bg-blue-400",
    K: "bg-yellow-400",
    F: "bg-pink-400",
    S: "bg-orange-400",
    N: "bg-indigo-400",
    Feiertag: "bg-purple-400",
  };

  function getAbs(empId, dateStr) {
    return items.find(
      (x) =>
        x.employee && x.employee._id === empId && x.date.startsWith(dateStr)
    );
  }

  // cycle absence type on click
  async function cycle(empId, dateStr) {
    if (FEIERTAGE.includes(dateStr)) return; // don’t allow clicking Feiertage

    const cur = getAbs(empId, dateStr)?.type ?? "";
    // now includes F, S, N
    const order = ["", "F", "S", "N", "U", "ZA", "K"];
    const next = order[(order.indexOf(cur) + 1) % order.length];

    const res = await fetch("/api/urlaub", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: empId,
        date: dateStr,
        type: next || "NONE",
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setItems((prev) => {
        const without = prev.filter(
          (x) => !(x.employee?._id === empId && x.date.startsWith(dateStr))
        );
        return next ? [...without, data] : without;
      });
    } else {
      alert(data.error);
    }
  }

  // compute totals for each employee (only U, ZA, K)
  function getTotals(empId) {
    const totals = { U: 0, ZA: 0, K: 0 };
    items.forEach((x) => {
      if (x.employee && x.employee._id === empId) {
        if (x.type === "U") totals.U++;
        if (x.type === "ZA") totals.ZA++;
        if (x.type === "K") totals.K++;
      }
    });
    return totals;
  }

  // group employees by role
  const grouped = employees.reduce((a, e) => {
    (a[e.role] ??= []).push(e);
    return a;
  }, {});

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-3 p-2 bg-white rounded-sm border border-gray-300">
        <h2 className="text-xl font-bold text-gray-800">Urlaubsplanung</h2>
        <div className="flex items-center gap-2 bg-blue-50 p-1 rounded-sm">
          <label className="text-xs font-medium text-gray-700">Monat:</label>
          <input
            type="month"
            value={ym}
            onChange={(e) => setYm(e.target.value)}
            className="border border-gray-300 rounded-sm p-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-sm border border-gray-300">
        <table className="border-collapse w-full text-xs">
          <thead>
            <tr>
              <th className="border border-gray-300 p-1 bg-gray-100 w-40 text-left sticky left-0 z-10">
                Name
              </th>
              <th className="border border-gray-300 p-1 bg-green-100 text-center w-10">
                U
              </th>
              <th className="border border-gray-300 p-1 bg-blue-100 text-center w-8">
                ZA
              </th>
              <th className="border border-gray-300 p-1 bg-yellow-100 text-center w-10">
                K
              </th>
              {kwGroups.map((g) => (
                <th
                  key={g.kw}
                  colSpan={g.len}
                  className="border border-gray-300 p-1 bg-gray-200 text-center font-semibold"
                >
                  KW {String(g.kw).padStart(2, "0")}
                </th>
              ))}
            </tr>
            <tr>
              <th className="border border-gray-300 p-1 bg-gray-100 sticky left-0 z-10"></th>
              <th className="border border-gray-300 p-1 bg-green-100"></th>
              <th className="border border-gray-300 p-1 bg-blue-100"></th>
              <th className="border border-gray-300 p-1 bg-yellow-100"></th>
              {days.map((d) => {
                const dateStr = dayKey(d);
                const isWeekend = [0, 6].includes(d.getDay());
                const isHoliday = FEIERTAGE.includes(dateStr);

                return (
                  <th
                    key={d.toISOString()}
                    className={`border border-gray-300 p-0.5 text-center ${
                      isHoliday
                        ? "bg-purple-300"
                        : isWeekend
                        ? "bg-gray-100"
                        : "bg-white"
                    }`}
                  >
                    <div className="font-medium">
                      {String(d.getDate()).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] text-gray-500">{getDow(d)}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {Object.entries(grouped).map(([role, emps]) => (
              <React.Fragment key={role}>
                <tr>
                  <td
                    className="bg-gray-200 font-semibold border border-gray-300 px-1 py-1 sticky left-0 z-10 w-28 whitespace-nowrap"
                    title={role} // full text on hover
                  >
                    {shortenRole(role)}
                  </td>
                  <td
                    colSpan={days.length + 3}
                    className="bg-gray-200 border border-gray-300"
                  ></td>
                </tr>

                {emps.map((emp) => {
                  const totals = getTotals(emp._id);
                  return (
                    <tr key={emp._id} className="hover:bg-gray-50 w-fit">
                      <td className="border border-gray-300 p-1 font-medium sticky left-0 z-10 bg-white w-28 truncate">
                        {emp.name}
                      </td>

                      <td className="border border-gray-300 p-0.5 text-center bg-green-50 font-medium">
                        {totals.U}
                      </td>
                      <td className="border border-gray-300 p-0.5 text-center bg-blue-50 font-medium">
                        {totals.ZA}
                      </td>
                      <td className="border border-gray-300 p-0.5 text-center bg-yellow-50 font-medium">
                        {totals.K}
                      </td>
                      {days.map((d) => {
                        const dateStr = dayKey(d);
                        const ab = getAbs(emp._id, dateStr);
                        const isWeekend = [0, 6].includes(d.getDay());
                        const isHoliday = FEIERTAGE.includes(dateStr);

                        let cls = "";
                        if (isHoliday) {
                          cls = "bg-purple-300 text-white font-medium";
                        } else if (ab) {
                          cls = `${colors[ab.type]} text-white font-medium`;
                        } else if (isWeekend) {
                          cls = "bg-gray-100";
                        } else {
                          cls = "bg-white";
                        }

                        return (
                          <td
                            key={dateStr}
                            className={`border border-gray-300 text-center cursor-pointer p-0.5 ${cls}`}
                            onClick={() =>
                              !isHoliday && cycle(emp._id, dateStr)
                            }
                            title={`${emp.name} - ${d.toLocaleDateString(
                              "de-DE"
                            )}`}
                          >
                            {ab?.type || (isHoliday ? "FT" : "")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function for day of week abbreviation
function getDow(date) {
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  return days[date.getDay()];
}
function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}
/* ---------- main page (tabs) ---------- */
export default function SchedulePage() {
  const [tab, setTab] = useState("urlaub");
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex gap-3 mb-6">
        {["weekly", "urlaub", "employees"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              tab === t
                ? "bg-[var(--color-primary)] text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {t === "weekly"
              ? "Weekly Plan"
              : t === "urlaub"
              ? "Urlaubsplanung"
              : "Employees"}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        {tab === "weekly" && <WeeklyTab />}
        {tab === "urlaub" && <UrlaubsplanungTab />}
        {tab === "employees" && <EmployeesTab />}
      </div>
    </div>
  );
}
