"use client";

import React from "react";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import Link from "next/link";

export default function GovernmentNotificationsPage() {
  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <GovernmentPageHeader
        title="Government Notifications"
        description="Official alerts, inter-departmental notices, and verification queue alerts."
      />

      <div className="rounded-2xl border border-[#e2dad0] bg-white p-8 text-center space-y-4 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2d6a4f]/10 text-[#2d6a4f]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h2 className="text-lg font-extrabold text-[#162a21]">
          Government Notifications Module
        </h2>
        <p className="text-xs text-[#6b887a] max-w-md mx-auto leading-relaxed">
          Government Notifications & Communication features will be active in Phase 21. High-level dashboard notices can be viewed in the header menu.
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
