"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function NotesModal({
  date,
  week,
  year,
  onClose,
  onNotesChanged,
}) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");

  // Load notes when date changes
  useEffect(() => {
    fetch(`/api/notes?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        setNotes(data);
        onNotesChanged?.(data); // sync with parent
      });
  }, [date]);

  // Add a new note
  async function addNote() {
    if (!text.trim()) return;
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, week, year, text }),
    });
    const newNote = await res.json();

    if (!newNote.error) {
      const updated = [newNote, ...notes];
      setNotes(updated);
      onNotesChanged?.(updated); // sync with parent
      setText("");
    }
  }

  // Delete a note
  async function deleteNote(id) {
    const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      const updated = notes.filter((n) => n._id !== id);
      setNotes(updated);
      onNotesChanged?.(updated); // sync with parent
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-5 animate-fadeIn border border-green-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-xs sm:text-base text-green-800">
            📒 Notizen für {date} (KW {week}/{year})
          </h3>
          <button onClick={onClose} className="ml-2">
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 bg-green-100 hover:bg-green-300 border rounded-lg" />
          </button>
        </div>

        {/* Notes list */}
        <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar mb-4 pr-1">
          {notes.length > 0 ? (
            notes.map((n) => (
              <div
                key={n._id}
                className="flex justify-between items-start bg-green-100 rounded-lg p-2.5 shadow-sm border border-green-100"
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-800 leading-snug">{n.text}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {n.author || "Unbekannt"} •{" "}
                    {new Date(n.createdAt).toLocaleString("de-DE")}
                  </p>
                </div>
                <button
                  onClick={() => deleteNote(n._id)}
                  className="ml-2 text-red-500 hover:text-red-700 text-xs font-medium"
                >
                  Löschen
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-xs italic text-center py-4">
              Keine Notizen vorhanden
            </p>
          )}
        </div>

        {/* Input */}
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Neue Notiz hinzufügen…"
            className="w-full border border-green-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
            rows={4}
          />
          <button
            onClick={addNote}
            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            + Notiz speichern
          </button>
        </div>
      </div>
    </div>
  );
}
