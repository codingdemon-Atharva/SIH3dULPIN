"use server";

import { prisma } from "@/src/lib/prisma";
import { requireGovernmentUser } from "@/src/lib/auth";

export interface GovernmentDashboardMetrics {
  totalBuildings: number;
  approvedBuildings: number;
  pendingBuildings: number;
  rejectedBuildings: number;
  totalProperties: number;
  verifiedProperties: number;
  totalAreaSqM: number;
  ulpinAssigned: number;
  ulpinUnassigned: number;
  ulpinCoveragePercent: number;
  spaceTypeDistribution: Array<{
    spaceType: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string;
    user: string;
    timestamp: string;
  }>;
}

export async function getGovernmentDashboardOverview() {
  const auth = await requireGovernmentUser();

  if (!auth.authorized) {
    return {
      success: false as const,
      status: auth.status,
      error: auth.error,
      data: null,
    };
  }

  try {
    let totalBuildings = 0;
    let approvedBuildings = 0;
    let pendingBuildings = 0;
    let rejectedBuildings = 0;
    let totalProperties = 0;
    let verifiedProperties = 0;
    let totalAreaSqM = 0;
    let ulpinAssigned = 0;
    let spaceTypeDistribution: Array<{ spaceType: string; count: number }> = [];

    try {
      const [
        bCount,
        bStatusGroups,
        pCount,
        vPCount,
        areaAgg,
        uAssignedCount,
        sGroups,
      ] = await Promise.all([
        prisma.building.count(),
        prisma.building.groupBy({
          by: ["approvalStatus"],
          _count: { _all: true },
        }),
        prisma.property.count(),
        prisma.property.count({
          where: {
            floor: {
              building: {
                approvalStatus: "APPROVED",
              },
            },
          },
        }),
        prisma.property.aggregate({
          _sum: {
            area: true,
          },
        }),
        prisma.property.count({
          where: {
            ulpin: {
              not: null,
            },
            NOT: {
              ulpin: "",
            },
          },
        }),
        prisma.property.groupBy({
          by: ["spaceType"],
          _count: { _all: true },
        }),
      ]);

      totalBuildings = bCount;
      totalProperties = pCount;
      verifiedProperties = vPCount;
      totalAreaSqM = Math.round((areaAgg._sum.area || 0) * 100) / 100;
      ulpinAssigned = uAssignedCount;

      for (const group of bStatusGroups) {
        if (group.approvalStatus === "APPROVED") {
          approvedBuildings = group._count._all;
        } else if (group.approvalStatus === "PENDING_REVIEW") {
          pendingBuildings = group._count._all;
        } else if (group.approvalStatus === "REJECTED") {
          rejectedBuildings = group._count._all;
        }
      }

      spaceTypeDistribution = sGroups.map((group) => ({
        spaceType: group.spaceType || "UNSPECIFIED",
        count: group._count._all,
      }));
    } catch (dbError) {
      console.warn("Database query failed or unavailable, returning zero state metrics:", dbError);
    }

    const ulpinUnassigned = Math.max(0, totalProperties - ulpinAssigned);
    const ulpinCoveragePercent =
      totalProperties > 0
        ? Math.round((ulpinAssigned / totalProperties) * 100)
        : 0;

    const metrics: GovernmentDashboardMetrics = {
      totalBuildings,
      approvedBuildings,
      pendingBuildings,
      rejectedBuildings,
      totalProperties,
      verifiedProperties,
      totalAreaSqM,
      ulpinAssigned,
      ulpinUnassigned,
      ulpinCoveragePercent,
      spaceTypeDistribution,
      recentActivity: [], // No activity/audit model exists in schema
    };

    return {
      success: true as const,
      status: 200,
      error: null,
      data: metrics,
    };
  } catch (error) {
    console.error("Failed to fetch government dashboard overview:", error);
    return {
      success: false as const,
      status: 500,
      error: "Failed to retrieve Government dashboard overview.",
      data: null,
    };
  }
}

// ==========================================
// LAND PARCELS MANAGEMENT
// ==========================================

