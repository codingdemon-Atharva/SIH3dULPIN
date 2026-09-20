import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, isGovernmentRole } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export interface ParcelSubmission {
  id: string;
  applicantName: string;
  surfaceParcelId: string;
  buildingData: unknown;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "REVISION_REQUIRED";
  submittedAt: string;
  surveyorNotes?: string;
  georeference: {
    latitude: number;
    longitude: number;
    elevationOffset: number;
  };
}

// In-memory fallback storage for pending surveyor reviews
const pendingSubmissions: Map<string, ParcelSubmission> = new Map();

async function requireSurveyor() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const user = await verifySession(sessionToken);

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Invalid or expired session." },
        { status: 401 }
      ),
    };
  }

  if (!isGovernmentRole(user.role)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Internal portal authorization required." },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicantName, surfaceParcelId, buildingData, georeference } = body;

    const submissionId = `SUB-${Date.now().toString().slice(-6)}`;

    const submission: ParcelSubmission = {
      id: submissionId,
      applicantName: applicantName || "Anonymous Citizen",
      surfaceParcelId: surfaceParcelId || "PARCEL-4012",
      buildingData,
      status: "PENDING_REVIEW",
      submittedAt: new Date().toISOString(),
      georeference:
        georeference || {
          latitude: 18.5204,
          longitude: 73.8567,
          elevationOffset: 0,
        },
    };

    pendingSubmissions.set(submissionId, submission);

    return NextResponse.json({
      success: true,
      message:
        "Field data submitted successfully. Pending Cadastral Surveyor approval.",
      submissionId,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid submission data" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireSurveyor();

  if (!auth.authorized || !auth.user) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const { submissionId, status, surveyorNotes } = body;

    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: "Missing submissionId" },
        { status: 400 }
      );
    }

    // Attempt to update database building if submissionId matches a Prisma Building
    try {
      const validStatus =
        status === "APPROVED"
          ? "APPROVED"
          : status === "REJECTED"
          ? "REJECTED"
          : "PENDING_REVIEW";

      const updated = await prisma.building.update({
        where: { id: submissionId },
        data: {
          approvalStatus: validStatus,
          surveyorId: auth.user.id,
          verifiedAt: new Date(),
        },
      });

      if (validStatus === "APPROVED") {
        const buildingWithFloors = await prisma.building.findUnique({
          where: { id: submissionId },
          include: { floors: { include: { units: true } } },
        });

        if (buildingWithFloors) {
          for (const floor of buildingWithFloors.floors) {
            for (const unit of floor.units) {
              if (!unit.ulpin || unit.ulpin.trim() === "") {
                const generatedULPIN = `14-4012-${submissionId.slice(0, 4)}-3D-F${floor.floorNumber}-${unit.unitNumber}`;
                await prisma.property.update({
                  where: { id: unit.id },
                  data: { ulpin: generatedULPIN },
                });
              }
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Cadastral record status updated to ${validStatus}`,
        data: updated,
      });
    } catch {
      // Fallback to in-memory map if submissionId is a temporary client submission
      const submission = pendingSubmissions.get(submissionId);
      if (submission) {
        submission.status = status;
        submission.surveyorNotes = surveyorNotes;
        pendingSubmissions.set(submissionId, submission);

        return NextResponse.json({
          success: true,
          message: `Parcel status updated to ${status}`,
          submission,
        });
      }

      return NextResponse.json(
        { success: false, error: "Submission not found in registry" },
        { status: 404 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update review status" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const auth = await requireSurveyor();

  if (!auth.authorized) {
    return auth.response;
  }

  return NextResponse.json(Array.from(pendingSubmissions.values()));
}