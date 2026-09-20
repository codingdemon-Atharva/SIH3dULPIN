"use client";

import React from "react";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import Link from "next/link";

export default function GovernmentPropertyRegistryPage() {
  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <GovernmentPageHeader
        title="Property Registry"
        description="Official 3D property records, floor plans, and unit ownership attributes."
      />

      <div className="rounded-2xl border border-[#e2dad0] bg-white p-8 text-center space-y-4 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2d6a4f]/10 text-[#2d6a4f]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-lg font-extrabold text-[#162a21]">
          Property Registry Module
        </h2>
        <p className="text-xs text-[#6b887a] max-w-md mx-auto leading-relaxed">
          Full Government Property Registry features will be active in Phase 14. High-level property metrics can be viewed in the Government Dashboard Overview.
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
