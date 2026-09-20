"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import {
  getGovernmentActivityHistory,
  GovernmentActivityItem,
  GovernmentActivityMetrics,
} from "@/src/app/actions/government";

export default function GovernmentActivityLogPage() {
  const [items, setItems] = useState<GovernmentActivityItem[]>([]);
  const [metrics, setMetrics] = useState<GovernmentActivityMetrics | null>(null);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [filterEventType, setFilterEventType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterUser, setFilterUser] = useState("ALL");

  // Inspection Drawer/Modal State
  const [selectedEvent, setSelectedEvent] = useState<GovernmentActivityItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGovernmentActivityHistory({
        search,
        filterEventType,
        filterStatus,
        filterUser,
        page,
        limit: 10,
        sortOrder: "desc",
      });

      if (res.success && res.data) {
        setItems(res.data.items);
        setMetrics(res.data.metrics);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setAvailableUsers(res.data.availableUsers || []);
      } else {
        setError(res.error || "Failed to load internal activity history.");
      }
    } catch (err) {
      console.error("Failed to fetch activity log:", err);
      setError("An unexpected network error occurred while loading activity log.");
    } finally {
      setLoading(false);
    }
  }, [search, filterEventType, filterStatus, filterUser, page]);

  useEffect(() => {
    let ignore = false;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getGovernmentActivityHistory({
          search,
          filterEventType,
          filterStatus,
          filterUser,
          page,
          limit: 10,
          sortOrder: "desc",
        });

        if (!ignore) {
          if (res.success && res.data) {
            setItems(res.data.items);
            setMetrics(res.data.metrics);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
            setAvailableUsers(res.data.availableUsers || []);
          } else {
            setError(res.error || "Failed to load internal activity history.");
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch activity log:", err);
          setError("An unexpected network error occurred while loading activity log.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      ignore = true;
    };
  }, [search, filterEventType, filterStatus, filterUser, page]);

  const handleClearFilters = () => {
    setSearch("");
    setFilterEventType("ALL");
    setFilterStatus("ALL");
    setFilterUser("ALL");
    setPage(1);
  };

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "RECORD_APPROVED":
        return <span className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">APPROVED</span>;
      case "RECORD_REJECTED":
        return <span className="rounded-md bg-rose-100 px-2 py-1 text-[10px] font-extrabold text-rose-800 border border-rose-200">REJECTED</span>;
      case "BUILDING_SUBMITTED":
        return <span className="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-extrabold text-amber-800 border border-amber-200">SUBMISSION</span>;
      case "ULPIN_ASSIGNED":
        return <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-extrabold text-blue-800 border border-blue-200">3D ULPIN</span>;
      case "PROPERTY_REGISTERED":
        return <span className="rounded-md bg-teal-100 px-2 py-1 text-[10px] font-extrabold text-teal-800 border border-teal-200">PROPERTY</span>;
      case "USER_REGISTERED":
        return <span className="rounded-md bg-purple-100 px-2 py-1 text-[10px] font-extrabold text-purple-800 border border-purple-200">USER ACCESS</span>;
      default:
        return <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-extrabold text-gray-800 border border-gray-200">{type}</span>;
    }
  };

  const getCategoryBadge = (category: string) => {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8f5ee] px-2.5 py-0.5 text-[10px] font-bold text-[#2d6a4f] border border-[#e2dad0]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#2d6a4f]" />
        <span>{category}</span>
      </span>
    );
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <GovernmentPageHeader
        title="Activity & Audit History"
        description="Official internal audit log tracking real application events, verification actions, surveyor submissions, and 3D ULPIN assignments."
        action={
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh Audit Trail</span>
          </button>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-xs text-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-red-950">Audit Log Retrieval Failed</h3>
              <p className="text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 transition text-xs shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b887a]">
            Total Derived Events
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#162a21]">
            {loading ? "..." : (metrics?.totalEvents ?? 0)}
          </div>
          <p className="text-[11px] text-[#6b887a] font-semibold">
            Recorded across database records
          </p>
        </div>

        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b887a]">
            Verification Actions
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2d6a4f]">
            {loading ? "..." : (metrics?.verificationEvents ?? 0)}
          </div>
          <p className="text-[11px] text-[#2d6a4f] font-semibold">
            Approvals & field rejections
          </p>
        </div>

        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b887a]">
            3D ULPIN Events
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-900">
            {loading ? "..." : (metrics?.ulpinEvents ?? 0)}
          </div>
          <p className="text-[11px] text-blue-700 font-semibold">
            Spatial identity assignments
          </p>
        </div>

        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b887a]">
            Property Unit Logs
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#162a21]">
            {loading ? "..." : (metrics?.propertyEvents ?? 0)}
          </div>
          <p className="text-[11px] text-[#6b887a] font-semibold">
            Registered 3D floor units
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#e2dad0] pb-3">
          <h2 className="text-xs font-bold text-[#162a21] uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-[#2d6a4f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter Activity History</span>
          </h2>
          {(search || filterEventType !== "ALL" || filterStatus !== "ALL" || filterUser !== "ALL") && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Reset Filters</span>
              <span>×</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Query */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#6b887a] uppercase mb-1">
              Search Text
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Record ID, ULPIN, Name..."
              className="w-full rounded-xl border border-[#e2dad0] bg-[#fdfbf7] px-3 py-2 text-xs font-semibold text-[#162a21] focus:border-[#2d6a4f] focus:outline-none"
            />
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#6b887a] uppercase mb-1">
              Event Action
            </label>
            <select
              value={filterEventType}
              onChange={(e) => {
                setFilterEventType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[#e2dad0] bg-[#fdfbf7] px-3 py-2 text-xs font-semibold text-[#162a21] focus:border-[#2d6a4f] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Event Actions</option>
              <option value="BUILDING_SUBMITTED">Structure Submissions</option>
              <option value="RECORD_APPROVED">Verification Approvals</option>
              <option value="RECORD_REJECTED">Verification Rejections</option>
              <option value="PROPERTY_REGISTERED">Property Unit Registrations</option>
              <option value="ULPIN_ASSIGNED">3D ULPIN Identity Assignments</option>
              <option value="USER_REGISTERED">User Account Authorizations</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#6b887a] uppercase mb-1">
              Status Result
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[#e2dad0] bg-[#fdfbf7] px-3 py-2 text-xs font-semibold text-[#162a21] focus:border-[#2d6a4f] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status Results</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="REJECTED">Rejected</option>
              <option value="ASSIGNED">Assigned</option>
            </select>
          </div>

          {/* User / Surveyor Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#6b887a] uppercase mb-1">
              Performed By
            </label>
            <select
              value={filterUser}
              onChange={(e) => {
                setFilterUser(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[#e2dad0] bg-[#fdfbf7] px-3 py-2 text-xs font-semibold text-[#162a21] focus:border-[#2d6a4f] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Users & System Engines</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Activity Log Table */}
      <div className="rounded-2xl border border-[#e2dad0] bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#e2dad0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#162a21]">
              Audit Trail Entries
            </h2>
            <p className="text-xs text-[#6b887a]">
              Showing {total.toLocaleString()} total verified activity entries
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-[#6b887a] space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#2d6a4f] border-t-transparent" />
            <p>Loading internal activity log records...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6b887a] space-y-3 bg-[#fdfbf7]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f8f5ee] text-[#2d6a4f]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-extrabold text-[#162a21] text-sm">No activity events found</p>
            <p className="max-w-md mx-auto text-[#6b887a]">
              No derived application events matched your current search and filter criteria.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-block rounded-xl bg-[#2d6a4f] px-4 py-2 font-bold text-white hover:bg-[#1b4332] transition cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2dad0] bg-[#f8f5ee] text-[10px] font-extrabold uppercase tracking-wider text-[#6b887a]">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action / Event</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Affected Entity</th>
                  <th className="py-3.5 px-4">Performed By</th>
                  <th className="py-3.5 px-4">Result Status</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2dad0] text-[#162a21]">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#fdfbf7] transition cursor-pointer group"
                    onClick={() => setSelectedEvent(item)}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-[#6b887a]">
                      {new Date(item.timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#162a21]">
                      <div className="flex flex-col">
                        <span>{item.actionLabel}</span>
                        <span className="font-mono text-[10px] text-[#6b887a] font-normal">
                          {item.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getCategoryBadge(item.category)}
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <div className="flex flex-col truncate">
                        <span className="font-extrabold text-[#162a21] truncate">
                          {item.entityName}
                        </span>
                        {item.ulpin ? (
                          <span className="font-mono text-[10px] text-[#2d6a4f] font-bold truncate">
                            {item.ulpin}
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-[#6b887a] truncate">
                            ID: {item.entityId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d6a4f]/10 text-[10px] font-bold text-[#2d6a4f]">
                          {item.performedBy.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-[#162a21]">
                          {item.performedBy.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getEventTypeBadge(item.status || item.eventType)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(item);
                        }}
                        className="rounded-lg border border-[#e2dad0] bg-white px-2.5 py-1 text-[11px] font-bold text-[#2d6a4f] hover:bg-[#2d6a4f] hover:text-white transition shadow-sm cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#e2dad0] bg-[#f8f5ee] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#6b887a]">
            <span>
              Page <strong className="text-[#162a21]">{page}</strong> of{" "}
              <strong className="text-[#162a21]">{totalPages}</strong> ({total} items)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-[#e2dad0] bg-white px-3 py-1.5 text-xs font-bold text-[#162a21] hover:bg-[#f3efe6] disabled:opacity-50 transition cursor-pointer shadow-sm"
              >
                ← Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-[#e2dad0] bg-white px-3 py-1.5 text-xs font-bold text-[#162a21] hover:bg-[#f3efe6] disabled:opacity-50 transition cursor-pointer shadow-sm"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Event Inspection Drawer / Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#e2dad0] rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#e2dad0] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#6b887a]">
                    Audit Log Inspection
                  </span>
                  {getCategoryBadge(selectedEvent.category)}
                </div>
                <h3 className="text-lg font-extrabold text-[#162a21] mt-1">
                  {selectedEvent.actionLabel}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2dad0] bg-[#f8f5ee] text-[#162a21] hover:bg-[#e2dad0] transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Event Key Fields */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0] space-y-1">
                <span className="block text-[10px] font-bold text-[#6b887a] uppercase">Event Identifier</span>
                <span className="font-mono text-xs font-extrabold text-[#162a21]">{selectedEvent.id}</span>
              </div>

              <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0] space-y-1">
                <span className="block text-[10px] font-bold text-[#6b887a] uppercase">Recorded Timestamp</span>
                <span className="font-mono text-xs font-bold text-[#162a21]">
                  {new Date(selectedEvent.timestamp).toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "medium",
                  })}
                </span>
              </div>

              <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0] space-y-1">
                <span className="block text-[10px] font-bold text-[#6b887a] uppercase">Affected Record</span>
                <span className="font-bold text-[#162a21] block truncate">{selectedEvent.entityName}</span>
                <span className="font-mono text-[10px] text-[#6b887a] block truncate">ID: {selectedEvent.entityId}</span>
              </div>

              <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0] space-y-1">
                <span className="block text-[10px] font-bold text-[#6b887a] uppercase">Performed By</span>
                <span className="font-bold text-[#162a21] block truncate">{selectedEvent.performedBy.name}</span>
                <span className="font-mono text-[10px] text-[#2d6a4f] block truncate">ID: {selectedEvent.performedBy.id}</span>
              </div>
            </div>

            {/* ULPIN Information if present */}
            {selectedEvent.ulpin && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-blue-900 tracking-wider">
                  Associated 3D ULPIN Identity
                </span>
                <div className="font-mono text-sm font-black text-blue-950">
                  {selectedEvent.ulpin}
                </div>
              </div>
            )}

            {/* Metadata JSON Inspection */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#162a21] uppercase tracking-wider block">
                Derived Event Metadata
              </span>
              <pre className="rounded-xl bg-[#081a12] p-4 font-mono text-[11px] text-[#52b788] overflow-x-auto border border-[#1b4332]">
                {JSON.stringify(selectedEvent.metadata, null, 2)}
              </pre>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between border-t border-[#e2dad0] pt-4">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl border border-[#e2dad0] bg-white px-4 py-2 text-xs font-bold text-[#162a21] hover:bg-[#f3efe6] transition cursor-pointer"
              >
                Close Window
              </button>

              <Link
                href={selectedEvent.targetUrl}
                className="rounded-xl bg-[#2d6a4f] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>View Affected Record in Portal</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
