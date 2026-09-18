"use client";

import React from "react";

interface SidebarProps {
  isOpen: boolean;
  activeSection?: string;
  onSelectSection?: (sectionId: string) => void;
  roleMode: "PUBLIC_VIEWER" | "SURVEYOR" | "UPLOADER";
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar({
  isOpen,
  activeSection = "dashboard",
  onSelectSection,
  roleMode,
}: SidebarProps) {
  const navGroups: NavGroup[] = [
    {
      title: "HOME",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "LAND",
      items: [
        {
          id: "property-search",
          label: "Property Search",
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ),
        },
        {
          id: "cadastral-map",
          label: "Cadastral Map",
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          ),
        },
        {
          id: "3d-property-map",
          label: "3D Property Map",
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          badge: "3D",
        },
        {
          id: "ulpin-registry",
          label: "ULPIN Registry",
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          id: "land-records",
          label: "Land Records",
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "TOOLS",
      items: [
        {
          id: "downloads",
          label: "Downloads",
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          ),
        },
        {
          id: "notifications",
          label: "Notifications",
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "OTHER",
      items: [
        {
          id: "help-support",
          label: "Help & Support",
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r border-[#1f3a2f] bg-[#0f2d21] text-white transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Active Role Indicator */}
      <div className="border-b border-[#1f3a2f] p-3 bg-[#14382a]/50">
        {isOpen ? (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a8c3b5]">
              Active Portal
            </span>
            <span className="rounded bg-[#255943] px-2 py-0.5 text-[9px] font-bold text-[#52b788]">
              {roleMode}
            </span>
          </div>
        ) : (
          <div className="flex justify-center text-[10px] font-bold text-[#52b788]">
            {roleMode.charAt(0)}
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {isOpen && (
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#6c8a7b]">
                {group.title}
              </div>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSection && onSelectSection(item.id)}
                    title={!isOpen ? item.label : undefined}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-[#1b4332] text-white border-l-4 border-[#52b788] shadow-sm"
                        : "text-[#a8c3b5] hover:bg-[#14382a] hover:text-white"
                    } ${!isOpen ? "justify-center" : ""}`}
                  >
                    <span className="shrink-0 text-[#52b788]">{item.icon}</span>

                    {isOpen && (
                      <span className="flex-1 truncate text-left">{item.label}</span>
                    )}

                    {isOpen && item.badge && (
                      <span className="rounded bg-[#2d6a4f] px-1.5 py-0.5 text-[9px] font-bold text-[#b7e4c7]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / System Status */}
      {isOpen && (
        <div className="border-t border-[#1f3a2f] p-3 text-[10px] text-[#6c8a7b]">
          <div className="flex items-center justify-between">
            <span>BhuVista Engine v1.0</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          </div>
        </div>
      )}
    </aside>
  );
}
