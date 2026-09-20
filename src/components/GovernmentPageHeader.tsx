"use client";

import React from "react";

interface GovernmentPageHeaderProps {
  title: string;
  description: string;
  badgeText?: string;
  action?: React.ReactNode;
}

export function GovernmentPageHeader({
  title,
  description,
  badgeText = "MINISTRY OF RURAL DEVELOPMENT • GOVERNMENT OF INDIA",
  action,
}: GovernmentPageHeaderProps) {
  return (
    <div className="rounded-2xl border border-[#2d6a4f]/20 bg-gradient-to-r from-[#0f2d21] via-[#1b4332] to-[#2d6a4f] p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
      {/* Background Subtle Grid Effect */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#52b788_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md bg-[#2d6a4f]/60 px-3 py-1 text-[11px] font-bold text-[#b7e4c7] border border-[#52b788]/30 tracking-wider uppercase">
            <svg
              className="w-3.5 h-3.5 text-[#52b788]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>{badgeText}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-[#b7e4c7]/90 leading-relaxed">
            {description}
          </p>
        </div>

        {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
      </div>
    </div>
  );
}
