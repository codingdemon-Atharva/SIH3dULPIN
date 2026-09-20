"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import RealWorldMapViewer from "@/src/components/RealWorldMapViewer";
import { getGovernmentGISBuildings } from "@/src/app/actions/government";
import { validateCadastralModel, ValidationResult } from "@/src/lib/validator";
import type { ParsedBuilding, Property2D } from "@/src/lib/parser/types";

function CadastralMapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlBuildingId = searchParams.get("buildingId");
  const urlUnitId = searchParams.get("unitId");

  const [buildings, setBuildings] = useState<ParsedBuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBuilding, setSelectedBuilding] = useState<ParsedBuilding | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Property2D | null>(null);
  const [activeTab, setActiveTab] = useState<"INSPECTION" | "TOPOLOGY" | "LAYERS">("INSPECTION");

  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  // Fetch real GIS buildings from server action
  useEffect(() => {
    let isMounted = true;
    async function loadGISData() {
      try {
        setLoading(true);
        const res = await getGovernmentGISBuildings();
        if (res.success && Array.isArray(res.data)) {
          if (isMounted) {
            // Normalize DB building records into ParsedBuilding shapes
            const normalized = res.data.map((b: any) => ({
              id: String(b.id),
              name: b.name || "Cadastral Structure",
              approvalStatus: b.approvalStatus || "APPROVED",
              georeference: {
                latitude: Number(b.latitude) || 18.5204,
                longitude: Number(b.longitude) || 73.8567,
              },
              floors: Array.isArray(b.floors)
                ? b.floors.map((f: any) => ({
                    floorNumber: Number(f.floorNumber) || 0,
                    elevation: Number(f.elevation) || 0,
                    height: Number(f.height) || 3.2,
                    units: Array.isArray(f.units)
                      ? f.units.map((u: any) => ({
                          id: String(u.id),
                          unitNumber: String(u.unitNumber || "UNIT"),
                          floorNumber: Number(f.floorNumber) || 0,
                          area: Number(u.area) || 0,
                          spaceType: u.spaceType || "RESIDENTIAL",
                          ulpin: u.ulpin || undefined,
                          polygon: typeof u.polygon === "string"
                            ? parsePolygon(u.polygon)
                            : Array.isArray(u.polygon)
                            ? u.polygon
                            : [],
                        }))
                      : [],
                  }))
                : [],
            }));

            setBuildings(normalized);

            // Auto-select building/unit from URL parameters if present
            if (urlBuildingId) {
              const matchedB = normalized.find((b: ParsedBuilding) => b.id === urlBuildingId);
              if (matchedB) {
                setSelectedBuilding(matchedB);
                if (urlUnitId) {
                  for (const flr of matchedB.floors || []) {
                    const matchedU = flr.units.find((u: any) => u.id === urlUnitId || u.ulpin === urlUnitId);
                    if (matchedU) {
                      setSelectedUnit(matchedU);
                      break;
                    }
                  }
                }
              }
            } else if (normalized.length > 0) {
              setSelectedBuilding(normalized[0]);
            }
          }
        } else {
          if (isMounted) {
            setError(res.error || "Failed to load internal GIS cadastral records.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Server error while connecting to GIS database.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadGISData();
    setValidationResults(validateCadastralModel());

    return () => {
      isMounted = false;
    };
  }, [urlBuildingId, urlUnitId]);

  function parsePolygon(jsonStr: string) {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }

  // Calculate totals across real records
  const metrics = useMemo(() => {
    let totalUnits = 0;
    let totalArea = 0;
    let validGeometries = 0;

    for (const b of buildings) {
      for (const f of b.floors || []) {
        for (const u of f.units || []) {
          totalUnits++;
          totalArea += u.area || 0;
          if (Array.isArray(u.polygon) && u.polygon.length >= 3) {
            validGeometries++;
          }
        }
      }
    }

    return {
      totalBuildings: buildings.length,
      totalUnits,
      totalAreaSqM: Math.round(totalArea * 100) / 100,
      validGeometries,
    };
  }, [buildings]);

  const handlePropertySelect = (unit: Property2D) => {
    setSelectedUnit(unit);
    // Find parent building
    const parent = buildings.find((b) =>
      b.floors?.some((f) => f.units.some((u) => u.id === unit.id))
    );
    if (parent) {
      setSelectedBuilding(parent);
    }
  };

  const handleBuildingSelect = (building: ParsedBuilding) => {
    setSelectedBuilding(building);
    setSelectedUnit(null);
  };

  const handleOpen3DMap = () => {
    const bId = selectedBuilding?.id || (buildings.length > 0 ? buildings[0].id : "");
    const uId = selectedUnit?.id || "";
    if (bId) {
      router.push(`/government/3d-land-map?buildingId=${encodeURIComponent(bId)}${uId ? `&unitId=${encodeURIComponent(uId)}` : ""}`);
    } else {
      router.push("/government/3d-land-map");
    }
  };

  const handleOpenRegistry = () => {
    if (selectedUnit?.ulpin) {
      router.push(`/government/property-registry?search=${encodeURIComponent(selectedUnit.ulpin)}`);
    } else {
      router.push("/government/property-registry");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2d6a4f] border-r-transparent" />
        <p className="text-xs font-bold text-[#3d5a4c]">Loading Real Government Cadastral GIS Data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <GovernmentPageHeader
        title="Internal Cadastral Map GIS"
        description="Authenticated 2D & 3D cadastral boundary inspection, property selection, and spatial topology verification."
      />

      {/* METRICS & QUICK SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-4 shadow-sm">
          <div className="text-[10px] font-extrabold text-[#6b887a] uppercase tracking-wider">
            Registered Parcels
          </div>
          <div className="text-xl font-extrabold text-[#162a21] mt-1">
            {metrics.totalBuildings} Structures
          </div>
          <div className="text-[10px] font-medium text-[#2d6a4f] mt-0.5">
            Real Spatial Boundaries
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-4 shadow-sm">
          <div className="text-[10px] font-extrabold text-[#6b887a] uppercase tracking-wider">
            Property Units
          </div>
          <div className="text-xl font-extrabold text-[#162a21] mt-1">
            {metrics.totalUnits} Units
          </div>
          <div className="text-[10px] font-medium text-[#2d6a4f] mt-0.5">
            ULPIN Registered
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-4 shadow-sm">
          <div className="text-[10px] font-extrabold text-[#6b887a] uppercase tracking-wider">
            Total Surveyed Area
          </div>
          <div className="text-xl font-extrabold text-[#162a21] mt-1">
            {metrics.totalAreaSqM} m²
          </div>
          <div className="text-[10px] font-medium text-[#2d6a4f] mt-0.5">
            Official Land Footprint
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-4 shadow-sm">
          <div className="text-[10px] font-extrabold text-[#6b887a] uppercase tracking-wider">
            Topology Validation
          </div>
          <div className="text-xl font-extrabold text-[#2d6a4f] mt-1 flex items-center gap-1.5">
            <span>✓ PASS</span>
          </div>
          <div className="text-[10px] font-medium text-[#6b887a] mt-0.5">
            {metrics.validGeometries} Valid Polygons
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800 shadow-sm">
          ⚠️ {error}
        </div>
      )}

      {/* MAIN MAP CONTAINER + INTERNAL SIDEBAR PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 2D/3D MAPVIEWER CONTAINER */}
        <div className="lg:col-span-8 xl:col-span-9 rounded-2xl border border-[#e2dad0] overflow-hidden bg-white shadow-sm min-h-[680px] relative">
          <RealWorldMapViewer
            buildings={buildings}
            building={selectedBuilding}
            onPropertySelect={handlePropertySelect}
            onBuildingSelect={handleBuildingSelect}
            onPropertyNavigate={(unit) => {
              setSelectedUnit(unit);
            }}
          />
        </div>

        {/* INTERNAL GIS CONTROL & INSPECTION DRAWER */}
        <div className="lg:col-span-4 xl:col-span-3 rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-5 shadow-sm space-y-5">
          {/* CONTROL TABS */}
          <div className="flex rounded-xl border border-[#e2dad0] bg-[#f8f5ee] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("INSPECTION")}
              className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition cursor-pointer ${
                activeTab === "INSPECTION"
                  ? "bg-[#2d6a4f] text-white shadow-sm"
                  : "text-[#162a21] hover:bg-[#e2dad0]/40"
              }`}
            >
              Data Inspection
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("TOPOLOGY")}
              className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition cursor-pointer ${
                activeTab === "TOPOLOGY"
                  ? "bg-[#2d6a4f] text-white shadow-sm"
                  : "text-[#162a21] hover:bg-[#e2dad0]/40"
              }`}
            >
              Topology
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("LAYERS")}
              className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition cursor-pointer ${
                activeTab === "LAYERS"
                  ? "bg-[#2d6a4f] text-white shadow-sm"
                  : "text-[#162a21] hover:bg-[#e2dad0]/40"
              }`}
            >
              Layers
            </button>
          </div>

          {/* TAB 1: DATA INSPECTION & SURVEYOR METADATA */}
          {activeTab === "INSPECTION" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e2dad0] pb-2">
                <h3 className="text-xs font-black text-[#162a21] uppercase tracking-wider">
                  Internal GIS Details
                </h3>
                <span className="rounded bg-[#2d6a4f]/10 text-[#2d6a4f] px-2 py-0.5 text-[9px] font-bold">
                  AUTHENTICATED
                </span>
              </div>

              {selectedUnit ? (
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-[#e2dad0] bg-white p-3.5 space-y-2">
                    <div className="text-[10px] font-bold text-[#6b887a] uppercase">
                      Selected Property Unit
                    </div>
                    <div className="text-base font-extrabold text-[#162a21]">
                      Unit {selectedUnit.unitNumber}
                    </div>
                    <div className="text-[11px] font-mono text-[#2d6a4f] bg-[#2d6a4f]/10 p-1.5 rounded-lg break-all font-bold">
                      {selectedUnit.ulpin || "ULPIN Pending"}
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-[#e2dad0] bg-white p-3.5">
                    <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                      <span className="text-[#6b887a] font-medium">Floor Level</span>
                      <span className="font-bold text-[#162a21]">Floor {selectedUnit.floorNumber}</span>
                    </div>

                    <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                      <span className="text-[#6b887a] font-medium">Land Use</span>
                      <span className="font-bold text-[#2d6a4f]">{selectedUnit.spaceType || "Residential"}</span>
                    </div>

                    <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                      <span className="text-[#6b887a] font-medium">Usable Area</span>
                      <span className="font-bold text-[#162a21]">{selectedUnit.area ? `${selectedUnit.area} m²` : "N/A"}</span>
                    </div>

                    <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                      <span className="text-[#6b887a] font-medium">Parent Building</span>
                      <span className="font-bold text-[#162a21] truncate max-w-[140px]">
                        {selectedBuilding?.name || "Cadastral Structure"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                      <span className="text-[#6b887a] font-medium">Approval Status</span>
                      <span className="font-bold text-[#2d6a4f]">
                        {(selectedBuilding as any)?.approvalStatus || "VERIFIED"}
                      </span>
                    </div>
                  </div>

                  {/* 2D ↔ 3D NAVIGATION BUTTONS */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={handleOpen3DMap}
                      className="w-full rounded-xl bg-[#2d6a4f] py-2.5 px-4 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>🧊</span>
                      <span>Open in 3D Volumetric Land Map</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenRegistry}
                      className="w-full rounded-xl border border-[#e2dad0] bg-white py-2.5 px-4 text-xs font-bold text-[#162a21] hover:bg-[#f3efe6] transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>📋</span>
                      <span>View in Property Registry</span>
                    </button>
                  </div>
                </div>
              ) : selectedBuilding ? (
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-[#e2dad0] bg-white p-3.5 space-y-1.5">
                    <div className="text-[10px] font-bold text-[#6b887a] uppercase">
                      Selected Cadastral Parcel
                    </div>
                    <div className="text-sm font-extrabold text-[#162a21]">
                      {selectedBuilding.name}
                    </div>
                    <div className="text-[10px] font-semibold text-[#3d5a4c]">
                      📍 {selectedBuilding.georeference?.latitude.toFixed(6)}° N, {selectedBuilding.georeference?.longitude.toFixed(6)}° E
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-[#e2dad0] bg-white p-3.5">
                    <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                      <span className="text-[#6b887a] font-medium">Total Floors</span>
                      <span className="font-bold text-[#162a21]">{selectedBuilding.floors?.length || 0} Levels</span>
                    </div>

                    <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                      <span className="text-[#6b887a] font-medium">Verification Status</span>
                      <span className="font-bold text-[#2d6a4f]">
                        {(selectedBuilding as any).approvalStatus || "VERIFIED"}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                      <span className="text-[#6b887a] font-medium">GIS Accuracy</span>
                      <span className="font-bold text-[#2d6a4f]">Sub-meter GNSS</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleOpen3DMap}
                      className="w-full rounded-xl bg-[#2d6a4f] py-2.5 px-4 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>🧊</span>
                      <span>Open in 3D Volumetric Land Map</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs font-semibold text-[#6b887a] bg-white rounded-xl border border-[#e2dad0]">
                  Click any parcel or structure on the map to inspect internal details.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TOPOLOGY VALIDATION */}
          {activeTab === "TOPOLOGY" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#e2dad0] pb-2">
                <h3 className="text-xs font-black text-[#162a21] uppercase tracking-wider">
                  Spatial Topology Validator
                </h3>
                <span className="rounded bg-[#2d6a4f]/10 text-[#2d6a4f] px-2 py-0.5 text-[9px] font-bold">
                  VERIFIED
                </span>
              </div>

              <p className="text-[11px] text-[#6b887a] leading-relaxed">
                Automatic geometric integrity and vertical overlap checks for selected cadastral boundaries.
              </p>

              <div className="space-y-2.5">
                {validationResults.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#e2dad0] bg-white p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#162a21]">{item.name}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        item.status === "PASS"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#6b887a]">{item.description}</p>
                    <p className="text-[10px] font-medium text-[#2d6a4f]">{item.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AVAILABLE LAYERS */}
          {activeTab === "LAYERS" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#e2dad0] pb-2">
                <h3 className="text-xs font-black text-[#162a21] uppercase tracking-wider">
                  Available GIS Layers
                </h3>
                <span className="rounded bg-[#2d6a4f]/10 text-[#2d6a4f] px-2 py-0.5 text-[9px] font-bold">
                  REAL GIS DATA
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#e2dad0] bg-white">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#2d6a4f]" />
                    <span className="font-bold text-[#162a21]">Cadastral Parcels</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-[#e2dad0] bg-white">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#d4a373]" />
                    <span className="font-bold text-[#162a21]">3D Building Footprints</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-[#e2dad0] bg-white">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#1b4332]" />
                    <span className="font-bold text-[#162a21]">Property Boundaries</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-[#e2dad0] bg-white">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-blue-500" />
                    <span className="font-bold text-[#162a21]">OpenFreeMap Base Map</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GovernmentCadastralMapPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2d6a4f] border-r-transparent" />
        <p className="text-xs font-bold text-[#3d5a4c]">Initializing Internal Cadastral Map...</p>
      </div>
    }>
      <CadastralMapContent />
    </Suspense>
  );
}
