"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

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

// Database Server Actions
import {
  getAllBuildings,
  approveBuilding,
  savePendingBuilding,
  updateBuildingStatus,
  deleteBuilding,
} from "@/src/app/actions/cadastre";

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

export default function Dashboard() {
  const router = useRouter();

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

    return {
      id:
        dbBuilding?.id ??
        `BLDG-${Date.now()}-${Math.random()}`,

      name:
        dbBuilding?.name ??
        dbBuilding?.buildingName ??
        "Cadastral Building",

      ...(hasValidGeoreference
        ? {
            georeference: {
              latitude,
              longitude,
            },
          }
        : {}),

      floors: floors.map(
        (floor: any) => ({
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
                (unit: any) => {
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
                    id:
                      unit?.id ??
                      `UNIT-${Date.now()}-${Math.random()}`,

                    unitNumber:
                      unit?.unitNumber ??
                      unit?.id ??
                      "UNIT",

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

                    ulpin:
                      unit?.ulpin ||
                      undefined,

                    spaceType:
                      unit?.spaceType ??
                      "RESIDENTIAL",
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

  /**
   * LOAD DATABASE RECORDS
   */
  const loadDatabaseRecords =
    async () => {
      setLoadingDb(true);

      try {
        if (
          roleMode ===
          "PUBLIC_VIEWER"
        ) {
          const res =
            await getAllBuildings();

          if (
            res.success &&
            res.data
          ) {
            setBuildingList(
              res.data
            );
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

        if (
          roleMode ===
          "SURVEYOR"
        ) {
          if (
            userRole !==
            "SURVEYOR"
          ) {
            setRoleMode(
              "PUBLIC_VIEWER"
            );
            return;
          }

          const res =
            await getAllBuildings();

          if (
            res.success &&
            res.data
          ) {
            setBuildingList(
              res.data
            );

            if (
              res.data.length > 0
            ) {
              setBuilding(
                (current) => {
                  if (current) {
                    return current;
                  }
                  return mapDbToParsedBuilding(
                    res.data[0]
                  );
                }
              );
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
        console.error(
          "Failed to load cadastral records:",
          error
        );
      } finally {
        setLoadingDb(false);
      }
    };

  useEffect(() => {
    loadDatabaseRecords();
  }, [
    roleMode,
    userRole,
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
        <div className="flex flex-col gap-6">
          {roleMode === "PUBLIC_VIEWER" && (
            <>
              {!building ? (
                <section className="w-full h-[calc(100vh-130px)] min-h-[650px] rounded-2xl overflow-hidden border border-[#e2dad0] shadow-md bg-white">
                  {loadingDb ? (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#3d5a4c]">
                      Loading BhuVista cadastral registry...
                    </div>
                  ) : publicMapBuildings.length > 0 ? (
                    <RealWorldMapViewer
                      buildings={publicMapBuildings}
                      onBuildingSelect={handlePublicBuildingSelect}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-6 text-center text-[#3d5a4c]">
                      <div>
                        <h3 className="text-lg font-bold text-[#162a21]">
                          No map-ready 3D structures found
                        </h3>
                        <p className="mt-2 text-xs max-w-md text-[#6b887a]">
                          The registry contains records, but none currently have valid georeferenced coordinates.
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              ) : (
                <div id="selected-building-view" className="flex flex-col gap-6">
                  <Button variant="outline" size="sm" onClick={handleBackToMap} className="self-start">
                    ← Back to National Map
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
                        ✓ VERIFIED CADASTRAL RECORD
                      </Badge>
                    </div>
                  </Card>

                  <ULPINSearch
                    building={building}
                    onSelectProperty={(id) => handlePropertyNavigate(id)}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card variant="dark" title="3D Volumetric Property Model">
                      <div className="h-[460px] rounded-xl overflow-hidden bg-[#060b09] border border-[#1f3a2f]">
                        <VolumetricViewer
                          building={building}
                          selectedPropertyId={selectedProperty}
                          onPropertySelect={(p) => handlePropertySelect(p.id)}
                        />
                      </div>
                    </Card>

                    <Card variant="dark" title="Vertical Cadastral Graph">
                      <div className="h-[460px] rounded-xl overflow-auto bg-[#060b09] border border-[#1f3a2f]">
                        <CadastralGraph
                          building={building}
                          selectedNodeId={selectedProperty}
                          onNodeSelect={(nodeId) => handlePropertySelect(nodeId)}
                        />
                      </div>
                    </Card>
                  </div>

                  <Card variant="dark" title="Real-World GIS Map">
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
