"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/context/LanguageContext";

interface SidebarProps {
  isOpen: boolean;
  activeSection?: string;
  onSelectSection?: (sectionId: string) => void;
  onToggleSidebar?: () => void;
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
  onToggleSidebar,
  roleMode,
}: SidebarProps) {
  const router = useRouter();

  const handleItemClick = (itemId: string) => {
    if (onSelectSection) {
      onSelectSection(itemId);
    }

    if (itemId === "ulpin-registry") {
      router.push("/ulpin-registry");
    } else if (itemId === "land-records") {
      router.push("/land-records");
    } else if (itemId === "downloads") {
      router.push("/downloads");
    } else if (itemId === "notifications") {
      router.push("/notifications");
    } else if (itemId === "help-support") {
      router.push("/help-support");
    } else if (
      itemId === "home" ||
      itemId === "property-search" ||
      itemId === "cadastral-map" ||
      itemId === "3d-property-map"
    ) {
      router.push("/");
    }
  };

  const { t } = useLanguage();

  const navGroups: NavGroup[] = [
    {
      title: t.navHomeGroup,
      items: [
        {
          id: "home",
          label: t.navHome,
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
      ],
    },
    {
      title: t.navLandGroup,
      items: [
        {
          id: "property-search",
          label: t.navPropertySearch,
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ),
        },
        {
          id: "cadastral-map",
          label: t.navCadastralMap,
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          ),
        },
        {
          id: "3d-property-map",
          label: t.nav3dPropertyMap,
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          badge: "3D",
        },
        {
          id: "ulpin-registry",
          label: t.navUlpinRegistry,
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          id: "land-records",
          label: t.navLandRecords,
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          ),
        },
      ],
    },
    {
      title: t.navToolsGroup,
      items: [
        {
          id: "downloads",
          label: t.navDownloads,
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          ),
        },
        {
          id: "notifications",
          label: t.navNotifications,
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
        },
      ],
    },
    {
      title: t.navOtherGroup,
      items: [
        {
          id: "help-support",
          label: t.navHelpSupport,
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
        },
      ],
    },
  ];

  const isPublicViewer = roleMode === "PUBLIC_VIEWER";

  return (
    <aside
      className={`fixed left-0 top-20 bottom-0 z-40 flex flex-col border-r border-[#e2dad0] bg-[#fdfbf7] text-[#162a21] transition-all duration-300 ease-in-out ${
        isOpen ? "w-[260px]" : "w-16"
      }`}
    >
      {/* Sidebar Header & Toggle Row */}
      <div className="border-b border-[#e2dad0] p-2.5 bg-[#f8f5ee] flex items-center justify-between">
        {isOpen ? (
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3d5a4c]">
              {!isPublicViewer ? `Active Portal: ${roleMode}` : "Navigation"}
            </span>
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2dad0] bg-white text-[#2d6a4f] hover:bg-[#f3efe6] transition cursor-pointer shadow-xs"
              >
                ◀
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2dad0] bg-white text-[#2d6a4f] hover:bg-[#f3efe6] transition cursor-pointer shadow-xs"
              >
                ▶
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            {isOpen && (
              <div className="px-3 text-[10px] font-black uppercase tracking-widest text-[#6b887a]">
                {group.title}
              </div>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeSection === item.id || (activeSection === "dashboard" && item.id === "home");
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    title={!isOpen ? item.label : undefined}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? "bg-[#2d6a4f] text-white shadow-sm font-bold"
                        : "text-[#162a21] hover:bg-[#f3efe6] hover:text-[#2d6a4f]"
                    } ${!isOpen ? "justify-center" : ""}`}
                  >
                    <span className={`shrink-0 ${isActive ? "text-white" : "text-[#2d6a4f]"}`}>
                      {item.icon}
                    </span>

                    {isOpen && (
                      <span className="flex-1 truncate text-left">{item.label}</span>
                    )}

                    {isOpen && item.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-[#2d6a4f]/10 text-[#2d6a4f]"
                      }`}>
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

      {/* Sidebar Footer / Tagline */}
      {isOpen && (
        <div className="border-t border-[#e2dad0] p-4 bg-[#f8f5ee] text-[#2d6a4f]">
          <div className="flex flex-col gap-0.5 text-center">
            <span className="text-xs font-extrabold tracking-tight text-[#162a21]">
              {t.taglineTitle}
            </span>
            <span className="text-[10px] font-semibold text-[#3d5a4c]">
              {t.taglineSub}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
