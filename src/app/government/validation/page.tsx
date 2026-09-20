"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import {
  getGovernmentValidationList,
  getGovernmentValidationRecordDetails,
  GovernmentValidationItem,
  GovernmentValidationMetrics,
} from "@/src/app/actions/government";
import RealWorldMapViewer from "@/src/components/RealWorldMapViewer";
import VolumetricViewer from "@/src/components/VolumetricViewer";
import type { ParsedBuilding } from "@/src/lib/parser/types";

export default function GovernmentValidationPage() {
  const [metrics, setMetrics] = useState<GovernmentValidationMetrics>({
    totalInspected: 0,
    passCount: 0,
    warningCount: 0,
    failCount: 0,
    qualityPassRate: 0,
  });

  const [items, setItems] = useState<GovernmentValidationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterValStatus, setFilterValStatus] = useState("ALL");
  const [filterVerStatus, setFilterVerStatus] = useState("ALL");
  const [filterGeomType, setFilterGeomType] = useState("ALL");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Detail Modal / Drawer State
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [activeDetailView, setActiveDetailView] = useState<"CHECKS" | "MAP" | "3D">("CHECKS");

  // Load Validation List
  const loadValidationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getGovernmentValidationList({
        search,
        filterValidationStatus: filterValStatus,
        filterVerificationStatus: filterVerStatus,
        filterGeometryType: filterGeomType,
        page,
        limit,
      });

      if (res.success && res.data) {
        setMetrics(res.data.metrics);
        setItems(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotalRecords(res.data.total);
      } else {
        setError(res.error || "Failed to load government validation data.");
      }
    } catch {
      setError("Server error while connecting to GIS validation service.");
    } finally {
      setLoading(false);
    }
  }, [search, filterValStatus, filterVerStatus, filterGeomType, page, limit]);

  useEffect(() => {
    loadValidationData();
  }, [loadValidationData]);

  // Load record details for drawer
  const handleInspectRecord = async (propertyId: string) => {
    try {
      setSelectedPropertyId(propertyId);
      setDetailLoading(true);
      setActiveDetailView("CHECKS");
      const res = await getGovernmentValidationRecordDetails(propertyId);
      if (res.success && res.data) {
        setDetailData(res.data);
      } else {
        setDetailData(null);
      }
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilterValStatus("ALL");
    setFilterVerStatus("ALL");
    setFilterGeomType("ALL");
    setPage(1);
  };

  // Convert property detail record to ParsedBuilding shape for RealWorldMapViewer preview
  const mapPreviewBuilding: ParsedBuilding | null = detailData?.property
    ? {
        id: String(detailData.property.buildingId),
        name: String(detailData.property.buildingName || "Cadastral Structure"),
        georeference: {
          latitude: Number(detailData.property.latitude) || 18.5204,
          longitude: Number(detailData.property.longitude) || 73.8567,
        },
        floors: [
          {
            floorNumber: Number(detailData.property.floorNumber) || 1,
            elevation: Number(detailData.property.elevation) || 0,
            height: Number(detailData.property.height) || 3.2,
            units: [
              {
                id: String(detailData.property.id),
                unitNumber: String(detailData.property.unitNumber || "UNIT"),
                floorNumber: Number(detailData.property.floorNumber) || 1,
                area: Number(detailData.property.area) || 0,
                spaceType: detailData.property.spaceType || "RESIDENTIAL",
                ulpin: detailData.property.ulpin || undefined,
                polygon: detailData.property.polygon || [],
              },
            ],
          },
        ],
      }
    : null;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* PAGE HEADER */}
      <GovernmentPageHeader
        title="Internal GIS & Data Validation"
        description="Automated spatial topology verification, 3D boundary overlap detection, vertical clearance checking, and ULPIN quality control."
      />

      {/* DASHBOARD SUMMARY METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-4 shadow-sm">
          <div className="text-[10px] font-extrabold text-[#6b887a] uppercase tracking-wider">
            Total Inspected Records
          </div>
          <div className="text-2xl font-black text-[#162a21] mt-1">
            {metrics.totalInspected}
          </div>
          <div className="text-[10px] font-medium text-[#3d5a4c] mt-0.5">
            Evaluated in Real-Time
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
            Valid (Pass)
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 flex items-center gap-1.5">
            <span>✓</span>
            <span>{metrics.passCount}</span>
          </div>
          <div className="text-[10px] font-medium text-emerald-800 mt-0.5">
            Zero Spatial Issues
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
            Warnings
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1 flex items-center gap-1.5">
            <span>!</span>
            <span>{metrics.warningCount}</span>
          </div>
          <div className="text-[10px] font-medium text-amber-800 mt-0.5">
            Requires Attention
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 shadow-sm">
          <div className="text-[10px] font-extrabold text-red-800 uppercase tracking-wider">
            Failed
          </div>
          <div className="text-2xl font-black text-red-700 mt-1 flex items-center gap-1.5">
            <span>✕</span>
            <span>{metrics.failCount}</span>
          </div>
          <div className="text-[10px] font-medium text-red-800 mt-0.5">
            Critical Geometry Faults
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-4 shadow-sm">
          <div className="text-[10px] font-extrabold text-[#6b887a] uppercase tracking-wider">
            GIS Quality Rate
          </div>
          <div className="text-2xl font-black text-[#2d6a4f] mt-1">
            {metrics.qualityPassRate}%
          </div>
          <div className="text-[10px] font-medium text-[#3d5a4c] mt-0.5">
            Topological Compliance
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800 shadow-sm">
          ⚠️ {error}
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 min-w-[260px]">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Property ID, ULPIN, Building, or Space Type..."
              className="w-full rounded-xl border border-[#e2dad0] bg-white px-4 py-2.5 pl-10 text-xs text-[#162a21] placeholder-[#6b887a] focus:border-[#2d6a4f] focus:outline-none shadow-sm"
            />
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-[#6b887a]"
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
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Validation Status Filter */}
            <select
              value={filterValStatus}
              onChange={(e) => {
                setFilterValStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[#e2dad0] bg-white px-3 py-2 text-xs font-semibold text-[#162a21] focus:border-[#2d6a4f] focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="ALL">Validation: All Statuses</option>
              <option value="PASS">Validation: PASS Only</option>
              <option value="WARNING">Validation: WARNING Only</option>
              <option value="FAIL">Validation: FAIL Only</option>
            </select>

            {/* Verification Status Filter */}
            <select
              value={filterVerStatus}
              onChange={(e) => {
                setFilterVerStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[#e2dad0] bg-white px-3 py-2 text-xs font-semibold text-[#162a21] focus:border-[#2d6a4f] focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="ALL">Verification: All</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Geometry Type Filter */}
            <select
              value={filterGeomType}
              onChange={(e) => {
                setFilterGeomType(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[#e2dad0] bg-white px-3 py-2 text-xs font-semibold text-[#162a21] focus:border-[#2d6a4f] focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="ALL">Geometry: All Types</option>
              <option value="Volumetric 3D">Volumetric 3D</option>
              <option value="No Geometry">No Geometry</option>
            </select>

            {(search ||
              filterValStatus !== "ALL" ||
              filterVerStatus !== "ALL" ||
              filterGeomType !== "ALL") && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VALIDATION DATA TABLE */}
      <div className="rounded-2xl border border-[#e2dad0] bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2d6a4f] border-r-transparent" />
            <p className="text-xs font-bold text-[#3d5a4c]">
              Evaluating Real Spatial Records & Topology Rules...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2d6a4f]/10 text-[#2d6a4f]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-extrabold text-[#162a21]">
              No Validation Records Found
            </h3>
            <p className="text-xs text-[#6b887a] max-w-sm mx-auto">
              No registered property or parcel records match the selected validation criteria.
            </p>
            {(search ||
              filterValStatus !== "ALL" ||
              filterVerStatus !== "ALL" ||
              filterGeomType !== "ALL") && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#162a21]">
              <thead className="bg-[#f8f5ee] border-b border-[#e2dad0] text-[10px] uppercase font-black tracking-wider text-[#6b887a]">
                <tr>
                  <th className="px-5 py-3.5">Property / Building ID</th>
                  <th className="px-5 py-3.5">3D ULPIN Identity</th>
                  <th className="px-5 py-3.5">Geometry Type</th>
                  <th className="px-5 py-3.5">Validation Status</th>
                  <th className="px-5 py-3.5">Detected Issue</th>
                  <th className="px-5 py-3.5">Verification</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2dad0]/60">
                {items.map((item) => {
                  const valBadgeClass =
                    item.validationStatus === "PASS"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : item.validationStatus === "WARNING"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-red-100 text-red-800 border-red-300";

                  const verBadgeClass =
                    item.verificationStatus === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : item.verificationStatus === "PENDING_REVIEW"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-red-50 text-red-700 border-red-200";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#fdfbf7] transition cursor-pointer"
                      onClick={() => handleInspectRecord(item.id)}
                    >
                      <td className="px-5 py-4 font-extrabold text-[#162a21]">
                        <div>Unit {item.unitNumber}</div>
                        <div className="text-[10px] text-[#6b887a] font-normal truncate max-w-[180px]">
                          {item.buildingName} (F{item.floorNumber})
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {item.ulpin ? (
                          <span className="font-mono text-[11px] font-bold text-[#2d6a4f] bg-[#2d6a4f]/10 px-2 py-0.5 rounded">
                            {item.ulpin}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            UNASSIGNED
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-semibold text-[#3d5a4c]">
                        <span className="inline-flex items-center gap-1">
                          <span>{item.hasGeometry ? "🧊" : "⚠️"}</span>
                          <span>{item.geometryType}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${valBadgeClass}`}
                        >
                          {item.validationStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-[11px] text-[#3d5a4c] max-w-[280px] truncate">
                        {item.detectedIssue}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${verBadgeClass}`}
                        >
                          {item.verificationStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectRecord(item.id);
                          }}
                          className="rounded-xl bg-[#2d6a4f] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-sm cursor-pointer"
                        >
                          Inspect Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#e2dad0] px-5 py-3.5 bg-[#f8f5ee] text-xs font-semibold text-[#6b887a]">
            <div>
              Showing Page <span className="font-bold text-[#162a21]">{page}</span> of{" "}
              <span className="font-bold text-[#162a21]">{totalPages}</span> ({totalRecords} items)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-[#e2dad0] bg-white px-3 py-1.5 text-xs font-bold text-[#162a21] disabled:opacity-40 hover:bg-[#f3efe6] transition cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-[#e2dad0] bg-white px-3 py-1.5 text-xs font-bold text-[#162a21] disabled:opacity-40 hover:bg-[#f3efe6] transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INSPECTION DRAWER / MODAL */}
      {selectedPropertyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs p-4 sm:p-6">
          <div className="w-full max-w-3xl h-full max-h-[90vh] rounded-2xl border border-[#e2dad0] bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-10 duration-200">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#e2dad0] p-5 bg-[#fdfbf7]">
              <div>
                <span className="text-[10px] font-extrabold text-[#6b887a] uppercase tracking-wider">
                  GIS Quality Inspection
                </span>
                <h2 className="text-base font-extrabold text-[#162a21] mt-0.5">
                  {detailData?.property?.unitNumber
                    ? `Unit ${detailData.property.unitNumber} • ${detailData.property.buildingName}`
                    : "Property Inspection Report"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPropertyId(null);
                  setDetailData(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e2dad0] bg-white text-[#162a21] hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* MODAL VIEW NAVIGATION TABS */}
            <div className="flex border-b border-[#e2dad0] bg-[#f8f5ee] px-5 py-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveDetailView("CHECKS")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeDetailView === "CHECKS"
                    ? "bg-[#2d6a4f] text-white shadow-sm"
                    : "bg-white text-[#162a21] hover:bg-[#e2dad0]/40"
                }`}
              >
                Rule Checks
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailView("MAP")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeDetailView === "MAP"
                    ? "bg-[#2d6a4f] text-white shadow-sm"
                    : "bg-white text-[#162a21] hover:bg-[#e2dad0]/40"
                }`}
              >
                2D Map Representation
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailView("3D")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeDetailView === "3D"
                    ? "bg-[#2d6a4f] text-white shadow-sm"
                    : "bg-white text-[#162a21] hover:bg-[#e2dad0]/40"
                }`}
              >
                3D Volumetric View
              </button>
            </div>

            {/* MODAL CONTENT BODY */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="p-12 text-center space-y-3">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2d6a4f] border-r-transparent" />
                  <p className="text-xs font-bold text-[#3d5a4c]">
                    Evaluating topology & geometry rules...
                  </p>
                </div>
              ) : !detailData ? (
                <div className="p-8 text-center text-xs font-bold text-red-700 bg-red-50 rounded-xl border border-red-200">
                  Failed to load validation details for selected property.
                </div>
              ) : (
                <>
                  {/* PROPERTY METADATA SUMMARY */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] p-3 space-y-1">
                      <span className="text-[10px] font-bold text-[#6b887a] uppercase">3D ULPIN</span>
                      <div className="font-mono font-bold text-[#2d6a4f] truncate">
                        {detailData.property.ulpin || "UNASSIGNED"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] p-3 space-y-1">
                      <span className="text-[10px] font-bold text-[#6b887a] uppercase">Floor Level</span>
                      <div className="font-extrabold text-[#162a21]">
                        Floor {detailData.property.floorNumber} (+{detailData.property.elevation}m)
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] p-3 space-y-1">
                      <span className="text-[10px] font-bold text-[#6b887a] uppercase">Usable Area</span>
                      <div className="font-extrabold text-[#162a21]">
                        {detailData.property.area} m²
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] p-3 space-y-1">
                      <span className="text-[10px] font-bold text-[#6b887a] uppercase">Overall Status</span>
                      <div className="font-extrabold text-[#2d6a4f]">
                        {detailData.evaluation.overallStatus}
                      </div>
                    </div>
                  </div>

                  {/* VIEW 1: RULE CHECKS BREAKDOWN */}
                  {activeDetailView === "CHECKS" && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-[#162a21] uppercase tracking-wider border-b border-[#e2dad0] pb-2">
                        Validation Rules Evaluation
                      </h3>

                      <div className="space-y-3">
                        {detailData.evaluation.checks.map((check: any) => {
                          const badgeColor =
                            check.status === "PASS"
                              ? "bg-emerald-100 text-emerald-800"
                              : check.status === "WARNING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800";

                          return (
                            <div
                              key={check.id}
                              className="rounded-xl border border-[#e2dad0] bg-white p-4 space-y-2 shadow-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-xs text-[#162a21]">
                                  {check.id} • {check.name}
                                </span>
                                <span
                                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${badgeColor}`}
                                >
                                  {check.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#6b887a] leading-relaxed">
                                {check.description}
                              </p>
                              <div className="text-xs font-semibold text-[#2d6a4f] bg-[#f8f5ee] p-2.5 rounded-lg border border-[#e2dad0]/60">
                                {check.details}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* GEOMETRY INFORMATION PANEL */}
                      <div className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] p-4 space-y-2">
                        <h4 className="text-xs font-extrabold text-[#162a21]">
                          Geometry & Coordinates Information
                        </h4>
                        <div className="text-xs text-[#3d5a4c] space-y-1">
                          <p>
                            • Vertices Count:{" "}
                            <span className="font-bold text-[#162a21]">
                              {Array.isArray(detailData.property.polygon)
                                ? detailData.property.polygon.length
                                : 0}{" "}
                              points
                            </span>
                          </p>
                          <p>
                            • Georeference Anchor:{" "}
                            <span className="font-bold text-[#162a21]">
                              {detailData.property.latitude.toFixed(6)}° N,{" "}
                              {detailData.property.longitude.toFixed(6)}° E
                            </span>
                          </p>
                          <p>
                            • Story Height Offset:{" "}
                            <span className="font-bold text-[#162a21]">
                              {detailData.property.height} meters
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VIEW 2: 2D MAP REPRESENTATION */}
                  {activeDetailView === "MAP" && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-[#162a21] uppercase tracking-wider border-b border-[#e2dad0] pb-2">
                        2D Cadastral Spatial Boundary
                      </h3>
                      {mapPreviewBuilding ? (
                        <div className="h-[400px] rounded-xl border border-[#e2dad0] overflow-hidden relative">
                          <RealWorldMapViewer
                            buildings={[mapPreviewBuilding]}
                            building={mapPreviewBuilding}
                          />
                        </div>
                      ) : (
                        <div className="p-8 text-center text-xs font-semibold text-[#6b887a] bg-white rounded-xl border border-[#e2dad0]">
                          No map representation available for this record.
                        </div>
                      )}
                    </div>
                  )}

                  {/* VIEW 3: 3D VOLUMETRIC REPRESENTATION */}
                  {activeDetailView === "3D" && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-[#162a21] uppercase tracking-wider border-b border-[#e2dad0] pb-2">
                        3D Volumetric Extrusion Preview
                      </h3>
                      {mapPreviewBuilding ? (
                        <div className="h-[400px] rounded-xl border border-[#e2dad0] bg-[#081a12] overflow-hidden relative">
                          <VolumetricViewer building={mapPreviewBuilding} />
                        </div>
                      ) : (
                        <div className="p-8 text-center text-xs font-semibold text-[#6b887a] bg-white rounded-xl border border-[#e2dad0]">
                          No 3D volumetric extrusion available for this record.
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-[#e2dad0] p-4 bg-[#f8f5ee] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href={`/government/cadastral-map?buildingId=${detailData?.property?.buildingId}&unitId=${detailData?.property?.id}`}
                  className="rounded-xl bg-[#2d6a4f] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition cursor-pointer"
                >
                  View in Cadastral Map
                </Link>

                <Link
                  href={`/government/property-registry?search=${encodeURIComponent(
                    detailData?.property?.ulpin || detailData?.property?.unitNumber || ""
                  )}`}
                  className="rounded-xl border border-[#e2dad0] bg-white px-3.5 py-2 text-xs font-bold text-[#162a21] hover:bg-[#f3efe6] transition cursor-pointer"
                >
                  View in Property Registry
                </Link>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPropertyId(null);
                  setDetailData(null);
                }}
                className="rounded-xl border border-[#e2dad0] bg-white px-4 py-2 text-xs font-bold text-[#162a21] hover:bg-[#f3efe6] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
