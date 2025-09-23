"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, ClipboardList } from "lucide-react";

export default function NavigationTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      key: "schichtplan",
      label: "Schichtplan",
      href: "/schichtplan",
      icon: ClipboardList,
    },
    {
      key: "urlaub",
      label: "Urlaubsplanung",
      href: "/Urlaubsplanung",
      icon: Calendar,
    },
    {
      key: "employees",
      label: "Mitarbeiter",
      href: "/Mitarbeiter",
      icon: Users,
    },
  ];

  const isActiveTab = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="">
      <div className="flex gap-1 overflow-hidden p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isActiveTab(tab.href);

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex items-center gap-1 px-1 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all
                ${
                  isActive
                    ? "bg-gradient-to-br from-gray-900 to-emerald-700 border border-green-600 text-white shadow-sm"
                    : "text-inherit hover:bg-black/10 hover:text-inherit"
                }`}
            >
              <Icon className="hidden sm:inline w-3.5 h-3.5 opacity-80" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
