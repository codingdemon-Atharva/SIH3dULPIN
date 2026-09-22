"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import {
  getGovernmentNotifications,
  type GovernmentNotification,
} from "@/src/app/actions/government";
import { useLanguage } from "@/src/context/LanguageContext";
import Link from "next/link";

export default function GovernmentNotificationsPage() {
  const { lang, t } = useLanguage();
  const [notifications, setNotifications] = useState<GovernmentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());

  // Load local read IDs
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedRead = localStorage.getItem("bhuvista_read_notifs");
        if (savedRead) {
          setReadNotifIds(new Set(JSON.parse(savedRead)));
        }
      } catch {
        // Fallback to empty
      }
    }
  }, []);

  const saveReadNotifs = (newSet: Set<string>) => {
    setReadNotifIds(newSet);
    if (typeof window !== "undefined") {
      localStorage.setItem("bhuvista_read_notifs", JSON.stringify(Array.from(newSet)));
    }
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGovernmentNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      } else {
        setError(res.error || "Failed to retrieve internal notifications.");
      }
    } catch (err) {
      console.error("Error fetching internal notifications:", err);
      setError("Unable to load notifications at this time.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = (id: string) => {
    const next = new Set(readNotifIds);
    next.add(id);
    saveReadNotifs(next);
  };

  const markAllAsRead = () => {
    const next = new Set(readNotifIds);
    notifications.forEach((n) => next.add(n.id));
    saveReadNotifs(next);
  };

  // Category Options
  const categories = [
    { key: "ALL", label: t.categoryAll },
    { key: "Verification", label: t.categoryVerification },
    { key: "Submissions", label: t.categorySubmission },
    { key: "Validation", label: t.categoryValidation },
    { key: "ULPIN Registry", label: t.categoryUlpin },
  ];

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.referenceId.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [notifications, selectedCategory, searchQuery]);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Verification":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Submissions":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Validation":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "ULPIN Registry":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto font-sans text-[#162a21]">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2dad0] pb-6">
        <GovernmentPageHeader
          title={t.notificationsTitle}
          description={t.notificationsDesc}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchNotifications}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e2dad0] bg-white px-3.5 py-2 text-xs font-bold text-[#2d6a4f] hover:bg-[#f3efe6] transition shadow-xs cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t.refresh}
          </button>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-xs cursor-pointer"
            >
              ✓ {t.markAllAsRead}
            </button>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-4">
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
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#e2dad0] bg-[#fdfbf7] pl-10 pr-4 py-2.5 text-xs text-[#162a21] placeholder-[#6b887a] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 transition"
            />
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#e2dad0]/60">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? "bg-[#2d6a4f] text-white shadow-xs"
                    : "bg-[#f8f5ee] text-[#3d5a4c] border border-[#e2dad0] hover:bg-[#f3efe6]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-12 text-center shadow-sm">
          <div className="inline-flex items-center gap-3 rounded-full bg-[#2d6a4f]/10 px-5 py-2 text-xs font-bold text-[#2d6a4f]">
            <span className="h-2 w-2 rounded-full bg-[#2d6a4f] animate-pulse" />
            {t.loading}
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700 font-bold">
            ⚠️
          </div>
          <p className="text-xs font-bold text-red-800">{error}</p>
          <button
            type="button"
            onClick={fetchNotifications}
            className="rounded-xl bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* EMPTY STATE - NO NOTIFICATIONS IN SYSTEM */}
      {!loading && !error && notifications.length === 0 && (
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-12 text-center shadow-sm space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2d6a4f]/10 text-[#2d6a4f]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-base font-extrabold text-[#162a21]">
            {t.noNotifications}
          </h3>
          <p className="text-xs text-[#6b887a] max-w-md mx-auto leading-relaxed">
            {t.noNotificationsDesc}
          </p>
        </div>
      )}

      {/* FILTERED RESULTS EMPTY STATE */}
      {!loading && !error && notifications.length > 0 && filteredNotifications.length === 0 && (
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-10 text-center shadow-sm space-y-3">
          <h3 className="text-base font-extrabold text-[#162a21]">
            No Notifications Match Your Filter
          </h3>
          <p className="text-xs text-[#6b887a] max-w-md mx-auto">
            Try adjusting your search query or switching to another notification category tab.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
            }}
            className="rounded-xl border border-[#e2dad0] bg-white px-3.5 py-1.5 text-xs font-bold text-[#2d6a4f] hover:bg-[#f3efe6] transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* NOTIFICATIONS LIST */}
      {!loading && !error && filteredNotifications.length > 0 && (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const isRead = readNotifIds.has(notification.id);
            return (
              <div
                key={notification.id}
                className={`rounded-2xl border p-5 shadow-sm transition space-y-2 relative ${
                  isRead
                    ? "border-[#e2dad0] bg-white text-[#162a21]"
                    : "border-[#2d6a4f]/40 bg-[#f8fcf9] text-[#162a21]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!isRead && (
                      <span className="h-2 w-2 rounded-full bg-[#2d6a4f]" title="Unread Notification" />
                    )}
                    <span
                      className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold border uppercase tracking-wider ${getCategoryBadgeColor(
                        notification.category
                      )}`}
                    >
                      {notification.category}
                    </span>
                    <span className="text-[11px] font-mono text-[#6b887a]">
                      ID: {notification.referenceId.substring(0, 12)}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-[#6b887a]">
                    {notification.timestamp ? new Date(notification.timestamp).toLocaleString() : ""}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-[#162a21]">
                    {notification.title}
                  </h3>
                  <p className="text-xs text-[#3d5a4c] mt-1 leading-relaxed">
                    {notification.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#e2dad0]/50">
                  {notification.targetUrl ? (
                    <Link
                      href={notification.targetUrl}
                      onClick={() => markAsRead(notification.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#2d6a4f] hover:underline cursor-pointer"
                    >
                      {t.openRecord}
                    </Link>
                  ) : (
                    <div />
                  )}

                  {!isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      className="text-[11px] font-bold text-[#6b887a] hover:text-[#162a21] cursor-pointer"
                    >
                      ✓ {t.markAsRead}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
