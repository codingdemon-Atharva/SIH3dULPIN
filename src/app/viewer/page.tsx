"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";

import FileUploader from "@/src/components/FileUploader";
import type {
  ParsedBuilding,
  Property2D,
} from "@/src/lib/parser/types";

import VolumetricViewer from "@/src/components/VolumetricViewer";
import CadastralGraph from "@/src/components/CadastralGraph";
import ULPINSearch from "@/src/components/ULPINSearch";
import ExportPanel from "@/src/components/ExportPanel";
import TopologyValidator from "@/src/components/TopologyValidator";
import SurveyorApprovalPanel, {
  SurveyorVerificationData,
} from "@/src/components/SurveyorApprovalPanel";

import { PageShell } from "@/src/components/PageShell";
import { Badge, Button, Card } from "@/src/components/ui";
import { useLanguage } from "@/src/context/LanguageContext";

// Database Server Actions
import {
  getAllBuildings,
  approveBuilding,
  savePendingBuilding,
  updateBuildingStatus,
  deleteBuilding,
} from "@/src/app/actions/cadastre";
import { getPublicVerifiedBuildings } from "@/src/app/actions/getPublicBuildings";

/**
 * MapLibre must remain client-side.
 */
const RealWorldMapViewer = dynamic(
  () =>
    import(
      "@/src/components/RealWorldMapViewer"
    ),
  {
    ssr: false,
  }
);

type RoleMode =
  | "PUBLIC_VIEWER"
  | "SURVEYOR"
  | "UPLOADER";

