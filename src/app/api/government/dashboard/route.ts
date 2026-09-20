import { NextResponse } from "next/server";
import { getGovernmentDashboardOverview } from "@/src/app/actions/government";

export async function GET() {
  const result = await getGovernmentDashboardOverview();

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
      },
      { status: result.status }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: result.data,
    },
    { status: 200 }
  );
}
