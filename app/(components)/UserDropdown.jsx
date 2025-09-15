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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!session) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        aria-label="User menu"
      >
        <div className="w-10 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <FiUser className="w-5 h-5" />
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
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

      <div
        className={`absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-800 truncate">
            {session.user?.name || "User"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {session.user?.email || ""}
          </p>
        </div>

        <div className="p-2">
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
            onClick={() => setOpen(false)}
          >
            <FiHome className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" />
            Home
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
            onClick={() => setOpen(false)}
          >
            <FiSettings className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" />
            Dashboard
          </Link>
        </div>

        <div className="p-2 border-t border-gray-100">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
          >
            <FiLogOut className="w-4 h-4 mr-3 group-hover:animate-pulse" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