type UserRole =
  | "VIEWER"
  | "SURVEYOR";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [roleMode, setRoleMode] =
    useState<RoleMode>("PUBLIC_VIEWER");

  const [userRole, setUserRole] =
    useState<UserRole | null>(null);

  const [showUploader, setShowUploader] =
    useState(false);

  const [buildingList, setBuildingList] =
    useState<any[]>([]);

  const [building, setBuilding] =
    useState<ParsedBuilding | null>(null);

  const [selectedProperty, setSelectedProperty] =
    useState<string | null>(null);

  const [verification, setVerification] =
    useState<SurveyorVerificationData | null>(null);

  const [loadingDb, setLoadingDb] =
    useState(false);

  const [activeNavSection, setActiveNavSection] =
    useState("home");

  const [mapLocationNotice, setMapLocationNotice] =
    useState<string | null>(null);

  /**
   * LOAD CURRENT AUTHENTICATED USER
   */
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response =
          await fetch("/api/auth/me");

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (
          data.success &&
          (data.user?.role === "VIEWER" ||
            data.user?.role === "SURVEYOR")
        ) {
          setUserRole(
            data.user.role
          );
        }
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error
        );
      }
    }

    loadCurrentUser();
  }, []);

  /**
   * PORTAL MODE AUTHORIZATION
   */
  const handleRoleModeChange = (
    mode: RoleMode
  ) => {
    if (
      mode === "SURVEYOR" &&
      userRole !== "SURVEYOR"
    ) {
      return;
    }

    setRoleMode(mode);

    if (mode !== "SURVEYOR") {
      setVerification(null);
    }

    if (mode === "PUBLIC_VIEWER") {
      setBuilding(null);
      setSelectedProperty(null);
      setVerification(null);
    }
  };

  /**
   * DATABASE BUILDING -> ParsedBuilding
   */
  const mapDbToParsedBuilding = (
    dbBuilding: any
  ): ParsedBuilding => {
    const latitude = Number(
      dbBuilding?.latitude ??
        dbBuilding?.georeference?.latitude
    );

    const longitude = Number(
      dbBuilding?.longitude ??
        dbBuilding?.georeference?.longitude
    );

    const hasValidGeoreference =
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180;

    const floors = Array.isArray(
      dbBuilding?.floors
    )
      ? dbBuilding.floors
      : [];

    const buildingId = String(dbBuilding?.id ?? "BLDG-DEFAULT");

    return {
      id: buildingId,

      name: String(
        dbBuilding?.name ??
        dbBuilding?.buildingName ??
        "Cadastral Building"
      ),

      ...(hasValidGeoreference
        ? {
            georeference: {
              latitude,
              longitude,
            },
          }
        : {}),

      floors: floors.map(
        (floor: any, floorIdx: number) => ({
          floorNumber:
            Number(
              floor?.floorNumber
            ) || 0,

          elevation:
            Number(
              floor?.elevation
            ) || 0,

          height:
            Number(
              floor?.height
            ) || 3,

          units: Array.isArray(
            floor?.units
          )
            ? floor.units.map(
                (unit: any, unitIdx: number) => {
                  let polygon =
                    unit?.polygon;

                  if (
                    typeof polygon ===
                    "string"
                  ) {
                    try {
                      polygon =
                        JSON.parse(
                          polygon
                        );
                    } catch {
                      polygon = [];
                    }
                  }

                  return {
                    id: String(
                      unit?.id ??
                      `UNIT-${buildingId}-${floorIdx}-${unitIdx}`
                    ),

                    unitNumber: String(
                      unit?.unitNumber ??
                      unit?.id ??
                      "UNIT"
                    ),

                    floorNumber:
                      Number(
                        floor?.floorNumber
                      ) || 0,

                    area:
                      Number(
                        unit?.area
                      ) || 0,

                    polygon:
                      Array.isArray(
                        polygon
                      )
                        ? polygon
                        : [],

                    ulpin: unit?.ulpin ? String(unit.ulpin) : undefined,

                    spaceType: String(
                      unit?.spaceType ??
                      "RESIDENTIAL"
                    ),
                  };
                }
              )
            : [],
        })
      ),
    };
  };

  /**
   * BUILDINGS THAT CAN ACTUALLY BE PUT ON MAP
   */
  const publicMapBuildings =
    useMemo(() => {
      return buildingList
        .map(
          mapDbToParsedBuilding
        )
        .filter(
          (item) =>
            item.georeference &&
            Number.isFinite(
              item.georeference
                .latitude
            ) &&
            Number.isFinite(
              item.georeference
                .longitude
            )
        );
    }, [buildingList]);

  const loadDatabaseRecords = async () => {
    setLoadingDb(true);

    try {
      if (roleMode === "PUBLIC_VIEWER") {
        const res = await getPublicVerifiedBuildings();
        if (res.success && res.data) {
          setBuildingList(res.data);
          setBuilding(null);
          setSelectedProperty(null);
          setVerification(null);
        } else {
          setBuildingList([]);
          setBuilding(null);
          setSelectedProperty(null);
        }
        return;
      }

      if (roleMode === "SURVEYOR") {
        if (userRole !== "SURVEYOR") {
          setRoleMode("PUBLIC_VIEWER");
          return;
        }

        const res = await getAllBuildings();
        if (res.success && res.data) {
          setBuildingList(res.data);
          if (res.data.length > 0) {
            setBuilding((current) => {
              if (current) return current;
              return mapDbToParsedBuilding(res.data[0]);
            });
          } else {
            setBuilding(null);
          }
        } else {
          setBuildingList([]);
          setBuilding(null);
        }
        return;
      }
    } catch (error) {
      console.error("Failed to load cadastral records:", error);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      loadDatabaseRecords();
    }

    return () => {
      isMounted = false;
    };
  }, [roleMode, userRole]);

  /**
   * HANDLE DEEP LINK QUERY PARAMS (e.g. ?propertyId=... or ?buildingId=...)
   */
  useEffect(() => {
    if (roleMode !== "PUBLIC_VIEWER" || loadingDb) return;

    const queryPropertyId = searchParams?.get("propertyId") || searchParams?.get("ulpin");
    const queryBuildingId = searchParams?.get("buildingId");

    if (!queryPropertyId && !queryBuildingId) return;

    queueMicrotask(() => {
      if (publicMapBuildings.length === 0 && buildingList.length > 0) {
        setMapLocationNotice("Map location is not available for this record.");
        return;
      }

      if (publicMapBuildings.length > 0) {
        let matchedBuilding: ParsedBuilding | undefined;
        let matchedUnitId: string | null = null;

        for (const b of publicMapBuildings) {
          if (queryBuildingId && b.id === queryBuildingId) {
            matchedBuilding = b;
          }

          if (queryPropertyId) {
            for (const floor of b.floors ?? []) {
              const unit = floor.units?.find(
                (u) => u.id === queryPropertyId || u.ulpin === queryPropertyId
              );
              if (unit) {
                matchedBuilding = b;
                matchedUnitId = unit.id;
                break;
              }
            }
          }

          if (matchedBuilding) break;
        }

        if (matchedBuilding) {
          setBuilding(matchedBuilding);
          if (matchedUnitId) {
            setSelectedProperty(matchedUnitId);
          }
        } else if (buildingList.length > 0) {
          setMapLocationNotice("Map location is not available for this record.");
        }
      }
    });
  }, [
    searchParams,
    roleMode,
    loadingDb,
    publicMapBuildings,
    buildingList,
  ]);

  const handlePublicBuildingSelect =
    (
      selectedBuilding: ParsedBuilding
    ) => {
      setBuilding(
        selectedBuilding
      );
      setSelectedProperty(null);
      setVerification(null);

      sessionStorage.setItem(
        "activeBuildingData",
        JSON.stringify(
          selectedBuilding
        )
      );

      window.setTimeout(() => {
        document
          .getElementById(
            "selected-building-view"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 50);
    };

  const handleBackToMap = () => {
    setBuilding(null);
    setSelectedProperty(null);
    setVerification(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleParsed = async (
    parsedBuilding: ParsedBuilding
  ) => {
    setBuilding(
      parsedBuilding
    );
    setSelectedProperty(null);
    setShowUploader(false);

    try {
      const res =
        await savePendingBuilding(
          parsedBuilding
        );

      if (res.success) {
        alert(
          "Plan saved to database queue as PENDING_REVIEW!"
        );
        await loadDatabaseRecords();
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error(
        "Upload/save error:",
        error
      );
      alert("Upload failed.");
    }
  };

  const handleStatusChange = async (
    buildingId: string,
    newStatus:
      | "PENDING_REVIEW"
      | "REJECTED"
  ) => {
    try {
      const res =
        await updateBuildingStatus(
          buildingId,
          newStatus
        );

      if (res.success) {
        await loadDatabaseRecords();
      } else {
        alert(
          "Failed to update status."
        );
      }
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );
      alert(
        "Failed to update status."
      );
    }
  };

  const handleDelete = async (
    buildingId: string
  ) => {
    if (
      !confirm(
        "Are you sure you want to delete this submission?"
      )
    ) {
      return;
    }

    try {
      const res =
        await deleteBuilding(
          buildingId
        );

      if (res.success) {
        if (
          building?.id ===
          buildingId
        ) {
          setBuilding(null);
          setSelectedProperty(null);
        }
        await loadDatabaseRecords();
      } else {
        alert("Deletion failed.");
      }
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );
      alert("Deletion failed.");
    }
  };

  const handleVerificationComplete =
    async (
      data: SurveyorVerificationData
    ) => {
      if (
        userRole !==
        "SURVEYOR"
      ) {
        return;
      }

      setVerification(data);

      if (
        building?.id &&
        data.status === "APPROVED"
      ) {
        try {
          const res =
            await approveBuilding(
              building.id
            );

          if (res.success) {
            alert(
              "Building approved and assigned official ULPINs!"
            );
            await loadDatabaseRecords();
          } else {
            alert(
              "Database approval failed."
            );
          }
        } catch (error) {
          console.error(
            "Approval error:",
            error
          );
          alert(
            "Database approval failed."
          );
        }
      }
    };

  const handlePropertyNavigate = (
    property:
      | Property2D
      | string
  ) => {
    const propId =
      typeof property ===
      "string"
        ? property
        : property.id;

    setSelectedProperty(propId);

    if (building) {
      sessionStorage.setItem(
        "activeBuildingData",
        JSON.stringify(
          building
        )
      );
    }

    if (propId) {
      router.push(
        `/properties/${propId}`
      );
    }
  };

  const handlePropertySelect = (
    property:
      | Property2D
      | string
  ) => {
    const propId =
      typeof property ===
      "string"
        ? property
        : property.id;

    setSelectedProperty(propId);

    if (building) {
      sessionStorage.setItem(
        "activeBuildingData",
        JSON.stringify(
          building
        )
      );
    }
  };

  return (
    <PageShell
      roleMode={roleMode}
      userRole={userRole}
      onRoleModeChange={handleRoleModeChange}
      activeSection={activeNavSection}
      onSelectSection={(sec) => setActiveNavSection(sec)}
    >
      {/* UPLOADER MODAL */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081a12]/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#1f3a2f] bg-[#0f2d21] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-[#1f3a2f] pb-3">
              <h2 className="text-lg font-bold text-white">
                Upload Cadastral Field Plan
              </h2>
              <button
                type="button"
                onClick={() => setShowUploader(false)}
                className="rounded-lg bg-[#14382a] px-2.5 py-1 text-xs font-semibold text-[#a8c3b5] hover:text-white"
              >
                ✕
              </button>
            </div>
            <FileUploader onParsed={handleParsed} />
          </div>
        </div>
      )}

      {/* SURVEYOR PORTAL */}
      {roleMode === "SURVEYOR" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6">
          <aside className="rounded-2xl border border-[#1f3a2f] bg-[#0f2d21]/90 p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-[#1f3a2f] pb-3">
              <h3 className="text-sm font-bold text-[#52b788] flex items-center gap-2">
                <span>📋</span> Cadastral Records ({buildingList.length})
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowUploader(true)}
              >
                + Plan
              </Button>
            </div>

            {loadingDb ? (
              <p className="text-xs text-[#a8c3b5]">Loading records...</p>
            ) : buildingList.length === 0 ? (
              <p className="text-xs text-[#a8c3b5]">No submissions found.</p>
            ) : (
              buildingList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setBuilding(mapDbToParsedBuilding(item))}
                  className={`p-3 rounded-xl mb-3 cursor-pointer transition border ${
                    building?.id === item.id
                      ? "bg-[#1b4332] border-[#52b788]"
                      : "bg-[#14382a]/60 border-[#1f3a2f] hover:border-[#2d6a4f]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[170px]">
                      {item.name}
                    </span>
                    <Badge
                      variant={
                        item.approvalStatus === "APPROVED"
                          ? "success"
                          : item.approvalStatus === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {item.approvalStatus}
                    </Badge>
                  </div>

                  <div className="mt-3 flex gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item.id, "PENDING_REVIEW");
                      }}
                      className="rounded bg-[#1f3a2f] px-2 py-1 text-[10px] font-semibold text-[#a8c3b5] hover:text-white"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item.id, "REJECTED");
                      }}
                      className="rounded bg-[#881337] px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#450a0a]"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="rounded bg-[#450a0a] px-2 py-1 text-[10px] font-semibold text-[#fca5a5]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </aside>

          <section className="flex flex-col gap-6">
            {building ? (
              <>
                <TopologyValidator building={building} />
                <SurveyorApprovalPanel
                  building={building}
                  onVerificationComplete={handleVerificationComplete}
                />

                <Card variant="dark" title="2D/3D Cadastral Map Verification">
                  <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-[#1f3a2f]">
                    <RealWorldMapViewer
                      key={building.id}
                      building={building}
                      approvalStatus={verification?.status || "PENDING_REVIEW"}
                      onPropertyNavigate={handlePropertyNavigate}
                      onPropertySelect={handlePropertySelect}
                    />
                  </div>
                </Card>
              </>
            ) : (
              <Card variant="dark">
                <div className="text-center py-16 text-[#a8c3b5]">
                  Select a cadastral record from the side panel to inspect topology and issue ULPIN verification.
                </div>
              </Card>
            )}
          </section>
        </div>
      ) : (
        /* PUBLIC VIEWER OR UPLOADER PORTAL */
        <div className="w-full h-full">
          {roleMode === "PUBLIC_VIEWER" && (
            <>
              {!building ? (
                <section className="w-full h-[calc(100vh-80px)] min-h-[600px] relative overflow-hidden">
                  <RealWorldMapViewer
                    buildings={publicMapBuildings}
                    onBuildingSelect={handlePublicBuildingSelect}
                  />
                  {loadingDb && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 rounded-full border border-[#e2dad0] bg-[#fdfbf7]/90 px-4 py-1.5 text-xs font-semibold text-[#2d6a4f] shadow-md backdrop-blur-md flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2d6a4f] animate-pulse" />
                      {t.loadingRegistry}
                    </div>
                  )}
                  {mapLocationNotice && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 rounded-full border border-amber-300 bg-amber-50 px-5 py-2 text-xs font-bold text-amber-800 shadow-lg backdrop-blur-md flex items-center gap-2">
                      <span>⚠️ {mapLocationNotice}</span>
                      <button
                        type="button"
                        onClick={() => setMapLocationNotice(null)}
                        className="ml-2 font-bold hover:text-amber-950"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </section>
              ) : (
                <div id="selected-building-view" className="flex flex-col gap-6 p-6">
                  <Button variant="outline" size="sm" onClick={handleBackToMap} className="self-start">
                    {t.backToNationalMap}
                  </Button>

                  <Card variant="dark">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <h2 className="text-2xl font-extrabold text-white">
                          {building.name}
                        </h2>
                        {building.georeference && (
                          <p className="mt-1 text-xs text-[#a8c3b5]">
                            📍 Lat: {building.georeference.latitude.toFixed(6)}, Lng: {building.georeference.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                      <Badge variant="success" size="md">
                        {t.verifiedCadastralRecord}
                      </Badge>
                    </div>
                  </Card>

                  <ULPINSearch
                    building={building}
                    onSelectProperty={(id) => handlePropertyNavigate(id)}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card variant="dark" title={t.threeDVolumetricModel}>
                      <div className="h-[460px] rounded-xl overflow-hidden bg-[#060b09] border border-[#1f3a2f]">
                        <VolumetricViewer
                          building={building}
                          selectedPropertyId={selectedProperty}
                          onPropertySelect={(p) => handlePropertySelect(p.id)}
                        />
                      </div>
                    </Card>

                    <Card variant="dark" title={t.verticalCadastralGraph}>
                      <div className="h-[460px] rounded-xl overflow-auto bg-[#060b09] border border-[#1f3a2f]">
                        <CadastralGraph
                          building={building}
                          selectedNodeId={selectedProperty}
                          onNodeSelect={(nodeId) => handlePropertySelect(nodeId)}
                        />
                      </div>
                    </Card>
                  </div>

                  <Card variant="dark" title={t.realWorldGisMap}>
                    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-[#1f3a2f]">
                      <RealWorldMapViewer
                        key={building.id}
                        building={building}
                        approvalStatus="APPROVED"
                        onPropertyNavigate={handlePropertyNavigate}
                        onPropertySelect={handlePropertySelect}
                      />
                    </div>
                  </Card>

                  <ExportPanel building={building} />
                </div>
              )}
            </>
          )}

          {roleMode === "UPLOADER" && (
            <Card variant="dark" title="Submit Field Drawings & Survey Revisions">
              <p className="text-xs text-[#a8c3b5] mb-4">
                Submit GeoJSON or cadastral floorplan files into the BhuVista surveyor queue.
              </p>
              <FileUploader onParsed={handleParsed} />
            </Card>
          )}
        </div>
      )}
    </PageShell>
  );
}

export default function PublicViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f5ee] text-[#2d6a4f] text-xs font-bold">
          Loading BhuVista Viewer...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
