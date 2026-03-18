"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Car, LayoutDashboard, Settings, LogOut, Activity, CalendarDays, PencilLine, Star, CalendarRange } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const navGroups = [
  {
    label: "MANAGE",
    items: [
      { name: "Overview", href: "/admin", icon: LayoutDashboard },
      { name: "Fleet", href: "/admin/fleet", icon: Car },
      { name: "Reservations", href: "/admin/reservations", icon: CalendarDays },
      { name: "Calendar", href: "/admin/calendar", icon: CalendarRange },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { name: "Reviews", href: "/admin/reviews", icon: Star },
      { name: "Site Content", href: "/admin/content", icon: PencilLine },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings },
      { name: "Status", href: "/admin/status", icon: Activity },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-60 bg-white border-r border-gray-200 md:min-h-screen flex-col justify-between hidden md:flex">
        <div className="p-5">
          <Link href="/" className="flex items-center gap-3 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Empire Cars Logo" className="h-9 w-auto object-contain" />
            <span className="font-semibold text-base tracking-tight">Admin</span>
          </Link>

          <nav className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-bold text-gray-400 tracking-widest px-4 mb-1.5">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                          isActive
                            ? "bg-gray-100 text-black"
                            : "text-gray-500 hover:text-black hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-5 border-t border-gray-100">
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Nav Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Empire Cars Logo" className="h-8 w-auto object-contain" />
          <span className="font-semibold text-base tracking-tight">Admin</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
