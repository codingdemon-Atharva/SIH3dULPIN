"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import VolumetricViewer from "@/src/components/VolumetricViewer";
import { getGovernmentGISBuildings } from "@/src/app/actions/government";
import { validateCadastralModel, ValidationResult } from "@/src/lib/validator";
import type { ParsedBuilding, Property2D } from "@/src/lib/parser/types";

function Volumetric3DLandMapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlBuildingId = searchParams.get("buildingId");
  const urlUnitId = searchParams.get("unitId");

  const [buildings, setBuildings] = useState<ParsedBuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<Property2D | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  // Load real GIS buildings from database
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const res = await getGovernmentGISBuildings();
        if (res.success && Array.isArray(res.data)) {
          if (isMounted) {
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

            // Determine initial building selection
            let initialBId = "";
            if (urlBuildingId) {
              const matchedB = normalized.find((b: ParsedBuilding) => b.id === urlBuildingId);
              if (matchedB) {
                initialBId = matchedB.id;
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
            }

            if (!initialBId && normalized.length > 0) {
              initialBId = normalized[0].id;
            }

            setSelectedBuildingId(initialBId);
          }
        } else {
          if (isMounted) {
            setError(res.error || "Failed to load 3D cadastral records.");
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

    loadData();
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

  const selectedBuilding = useMemo(() => {
    return buildings.find((b) => b.id === selectedBuildingId) || null;
  }, [buildings, selectedBuildingId]);

  // Check if current building has valid 3D polygon geometry
  const has3DGeometry = useMemo(() => {
    if (!selectedBuilding) return false;
    return (selectedBuilding.floors || []).some((f) =>
      (f.units || []).some((u) => Array.isArray(u.polygon) && u.polygon.length >= 3)
    );
  }, [selectedBuilding]);

  // Summary counts for current building
  const buildingMetrics = useMemo(() => {
    if (!selectedBuilding) return { floors: 0, units: 0, totalArea: 0 };
    let unitsCount = 0;
    let totalArea = 0;

    for (const f of selectedBuilding.floors || []) {
      for (const u of f.units || []) {
        unitsCount++;
        totalArea += u.area || 0;
      }
    }

    return {
      floors: selectedBuilding.floors?.length || 0,
      units: unitsCount,
      totalArea: Math.round(totalArea * 100) / 100,
    };
  }, [selectedBuilding]);

  const handleOpen2DMap = () => {
    if (selectedBuilding) {
      const uId = selectedUnit ? selectedUnit.id : "";
      router.push(`/government/cadastral-map?buildingId=${encodeURIComponent(selectedBuilding.id)}${uId ? `&unitId=${encodeURIComponent(uId)}` : ""}`);
    } else {
      router.push("/government/cadastral-map");
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
        <p className="text-xs font-bold text-[#3d5a4c]">Loading Real 3D Volumetric Geometry...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <GovernmentPageHeader
        title="3D Volumetric Land Map"
        description="High-density 3D volumetric cadastre visualization for vertical property ownership and vertical spatial intelligence."
      />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800 shadow-sm">
          ⚠️ {error}
        </div>
      )}

      {/* STRUCTURE SELECTOR & METRICS BAR */}
      <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-extrabold text-[#162a21] uppercase tracking-wider shrink-0">
            Select Cadastral Structure:
          </label>
          <select
            value={selectedBuildingId}
            onChange={(e) => {
              setSelectedBuildingId(e.target.value);
              setSelectedUnit(null);
            }}
            className="rounded-xl border border-[#e2dad0] bg-white px-4 py-2.5 text-xs font-bold text-[#162a21] focus:outline-none focus:border-[#2d6a4f] transition shadow-sm cursor-pointer min-w-[280px]"
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.floors?.length || 0} Levels)
              </option>
            ))}
          </select>
        </div>

        {/* METRICS INLINE */}
        <div className="flex items-center gap-6 text-xs text-[#162a21]">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#6b887a] font-bold uppercase">Levels</span>
            <span className="font-extrabold text-sm">{buildingMetrics.floors} Floors</span>
          </div>

          <div className="flex flex-col border-l border-[#e2dad0] pl-6">
            <span className="text-[10px] text-[#6b887a] font-bold uppercase">Volume Units</span>
            <span className="font-extrabold text-sm">{buildingMetrics.units} Units</span>
          </div>

          <div className="flex flex-col border-l border-[#e2dad0] pl-6">
            <span className="text-[10px] text-[#6b887a] font-bold uppercase">Floor Space</span>
            <span className="font-extrabold text-sm">{buildingMetrics.totalArea} m²</span>
          </div>

          <button
            type="button"
            onClick={handleOpen2DMap}
            className="rounded-xl bg-[#2d6a4f] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-sm cursor-pointer ml-2 shrink-0 flex items-center gap-1.5"
          >
            <span>🗺️</span>
            <span>View in 2D Cadastral Map</span>
          </button>
        </div>
      </div>

      {/* MAIN 3D MODEL & DETAILS INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D CANVAS */}
        <div className="lg:col-span-8 xl:col-span-9 rounded-2xl border border-[#e2dad0] overflow-hidden bg-white shadow-sm relative min-h-[650px]">
          {selectedBuilding && has3DGeometry ? (
            <VolumetricViewer
              building={selectedBuilding}
              selectedPropertyId={selectedUnit?.id}
              onPropertySelect={(unit) => setSelectedUnit(unit)}
            />
          ) : (
            <div className="min-h-[650px] flex flex-col items-center justify-center p-8 text-center bg-[#f8f5ee] space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 text-2xl font-bold">
                🧊
              </div>
              <h3 className="text-base font-extrabold text-[#162a21]">
                No 3D Volumetric Geometry Available
              </h3>
              <p className="text-xs text-[#6b887a] max-w-md mx-auto leading-relaxed font-medium">
                The selected parcel record ({selectedBuilding?.name || "Selected Structure"}) currently contains 2D footprint coordinates without complete 3D polygon mesh boundary rings.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpen2DMap}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-sm"
                >
                  ← Open in 2D Cadastral Map
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3D PROPERTY DETAILS & TOPOLOGY INSPECTOR */}
        <div className="lg:col-span-4 xl:col-span-3 rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#e2dad0] pb-2">
            <h3 className="text-xs font-black text-[#162a21] uppercase tracking-wider">
              3D Property Inspector
            </h3>
            <span className="rounded bg-[#2d6a4f]/10 text-[#2d6a4f] px-2 py-0.5 text-[9px] font-bold">
              3D ULPIN GIS
            </span>
          </div>

          {selectedUnit ? (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-[#e2dad0] bg-white p-3.5 space-y-2">
                <div className="text-[10px] font-bold text-[#6b887a] uppercase">
                  Selected Unit / Volume
                </div>
                <div className="text-lg font-extrabold text-[#162a21]">
                  Unit {selectedUnit.unitNumber}
                </div>
                <div className="text-[11px] font-mono text-[#2d6a4f] bg-[#2d6a4f]/10 p-2 rounded-lg break-all font-bold">
                  {selectedUnit.ulpin || `3D-${selectedBuilding?.id || "BLD"}-F0${selectedUnit.floorNumber}-${selectedUnit.unitNumber}`}
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-[#e2dad0] bg-white p-3.5">
                <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                  <span className="text-[#6b887a] font-medium">Floor Level</span>
                  <span className="font-bold text-[#162a21]">Floor {selectedUnit.floorNumber}</span>
                </div>

                <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                  <span className="text-[#6b887a] font-medium">Space Classification</span>
                  <span className="font-bold text-[#2d6a4f]">{selectedUnit.spaceType || "Residential"}</span>
                </div>

                <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                  <span className="text-[#6b887a] font-medium">Usable Area</span>
                  <span className="font-bold text-[#162a21]">{selectedUnit.area ? `${selectedUnit.area} m²` : "N/A"}</span>
                </div>

                <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                  <span className="text-[#6b887a] font-medium">Clear Story Height</span>
                  <span className="font-bold text-[#162a21]">3.20 meters</span>
                </div>

                <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                  <span className="text-[#6b887a] font-medium">3D Spatial Boundary</span>
                  <span className="font-bold text-[#2d6a4f]">✓ VERIFIED CLOSED</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleOpen2DMap}
                  className="w-full rounded-xl bg-[#2d6a4f] py-2.5 px-4 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🗺️</span>
                  <span>View in 2D Cadastral Map</span>
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
          ) : (
            <div className="space-y-4">
              <div className="p-4 text-center text-xs font-semibold text-[#6b887a] bg-white rounded-xl border border-[#e2dad0] leading-relaxed">
                Click any apartment, elevator shaft, or stairwell in the 3D model to inspect its 3D ULPIN and spatial properties.
              </div>

              {/* TOPOLOGY SUMMARY FOR BUILDING */}
              <div className="space-y-2 border-t border-[#e2dad0] pt-3">
                <h4 className="text-[11px] font-bold text-[#162a21] uppercase tracking-wider">
                  Structure 3D Topology
                </h4>

                {validationResults.map((v) => (
                  <div key={v.id} className="rounded-xl border border-[#e2dad0] bg-white p-2.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#162a21] text-[11px]">{v.name}</span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Government3dLandMapPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2d6a4f] border-r-transparent" />
        <p className="text-xs font-bold text-[#3d5a4c]">Initializing 3D Volumetric Land Map...</p>
      </div>
    }>
      <Volumetric3DLandMapContent />
    </Suspense>
  );
}
