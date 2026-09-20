"use client";

import React, { useEffect, useState, useCallback } from "react";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import {
  getGovernmentReportsData,
  GovernmentReportsResult,
  ReportsQueryOptions,
} from "@/src/app/actions/government";

type ReportType =
  | "property-summary"
  | "ulpin-summary"
  | "verification-summary"
  | "validation-summary"
  | "land-use-summary";

export default function GovernmentReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("property-summary");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSpaceType, setFilterSpaceType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const [reportData, setReportData] = useState<GovernmentReportsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const options: ReportsQueryOptions = {
        reportType,
        search,
        filterStatus,
        filterSpaceType,
        page,
        limit,
      };

      const res = await getGovernmentReportsData(options);
      if (res.success && res.data) {
        setReportData(res.data);
      } else {
        setError(res.error || "Failed to generate government report.");
      }
    } catch (err) {
      console.error("Report fetch error:", err);
      setError("An unexpected network error occurred while generating report.");
    } finally {
      setLoading(false);
    }
  }, [reportType, search, filterStatus, filterSpaceType, page, limit]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleReportTypeChange = (newType: ReportType) => {
    setReportType(newType);
    setSearch("");
    setFilterStatus("ALL");
    setFilterSpaceType("ALL");
    setPage(1);
  };

  const downloadCSV = () => {
    if (!reportData || reportData.rows.length === 0) return;

    const headersStr = reportData.headers.join(",");
    const rowsStr = reportData.rows
      .map((row) =>
        [
          `"${row.column1}"`,
          `"${row.column2}"`,
          `"${row.column3}"`,
          `"${row.column4}"`,
          `"${row.column5}"`,
          `"${row.column6}"`,
          `"${row.column7}"`,
        ].join(",")
      )
      .join("\n");

    const csvContent = `${headersStr}\n${rowsStr}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `bhuvista_${reportType}_${new Date().toISOString().substring(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!reportData || reportData.rows.length === 0) return;

    const exportData = reportData.rows.map((r) => r.rawObject);
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `bhuvista_${reportType}_${new Date().toISOString().substring(0, 10)}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <GovernmentPageHeader
        title="Government Land Reports"
        description="Generate and export official national land administration summaries, ULPIN audit registers, verification logs, and land-use breakdowns based on current database records."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadCSV}
              disabled={loading || !reportData || reportData.rows.length === 0}
              className="flex items-center gap-2 rounded-xl bg-white text-[#2d6a4f] px-3.5 py-2 text-xs font-extrabold hover:bg-[#f8f5ee] transition cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={downloadJSON}
              disabled={loading || !reportData || reportData.rows.length === 0}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 text-white px-3.5 py-2 text-xs font-extrabold hover:bg-white/20 transition cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export JSON</span>
            </button>
          </div>
        }
      />

      {/* Report Category Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#e2dad0]">
        {[
          { id: "property-summary", label: "Property & Land Summary" },
          { id: "ulpin-summary", label: "3D ULPIN Registry Summary" },
          { id: "verification-summary", label: "Verification Workflow Summary" },
          { id: "validation-summary", label: "GIS Quality Validation Summary" },
          { id: "land-use-summary", label: "Land-Use & Area Summary" },
        ].map((tab) => {
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleReportTypeChange(tab.id as ReportType)}
              className={`rounded-xl px-4 py-2.5 text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-[#2d6a4f] text-white shadow-sm"
                  : "bg-white text-[#162a21] border border-[#e2dad0] hover:bg-[#f8f5ee]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b887a]">
            Total Report Records
          </span>
          <div className="text-2xl font-extrabold text-[#162a21]">
            {loading ? "..." : (reportData?.summaryStats.totalRecords ?? 0)}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b887a]">
            {reportData?.summaryStats.primaryMetricLabel || "Primary Summary Metric"}
          </span>
          <div className="text-2xl font-extrabold text-[#2d6a4f]">
            {loading ? "..." : (reportData?.summaryStats.primaryMetricValue ?? "—")}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b887a]">
            {reportData?.summaryStats.secondaryMetricLabel || "Secondary Summary Metric"}
          </span>
          <div className="text-2xl font-extrabold text-[#162a21]">
            {loading ? "..." : (reportData?.summaryStats.secondaryMetricValue ?? "—")}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-[#e2dad0] bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search report records..."
            className="w-full rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-3.5 py-2 pl-9 text-xs font-semibold text-[#162a21] placeholder-[#6b887a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
          />
          <svg className="w-4 h-4 text-[#6b887a] absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Status / Space Type Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[#e2dad0] bg-white px-3 py-2 text-xs font-semibold text-[#162a21] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
          >
            <option value="ALL">All Statuses</option>
            {reportType === "ulpin-summary" ? (
              <>
                <option value="ASSIGNED">ULPIN Assigned</option>
                <option value="UNASSIGNED">ULPIN Unassigned</option>
              </>
            ) : reportType === "validation-summary" ? (
              <>
                <option value="PASS">Validation Pass</option>
                <option value="WARNING">Validation Warning</option>
                <option value="FAIL">Validation Fail</option>
              </>
            ) : (
              <>
                <option value="APPROVED">APPROVED</option>
                <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                <option value="REJECTED">REJECTED</option>
              </>
            )}
          </select>

          <select
            value={filterSpaceType}
            onChange={(e) => {
              setFilterSpaceType(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[#e2dad0] bg-white px-3 py-2 text-xs font-semibold text-[#162a21] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
          >
            <option value="ALL">All Space Types</option>
            <option value="RESIDENTIAL">RESIDENTIAL</option>
            <option value="COMMERCIAL">COMMERCIAL</option>
            <option value="OFFICE">OFFICE</option>
            <option value="STAIRCASE">STAIRCASE</option>
            <option value="LOBBY">LOBBY</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 font-semibold">
          {error}
        </div>
      )}

      {/* Reports Table Data */}
      <div className="rounded-2xl border border-[#e2dad0] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f5ee] border-b border-[#e2dad0] font-extrabold uppercase text-[#6b887a] tracking-wider text-[10px]">
              <tr>
                {reportData?.headers.map((hdr, idx) => (
                  <th key={idx} className="px-5 py-3.5">
                    {hdr}
                  </th>
                )) || <th className="px-5 py-3.5">Report Header</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e2dad0] text-[#162a21] font-medium">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-[#f8f5ee] rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !reportData || reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[#6b887a]">
                    <div className="space-y-2">
                      <p className="font-bold text-sm text-[#162a21]">No report data matching selected filters.</p>
                      <p className="text-xs">Adjust search parameters or select a different report category.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#fdfbf7] transition">
                    <td className="px-5 py-3.5 font-bold font-mono text-[11px] text-[#2d6a4f]">{row.column1}</td>
                    <td className="px-5 py-3.5 font-bold">{row.column2}</td>
                    <td className="px-5 py-3.5">{row.column3}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px]">{row.column4}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded bg-[#f8f5ee] px-2 py-0.5 border border-[#e2dad0] text-[10px] font-bold text-[#162a21]">
                        {row.column5}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold">{row.column6}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          row.column7 === "APPROVED" || row.column7 === "ASSIGNED" || row.column7 === "PASS" || row.column7 === "REGISTERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : row.column7 === "PENDING_REVIEW" || row.column7 === "UNASSIGNED" || row.column7 === "WARNING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {row.column7}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {reportData && reportData.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#e2dad0] bg-[#f8f5ee] px-5 py-3 text-xs font-semibold text-[#6b887a]">
            <span>
              Page {reportData.page} of {reportData.totalPages} ({reportData.total} total rows)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="rounded-lg border border-[#e2dad0] bg-white px-3 py-1.5 font-bold text-[#162a21] hover:bg-[#f3efe6] transition disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(reportData.totalPages, p + 1))}
                disabled={page >= reportData.totalPages || loading}
                className="rounded-lg border border-[#e2dad0] bg-white px-3 py-1.5 font-bold text-[#162a21] hover:bg-[#f3efe6] transition disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
