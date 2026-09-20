"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import {
  getGovernmentDownloadsData,
  type GovernmentDownloadableRecord,
} from "@/src/app/actions/government";
import { exportToLandXML } from "@/src/exporters/landxmlExporter";
import { exportToCityGML } from "@/src/exporters/citygmlExporter";
import { translations, type Language } from "@/src/lib/translations";

export default function GovernmentDownloadsPage() {
  const [lang, setLang] = useState<Language>("EN");
  const [records, setRecords] = useState<GovernmentDownloadableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterLocation, setFilterLocation] = useState("ALL");

  // Selected records for batch download
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Listen for language changes in localStorage
  useEffect(() => {
    const updateLang = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("bhuvista_lang") as Language;
        if (saved === "EN" || saved === "HI") {
          setLang(saved);
        }
      }
    };
    updateLang();
    window.addEventListener("storage", updateLang);
    return () => window.removeEventListener("storage", updateLang);
  }, []);

  const fetchDownloadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGovernmentDownloadsData();
      if (res.success) {
        setRecords(res.records || []);
      } else {
        setError(res.error || "Failed to retrieve downloadable records.");
      }
    } catch (err) {
      console.error("Error fetching downloadable records:", err);
      setError("Unable to load downloadable data at this time.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDownloadRecords();
  }, [fetchDownloadRecords]);

  const t = translations[lang];

  // Unique locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.location) set.add(r.location);
    });
    return Array.from(set);
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filterStatus !== "ALL" && r.approvalStatus !== filterStatus) {
        return false;
      }
      if (filterLocation !== "ALL" && r.location !== filterLocation) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matches =
          r.id.toLowerCase().includes(q) ||
          r.buildingName.toLowerCase().includes(q) ||
          (r.ulpin && r.ulpin.toLowerCase().includes(q)) ||
          r.spaceType.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [records, filterStatus, filterLocation, searchQuery]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map((r) => r.id)));
    }
  };

  // Helper to trigger browser download
  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // EXPORT HANDLERS

  // 1. GeoJSON Export
  const downloadGeoJSON = (record: GovernmentDownloadableRecord) => {
    const pb = record.parsedBuilding;
    const features = pb.floors.flatMap((floor) =>
      floor.units.map((unit) => ({
        type: "Feature",
        properties: {
          id: unit.id,
          unitNumber: unit.unitNumber,
          floorNumber: unit.floorNumber,
          areaSqMeters: unit.area,
          elevationMeters: floor.elevation,
          heightMeters: floor.height,
          ulpin: unit.ulpin || "",
          spaceType: unit.spaceType || "RESIDENTIAL",
          buildingName: pb.name,
          buildingId: pb.id,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              ...unit.polygon.map((p) => [p.x, p.y]),
              [unit.polygon[0].x, unit.polygon[0].y],
            ],
          ],
        },
      }))
    );

    const geojson = {
      type: "FeatureCollection",
      buildingName: pb.name,
      buildingId: pb.id,
      features,
    };

    const cleanName = pb.name.replace(/[^a-zA-Z0-9_-]/g, "_");
    triggerDownload(
      JSON.stringify(geojson, null, 2),
      `BhuVista_Property_${cleanName}_${pb.id.substring(0, 8)}.geojson`,
      "application/json"
    );
  };

  // 2. LandXML Export
  const downloadLandXML = (record: GovernmentDownloadableRecord) => {
    const xmlContent = exportToLandXML(record.parsedBuilding);
    const cleanName = record.buildingName.replace(/[^a-zA-Z0-9_-]/g, "_");
    triggerDownload(
      xmlContent,
      `BhuVista_LandXML_${cleanName}_${record.id.substring(0, 8)}.xml`,
      "application/xml"
    );
  };

  // 3. CityGML Export
  const downloadCityGML = (record: GovernmentDownloadableRecord) => {
    const gmlContent = exportToCityGML(record.parsedBuilding);
    const cleanName = record.buildingName.replace(/[^a-zA-Z0-9_-]/g, "_");
    triggerDownload(
      gmlContent,
      `BhuVista_CityGML_${cleanName}_${record.id.substring(0, 8)}.gml`,
      "application/xml"
    );
  };

  // 4. Tabular CSV Export
  const downloadCSV = () => {
    const targets = selectedIds.size > 0
      ? filteredRecords.filter((r) => selectedIds.has(r.id))
      : filteredRecords;

    if (targets.length === 0) return;

    const headers = [
      "Building ID",
      "Building Name",
      "3D ULPIN",
      "Approval Status",
      "Space Type",
      "Location Zone",
      "Total Floors",
      "Total Units",
      "Total Area (sq m)",
      "Created At",
    ];

    const rows = targets.map((r) => [
      `"${r.id}"`,
      `"${r.buildingName.replace(/"/g, '""')}"`,
      `"${r.ulpin || ""}"`,
      `"${r.approvalStatus}"`,
      `"${r.spaceType}"`,
      `"${r.location}"`,
      r.totalFloors,
      r.unitsCount,
      r.areaSqM,
      `"${r.createdAt}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    triggerDownload(csvContent, "BhuVista_ULPIN_Registry_Exports.csv", "text/csv");
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto font-sans text-[#162a21]">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2dad0] pb-6">
        <GovernmentPageHeader
          title={t.downloadsTitle}
          description={t.downloadsDesc}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDownloadRecords}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e2dad0] bg-white px-3.5 py-2 text-xs font-bold text-[#2d6a4f] hover:bg-[#f3efe6] transition shadow-xs cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t.refresh}
          </button>
          <button
            type="button"
            onClick={downloadCSV}
            disabled={filteredRecords.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1b4332] disabled:opacity-50 transition shadow-xs cursor-pointer"
          >
            ↓ {t.exportFormatCsv}
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
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
              className="w-full rounded-xl border border-[#e2dad0] bg-[#fdfbf7] pl-10 pr-4 py-2 text-xs text-[#162a21] placeholder-[#6b887a] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] px-3 py-2 text-xs font-semibold text-[#162a21] outline-none focus:border-[#2d6a4f]"
            >
              <option value="ALL">{t.filterByStatus}: {t.all}</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PENDING_REVIEW">PENDING REVIEW</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] px-3 py-2 text-xs font-semibold text-[#162a21] outline-none focus:border-[#2d6a4f]"
            >
              <option value="ALL">{t.filterByLocation}: {t.all}</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
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
            onClick={fetchDownloadRecords}
            className="rounded-xl bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* EMPTY STATE - NO RECORDS MATCH */}
      {!loading && !error && filteredRecords.length === 0 && (
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-12 text-center shadow-sm space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2d6a4f]/10 text-[#2d6a4f]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h3 className="text-base font-extrabold text-[#162a21]">
            {t.noDownloadData}
          </h3>
          <p className="text-xs text-[#6b887a] max-w-md mx-auto leading-relaxed">
            {t.noDownloadDataDesc}
          </p>
        </div>
      )}

      {/* DOWNLOADABLE RECORDS TABLE & EXPORT CARDS */}
      {!loading && !error && filteredRecords.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#6b887a]">
              Showing {filteredRecords.length} downloadable records
            </span>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-bold text-[#2d6a4f] hover:underline cursor-pointer"
            >
              {selectedIds.size === filteredRecords.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredRecords.map((record) => {
              const isSelected = selectedIds.has(record.id);
              return (
                <div
                  key={record.id}
                  className={`rounded-2xl border p-5 bg-white shadow-sm transition space-y-4 ${
                    isSelected ? "border-[#2d6a4f] ring-1 ring-[#2d6a4f]" : "border-[#e2dad0]"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#e2dad0]/60 pb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(record.id)}
                        className="h-4 w-4 rounded border-[#e2dad0] text-[#2d6a4f] focus:ring-[#2d6a4f] cursor-pointer"
                      />
                      <div>
                        <h3 className="text-base font-bold text-[#162a21]">
                          {record.buildingName}
                        </h3>
                        <p className="text-[11px] font-mono text-[#6b887a]">
                          ID: {record.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-[#2d6a4f]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#2d6a4f] uppercase">
                        {record.approvalStatus}
                      </span>
                      <span className="rounded-lg bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-700">
                        {record.location}
                      </span>
                    </div>
                  </div>

                  {/* DETAILS GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#162a21]">
                    <div>
                      <span className="block text-[10px] font-bold text-[#6b887a] uppercase">3D ULPIN Identity</span>
                      <span className="font-mono font-bold text-[#2d6a4f]">{record.ulpin || "UNASSIGNED"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-[#6b887a] uppercase">Floors / Units</span>
                      <span className="font-bold">{record.totalFloors} Floors • {record.unitsCount} Units</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-[#6b887a] uppercase">Measured Area</span>
                      <span className="font-bold">{record.areaSqM.toLocaleString()} m²</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-[#6b887a] uppercase">Space Type</span>
                      <span className="font-bold">{record.spaceType}</span>
                    </div>
                  </div>

                  {/* EXPORT ACTION BUTTONS */}
                  <div className="pt-2 border-t border-[#e2dad0]/60 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-[#6b887a] mr-1">Export Format:</span>

                    <button
                      type="button"
                      onClick={() => downloadGeoJSON(record)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer shadow-xs"
                    >
                      ↓ {t.exportFormatGeoJson}
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadCityGML(record)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800 transition cursor-pointer shadow-xs"
                    >
                      ↓ {t.exportFormatCityGml}
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadLandXML(record)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-800 transition cursor-pointer shadow-xs"
                    >
                      ↓ {t.exportFormatLandXml}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
