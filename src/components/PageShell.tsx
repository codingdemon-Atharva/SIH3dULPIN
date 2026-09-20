"use client";

import React, { useState } from "react";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";

interface PageShellProps {
  children: React.ReactNode;
  roleMode: "PUBLIC_VIEWER" | "SURVEYOR" | "UPLOADER";
  userRole: "VIEWER" | "SURVEYOR" | null;
  onRoleModeChange: (mode: "PUBLIC_VIEWER" | "SURVEYOR" | "UPLOADER") => void;
  activeSection?: string;
  onSelectSection?: (sectionId: string) => void;
}

export function PageShell({
  children,
  roleMode,
  userRole,
  onRoleModeChange,
  activeSection = "dashboard",
  onSelectSection,
}: PageShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen w-full max-w-vw overflow-x-hidden bg-[#f8f5ee] text-[#162a21] flex flex-col font-sans">
      {/* HEADER */}
      <AppHeader
        roleMode={roleMode}
        userRole={userRole}
        onRoleModeChange={onRoleModeChange}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* BODY: SIDEBAR + MAIN CONTENT */}
      <div className="flex flex-1 relative w-full pt-0">
        {/* SIDEBAR */}
        <Sidebar
          isOpen={isSidebarOpen}
          roleMode={roleMode}
          activeSection={activeSection}
          onSelectSection={onSelectSection}
        />

        {/* MAIN CONTENT CONTAINER */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out min-w-0 ${
            roleMode === "PUBLIC_VIEWER" ? "p-0" : "p-4 sm:p-6 lg:p-8"
          } ${isSidebarOpen ? "ml-[260px]" : "ml-16"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
