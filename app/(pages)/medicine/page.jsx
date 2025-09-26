"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiSearch,
  FiUsers,
  FiPieChart,
  FiShield,
  FiPackage,
  FiX,
  FiPlus,
  FiSave,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiMoreVertical,
  FiFilter,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/* =========================================================
   API HELPERS (Cloudinary upload + Medicines CRUD)
   ========================================================= */
async function apiListMedicines({ q = "", category = "All" } = {}) {
  const url = new URL("/api/medicines", window.location.origin);
  if (q) url.searchParams.set("q", q);
  if (category) url.searchParams.set("category", category);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Medikamente konnten nicht geladen werden");
  return await res.json();
}

async function apiCreateMedicine(payload) {
  const res = await fetch("/api/medicines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Erstellung fehlgeschlagen");
  }
  return await res.json();
}

async function apiUpdateMedicine(id, payload) {
  const res = await fetch(`/api/medicines/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Aktualisierung fehlgeschlagen");
  }
  return await res.json();
}

async function apiDeleteMedicine(id) {
  const res = await fetch(`/api/medicines/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Löschen fehlgeschlagen");
  }
  return await res.json();
}

async function apiUploadImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Upload fehlgeschlagen");
  }
  return await res.json();
}

/* =========================================================
   UI Components
   ========================================================= */
const difficultyColors = {
  Niedrig: "bg-green-500/40 text-green-300 border-green-500/30",
  Mittel: "bg-yellow-500/40 text-yellow-300 border-yellow-500/30",
  Hoch: "bg-red-500/40 text-red-300 border-red-500/30",
};

function FallbackImg({ src, alt, className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/B12.png";
      }}
    />
  );
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-500 border-t-transparent" />
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-gradient-to-br from-gray-900 to-emerald-950 rounded-lg p-2 border border-gray-700 shadow-md ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          <h3 className="text-lg font-bold text-white ml-2">{value}</h3>
        </div>
        <div className="p-2 rounded-full bg-gray-800/50">
          <Icon className="h-5 w-5 text-emerald-400" />
        </div>
      </div>
    </motion.div>
  );
}

