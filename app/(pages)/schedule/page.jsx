"use client";
import { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import React from "react";
import { Plus, Minus, Printer } from "lucide-react";
import { createPortal } from "react-dom";
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
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

function EmployeesTab() {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function openEdit(emp) {
    setEditingEmp(emp);
    setEditName(emp.name);
    setEditRole(emp.role || "");
    setIsEditing(true);
  }

  function closeEdit() {
    setIsEditing(false);
    setEditingEmp(null);
    setEditName("");
    setEditRole("");
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editingEmp?._id || !editName || !editRole) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/employees/${editingEmp._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), role: editRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Failed to update employee");
      } else {
        setEmployees((prev) =>
          prev.map((e) => (e._id === editingEmp._id ? data : e))
        );
        closeEdit();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update employee");
    } finally {
      setSavingEdit(false);
    }
  }

  async function addEmployee(e) {
    e.preventDefault();
    if (!name || !role) return;

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role }),
      });

      const data = await res.json();
      if (res.ok) {
        setEmployees((prev) => [...prev, data]);
        setName("");
        setRole("");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee");
    }
  }

  async function deleteEmployee(id, name) {
    if (!window.confirm(`Delete ${name}?`)) return;

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEmployees(employees.filter((emp) => emp._id !== id));
      } else {
        alert("Error deleting employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee");
    }
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesRole = activeRole === "All" || employee.role === activeRole;
      const matchesSearch = employee.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [employees, activeRole, searchTerm]);

  const roleCounts = useMemo(() => {
    return employees.reduce((acc, employee) => {
      acc[employee.role] = (acc[employee.role] || 0) + 1;
      return acc;
    }, {});
  }, [employees]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-2 sm:p-4 rounded-xl">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-base sm:text-xl font-semibold text-gray-900">
              Team Management
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              {employees.length} team members
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <svg
                className="h-3.5 w-3.5 text-gray-400 sm:h-4 sm:w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-2 sm:gap-0 pb-1 custom-scrollbar">
          <button
            onClick={() => setActiveRole("All")}
            className={`px-2 py-2 text-xs sm:text-xs rounded-md transition-colors whitespace-nowrap flex-shrink-0 ${
              activeRole === "All"
                ? "bg-green-100 text-green-800 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All ({employees.length})
          </button>

          {ROLE_ORDER.filter((role) => roleCounts[role] > 0).map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-3 py-2 text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap flex-shrink-0 ${
                activeRole === role
                  ? "bg-green-100 text-green-800 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {role} ({roleCounts[role] || 0})
            </button>
          ))}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-medium text-gray-800">
                Team Members
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-800">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(employee)}
                        className="text-gray-400 hover:text-green-600 p-1 rounded transition-colors"
                        title="Edit employee"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536M4 20h4l10.5-10.5a2.5 2.5 0 00-3.536-3.536L4 16v4z"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() =>
                          deleteEmployee(employee._id, employee.name)
                        }
                        className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Delete employee"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No employees found
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Add Employee & Stats */}
          <div className="space-y-6">
            {/* Add Employee Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-medium text-gray-800 mb-3">
                Add Team Member
              </h2>
              <form onSubmit={addEmployee} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select a role</option>
                    {ROLE_ORDER.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={!name || !role}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 rounded-md text-sm transition-colors"
                >
                  Add Team Member
                </button>
              </form>
            </div>

            {/* Role Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-3">
                Team Distribution
              </h3>
              <div className="space-y-3">
                {ROLE_ORDER.map((r) => (
                  <div key={r} className="flex items-center">
                    <div className="w-20 text-xs text-gray-600 truncate">
                      {r}
                    </div>
                    <div className="flex-1 ml-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
                    <div className="w-6 text-right text-xs text-gray-500 ml-2">
                      {roleCounts[r] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Edit Employee
              </h3>
              <button
                onClick={closeEdit}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                title="Close"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={saveEdit} className="px-4 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select a role</option>
                  {ROLE_ORDER.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || !editName || !editRole}
                  className="px-3 py-2 text-sm rounded-md bg-green-600 text-white disabled:bg-gray-300 hover:bg-green-700 transition-colors"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Top-level (outside WeeklyTab)
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
        className={`w-full p-0.5 text-xs cursor-pointer border border-transparent hover:border-green-300  min-h-6 flex items-center truncate ${
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
            {filtered.map((emp, idx) => (
              <div
                key={emp._id}
                className={`p-1 text-xs truncate ${
                  idx === highlightIndex ? "bg-green-100" : ""
                } hover:bg-green-50 cursor-pointer`}
                onClick={() => {
                  assign({ shift, line, position, employeeId: emp._id });
                  closeMenu();
                }}
              >
                {emp.name}
              </div>
            ))}

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
/* ---------- Weekly plan tab with collapsible Rollen ---------- */
function WeeklyTab() {
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
    fetch(`/api/urlaub?ym=${date.slice(0, 7)}`)
      .then((r) => r.json())
      .then(setAbsences);
  }, [date]);
  /*function getDayName(dateStr) {
    const options = { weekday: "long" };
    return new Date(dateStr).toLocaleDateString("de-DE", options);
  }*/
  function isAbsent(empId, dateStr) {
    const ab = absences.find(
      (x) => x.employee?._id === empId && x.date.startsWith(dateStr)
    );
    return ab?.type;
  }

  const grouped = useMemo(
    () =>
      employees.reduce((a, e) => {
        (a[e.role] ??= []).push(e);
        return a;
      }, {}),
    [employees]
  );

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
      if (entry.color === "red") return "background-color:#fca5a5;"; // red-300
      if (entry.color === "blue") return "background-color:#93c5fd;"; // blue-300
      if (entry.color === "green") return "background-color:#86efac;"; // green-300
      return "";
    };

    printWindow.document.write(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Schichtplan KW ${week}/${year}</title>
    <style>
      @media print {
        /* Ensure colors/gradients are kept */
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
          background-color: #2d5c2a; /* fallback */
          color: #ffffff;
          padding: 4px 6px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          border-radius: 3px;
        }

        .print-table {
          width: 100%;              /* ✅ keep full width */
          border-collapse: collapse;
          table-layout: fixed;      /* ✅ keep columns evenly spaced */
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

        /* ✅ only employee cells are adjusted */
        .print-table td.print-name-cell {
          text-align: left !important;
          padding: 0 2px !important;
          white-space: nowrap;  /* no text wrapping */
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
    // --- Special Roles + Abwesend ---
    printWindow.document.write(`
  <div style="
    border:0.5px solid #d1d5db; 
    border-radius:2px; 
    padding:4px 6px; 
    margin-bottom:4px;   /* 👈 small gap before Früh table */
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
    <div className="p-2 bg-gray-50 min-h-screen w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto relative z-0 overflow-visible">
      {/* Header with print button */}
      <div className="flex items-center justify-between mb-2 p-2 bg-white rounded-sm border border-gray-300">
        <h2 className="text-xs sm:text-lg font-bold text-gray-800 leading-tight">
          KW {week} / {year}
        </h2>
        <div className="flex items-center ">
          <button
            onClick={handlePrint}
            className=" hover:bg-green-100 text-white font-medium py-1.5 px-2 rounded text-xs flex items-center gap-1 cursor-pointer mr-1 bg-green-50  hover:border-green-300 transition-colors"
          >
            <Printer className="w-4 h-4 text-green-500 font-bold" />
          </button>
          <div className="flex items-center gap-1   rounded-sm">
            <div className="flex items-center gap-2">
              {/* 
<span className="text-[10px] sm:text-xs font-medium text-gray-600">
  {getDayName(date)}
</span> 
*/}
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
      {/* ✅ Special Roles Section (only once) */}
      <div className="mt-6 bg-white rounded-lg shadow border border-gray-200">
        {/* Roles + Abwesend */}
        <div className="p-3 space-y-4">
          {/* Rollen Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {["Kantine", "Springer", "Anlernen", "Qualifizierung", "Lager"].map(
              (special) => {
                const options = grouped[special] ?? employees;

                return (
                  <div key={special} className="flex flex-col items-center">
                    {/* Label */}
                    <label className="text-[10px] sm:text-[11px] font-medium text-gray-600 mb-1 text-center">
                      {special}
                    </label>

                    {/* Shared input container */}
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
                            className="flex-1   text-[9px] sm:text-[11px] text-gray-700 cursor-pointer border-r border-gray-200 last:border-r-0 truncate"
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
                              placeholder="Mitarbeiter…"
                              className="w-full border-none outline-none bg-transparent text-gray-700 text-[9px] sm:text-[11px] truncate"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
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
                  badgeClasses += " bg-red-200 text-gray-800 border-red-200";
                else if (a.type === "ZA")
                  badgeClasses +=
                    " bg-yellow-200 text-gray-800 border-yellow-200";

                return (
                  <span key={a.employee?._id} className={badgeClasses}>
                    {a.employee?.name} ({a.type})
                  </span>
                );
              })}

              {/* Empty state */}
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
              <div className="px-1 py-0.5  bg-green-900 text-white font-semibold text-xs">
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
                          <td className="border-b border-gray-300  text-xs w-40 relative">
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
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border-b border-r-2 border-l-2 border-gray-300 p-0.5 pl-1 text-xs font-medium bg-gray-50">
                        {pos}
                      </td>
                      {LINES.map((line) => {
                        const current = currentAssigned(line.name, pos, name);
                        const options = grouped[pos] ?? employees;
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
                              position={pos} // ✅ use pos, not role
                              dropdownId={dropdownId}
                              current={current}
                              assign={assign}
                              activeDropdown={activeDropdown}
                              setActiveDropdown={setActiveDropdown}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {[1, 2, 3, 4, 5, 6].map((rowNum) => (
                    <tr
                      key={rowNum}
                      className={rowNum % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border-b border-r-2 border-l-2 border-gray-300 p-0.5 text-xs font-medium bg-gray-50">
                        Position {rowNum}
                      </td>
                      {LINES.map((line) => {
                        const pos = `Position ${rowNum}`;
                        const current = currentAssigned(line.name, pos, name);
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
  );
}

/* ---------- Urlaubsplanung tab ---------- */
function UrlaubsplanungTab() {
  const [employees, setEmployees] = useState([]);
  const [activeCell, setActiveCell] = useState(null); // {empId, dateStr} or null
  const dropdownRef = useRef(null);
  const [rangeStart, setRangeStart] = useState(null);
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
  }

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
    U: "bg-green-600",
    ZA: "bg-yellow-600",
    K: "bg-red-500",
    F: "bg-pink-400",
    S: "bg-indigo-600",
    N: "bg-black/80",
    Feiertag: "bg-purple-400",
  };

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
    <div className="p-2 bg-gray-50 min-h-screen w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto">
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
                                if (end < start) [start, end] = [end, start];
                                saveAbsenceRange(
                                  emp._id,
                                  start,
                                  end,
                                  rangeStart.type
                                ); // works for filling AND clearing
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
                                                  } // mark clear as range action
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
  const [tab, setTab] = useState("employees");
  return (
    <div className="px-1 sm:px-6 py-4 sm:py-4 min-h-screen bg-gray-50">
      {/* Tabs */}
      <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-4 overflow-x-auto">
        {["weekly", "urlaub", "employees"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-1 sm:px-2 py-1.5 sm:py-2 rounded-lg font-medium sm:font-semibold text-xs sm:text-xs whitespace-nowrap ${
              tab === t
                ? "bg-[var(--color-primary)] text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {t === "weekly"
              ? "Schichtplan"
              : t === "urlaub"
              ? "Urlaubsplanung"
              : "Mitarbeiter"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl   text-xs sm:text-base">
        {tab === "weekly" && <WeeklyTab />}
        {tab === "urlaub" && <UrlaubsplanungTab />}
        {tab === "employees" && <EmployeesTab />}
      </div>
    </div>
  );
}