export interface LandParcelsQueryOptions {
  search?: string;
  filterStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GovernmentLandParcelItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  approvalStatus: string;
  surveyorId: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  totalFloors: number;
  totalUnits: number;
  totalAreaSqM: number;
  hasGeometry: boolean;
  firstUnitId: string | null;
  floors: Array<{
    id: string;
    floorNumber: number;
    elevation: number;
    height: number;
    unitsCount: number;
    firstUnitId: string | null;
  }>;
}

export interface GovernmentLandParcelsResult {
  items: GovernmentLandParcelItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getGovernmentLandParcels(options: LandParcelsQueryOptions = {}) {
  const auth = await requireGovernmentUser();

  if (!auth.authorized) {
    return {
      success: false as const,
      status: auth.status,
      error: auth.error,
      data: null,
    };
  }

  const {
    search = "",
    filterStatus = "ALL",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(100, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  try {
    let total = 0;
    let buildings: any[] = [];

    try {
      const where: any = {};

      if (filterStatus && filterStatus !== "ALL") {
        where.approvalStatus = filterStatus;
      }

      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { id: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ];
      }

      let validSortBy = "createdAt";
      if (["createdAt", "name", "id", "updatedAt"].includes(sortBy)) {
        validSortBy = sortBy;
      }

      const orderBy = { [validSortBy]: sortOrder === "asc" ? "asc" : "desc" };

      const [countRes, buildingsRes] = await Promise.all([
        prisma.building.count({ where }),
        prisma.building.findMany({
          where,
          skip,
          take: limitNum,
          orderBy,
          include: {
            floors: {
              orderBy: { floorNumber: "asc" },
              include: { units: true },
            },
          },
        }),
      ]);

      total = countRes;
      buildings = buildingsRes;
    } catch (dbError) {
      console.warn("Database query failed or unavailable, returning empty land parcels list:", dbError);
    }

    const items: GovernmentLandParcelItem[] = buildings.map((b) => {
      let totalUnits = 0;
      let totalAreaSqM = 0;
      let firstUnitId: string | null = null;

      const floorsSummary = (b.floors || []).map((f: any) => {
        const uCount = f.units ? f.units.length : 0;
        totalUnits += uCount;

        if (Array.isArray(f.units)) {
          for (const u of f.units) {
            totalAreaSqM += Number(u.area) || 0;
            if (!firstUnitId) {
              firstUnitId = u.id;
            }
          }
        }

        return {
          id: f.id,
          floorNumber: f.floorNumber,
          elevation: f.elevation,
          height: f.height,
          unitsCount: uCount,
          firstUnitId: f.units && f.units.length > 0 ? f.units[0].id : null,
        };
      });

      const hasValidLat = typeof b.latitude === "number" && !isNaN(b.latitude);
      const hasValidLng = typeof b.longitude === "number" && !isNaN(b.longitude);

      return {
        id: b.id,
        name: b.name || "Cadastral Structure",
        latitude: b.latitude,
        longitude: b.longitude,
        approvalStatus: b.approvalStatus,
        surveyorId: b.surveyorId || null,
        verifiedAt: b.verifiedAt ? b.verifiedAt.toISOString() : null,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
        totalFloors: b.floors ? b.floors.length : 0,
        totalUnits,
        totalAreaSqM: Math.round(totalAreaSqM * 100) / 100,
        hasGeometry: hasValidLat && hasValidLng,
        firstUnitId,
        floors: floorsSummary,
      };
    });

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      success: true as const,
      status: 200,
      error: null,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      } as GovernmentLandParcelsResult,
    };
  } catch (error) {
    console.error("Failed to fetch government land parcels:", error);
    return {
      success: false as const,
      status: 500,
      error: "Failed to retrieve Government land parcels.",
      data: null,
    };
  }
}

// ==========================================
// PROPERTY REGISTRY MANAGEMENT
// ==========================================

