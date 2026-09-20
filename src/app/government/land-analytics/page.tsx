"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import {
  getGovernmentAnalyticsData,
  GovernmentAnalyticsData,
} from "@/src/app/actions/government";

export default function GovernmentLandAnalyticsPage() {
  const [data, setData] = useState<GovernmentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGovernmentAnalyticsData();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load government analytics data.");
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError("An unexpected network error occurred while loading analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const zeroData =
    !data ||
    (data.overview.totalBuildings === 0 && data.overview.totalProperties === 0);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <GovernmentPageHeader
        title="Land & Property Analytics"
        description="Real-time internal spatial density metrics, land-use distribution, ULPIN coverage, and GIS quality control metrics."
        action={
          <button
            type="button"
            onClick={loadAnalytics}
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
            <span>Refresh Analytics</span>
          </button>
        }
      />

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-xs text-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-red-950">Unable to Load Analytics</h3>
              <p className="text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadAnalytics}
            className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 transition text-xs shrink-0 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Primary Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b887a]">
            Total Parcels / Structures
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#162a21]">
            {loading ? <div className="h-8 w-16 bg-[#f3efe6] animate-pulse rounded-lg" /> : data?.overview.totalBuildings ?? 0}
          </div>
          <p className="text-[11px] text-[#6b887a] font-medium">
            {loading ? "..." : `Avg ${data?.overview.avgFloorsPerBuilding ?? 0} floors / building`}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b887a]">
            Total Property Units
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#162a21]">
            {loading ? <div className="h-8 w-16 bg-[#f3efe6] animate-pulse rounded-lg" /> : data?.overview.totalProperties ?? 0}
          </div>
          <p className="text-[11px] text-[#6b887a] font-medium">
            {loading ? "..." : `Avg ${data?.overview.avgUnitsPerBuilding ?? 0} units / building`}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b887a]">
            Total Measured Area
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2d6a4f]">
            {loading ? <div className="h-8 w-24 bg-[#f3efe6] animate-pulse rounded-lg" /> : `${data?.overview.totalAreaSqM.toLocaleString() ?? 0} m²`}
          </div>
          <p className="text-[11px] text-[#6b887a] font-medium">
            {loading ? "..." : `Avg unit area ${data?.overview.avgUnitAreaSqM ?? 0} m²`}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b887a]">
            ULPIN Coverage Rate
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#162a21]">
            {loading ? <div className="h-8 w-16 bg-[#f3efe6] animate-pulse rounded-lg" /> : `${data?.ulpinDistribution.coveragePercent ?? 0}%`}
          </div>
          <p className="text-[11px] text-[#2d6a4f] font-bold">
            {loading ? "..." : `${data?.ulpinDistribution.assigned ?? 0} assigned of ${data?.overview.totalProperties ?? 0}`}
          </p>
        </div>
      </div>

      {/* Main Charts & Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Land-Use / Space Type Distribution */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#e2dad0] pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#162a21]">
                Land-Use & Space Classification
              </h2>
              <p className="text-xs text-[#6b887a]">
                Area allocation and property count by space type
              </p>
            </div>
            <span className="rounded bg-[#2d6a4f]/10 px-2.5 py-1 text-[10px] font-extrabold text-[#2d6a4f]">
              REAL DATA
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 py-6">
              <div className="h-6 bg-[#f8f5ee] animate-pulse rounded-lg" />
              <div className="h-6 bg-[#f8f5ee] animate-pulse rounded-lg" />
              <div className="h-6 bg-[#f8f5ee] animate-pulse rounded-lg" />
            </div>
          ) : zeroData || !data?.spaceTypeDistribution || data.spaceTypeDistribution.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e2dad0] bg-[#f8f5ee] p-8 text-center space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#e2dad0]/50 text-[#6b887a]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-[#162a21]">No Land-Use Data Available</p>
              <p className="text-[11px] text-[#6b887a]">
                Property units registered in the database will automatically generate space classification metrics.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.spaceTypeDistribution.map((st) => (
                <div key={st.spaceType} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="capitalize text-[#162a21]">{st.spaceType.toLowerCase()}</span>
                    <span className="text-[#6b887a]">
                      {st.count} units ({st.countPercent}%) • {st.totalAreaSqM.toLocaleString()} m² ({st.areaPercent}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[#f3efe6] overflow-hidden flex">
                    <div
                      className="h-full bg-[#2d6a4f] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(st.areaPercent, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart 2: Verification Status & ULPIN Coverage */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#e2dad0] pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#162a21]">
                Verification & ULPIN Status
              </h2>
              <p className="text-xs text-[#6b887a]">
                Government surveyor review and 3D registration progress
              </p>
            </div>
            <span className="rounded bg-[#2d6a4f]/10 px-2.5 py-1 text-[10px] font-extrabold text-[#2d6a4f]">
              REAL DATA
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 py-6">
              <div className="h-6 bg-[#f8f5ee] animate-pulse rounded-lg" />
              <div className="h-6 bg-[#f8f5ee] animate-pulse rounded-lg" />
            </div>
          ) : zeroData ? (
            <div className="rounded-xl border border-dashed border-[#e2dad0] bg-[#f8f5ee] p-8 text-center space-y-2">
              <p className="text-xs font-bold text-[#162a21]">No Status Data Available</p>
              <p className="text-[11px] text-[#6b887a]">
                Cadastral parcel approvals and ULPIN assignments will reflect here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Verification Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#162a21]">Building Approval Distribution</span>
                  <span className="text-[#2d6a4f]">{data?.approvalDistribution.approvedPercent}% Approved</span>
                </div>
                <div className="h-4 w-full rounded-full bg-[#f3efe6] overflow-hidden flex">
                  {data?.overview.totalBuildings ? (
                    <>
                      <div
                        className="h-full bg-emerald-600 transition-all duration-500"
                        style={{
                          width: `${(data.approvalDistribution.approved / data.overview.totalBuildings) * 100}%`,
                        }}
                        title={`Approved: ${data.approvalDistribution.approved}`}
                      />
                      <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{
                          width: `${(data.approvalDistribution.pending / data.overview.totalBuildings) * 100}%`,
                        }}
                        title={`Pending: ${data.approvalDistribution.pending}`}
                      />
                      <div
                        className="h-full bg-rose-600 transition-all duration-500"
                        style={{
                          width: `${(data.approvalDistribution.rejected / data.overview.totalBuildings) * 100}%`,
                        }}
                        title={`Rejected: ${data.approvalDistribution.rejected}`}
                      />
                    </>
                  ) : (
                    <div className="h-full bg-[#e2dad0] w-full" />
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6b887a] pt-1 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    <span>Approved ({data?.approvalDistribution.approved})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span>Pending ({data?.approvalDistribution.pending})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
                    <span>Rejected ({data?.approvalDistribution.rejected})</span>
                  </span>
                </div>
              </div>

              {/* ULPIN Breakdown */}
              <div className="space-y-2 pt-2 border-t border-[#e2dad0]">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#162a21]">3D ULPIN Assignment Meter</span>
                  <span className="text-[#2d6a4f]">{data?.ulpinDistribution.coveragePercent}% Coverage</span>
                </div>
                <div className="h-4 w-full rounded-full bg-[#f3efe6] overflow-hidden flex">
                  {data?.overview.totalProperties ? (
                    <>
                      <div
                        className="h-full bg-[#2d6a4f] transition-all duration-500"
                        style={{
                          width: `${(data.ulpinDistribution.assigned / data.overview.totalProperties) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-[#d8c3a5] transition-all duration-500"
                        style={{
                          width: `${(data.ulpinDistribution.unassigned / data.overview.totalProperties) * 100}%`,
                        }}
                      />
                    </>
                  ) : (
                    <div className="h-full bg-[#e2dad0] w-full" />
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6b887a] pt-1 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2d6a4f]" />
                    <span>Assigned ({data?.ulpinDistribution.assigned})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#d8c3a5]" />
                    <span>Unassigned ({data?.ulpinDistribution.unassigned})</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Analytics: Validation Quality Audit & Geographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 3: GIS Validation Quality Control */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#e2dad0] pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#162a21]">
                GIS Quality Control Audit
              </h2>
              <p className="text-xs text-[#6b887a]">
                Data validation pass / warning / fail distribution across registered properties
              </p>
            </div>
            <Link
              href="/government/validation"
              className="text-xs font-bold text-[#2d6a4f] hover:underline"
            >
              Validation Queue →
            </Link>
          </div>

          {loading ? (
            <div className="h-24 bg-[#f8f5ee] animate-pulse rounded-xl" />
          ) : zeroData ? (
            <div className="rounded-xl border border-dashed border-[#e2dad0] bg-[#f8f5ee] p-8 text-center text-xs text-[#6b887a]">
              No validation records available.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <span className="block text-[10px] font-bold uppercase text-emerald-800">Pass</span>
                  <span className="block text-xl font-extrabold text-emerald-950 mt-0.5">
                    {data?.validationQualityDistribution.pass}
                  </span>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <span className="block text-[10px] font-bold uppercase text-amber-800">Warning</span>
                  <span className="block text-xl font-extrabold text-amber-950 mt-0.5">
                    {data?.validationQualityDistribution.warning}
                  </span>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <span className="block text-[10px] font-bold uppercase text-rose-800">Fail</span>
                  <span className="block text-xl font-extrabold text-rose-950 mt-0.5">
                    {data?.validationQualityDistribution.fail}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#162a21]">
                  <span>Quality Pass Compliance</span>
                  <span className="text-[#2d6a4f]">{data?.validationQualityDistribution.passPercent}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#f3efe6] overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${data?.validationQualityDistribution.passPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart 4: Geographic / Cluster Distribution */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#e2dad0] pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#162a21]">
                Geographic / District Distribution
              </h2>
              <p className="text-xs text-[#6b887a]">
                Parcels and registered floor area by location cluster
              </p>
            </div>
            <Link
              href="/government/cadastral-map"
              className="text-xs font-bold text-[#2d6a4f] hover:underline"
            >
              GIS Map →
            </Link>
          </div>

          {loading ? (
            <div className="h-24 bg-[#f8f5ee] animate-pulse rounded-xl" />
          ) : zeroData || !data?.locationClusters || data.locationClusters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e2dad0] bg-[#f8f5ee] p-8 text-center text-xs text-[#6b887a]">
              No location cluster data available.
            </div>
          ) : (
            <div className="space-y-3">
              {data.locationClusters.map((cluster) => (
                <div
                  key={cluster.locationName}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#f8f5ee] border border-[#e2dad0] text-xs font-semibold"
                >
                  <div>
                    <span className="font-extrabold text-[#162a21] block">
                      {cluster.locationName}
                    </span>
                    <span className="text-[10px] text-[#6b887a]">
                      {cluster.buildingCount} building(s) • {cluster.propertyCount} unit(s)
                    </span>
                  </div>
                  <span className="font-extrabold text-[#2d6a4f]">
                    {cluster.totalAreaSqM.toLocaleString()} m²
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
