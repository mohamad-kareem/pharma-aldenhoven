"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!session) {
    router.push("/signin");
    return null;
  }

  const cards = [
    {
      title: "Schedules",
      href: "/schedule?tab=weekly",
      color: "bg-green-100",
    },
    {
      title: "Medicine Lines",
      href: "/medicine",
      color: "bg-blue-100",
    },
    {
      title: "Employees",
      href: "/schedule?tab=employees",
      color: "bg-yellow-100",
    },
    { title: "Settings", href: "/settings", color: "bg-purple-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          Dashboard
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Willkommen, {session.user.name} 🌿
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`${card.color} p-6 rounded-xl shadow hover:shadow-lg transition`}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-gray-600">Navigate to {card.title}.</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
