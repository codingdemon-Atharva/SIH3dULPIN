"use client";

import React, { useEffect, useState, useMemo } from "react";
import { PageShell } from "@/src/components/PageShell";
import {
  getPublicNotifications,
  type PublicNotification,
} from "@/src/app/actions/getPublicNotifications";

type CategoryFilter = "ALL" | "System Update" | "Land Records" | "ULPIN" | "Maintenance" | "Public Notice";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<PublicNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Detail Modal
  const [selectedNotification, setSelectedNotification] = useState<PublicNotification | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPublicNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      } else {
        setError(res.error || "Unable to load public notifications.");
      }
    } catch (err) {
      console.error("Error fetching public notifications:", err);
      setError("Unable to load public notifications at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [notifications, selectedCategory, searchQuery]);

  const categories: CategoryFilter[] = [
    "ALL",
    "System Update",
    "Land Records",
    "ULPIN",
    "Maintenance",
    "Public Notice",
  ];

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "System Update":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Land Records":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "ULPIN":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Maintenance":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Public Notice":
        return "bg-teal-100 text-teal-800 border-teal-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <PageShell
      roleMode="PUBLIC_VIEWER"
      userRole={null}
      onRoleModeChange={() => {}}
      activeSection="notifications"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans text-[#162a21]">
        {/* PAGE HEADER */}
        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-[#2d6a4f]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#2d6a4f] uppercase tracking-wider">
                PUBLIC ANNOUNCEMENTS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#162a21] tracking-tight">
              Notifications
            </h1>
            <p className="text-xs font-medium text-[#6b887a] mt-1">
              Public announcements, system updates, and land record notices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchNotifications}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#e2dad0] px-3.5 py-2 text-xs font-bold text-[#2d6a4f] hover:bg-[#f3efe6] transition shadow-xs cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* CONTROLS: SEARCH & CATEGORIES */}
        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b887a]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search notifications by title or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#e2dad0] bg-white pl-10 pr-4 py-2 text-xs text-[#162a21] placeholder-[#6b887a] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20"
              />
            </div>
          </div>

          {/* CATEGORY TABS */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#e2dad0]/60">
            <span className="text-[11px] font-bold text-[#6b887a] mr-1">Category:</span>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "bg-[#2d6a4f] text-white shadow-xs"
                      : "bg-white text-[#3d5a4c] border border-[#e2dad0] hover:bg-[#f3efe6]"
                  }`}
                >
                  {cat === "ALL" ? "All Notices" : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-12 text-center shadow-sm">
            <div className="inline-flex items-center gap-3 rounded-full bg-[#2d6a4f]/10 px-5 py-2 text-xs font-bold text-[#2d6a4f]">
              <span className="h-2 w-2 rounded-full bg-[#2d6a4f] animate-pulse" />
              Loading public notifications...
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-10 text-center shadow-sm space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 text-xl font-bold">
              ⚠️
            </div>
            <h3 className="text-lg font-extrabold text-[#162a21]">
              Unable to Load Notifications
            </h3>
            <p className="text-xs text-[#6b887a] max-w-md mx-auto">{error}</p>
            <button
              type="button"
              onClick={fetchNotifications}
              className="rounded-xl bg-[#2d6a4f] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* EMPTY STATE (NO NOTIFICATIONS IN SYSTEM) */}
        {!loading && !error && notifications.length === 0 && (
          <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-12 text-center shadow-sm space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] text-xl font-bold">
              🔔
            </div>
            <h3 className="text-lg font-extrabold text-[#162a21]">
              No Public Notifications Available
            </h3>
            <p className="text-xs text-[#6b887a] max-w-md mx-auto">
              There are currently no public notices or system announcements published for public citizens.
            </p>
          </div>
        )}

        {/* NO MATCHING RESULTS STATE */}
        {!loading && !error && notifications.length > 0 && filteredNotifications.length === 0 && (
          <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-10 text-center shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-[#162a21]">
              No Matching Notifications Found
            </h3>
            <p className="text-xs text-[#6b887a] max-w-md mx-auto">
              No public notifications match your search query or selected category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
              }}
              className="rounded-xl bg-white border border-[#e2dad0] px-3.5 py-1.5 text-xs font-bold text-[#2d6a4f] hover:bg-[#f3efe6] transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* NOTIFICATIONS LIST */}
        {!loading && !error && filteredNotifications.length > 0 && (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => setSelectedNotification(notification)}
                className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-5 shadow-sm hover:border-[#2d6a4f]/60 hover:bg-white transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold border uppercase tracking-wider ${getCategoryBadgeColor(
                      notification.category
                    )}`}
                  >
                    {notification.category}
                  </span>
                  <span className="text-[11px] font-bold text-[#6b887a]">
                    {notification.date}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#162a21] group-hover:text-[#2d6a4f] transition-colors">
                  {notification.title}
                </h3>

                <p className="text-xs text-[#6b887a] line-clamp-2 leading-relaxed">
                  {notification.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* DETAILS MODAL */}
        {selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#e2dad0] pb-3">
                <span
                  className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold border uppercase tracking-wider ${getCategoryBadgeColor(
                    selectedNotification.category
                  )}`}
                >
                  {selectedNotification.category}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="rounded-lg p-1 text-[#6b887a] hover:text-[#162a21] hover:bg-[#f3efe6] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-[#162a21]">
                  {selectedNotification.title}
                </h3>
                <p className="text-[11px] font-bold text-[#6b887a]">
                  Published: {selectedNotification.date}
                </p>
              </div>

              <div className="rounded-xl border border-[#e2dad0]/70 bg-white p-4 text-xs leading-relaxed text-[#162a21]">
                {selectedNotification.description}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="rounded-xl bg-[#2d6a4f] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
