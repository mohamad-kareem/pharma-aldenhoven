"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FiUser,
  FiHome,
  FiLogOut,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";

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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!session.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Enhanced Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-1 py-1  rounded-xl bg-gradient-to-r from-green-800 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-3 focus:ring-green-400 focus:ring-opacity-50"
        aria-label="User menu"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-green-300">
          {getUserInitials()}
        </div>
        <FiChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Modern Dropdown Menu */}
      <div
        className={`absolute right-0 mt-1 w-42 bg-green-100 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-300 py-2 text-sm transition-all duration-200 z-50 ${
          open
            ? "opacity-100 visible translate-y-0 scale-100"
            : "opacity-0 invisible -translate-y-2 scale-95"
        }`}
      >
        {/* Enhanced User Info */}
        <div className="px-4 py-3 border-b border-green-300 flex items-center gap-3 bg-gradient-to-r from-green-50/50 to-emerald-50/30 rounded-t-xl">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm shadow-md">
            {getUserInitials()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate text-sm">
              {session.user?.name || "User"}
            </p>
          </div>
        </div>

        {/* Enhanced Navigation Links */}
        <div className="py-2 px-2">
          <Link
            href="/"
            className="flex items-center px-3 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 group mx-1"
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors mr-3">
              <FiHome className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Home</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center px-3 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 group mx-1"
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors mr-3">
              <FiSettings className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
        </div>

        {/* Enhanced Logout Button */}
        <div className="border-t border-green-300 pt-2 px-2">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center w-full px-3  rounded-xl text-red-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group mx-1"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-700 group-hover:bg-red-200 transition-colors mr-3">
              <FiLogOut className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/5 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
