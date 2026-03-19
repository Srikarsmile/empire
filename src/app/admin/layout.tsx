"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Car, LayoutDashboard, Settings, LogOut, Activity, CalendarDays, PencilLine, Star, CalendarRange, Menu, X } from "lucide-react";
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

function NavItems({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
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
                  onClick={onClose}
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
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="w-full md:w-60 bg-white border-r border-gray-200 md:min-h-screen flex-col justify-between hidden md:flex">
        <div className="p-5">
          <Link href="/" className="flex items-center gap-3 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Empire Cars Logo" className="h-9 w-auto object-contain" />
            <span className="font-semibold text-base tracking-tight">Admin</span>
          </Link>

          <NavItems pathname={pathname} />
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
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Empire Cars Logo" className="h-8 w-auto object-contain" />
          <span className="font-semibold text-base tracking-tight">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <button
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation overlay"
          />
          <div className="fixed top-[4.25rem] right-0 bottom-0 w-64 z-40 bg-white border-l border-gray-200 p-5 overflow-y-auto md:hidden shadow-xl animate-slide-in-right">
            <NavItems pathname={pathname} onClose={() => setMobileOpen(false)} />

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                  router.push("/");
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