export interface PropertyRegistryQueryOptions {
  search?: string;
  filterStatus?: string;
  filterSpaceType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GovernmentPropertyItem {
  id: string;
  ulpin: string | null;
  unitNumber: string;
  area: number;
  spaceType: string;
  createdAt: string;
  floorId: string;
  floorNumber: number;
  elevation: number;
  height: number;
  buildingId: string;
  buildingName: string;
  latitude: number;
  longitude: number;
  approvalStatus: string;
  verifiedAt: string | null;
  hasGeometry: boolean;
}

export interface GovernmentPropertyRegistryResult {
  items: GovernmentPropertyItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getGovernmentPropertyRegistry(options: PropertyRegistryQueryOptions = {}) {
  const auth = await requireGovernmentUser();

  if (!auth.authorized) {
    return {
      success: false as const,
      status: auth.status,
      error: auth.error,
      data: null,
    };
  }

  const {
    search = "",
    filterStatus = "ALL",
    filterSpaceType = "ALL",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(100, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  try {
    let total = 0;
    let properties: any[] = [];

    try {
      const where: any = {};

      if (filterStatus && filterStatus !== "ALL") {
        where.floor = {
          building: {
            approvalStatus: filterStatus,
          },
        };
      }

      if (filterSpaceType && filterSpaceType !== "ALL") {
        where.spaceType = { equals: filterSpaceType, mode: "insensitive" };
      }

      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { id: { contains: query, mode: "insensitive" } },
          { ulpin: { contains: query, mode: "insensitive" } },
          { unitNumber: { contains: query, mode: "insensitive" } },
          { spaceType: { contains: query, mode: "insensitive" } },
          { floor: { building: { name: { contains: query, mode: "insensitive" } } } },
        ];
      }

      let validSortBy = "createdAt";
      if (["createdAt", "ulpin", "area", "unitNumber"].includes(sortBy)) {
        validSortBy = sortBy;
      }

      const orderBy = { [validSortBy]: sortOrder === "asc" ? "asc" : "desc" };

      const [countRes, propertiesRes] = await Promise.all([
        prisma.property.count({ where }),
        prisma.property.findMany({
          where,
          skip,
          take: limitNum,
          orderBy,
          include: {
            floor: {
              include: {
                building: true,
              },
            },
          },
        }),
      ]);

      total = countRes;
      properties = propertiesRes;
    } catch (dbError) {
      console.warn("Database query failed or unavailable, returning empty property registry list:", dbError);
    }

    const items: GovernmentPropertyItem[] = properties.map((p) => {
      let polygonArray: unknown[] = [];
      if (typeof p.polygon === "string") {
        try {
          polygonArray = JSON.parse(p.polygon) as unknown[];
        } catch {
          polygonArray = [];
        }
      } else if (Array.isArray(p.polygon)) {
        polygonArray = p.polygon;
      }

      const hasGeometry = Array.isArray(polygonArray) && polygonArray.length >= 3;

      return {
        id: p.id,
        ulpin: p.ulpin || null,
        unitNumber: p.unitNumber || "UNIT",
        area: Number(p.area) || 0,
        spaceType: p.spaceType || "RESIDENTIAL",
        createdAt: p.createdAt.toISOString(),
        floorId: p.floor.id,
        floorNumber: p.floor.floorNumber,
        elevation: p.floor.elevation,
        height: p.floor.height,
        buildingId: p.floor.building.id,
        buildingName: p.floor.building.name || "Cadastral Structure",
        latitude: p.floor.building.latitude,
        longitude: p.floor.building.longitude,
        approvalStatus: p.floor.building.approvalStatus,
        verifiedAt: p.floor.building.verifiedAt
          ? p.floor.building.verifiedAt.toISOString()
          : null,
        hasGeometry,
      };
    });

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      success: true as const,
      status: 200,
      error: null,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      } as GovernmentPropertyRegistryResult,
    };
  } catch (error) {
    console.error("Failed to fetch government property registry:", error);
    return {
      success: false as const,
      status: 500,
      error: "Failed to retrieve Government property registry.",
      data: null,
    };
  }
}
