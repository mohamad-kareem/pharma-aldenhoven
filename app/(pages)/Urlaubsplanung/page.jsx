"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  const [items, setItems] = useState([]);
  const [activeCell, setActiveCell] = useState(null); // { empId, dateStr }
  const [rangeStart, setRangeStart] = useState(null); // { empId, dateStr, type }
  const [hoverCell, setHoverCell] = useState(null); // { empId, dateStr } - NEW: Track hover state
  const dropdownRef = useRef(null);
  const tableWrapperRef = useRef(null);

  const [ym, setYm] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Feiertage 2025
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

  /* ---------- data fetching ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/employees");
        const data = await res.json();
        setEmployees(data || []);
      } catch (e) {
        console.error("Error fetching employees:", e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/urlaub?ym=${ym}`);
        const data = await res.json();
        setItems(data || []);
      } catch (e) {
        console.error("Error fetching urlaub data:", e);
      }
    })();
  }, [ym]);

  /* ---------- date calc ---------- */
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

  /* ---------- helpers ---------- */
  function getAbs(empId, dateStr) {
    return items.find(
      (x) =>
        x.employee && x.employee._id === empId && x.date.startsWith(dateStr)
    );
  }

  function isWeekendOrHoliday(dateStr) {
    const d = new Date(dateStr);
    const isWeekend = [0, 6].includes(d.getDay());
    const isHoliday = FEIERTAGE.includes(dateStr);
    return isWeekend || isHoliday;
  }

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

  const grouped = useMemo(() => {
    return employees.reduce((a, e) => {
      (a[e.role] ??= []).push(e);
      return a;
    }, {});
  }, [employees]);

  // Flat list of employee IDs in the exact render order (for ArrowUp/Down)
  const displayOrder = useMemo(() => {
    return Object.values(grouped)
      .flat()
      .map((e) => e._id);
  }, [grouped]);

  /* ---------- API mutators ---------- */
  async function saveAbsence(empId, dateStr, type) {
    // Prevent setting absence on weekends/holidays
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
          // if type falsy (clear), just remove
          return type ? [...without, data] : without;
        });
      } else {
        alert(data.error || "Fehler beim Speichern");
      }
    } catch (e) {
      console.error("Error saving absence:", e);
      alert("Failed to save absence");
    }
  }

  async function saveAbsenceRange(empId, startDate, endDate, type) {
    // Filter out weekends and holidays from the range
    const tasks = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      const dateStr = dayKey(d);
      // Only process weekdays that are not holidays
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
  }

  /* ---------- keep active cell visible ---------- */
  useEffect(() => {
    if (!activeCell) return;
    const el = document.querySelector(
      `[data-cell="${activeCell.empId}-${activeCell.dateStr}"]`
    );
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeCell]);

  /* ---------- outside click that doesn't kill open on initial click ---------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Ignore if clicking inside dropdown
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      // Ignore if clicking the active cell itself (keeps it open/selected)
      if (activeCell) {
        const cellEl = document.querySelector(
          `[data-cell="${activeCell.empId}-${activeCell.dateStr}"]`
        );
        if (cellEl && cellEl.contains(e.target)) return;
      }
      setActiveCell(null);
    };
    // Use 'click' (NOT 'mousedown') so cell onClick can open before we consider closing.
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeCell]);

  /* ---------- keyboard navigation & shortcuts ---------- */
  const moveTo = useCallback(
    (rowIndex, colIndex) => {
      if (rowIndex < 0 || colIndex < 0) return;
      if (rowIndex >= displayOrder.length || colIndex >= days.length) return;
      const empId = displayOrder[rowIndex];
      const dateStr = dayKey(days[colIndex]);
      setActiveCell({ empId, dateStr });
    },
    [displayOrder, days]
  );

  const handleKeyDown = useCallback(
    async (e) => {
      // Don't hijack typing inside inputs/selects
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

      // navigation
      if (key === "ArrowRight") {
        moveTo(rowIndex, Math.min(days.length - 1, colIndex + 1));
        e.preventDefault();
        return;
      }
      if (key === "ArrowLeft") {
        moveTo(rowIndex, Math.max(0, colIndex - 1));
        e.preventDefault();
        return;
      }
      if (key === "ArrowDown") {
        moveTo(Math.min(displayOrder.length - 1, rowIndex + 1), colIndex);
        e.preventDefault();
        return;
      }
      if (key === "ArrowUp") {
        moveTo(Math.max(0, rowIndex - 1), colIndex);
        e.preventDefault();
        return;
      }
      if (key === "Home") {
        moveTo(rowIndex, 0);
        e.preventDefault();
        return;
      }
      if (key === "End") {
        moveTo(rowIndex, days.length - 1);
        e.preventDefault();
        return;
      }

      // actions
      if (key === "Escape") {
        setActiveCell(null);
        e.preventDefault();
        return;
      }
      if (key.toLowerCase() === "c") {
        e.preventDefault(); // prevent any weird default action

        // don’t allow clearing on holidays/weekends
        const d = days[colIndex];
        const isWeekend = [0, 6].includes(d.getDay());
        const isHoliday = FEIERTAGE.includes(dayKey(d));
        if (isWeekend || isHoliday) return;

        await saveAbsence(activeCell.empId, activeCell.dateStr, null);
        return;
      }

      if (key === "Enter") {
        // "Confirm" -> simply close dropdown/selection
        setActiveCell(null);
        e.preventDefault();
        return;
      }

      // quick set: U, Z, K, F, S, N (only on enabled days)
      const typeMap = { u: "U", z: "ZA", k: "K", f: "F", s: "S", n: "N" };
      const mapped = typeMap[key.toLowerCase()];
      if (mapped && !isDisabled) {
        await saveAbsence(activeCell.empId, activeCell.dateStr, mapped);
        // keep selection so you can continue with arrows
        setActiveCell({ ...activeCell });
        e.preventDefault();
      }
    },
    [activeCell, displayOrder, days, FEIERTAGE, moveTo]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /* ---------- UI ---------- */
  return (
    <div className="px-1 sm:px-6 py-4 sm:py-4 min-h-screen bg-gray-50">
      {/* Content */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden">
        <NavigationTabs />
        <div
          ref={tableWrapperRef}
          className="p-2 bg-gray-50 min-h-screen w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto"
        >
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
                            const isDisabled = isWeekend || isHoliday;

                            let cls = "";
                            if (isHoliday)
                              cls = "bg-purple-300 text-white font-medium";
                            else if (ab)
                              cls = `${colors[ab.type]} text-white font-medium`;
                            else if (isWeekend) cls = "bg-gray-100";
                            else cls = "bg-white";

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
                                className={`border border-gray-300 text-center p-0.5 relative ${cls} 
    ${
      activeCell?.empId === emp._id && activeCell?.dateStr === dateStr
        ? "ring-2 ring-blue-400" // active cell
        : hoverCell?.empId === emp._id &&
          hoverCell?.dateStr === dateStr &&
          !isDisabled
        ? "ring-1 ring-blue-200" // hovered cell
        : ""
    } 
    ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                                onClick={(e) => {
                                  if (isDisabled) return;

                                  // Shift + click range fill (same emp)
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
                                    // open / focus cell
                                    setActiveCell({ empId: emp._id, dateStr });
                                  }
                                }}
                                onMouseEnter={() => {
                                  if (!isDisabled) {
                                    setHoverCell({ empId: emp._id, dateStr });
                                  }
                                }}
                                onMouseLeave={() => {
                                  setHoverCell(null);
                                }}
                                title={`${emp.name} - ${d.toLocaleDateString(
                                  "de-DE"
                                )}${isDisabled ? " (Nicht verfügbar)" : ""}`}
                              >
                                {/* Cell content */}
                                {ab?.type || (isHoliday ? "FT" : "")}

                                {/* Dropdown */}
                                {activeCell?.empId === emp._id &&
                                  activeCell?.dateStr === dateStr &&
                                  !isDisabled && (
                                    <div
                                      ref={dropdownRef}
                                      data-dropdown
                                      className="absolute z-30 mt-1 left-0 bg-white border border-gray-300 rounded shadow text-xs pointer-events-auto"
                                      style={{ minWidth: "10px" }}
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
                                              className={`px-2 py-1 cursor-pointer hover:opacity-80 ${colorClass} border-b border-gray-200 last:border-b-0`}
                                              onMouseDown={async () => {
                                                await saveAbsence(
                                                  emp._id,
                                                  dateStr,
                                                  type || null
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
