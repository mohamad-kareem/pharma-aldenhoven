"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import React from "react";
import NavigationTabs from "@/app/(components)/NavigationTab";
import { HelpCircle } from "lucide-react";
// ---------- Helper Functions ----------
const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const getDow = (date) =>
  ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][date.getDay()];
const shortenRole = (role) =>
  role.split(/[\s/]+/).length <= 2
    ? role
    : role
        .split(/[\s/]+/)
        .slice(0, 2)
        .join(" ") + " …";
const isoWeek = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return {
    week: Math.ceil(((date - yearStart) / 86400000 + 1) / 7),
    year: date.getFullYear(),
  };
};

// ---------- Constants ----------
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
  ZA: "bg-purple-600",
  K: "bg-red-600",
  F: "bg-indigo-600",
  S: "bg-yellow-600",
  N: "bg-black/80",
  Feiertag: "bg-pink-600",
};

// ---------- Main Component ----------
export default function UrlaubsplanungPage() {
  // State
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCell, setActiveCell] = useState(null); // { empId, dateStr }
  const [rangeStart, setRangeStart] = useState(null); // { empId, dateStr, type }
  const [hoverCell, setHoverCell] = useState(null); // { empId, dateStr }
  const dropdownRef = useRef(null);
  const tableWrapperRef = useRef(null);
  const [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef(null);
  const [ym, setYm] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // ---------- Data Fetching ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/employees");
        setEmployees((await res.json()) || []);
      } catch (e) {
        console.error("Error fetching employees:", e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/urlaub?ym=${ym}`);
        setItems((await res.json()) || []);
      } catch (e) {
        console.error("Error fetching urlaub data:", e);
      }
    })();
  }, [ym]);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!helpRef.current) return;
      if (!helpRef.current.contains(e.target)) setShowHelp(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setShowHelp(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // ---------- Date Calculations ----------
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(y, m - 1, 1);

  const days = useMemo(() => {
    const out = [];
    for (
      let d = new Date(first);
      d.getMonth() === first.getMonth();
      d.setDate(d.getDate() + 1)
    ) {
      out.push(new Date(d));
    }
    return out;
  }, [first]);

  const kwGroups = useMemo(() => {
    const groups = [];
    let curKw = null,
      start = 0;

    days.forEach((d, idx) => {
      const { week } = isoWeek(d);
      if (curKw === null) {
        curKw = week;
        start = 0;
      }
      if (week !== curKw) {
        groups.push({ kw: curKw, startIdx: start, len: idx - start });
        curKw = week;
        start = idx;
      }
      if (idx === days.length - 1) {
        groups.push({ kw: curKw, startIdx: start, len: idx - start + 1 });
      }
    });
    return groups;
  }, [days]);

  // ---------- Helper Functions ----------
  const getAbs = (empId, dateStr) =>
    items.find((x) => x.employee?._id === empId && x.date.startsWith(dateStr));

  const isWeekendOrHoliday = (dateStr) => {
    const d = new Date(dateStr);
    return [0, 6].includes(d.getDay()) || FEIERTAGE.includes(dateStr);
  };

  const getTotals = (empId) => {
    const totals = { U: 0, ZA: 0, K: 0 };
    items.forEach((x) => {
      if (x.employee?._id === empId) {
        if (x.type === "U") totals.U++;
        if (x.type === "ZA") totals.ZA++;
        if (x.type === "K") totals.K++;
      }
    });
    return totals;
  };

  const grouped = useMemo(
    () =>
      employees.reduce((a, e) => {
        (a[e.role] ??= []).push(e);
        return a;
      }, {}),
    [employees]
  );

  const displayOrder = useMemo(
    () =>
      Object.values(grouped)
        .flat()
        .map((e) => e._id),
    [grouped]
  );

  // ---------- API Functions ----------
  const saveAbsence = async (empId, dateStr, type) => {
    if (isWeekendOrHoliday(dateStr)) return;

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
        alert(data.error || "Fehler beim Speichern");
      }
    } catch (e) {
      console.error("Error saving absence:", e);
      alert("Failed to save absence");
    }
  };

  const saveAbsenceRange = async (empId, startDate, endDate, type) => {
    const tasks = [];
    let d = new Date(startDate);

    while (d <= endDate) {
      const dateStr = dayKey(d);
      if (!isWeekendOrHoliday(dateStr)) {
        tasks.push(
          fetch("/api/urlaub", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employeeId: empId, date: dateStr, type }),
          }).then((r) => r.json())
        );
      }
      d.setDate(d.getDate() + 1);
    }

    if (tasks.length === 0) return;

    const results = await Promise.all(tasks);
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
  };

  // ---------- Active Cell Management ----------
  useEffect(() => {
    if (!activeCell) return;
    const el = document.querySelector(
      `[data-cell="${activeCell.empId}-${activeCell.dateStr}"]`
    );
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeCell]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current?.contains(e.target)) return;
      if (activeCell) {
        const cellEl = document.querySelector(
          `[data-cell="${activeCell.empId}-${activeCell.dateStr}"]`
        );
        if (cellEl?.contains(e.target)) return;
      }
      setActiveCell(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeCell]);

  // ---------- Keyboard Navigation ----------
  const moveTo = useCallback(
    (rowIndex, colIndex) => {
      if (
        rowIndex < 0 ||
        colIndex < 0 ||
        rowIndex >= displayOrder.length ||
        colIndex >= days.length
      )
        return;
      const empId = displayOrder[rowIndex];
      const dateStr = dayKey(days[colIndex]);
      setActiveCell({ empId, dateStr });
    },
    [displayOrder, days]
  );

  const handleKeyDown = useCallback(
    async (e) => {
      const t = e.target;
      const tag = t?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || t?.isContentEditable) return;
      if (!activeCell) return;

      const rowIndex = displayOrder.findIndex((id) => id === activeCell.empId);
      const colIndex = days.findIndex((d) => dayKey(d) === activeCell.dateStr);
      if (rowIndex === -1 || colIndex === -1) return;

      const isHoliday = FEIERTAGE.includes(activeCell.dateStr);
      const isWeekend = [0, 6].includes(new Date(activeCell.dateStr).getDay());
      const isDisabled = isWeekend || isHoliday;
      const key = e.key;

      // Navigation
      if (key === "ArrowRight")
        moveTo(rowIndex, Math.min(days.length - 1, colIndex + 1));
      else if (key === "ArrowLeft") moveTo(rowIndex, Math.max(0, colIndex - 1));
      else if (key === "ArrowDown")
        moveTo(Math.min(displayOrder.length - 1, rowIndex + 1), colIndex);
      else if (key === "ArrowUp") moveTo(Math.max(0, rowIndex - 1), colIndex);
      else if (key === "Home") moveTo(rowIndex, 0);
      else if (key === "End") moveTo(rowIndex, days.length - 1);
      else if (key === "Escape") setActiveCell(null);
      else if (key.toLowerCase() === "c") {
        const d = days[colIndex];
        if (![0, 6].includes(d.getDay()) && !FEIERTAGE.includes(dayKey(d))) {
          await saveAbsence(activeCell.empId, activeCell.dateStr, null);
        }
        return;
      } else if (key === "Enter") setActiveCell(null);

      // Quick set shortcuts
      const typeMap = { u: "U", z: "ZA", k: "K", f: "F", s: "S", n: "N" };
      const mapped = typeMap[key.toLowerCase()];
      if (mapped && !isDisabled) {
        await saveAbsence(activeCell.empId, activeCell.dateStr, mapped);
        setActiveCell({ ...activeCell });
      }

      if (
        [
          "ArrowRight",
          "ArrowLeft",
          "ArrowDown",
          "ArrowUp",
          "Home",
          "End",
          "Escape",
          "Enter",
        ].includes(key)
      ) {
        e.preventDefault();
      }
    },
    [activeCell, displayOrder, days, FEIERTAGE, moveTo]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ---------- Cell Styling Helper ----------
  const getCellStyles = (
    empId,
    dateStr,
    hasAbsence,
    isHoliday,
    isWeekend,
    isActive,
    isHovered
  ) => {
    const isDisabled = isWeekend || isHoliday;
    let baseClass =
      "border border-gray-300 text-center p-0.5 relative transition-all duration-150 ease-in-out";

    // Background colors
    if (isHoliday) baseClass += " bg-pink-300 text-white font-medium";
    else if (hasAbsence)
      baseClass += ` ${colors[hasAbsence.type]} text-white font-medium`;
    else if (isWeekend) baseClass += " bg-gray-100";
    else baseClass += " bg-white hover:bg-green-100";

    // Border and focus states
    if (isActive) baseClass += " ring-2 ring-green-400 ring-inset z-20";
    else if (isHovered && !isDisabled)
      baseClass += " ring-1 ring-green-600 ring-inset z-10";

    // Cursor
    baseClass += isDisabled ? " cursor-not-allowed" : " cursor-pointer";

    return baseClass;
  };

  // ---------- Render ----------
  return (
    <div className="px-1 sm:px-6 py-4 sm:py-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden">
        <NavigationTabs />
        <div
          ref={tableWrapperRef}
          className="p-2 bg-gray-50 min-h-screen w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto"
        >
          {/* Header */}
          {/* Compact Professional Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Urlaubsplanung
              </h2>
              <div className="relative" ref={helpRef}>
                {/* Help Button */}
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
                  title="Tastaturkürzel anzeigen"
                >
                  <HelpCircle size={18} />
                </button>

                {/* Popover */}
                {showHelp && (
                  <div className="absolute left-1 top-5 mt-2 w-80 max-w-sm bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 animate-fadeIn">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Tastaturkürzel
                      </h3>
                    </div>

                    {/* Shortcuts */}
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center justify-between">
                        <span className="text-gray-600">Eintrag löschen</span>
                        <kbd className="px-2 py-1 rounded bg-gray-100 text-xs font-mono shadow-sm">
                          C
                        </kbd>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Schließen / Auswahl aufheben
                        </span>
                        <kbd className="px-2 py-1 rounded bg-gray-100 text-xs font-mono shadow-sm">
                          Esc
                        </kbd>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Auswahl bestätigen
                        </span>
                        <kbd className="px-2 py-1 rounded bg-gray-100 text-xs font-mono shadow-sm">
                          Enter
                        </kbd>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-600">Navigation</span>
                        <span className="flex gap-1">
                          {["↑", "↓", "←", "→"].map((k) => (
                            <kbd
                              key={k}
                              className="px-2 py-1 rounded bg-gray-100 text-xs font-mono shadow-sm"
                            >
                              {k}
                            </kbd>
                          ))}
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Monatsanfang / -ende
                        </span>
                        <span className="flex gap-1">
                          {["Home", "End"].map((k) => (
                            <kbd
                              key={k}
                              className="px-2 py-1 rounded bg-gray-100 text-xs font-mono shadow-sm"
                            >
                              {k}
                            </kbd>
                          ))}
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-600">Mehrfachauswahl</span>
                        <span className="flex gap-1 items-center">
                          <kbd className="px-2 py-1 rounded bg-gray-100 text-xs font-mono shadow-sm">
                            Shift
                          </kbd>
                          <span className="text-gray-400 text-xs">+</span>
                          <kbd className="px-2 py-1 rounded bg-gray-100 text-xs font-mono shadow-sm">
                            Klick
                          </kbd>
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-2">
              <input
                id="month-select"
                type="month"
                value={ym}
                onChange={(e) => setYm(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-sm border border-gray-300">
            <table className="border-collapse w-full text-xs">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-1 bg-gray-100 w-40 text-left sticky left-0 z-20">
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
                  <th className="border border-gray-300 p-1 bg-gray-100 sticky left-0 z-20"></th>
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
                            ? "bg-pink-300"
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
                    {/* Role Header */}
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

                    {/* Employees */}
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
                            const isDisabled = isWeekend || isHoliday;
                            const isActive =
                              activeCell?.empId === emp._id &&
                              activeCell?.dateStr === dateStr;
                            const isHovered =
                              hoverCell?.empId === emp._id &&
                              hoverCell?.dateStr === dateStr;

                            return (
                              <td
                                key={dateStr}
                                data-cell={`${emp._id}-${dateStr}`}
                                className={getCellStyles(
                                  emp._id,
                                  dateStr,
                                  ab,
                                  isHoliday,
                                  isWeekend,
                                  isActive,
                                  isHovered
                                )}
                                onClick={(e) => {
                                  if (isDisabled) return;

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
                                    setActiveCell({ empId: emp._id, dateStr });
                                  }
                                }}
                                onMouseEnter={() =>
                                  !isDisabled &&
                                  setHoverCell({ empId: emp._id, dateStr })
                                }
                                onMouseLeave={() => setHoverCell(null)}
                                title={`${emp.name} - ${d.toLocaleDateString(
                                  "de-DE"
                                )}${isDisabled ? " (Nicht verfügbar)" : ""}`}
                              >
                                {ab?.type || (isHoliday ? "FT" : "")}

                                {/* Dropdown Menu */}
                                {isActive && !isDisabled && (
                                  <div
                                    ref={dropdownRef}
                                    className="absolute z-30 mt-3 left-0 bg-white border border-gray-300 rounded shadow text-xs pointer-events-auto min-w-[20px]"
                                  >
                                    {["", "F", "S", "N", "U", "ZA", "K"].map(
                                      (type) => {
                                        const colorClass =
                                          type && colors[type]
                                            ? `${colors[type]} text-white`
                                            : "text-gray-700";
                                        return (
                                          <div
                                            key={type || "clear"}
                                            className={`px-3 py-2 cursor-pointer hover:opacity-80 ${colorClass} border-b border-gray-200 last:border-b-0`}
                                            onMouseDown={async () => {
                                              await saveAbsence(
                                                emp._id,
                                                dateStr,
                                                type || null
                                              );
                                              setRangeStart({
                                                empId: emp._id,
                                                dateStr,
                                                type: type || null, // allow null = clear
                                              });
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
