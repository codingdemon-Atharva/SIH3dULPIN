"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SessionUser } from "@/src/lib/auth";

export default function GovernmentDashboardFoundationPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/government/login");
          return;
        }
        const data = await res.json();
        if (
          data.success &&
          data.user &&
          (data.user.role === "GOVERNMENT_OFFICER" ||
            data.user.role === "GOVERNMENT_ADMIN")
        ) {
          setUser(data.user);
        } else {
          router.push("/government/login?error=unauthorized");
        }
      } catch {
        router.push("/government/login");
      } finally {
        setLoading(false);
      }
    }

    loadAuth();
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/government/login");
      router.refresh();
    } catch {
      router.push("/government/login");
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

  return (
    <main className="min-h-screen bg-[#f8f5ee] text-[#162a21]">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#e2dad0] bg-[#fdfbf7] px-6 sm:px-8 text-[#162a21] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b4332] text-sm font-bold text-white shadow-sm">
            BV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-[#162a21]">
                BhuVista
              </span>
              <span className="rounded bg-[#2d6a4f] px-2 py-0.5 text-[10px] font-bold text-white">
                GOVERNMENT PORTAL
              </span>
            </div>
            <p className="text-[10px] font-semibold tracking-wider text-[#3d5a4c]">
              3D LAND INTELLIGENCE PLATFORM • MINISTRY OF RURAL DEVELOPMENT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-[#162a21]">{user.name}</span>
            <span className="text-[10px] text-[#6b887a]">{user.email}</span>
          </div>

          <span className="rounded-lg border border-[#e2dad0] bg-white px-2.5 py-1 text-xs font-bold text-[#2d6a4f]">
            {user.role}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto p-6 sm:p-10 space-y-8">
        {/* Banner */}
        <div className="rounded-3xl border border-[#2d6a4f]/30 bg-[#0f2d21] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2d6a4f] px-3.5 py-1 text-xs font-extrabold text-[#b7e4c7] border border-[#52b788]/30">
              <span>🏛️</span> Phase 11 — Security & Role Architecture Verified
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Government Authentication Established
            </h1>

            <p className="text-sm text-[#a8c3b5] max-w-2xl leading-relaxed">
              You have successfully authenticated as an authorized government user. The secure permission boundary between the Public Viewer, Cadastral Surveyor Portal, and Government Area is operational.
            </p>
          </div>
        </div>

        {/* User Identity Card */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#162a21] flex items-center gap-2 border-b border-[#e2dad0] pb-3">
            <span>🛡️</span> Authenticated Government Session Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl bg-[#f8f5ee] p-3.5 border border-[#e2dad0]">
              <span className="block text-[10px] font-bold text-[#6b887a] uppercase tracking-wider">
                Official Name
              </span>
              <span className="mt-1 block font-bold text-[#162a21]">
                {user.name}
              </span>
            </div>

            <div className="rounded-xl bg-[#f8f5ee] p-3.5 border border-[#e2dad0]">
              <span className="block text-[10px] font-bold text-[#6b887a] uppercase tracking-wider">
                Government Email
              </span>
              <span className="mt-1 block font-bold text-[#162a21]">
                {user.email}
              </span>
            </div>

            <div className="rounded-xl bg-[#f8f5ee] p-3.5 border border-[#e2dad0]">
              <span className="block text-[10px] font-bold text-[#6b887a] uppercase tracking-wider">
                Role Boundary
              </span>
              <span className="mt-1 block font-bold text-[#2d6a4f]">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* System Architecture Notice */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-xs text-amber-900 space-y-3">
          <h3 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
            <span>ℹ️</span> Phase 11 Foundation Confirmation
          </h3>
          <p className="leading-relaxed">
            The Government access control layer enforces server-side authorization on all <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">/government/*</code> routes. Unauthenticated users and public viewers are redirected away server-side.
          </p>
          <p className="font-semibold text-amber-950">
            Next Recommended Step: Proceed to Government Phase 12 — Government Dashboard UI Foundation.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex justify-between items-center pt-4 border-t border-[#e2dad0]">
          <Link
            href="/"
            className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1"
          >
            ← View Public Map Viewer
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
          >
            Sign Out of Government Portal
          </button>
        </div>
      </div>
    </main>
  );
}
