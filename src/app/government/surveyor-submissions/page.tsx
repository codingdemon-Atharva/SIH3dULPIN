"use client";

import React from "react";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import Link from "next/link";

export default function GovernmentSurveyorSubmissionsPage() {
  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <GovernmentPageHeader
        title="Surveyor Field Submissions"
        description="Audit and verification of field survey uploads from certified cadastral surveyors."
      />

      <div className="rounded-2xl border border-[#e2dad0] bg-white p-8 text-center space-y-4 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2d6a4f]/10 text-[#2d6a4f]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-lg font-extrabold text-[#162a21]">
          Surveyor Submissions Module
        </h2>
        <p className="text-xs text-[#6b887a] max-w-md mx-auto leading-relaxed">
          Full Government Verification & Approval Workflow features will be active in Phase 17. High-level approval counts can be viewed in the Government Dashboard Overview.
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
