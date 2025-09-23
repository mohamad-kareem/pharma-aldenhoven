"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiChevronDown,
  FiSettings,
  FiHome,
  FiLogOut,
} from "react-icons/fi";

export default function UserDropdown() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

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
    <div className="fixed top-2 right-4 z-[9999]" ref={dropdownRef}>
      <div className="relative">
        {/* Avatar Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 p-0.5 rounded-full bg-gradient-to-br from-green-900 to-emerald-900 backdrop-blur-md border border-green-700 hover:border-green-400/50 shadow-lg hover:shadow-green-500/10 transition-all duration-300"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-semibold ring-2 ring-green-900">
            {getUserInitials()}
          </div>
          <FiChevronDown
            className={`w-4 h-4 text-gray-200 transition-transform duration-300 mr-1 ${
              open ? "rotate-180" : ""
            }`}
          />
        </motion.button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-1 w-35 sm:w-45 bg-gradient-to-br from-green-950 to-gray-950 backdrop-blur-xl shadow-xl rounded-xl py-4 z-50 border border-green-700/50 overflow-hidden"
            >
              {/* User info */}
              <div className="px-4  border-b border-green-800 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-gray-400" />
                <p className="text-base font-medium text-gray-400 truncate">
                  {session.user?.name || "User"}
                </p>
              </div>

              {/* Links */}
              <div className="py-1.5">
                <Link
                  href="/dashboard"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-green-500/10 hover:text-green-400 transition-all duration-200 group"
                  onClick={() => setOpen(false)}
                >
                  <FiSettings className="w-4 h-4 mr-3 text-gray-400 group-hover:text-green-400 transition-colors" />
                  Dashboard
                </Link>
                <Link
                  href="/"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-green-500/10 hover:text-green-400 transition-all duration-200 group"
                  onClick={() => setOpen(false)}
                >
                  <FiHome className="w-4 h-4 mr-3 text-gray-400 group-hover:text-green-400 transition-colors" />
                  Homepage
                </Link>
              </div>

              {/* Sign Out */}
              <div className="px-4 py-1 border-t border-green-800">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center w-full px-1 mt-1 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition-all duration-200 group"
                >
                  <FiLogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
