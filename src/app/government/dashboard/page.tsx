"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import {
  getGovernmentDashboardOverview,
  GovernmentDashboardMetrics,
} from "@/src/app/actions/government";

export default function GovernmentDashboardOverviewPage() {
  const [metrics, setMetrics] = useState<GovernmentDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGovernmentDashboardOverview();
      if (res.success && res.data) {
        setMetrics(res.data);
      } else {
        setError(res.error || "Failed to load government dashboard metrics.");
      }
    } catch (err) {
      console.error("Dashboard overview fetch error:", err);
      setError("An unexpected network error occurred while loading metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const res = await getGovernmentDashboardOverview();
        if (!isMounted) return;
        if (res.success && res.data) {
          setMetrics(res.data);
        } else {
          setError(res.error || "Failed to load government dashboard metrics.");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Dashboard overview fetch error:", err);
        setError("An unexpected network error occurred while loading metrics.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <GovernmentPageHeader
        title="Government Dashboard Overview"
        description="High-level national overview of 3D cadastral land parcels, property units, ULPIN registration, and surveyor verification status."
        action={
          <button
            type="button"
            onClick={loadData}
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
            <span>Refresh Data</span>
          </button>
        }
      />

      {/* Error State Alert */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-xs text-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-red-950">Unable to Load Dashboard Overview</h3>
              <p className="text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 transition text-xs shrink-0 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Properties */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-3 relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b887a]">
              Total Property Units
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2d6a4f]/10 text-[#2d6a4f]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#162a21]">
              {loading ? (
                <div className="h-8 w-20 bg-[#f3efe6] animate-pulse rounded-lg" />
              ) : (
                metrics?.totalProperties.toLocaleString() ?? 0
              )}
            </div>
            <p className="text-[11px] text-[#6b887a] mt-1 font-medium">
              {loading
                ? "Calculating structures..."
                : `Across ${metrics?.totalBuildings ?? 0} cadastral building structures`}
            </p>
          </div>
        </div>

        {/* KPI 2: ULPIN Assigned */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-3 relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b887a]">
              ULPIN Assigned
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2d6a4f]/10 text-[#2d6a4f]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 10h.01M7 13h.01M10 7h.01M10 10h.01M10 13h.01M10 16h.01M13 10h.01M13 13h.01M13 16h.01M16 7h.01M16 10h.01M16 13h.01M16 16h.01M4 21h16a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v16a1 1 0 001 1z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#162a21]">
              {loading ? (
                <div className="h-8 w-20 bg-[#f3efe6] animate-pulse rounded-lg" />
              ) : (
                metrics?.ulpinAssigned.toLocaleString() ?? 0
              )}
            </div>
            <p className="text-[11px] text-[#2d6a4f] mt-1 font-bold">
              {loading
                ? "Calculating coverage..."
                : `${metrics?.ulpinCoveragePercent ?? 0}% 3D ULPIN registry coverage`}
            </p>
          </div>
        </div>

        {/* KPI 3: Verified Properties */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-3 relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b887a]">
              Verified Properties
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2d6a4f]/10 text-[#2d6a4f]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#162a21]">
              {loading ? (
                <div className="h-8 w-20 bg-[#f3efe6] animate-pulse rounded-lg" />
              ) : (
                metrics?.verifiedProperties.toLocaleString() ?? 0
              )}
            </div>
            <p className="text-[11px] text-[#6b887a] mt-1 font-medium">
              {loading
                ? "Checking approvals..."
                : `${metrics?.approvedBuildings ?? 0} approved cadastral buildings`}
            </p>
          </div>
        </div>

        {/* KPI 4: Pending Verification */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-3 relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b887a]">
              Pending Verification
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#162a21]">
              {loading ? (
                <div className="h-8 w-20 bg-[#f3efe6] animate-pulse rounded-lg" />
              ) : (
                metrics?.pendingBuildings.toLocaleString() ?? 0
              )}
            </div>
            <p className="text-[11px] text-[#6b887a] mt-1 font-medium">
              {loading
                ? "Checking queues..."
                : `${metrics?.rejectedBuildings ?? 0} rejected submissions`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Breakdown - 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Span): Land/Property Overview & ULPIN Overview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section D: Land / Property Overview */}
          <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#e2dad0] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f2d21] text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#162a21]">
                    Land & Property Distribution
                  </h2>
                  <p className="text-xs text-[#6b887a]">
                    Cadastral space classification and area metrics from database
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl bg-[#f8f5ee] p-4 border border-[#e2dad0]">
                <span className="block text-[10px] font-bold text-[#6b887a] uppercase tracking-wider">
                  Total Cadastral Buildings
                </span>
                <span className="mt-1 block text-lg font-extrabold text-[#162a21]">
                  {loading ? "..." : (metrics?.totalBuildings ?? 0)}
                </span>
              </div>

              <div className="rounded-xl bg-[#f8f5ee] p-4 border border-[#e2dad0]">
                <span className="block text-[10px] font-bold text-[#6b887a] uppercase tracking-wider">
                  Total Registered Units
                </span>
                <span className="mt-1 block text-lg font-extrabold text-[#162a21]">
                  {loading ? "..." : (metrics?.totalProperties ?? 0)}
                </span>
              </div>

              <div className="rounded-xl bg-[#f8f5ee] p-4 border border-[#e2dad0]">
                <span className="block text-[10px] font-bold text-[#6b887a] uppercase tracking-wider">
                  Total Measured Floor Area
                </span>
                <span className="mt-1 block text-lg font-extrabold text-[#2d6a4f]">
                  {loading ? "..." : `${metrics?.totalAreaSqM.toLocaleString() ?? 0} m²`}
                </span>
              </div>
            </div>

            {/* Space Type Distribution */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-[#162a21] uppercase tracking-wider">
                Property Space Classification
              </h3>

              {loading ? (
                <div className="space-y-2">
                  <div className="h-10 bg-[#f8f5ee] animate-pulse rounded-xl" />
                  <div className="h-10 bg-[#f8f5ee] animate-pulse rounded-xl" />
                </div>
              ) : !metrics || metrics.spaceTypeDistribution.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#e2dad0] bg-[#f8f5ee] p-6 text-center text-xs text-[#6b887a]">
                  No property space classification data available.
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.spaceTypeDistribution.map((item) => {
                    const pct =
                      metrics.totalProperties > 0
                        ? Math.round((item.count / metrics.totalProperties) * 100)
                        : 0;

                    return (
                      <div key={item.spaceType} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-[#162a21]">
                          <span className="capitalize">{item.spaceType.toLowerCase()}</span>
                          <span className="text-[#6b887a]">
                            {item.count} units ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#e2dad0] overflow-hidden">
                          <div
                            className="h-full bg-[#2d6a4f] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section E: ULPIN Overview */}
          <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#e2dad0] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d6a4f] text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 10h.01M7 13h.01M10 7h.01M10 10h.01M10 13h.01M10 16h.01M13 10h.01M13 13h.01M13 16h.01M16 7h.01M16 10h.01M16 13h.01M16 16h.01M4 21h16a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v16a1 1 0 001 1z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#162a21]">
                    3D ULPIN Registry Overview
                  </h2>
                  <p className="text-xs text-[#6b887a]">
                    Unique Land Parcel Identification Number registration status
                  </p>
                </div>
              </div>

              <Link
                href="/government/ulpin-registry"
                className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1"
              >
                <span>ULPIN Registry</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-[#e2dad0] bg-[#f8f5ee] p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b887a]">
                  Assigned ULPINs
                </span>
                <div className="text-2xl font-extrabold text-[#162a21]">
                  {loading ? "..." : (metrics?.ulpinAssigned ?? 0)}
                </div>
                <p className="text-[10px] text-[#2d6a4f] font-semibold">
                  Valid 14-digit geo-spatial 3D land identifiers
                </p>
              </div>

              <div className="rounded-xl border border-[#e2dad0] bg-[#f8f5ee] p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b887a]">
                  Unassigned Properties
                </span>
                <div className="text-2xl font-extrabold text-[#162a21]">
                  {loading ? "..." : (metrics?.ulpinUnassigned ?? 0)}
                </div>
                <p className="text-[10px] text-[#6b887a] font-semibold">
                  Awaiting formal surveyor registration
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#2d6a4f]/20 bg-[#2d6a4f]/5 p-4 text-xs text-[#162a21] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#2d6a4f]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>3D ULPIN Formatting Standard</span>
              </div>
              <p className="text-[11px] text-[#3d5a4c] leading-relaxed">
                BhuVista standard 14-digit ULPIN format: <code className="bg-white px-1.5 py-0.5 rounded border border-[#e2dad0] font-mono text-[10px] font-bold text-[#162a21]">IN-MH-PUN-[BUILDING]-F[FLOOR]-U[UNIT]</code>. Unique across national land administration records.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (1 Span): Verification Overview, Recent Activity & Quick Actions */}
        <div className="space-y-8">
          {/* Section F: Verification Overview */}
          <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#e2dad0] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2d6a4f] text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-sm font-extrabold text-[#162a21]">
                  Verification Status
                </h2>
              </div>

              <Link
                href="/government/pending-verification"
                className="text-[11px] font-bold text-[#2d6a4f] hover:underline"
              >
                Review →
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Approved */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-950 font-semibold">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span>Approved Buildings</span>
                </span>
                <span className="font-extrabold text-sm">
                  {loading ? "..." : (metrics?.approvedBuildings ?? 0)}
                </span>
              </div>

              {/* Pending */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-950 font-semibold">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Pending Review</span>
                </span>
                <span className="font-extrabold text-sm">
                  {loading ? "..." : (metrics?.pendingBuildings ?? 0)}
                </span>
              </div>

              {/* Rejected */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-rose-950 font-semibold">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Rejected Submissions</span>
                </span>
                <span className="font-extrabold text-sm">
                  {loading ? "..." : (metrics?.rejectedBuildings ?? 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Section C: Recent Activity */}
          <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2dad0] pb-3">
              <h2 className="text-sm font-extrabold text-[#162a21] flex items-center gap-2">
                <svg className="w-4 h-4 text-[#2d6a4f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Recent Activity</span>
              </h2>

              <Link
                href="/government/activity-log"
                className="text-[11px] font-bold text-[#2d6a4f] hover:underline flex items-center gap-1"
              >
                <span>Full Audit Log</span>
                <span>→</span>
              </Link>
            </div>

            {loading ? (
              <div className="p-4 text-center text-xs text-[#6b887a] animate-pulse">
                Loading recent activity...
              </div>
            ) : !metrics || !metrics.recentActivity || metrics.recentActivity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#e2dad0] bg-[#f8f5ee] p-6 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#e2dad0]/50 text-[#6b887a]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-[#162a21]">
                  No recent activity recorded.
                </p>
                <p className="text-[11px] text-[#6b887a]">
                  Government system audit history and automated activity logs will be recorded here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {metrics.recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl border border-[#e2dad0] bg-[#fdfbf7] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col truncate">
                      <span className="font-extrabold text-[#162a21] truncate">{act.action}</span>
                      <span className="text-[11px] text-[#6b887a] truncate">{act.entity}</span>
                    </div>
                    <div className="flex flex-col items-end text-right shrink-0">
                      <span className="font-semibold text-[#2d6a4f] text-[10px]">{act.user}</span>
                      <span className="text-[10px] font-mono text-[#6b887a]">
                        {new Date(act.timestamp).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section G: Quick Actions */}
          <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-[#162a21] border-b border-[#e2dad0] pb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#2d6a4f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Quick Actions</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold">
              <Link
                href="/government/land-parcels"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#e2dad0] bg-[#fdfbf7] text-[#162a21] hover:bg-[#2d6a4f] hover:text-white transition group shadow-sm"
              >
                <svg className="w-4 h-4 text-[#2d6a4f] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="truncate">Land Parcels</span>
              </Link>

              <Link
                href="/government/property-registry"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#e2dad0] bg-[#fdfbf7] text-[#162a21] hover:bg-[#2d6a4f] hover:text-white transition group shadow-sm"
              >
                <svg className="w-4 h-4 text-[#2d6a4f] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="truncate">Property Registry</span>
              </Link>

              <Link
                href="/government/ulpin-registry"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#e2dad0] bg-[#fdfbf7] text-[#162a21] hover:bg-[#2d6a4f] hover:text-white transition group shadow-sm"
              >
                <svg className="w-4 h-4 text-[#2d6a4f] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 10h.01M7 13h.01M10 7h.01M10 10h.01M10 13h.01M10 16h.01M13 10h.01M13 13h.01M13 16h.01M16 7h.01M16 10h.01M16 13h.01M16 16h.01M4 21h16a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v16a1 1 0 001 1z" />
                </svg>
                <span className="truncate">ULPIN Registry</span>
              </Link>

              <Link
                href="/government/cadastral-map"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#e2dad0] bg-[#fdfbf7] text-[#162a21] hover:bg-[#2d6a4f] hover:text-white transition group shadow-sm"
              >
                <svg className="w-4 h-4 text-[#2d6a4f] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="truncate">Cadastral Map</span>
              </Link>

              <Link
                href="/government/pending-verification"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#e2dad0] bg-[#fdfbf7] text-[#162a21] hover:bg-[#2d6a4f] hover:text-white transition group shadow-sm"
              >
                <svg className="w-4 h-4 text-[#2d6a4f] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="truncate">Pending Verification</span>
              </Link>

              <Link
                href="/government/reports"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#e2dad0] bg-[#fdfbf7] text-[#162a21] hover:bg-[#2d6a4f] hover:text-white transition group shadow-sm"
              >
                <svg className="w-4 h-4 text-[#2d6a4f] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate">Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
