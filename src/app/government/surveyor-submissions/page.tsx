"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import { SurveyorUploadWorkspace } from "@/src/components/SurveyorUploadWorkspace";
import {
  getSurveyorSubmissions,
  SurveyorSubmissionItem,
  SurveyorSubmissionsListResult,
} from "@/src/app/actions/government";

export default function SurveyorSubmissionsPage() {
  const [data, setData] = useState<SurveyorSubmissionsListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and Search States
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Detail Modal State
  const [selectedRecord, setSelectedRecord] = useState<SurveyorSubmissionItem | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSurveyorSubmissions({
        search: activeSearch,
        filterStatus,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load surveyor submissions.");
      }
    } catch (err) {
      console.error("Error fetching surveyor submissions:", err);
      setError("An unexpected network error occurred while loading submissions.");
    } finally {
      setLoading(false);
    }
  }, [activeSearch, filterStatus, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await getSurveyorSubmissions({
          search: activeSearch,
          filterStatus,
          page,
          limit,
          sortBy,
          sortOrder,
        });

        if (isMounted) {
          if (res.success && res.data) {
            setData(res.data);
            setError(null);
          } else {
            setError(res.error || "Failed to load surveyor submissions.");
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching surveyor submissions:", err);
        if (isMounted) {
          setError("An unexpected network error occurred while loading submissions.");
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeSearch, filterStatus, page, limit, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(search);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setActiveSearch("");
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setActiveSearch("");
    setFilterStatus("ALL");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const metrics = data?.metrics;
  const hasActiveFilters =
    activeSearch !== "" ||
    filterStatus !== "ALL" ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  return (
    <div className="p-6 sm:p-8 space-y-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <GovernmentPageHeader
        title="Surveyor Submissions Workspace"
        description="Upload 2D land/cadastral files, parse geometry, validate topology, and submit records to the verification queue."
        action={
          <button
            type="button"
            onClick={fetchSubmissions}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer disabled:opacity-50"
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
            <span>Refresh Workspace</span>
          </button>
        }
      />

      {/* 2D Land File Upload Section */}
      <section className="space-y-4">
        <SurveyorUploadWorkspace onSubmissionSuccess={fetchSubmissions} />
      </section>

      {/* My Submissions Section */}
      <section className="space-y-6 border-t border-[#e2dad0] pt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#162a21]">My Submissions</h2>
            <p className="text-xs text-[#6b887a] mt-0.5">
              Review history and status of cadastral 2D files submitted under your surveyor account.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#2d6a4f] bg-[#2d6a4f]/10 px-3 py-1.5 rounded-xl">
            <span>Server-side Isolated Records</span>
          </div>
        </div>

        {/* Submissions Overview Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => {
              setFilterStatus("ALL");
              setPage(1);
            }}
            className={`rounded-2xl border p-5 text-left transition cursor-pointer shadow-sm ${
              filterStatus === "ALL"
                ? "border-[#2d6a4f] bg-[#2d6a4f]/10 ring-2 ring-[#2d6a4f]/20"
                : "border-[#e2dad0] bg-white hover:bg-[#fdfbf7]"
            }`}
          >
            <div className="flex items-center justify-between text-[#2d6a4f] mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                Total Submissions
              </span>
              <span className="h-2 w-2 rounded-full bg-[#2d6a4f]" />
            </div>
            <div className="text-2xl font-extrabold text-[#162a21]">
              {metrics ? metrics.totalSubmissions : "—"}
            </div>
            <p className="text-[10px] text-[#6b887a] mt-1">Submitted 2D records</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterStatus("PENDING_REVIEW");
              setPage(1);
            }}
            className={`rounded-2xl border p-5 text-left transition cursor-pointer shadow-sm ${
              filterStatus === "PENDING_REVIEW"
                ? "border-amber-400 bg-amber-50/80 ring-2 ring-amber-400/30"
                : "border-[#e2dad0] bg-white hover:bg-[#fdfbf7]"
            }`}
          >
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                Pending Review
              </span>
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="text-2xl font-extrabold text-[#162a21]">
              {metrics ? metrics.pendingCount : "—"}
            </div>
            <p className="text-[10px] text-[#6b887a] mt-1">In verification queue</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterStatus("APPROVED");
              setPage(1);
            }}
            className={`rounded-2xl border p-5 text-left transition cursor-pointer shadow-sm ${
              filterStatus === "APPROVED"
                ? "border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-400/30"
                : "border-[#e2dad0] bg-white hover:bg-[#fdfbf7]"
            }`}
          >
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                Approved
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-[#162a21]">
              {metrics ? metrics.approvedCount : "—"}
            </div>
            <p className="text-[10px] text-[#6b887a] mt-1">Officially verified & 3D ULPIN set</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterStatus("REJECTED");
              setPage(1);
            }}
            className={`rounded-2xl border p-5 text-left transition cursor-pointer shadow-sm ${
              filterStatus === "REJECTED"
                ? "border-rose-400 bg-rose-50/80 ring-2 ring-rose-400/30"
                : "border-[#e2dad0] bg-white hover:bg-[#fdfbf7]"
            }`}
          >
            <div className="flex items-center justify-between text-rose-800 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                Rejected
              </span>
              <span className="h-2 w-2 rounded-full bg-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-[#162a21]">
              {metrics ? metrics.rejectedCount : "—"}
            </div>
            <p className="text-[10px] text-[#6b887a] mt-1">Boundary revision required</p>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-xs text-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 shrink-0 font-bold">
                ✕
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-red-950">Unable to Load Submissions</h3>
                <p className="text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchSubmissions}
              className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 transition text-xs shrink-0 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search submissions by Location Name, ID, Survey Number, Land Use..."
                  className="w-full rounded-xl border border-[#e2dad0] bg-[#f8f5ee] pl-10 pr-9 py-2.5 text-xs text-[#162a21] placeholder-[#6b887a] outline-none focus:border-[#2d6a4f] focus:bg-white transition"
                />
                <svg
                  className="w-4 h-4 text-[#6b887a] absolute left-3.5 top-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-2.5 text-[#6b887a] hover:text-[#162a21] text-xs font-bold"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#2d6a4f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1b4332] transition cursor-pointer shadow-sm"
              >
                Search
              </button>
            </form>

            {/* Filters & Sorting */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              {/* Status Select */}
              <div className="flex items-center gap-1.5 min-w-[160px]">
                <label className="text-[11px] font-bold text-[#6b887a] shrink-0">Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-3 py-2 text-xs font-bold text-[#162a21] outline-none focus:border-[#2d6a4f] cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Sort Select */}
              <div className="flex items-center gap-1.5 min-w-[170px]">
                <label className="text-[11px] font-bold text-[#6b887a] shrink-0">Sort By:</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order as "asc" | "desc");
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-3 py-2 text-xs font-bold text-[#162a21] outline-none focus:border-[#2d6a4f] cursor-pointer"
                >
                  <option value="createdAt-desc">Newest Submissions</option>
                  <option value="createdAt-asc">Oldest Submissions</option>
                  <option value="name-asc">Structure Name (A-Z)</option>
                  <option value="name-desc">Structure Name (Z-A)</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-3 py-2 text-xs font-bold text-[#6b887a] hover:bg-[#e2dad0]/50 hover:text-[#162a21] transition cursor-pointer shrink-0"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Submissions Table View */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white shadow-sm overflow-hidden">
          {/* Table Header Info Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2dad0] bg-[#fdfbf7]">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#162a21]">
                Submitted Cadastral Records
              </h2>
              {data && (
                <span className="rounded-full bg-[#2d6a4f]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#2d6a4f]">
                  {data.total} Total
                </span>
              )}
            </div>

            {activeSearch && (
              <span className="text-xs text-[#6b887a]">
                Results for &quot;<span className="font-bold text-[#162a21]">{activeSearch}</span>&quot;
              </span>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-12 text-center space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-[#2d6a4f]/10 px-5 py-2 text-xs font-bold text-[#2d6a4f]">
                <span className="h-2 w-2 rounded-full bg-[#2d6a4f] animate-pulse" />
                Loading your submissions...
              </div>
            </div>
          )}

          {/* Empty State - No Submissions */}
          {!loading && data && data.total === 0 && !activeSearch && filterStatus === "ALL" && (
            <div className="p-12 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f5ee] border border-[#e2dad0] text-[#6b887a]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#162a21]">No submissions yet</h3>
                <p className="text-xs text-[#6b887a] max-w-md mx-auto mt-1 leading-relaxed">
                  You have not submitted any 2D cadastral plans yet. Use the upload workspace above to process and submit your first cadastral file.
                </p>
              </div>
            </div>
          )}

          {/* Empty Filter Results */}
          {!loading && data && data.total === 0 && (activeSearch || filterStatus !== "ALL") && (
            <div className="p-12 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f5ee] border border-[#e2dad0] text-[#6b887a]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#162a21]">No matching submissions found</h3>
                <p className="text-xs text-[#6b887a] max-w-sm mx-auto mt-1">
                  Try adjusting your search terms or status filter.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Submissions Table */}
          {!loading && data && data.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                <thead>
                  <tr className="border-b border-[#e2dad0] bg-[#f8f5ee] text-[11px] font-bold uppercase tracking-wider text-[#6b887a]">
                    <th className="px-6 py-3.5">Submission Reference / Name</th>
                    <th className="px-6 py-3.5">Survey Key & ULPIN</th>
                    <th className="px-6 py-3.5">Location (Lat, Long)</th>
                    <th className="px-6 py-3.5">Land Use & Surface Area</th>
                    <th className="px-6 py-3.5">Structure Breakdown</th>
                    <th className="px-6 py-3.5">Submission Date</th>
                    <th className="px-6 py-3.5">Current Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2dad0]/60">
                  {data.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fdfbf7] transition">
                      {/* Name & ID */}
                      <td className="px-6 py-4 font-medium">
                        <div className="font-extrabold text-[#162a21] text-sm leading-snug">
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#6b887a] mt-0.5">
                          ID: {item.id}
                        </div>
                      </td>

                      {/* Survey Key & ULPIN */}
                      <td className="px-6 py-4 text-[#162a21]">
                        <div className="font-mono text-[11px] font-bold text-[#2d6a4f]">
                          {item.surveyNumber}
                        </div>
                        <div className="text-[10px] font-mono text-[#6b887a] truncate max-w-[180px]">
                          {item.units[0]?.ulpin ? `ULPIN: ${item.units[0].ulpin}` : "ULPIN: Pending Sign-off"}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 text-[#162a21]">
                        <div className="space-y-0.5">
                          <div className="font-mono text-[11px] font-bold text-[#2d6a4f]">
                            {item.latitude.toFixed(4)}° N, {item.longitude.toFixed(4)}° E
                          </div>
                          <div className="text-[10px] text-[#6b887a]">WGS84 Cadastral Site</div>
                        </div>
                      </td>

                      {/* Land Use & Area */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#162a21] text-xs">
                          {item.landUseSummary}
                        </div>
                        <div className="text-[11px] font-bold text-[#2d6a4f] mt-0.5">
                          {item.totalAreaSqM > 0 ? `${item.totalAreaSqM.toLocaleString()} m²` : "N/A"}
                        </div>
                      </td>

                      {/* Structure */}
                      <td className="px-6 py-4 text-[#162a21]">
                        <div className="font-bold">
                          {item.totalFloors} {item.totalFloors === 1 ? "Floor Level" : "Floor Levels"}
                        </div>
                        <div className="text-[11px] text-[#6b887a]">
                          {item.totalUnits} {item.totalUnits === 1 ? "Property Unit" : "Property Units"}
                        </div>
                      </td>

                      {/* Timestamps */}
                      <td className="px-6 py-4 text-[#6b887a] text-[11px]">
                        <div>{new Date(item.createdAt).toLocaleDateString("en-IN")}</div>
                        <div className="text-[10px] text-[#6b887a]">
                          {new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <StatusBadge status={item.approvalStatus} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(item)}
                          className="rounded-lg border border-[#2d6a4f] bg-[#2d6a4f]/10 px-3 py-1.5 text-[11px] font-bold text-[#2d6a4f] hover:bg-[#2d6a4f]/20 transition cursor-pointer shadow-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && data && data.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#e2dad0] bg-[#fdfbf7] text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[#6b887a] font-medium">
                  Showing <span className="font-bold text-[#162a21]">{(data.page - 1) * data.limit + 1}</span> to{" "}
                  <span className="font-bold text-[#162a21]">{Math.min(data.page * data.limit, data.total)}</span> of{" "}
                  <span className="font-bold text-[#162a21]">{data.total}</span> records
                </span>

                <div className="flex items-center gap-1.5 border-l border-[#e2dad0] pl-3">
                  <label className="text-[11px] text-[#6b887a]">Page Size:</label>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-lg border border-[#e2dad0] bg-white px-2 py-1 text-xs font-bold text-[#162a21] outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Prev / Next Page Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={data.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`rounded-xl border px-3.5 py-1.5 font-bold transition ${
                    data.page > 1
                      ? "border-[#e2dad0] bg-white text-[#162a21] hover:bg-[#f3efe6] cursor-pointer shadow-sm"
                      : "border-[#e2dad0]/50 bg-[#f8f5ee] text-[#6b887a]/50 cursor-not-allowed"
                  }`}
                >
                  ← Previous
                </button>

                <span className="font-bold text-[#162a21] px-2">
                  Page {data.page} of {data.totalPages}
                </span>

                <button
                  type="button"
                  disabled={data.page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className={`rounded-xl border px-3.5 py-1.5 font-bold transition ${
                    data.page < data.totalPages
                      ? "border-[#e2dad0] bg-white text-[#162a21] hover:bg-[#f3efe6] cursor-pointer shadow-sm"
                      : "border-[#e2dad0]/50 bg-[#f8f5ee] text-[#6b887a]/50 cursor-not-allowed"
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Submission Detail Modal */}
      {selectedRecord && (
        <SubmissionDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        APPROVED
      </span>
    );
  }
  if (status === "PENDING_REVIEW") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
        PENDING REVIEW
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-800">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
        REJECTED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-700">
      {status}
    </span>
  );
}

function SubmissionDetailModal({
  record,
  onClose,
}: {
  record: SurveyorSubmissionItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl rounded-2xl border border-[#e2dad0] bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#e2dad0] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={record.approvalStatus} />
              <span className="text-[11px] font-mono font-bold text-[#2d6a4f] bg-[#2d6a4f]/10 px-2.5 py-0.5 rounded-md">
                {record.surveyNumber}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#162a21]">
              {record.name}
            </h2>
            <p className="text-xs text-[#6b887a] mt-0.5">
              Surveyor 2D Cadastral Record Submission Detail
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e2dad0] bg-[#f8f5ee] p-2 text-[#162a21] hover:bg-[#e2dad0] transition cursor-pointer"
            aria-label="Close review panel"
          >
            ✕
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0]">
            <span className="block text-[10px] font-bold text-[#6b887a] uppercase">
              Record ID
            </span>
            <span className="font-mono font-bold text-[#162a21] text-xs truncate block mt-0.5">
              {record.id}
            </span>
          </div>

          <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0]">
            <span className="block text-[10px] font-bold text-[#6b887a] uppercase">
              Floors
            </span>
            <span className="font-extrabold text-[#162a21] text-base mt-0.5 block">
              {record.totalFloors} Floors
            </span>
          </div>

          <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0]">
            <span className="block text-[10px] font-bold text-[#6b887a] uppercase">
              Property Units
            </span>
            <span className="font-extrabold text-[#162a21] text-base mt-0.5 block">
              {record.totalUnits} Units
            </span>
          </div>

          <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0]">
            <span className="block text-[10px] font-bold text-[#6b887a] uppercase">
              Measured Area
            </span>
            <span className="font-extrabold text-[#2d6a4f] text-base mt-0.5 block">
              {record.totalAreaSqM > 0 ? `${record.totalAreaSqM.toLocaleString()} m²` : "N/A"}
            </span>
          </div>
        </div>

        {/* Location & Surveyor Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] p-4 space-y-2">
            <h3 className="font-extrabold text-[#162a21] border-b border-[#e2dad0] pb-2 flex items-center justify-between">
              <span>Georeference & Location</span>
              <span className="text-[10px] text-[#2d6a4f] font-mono font-bold">WGS84</span>
            </h3>

            <div className="space-y-1.5 text-[#162a21]">
              <div className="flex justify-between border-b border-[#e2dad0]/50 pb-1">
                <span className="text-[#6b887a]">Latitude:</span>
                <span className="font-mono font-bold">{record.latitude.toFixed(6)}° N</span>
              </div>
              <div className="flex justify-between border-b border-[#e2dad0]/50 pb-1">
                <span className="text-[#6b887a]">Longitude:</span>
                <span className="font-mono font-bold">{record.longitude.toFixed(6)}° E</span>
              </div>
              <div className="flex justify-between border-b border-[#e2dad0]/50 pb-1">
                <span className="text-[#6b887a]">Land Use:</span>
                <span className="font-bold uppercase text-[#2d6a4f]">{record.landUseSummary}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-[#6b887a]">Submission Timestamp:</span>
                <span className="font-semibold">{new Date(record.createdAt).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] p-4 space-y-2">
            <h3 className="font-extrabold text-[#162a21] border-b border-[#e2dad0] pb-2 flex items-center justify-between">
              <span>Verification Status Workflow</span>
              <StatusBadge status={record.approvalStatus} />
            </h3>

            <div className="space-y-1.5 text-[#162a21]">
              <div className="flex justify-between border-b border-[#e2dad0]/50 pb-1">
                <span className="text-[#6b887a]">Pipeline Stage:</span>
                <span className="font-bold text-[#2d6a4f]">Pending Verification Queue</span>
              </div>
              <div className="flex justify-between border-b border-[#e2dad0]/50 pb-1">
                <span className="text-[#6b887a]">Surveyor ID:</span>
                <span className="font-mono font-bold">{record.surveyorId || "Authenticated Surveyor"}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-[#6b887a]">Verification Date:</span>
                <span className="font-semibold">
                  {record.verifiedAt ? new Date(record.verifiedAt).toLocaleString("en-IN") : "Pending Review"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Units Breakdown Table */}
        <div className="space-y-2 text-xs">
          <h3 className="font-extrabold text-[#162a21]">
            Extracted Property Units ({record.units.length} Units)
          </h3>

          <div className="rounded-xl border border-[#e2dad0] overflow-hidden max-h-52 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f5ee] text-[10px] font-bold uppercase text-[#6b887a] border-b border-[#e2dad0] sticky top-0">
                <tr>
                  <th className="p-2.5">Unit #</th>
                  <th className="p-2.5">3D ULPIN Key</th>
                  <th className="p-2.5">Floor Level</th>
                  <th className="p-2.5">Land Use</th>
                  <th className="p-2.5 text-right">Area (m²)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2dad0]/60">
                {record.units.map((u) => (
                  <tr key={u.id} className="hover:bg-[#fdfbf7]">
                    <td className="p-2.5 font-bold text-[#162a21]">Unit {u.unitNumber}</td>
                    <td className="p-2.5 font-mono text-[11px] font-bold text-[#2d6a4f]">
                      {u.ulpin || "Pending 3D Registration"}
                    </td>
                    <td className="p-2.5 text-[#6b887a]">Floor {u.floorNumber}</td>
                    <td className="p-2.5 font-bold text-[#162a21] uppercase text-[10px]">{u.spaceType}</td>
                    <td className="p-2.5 text-right font-bold text-[#162a21]">{u.area} m²</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between border-t border-[#e2dad0] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e2dad0] bg-white px-5 py-2.5 text-xs font-bold text-[#162a21] hover:bg-[#f3efe6] transition cursor-pointer"
          >
            Close Detail Panel
          </button>

          <Link
            href="/government/pending-verification"
            className="rounded-xl bg-[#2d6a4f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1b4332] transition cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <span>Open Verification Queue</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
