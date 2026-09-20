"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/src/components/PageShell";
import { getPublicRegistryRecords } from "@/src/app/actions/getPublicBuildings";

interface LandRecord {
  id: string;
  ulpin: string | null;
  unitNumber: string;
  buildingId: string;
  buildingName: string;
  floorNumber: number;
  spaceType: string;
  area: number;
  latitude: number;
  longitude: number;
  verifiedAt: string | null;
  approvalStatus: string;
  hasGeometry: boolean;
}

type SortField = "ulpin" | "unitNumber" | "id" | "area" | "spaceType" | "buildingName";
type SortOrder = "asc" | "desc";
type ThreeDFilterOption = "ALL" | "WITH_3D" | "WITHOUT_3D";

export default function LandRecordsPage() {
  const router = useRouter();

  const [records, setRecords] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Filter, Sort, Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpaceType, setSelectedSpaceType] = useState<string>("ALL");
  const [threeDFilter, setThreeDFilter] = useState<ThreeDFilterOption>("ALL");
  const [sortField, setSortField] = useState<SortField>("ulpin");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const res = await getPublicRegistryRecords();
        if (isMounted) {
          if (res.success && Array.isArray(res.records)) {
            setRecords(res.records);
          } else {
            setError("Unable to load public land records.");
            setRecords([]);
          }
        }
      } catch (err) {
        console.error("Failed to load public land records:", err);
        if (isMounted) {
          setError("Unable to load public land records.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    getPublicRegistryRecords()
      .then((res) => {
        if (res.success && Array.isArray(res.records)) {
          setRecords(res.records);
        } else {
          setError("Unable to load public land records.");
          setRecords([]);
        }
      })
      .catch((err) => {
        console.error("Failed to reload land records:", err);
        setError("Unable to load public land records.");
      })
      .finally(() => setLoading(false));
  };

  // Extract unique land use / space types for filter dropdown
  const spaceTypes = useMemo(() => {
    const types = new Set<string>();
    records.forEach((r) => {
      if (r.spaceType) types.add(r.spaceType);
    });
    return Array.from(types).sort();
  }, [records]);

  // Search & Filter records
  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return records.filter((record) => {
      // Filter by space type / land use
      if (selectedSpaceType !== "ALL" && record.spaceType !== selectedSpaceType) {
        return false;
      }

      // Filter by 3D availability
      if (threeDFilter === "WITH_3D" && !record.hasGeometry) {
        return false;
      }
      if (threeDFilter === "WITHOUT_3D" && record.hasGeometry) {
        return false;
      }

      if (!query) return true;

      const ulpinMatch = record.ulpin ? record.ulpin.toLowerCase().includes(query) : false;
      const unitNumMatch = record.unitNumber.toLowerCase().includes(query);
      const buildingNameMatch = record.buildingName.toLowerCase().includes(query);
      const spaceTypeMatch = record.spaceType.toLowerCase().includes(query);
      const idMatch = record.id.toLowerCase().includes(query);

      return ulpinMatch || unitNumMatch || buildingNameMatch || spaceTypeMatch || idMatch;
    });
  }, [records, searchQuery, selectedSpaceType, threeDFilter]);

  // Sorting
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];

    list.sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      if (sortField === "ulpin") {
        valA = a.ulpin || "ZZZZZZ";
        valB = b.ulpin || "ZZZZZZ";
      } else if (sortField === "unitNumber") {
        valA = a.unitNumber || "";
        valB = b.unitNumber || "";
      } else if (sortField === "id") {
        valA = a.id || "";
        valB = b.id || "";
      } else if (sortField === "area") {
        valA = a.area || 0;
        valB = b.area || 0;
      } else if (sortField === "spaceType") {
        valA = a.spaceType || "";
        valB = b.spaceType || "";
      } else if (sortField === "buildingName") {
        valA = a.buildingName || "";
        valB = b.buildingName || "";
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredRecords, sortField, sortOrder]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleSpaceTypeChange = (val: string) => {
    setSelectedSpaceType(val);
    setCurrentPage(1);
  };

  const handleThreeDFilterChange = (val: ThreeDFilterOption) => {
    setThreeDFilter(val);
    setCurrentPage(1);
  };

  // Pagination
  const totalRecords = sortedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSpaceType("ALL");
    setThreeDFilter("ALL");
    setSortField("ulpin");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const handleViewOnMap = (record: LandRecord) => {
    router.push(`/?propertyId=${record.id}&buildingId=${record.buildingId}`);
  };

  const handleViewIn3D = (record: LandRecord) => {
    router.push(`/properties/${record.id}`);
  };

  return (
    <PageShell
      roleMode="PUBLIC_VIEWER"
      userRole={null}
      onRoleModeChange={() => {}}
      activeSection="land-records"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-[#162a21]">
        {/* PAGE HEADER */}
        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="rounded bg-[#2d6a4f]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#2d6a4f] uppercase tracking-wider">
                NATIONAL CADASTRAL DATABASE
              </span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                PUBLIC LAND RECORDS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#162a21] tracking-tight">
              Land Records
            </h1>
            <p className="text-xs font-medium text-[#6b887a] mt-1">
              Browse publicly available land and property records linked with BhuVista.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#e2dad0] px-4 py-2.5 text-xs font-bold text-[#2d6a4f] hover:bg-[#f3efe6] transition shadow-sm"
            >
              ← Back to Cadastral Map
            </Link>
          </div>
        </div>

        {/* SEARCH & FILTERS PANEL */}
        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* SEARCH INPUT */}
            <div className="md:col-span-5 relative">
              <label htmlFor="land-records-search" className="sr-only">
                Search Land Records
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#6b887a]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  id="land-records-search"
                  type="text"
                  placeholder="Search by ULPIN, Survey Number, Property ID, Location..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full rounded-xl border border-[#e2dad0] bg-white pl-10 pr-9 py-2.5 text-xs text-[#162a21] placeholder-[#6b887a] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 transition font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    aria-label="Clear search query"
                    className="absolute right-3 text-[#6b887a] hover:text-[#162a21]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* SPACE TYPE / LAND USE FILTER */}
            <div className="md:col-span-3">
              <label htmlFor="land-use-filter" className="sr-only">
                Filter by Land Use
              </label>
              <select
                id="land-use-filter"
                value={selectedSpaceType}
                onChange={(e) => handleSpaceTypeChange(e.target.value)}
                className="w-full rounded-xl border border-[#e2dad0] bg-white px-3 py-2.5 text-xs font-bold text-[#162a21] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 cursor-pointer"
              >
                <option value="ALL">All Land Use Types</option>
                {spaceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 3D MODEL FILTER */}
            <div className="md:col-span-2">
              <label htmlFor="3d-filter" className="sr-only">
                Filter by 3D Geometry
              </label>
              <select
                id="3d-filter"
                value={threeDFilter}
                onChange={(e) => handleThreeDFilterChange(e.target.value as ThreeDFilterOption)}
                className="w-full rounded-xl border border-[#e2dad0] bg-white px-3 py-2.5 text-xs font-bold text-[#162a21] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 cursor-pointer"
              >
                <option value="ALL">All Models</option>
                <option value="WITH_3D">3D Model Available</option>
                <option value="WITHOUT_3D">2D Map Only</option>
              </select>
            </div>

            {/* SORT FIELD SELECTOR & ORDER */}
            <div className="md:col-span-2 flex items-center gap-2">
              <label htmlFor="land-records-sort" className="sr-only">
                Sort Land Records
              </label>
              <select
                id="land-records-sort"
                value={sortField}
                onChange={(e) => handleSortChange(e.target.value as SortField)}
                className="w-full rounded-xl border border-[#e2dad0] bg-white px-3 py-2.5 text-xs font-bold text-[#162a21] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 cursor-pointer"
              >
                <option value="ulpin">Sort: ULPIN</option>
                <option value="unitNumber">Sort: Survey #</option>
                <option value="area">Sort: Area</option>
                <option value="spaceType">Sort: Land Use</option>
                <option value="buildingName">Sort: Location</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                title={`Sort Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e2dad0] bg-white text-xs font-bold text-[#2d6a4f] hover:bg-[#f3efe6] transition cursor-pointer"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* ACTIVE FILTER SUMMARY & RESET */}
          {(searchQuery || selectedSpaceType !== "ALL" || threeDFilter !== "ALL") && (
            <div className="flex items-center justify-between border-t border-[#e2dad0]/60 pt-3 text-xs">
              <span className="text-[#6b887a] font-medium">
                Filtering land records by active criteria
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="font-bold text-[#2d6a4f] hover:underline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-12 text-center shadow-sm">
            <div className="inline-flex items-center gap-3 rounded-full bg-[#2d6a4f]/10 px-5 py-2 text-xs font-bold text-[#2d6a4f]">
              <span className="h-2 w-2 rounded-full bg-[#2d6a4f] animate-pulse" />
              Retrieving public land records from BhuVista registry...
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
              Unable to Load Land Records
            </h3>
            <p className="text-xs text-[#6b887a] max-w-md mx-auto">
              {error}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center rounded-xl bg-[#2d6a4f] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-md"
            >
              Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE (NO PUBLIC RECORDS IN DB AT ALL) */}
        {!loading && !error && records.length === 0 && (
          <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-12 text-center shadow-sm space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] text-xl font-bold">
              🏛️
            </div>
            <h3 className="text-lg font-extrabold text-[#162a21]">
              No Public Land Records Available
            </h3>
            <p className="text-xs text-[#6b887a] max-w-md mx-auto">
              No publicly verified land records are currently available in the BhuVista database.
            </p>
          </div>
        )}

        {/* NO SEARCH RESULTS STATE */}
        {!loading && !error && records.length > 0 && totalRecords === 0 && (
          <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-12 text-center shadow-sm space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xl font-bold">
              🔍
            </div>
            <h3 className="text-lg font-extrabold text-[#162a21]">
              No Matching Land Records Found
            </h3>
            <p className="text-xs text-[#6b887a] max-w-md mx-auto">
              No land records match your search query or active filter selections.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center rounded-xl bg-[#2d6a4f] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-md"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* LAND RECORDS LIST / TABLE */}
        {!loading && !error && totalRecords > 0 && (
          <div className="space-y-4">
            {/* RESULTS STATS HEADER */}
            <div className="flex items-center justify-between text-xs text-[#6b887a] font-medium px-1">
              <span>
                Showing <strong className="text-[#162a21]">{(currentPage - 1) * pageSize + 1}</strong>–
                <strong className="text-[#162a21]">{Math.min(currentPage * pageSize, totalRecords)}</strong> of{" "}
                <strong className="text-[#162a21]">{totalRecords}</strong> public land records
              </span>
              <span>
                Page <strong className="text-[#162a21]">{currentPage}</strong> of{" "}
                <strong className="text-[#162a21]">{totalPages}</strong>
              </span>
            </div>

            {/* DESKTOP/TABLET TABLE VIEW */}
            <div className="hidden sm:block rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse" aria-label="Public Land Records">
                  <thead>
                    <tr className="border-b border-[#e2dad0] bg-[#f8f5ee] text-[#2d6a4f] font-extrabold uppercase text-[10px] tracking-wider">
                      <th scope="col" className="py-3.5 px-4 cursor-pointer hover:bg-[#eae3d5]" onClick={() => handleSortChange("ulpin")}>
                        ULPIN {sortField === "ulpin" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                      </th>
                      <th scope="col" className="py-3.5 px-4 cursor-pointer hover:bg-[#eae3d5]" onClick={() => handleSortChange("unitNumber")}>
                        Survey / Parcel # {sortField === "unitNumber" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                      </th>
                      <th scope="col" className="py-3.5 px-4 cursor-pointer hover:bg-[#eae3d5]" onClick={() => handleSortChange("spaceType")}>
                        Land Use {sortField === "spaceType" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                      </th>
                      <th scope="col" className="py-3.5 px-4 cursor-pointer hover:bg-[#eae3d5]" onClick={() => handleSortChange("area")}>
                        Area {sortField === "area" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                      </th>
                      <th scope="col" className="py-3.5 px-4 cursor-pointer hover:bg-[#eae3d5]" onClick={() => handleSortChange("buildingName")}>
                        Location / Structure {sortField === "buildingName" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                      </th>
                      <th scope="col" className="py-3.5 px-4">
                        Status
                      </th>
                      <th scope="col" className="py-3.5 px-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2dad0]/60 text-[#162a21]">
                    {paginatedRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-[#f3efe6]/80 transition">
                        {/* ULPIN */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#2d6a4f] whitespace-nowrap">
                          {record.ulpin ? (
                            <span className="rounded bg-[#2d6a4f]/10 px-2 py-0.5 text-xs font-bold text-[#2d6a4f]">
                              {record.ulpin}
                            </span>
                          ) : (
                            <span className="text-[#6b887a] italic font-sans font-medium text-[11px]">
                              Pending Assignment
                            </span>
                          )}
                        </td>

                        {/* SURVEY NUMBER / PARCEL ID */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-[#162a21]">Unit {record.unitNumber}</div>
                          <div className="text-[10px] text-[#6b887a] font-mono truncate max-w-[120px]">
                            {record.id}
                          </div>
                        </td>

                        {/* LAND USE */}
                        <td className="py-3.5 px-4 font-semibold text-[#2d6a4f] whitespace-nowrap">
                          {record.spaceType}
                        </td>

                        {/* AREA */}
                        <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                          {record.area ? `${record.area} m²` : "N/A"}
                        </td>

                        {/* BUILDING / LOCATION */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <div className="font-bold text-[#162a21] truncate">
                            {record.buildingName}
                          </div>
                          <div className="text-[10px] text-[#6b887a] truncate">
                            📍 {record.latitude.toFixed(5)}° N, {record.longitude.toFixed(5)}° E
                          </div>
                        </td>

                        {/* STATUS & 3D BADGES */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                              ✓ APPROVED
                            </span>
                            {record.hasGeometry && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#2d6a4f]/10 px-2 py-0.5 text-[9px] font-extrabold text-[#2d6a4f]">
                                🧊 3D Available
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                            <Link
                              href={`/properties/${record.id}`}
                              className="rounded-lg bg-white border border-[#e2dad0] px-2.5 py-1 text-[11px] font-bold text-[#2d6a4f] hover:bg-[#f3efe6] transition shadow-xs"
                            >
                              View Details
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleViewOnMap(record)}
                              className="rounded-lg bg-white border border-[#2d6a4f] px-2.5 py-1 text-[11px] font-bold text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition shadow-xs cursor-pointer"
                            >
                              View on Map
                            </button>

                            {/* View in 3D Button strictly displayed only if record has 3D geometry */}
                            {record.hasGeometry && (
                              <button
                                type="button"
                                onClick={() => handleViewIn3D(record)}
                                className="rounded-lg bg-[#2d6a4f] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#1b4332] transition shadow-xs cursor-pointer"
                              >
                                View in 3D
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARDS VIEW */}
            <div className="sm:hidden space-y-3">
              {paginatedRecords.map((record) => (
                <div
                  key={record.id}
                  className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-4 shadow-sm space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-[#e2dad0] pb-2">
                    <div>
                      <div className="font-mono font-bold text-[#2d6a4f] text-sm">
                        {record.ulpin ? record.ulpin : "Pending ULPIN"}
                      </div>
                      <div className="text-[11px] text-[#6b887a] font-medium mt-0.5">
                        Survey / Unit #{record.unitNumber} • Floor {record.floorNumber}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-emerald-800">
                      ✓ APPROVED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#6b887a] font-medium block">Land Use</span>
                      <span className="font-bold text-[#162a21]">{record.spaceType}</span>
                    </div>
                    <div>
                      <span className="text-[#6b887a] font-medium block">Area</span>
                      <span className="font-bold text-[#162a21]">{record.area ? `${record.area} m²` : "N/A"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#6b887a] font-medium block">Structure / Location</span>
                      <span className="font-bold text-[#162a21]">{record.buildingName}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#e2dad0]/60 flex items-center justify-end gap-2 flex-wrap">
                    <Link
                      href={`/properties/${record.id}`}
                      className="rounded-lg bg-white border border-[#e2dad0] px-3 py-1 text-xs font-bold text-[#2d6a4f]"
                    >
                      View Details
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleViewOnMap(record)}
                      className="rounded-lg bg-white border border-[#2d6a4f] px-3 py-1 text-xs font-bold text-[#2d6a4f]"
                    >
                      View on Map
                    </button>

                    {record.hasGeometry && (
                      <button
                        type="button"
                        onClick={() => handleViewIn3D(record)}
                        className="rounded-lg bg-[#2d6a4f] px-3 py-1 text-xs font-bold text-white"
                      >
                        View in 3D
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    currentPage === 1
                      ? "border-[#e2dad0]/60 bg-[#f8f5ee] text-[#6b887a]/50 cursor-not-allowed"
                      : "border-[#e2dad0] bg-white text-[#162a21] hover:bg-[#f3efe6]"
                  }`}
                >
                  ← Previous Page
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                        currentPage === page
                          ? "bg-[#2d6a4f] text-white shadow-xs"
                          : "bg-white border border-[#e2dad0] text-[#162a21] hover:bg-[#f3efe6]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    currentPage === totalPages
                      ? "border-[#e2dad0]/60 bg-[#f8f5ee] text-[#6b887a]/50 cursor-not-allowed"
                      : "border-[#e2dad0] bg-white text-[#162a21] hover:bg-[#f3efe6]"
                  }`}
                >
                  Next Page →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
