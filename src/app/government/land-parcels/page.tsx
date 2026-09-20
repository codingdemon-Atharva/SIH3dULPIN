"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import {
  getGovernmentLandParcels,
  GovernmentLandParcelItem,
  GovernmentLandParcelsResult,
} from "@/src/app/actions/government";

export default function GovernmentLandParcelsPage() {
  const [data, setData] = useState<GovernmentLandParcelsResult | null>(null);
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

  // Modal State for Parcel Details
  const [selectedParcel, setSelectedParcel] = useState<GovernmentLandParcelItem | null>(null);

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGovernmentLandParcels({
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
        setError(res.error || "Failed to load land parcel records.");
      }
    } catch (err) {
      console.error("Error fetching land parcels:", err);
      setError("An unexpected network error occurred while loading land parcels.");
    } finally {
      setLoading(false);
    }
  }, [activeSearch, filterStatus, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

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

  const hasActiveFilters =
    activeSearch !== "" || filterStatus !== "ALL" || sortBy !== "createdAt" || sortOrder !== "desc";

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <GovernmentPageHeader
        title="Land Parcels Management"
        description="Government administration and spatial index of registered 3D land parcel boundaries."
        action={
          <button
            type="button"
            onClick={fetchParcels}
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
            <span>Refresh Records</span>
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
              <h3 className="font-extrabold text-sm text-red-950">Unable to Load Land Parcels</h3>
              <p className="text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchParcels}
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
                placeholder="Search by Parcel ID, Building Name, Location..."
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
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 min-w-[150px]">
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
                <option value="APPROVED">Approved</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Sort Dropdown */}
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
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
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

      {/* Main Table View */}
      <div className="rounded-2xl border border-[#e2dad0] bg-white shadow-sm overflow-hidden">
        {/* Table Header Info Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2dad0] bg-[#fdfbf7]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-[#162a21]">
              Land Parcel Records
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
              Loading land records...
            </div>
          </div>
        )}

        {/* Empty Database State */}
        {!loading && data && data.total === 0 && !hasActiveFilters && (
          <div className="p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f5ee] border border-[#e2dad0] text-[#6b887a]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#162a21]">No land parcel records available.</h3>
              <p className="text-xs text-[#6b887a] max-w-sm mx-auto mt-1">
                There are currently no land parcel structures registered in the BhuVista system.
              </p>
            </div>
          </div>
        )}

        {/* No Search Results State */}
        {!loading && data && data.total === 0 && hasActiveFilters && (
          <div className="p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f5ee] border border-[#e2dad0] text-[#6b887a]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#162a21]">No records match your search.</h3>
              <p className="text-xs text-[#6b887a] max-w-sm mx-auto mt-1">
                Try adjusting your search criteria or clearing active filters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Data Table */}
        {!loading && data && data.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#e2dad0] bg-[#f8f5ee] text-[11px] font-bold uppercase tracking-wider text-[#6b887a]">
                  <th className="px-6 py-3.5">Parcel / Structure</th>
                  <th className="px-6 py-3.5">Location (Lat, Long)</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Floors & Units</th>
                  <th className="px-6 py-3.5">Total Area</th>
                  <th className="px-6 py-3.5">Last Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2dad0]/60">
                {data.items.map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-[#fdfbf7] transition">
                    {/* Parcel Name / ID */}
                    <td className="px-6 py-4 font-medium">
                      <div className="font-extrabold text-[#162a21] text-sm leading-snug">
                        {parcel.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#6b887a] mt-0.5">
                        ID: {parcel.id}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-[#162a21]">
                      {parcel.hasGeometry ? (
                        <div className="space-y-0.5">
                          <div className="font-mono text-[11px] font-bold text-[#2d6a4f]">
                            {parcel.latitude.toFixed(5)}° N, {parcel.longitude.toFixed(5)}° E
                          </div>
                          <div className="text-[10px] text-[#6b887a]">WGS84 Cadastral Site</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#6b887a] italic">Location unavailable</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={parcel.approvalStatus} />
                    </td>

                    {/* Structure Levels */}
                    <td className="px-6 py-4 text-[#162a21]">
                      <div className="font-bold">
                        {parcel.totalFloors} {parcel.totalFloors === 1 ? "Floor" : "Floors"}
                      </div>
                      <div className="text-[11px] text-[#6b887a]">
                        {parcel.totalUnits} {parcel.totalUnits === 1 ? "Property Unit" : "Property Units"}
                      </div>
                    </td>

                    {/* Total Area */}
                    <td className="px-6 py-4 font-bold text-[#162a21]">
                      {parcel.totalAreaSqM > 0 ? `${parcel.totalAreaSqM.toLocaleString()} m²` : "N/A"}
                    </td>

                    {/* Timestamps */}
                    <td className="px-6 py-4 text-[#6b887a] text-[11px]">
                      <div>{new Date(parcel.updatedAt).toLocaleDateString("en-IN")}</div>
                      {parcel.verifiedAt && (
                        <div className="text-[10px] text-[#2d6a4f] font-semibold">
                          Verified: {new Date(parcel.verifiedAt).toLocaleDateString("en-IN")}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedParcel(parcel)}
                          className="rounded-lg border border-[#e2dad0] bg-white px-3 py-1.5 text-[11px] font-bold text-[#2d6a4f] hover:bg-[#f3efe6] transition cursor-pointer shadow-sm"
                        >
                          View Details
                        </button>

                        {parcel.hasGeometry ? (
                          <Link
                            href={`/government/cadastral-map?buildingId=${parcel.id}`}
                            className="rounded-lg bg-[#2d6a4f] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#1b4332] transition"
                            title="View on Map"
                          >
                            Map
                          </Link>
                        ) : (
                          <span
                            className="rounded-lg border border-[#e2dad0]/50 bg-[#f8f5ee] px-2.5 py-1.5 text-[10px] font-semibold text-[#6b887a]/60 cursor-not-allowed"
                            title="Map location unavailable"
                          >
                            Map
                          </span>
                        )}

                        {parcel.firstUnitId ? (
                          <Link
                            href={`/properties/${parcel.firstUnitId}`}
                            className="rounded-lg border border-[#2d6a4f]/30 bg-[#2d6a4f]/10 px-2.5 py-1.5 text-[11px] font-bold text-[#2d6a4f] hover:bg-[#2d6a4f]/20 transition"
                            title="View 3D Property Inspection"
                          >
                            3D
                          </Link>
                        ) : (
                          <span
                            className="rounded-lg border border-[#e2dad0]/50 bg-[#f8f5ee] px-2 py-1.5 text-[10px] font-semibold text-[#6b887a]/60 cursor-not-allowed"
                            title="3D geometry unavailable"
                          >
                            3D
                          </span>
                        )}
                      </div>
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
                <span className="font-bold text-[#162a21]">{data.total}</span> land parcels
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

      {/* Parcel Details Modal */}
      {selectedParcel && (
        <ParcelDetailsModal
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
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

function ParcelDetailsModal({
  parcel,
  onClose,
}: {
  parcel: GovernmentLandParcelItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#e2dad0] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={parcel.approvalStatus} />
              <span className="text-[10px] font-mono font-bold text-[#6b887a]">
                ID: {parcel.id}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#162a21]">
              {parcel.name}
            </h2>
            <p className="text-xs text-[#6b887a] mt-0.5">
              National 3D Land Parcel & Cadastral Structure Details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e2dad0] bg-[#f8f5ee] p-2 text-[#162a21] hover:bg-[#e2dad0] transition cursor-pointer"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0]">
            <span className="block text-[10px] font-bold text-[#6b887a] uppercase">
              Total Floors
            </span>
            <span className="font-extrabold text-[#162a21] text-base">
              {parcel.totalFloors}
            </span>
          </div>

          <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0]">
            <span className="block text-[10px] font-bold text-[#6b887a] uppercase">
              Property Units
            </span>
            <span className="font-extrabold text-[#162a21] text-base">
              {parcel.totalUnits}
            </span>
          </div>

          <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0]">
            <span className="block text-[10px] font-bold text-[#6b887a] uppercase">
              Total Floor Area
            </span>
            <span className="font-extrabold text-[#2d6a4f] text-base">
              {parcel.totalAreaSqM > 0 ? `${parcel.totalAreaSqM.toLocaleString()} m²` : "N/A"}
            </span>
          </div>
        </div>

        {/* GIS & Location Details */}
        <div className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] p-4 space-y-2 text-xs">
          <h3 className="font-extrabold text-[#162a21] border-b border-[#e2dad0] pb-2">
            Spatial & GIS Location
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#162a21]">
            <div>
              <span className="text-[#6b887a] block text-[10px]">Latitude:</span>
              <span className="font-mono font-bold">
                {parcel.hasGeometry ? `${parcel.latitude.toFixed(6)}° N` : "Not available"}
              </span>
            </div>
            <div>
              <span className="text-[#6b887a] block text-[10px]">Longitude:</span>
              <span className="font-mono font-bold">
                {parcel.hasGeometry ? `${parcel.longitude.toFixed(6)}° E` : "Not available"}
              </span>
            </div>
            <div>
              <span className="text-[#6b887a] block text-[10px]">Created At:</span>
              <span className="font-semibold">{new Date(parcel.createdAt).toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-[#6b887a] block text-[10px]">Verified Date:</span>
              <span className="font-semibold text-[#2d6a4f]">
                {parcel.verifiedAt ? new Date(parcel.verifiedAt).toLocaleString("en-IN") : "Not verified"}
              </span>
            </div>
          </div>
        </div>

        {/* Floor Breakdown Table */}
        <div className="space-y-2 text-xs">
          <h3 className="font-extrabold text-[#162a21]">Floor Breakdown</h3>
          {parcel.floors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e2dad0] bg-[#f8f5ee] p-4 text-center text-[#6b887a]">
              No floor data recorded for this land parcel structure.
            </div>
          ) : (
            <div className="rounded-xl border border-[#e2dad0] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8f5ee] text-[10px] font-bold uppercase text-[#6b887a] border-b border-[#e2dad0]">
                  <tr>
                    <th className="p-2.5">Floor Level</th>
                    <th className="p-2.5">Elevation (m)</th>
                    <th className="p-2.5">Height (m)</th>
                    <th className="p-2.5 text-right">Units Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2dad0]/60">
                  {parcel.floors.map((f) => (
                    <tr key={f.id} className="hover:bg-[#fdfbf7]">
                      <td className="p-2.5 font-bold text-[#162a21]">Floor {f.floorNumber}</td>
                      <td className="p-2.5 text-[#6b887a] font-mono">{f.elevation} m</td>
                      <td className="p-2.5 text-[#6b887a] font-mono">{f.height} m</td>
                      <td className="p-2.5 text-right font-bold text-[#2d6a4f]">{f.unitsCount} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e2dad0] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e2dad0] bg-white px-4 py-2 text-xs font-bold text-[#162a21] hover:bg-[#f3efe6] transition cursor-pointer"
          >
            Close
          </button>

          {parcel.hasGeometry ? (
            <Link
              href={`/government/cadastral-map?buildingId=${parcel.id}`}
              className="rounded-xl bg-[#2d6a4f] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-sm"
            >
              View on Map
            </Link>
          ) : (
            <span className="rounded-xl border border-[#e2dad0]/50 bg-[#f8f5ee] px-4 py-2 text-xs font-semibold text-[#6b887a]/60 cursor-not-allowed">
              Map location unavailable
            </span>
          )}

          {parcel.firstUnitId ? (
            <Link
              href={`/properties/${parcel.firstUnitId}`}
              className="rounded-xl border border-[#2d6a4f] bg-[#2d6a4f]/10 px-4 py-2 text-xs font-bold text-[#2d6a4f] hover:bg-[#2d6a4f]/20 transition"
            >
              3D Property View
            </Link>
          ) : (
            <span className="rounded-xl border border-[#e2dad0]/50 bg-[#f8f5ee] px-4 py-2 text-xs font-semibold text-[#6b887a]/60 cursor-not-allowed">
              3D geometry unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
