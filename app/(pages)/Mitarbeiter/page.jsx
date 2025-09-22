"use client";
import { useEffect, useMemo, useState } from "react";
import NavigationTabs from "@/app/(components)/NavigationTab";
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

export default function EmployeesPage() {
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
        <NavigationTabs />
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
