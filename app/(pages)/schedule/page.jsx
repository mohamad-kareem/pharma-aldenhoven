"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import React from "react";
import { Plus, Minus } from "lucide-react";
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
  const [editingEmp, setEditingEmp] = useState(null); // {_id, name, role}
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
        // optimistic update in list
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2  py-1">
      <div className="w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Team Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {employees.length} team members
            </p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-2 flex items-center text-gray-400">
              <svg
                className="w-4 h-4"
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
            </span>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
          <button
            onClick={() => setActiveRole("All")}
            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg whitespace-nowrap ${
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
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg whitespace-nowrap ${
                activeRole === role
                  ? "bg-green-100 text-green-800 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {role} ({roleCounts[role] || 0})
            </button>
          ))}
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Employee List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-100">
              <h2 className="font-semibold text-sm sm:text-base text-gray-800">
                Team Members
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    className="px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between"
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(employee)}
                        className="text-gray-500 hover:text-emerald-600 p-1 rounded-md hover:bg-emerald-50"
                        title="Edit employee"
                      >
                        {/* pencil icon */}
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
                        className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50"
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
                <div className="px-3 py-6 text-center text-sm text-gray-500">
                  No employees found
                </div>
              )}
            </div>
          </div>

          {/* Add Employee Form */}
          <div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-5 sticky top-4">
              <h2 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">
                Add Team Member
              </h2>
              <form onSubmit={addEmployee} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-green-500"
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
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                >
                  Add Team Member
                </button>
              </form>

              {/* Role Distribution */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Team Distribution
                </h3>
                <div className="space-y-2">
                  {ROLE_ORDER.map((r) => (
                    <div key={r} className="flex items-center">
                      <div className="w-24 text-xs sm:text-sm text-gray-600 truncate">
                        {r}
                      </div>
                      <div className="flex-1 ml-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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
                      <div className="w-6 sm:w-8 text-right text-xs text-gray-500 ml-2">
                        {roleCounts[r] || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Edit Employee
              </h3>
              <button
                onClick={closeEdit}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
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

            <form onSubmit={saveEdit} className="px-4 py-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-emerald-500"
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
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select a role</option>
                  {ROLE_ORDER.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || !editName || !editRole}
                  className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white disabled:bg-gray-300 hover:bg-emerald-700"
                >
                  {savingEdit ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Weekly plan tab with collapsible Rollen ---------- */

function WeeklyTab() {
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(dayStart(new Date().toISOString()));
  const [shiftData, setShiftData] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filter, setFilter] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [absences, setAbsences] = useState([]);
  const [rollenCollapsed, setRollenCollapsed] = useState(true);

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
  function Dropdown({
    options,
    shift,
    line,
    position,
    dropdownId,
    current,
    date,
    isAbsent,
    assign,
    activeDropdown,
    setActiveDropdown,
    filter,
    setFilter,
    highlightIndex,
    setHighlightIndex,
  }) {
    const dropdownRef = useRef(null);

    useEffect(() => {
      function handleClickOutside(e) {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setActiveDropdown(null);
          setFilter("");
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [setActiveDropdown, setFilter]);

    const filtered = options.filter((emp) =>
      emp.name.toLowerCase().includes(filter.toLowerCase())
    );

    return (
      <div ref={dropdownRef} className="relative">
        {/* clickable cell */}
        <div
          className="w-full p-0.5 text-xs cursor-pointer border border-transparent hover:border-green-300 rounded-sm min-h-6 flex items-center truncate"
          onClick={() =>
            setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId)
          }
        >
          <span className="truncate">{current?.employee?.name || ""}</span>
        </div>

        {/* dropdown list */}
        {activeDropdown === dropdownId && (
          <div className="absolute z-10 left-0 mt-0.5 w-36 bg-white border border-gray-300 rounded-sm shadow-lg max-h-48 overflow-y-auto">
            <input
              autoFocus
              type="text"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setHighlightIndex(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightIndex((i) =>
                    i + 1 < filtered.length ? i + 1 : i
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightIndex((i) => (i - 1 >= 0 ? i - 1 : 0));
                } else if (e.key === "Enter") {
                  const chosen = filtered[highlightIndex];
                  if (chosen) {
                    assign({ shift, line, position, employeeId: chosen._id });
                    setActiveDropdown(null);
                    setFilter("");
                  }
                } else if (e.key === "Escape") {
                  setActiveDropdown(null);
                  setFilter("");
                }
              }}
              placeholder="Type name..."
              className="w-full p-1 text-xs border-b border-gray-200 outline-none"
            />

            <div
              className="p-1 text-xs hover:bg-green-50 cursor-pointer"
              onMouseDown={() => {
                assign({ shift, line, position, employeeId: null });
                setActiveDropdown(null);
                setFilter("");
              }}
            >
              -- Clear --
            </div>

            {filtered.map((emp, idx) => {
              const absence = isAbsent(emp._id, date);
              const isUnavailable = ["U", "K", "ZA"].includes(absence);

              return (
                <div
                  key={emp._id}
                  className={`p-1 text-xs truncate ${
                    idx === highlightIndex ? "bg-green-100" : ""
                  } ${
                    isUnavailable
                      ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                      : "hover:bg-green-50 cursor-pointer"
                  }`}
                  onMouseDown={() => {
                    if (!isUnavailable) {
                      assign({ shift, line, position, employeeId: emp._id });
                      setActiveDropdown(null);
                      setFilter("");
                    }
                  }}
                >
                  {emp.name} {isUnavailable ? `(${absence})` : ""}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  async function assign({ shift, line, position, employeeId }) {
    if (employeeId) {
      const absence = isAbsent(employeeId, date);
      if (["U", "K", "ZA"].includes(absence)) {
        alert("⚠️ This employee is absent (" + absence + ") on this day!");
        return;
      }
    }

    if (!employeeId) {
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
      setFilter("");
      return;
    }

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
    setFilter("");
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

  return (
    <div className="p-2 bg-gray-50 min-h-screen w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 p-2 bg-white rounded-sm border border-gray-300">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
          KW {week} / {year}
        </h2>
        <div className="flex items-center gap-1 bg-green-50 p-1 rounded-sm">
          <label className="text-[10px] sm:text-xs font-medium text-gray-700">
            Datum:
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-sm px-1 py-0.5 text-[10px] sm:text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-[110px] sm:w-auto"
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
            <button
              onClick={() => setRollenCollapsed(!rollenCollapsed)}
              className="text-xs font-bold text-yellow-400 bg-green-700 hover:bg-green-900 px-2 py-0.5 rounded-sm flex items-center gap-1"
            >
              {rollenCollapsed ? (
                <Plus className="h-5 w-5 text-yellow-400" aria-hidden />
              ) : (
                <Minus className="h-5 w-5 text-yellow-400" aria-hidden />
              )}
              <span>Rollen</span>
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
                      const options = grouped[role] ?? employees; // ✅ fix here
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
                          <td className="border-b border-gray-300 p-1 text-xs w-40 relative">
                            <Dropdown
                              options={options} // ✅ now defined
                              shift={name}
                              line="" // ✅ roles don’t belong to a line
                              position={role} // ✅ position is the role itself
                              dropdownId={dropdownId}
                              current={current}
                              date={date}
                              isAbsent={isAbsent}
                              assign={assign}
                              activeDropdown={activeDropdown}
                              setActiveDropdown={setActiveDropdown}
                              filter={filter}
                              setFilter={setFilter}
                              highlightIndex={highlightIndex}
                              setHighlightIndex={setHighlightIndex}
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
                            key={line.name}
                            className="border-b border-r border-gray-300 p-0.5 relative"
                          >
                            <Dropdown
                              options={options} // ✅ here just employees
                              shift={name}
                              line={line.name} // ✅ correct line
                              position={pos} // ✅ "Position 1", "Position 2", etc.
                              dropdownId={dropdownId}
                              current={current}
                              date={date}
                              isAbsent={isAbsent}
                              assign={assign}
                              activeDropdown={activeDropdown}
                              setActiveDropdown={setActiveDropdown}
                              filter={filter}
                              setFilter={setFilter}
                              highlightIndex={highlightIndex}
                              setHighlightIndex={setHighlightIndex}
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
                            key={line.name}
                            className="border-b border-r border-gray-300 p-0.5 relative"
                          >
                            <Dropdown
                              options={options} // ✅ here just employees
                              shift={name}
                              line={line.name} // ✅ correct line
                              position={pos} // ✅ "Position 1", "Position 2", etc.
                              dropdownId={dropdownId}
                              current={current}
                              date={date}
                              isAbsent={isAbsent}
                              assign={assign}
                              activeDropdown={activeDropdown}
                              setActiveDropdown={setActiveDropdown}
                              filter={filter}
                              setFilter={setFilter}
                              highlightIndex={highlightIndex}
                              setHighlightIndex={setHighlightIndex}
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
    N: "bg-black/80",
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
    <div className="p-2 bg-gray-50 min-h-screen w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto">
      <div className="flex items-center justify-between mb-3 p-2 bg-white rounded-sm border border-gray-300">
        <h2 className="text-xl font-bold text-gray-800">Urlaubsplanung</h2>
        <div className="flex items-center gap-1 bg-green-50 p-1 rounded-sm">
          <label className="text-[10px] sm:text-xs font-medium text-gray-700">
            {" "}
          </label>
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
