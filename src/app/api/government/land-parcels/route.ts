import { NextRequest, NextResponse } from "next/server";
import { getGovernmentLandParcels } from "@/src/app/actions/government";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const filterStatus = searchParams.get("filterStatus") || "ALL";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  const result = await getGovernmentLandParcels({
    search,
    filterStatus,
    page,
    limit,
    sortBy,
    sortOrder,
  });

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
