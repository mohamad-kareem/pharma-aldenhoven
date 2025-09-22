"use client";
import { useEffect, useState, useRef } from "react";
import React from "react";
import NavigationTabs from "@/app/(components)/NavigationTab";
/* ---------- helpers ---------- */
function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDow(date) {
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  return days[date.getDay()];
}

function shortenRole(role) {
  const words = role.split(/[\s/]+/);
  if (words.length <= 2) return role;
  return words.slice(0, 2).join(" ") + " …";
}

function isoWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return { week: weekNo, year: date.getFullYear() };
}

/* ---------- Urlaubsplanung Page ---------- */
export default function UrlaubsplanungPage() {
  const [employees, setEmployees] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const dropdownRef = useRef(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [ym, setYm] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [items, setItems] = useState([]);

  // Feiertage fixed for 2025
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

  const colors = {
    U: "bg-green-600",
    ZA: "bg-yellow-600",
    K: "bg-red-500",
    F: "bg-pink-400",
    S: "bg-indigo-600",
    N: "bg-black/80",
    Feiertag: "bg-purple-400",
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveCell(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchUrlaubData();
  }, [ym]);

  async function fetchEmployees() {
    try {
      const response = await fetch("/api/employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }

  async function fetchUrlaubData() {
    try {
      const response = await fetch(`/api/urlaub?ym=${ym}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching urlaub data:", error);
    }
  }

  async function saveAbsenceRange(empId, startDate, endDate, type) {
    const tasks = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      const dateStr = dayKey(d);
      tasks.push(
        fetch("/api/urlaub", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId: empId, date: dateStr, type }),
        }).then((r) => r.json())
      );
      d.setDate(d.getDate() + 1);
    }

    const results = await Promise.all(tasks);

    // Update local state
    setItems((prev) => {
      const without = prev.filter(
        (x) =>
          !(
            x.employee?._id === empId &&
            new Date(x.date) >= new Date(startDate) &&
            new Date(x.date) <= new Date(endDate)
          )
      );
      return [...without, ...results.filter((x) => !x.error)];
    });
  }

  async function saveAbsence(empId, dateStr, type) {
    try {
      const res = await fetch("/api/urlaub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: empId,
          date: dateStr,
          type: type || "NONE",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setItems((prev) => {
          const without = prev.filter(
            (x) => !(x.employee?._id === empId && x.date.startsWith(dateStr))
          );
          return type ? [...without, data] : without;
        });
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error saving absence:", error);
      alert("Failed to save absence");
    }
  }

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

  function getAbs(empId, dateStr) {
    return items.find(
      (x) =>
        x.employee && x.employee._id === empId && x.date.startsWith(dateStr)
    );
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
    <div className="px-1 sm:px-6 py-4 sm:py-4 min-h-screen bg-gray-50">
      {/* Content */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden">
        <NavigationTabs />
        <div className="p-2 bg-gray-50 min-h-screen w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto">
          {/* Date Picker */}
          <div className="flex items-center justify-between mb-3 p-2 bg-white rounded-sm border border-gray-300">
            <h2 className="text-xl font-bold text-gray-800">Urlaubsplanung</h2>
            <div className="flex items-center gap-1 bg-green-50 p-1 rounded-sm">
              <input
                type="month"
                value={ym}
                onChange={(e) => setYm(e.target.value)}
                className="border border-gray-300 rounded-sm p-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Table */}
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
                        <div className="text-[10px] text-gray-500">
                          {getDow(d)}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {Object.entries(grouped).map(([role, emps]) => (
                  <React.Fragment key={role}>
                    {/* Role header row */}
                    <tr>
                      <td
                        className="bg-gray-200 font-semibold border border-gray-300 px-1 py-1 sticky left-0 z-10 w-28 whitespace-nowrap"
                        title={role}
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
                          {/* Name + totals */}
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

                          {/* Days of month */}
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
                                className={`border border-gray-300 text-center p-0.5 relative ${cls}`}
                                onClick={(e) => {
                                  if (isHoliday) return;

                                  if (
                                    rangeStart &&
                                    rangeStart.empId === emp._id &&
                                    e.shiftKey
                                  ) {
                                    let start = new Date(rangeStart.dateStr);
                                    let end = new Date(dateStr);
                                    if (end < start)
                                      [start, end] = [end, start];
                                    saveAbsenceRange(
                                      emp._id,
                                      start,
                                      end,
                                      rangeStart.type
                                    );
                                    setRangeStart(null);
                                    setActiveCell(null);
                                  } else {
                                    // normal click → open dropdown
                                    setActiveCell({ empId: emp._id, dateStr });
                                  }
                                }}
                                title={`${emp.name} - ${d.toLocaleDateString(
                                  "de-DE"
                                )}`}
                              >
                                {ab?.type || (isHoliday ? "FT" : "")}

                                {/* Dropdown */}
                                {activeCell?.empId === emp._id &&
                                  activeCell?.dateStr === dateStr && (
                                    <div
                                      ref={dropdownRef}
                                      className="absolute z-20 mt-1 left-0 bg-white border border-gray-300 rounded shadow text-xs"
                                    >
                                      {["", "F", "S", "N", "U", "ZA", "K"].map(
                                        (type) => {
                                          const colorClass =
                                            type && colors[type]
                                              ? `${colors[type]} text-white`
                                              : "text-gray-500";
                                          return (
                                            <div
                                              key={type || "clear"}
                                              className={`px-2 py-1 cursor-pointer hover:opacity-80 ${colorClass} border-b border-gray-200 last:border-b-0`}
                                              onMouseDown={async () => {
                                                await saveAbsence(
                                                  emp._id,
                                                  dateStr,
                                                  type
                                                );
                                                setRangeStart(
                                                  type
                                                    ? {
                                                        empId: emp._id,
                                                        dateStr,
                                                        type,
                                                      }
                                                    : {
                                                        empId: emp._id,
                                                        dateStr,
                                                        type: null,
                                                      }
                                                );

                                                setActiveCell(null);
                                              }}
                                            >
                                              {type === "" ? "Clear" : type}
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  )}
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
      </div>
    </div>
  );
}
