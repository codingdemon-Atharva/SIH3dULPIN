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
