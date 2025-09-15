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
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-sm font-medium shadow-sm hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label="User menu"
      >
        {getUserInitials()}
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 text-sm transition-all z-50 ${
          open
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-1"
        }`}
      >
        {/* User Info */}
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="font-medium text-gray-800 truncate text-xs">
            {session.user?.name || "User"}
          </p>
        </div>

        {/* Navigation Links */}
        <div className="py-1">
          <Link
            href="/"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs"
            onClick={() => setOpen(false)}
          >
            <FiHome className="w-3.5 h-3.5 mr-2 text-gray-400" />
            Home
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs"
            onClick={() => setOpen(false)}
          >
            <FiSettings className="w-3.5 h-3.5 mr-2 text-gray-400" />
            Dashboard
          </Link>
        </div>

        {/* Logout Button */}
        <div className="border-t border-gray-100 pt-1">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 text-xs"
          >
            <FiLogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
