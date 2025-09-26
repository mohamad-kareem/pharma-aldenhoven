"use client";

import { useEffect, useMemo, useState } from "react";
import NavigationTabs from "@/app/(components)/NavigationTab";
import { UserPlus, Edit, Trash2 } from "lucide-react";

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

// Emerald palette for badges
const ROLE_COLORS = {
  "Vorarbeiter/in": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  QK: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  Bucher: "bg-lime-500/20 text-lime-300 border-lime-500/30",
  "Zubr.Außen": "bg-green-500/20 text-green-300 border-green-500/30",
  "Zubr.Reinraum": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Lager: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  UmbautenTechnik: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Maschinen/Linienführer": "bg-red-500/20 text-red-300 border-red-500/30",
  Linienführer: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Maschinenführer: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Maschine/Linienbediner":
    "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  "Maschine/Anlagenführer AZUBIS":
    "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Packer: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  Teilzeitkraft: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
  Staplerfahrer: "bg-lime-500/20 text-lime-300 border-lime-500/30",
  "Zubringer Reinraum": "bg-green-600/20 text-green-400 border-green-600/30",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRole, setActiveRole] = useState("All");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add modal states
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [savingAdd, setSavingAdd] = useState(false);

  // Edit modal states
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
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function addEmployee(e) {
    e.preventDefault();
    if (!name || !role) return;
    setSavingAdd(true);
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
        setIsAdding(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAdd(false);
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
      if (res.ok) {
        setEmployees((prev) =>
          prev.map((e) => (e._id === editingEmp._id ? data : e))
        );
        closeEdit();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteEmployee(id) {
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) setEmployees((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const roleMatch = activeRole === "All" || emp.role === activeRole;
      const searchMatch = emp.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return roleMatch && searchMatch;
    });
  }, [employees, activeRole, searchTerm]);

  const roleCounts = useMemo(() => {
    return employees.reduce((acc, e) => {
      acc[e.role] = (acc[e.role] || 0) + 1;
      return acc;
    }, {});
  }, [employees]);

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-emerald-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-2 border-emerald-500 border-t-transparent rounded-full mb-4" />
          <p className="text-sm text-gray-300">Mitarbeiter werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-emerald-950 text-white p-4 sm:p-3">
      <div className=" w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto  ">
        <NavigationTabs />

        {/* Top Section */}
        <div className="border-t-3 border-green-950 pb-3 mb-2">
          <div className="flex flex-row items-center gap-2 pt-6 justify-start sm:justify-between">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Teammitglieder suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 px-2 py-1.5 text-xs rounded-md 
                 bg-gradient-to-br from-gray-900 to-emerald-950 
                 border border-gray-700 text-white 
                 placeholder-gray-400 focus:ring-1 focus:ring-emerald-900 
                 focus:border-emerald-900 sm:text-sm"
            />

            {/* Add Button */}
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md 
                 bg-gradient-to-br from-gray-900 to-emerald-700 
                 text-white text-xs font-medium hover:opacity-90 
                 border border-emerald-600 shadow-sm shadow-emerald-900 
                 transition-all sm:px-3 sm:py-2 sm:text-sm"
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="sm:hidden">Hinzufügen</span>
              <span className="hidden sm:inline">Mitglied hinzufügen</span>
            </button>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-gradient-to-br from-gray-900 to-emerald-950 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold">Teammitglieder</h2>
              <p className="text-xs text-gray-400">
                {filteredEmployees.length} von {employees.length} angezeigt
              </p>
            </div>
            <span className="text-xs text-gray-400">
              Seite {currentPage} von {totalPages}
            </span>
          </div>

          {paginatedEmployees.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {paginatedEmployees.map((emp) => (
                <div
                  key={emp._id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-400 font-bold">
                      {emp.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-xs sm:text-base">
                        {emp.name}
                      </p>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 text-[9px] sm:text-[11px]  rounded-full border ${
                          ROLE_COLORS[emp.role] ||
                          "bg-gray-700 text-gray-300 border-gray-600"
                        }`}
                      >
                        {emp.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(emp)}
                      className="p-2 text-gray-400 hover:text-emerald-400"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEmployee(emp._id)}
                      className="p-2 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              Keine Mitarbeiter gefunden
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-3 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40"
            >
              Zurück
            </button>
            {[...Array(totalPages)].map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    currentPage === page
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40"
            >
              Weiter
            </button>
          </div>
        )}

        {/* Role Distribution */}
        <div className="bg-gradient-to-br from-gray-950 to-emerald-950 rounded-xl border border-gray-700 p-5 mt-6">
          <h3 className="text-sm font-semibold mb-4">Rollenverteilung</h3>

          <div className="space-y-3">
            {ROLE_ORDER.filter((r) => (roleCounts[r] || 0) > 0).map((r) => (
              <div key={r}>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{r}</span>
                  <span>{roleCounts[r]}</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full">
                  <div
                    className={`h-2 rounded-full ${
                      ROLE_COLORS[r]?.split(" ")[0] || "bg-emerald-500"
                    }`}
                    style={{
                      width: `${
                        ((roleCounts[r] || 0) / Math.max(1, employees.length)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-gradient-to-br from-gray-950 to-emerald-950 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">
              Mitarbeiter hinzufügen
            </h3>
            <form onSubmit={addEmployee} className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vollständiger Name"
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white"
              >
                <option value="">Rolle auswählen</option>

                {ROLE_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={savingAdd || !name || !role}
                  className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-40"
                >
                  {savingAdd ? "Wird hinzugefügt..." : "Hinzufügen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-gradient-to-br from-gray-950 to-emerald-950 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">
              Mitarbeiter bearbeiten
            </h3>
            <form onSubmit={saveEdit} className="space-y-3">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white"
              />
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white"
              >
                <option value="">Rolle auswählen</option>

                {ROLE_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-emerald-600 to-teal-600"
                >
                  {savingEdit ? "Wird gespeichert..." : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
