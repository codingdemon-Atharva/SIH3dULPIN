"use client";

import React from "react";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import Link from "next/link";

export default function GovernmentSettingsPage() {
  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <GovernmentPageHeader
        title="Government System Settings"
        description="Departmental configuration, role governance, and portal security parameters."
      />

      <div className="rounded-2xl border border-[#e2dad0] bg-white p-8 text-center space-y-4 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2d6a4f]/10 text-[#2d6a4f]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-extrabold text-[#162a21]">
          Government Settings Module
        </h2>
        <p className="text-xs text-[#6b887a] max-w-md mx-auto leading-relaxed">
          Full Government Administration & Settings will be active in Phase 22. Server-side session security is currently active.
        </p>
        <div className="pt-2">
          <Link
            href="/government/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1b4332] transition"
          >
            ← Back to Dashboard Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
