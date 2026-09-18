"use client";

import React, { useState } from "react";

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

  const isPublicViewer = roleMode === "PUBLIC_VIEWER";

  return (
    <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#e2dad0] bg-[#fdfbf7] px-6 sm:px-8 text-[#162a21] shadow-sm relative">
      {/* LEFT SECTION: Ministry of Rural Development Logo */}
      <div className="flex items-center gap-4 min-w-[200px] z-10">
        {!isPublicViewer && onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2dad0] bg-white text-[#2d6a4f] hover:bg-[#f3efe6] transition cursor-pointer shadow-sm"
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

        <div className="flex items-center">
          <img
            src="/mord-logo.png"
            alt="Ministry of Rural Development - Government of India"
            className="h-11 w-auto max-w-[180px] object-contain"
          />
        </div>
      </div>

      {/* CENTER SECTION: BhuVista Logo & Subtitle (Visually centered relative to full width) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <img
            src="/bhuvista-logo.png"
            alt="BhuVista Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="text-2xl font-black tracking-tight text-[#162a21] font-sans">
            BhuVista
          </span>
        </div>
        <span className="text-[10px] font-bold tracking-widest text-[#2d6a4f] uppercase mt-0.5">
          3D LAND INTELLIGENCE PLATFORM
        </span>
      </div>

      {/* RIGHT SECTION: Controls */}
      <div className="flex items-center gap-3 justify-end min-w-[200px] z-10">
        {/* Portal Mode Switcher (Hidden in Public Viewer mode to match reference) */}
        {!isPublicViewer && (
          <div className="flex rounded-xl bg-[#f0ebe1] p-1 border border-[#e2dad0]">
            <button
              type="button"
              onClick={() => onRoleModeChange("PUBLIC_VIEWER")}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer text-[#3d5a4c] hover:text-[#162a21]"
            >
              Viewer
            </button>

            {userRole === "SURVEYOR" && (
              <button
                type="button"
                onClick={() => onRoleModeChange("SURVEYOR")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  roleMode === "SURVEYOR"
                    ? "bg-[#b8860b] text-white shadow-sm"
                    : "text-[#3d5a4c] hover:text-[#162a21]"
                }`}
              >
                Surveyor
              </button>
            )}

            <button
              type="button"
              onClick={() => onRoleModeChange("UPLOADER")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                roleMode === "UPLOADER"
                  ? "bg-[#255943] text-white shadow-sm"
                  : "text-[#3d5a4c] hover:text-[#162a21]"
              }`}
            >
              Uploader
            </button>
          </div>
        )}

        {/* Language Selector */}
        <button
          type="button"
          onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-[#e2dad0] bg-white px-3 text-xs font-semibold text-[#2d6a4f] hover:bg-[#f3efe6] transition cursor-pointer shadow-sm"
        >
          <span>🌐</span>
          <span>{lang === "EN" ? "English" : "हिंदी"}</span>
        </button>

        {/* Notification Control (Shown only in non-public portal) */}
        {!isPublicViewer && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2dad0] bg-white text-[#2d6a4f] hover:bg-[#f3efe6] transition relative cursor-pointer shadow-sm"
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
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-600"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[#e2dad0] bg-white p-3 text-xs text-[#162a21] shadow-xl z-50">
                <p className="font-bold border-b border-[#e2dad0] pb-2 text-[#2d6a4f]">
                  Notifications
                </p>
                <div className="py-2 space-y-2 text-[#3d5a4c]">
                  <p>
                    • Cadastral survey record updated for ULPIN registry.
                  </p>
                  <p>
                    • System operating in 3D Volumetric Cadastre mode.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile / Account Control */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="flex h-9 items-center gap-2 rounded-xl border border-[#e2dad0] bg-white px-3 text-xs font-medium text-[#162a21] hover:bg-[#f3efe6] transition cursor-pointer shadow-sm"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d6a4f] text-[10px] font-bold text-white">
              {userRole === "SURVEYOR" ? "SV" : "PV"}
            </div>
            <span className="font-semibold text-[#162a21]">
              {userRole === "SURVEYOR" ? "Surveyor" : "Public Viewer"}
            </span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#e2dad0] bg-white p-3 text-xs text-[#162a21] shadow-xl z-50">
              <div className="border-b border-[#e2dad0] pb-2">
                <p className="font-bold text-[#162a21]">BhuVista Session</p>
                <p className="text-[10px] text-[#3d5a4c]">
                  Role: {userRole || "PUBLIC_VIEWER"}
                </p>
              </div>
              <div className="pt-2 space-y-1">
                {userRole === "SURVEYOR" && isPublicViewer && (
                  <button
                    type="button"
                    onClick={() => {
                      onRoleModeChange("SURVEYOR");
                      setShowProfile(false);
                    }}
                    className="w-full text-left rounded-lg px-2 py-1.5 text-[#2d6a4f] font-bold hover:bg-[#f3efe6]"
                  >
                    Switch to Surveyor Portal
                  </button>
                )}
                <a
                  href="/login"
                  className="block rounded-lg px-2 py-1.5 text-[#3d5a4c] hover:bg-[#f3efe6] hover:text-[#162a21]"
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
