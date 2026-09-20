"use client";

import React from "react";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import Link from "next/link";

export default function GovernmentUlpinRegistryPage() {
  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <GovernmentPageHeader
        title="3D ULPIN Registry"
        description="National 14-digit Unique Land Parcel Identification Number management portal."
      />

      <div className="rounded-2xl border border-[#e2dad0] bg-white p-8 text-center space-y-4 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2d6a4f]/10 text-[#2d6a4f]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 10h.01M7 13h.01M10 7h.01M10 10h.01M10 13h.01M10 16h.01M13 10h.01M13 13h.01M13 16h.01M16 7h.01M16 10h.01M16 13h.01M16 16h.01M4 21h16a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v16a1 1 0 001 1z" />
          </svg>
        </div>
        <h2 className="text-lg font-extrabold text-[#162a21]">
          3D ULPIN Registry Module
        </h2>
        <p className="text-xs text-[#6b887a] max-w-md mx-auto leading-relaxed">
          Full Government ULPIN Registry Management will be active in Phase 15. High-level ULPIN assignment counts can be viewed in the Government Dashboard Overview.
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
