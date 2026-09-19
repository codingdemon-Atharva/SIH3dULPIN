"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";
import {
  getPublicRegistryRecords,
  getPublicPropertyDetails,
} from "@/src/app/actions/getPublicBuildings";
import { exportToCityGML } from "@/src/exporters/citygmlExporter";
import { exportToLandXML } from "@/src/exporters/landxmlExporter";
import type { ParsedBuilding } from "@/src/lib/parser/types";

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

function DownloadsContent() {
  const searchParams = useSearchParams();
  const initialPropertyId = searchParams.get("propertyId") || searchParams.get("id") || "";

  const [records, setRecords] = useState<LandRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // Property Selection State
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialPropertyId);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<{
    building: ParsedBuilding | null;
    unit: LandRecord | null;
  }>({ building: null, unit: null });
  const [loadingPropertyDetails, setLoadingPropertyDetails] = useState(false);
  const [propertyError, setPropertyError] = useState<string | null>(null);

  // Search filter for dropdown
  const [propertySearchQuery, setPropertySearchQuery] = useState("");

  // Download Action State (loading indicator for generation)
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Load all public registry records on mount
  useEffect(() => {
    let isMounted = true;

    async function loadPublicRecords() {
      setLoadingRecords(true);
      setRecordsError(null);

      try {
        const res = await getPublicRegistryRecords();
        if (isMounted) {
          if (res.success && Array.isArray(res.records)) {
            setRecords(res.records);
            if (!initialPropertyId && res.records.length > 0) {
              setSelectedPropertyId(res.records[0].id);
            }
          } else {
            setRecordsError("Unable to retrieve public land records.");
            setRecords([]);
          }
        }
      } catch (err) {
        console.error("Failed to load public registry records for downloads:", err);
        if (isMounted) {
          setRecordsError("Unable to load public land records.");
        }
      } finally {
        if (isMounted) {
          setLoadingRecords(false);
        }
      }
    }

    loadPublicRecords();

    return () => {
      isMounted = false;
    };
  }, [initialPropertyId]);

  // Load selected property details when selectedPropertyId changes
  useEffect(() => {
    if (!selectedPropertyId) {
      setSelectedPropertyDetails({ building: null, unit: null });
      return;
    }

    let isMounted = true;

    async function fetchPropertyDetails() {
      setLoadingPropertyDetails(true);
      setPropertyError(null);

      try {
        const res = await getPublicPropertyDetails(selectedPropertyId);
        if (isMounted) {
          if (res.success && res.building) {
            const parsedBuilding = mapServerBuildingToParsed(res.building);
            const matchedRecord = records.find((r) => r.id === selectedPropertyId) || null;
            setSelectedPropertyDetails({
              building: parsedBuilding,
              unit: matchedRecord,
            });
          } else {
            // Check if record exists in loaded records
            const matchedRecord = records.find((r) => r.id === selectedPropertyId) || null;
            setSelectedPropertyDetails({
              building: null,
              unit: matchedRecord,
            });
            if (!matchedRecord) {
              setPropertyError("The selected property details are unavailable for download.");
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch property details for download:", err);
        if (isMounted) {
          setPropertyError("Unable to fetch details for the selected property.");
        }
      } finally {
        if (isMounted) {
          setLoadingPropertyDetails(false);
        }
      }
    }

    fetchPropertyDetails();

    return () => {
      isMounted = false;
    };
  }, [selectedPropertyId, records]);

  // Map server DB building format to ParsedBuilding helper
  function mapServerBuildingToParsed(dbBuilding: any): ParsedBuilding {
    const latitude = Number(dbBuilding?.latitude);
    const longitude = Number(dbBuilding?.longitude);
    const hasValidGeoreference =
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180;

    const floors = Array.isArray(dbBuilding?.floors) ? dbBuilding.floors : [];

    return {
      id: dbBuilding.id,
      name: dbBuilding.name || "Cadastral Structure",
      ...(hasValidGeoreference ? { georeference: { latitude, longitude } } : {}),
      floors: floors.map((f: any) => ({
        floorNumber: Number(f.floorNumber) || 0,
        elevation: Number(f.elevation) || 0,
        height: Number(f.height) || 3.2,
        units: Array.isArray(f.units)
          ? f.units.map((u: any) => {
              let polygon = u.polygon;
              if (typeof polygon === "string") {
                try {
                  polygon = JSON.parse(polygon);
                } catch {
                  polygon = [];
                }
              }
              return {
                id: u.id,
                unitNumber: u.unitNumber || "UNIT",
                floorNumber: Number(f.floorNumber) || 0,
                area: Number(u.area) || 0,
                polygon: Array.isArray(polygon) ? polygon : [],
                ulpin: u.ulpin || undefined,
                spaceType: u.spaceType || "RESIDENTIAL",
              };
            })
          : [],
      })),
    };
  }

  // Filter properties for the selector dropdown
  const filteredProperties = useMemo(() => {
    const q = propertySearchQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      const ulpinMatch = r.ulpin ? r.ulpin.toLowerCase().includes(q) : false;
      const unitNumMatch = r.unitNumber.toLowerCase().includes(q);
      const buildingNameMatch = r.buildingName.toLowerCase().includes(q);
      const idMatch = r.id.toLowerCase().includes(q);
      return ulpinMatch || unitNumMatch || buildingNameMatch || idMatch;
    });
  }, [records, propertySearchQuery]);

  // Selected Record from local state
  const selectedRecord = useMemo(() => {
    return records.find((r) => r.id === selectedPropertyId) || selectedPropertyDetails.unit || null;
  }, [records, selectedPropertyId, selectedPropertyDetails]);

  // Safe file downloader helper
  const triggerFileDownload = (content: string, filename: string, mimeType: string) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadNotice({
        type: "success",
        message: `Successfully downloaded ${filename}`,
      });
    } catch (err) {
      console.error("Download failed:", err);
      setDownloadNotice({
        type: "error",
        message: "Failed to generate download file. Please try again.",
      });
    }
  };

  // 1. Bulk CSV Export
  const handleBulkCSVDownload = () => {
    if (records.length === 0) {
      setDownloadNotice({
        type: "info",
        message: "No public land records are available to export.",
      });
      return;
    }

    setDownloadingFormat("bulk-csv");
    setDownloadNotice(null);

    setTimeout(() => {
      try {
        const headers = [
          "ULPIN",
          "Survey / Unit Number",
          "Property ID",
          "Structure / Location Name",
          "Land Use",
          "Area (sq m)",
          "Latitude",
          "Longitude",
          "Verification Status",
          "Verified Date",
        ];

        const rows = records.map((r) => [
          `"${r.ulpin || "Pending Assignment"}"`,
          `"${r.unitNumber}"`,
          `"${r.id}"`,
          `"${(r.buildingName || "").replace(/"/g, '""')}"`,
          `"${r.spaceType || "RESIDENTIAL"}"`,
          r.area || 0,
          r.latitude || 0,
          r.longitude || 0,
          `"${r.approvalStatus}"`,
          `"${r.verifiedAt || "N/A"}"`,
        ]);

        const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        triggerFileDownload(csvContent, "bhuvista-land-records.csv", "text/csv;charset=utf-8;");
      } catch (err) {
        console.error("Bulk CSV export error:", err);
        setDownloadNotice({
          type: "error",
          message: "Unable to generate CSV file.",
        });
      } finally {
        setDownloadingFormat(null);
      }
    }, 150);
  };

  // 2. Bulk GeoJSON Export
  const handleBulkGeoJSONDownload = () => {
    const recordsWithGeo = records.filter((r) => r.hasGeometry);

    if (recordsWithGeo.length === 0) {
      setDownloadNotice({
        type: "info",
        message: "No spatial geometry features are available for bulk GeoJSON export.",
      });
      return;
    }

    setDownloadingFormat("bulk-geojson");
    setDownloadNotice(null);

    setTimeout(() => {
      try {
        const features = recordsWithGeo.map((r) => {
          return {
            type: "Feature",
            id: r.id,
            properties: {
              id: r.id,
              ulpin: r.ulpin || null,
              unitNumber: r.unitNumber,
              buildingId: r.buildingId,
              buildingName: r.buildingName,
              floorNumber: r.floorNumber,
              spaceType: r.spaceType,
              areaSqMeters: r.area,
              latitude: r.latitude,
              longitude: r.longitude,
              approvalStatus: r.approvalStatus,
              verifiedAt: r.verifiedAt,
            },
            geometry: {
              type: "Point",
              coordinates: [r.longitude, r.latitude],
            },
          };
        });

        const geojson = {
          type: "FeatureCollection",
          name: "BhuVista Public Cadastral Parcels",
          description: "Publicly verified cadastral records from National Land Registry",
          features,
        };

        triggerFileDownload(
          JSON.stringify(geojson, null, 2),
          "bhuvista-cadastral-data.geojson",
          "application/geo+json;charset=utf-8;"
        );
      } catch (err) {
        console.error("Bulk GeoJSON export error:", err);
        setDownloadNotice({
          type: "error",
          message: "Unable to generate GeoJSON file.",
        });
      } finally {
        setDownloadingFormat(null);
      }
    }, 150);
  };

  // 3. Selected Property GeoJSON Download
  const handleSelectedPropertyGeoJSON = () => {
    if (!selectedRecord) return;

    setDownloadingFormat("property-geojson");
    setDownloadNotice(null);

    setTimeout(() => {
      try {
        let coordinates: number[][] = [];
        let geometryType = "Point";

        // Extract polygon geometry from building structure if loaded
        if (selectedPropertyDetails.building) {
          for (const floor of selectedPropertyDetails.building.floors) {
            const unit = floor.units.find((u) => u.id === selectedRecord.id || u.ulpin === selectedRecord.ulpin);
            if (unit && Array.isArray(unit.polygon) && unit.polygon.length >= 3) {
              geometryType = "Polygon";
              const closedPoly = [...unit.polygon, unit.polygon[0]];
              coordinates = closedPoly.map((p) => [p.x, p.y]);
              break;
            }
          }
        }

        const feature = {
          type: "Feature",
          id: selectedRecord.id,
          properties: {
            id: selectedRecord.id,
            ulpin: selectedRecord.ulpin || null,
            unitNumber: selectedRecord.unitNumber,
            buildingId: selectedRecord.buildingId,
            buildingName: selectedRecord.buildingName,
            floorNumber: selectedRecord.floorNumber,
            spaceType: selectedRecord.spaceType,
            areaSqMeters: selectedRecord.area,
            latitude: selectedRecord.latitude,
            longitude: selectedRecord.longitude,
            approvalStatus: selectedRecord.approvalStatus,
            verifiedAt: selectedRecord.verifiedAt,
          },
          geometry:
            geometryType === "Polygon" && coordinates.length > 0
              ? {
                  type: "Polygon",
                  coordinates: [coordinates],
                }
              : {
                  type: "Point",
                  coordinates: [selectedRecord.longitude, selectedRecord.latitude],
                },
        };

        const safeId = (selectedRecord.ulpin || selectedRecord.id).replace(/[^a-zA-Z0-9_-]/g, "_");
        triggerFileDownload(
          JSON.stringify(feature, null, 2),
          `bhuvista-property-${safeId}.geojson`,
          "application/geo+json;charset=utf-8;"
        );
      } catch (err) {
        console.error("Selected property GeoJSON export error:", err);
        setDownloadNotice({
          type: "error",
          message: "Unable to generate GeoJSON for this property.",
        });
      } finally {
        setDownloadingFormat(null);
      }
    }, 150);
  };

  // 4. Selected Property CSV Summary Download
  const handleSelectedPropertyCSV = () => {
    if (!selectedRecord) return;

    setDownloadingFormat("property-csv");
    setDownloadNotice(null);

    setTimeout(() => {
      try {
        const headers = [
          "ULPIN",
          "Survey / Unit Number",
          "Property ID",
          "Structure Name",
          "Floor Number",
          "Land Use",
          "Area (sq m)",
          "Latitude",
          "Longitude",
          "Verification Status",
          "Verified Date",
        ];

        const row = [
          `"${selectedRecord.ulpin || "Pending Assignment"}"`,
          `"${selectedRecord.unitNumber}"`,
          `"${selectedRecord.id}"`,
          `"${(selectedRecord.buildingName || "").replace(/"/g, '""')}"`,
          selectedRecord.floorNumber,
          `"${selectedRecord.spaceType || "RESIDENTIAL"}"`,
          selectedRecord.area || 0,
          selectedRecord.latitude || 0,
          selectedRecord.longitude || 0,
          `"${selectedRecord.approvalStatus}"`,
          `"${selectedRecord.verifiedAt || "N/A"}"`,
        ];

        const csvContent = [headers.join(","), row.join(",")].join("\n");
        const safeId = (selectedRecord.ulpin || selectedRecord.id).replace(/[^a-zA-Z0-9_-]/g, "_");

        triggerFileDownload(
          csvContent,
          `bhuvista-property-${safeId}.csv`,
          "text/csv;charset=utf-8;"
        );
      } catch (err) {
        console.error("Selected property CSV export error:", err);
        setDownloadNotice({
          type: "error",
          message: "Unable to generate CSV for this property.",
        });
      } finally {
        setDownloadingFormat(null);
      }
    }, 150);
  };

  // 5. Selected Property CityGML Download
  const handleSelectedPropertyCityGML = () => {
    if (!selectedPropertyDetails.building) {
      setDownloadNotice({
        type: "info",
        message: "3D Volumetric building structure is not available for CityGML export.",
      });
      return;
    }

    setDownloadingFormat("property-citygml");
    setDownloadNotice(null);

    setTimeout(() => {
      try {
        const gmlContent = exportToCityGML(selectedPropertyDetails.building!);
                        const safeId = (selectedPropertyDetails.building?.name || selectedPropertyDetails.building?.id || "building")
          .toLowerCase()
          .replace(/[^a-zA-Z0-9_-]/g, "_");

        triggerFileDownload(
          gmlContent,
          `bhuvista-building-${safeId}-citygml.gml`,
          "application/xml;charset=utf-8;"
        );
      } catch (err) {
        console.error("CityGML export error:", err);
        setDownloadNotice({
          type: "error",
          message: "Unable to generate CityGML file for this structure.",
        });
      } finally {
        setDownloadingFormat(null);
      }
    }, 150);
  };

  // 6. Selected Property LandXML Download
  const handleSelectedPropertyLandXML = () => {
    if (!selectedPropertyDetails.building) {
      setDownloadNotice({
        type: "info",
        message: "3D Volumetric building structure is not available for LandXML export.",
      });
      return;
    }

    setDownloadingFormat("property-landxml");
    setDownloadNotice(null);

    setTimeout(() => {
      try {
        const xmlContent = exportToLandXML(selectedPropertyDetails.building!);
        const safeId = (selectedPropertyDetails.building?.name || selectedPropertyDetails.building?.id || "building")
          .toLowerCase()
          .replace(/[^a-zA-Z0-9_-]/g, "_");

        triggerFileDownload(
          xmlContent,
          `bhuvista-building-${safeId}-landxml.xml`,
          "application/xml;charset=utf-8;"
        );
      } catch (err) {
        console.error("LandXML export error:", err);
        setDownloadNotice({
          type: "error",
          message: "Unable to generate LandXML file for this structure.",
        });
      } finally {
        setDownloadingFormat(null);
      }
    }, 150);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-[#162a21]">
      {/* PAGE HEADER */}
      <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded bg-[#2d6a4f]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#2d6a4f] uppercase tracking-wider">
              PUBLIC DATA DOWNLOADS
            </span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
              VERIFIED CADASTRAL RECORDS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#162a21] tracking-tight">
            Downloads
          </h1>
          <p className="text-xs font-medium text-[#6b887a] mt-1">
            Download publicly available BhuVista land and property information.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/land-records"
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#e2dad0] px-4 py-2.5 text-xs font-bold text-[#2d6a4f] hover:bg-[#f3efe6] transition shadow-sm"
          >
            Explore Land Records →
          </Link>
        </div>
      </div>

      {/* DOWNLOAD NOTICE / STATUS BANNER */}
      {downloadNotice && (
        <div
          className={`rounded-xl p-4 border text-xs font-bold flex items-center justify-between transition-all ${
            downloadNotice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : downloadNotice.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>
              {downloadNotice.type === "success"
                ? "✓"
                : downloadNotice.type === "error"
                ? "⚠️"
                : "ℹ️"}
            </span>
            <span>{downloadNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadNotice(null)}
            className="text-xs font-black opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loadingRecords && (
        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-12 text-center shadow-sm">
          <div className="inline-flex items-center gap-3 rounded-full bg-[#2d6a4f]/10 px-5 py-2 text-xs font-bold text-[#2d6a4f]">
            <span className="h-2 w-2 rounded-full bg-[#2d6a4f] animate-pulse" />
            Preparing publicly available download packages...
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {!loadingRecords && recordsError && (
        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-10 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 text-xl font-bold">
            ⚠️
          </div>
          <h3 className="text-lg font-extrabold text-[#162a21]">
            Unable to Load Downloads
          </h3>
          <p className="text-xs text-[#6b887a] max-w-md mx-auto">
            {recordsError}
          </p>
        </div>
      )}

      {/* EMPTY STATE (NO PUBLIC RECORDS IN DB) */}
      {!loadingRecords && !recordsError && records.length === 0 && (
        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-12 text-center shadow-sm space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] text-xl font-bold">
            📁
          </div>
          <h3 className="text-lg font-extrabold text-[#162a21]">
            No Public Downloads Available
          </h3>
          <p className="text-xs text-[#6b887a] max-w-md mx-auto">
            No publicly available land records are currently available for download.
          </p>
        </div>
      )}

      {/* MAIN DOWNLOAD SECTIONS */}
      {!loadingRecords && !recordsError && records.length > 0 && (
        <div className="space-y-8">
          {/* SECTION 1: BULK DATASETS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2dad0] pb-2">
              <div>
                <h2 className="text-lg font-extrabold text-[#162a21]">
                  Bulk Public Land Datasets
                </h2>
                <p className="text-xs text-[#6b887a]">
                  Export national public land records and cadastral spatial data in standard formats.
                </p>
              </div>
              <span className="rounded-full bg-[#2d6a4f]/10 px-3 py-1 text-[11px] font-bold text-[#2d6a4f]">
                {records.length} Public Records Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CARD 1: PUBLIC LAND RECORDS (CSV) */}
              <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                      CSV SPREADSHEET
                    </span>
                    <span className="text-[10px] font-bold text-[#6b887a] font-mono">
                      bhuvista-land-records.csv
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#162a21]">
                    Public Land Records (CSV)
                  </h3>
                  <p className="text-xs text-[#6b887a] leading-relaxed">
                    Full dataset of verified public land records containing ULPIN assignments, survey/unit numbers, land use classifications, surface area, and GPS coordinates.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#e2dad0]/60 flex items-center justify-between gap-4">
                  <div className="text-[11px] text-[#6b887a]">
                    Contains <strong className="text-[#162a21]">{records.length}</strong> verified records
                  </div>
                  <button
                    type="button"
                    disabled={downloadingFormat === "bulk-csv"}
                    onClick={handleBulkCSVDownload}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingFormat === "bulk-csv" ? (
                      <>
                        <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download CSV
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* CARD 2: CADASTRAL PARCEL GEOMETRY (GEOJSON) */}
              <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">
                      GIS GEOJSON
                    </span>
                    <span className="text-[10px] font-bold text-[#6b887a] font-mono">
                      bhuvista-cadastral-data.geojson
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#162a21]">
                    Cadastral Parcel Geometry (GeoJSON)
                  </h3>
                  <p className="text-xs text-[#6b887a] leading-relaxed">
                    Spatial parcel boundaries and georeferenced coordinates in standard GeoJSON format for integration into QGIS, ArcGIS, and web mapping tools.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#e2dad0]/60 flex items-center justify-between gap-4">
                  <div className="text-[11px] text-[#6b887a]">
                    Contains <strong className="text-[#162a21]">{records.filter((r) => r.hasGeometry).length}</strong> spatial features
                  </div>
                  <button
                    type="button"
                    disabled={downloadingFormat === "bulk-geojson"}
                    onClick={handleBulkGeoJSONDownload}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingFormat === "bulk-geojson" ? (
                      <>
                        <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download GeoJSON
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: SELECTED PROPERTY DOWNLOADS */}
          <div className="space-y-6 pt-4 border-t border-[#e2dad0]">
            <div className="border-b border-[#e2dad0] pb-2">
              <h2 className="text-lg font-extrabold text-[#162a21]">
                Selected Property Information & Formats
              </h2>
              <p className="text-xs text-[#6b887a]">
                Select an individual public property to download property-specific GIS boundaries, 3D cadastral models, and summary records.
              </p>
            </div>

            {/* PROPERTY SELECTOR CONTROL */}
            <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-6 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4">
                  <label htmlFor="property-search-filter" className="block text-xs font-bold text-[#162a21] mb-1">
                    Filter Property List
                  </label>
                  <input
                    id="property-search-filter"
                    type="text"
                    placeholder="Search by ULPIN, Survey #, or Name..."
                    value={propertySearchQuery}
                    onChange={(e) => setPropertySearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-[#e2dad0] bg-white px-3 py-2 text-xs text-[#162a21] placeholder-[#6b887a] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20"
                  />
                </div>

                <div className="md:col-span-8">
                  <label htmlFor="select-property-dropdown" className="block text-xs font-bold text-[#162a21] mb-1">
                    Select Public Property
                  </label>
                  <select
                    id="select-property-dropdown"
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full rounded-xl border border-[#e2dad0] bg-white px-3 py-2 text-xs font-bold text-[#162a21] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 cursor-pointer"
                  >
                    {filteredProperties.length === 0 && (
                      <option value="">No matching public properties found</option>
                    )}
                    {filteredProperties.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.ulpin ? `${r.ulpin} • ` : ""}Unit {r.unitNumber} ({r.buildingName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* LOADING PROPERTY DETAILS */}
            {loadingPropertyDetails && (
              <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-8 text-center shadow-sm">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#2d6a4f]">
                  <span className="h-2 w-2 rounded-full bg-[#2d6a4f] animate-pulse" />
                  Retrieving property spatial geometry and formats...
                </div>
              </div>
            )}

            {/* SELECTED PROPERTY SUMMARY & DOWNLOAD ACTIONS */}
            {!loadingPropertyDetails && selectedRecord && (
              <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-6 shadow-sm space-y-6">
                {/* PREVIEW HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#e2dad0] pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded bg-[#2d6a4f]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#2d6a4f] uppercase tracking-wider">
                        {selectedRecord.ulpin || "PARCEL RECORD"}
                      </span>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                        ✓ APPROVED PUBLIC RECORD
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-[#162a21]">
                      Unit {selectedRecord.unitNumber} • {selectedRecord.buildingName}
                    </h3>
                    <p className="text-xs font-medium text-[#6b887a] mt-0.5">
                      📍 {selectedRecord.latitude.toFixed(5)}° N, {selectedRecord.longitude.toFixed(5)}° E • Land Use: {selectedRecord.spaceType}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/properties/${selectedRecord.id}`}
                      className="rounded-xl bg-white border border-[#e2dad0] px-3.5 py-2 text-xs font-bold text-[#2d6a4f] hover:bg-[#f3efe6] transition shadow-xs"
                    >
                      View Property Details →
                    </Link>
                  </div>
                </div>

                {/* METRICS PREVIEW */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="rounded-xl border border-[#e2dad0]/70 bg-white p-3">
                    <span className="text-[#6b887a] font-medium block">ULPIN</span>
                    <span className="font-extrabold text-[#2d6a4f] truncate block mt-0.5 font-mono">
                      {selectedRecord.ulpin || "Not assigned"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#e2dad0]/70 bg-white p-3">
                    <span className="text-[#6b887a] font-medium block">Survey / Unit</span>
                    <span className="font-extrabold text-[#162a21] truncate block mt-0.5">
                      Unit {selectedRecord.unitNumber}
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#e2dad0]/70 bg-white p-3">
                    <span className="text-[#6b887a] font-medium block">Surface Area</span>
                    <span className="font-extrabold text-[#162a21] truncate block mt-0.5">
                      {selectedRecord.area ? `${selectedRecord.area} m²` : "N/A"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#e2dad0]/70 bg-white p-3">
                    <span className="text-[#6b887a] font-medium block">3D Model Status</span>
                    <span className="font-extrabold text-[#2d6a4f] truncate block mt-0.5">
                      {selectedRecord.hasGeometry ? "🧊 3D Geometry Available" : "2D Map Only"}
                    </span>
                  </div>
                </div>

                {/* AVAILABLE DOWNLOAD BUTTONS FOR SELECTED PROPERTY */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b887a] mb-3">
                    Available Export Formats
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* BUTTON 1: GEOJSON */}
                    <button
                      type="button"
                      disabled={downloadingFormat === "property-geojson"}
                      onClick={handleSelectedPropertyGeoJSON}
                      className="flex items-center justify-between rounded-xl bg-white border border-[#e2dad0] p-3 text-left hover:bg-[#f3efe6] hover:border-[#2d6a4f] transition shadow-xs cursor-pointer group disabled:opacity-50"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#162a21]">GeoJSON Geometry</div>
                        <div className="text-[10px] text-[#6b887a]">Spatial Boundary / Vector</div>
                      </div>
                      <span className="text-xs font-bold text-[#2d6a4f] group-hover:translate-x-0.5 transition-transform">
                        ↓
                      </span>
                    </button>

                    {/* BUTTON 2: PROPERTY SUMMARY CSV */}
                    <button
                      type="button"
                      disabled={downloadingFormat === "property-csv"}
                      onClick={handleSelectedPropertyCSV}
                      className="flex items-center justify-between rounded-xl bg-white border border-[#e2dad0] p-3 text-left hover:bg-[#f3efe6] hover:border-[#2d6a4f] transition shadow-xs cursor-pointer group disabled:opacity-50"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#162a21]">Property Record CSV</div>
                        <div className="text-[10px] text-[#6b887a]">Tabular Property Attributes</div>
                      </div>
                      <span className="text-xs font-bold text-[#2d6a4f] group-hover:translate-x-0.5 transition-transform">
                        ↓
                      </span>
                    </button>

                    {/* BUTTON 3: CITYGML 3.0 */}
                    <button
                      type="button"
                      disabled={!selectedPropertyDetails.building || downloadingFormat === "property-citygml"}
                      onClick={handleSelectedPropertyCityGML}
                      title={
                        !selectedPropertyDetails.building
                          ? "CityGML export requires 3D building structure model."
                          : "Download CityGML 3.0"
                      }
                      className={`flex items-center justify-between rounded-xl p-3 text-left border transition shadow-xs ${
                        selectedPropertyDetails.building
                          ? "bg-white border-[#e2dad0] hover:bg-[#f3efe6] hover:border-[#2d6a4f] cursor-pointer group"
                          : "bg-[#f8f5ee] border-[#e2dad0]/50 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-[#162a21]">CityGML 3.0</div>
                        <div className="text-[10px] text-[#6b887a]">
                          {selectedPropertyDetails.building ? "3D BIM / GIS Standard" : "Structure N/A"}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#2d6a4f]">
                        {selectedPropertyDetails.building ? "↓" : "🔒"}
                      </span>
                    </button>

                    {/* BUTTON 4: LANDXML */}
                    <button
                      type="button"
                      disabled={!selectedPropertyDetails.building || downloadingFormat === "property-landxml"}
                      onClick={handleSelectedPropertyLandXML}
                      title={
                        !selectedPropertyDetails.building
                          ? "LandXML export requires 3D building structure model."
                          : "Download LandXML"
                      }
                      className={`flex items-center justify-between rounded-xl p-3 text-left border transition shadow-xs ${
                        selectedPropertyDetails.building
                          ? "bg-white border-[#e2dad0] hover:bg-[#f3efe6] hover:border-[#2d6a4f] cursor-pointer group"
                          : "bg-[#f8f5ee] border-[#e2dad0]/50 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-[#162a21]">LandXML</div>
                        <div className="text-[10px] text-[#6b887a]">
                          {selectedPropertyDetails.building ? "Survey & Volumetric XML" : "Structure N/A"}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#2d6a4f]">
                        {selectedPropertyDetails.building ? "↓" : "🔒"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PROPERTY ERROR OR NOT FOUND STATE */}
            {!loadingPropertyDetails && !selectedRecord && propertyError && (
              <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-8 text-center shadow-sm space-y-2">
                <p className="text-xs font-bold text-amber-800">{propertyError}</p>
                <p className="text-[11px] text-[#6b887a]">
                  No downloadable public data is available for this property.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DownloadsPage() {
  return (
    <PageShell
      roleMode="PUBLIC_VIEWER"
      userRole={null}
      onRoleModeChange={() => {}}
      activeSection="downloads"
    >
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs font-bold text-[#2d6a4f]">
            Loading BhuVista Downloads...
          </div>
        }
      >
        <DownloadsContent />
      </Suspense>
    </PageShell>
  );
}
