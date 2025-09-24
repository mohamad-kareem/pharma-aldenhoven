"use client";
import { useEffect, useMemo, useState, useLayoutEffect } from "react";
import React from "react";
import { Plus, Minus, Printer } from "lucide-react";
import { createPortal } from "react-dom";
import NavigationTabs from "@/app/(components)/NavigationTab";
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ---------- constants ---------- */
const SHIFTS = [
  { name: "Früh", time: "06:00 - 14:15" },
  { name: "Spät", time: "14:00 - 22:15" },
  { name: "Nacht", time: "22:00 - 06:15" },
];

const LEFT_ROLES = [
  "Vorarbeiter/in",
  "QK",
  "Bucher",
  "Zubr.Außen",
  "Zubr.Reinraum",
  "Lager",
  "UmbautenTechnik",
];

const RIGHT_POSITIONS = ["Linienführer", "Maschinenführer", "Reinraum"];

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

/* ---------- helpers ---------- */
function dayStart(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0); // reset time locally

  // Build YYYY-MM-DD from local values
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isoWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return { week: weekNo, year: date.getFullYear() };
}

// Dropdown Component
const Dropdown = React.memo(function Dropdown({
  options,
  shift,
  line,
  position,
  dropdownId,
  current,
  assign,
  activeDropdown,
  setActiveDropdown,
  absentToday,
}) {
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);

  const [menuPos, setMenuPos] = React.useState({ top: 0, left: 0, width: 160 });
  const [ready, setReady] = React.useState(false);
  const [filter, setFilter] = React.useState("");
  const [highlightIndex, setHighlightIndex] = React.useState(0);

  const isOpen = activeDropdown === dropdownId;

  // Reset local search when (re)opened
  React.useEffect(() => {
    if (isOpen) {
      setFilter("");
      setHighlightIndex(0);
    }
  }, [isOpen]);

  const openMenu = () => setActiveDropdown(dropdownId);
  const closeMenu = () => {
    setActiveDropdown(null);
    setReady(false);
  };

  // Position & outside-close logic
  useIsomorphicLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const MENU_WIDTH = 160;
    const MENU_MAX_HEIGHT = 192;

    const compute = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;

      let top = r.bottom + 4;
      if (top + MENU_MAX_HEIGHT > window.innerHeight - 8) {
        top = Math.max(8, r.top - MENU_MAX_HEIGHT - 4);
      }

      let left = Math.min(
        Math.max(8, r.left),
        window.innerWidth - MENU_WIDTH - 8
      );

      setMenuPos({ top, left, width: MENU_WIDTH });
      setReady(true);
    };

    compute();

    const onScrollOrResize = () => requestAnimationFrame(compute);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    const onDocPointerDown = (e) => {
      const insideMenu = menuRef.current?.contains(e.target);
      const insideTrigger = triggerRef.current?.contains(e.target);
      if (!insideMenu && !insideTrigger) closeMenu();
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const filtered = options.filter((emp) =>
    emp.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Trigger pill */}
      <div
        ref={triggerRef}
        className={`w-full p-0.5 text-xs cursor-pointer border border-transparent hover:border-green-300 min-h-6 flex items-center truncate ${
          current?.color === "red"
            ? "bg-red-400"
            : current?.color === "blue"
            ? "bg-blue-500"
            : current?.color === "green"
            ? "bg-green-500"
            : ""
        }`}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
      >
        <span className="truncate">
          {current?.employee?.name || current?.customName || ""}
        </span>
      </div>

      {/* Portal menu */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[999999] bg-white border border-gray-300 rounded-sm shadow-lg max-h-48 overflow-y-auto"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              visibility: ready ? "visible" : "hidden",
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Search input (local state!) */}
            <input
              autoFocus
              type="text"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setHighlightIndex(0);
              }}
              placeholder="Type name..."
              className="w-full p-1 text-xs border-b border-gray-200 outline-none"
            />

            {/* Clear */}
            <div
              className="p-1 text-xs hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                assign({
                  shift,
                  line,
                  position,
                  employeeId: null,
                  customName: "",
                });
                closeMenu();
              }}
            >
              -- Clear --
            </div>

            {/* Employees */}
            {filtered.map((emp, idx) => {
              // Check if employee is absent on this date
              const type = absentToday.get(emp._id);
              const isAbsent = Boolean(type);

              return (
                <div
                  key={emp._id}
                  className={`p-1 text-xs truncate ${
                    idx === highlightIndex ? "bg-green-100" : ""
                  } ${
                    isAbsent
                      ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                      : "hover:bg-green-50 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (isAbsent) return; // 🚫 block assignment
                    assign({ shift, line, position, employeeId: emp._id });
                    closeMenu();
                  }}
                  title={isAbsent ? "Abwesend (Urlaub/Krank/ZA)" : ""}
                >
                  {emp.name} {isAbsent ? "❌" : ""}
                </div>
              );
            })}

            {/* Free text */}
            {filter && (
              <div
                className="p-1 text-xs text-blue-600 hover:bg-blue-50 cursor-pointer"
                onClick={() => {
                  assign({
                    shift,
                    line,
                    position,
                    employeeId: null,
                    customName: filter,
                  });
                  closeMenu();
                }}
              >
                ➕ Add "{filter}"
              </div>
            )}

            {/* Colors */}
            <div className="flex gap-1 p-1 border-t border-gray-200">
              {["red", "blue", "green"].map((c) => (
                <div
                  key={c}
                  className={`w-5 h-5 rounded-full cursor-pointer ${
                    c === "red"
                      ? "bg-red-500"
                      : c === "blue"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                  onClick={() => {
                    assign({
                      shift,
                      line,
                      position,
                      employeeId: current?.employee?._id || null,
                      customName: current?.customName || "",
                      color: c,
                    });
                    closeMenu();
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
});

/* ---------- Schichtplan Page ---------- */
export default function SchichtplanPage() {
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(dayStart(new Date().toISOString()));
  const [shiftData, setShiftData] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [absences, setAbsences] = useState([]);
  const [rollenCollapsed, setRollenCollapsed] = useState(true);
  const SPECIAL_SHIFT = "__SPECIAL__";

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
    fetch(`/api/absences?ym=${date.slice(0, 7)}`)
      .then((r) => r.json())
      .then(setAbsences);
  }, [date]);

  const grouped = useMemo(
    () =>
      employees.reduce((a, e) => {
        (a[e.role] ??= []).push(e);
        return a;
      }, {}),
    [employees]
  );
  const absentToday = useMemo(() => {
    const map = new Map(); // id -> type
    absences.forEach((a) => {
      const isSameDay = new Date(a.date).toISOString().slice(0, 10) === date;
      if (isSameDay && ["U", "K", "ZA"].includes(a.type)) {
        map.set(a.employee?._id, a.type);
      }
    });
    return map;
  }, [absences, date]);

  async function assign({
    shift,
    line,
    position,
    employeeId,
    customName,
    color,
  }) {
    const payload = {
      date,
      shift,
      line,
      position,
      employeeId,
      customName,
      color,
    };

    if (!employeeId && !customName) {
      await fetch(
        `/api/schedules?date=${date}&shift=${shift}&line=${
          line || ""
        }&position=${position}`,
        {
          method: "DELETE",
        }
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
      return;
    }

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

  // Print function
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printDate = new Date(date).toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Helpers for printing
    const getCellDisplay = (entry) => {
      if (!entry) return "";
      return entry.employee?.name || entry.customName || "";
    };

    const getCellStyle = (entry) => {
      if (!entry?.color) return "";
      if (entry.color === "red") return "background-color:#fca5a5;";
      if (entry.color === "blue") return "background-color:#93c5fd;";
      if (entry.color === "green") return "background-color:#86efac;";
      return "";
    };

    printWindow.document.write(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Schichtplan KW ${week}/${year}</title>
    <style>
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        @page {
          size: A4 landscape;
          margin: 0.5cm;
        }

        body {
          font-family: Arial, sans-serif;
          font-size: 9px;
          line-height: 1.1;
        }

        .print-container {
          width: 100%;
        }

        .print-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 5px;
          border-bottom: 2px solid #2d5c2a;
        }

        .print-title {
          font-size: 16px;
          font-weight: bold;
          color: #2d5c2a;
        }

        .print-date {
          font-size: 12px;
          color: #555;
        }

        .print-shift {
          page-break-inside: avoid;
          margin-bottom: 8px;
        }

        .print-shift-header {
          background: linear-gradient(to right, #2d5c2a, #3a7a34);
          background-color: #2d5c2a;
          color: #ffffff;
          padding: 4px 6px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          border-radius: 3px;
        }

        .print-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .print-table th {
          background-color: #e8f4e6;
          color: #2d5c2a;
          font-weight: bold;
        }

        .print-table th,
        .print-table td {
          border: 1px solid #b8d0b5;
          padding: 1px 2px;
          text-align: center;
          height: 12px;
        }

        .print-table td.print-name-cell {
          text-align: left !important;
          padding: 0 2px !important;
          white-space: nowrap;
        }

        .print-role-header {
          background-color: #d4e8d1;
          text-align: left;
          font-weight: bold;
        }

        .print-line-header {
          background-color: #e8f4e6;
          font-weight: bold;
        }

        .print-signature-section {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #2d5c2a;
          display: flex;
          justify-content: space-between;
        }

        .print-signature-line {
          width: 45%;
          border-bottom: 1px solid #000;
          padding: 20px 0 5px 0;
          font-size: 10px;
        }

        .no-print {
          display: none !important;
        }

        .print-shift-content {
          display: flex;
        }

        .print-left-roles {
          width: 160px;
        }

        .print-right-lines {
          flex: 1;
          overflow: hidden;
        }

        .print-left-table th,
        .print-left-table td {
          font-size: 8px;
        }
      }
    </style>
  </head>
  <body>
    <div class="print-container">
      <div class="print-header">
        <div class="print-title">Schichtplan KW ${week}/${year}</div>
        <div class="print-date">${printDate}</div>
      </div>
`);

    // Special Roles + Abwesend Section
    printWindow.document.write(`
  <div style="
    border:0.5px solid #d1d5db; 
    border-radius:2px; 
    padding:4px 6px; 
    margin-bottom:4px;
    background:#ffffff;
  ">
  
    <!-- Special Roles Grid -->
    <div style="
      display:grid; 
      grid-template-columns:repeat(5,1fr); 
      gap:6px; 
      font-size:8px; 
      margin-bottom:6px;
    ">
`);

    ["Kantine", "Springer", "Anlernen", "Qualifizierung", "Lager"].forEach(
      (special) => {
        printWindow.document.write(`
      <div style="display:flex; flex-direction:column; align-items:center;">
        <label style="
          font-size:8px; 
          font-weight:500; 
          margin-bottom:2px; 
          text-align:center; 
          color:#374151;
        ">
          ${special}
        </label>
        <div style="
          display:flex; 
          border:0.5px solid #d1d5db; 
          border-radius:3px; 
          overflow:hidden; 
          width:100%; 
          min-height:18px; 
          background:#fff;
        ">
    `);

        [1, 2].forEach((slot, idx) => {
          const pos = `${special} ${slot}`;
          const current = currentAssigned("", pos, SPECIAL_SHIFT);

          printWindow.document.write(`
          <div style="
            flex:1; 
            font-size:8px; 
            padding:2px 3px; 
            border-right:${idx === 0 ? "0.5px solid #e5e7eb" : "none"}; 
            white-space:nowrap; 
            overflow:hidden; 
            text-overflow:ellipsis;
            color:#111827;
          ">
            ${getCellDisplay(current) || ""}
          </div>
      `);
        });

        printWindow.document.write(`
        </div>
      </div>
    `);
      }
    );

    printWindow.document.write(`
    </div>

    <!-- Abwesend Section -->
    <div>
      <label style="
        font-size:8px; 
        font-weight:600; 
        margin-bottom:2px; 
        display:block; 
        color:#374151;
      ">
        Abwesend
      </label>
      <div style="
        font-size:8px; 
        color:#111827; 
        border:1px solid #e5e7eb; 
        border-radius:3px; 
        padding:2px 3px; 
        background:#f9fafb;
      ">
`);

    const filteredAbsences = Array.from(
      new Map(
        absences
          .filter(
            (a) => a.date.startsWith(date) && ["U", "K", "ZA"].includes(a.type)
          )
          .map((a) => [a.employee?._id, a])
      ).values()
    );

    if (filteredAbsences.length > 0) {
      printWindow.document.write(
        filteredAbsences
          .map((a) => `${a.employee?.name} (${a.type})`)
          .join(", ")
      );
    } else {
      printWindow.document.write(`
        <span style="color:#9ca3af; font-style:italic;">
          Keine Abwesenheiten
        </span>
  `);
    }

    printWindow.document.write(`
      </div>
    </div>
  </div>
`);

    // Add each shift to the print document
    SHIFTS.forEach(({ name, time }) => {
      printWindow.document.write(`
        <div class="print-shift">
          <div class="print-shift-header">
            <div>${name}</div>
            <div>${time}</div>
          </div>
          <div class="print-shift-content">
      `);

      // Left roles section
      printWindow.document.write(`
        <div class="print-left-roles">
          <table class="print-table print-left-table">
            <thead>
              <tr>
                <th colspan="2">Rollen</th>
              </tr>
            </thead>
            <tbody>
      `);

      LEFT_ROLES.forEach((role) => {
        const current = currentAssigned("", role, name);
        printWindow.document.write(`
          <tr>
            <td class="print-role-cell">${role}</td>
            <td class="print-name-cell" style="${getCellStyle(current)}">
              ${getCellDisplay(current)}
            </td>
          </tr>
        `);
      });

      printWindow.document.write(`
            </tbody>
          </table>
        </div>
      `);

      // Right lines section
      printWindow.document.write(`
        <div class="print-right-lines">
          <table class="print-table">
            <thead>
              <tr>
                <th class="print-role-header">Rolle</th>
      `);

      LINES.forEach((line) => {
        printWindow.document.write(
          `<th class="print-line-header">${line.name}</th>`
        );
      });

      printWindow.document.write(`
              </tr>
            </thead>
            <tbody>
      `);

      // Add positions
      RIGHT_POSITIONS.forEach((pos) => {
        printWindow.document.write(`
          <tr>
            <td class="print-role-cell">${pos}</td>
        `);

        LINES.forEach((line) => {
          const current = currentAssigned(line.name, pos, name);
          printWindow.document.write(
            `<td class="print-name-cell" style="${getCellStyle(current)}">
              ${getCellDisplay(current)}
            </td>
          `
          );
        });

        printWindow.document.write(`</tr>`);
      });

      // Add position rows
      [1, 2, 3, 4, 5, 6].forEach((rowNum) => {
        const pos = `Position ${rowNum}`;
        printWindow.document.write(`
          <tr>
            <td class="print-role-cell">${pos}</td>
        `);

        LINES.forEach((line) => {
          const current = currentAssigned(line.name, pos, name);
          printWindow.document.write(
            `<td class="print-name-cell" style="${getCellStyle(current)}">
              ${getCellDisplay(current)}
            </td>
          `
          );
        });

        printWindow.document.write(`</tr>`);
      });

      printWindow.document.write(`
            </tbody>
          </table>
        </div>
      `);

      printWindow.document.write(`
          </div>
        </div>
      `);
    });

    // Add signature section
    printWindow.document.write(`
        <div class="print-signature-section">
          <div class="print-signature-line">Datum: _______________</div>
          <div class="print-signature-line">Unterschrift: _______________</div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="px-1 sm:px-6 py-4 sm:py-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl text-xs sm:text-base">
        <NavigationTabs />
        <div className="p-2 bg-gray-50 min-h-screen w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto relative z-0 overflow-visible">
          {/* Header with print button */}
          <div className="flex items-center justify-between mb-2 p-2 bg-white/50 rounded-sm border border-gray-200">
            <h2 className="text-xs sm:text-lg font-bold text-gray-800 leading-tight">
              KW {week} / {year}
            </h2>
            <div className="flex items-center ">
              <button
                onClick={handlePrint}
                className="hover:bg-green-100 text-white font-medium py-1.5 px-2 rounded text-xs flex items-center gap-1 cursor-pointer mr-1 bg-green-50 hover:border-green-300 transition-colors"
              >
                <Printer className="w-4 h-4 text-green-500 font-bold" />
              </button>
              <div className="flex items-center gap-1 rounded-sm">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border border-gray-300 rounded-sm px-1 py-0.5 text-[10px] sm:text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-[110px] sm:w-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Special Roles Section */}
          <div className="mt-3 mb-4 bg-white rounded-lg shadow border border-gray-200">
            <div className="p-3 space-y-4">
              {/* Rollen Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                {[
                  "Kantine",
                  "Springer",
                  "Anlernen",
                  "Qualifizierung",
                  "Lager",
                ].map((special) => {
                  const options = grouped[special] ?? employees;

                  return (
                    <div key={special} className="flex flex-col items-center">
                      <label className="text-[10px] sm:text-[11px] font-medium text-gray-600 mb-1 text-center">
                        {special}
                      </label>

                      <div className="flex w-full border border-gray-300 rounded bg-white overflow-hidden">
                        {[1, 2].map((slot) => {
                          const dropdownId = `special-${special}-${slot}`;
                          const position = `${special} ${slot}`;
                          const current = currentAssigned(
                            "",
                            position,
                            SPECIAL_SHIFT
                          );

                          return (
                            <div
                              key={slot}
                              className="flex-1 text-[9px] sm:text-[11px] text-gray-700 cursor-pointer border-r border-gray-200 last:border-r-0 truncate"
                            >
                              <Dropdown
                                options={options}
                                shift={SPECIAL_SHIFT}
                                line=""
                                position={position}
                                dropdownId={dropdownId}
                                current={current}
                                assign={assign}
                                activeDropdown={activeDropdown}
                                setActiveDropdown={setActiveDropdown}
                                absentToday={absentToday}
                                placeholder="Mitarbeiter…"
                                className="w-full border-none outline-none bg-transparent text-gray-700 text-[9px] sm:text-[11px] truncate"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Abwesend Section */}
              <div>
                <label className="text-[10px] sm:text-[11px] font-medium text-gray-600 mb-1 block">
                  Abwesend
                </label>
                <div className="flex flex-wrap gap-1 sm:gap-1.5 bg-gray-50 border border-gray-200 rounded p-1.5 sm:p-2 min-h-[28px] sm:min-h-[32px]">
                  {Array.from(
                    new Map(
                      absences
                        .filter(
                          (a) =>
                            a.date.startsWith(date) &&
                            ["U", "K", "ZA"].includes(a.type)
                        )
                        .map((a) => [a.employee?._id, a])
                    ).values()
                  ).map((a) => {
                    let badgeClasses =
                      "px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-medium border";
                    if (a.type === "U")
                      badgeClasses +=
                        " bg-green-200 text-gray-800 border-green-200";
                    else if (a.type === "K")
                      badgeClasses +=
                        " bg-red-200 text-gray-800 border-red-200";
                    else if (a.type === "ZA")
                      badgeClasses +=
                        " bg-yellow-200 text-gray-800 border-yellow-200";

                    return (
                      <span key={a.employee?._id} className={badgeClasses}>
                        {a.employee?.name} ({a.type})
                      </span>
                    );
                  })}

                  {Array.from(
                    new Map(
                      absences
                        .filter(
                          (a) =>
                            a.date.startsWith(date) &&
                            ["U", "K", "ZA"].includes(a.type)
                        )
                        .map((a) => [a.employee?._id, a])
                    ).values()
                  ).length === 0 && (
                    <span className="text-gray-400 text-[9px] sm:text-[11px] italic">
                      Keine Abwesenheiten
                    </span>
                  )}
                </div>
              </div>
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
                  <div className="px-1 py-0.5 bg-green-900 text-white font-semibold text-xs">
                    {name}
                  </div>
                  <div className="text-green-100 text-xs">{time}</div>
                </div>
                <button
                  onClick={() => setRollenCollapsed(!rollenCollapsed)}
                  className="text-xs font-bold text-yellow-400 bg-green-700 hover:bg-green-900 px-2 py-0.5 rounded-sm flex items-center gap-1"
                >
                  {rollenCollapsed ? (
                    <Plus className="h-5 w-5 text-yellow-400" aria-hidden />
                  ) : (
                    <Minus className="h-5 w-5 text-yellow-400" aria-hidden />
                  )}
                </button>
              </div>

              <div className="flex">
                {/* LEFT: Rollen */}
                {!rollenCollapsed && (
                  <div className="w-48">
                    <table className="w-full border-collapse table-fixed">
                      <thead>
                        <tr>
                          <th
                            colSpan={2}
                            className="bg-gray-100 border-b border-gray-300 p-0.5 text-xs font-medium text-gray-700 uppercase text-center"
                          >
                            Rollen
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {LEFT_ROLES.map((role, index) => {
                          const current = currentAssigned("", role, name);
                          const options = grouped[role] ?? employees;
                          const dropdownId = `${name}-left-${role}`;
                          return (
                            <tr
                              key={role}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="border-b border-r border-gray-300 p-1 text-xs truncate w-32">
                                {role}
                              </td>
                              <td className="border-b border-gray-300 text-xs w-40 relative">
                                <Dropdown
                                  options={options}
                                  shift={name}
                                  line=""
                                  position={role}
                                  dropdownId={dropdownId}
                                  current={current}
                                  assign={assign}
                                  activeDropdown={activeDropdown}
                                  setActiveDropdown={setActiveDropdown}
                                  absentToday={absentToday}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* RIGHT: Lines */}
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                      <tr>
                        <th className="border-b border-l-2 border-r border-gray-300 p-0.5 bg-gray-100 text-center text-xs font-medium text-gray-700 w-25">
                          Rolle
                        </th>
                        {LINES.map((line) => (
                          <th
                            key={line.name}
                            className="border-b border-r border-gray-300 p-0.5 bg-gray-100 text-center text-xs w-28"
                          >
                            <div className="font-semibold text-gray-900 text-xs truncate">
                              {line.name}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {RIGHT_POSITIONS.map((pos, rowIndex) => (
                        <tr
                          key={pos}
                          className={
                            rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="border-b border-r-2 border-l-2 border-gray-300 p-0.5 pl-1 text-xs font-medium bg-gray-50">
                            {pos}
                          </td>
                          {LINES.map((line) => {
                            const current = currentAssigned(
                              line.name,
                              pos,
                              name
                            );
                            const options = grouped[pos] ?? employees;
                            const dropdownId = `${name}-${line.name}-${pos}`;
                            return (
                              <td
                                key={`${name}-${line.name}-${pos}`}
                                className="border-b border-r border-gray-300 relative"
                              >
                                <Dropdown
                                  options={options}
                                  shift={name}
                                  line={line.name}
                                  position={pos}
                                  dropdownId={dropdownId}
                                  current={current}
                                  assign={assign}
                                  activeDropdown={activeDropdown}
                                  setActiveDropdown={setActiveDropdown}
                                  absentToday={absentToday}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {[1, 2, 3, 4, 5, 6].map((rowNum) => (
                        <tr
                          key={rowNum}
                          className={
                            rowNum % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="border-b border-r-2 border-l-2 border-gray-300 p-0.5 text-xs font-medium bg-gray-50">
                            Position {rowNum}
                          </td>
                          {LINES.map((line) => {
                            const pos = `Position ${rowNum}`;
                            const current = currentAssigned(
                              line.name,
                              pos,
                              name
                            );
                            const options = employees;
                            const dropdownId = `${name}-${line.name}-${pos}`;
                            return (
                              <td
                                key={`${name}-${line.name}-${pos}`}
                                className="border-b border-r border-gray-300  relative"
                              >
                                <Dropdown
                                  options={options}
                                  shift={name}
                                  line={line.name}
                                  position={pos} // ✅ use pos = `Position ${rowNum}`
                                  dropdownId={dropdownId}
                                  current={current}
                                  assign={assign}
                                  activeDropdown={activeDropdown}
                                  setActiveDropdown={setActiveDropdown}
                                  absentToday={absentToday}
                                />
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
      </div>
    </div>
  );
}
