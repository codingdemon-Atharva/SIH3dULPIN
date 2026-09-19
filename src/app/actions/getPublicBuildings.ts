"use server";

import { prisma } from "@/src/lib/prisma";

export async function getPublicVerifiedBuildings() {
  try {
    const verifiedBuildings = await prisma.building.findMany({
      where: {
        approvalStatus: "APPROVED", // Strict verification filter
      },
      include: {
        floors: {
          include: {
            units: true,
          },
          orderBy: {
            floorNumber: "asc",
          },
        },
      },
    });

    return { success: true, data: verifiedBuildings };
  } catch (error) {
    console.error("Failed to fetch public verified buildings:", error);
    return { success: false, data: [] };
  }
}

export async function getPublicPropertyDetails(id: string) {
  if (!id || typeof id !== "string") {
    return { success: false, building: null, unit: null };
  }

  try {
    // Attempt to find building where approvalStatus is APPROVED and matches property ID, ULPIN, or building ID
    const building = await prisma.building.findFirst({
      where: {
        approvalStatus: "APPROVED",
        OR: [
          { id: id },
          {
            floors: {
              some: {
                units: {
                  some: {
                    OR: [
                      { id: id },
                      { ulpin: id },
                    ],
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        floors: {
          include: {
            units: true,
          },
          orderBy: {
            floorNumber: "asc",
          },
        },
      },
    });

    if (!building) {
      return { success: false, building: null, unit: null };
    }

    // Find the specific matching unit if present
    let matchedUnit: any = null;
    for (const floor of building.floors) {
      const u = floor.units.find((unit) => unit.id === id || unit.ulpin === id);
      if (u) {
        matchedUnit = { ...u, floorNumber: floor.floorNumber };
        break;
      }
    }

    // Fallback to first unit if ID was a building ID
    if (!matchedUnit && building.floors.length > 0 && building.floors[0].units.length > 0) {
      const firstFloor = building.floors[0];
      matchedUnit = { ...firstFloor.units[0], floorNumber: firstFloor.floorNumber };
    }

    return {
      success: true,
      building: {
        id: building.id,
        name: building.name,
        latitude: building.latitude,
        longitude: building.longitude,
        approvalStatus: building.approvalStatus,
        verifiedAt: building.verifiedAt,
        floors: building.floors,
      },
      unit: matchedUnit,
    };
  } catch (error) {
    console.error("Failed to fetch public property details:", error);
    return { success: false, building: null, unit: null };
  }
}