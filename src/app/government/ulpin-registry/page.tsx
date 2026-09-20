"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import {
  getGovernmentUlpinRegistry,
  GovernmentUlpinItem,
  GovernmentUlpinRegistryResult,
} from "@/src/app/actions/government";

export default function GovernmentUlpinRegistryPage() {
  const [data, setData] = useState<GovernmentUlpinRegistryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filter States
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filterUlpinStatus, setFilterUlpinStatus] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSpaceType, setFilterSpaceType] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal State for Selected ULPIN Record
  const [selectedRecord, setSelectedRecord] = useState<GovernmentUlpinItem | null>(null);

  const fetchRegistry = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGovernmentUlpinRegistry({
        search: activeSearch,
        filterUlpinStatus,
        filterStatus,
        filterSpaceType,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load ULPIN registry records.");
      }
    } catch (err) {
      console.error("Error fetching ULPIN registry:", err);
      setError("An unexpected network error occurred while loading ULPIN records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadRegistryData() {
      setLoading(true);
      setError(null);
      try {
        const res = await getGovernmentUlpinRegistry({
          search: activeSearch,
          filterUlpinStatus,
          filterStatus,
          filterSpaceType,
          page,
          limit,
          sortBy,
          sortOrder,
        });

        if (isMounted) {
          if (res.success && res.data) {
            setData(res.data);
          } else {
            setError(res.error || "Failed to load ULPIN registry records.");
          }
        }
      } catch (err) {
        console.error("Error fetching ULPIN registry:", err);
        if (isMounted) {
          setError("An unexpected network error occurred while loading ULPIN records.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRegistryData();

    return () => {
      isMounted = false;
    };
  }, [
    activeSearch,
    filterUlpinStatus,
    filterStatus,
    filterSpaceType,
    page,
    limit,
    sortBy,
    sortOrder,
  ]);

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
    setFilterUlpinStatus("ALL");
    setFilterStatus("ALL");
    setFilterSpaceType("ALL");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const hasActiveFilters =
    activeSearch !== "" ||
    filterUlpinStatus !== "ALL" ||
    filterStatus !== "ALL" ||
    filterSpaceType !== "ALL" ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  const metrics = data?.metrics;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <GovernmentPageHeader
        title="3D ULPIN Registry Management"
        description="Internal national Unique Land Parcel Identification Number tracking, assignment status, and cadastre linkages."
        action={
          <button
            type="button"
            onClick={fetchRegistry}
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
            <span>Refresh Registry</span>
          </button>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Records */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6b887a]">
              Total Parcels
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2d6a4f]/10 text-[#2d6a4f]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-[#162a21]">
            {metrics ? metrics.totalRecords : "—"}
          </div>
          <p className="text-[10px] text-[#6b887a]">Registered cadastral units</p>
        </div>

        {/* Assigned ULPINs */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6b887a]">
              Assigned ULPINs
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-emerald-800">
              {metrics ? `${metrics.assignedPercentage}%` : "—"}
            </span>
          </div>
          <div className="text-2xl font-black text-[#2d6a4f]">
            {metrics ? metrics.assignedCount : "—"}
          </div>
          <p className="text-[10px] text-[#6b887a]">14-digit ULPIN assigned</p>
        </div>

        {/* Unassigned Count */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6b887a]">
              Unassigned
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900">
            {metrics ? metrics.unassignedCount : "—"}
          </div>
          <p className="text-[10px] text-[#6b887a]">Pending ULPIN generation</p>
        </div>

        {/* Verified / Approved */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6b887a]">
              Verified Cadastre
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-[#162a21]">
            {metrics ? metrics.verifiedCount : "—"}
          </div>
          <p className="text-[10px] text-[#6b887a]">Approved parcel structures</p>
        </div>

        {/* Pending / Problematic */}
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6b887a]">
              Pending / Review
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-[#162a21]">
            {metrics ? metrics.pendingCount : "—"}
          </div>
          <p className="text-[10px] text-[#6b887a]">Under officer verification</p>
        </div>
      </div>

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
              <h3 className="font-extrabold text-sm text-red-950">Unable to Load ULPIN Registry</h3>
              <p className="text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchRegistry}
            className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 transition text-xs shrink-0 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ULPIN, Property ID, Unit Number, Building Name..."
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
            {/* ULPIN Status Filter */}
            <div className="flex items-center gap-1.5 min-w-[150px]">
              <label className="text-[11px] font-bold text-[#6b887a] shrink-0">ULPIN:</label>
              <select
                value={filterUlpinStatus}
                onChange={(e) => {
                  setFilterUlpinStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-3 py-2 text-xs font-bold text-[#162a21] outline-none focus:border-[#2d6a4f] cursor-pointer"
              >
                <option value="ALL">All ULPINs</option>
                <option value="ASSIGNED">Assigned Only</option>
                <option value="UNASSIGNED">Unassigned Only</option>
              </select>
            </div>

            {/* Verification Status Filter */}
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

            {/* Land Use Filter */}
            <div className="flex items-center gap-1.5 min-w-[150px]">
              <label className="text-[11px] font-bold text-[#6b887a] shrink-0">Land Use:</label>
              <select
                value={filterSpaceType}
                onChange={(e) => {
                  setFilterSpaceType(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-3 py-2 text-xs font-bold text-[#162a21] outline-none focus:border-[#2d6a4f] cursor-pointer"
              >
                <option value="ALL">All Space Types</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="OFFICE">Office</option>
                <option value="PUBLIC">Public</option>
                <option value="PARKING">Parking</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 min-w-[160px]">
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
                <option value="ulpin-asc">ULPIN (A-Z)</option>
                <option value="area-desc">Area (High-Low)</option>
                <option value="unitNumber-asc">Unit Number</option>
              </select>
            </div>

            {/* Reset Filters */}
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
              National ULPIN Cadastral Registry
            </h2>
            {data && (
              <span className="rounded-full bg-[#2d6a4f]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#2d6a4f]">
                {data.total} Matching
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
              Loading ULPIN registry records...
            </div>
          </div>
        )}

        {/* Empty Database State */}
        {!loading && data && data.total === 0 && !hasActiveFilters && (
          <div className="p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f5ee] border border-[#e2dad0] text-[#6b887a]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#162a21]">No ULPIN records currently available.</h3>
              <p className="text-xs text-[#6b887a] max-w-sm mx-auto mt-1">
                The local database currently contains zero registered ULPIN land parcel records.
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
              <h3 className="text-sm font-extrabold text-[#162a21]">No ULPIN records match your query.</h3>
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
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-[#e2dad0] bg-[#f8f5ee] text-[11px] font-bold uppercase tracking-wider text-[#6b887a]">
                  <th className="px-6 py-3.5">ULPIN Identifier</th>
                  <th className="px-6 py-3.5">Property ID & Survey #</th>
                  <th className="px-6 py-3.5">Structure & Location</th>
                  <th className="px-6 py-3.5">Land Use Classification</th>
                  <th className="px-6 py-3.5">Surface Area</th>
                  <th className="px-6 py-3.5">Verification Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2dad0]/60">
                {data.items.map((record) => (
                  <tr key={record.id} className="hover:bg-[#fdfbf7] transition">
                    {/* ULPIN */}
                    <td className="px-6 py-4 font-mono font-bold text-xs">
                      {record.ulpin ? (
                        <span className="inline-block rounded-md bg-[#2d6a4f]/10 border border-[#2d6a4f]/20 px-2.5 py-1 text-[#2d6a4f]">
                          {record.ulpin}
                        </span>
                      ) : (
                        <span className="inline-block rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-amber-800 text-[11px] font-sans font-bold">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Property ID & Unit Number */}
                    <td className="px-6 py-4 text-[#162a21]">
                      <div className="font-bold">Unit {record.unitNumber}</div>
                      <div className="text-[10px] font-mono text-[#6b887a] mt-0.5">
                        ID: {record.id}
                      </div>
                    </td>

                    {/* Building Name & Coordinates */}
                    <td className="px-6 py-4 text-[#162a21]">
                      <div className="font-bold truncate max-w-[200px]">
                        {record.buildingName}
                      </div>
                      <div className="text-[10px] text-[#6b887a] font-mono">
                        Floor {record.floorNumber} • {record.latitude.toFixed(4)}° N, {record.longitude.toFixed(4)}° E
                      </div>
                    </td>

                    {/* Land Use / Space Type */}
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-md bg-[#f8f5ee] border border-[#e2dad0] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#162a21]">
                        {record.spaceType}
                      </span>
                    </td>

                    {/* Surface Area */}
                    <td className="px-6 py-4 font-bold text-[#162a21]">
                      {record.area > 0 ? `${record.area} m²` : "N/A"}
                    </td>

                    {/* Verification Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={record.approvalStatus} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(record)}
                          className="rounded-lg border border-[#e2dad0] bg-white px-3 py-1.5 text-[11px] font-bold text-[#2d6a4f] hover:bg-[#f3efe6] transition cursor-pointer shadow-sm"
                        >
                          Details
                        </button>

                        <Link
                          href={`/government/cadastral-map?buildingId=${record.buildingId}`}
                          className="rounded-lg bg-[#2d6a4f] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#1b4332] transition"
                          title="View on Map"
                        >
                          Map
                        </Link>

                        <Link
                          href={`/properties/${record.id}`}
                          className="rounded-lg border border-[#2d6a4f]/30 bg-[#2d6a4f]/10 px-2.5 py-1.5 text-[11px] font-bold text-[#2d6a4f] hover:bg-[#2d6a4f]/20 transition"
                          title="View 3D Property"
                        >
                          3D
                        </Link>
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
                <span className="font-bold text-[#162a21]">{data.total}</span> ULPIN records
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

      {/* ULPIN Record Detail Modal */}
      {selectedRecord && (
        <UlpinRecordDetailsModal
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

function UlpinRecordDetailsModal({
  record,
  onClose,
}: {
  record: GovernmentUlpinItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#e2dad0] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={record.approvalStatus} />
              <span className="text-[10px] font-mono font-bold text-[#2d6a4f] bg-[#2d6a4f]/10 px-2 py-0.5 rounded">
                Unit {record.unitNumber}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#162a21]">
              ULPIN Record Specification
            </h2>
            <p className="text-xs font-mono text-[#2d6a4f] font-bold mt-1">
              {record.ulpin ? `ULPIN: ${record.ulpin}` : "ULPIN: Pending Assignment"}
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

        {/* Primary Attribute Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0]">
            <span className="block text-[10px] font-bold text-[#6b887a] uppercase">
              Property ID
            </span>
            <span className="font-mono font-bold text-[#162a21] text-xs truncate block">
              {record.id}
            </span>
          </div>

          <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0]">
            <span className="block text-[10px] font-bold text-[#6b887a] uppercase">
              Floor Level
            </span>
            <span className="font-extrabold text-[#162a21] text-base">
              Floor {record.floorNumber}
            </span>
          </div>

          <div className="rounded-xl bg-[#f8f5ee] p-3 border border-[#e2dad0]">
            <span className="block text-[10px] font-bold text-[#6b887a] uppercase">
              Surface Area
            </span>
            <span className="font-extrabold text-[#2d6a4f] text-base">
              {record.area > 0 ? `${record.area} m²` : "N/A"}
            </span>
          </div>
        </div>

        {/* Spatial & Parent Structure Details */}
        <div className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] p-4 space-y-2 text-xs">
          <h3 className="font-extrabold text-[#162a21] border-b border-[#e2dad0] pb-2">
            Parent Structure & Cadastral Attributes
          </h3>

          <div className="space-y-2 text-[#162a21]">
            <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
              <span className="text-[#6b887a]">Building Structure:</span>
              <span className="font-bold truncate max-w-[220px]">{record.buildingName}</span>
            </div>
            <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
              <span className="text-[#6b887a]">Space Classification:</span>
              <span className="font-bold uppercase text-[#2d6a4f]">{record.spaceType}</span>
            </div>
            <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
              <span className="text-[#6b887a]">Floor Elevation / Height:</span>
              <span className="font-mono font-bold">{record.elevation}m elevation / {record.height}m height</span>
            </div>
            <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
              <span className="text-[#6b887a]">GPS Coordinates:</span>
              <span className="font-mono font-bold text-[#2d6a4f]">
                {record.latitude.toFixed(5)}° N, {record.longitude.toFixed(5)}° E
              </span>
            </div>
            <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
              <span className="text-[#6b887a]">3D Polygon Geometry:</span>
              <span className={`font-bold ${record.hasGeometry ? "text-emerald-700" : "text-amber-700"}`}>
                {record.hasGeometry ? "✓ Indexed in Cadastral Polygon Database" : "⚠ Boundary geometry unindexed"}
              </span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-[#6b887a]">Record Registered:</span>
              <span className="font-semibold">{new Date(record.createdAt).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e2dad0] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e2dad0] bg-white px-4 py-2 text-xs font-bold text-[#162a21] hover:bg-[#f3efe6] transition cursor-pointer"
          >
            Close
          </button>

          <Link
            href={`/government/cadastral-map?buildingId=${record.buildingId}`}
            className="rounded-xl bg-[#2d6a4f] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-sm"
          >
            View on Map
          </Link>

          <Link
            href={`/properties/${record.id}`}
            className="rounded-xl border border-[#2d6a4f] bg-[#2d6a4f]/10 px-4 py-2 text-xs font-bold text-[#2d6a4f] hover:bg-[#2d6a4f]/20 transition"
          >
            View 3D Property
          </Link>
        </div>
      </div>
    </div>
  );
}
