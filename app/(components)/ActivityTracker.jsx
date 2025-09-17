// app/(components)/ActivityTracker.jsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    console.log("➡️ ActivityTracker triggered on path:", pathname); // 🔍 Debug
    const logActivity = async () => {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pathname }),
        credentials: "include",
      });
      console.log("➡️ POST /api/activities status:", res.status); // 🔍 Debug
    };

    if (pathname && pathname !== "/signin") {
      logActivity();
    }
  }, [pathname]);

  return null;
}
