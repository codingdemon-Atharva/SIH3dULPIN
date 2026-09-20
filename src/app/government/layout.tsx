"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { SessionUser } from "@/src/lib/auth";

interface GovernmentLayoutProps {
  children: React.ReactNode;
}

export default function GovernmentLayout({ children }: GovernmentLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lang, setLang] = useState<"EN" | "HI">("EN");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (
          data.success &&
          data.user &&
          (data.user.role === "GOVERNMENT_OFFICER" ||
            data.user.role === "GOVERNMENT_ADMIN")
        ) {
          if (isMounted) {
            setUser(data.user);
            setLoading(false);
          }
        } else {
          router.push("/login?error=unauthorized");
        }
      } catch {
        router.push("/login");
      }
    }

    loadAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#081a12] flex items-center justify-center text-[#52b788] text-xs font-bold p-4">
        Verifying Government Authorization...
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const navGroups = [
    {
      title: "GOVERNMENT",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/government/dashboard" },
      ],
    },
    {
      title: "LAND MANAGEMENT",
      items: [
        { id: "land-parcels", label: "Land Parcels", href: "/government/land-parcels" },
        { id: "property-registry", label: "Property Registry", href: "/government/property-registry" },
        { id: "ulpin-registry", label: "ULPIN Registry", href: "/government/ulpin-registry" },
      ],
    },
    {
      title: "GIS & VISUALIZATION",
      items: [
        { id: "cadastral-map", label: "Cadastral Map", href: "/government/cadastral-map" },
        { id: "3d-land-map", label: "3D Land Map", href: "/government/3d-land-map" },
      ],
    },
    {
      title: "VERIFICATION",
      items: [
        { id: "pending-verification", label: "Pending Verification", href: "/government/pending-verification" },
        { id: "surveyor-submissions", label: "Surveyor Submissions", href: "/government/surveyor-submissions" },
        { id: "validation", label: "Validation", href: "/government/validation" },
      ],
    },
    {
      title: "ANALYTICS",
      items: [
        { id: "land-analytics", label: "Land Analytics", href: "/government/land-analytics" },
        { id: "reports", label: "Reports", href: "/government/reports" },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { id: "notifications", label: "Notifications", href: "/government/notifications" },
        { id: "downloads", label: "Downloads", href: "/government/downloads" },
        { id: "settings", label: "Settings", href: "/government/settings" },
        { id: "help-support", label: "Help & Support", href: "/government/help-support" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f5ee] text-[#162a21] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#e2dad0] bg-[#fdfbf7] px-6 sm:px-8 text-[#162a21] shadow-sm">
        <div className="flex items-center gap-4 min-w-[220px]">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Navigation Sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2dad0] bg-white text-[#2d6a4f] hover:bg-[#f3efe6] transition cursor-pointer shadow-sm"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <img
            src="/mord-logo.png"
            alt="Ministry of Rural Development"
            className="h-12 w-auto max-w-[200px] object-contain"
          />
        </div>

        <div className="flex items-center gap-3">
          <img
            src="/bhuvista-logo.png"
            alt="BhuVista Logo"
            className="h-10 w-auto object-contain"
          />
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-[#162a21]">
                BhuVista
              </span>
              <span className="rounded bg-[#2d6a4f] px-2 py-0.5 text-[10px] font-bold text-white">
                GOVERNMENT PORTAL
              </span>
            </div>
            <p className="text-[10px] font-semibold tracking-wider text-[#3d5a4c] hidden sm:block">
              3D LAND INTELLIGENCE PLATFORM • MINISTRY OF RURAL DEVELOPMENT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end min-w-[200px]">
          {/* Language Selector */}
          <button
            type="button"
            onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[#e2dad0] bg-white px-3 text-xs font-semibold text-[#2d6a4f] hover:bg-[#f3efe6] transition cursor-pointer shadow-sm"
          >
            <span>🌐</span>
            <span>{lang === "EN" ? "English" : "हिंदी"}</span>
          </button>

          {/* Government Notice/Notification Indicator */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Government Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2dad0] bg-white text-[#2d6a4f] hover:bg-[#f3efe6] transition relative cursor-pointer shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[#e2dad0] bg-white p-3.5 text-xs text-[#162a21] shadow-xl z-50">
                <div className="flex items-center justify-between border-b border-[#e2dad0] pb-2">
                  <p className="font-bold text-[#2d6a4f]">
                    Government Notices
                  </p>
                </div>
                <div className="py-3 text-[#3d5a4c] space-y-2">
                  <p>• Government Authorization boundary active.</p>
                  <p>• Server-side session verification enforced.</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Control */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfile(!showProfile)}
              className="flex h-9 items-center gap-2 rounded-xl border border-[#e2dad0] bg-white px-3 text-xs font-medium text-[#162a21] hover:bg-[#f3efe6] transition cursor-pointer shadow-sm"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1b4332] text-[10px] font-bold text-white">
                GO
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-bold text-[#162a21] leading-tight">{user.name}</span>
                <span className="text-[9px] text-[#6b887a] leading-tight">{user.role}</span>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#e2dad0] bg-white p-3.5 text-xs text-[#162a21] shadow-xl z-50 space-y-2">
                <div className="border-b border-[#e2dad0] pb-2">
                  <p className="font-bold text-[#162a21]">{user.name}</p>
                  <p className="text-[10px] text-[#6b887a]">{user.email}</p>
                  <span className="mt-1 inline-block rounded bg-[#2d6a4f]/10 px-2 py-0.5 text-[9px] font-bold text-[#2d6a4f]">
                    {user.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-red-50 px-3 py-2 text-left font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Direct Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer hidden md:block"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-20 bottom-0 z-40 flex flex-col border-r border-[#e2dad0] bg-[#fdfbf7] text-[#162a21] transition-all duration-300 ease-in-out ${
            sidebarOpen ? "w-[260px]" : "w-16"
          }`}
        >
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                {sidebarOpen && (
                  <div className="px-3 text-[10px] font-black uppercase tracking-widest text-[#6b887a]">
                    {group.title}
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        title={!sidebarOpen ? item.label : undefined}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition cursor-pointer ${
                          isActive
                            ? "bg-[#2d6a4f] text-white shadow-sm font-bold"
                            : "text-[#162a21] hover:bg-[#f3efe6] hover:text-[#2d6a4f]"
                        } ${!sidebarOpen ? "justify-center" : ""}`}
                      >
                        {sidebarOpen ? (
                          <span className="truncate">{item.label}</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase">
                            {item.label.substring(0, 2)}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {sidebarOpen && (
            <div className="border-t border-[#e2dad0] p-4 bg-[#f8f5ee] text-[#2d6a4f]">
              <div className="flex flex-col gap-0.5 text-center">
                <span className="text-xs font-extrabold tracking-tight text-[#162a21]">
                  Ministry of Rural Development
                </span>
                <span className="text-[10px] font-semibold text-[#3d5a4c]">
                  Government of India
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-[260px]" : "ml-16"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
