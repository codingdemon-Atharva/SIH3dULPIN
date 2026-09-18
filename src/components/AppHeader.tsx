"use client";

import React, { useState } from "react";
import Image from "next/image";

interface AppHeaderProps {
  roleMode: "PUBLIC_VIEWER" | "SURVEYOR" | "UPLOADER";
  userRole: "VIEWER" | "SURVEYOR" | null;
  onRoleModeChange: (mode: "PUBLIC_VIEWER" | "SURVEYOR" | "UPLOADER") => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function AppHeader({
  roleMode,
  userRole,
  onRoleModeChange,
  onToggleSidebar,
  isSidebarOpen = true,
}: AppHeaderProps) {
  const [lang, setLang] = useState<"EN" | "HI">("EN");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#1f3a2f] bg-[#0f2d21]/95 px-4 sm:px-6 backdrop-blur-md text-white shadow-md">
      {/* LEFT SECTION: Toggle, Govt Emblem Slot, BhuVista Branding */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1f3a2f] bg-[#14382a] text-[#a8c3b5] hover:bg-[#1b4332] hover:text-white transition cursor-pointer"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isSidebarOpen
                    ? "M4 6h16M4 12h16M4 18h7"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        )}

        {/* Official Ministry Asset Container Slot */}
        <div className="hidden md:flex items-center gap-3 border-r border-[#1f3a2f] pr-4">
          <img
            src="/mord-logo.png"
            alt="Ministry of Rural Development - Government of India"
            className="h-9 w-auto max-w-[160px] object-contain bg-white px-2 py-0.5 rounded-md shadow-sm"
          />
        </div>

        {/* Center / Primary BhuVista Branding */}
        <div className="flex items-center gap-3">
          <img
            src="/bhuvista-logo.png"
            alt="BhuVista Logo"
            className="h-9 w-auto max-w-[140px] object-contain rounded-md shadow-sm"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-wide text-white font-sans">
                BhuVista
              </span>
              <span className="hidden xl:inline-block rounded-full bg-[#1b4332] px-2 py-0.5 text-[9px] font-bold text-[#52b788] border border-[#255943]">
                NATIONAL GIS
              </span>
            </div>
            <span className="text-[10px] font-semibold tracking-wider text-[#a8c3b5] uppercase">
              3D LAND INTELLIGENCE PLATFORM
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Mode Switcher, Language, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Role/Portal Mode Switcher */}
        <div className="flex rounded-xl bg-[#081a12] p-1 border border-[#1f3a2f]">
          <button
            type="button"
            onClick={() => onRoleModeChange("PUBLIC_VIEWER")}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              roleMode === "PUBLIC_VIEWER"
                ? "bg-[#2d6a4f] text-white shadow-sm"
                : "text-[#a8c3b5] hover:text-white"
            }`}
          >
            Viewer
          </button>

          {userRole === "SURVEYOR" && (
            <button
              type="button"
              onClick={() => onRoleModeChange("SURVEYOR")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                roleMode === "SURVEYOR"
                  ? "bg-[#b8860b] text-white shadow-sm"
                  : "text-[#a8c3b5] hover:text-white"
              }`}
            >
              Surveyor
            </button>
          )}

          <button
            type="button"
            onClick={() => onRoleModeChange("UPLOADER")}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              roleMode === "UPLOADER"
                ? "bg-[#255943] text-white shadow-sm"
                : "text-[#a8c3b5] hover:text-white"
            }`}
          >
            Uploader
          </button>
        </div>

        {/* Language Selector */}
        <button
          type="button"
          onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
          className="hidden sm:flex h-9 items-center gap-1.5 rounded-lg border border-[#1f3a2f] bg-[#14382a] px-3 text-xs font-semibold text-[#a8c3b5] hover:bg-[#1b4332] hover:text-white transition cursor-pointer"
        >
          <span>🌐</span>
          <span>{lang === "EN" ? "English" : "हिंदी"}</span>
        </button>

        {/* Notification Control */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1f3a2f] bg-[#14382a] text-[#a8c3b5] hover:bg-[#1b4332] hover:text-white transition relative cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[#1f3a2f] bg-[#0f2d21] p-3 text-xs text-white shadow-xl z-50">
              <p className="font-bold border-b border-[#1f3a2f] pb-2 text-[#52b788]">
                Notifications
              </p>
              <div className="py-2 space-y-2">
                <p className="text-[#a8c3b5]">
                  • Cadastral survey record updated for ULPIN registry.
                </p>
                <p className="text-[#a8c3b5]">
                  • System operating in 3D Volumetric Cadastre mode.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile / Account Control */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="flex h-9 items-center gap-2 rounded-lg border border-[#1f3a2f] bg-[#14382a] px-2.5 text-xs font-medium text-white hover:bg-[#1b4332] transition cursor-pointer"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d6a4f] text-[10px] font-bold">
              {userRole === "SURVEYOR" ? "SV" : "PV"}
            </div>
            <span className="hidden sm:inline-block font-semibold">
              {userRole === "SURVEYOR" ? "Surveyor" : "Public Viewer"}
            </span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#1f3a2f] bg-[#0f2d21] p-3 text-xs text-white shadow-xl z-50">
              <div className="border-b border-[#1f3a2f] pb-2">
                <p className="font-bold text-white">BhuVista Session</p>
                <p className="text-[10px] text-[#a8c3b5]">
                  Role: {userRole || "PUBLIC_VIEWER"}
                </p>
              </div>
              <div className="pt-2 space-y-1">
                <a
                  href="/login"
                  className="block rounded-lg px-2 py-1.5 text-[#a8c3b5] hover:bg-[#14382a] hover:text-white"
                >
                  Sign In / Switch Role
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
