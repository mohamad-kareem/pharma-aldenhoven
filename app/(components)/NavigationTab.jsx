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
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="flex gap-1 overflow-x-auto p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isActiveTab(tab.href);

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