function MedicineCard({ medicine, selected, onClick, onEdit, onDelete }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.div layout className="relative group">
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={`Öffne ${medicine.name}`}
        whileHover={{ y: -1 }}
        layout
        className={[
          "w-full text-left rounded-lg border relative overflow-hidden",
          "transition-all duration-200",
          selected
            ? "bg-emerald-500/20 ring-1 ring-emerald-500 border-emerald-500/30 shadow-lg"
            : "bg-gradient-to-br from-gray-900 to-emerald-950 border-gray-700 hover:shadow-lg",
        ].join(" ")}
      >
        <div className="relative h-28 bg-gray-800/50 rounded flex items-center justify-center overflow-hidden">
          <FallbackImg
            src={medicine.image}
            alt={medicine.name}
            className="max-h-full max-w-full object-contain p-2"
          />
          <span
            className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
              difficultyColors[medicine.difficulty] ||
              "bg-gray-700 text-gray-300 border-gray-600"
            }`}
          >
            <span className="sm:hidden">
              {medicine.difficulty === "Mittel"
                ? "Med"
                : medicine.difficulty === "Niedrig"
                ? "Nied"
                : medicine.difficulty === "Hoch"
                ? "Hoch"
                : "—"}
            </span>
            <span className="hidden sm:inline">
              {medicine.difficulty || "—"}
            </span>
          </span>
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3 className="text-xs font-semibold text-white truncate">
              {medicine.name}
            </h3>
            <span className="text-[10px] font-medium text-emerald-400 whitespace-nowrap">
              {medicine.category}
            </span>
          </div>

          <p className="text-gray-400 text-[11px] line-clamp-1 mb-2">
            {medicine.description}
          </p>

          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <div className="flex items-center">
              <FiUsers className="mr-0.5 shrink-0 h-2.5 w-2.5 text-emerald-400" />
              <span>{medicine.employeesRequired} Mitarbeiter</span>
            </div>
            <div className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">
              {medicine.productionTime}
            </div>
          </div>
        </div>
      </motion.button>

      {/* Desktop hover actions */}
      <div className="absolute top-2 left-2 hidden sm:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          className="bg-gray-800 text-emerald-400 p-1 rounded shadow hover:bg-gray-700 border border-gray-600"
          title="Bearbeiten"
        >
          <FiEdit2 className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="bg-gray-800 text-red-400 p-1 rounded shadow hover:bg-gray-700 border border-gray-600"
          title="Löschen"
        >
          <FiTrash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Mobile three-dots menu */}
      <div className="absolute top-2 left-2 sm:hidden">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuOpen((v) => !v);
          }}
          className="bg-gray-800 text-gray-300 p-1 rounded shadow border border-gray-600"
          aria-label="Mehr Optionen"
        >
          <FiMoreVertical className="h-3 w-3" />
        </button>

        {mobileMenuOpen && (
          <div
            className="absolute mt-1 bg-gray-800 rounded shadow border border-gray-600 z-10 min-w-[80px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onEdit?.();
              }}
              className="flex items-center gap-1 px-2 py-1 text-[10px] text-emerald-400 hover:bg-gray-700 w-full text-left"
            >
              <FiEdit2 className="h-2.5 w-2.5" /> Bearbeiten
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onDelete?.();
              }}
              className="flex items-center gap-1 px-2 py-1 text-[10px] text-red-400 hover:bg-gray-700 w-full text-left"
            >
              <FiTrash2 className="h-2.5 w-2.5" /> Löschen
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MedicineModal({ medicine, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      <div
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg 
               bg-gradient-to-br from-gray-900 to-emerald-950 rounded-lg border border-gray-700 shadow-xl
               max-h-[80vh] flex flex-col overflow-hidden custom-scrollbar"
        >
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
            <div>
              <h3 className="text-sm font-semibold text-white">
                {medicine.name}
              </h3>
              <p className="text-emerald-400 text-[10px] font-medium">
                {medicine.category}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-800 text-gray-400"
              aria-label="Details schließen"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="h-20 bg-gray-800/50 rounded-lg overflow-hidden">
                <FallbackImg
                  src={medicine.image}
                  alt={medicine.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h4 className="font-medium text-white text-xs mb-1">
                  Beschreibung
                </h4>
                <p className="text-gray-400 text-xs">{medicine.description}</p>
              </div>

              <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                <h4 className="font-medium text-emerald-400 text-xs mb-2">
                  Produktionsdetails
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="font-medium text-white">
                      {medicine.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chargengröße:</span>
                    <span className="font-medium text-white">
                      {Number(medicine.batchSize).toLocaleString("de-DE")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Zuletzt produziert:</span>
                    <span className="font-medium text-white">
                      {medicine.lastProduced
                        ? new Date(medicine.lastProduced).toLocaleDateString(
                            "de-DE"
                          )
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Qualitätskontrolle:</span>
                    <span className="font-medium text-white">
                      {medicine.qualityControl || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white text-xs mb-1">
                  Personalanforderungen
                </h4>
                <div className="border border-gray-700 rounded-lg p-2 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <FiUsers className="text-emerald-400 mr-1 h-3 w-3" />
                      <span className="font-medium text-xs text-white">
                        Gesamt:
                      </span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">
                      {medicine.employeesRequired}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          Number(medicine.employeesRequired || 0) * 5,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white text-xs mb-1">
                  Hauptzutaten
                </h4>
                <div className="flex flex-wrap gap-1">
                  {(medicine.ingredients || []).map((ing, i) => (
                    <span
                      key={`${ing}-${i}`}
                      className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-gray-700 flex justify-end sticky bottom-0 bg-gray-900 z-10">
            <button
              onClick={onClose}
              className="inline-flex items-center px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
            >
              Schließen
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function UpsertMedicineModal({ open, onClose, initial, onSave }) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState({
    name: "",
    category: "Vitamine",
    productionTime: "3 Tage",
    employeesRequired: 8,
    difficulty: "Niedrig",
    ingredients: "",
    description: "",
    status: "Aktive Produktion",
    batchSize: 1000,
    qualityControl: "",
    lastProduced: new Date().toISOString().slice(0, 10),
    imageUrl: "/B12.png",
    imagePublicId: "",
    imageFile: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (open && initial) {
      setForm({
        name: initial.name || "",
        category: initial.category || "Vitamine",
        productionTime: initial.productionTime || "3 Tage",
        employeesRequired: initial.employeesRequired || 8,
        difficulty: initial.difficulty || "Niedrig",
        ingredients: Array.isArray(initial.ingredients)
          ? initial.ingredients.join(", ")
          : initial.ingredients || "",
        description: initial.description || "",
        status: initial.status || "Aktive Produktion",
        batchSize: initial.batchSize || 1000,
        qualityControl: initial.qualityControl || "",
        lastProduced: initial.lastProduced
          ? new Date(initial.lastProduced).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        imageUrl: initial.image || "/B12.png",
        imagePublicId: initial.imagePublicId || "",
        imageFile: null,
      });
    } else if (open) {
      setForm({
        name: "",
        category: "Vitamine",
        productionTime: "3 Tage",
        employeesRequired: 8,
        difficulty: "Niedrig",
        ingredients: "",
        description: "",
        status: "Aktive Produktion",
        batchSize: 1000,
        qualityControl: "",
        lastProduced: new Date().toISOString().slice(0, 10),
        imageUrl: "/B12.png",
        imagePublicId: "",
        imageFile: null,
      });
    }
  }, [open, initial]);

  useEffect(() => {
    if (open) setTimeout(() => firstFieldRef.current?.focus(), 50);
  }, [open]);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name ist erforderlich.");
    if (!form.description.trim())
      return setError("Beschreibung ist erforderlich.");
    if (!form.category.trim()) return setError("Kategorie ist erforderlich.");

    setSaving(true);
    try {
      let image = form.imageUrl;
      let imagePublicId = form.imagePublicId;

      if (form.imageFile) {
        const { url, public_id } = await apiUploadImage(form.imageFile);
        image = url;
        imagePublicId = public_id;
      }

      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        productionTime: form.productionTime,
        employeesRequired: Number(form.employeesRequired) || 0,
        difficulty: form.difficulty,
        ingredients: String(form.ingredients)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        description: form.description.trim(),
        status: form.status,
        batchSize: Number(form.batchSize) || 0,
        qualityControl: form.qualityControl || "—",
        lastProduced: form.lastProduced,
        image,
        imagePublicId,
      };

      await onSave(payload, isEdit ? initial._id : null);
      onClose();
    } catch (err) {
      setError(err?.message || "Medikament konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          <div
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-emerald-950 rounded-lg border border-gray-700 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
              role="dialog"
              aria-modal="true"
            >
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
                <h3 className="text-sm font-semibold text-white">
                  {isEdit ? "Medikament bearbeiten" : "Medikament hinzufügen"}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-gray-800 text-gray-400"
                  aria-label="Modal schließen"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={submit} className="flex-1  custom-scrollbar">
                <div className="p-4 space-y-3">
                  {error && (
                    <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Name *
                      </label>
                      <input
                        ref={firstFieldRef}
                        className="w-full border border-gray-600 rounded px-2 py-1.5 text-xs bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Kategorie *
                      </label>
                      <select
                        className="w-full border border-gray-600 rounded px-2 py-1.5 text-xs bg-gray-800 text-white focus:ring-1 focus:ring-emerald-500"
                        value={form.category}
                        onChange={(e) => update("category", e.target.value)}
                      >
                        <option>Vitamine</option>
                        <option>Schmerzmittel</option>
                        <option>Diabetes</option>
                        <option>Cholesterin</option>
                        <option>GERD</option>
                        <option>Antidepressiva</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Mitarbeiter
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="w-full border border-gray-600 rounded px-2 py-1.5 text-xs bg-gray-800 text-white focus:ring-1 focus:ring-emerald-500"
                          value={form.employeesRequired}
                          onChange={(e) =>
                            update("employeesRequired", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Schwierigkeit
                        </label>
                        <select
                          className="w-full border border-gray-600 rounded px-2 py-1.5 text-xs bg-gray-800 text-white focus:ring-1 focus:ring-emerald-500"
                          value={form.difficulty}
                          onChange={(e) => update("difficulty", e.target.value)}
                        >
                          <option>Niedrig</option>
                          <option>Mittel</option>
                          <option>Hoch</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Beschreibung *
                      </label>
                      <textarea
                        rows={2}
                        className="w-full border border-gray-600 rounded px-2 py-1.5 text-xs bg-gray-800 text-white focus:ring-1 focus:ring-emerald-500"
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Zutaten (kommagetrennt)
                      </label>
                      <input
                        className="w-full border border-gray-600 rounded px-2 py-1.5 text-xs bg-gray-800 text-white focus:ring-1 focus:ring-emerald-500"
                        value={form.ingredients}
                        onChange={(e) => update("ingredients", e.target.value)}
                        placeholder="Cyanocobalamin, Mikrokristalline Cellulose, ..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Chargengröße
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="w-full border border-gray-600 rounded px-2 py-1.5 text-xs bg-gray-800 text-white focus:ring-1 focus:ring-emerald-500"
                          value={form.batchSize}
                          onChange={(e) => update("batchSize", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Produktionszeit
                        </label>
                        <input
                          className="w-full border border-gray-600 rounded px-2 py-1.5 text-xs bg-gray-800 text-white focus:ring-1 focus:ring-emerald-500"
                          value={form.productionTime}
                          onChange={(e) =>
                            update("productionTime", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Produktbild
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              update("imageFile", file);
                              update("imageUrl", URL.createObjectURL(file));
                              update("imagePublicId", "");
                            }
                          }}
                          className="block w-full text-xs text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30"
                        />
                        {form.imageUrl && (
                          <img
                            src={form.imageUrl}
                            alt="Vorschau"
                            className="h-8 w-8 object-contain bg-gray-800 rounded border border-gray-600"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-700 bg-gray-900 sticky bottom-0">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 rounded border border-gray-600 text-xs text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-600 text-xs text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                    >
                      {saving ? (
                        <>
                          <FiSave className="h-3 w-3" /> Wird gespeichert…
                        </>
                      ) : (
                        <>
                          <FiSave className="h-3 w-3" /> Speichern
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =======================  HAUPTSEITE  ======================== */

export default function MedicineProduction() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showUpsert, setShowUpsert] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        const res = await apiListMedicines({
          q: searchTerm,
          category: selectedCategory,
        });
        if (!abort) setData(res.items || []);
      } catch (e) {
        console.error(e);
        if (!abort) setData([]);
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const s = new Set(data.map((m) => m.category));
    return ["All", ...Array.from(s).sort()];
  }, [data]);

  const openMedicine = (m) => {
    setSelectedMedicine(m);
    setShowDetails(true);
  };

  async function handleSave(payload, id = null) {
    if (id) {
      await apiUpdateMedicine(id, payload);
    } else {
      await apiCreateMedicine(payload);
    }
    const res = await apiListMedicines({
      q: searchTerm,
      category: selectedCategory,
    });
    setData(res.items || []);
  }

  async function handleDelete(id) {
    const ok = window.confirm("Medikament löschen?");
    if (!ok) return;
    await apiDeleteMedicine(id);
    const res = await apiListMedicines({
      q: searchTerm,
      category: selectedCategory,
    });
    setData(res.items || []);
  }

  const totalEmployees = useMemo(
    () => data.reduce((sum, m) => sum + (Number(m.employeesRequired) || 0), 0),
    [data]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-emerald-950 p-3">
      <div className="w-full max-w-[95vw] xl:max-w-[1300px] 2xl:max-w-[1850px] mx-auto">
        <header className="mb-4">
          <h1 className="text-base font-bold text-white">Pharma Production</h1>
        </header>
        {/* Stats */}
        <div className="hidden md:grid grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={FiPackage}
            value={data.length}
            label="Medikamente"
            color="border-l-emerald-500"
          />
          <StatCard
            icon={FiUsers}
            value={totalEmployees}
            label="Mitarbeiter"
            color="border-l-teal-500"
          />
          <StatCard
            icon={FiPieChart}
            value={Math.max(categories.length - 1, 0)}
            label="Kategorien"
            color="border-l-green-500"
          />
        </div>

        {/* Controls */}
        <div className="  mb-6">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative  ">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <FiSearch className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Medikamente suchen…"
                className="block w-full pl-8 pr-2 py-1.5 border border-gray-600 rounded text-xs bg-gray-800 text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter dropdown for mobile */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-1.5 rounded border border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                <FiFilter className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Category filter for desktop */}
            <div className="hidden sm:block">
              <select
                className="border border-gray-600 rounded px-2 py-1.5 text-xs bg-gray-800 text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Add button - hidden on mobile */}
            <button
              onClick={() => {
                setEditTarget(null);
                setShowUpsert(true);
              }}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1.5 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-700 transition-colors"
            >
              <FiPlus className="h-3.5 w-3.5" />
              <span>Hinzufügen</span>
            </button>
          </div>

          {/* Mobile filter dropdown */}
          {showFilters && (
            <div className="mt-2 sm:hidden">
              <select
                className="w-full border border-gray-600 rounded px-2 py-1.5 text-xs bg-gray-800 text-white focus:ring-1 focus:ring-emerald-500"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setShowFilters(false);
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <Spinner />
        ) : data.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence>
              {data.map((m) => (
                <MedicineCard
                  key={m._id ?? `${m.name}-${m.batchSize}-${m.lastProduced}`}
                  medicine={m}
                  selected={
                    showDetails &&
                    (selectedMedicine?._id || selectedMedicine?.id) ===
                      (m._id || m.id)
                  }
                  onClick={() => openMedicine(m)}
                  onEdit={() => {
                    setEditTarget(m);
                    setShowUpsert(true);
                  }}
                  onDelete={() => handleDelete(m._id)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-2">
              <FiPackage className="h-full w-full" />
            </div>
            <h3 className="text-xs font-medium text-white">
              Keine Medikamente gefunden
            </h3>
            <p className="mt-1 text-[11px] text-gray-400">
              Passen Sie Ihre Suche oder Filter an
            </p>
          </div>
        )}
      </div>

      {/* Floating Add Button (mobile) */}
      <button
        onClick={() => {
          setEditTarget(null);
          setShowUpsert(true);
        }}
        className="fixed bottom-4 right-4 inline-flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors sm:hidden"
        aria-label="Medikament hinzufügen"
      >
        <FiPlus className="h-5 w-5" />
      </button>

      {/* Modals */}
      <UpsertMedicineModal
        key={editTarget?._id ?? "new"}
        open={showUpsert}
        onClose={() => setShowUpsert(false)}
        initial={editTarget}
        onSave={handleSave}
      />

      <AnimatePresence>
        {showDetails && selectedMedicine && (
          <MedicineModal
            medicine={selectedMedicine}
            onClose={() => setShowDetails(false)}
          />
        )}
      </AnimatePresence>

      {/* Background glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}
