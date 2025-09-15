"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FiUser, FiHome, FiLogOut, FiSettings } from "react-icons/fi";

export default function UserDropdown() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-600 text-white shadow hover:bg-green-700 transition"
        aria-label="User menu"
      >
        <FiUser className="w-4 h-4" />
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 text-xs transition-all ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-1 pointer-events-none"
        }`}
      >
        {/* User Info */}
        <div className="px-3 py-2 border-b border-gray-100">
          <p className="font-medium text-gray-800 truncate">
            {session.user?.name || "User"}
          </p>
          <p className="text-[11px] text-gray-500 truncate">
            {session.user?.email || ""}
          </p>
        </div>

        {/* Links */}
        <div className="py-1">
          <Link
            href="/"
            className="flex items-center px-3 py-1 hover:bg-gray-50 text-gray-700"
            onClick={() => setOpen(false)}
          >
            <FiHome className="w-3.5 h-3.5 mr-2 text-gray-400" />
            Home
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center px-3 py-1 hover:bg-gray-50 text-gray-700"
            onClick={() => setOpen(false)}
          >
            <FiSettings className="w-3.5 h-3.5 mr-2 text-gray-400" />
            Dashboard
          </Link>
        </div>

        {/* Logout */}
        <div className="border-t border-gray-100">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center w-full px-3 py-1 text-red-600 hover:bg-red-50"
          >
            <FiLogOut className="w-3.5 h-3.5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
