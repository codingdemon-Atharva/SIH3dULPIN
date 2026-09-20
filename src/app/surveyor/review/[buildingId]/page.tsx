
import { notFound, redirect } from "next/navigation";

import { getSurveyorSession } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

import ReviewActions from "./ReviewActions";

interface PageProps {
  params: Promise<{
    buildingId: string;
  }>;
}

export default async function SurveyorReviewPage({
  params,
}: PageProps) {
  const session = await getSurveyorSession();

  if (!session) {
    redirect("/surveyor/login");
  }

  const { buildingId } = await params;

  const building = await prisma.building.findUnique({
    where: {
      id: buildingId,
    },

    include: {
      floors: {
        orderBy: {
          floorNumber: "asc",
        },

        include: {
          units: true,
        },
      },
    },
  });

  if (!building) {
    notFound();
  }

  const totalUnits = building.floors.reduce(
    (total, floor) =>
      total + floor.units.length,
    0
  );

  const totalArea = building.floors.reduce(
    (total, floor) =>
      total +
      floor.units.reduce(
        (floorTotal, unit) =>
          floorTotal + unit.area,
        0
      ),
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm text-blue-400">
              Surveyor Portal
            </p>

            <h1 className="mt-1 text-xl font-semibold">
              Property Verification
            </h1>
          </div>

          <a
            href="/surveyor/dashboard"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-900"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* BUILDING HEADER */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-bold">
                  {building.name}
                </h2>

                <StatusBadge
                  status={building.approvalStatus}
                />
              </div>

              <p className="mt-2 font-mono text-xs text-slate-500">
                Building ID: {building.id}
              </p>
            </div>

            <ReviewActions
              buildingId={building.id}
              currentStatus={building.approvalStatus}
            />
          </div>

          {/* SUMMARY */}
          <div className="mt-8 grid grid-cols-2 gap-5 border-t border-slate-800 pt-6 md:grid-cols-4">
            <Summary
              label="Latitude"
              value={building.latitude.toFixed(6)}
            />

            <Summary
              label="Longitude"
              value={building.longitude.toFixed(6)}
            />

            <Summary
              label="Floors"
              value={String(building.floors.length)}
            />

            <Summary
              label="Properties"
              value={String(totalUnits)}
            />
          </div>
        </section>

        {/* LOCATION */}
        <section className="mt-8">
          <h3 className="mb-4 text-xl font-semibold">
            Geospatial Reference
          </h3>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Coordinate
                label="Latitude"
                value={building.latitude}
              />

              <Coordinate
                label="Longitude"
                value={building.longitude}
              />
            </div>

            <p className="mt-5 text-sm text-slate-500">
              This coordinate is the building reference
              position extracted from the cadastral upload.
            </p>
          </div>
        </section>

        {/* FLOOR STRUCTURE */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                Vertical Structure
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Floor and property topology extracted from
                the uploaded cadastral file.
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500">
                Total area
              </p>

              <p className="font-semibold">
                {totalArea.toFixed(2)} m²
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {building.floors.map((floor) => (
              <div
                key={floor.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
              >
                <div className="flex flex-col gap-3 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-semibold">
                      Floor {floor.floorNumber}
                    </h4>

                    <p className="text-xs text-slate-500">
                      Elevation:{" "}
                      {floor.elevation} m · Height:{" "}
                      {floor.height} m
                    </p>
                  </div>

                  <span className="text-sm text-slate-400">
                    {floor.units.length} properties
                  </span>
                </div>

                <div className="divide-y divide-slate-800">
                  {floor.units.map((unit) => (
                    <div
                      key={unit.id}
                      className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {unit.unitNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {unit.spaceType}
                        </p>
                      </div>

                      <div className="flex gap-8 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">
                            Area
                          </p>

                          <p>
                            {unit.area} m²
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            ULPIN
                          </p>

                          <p className="font-mono text-xs">
                            {unit.ulpin || "Not generated"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Geometry
                          </p>

                          <p className="text-xs text-green-400">
                            Available
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    PENDING_REVIEW:
      "bg-yellow-500/10 text-yellow-400",
    APPROVED:
      "bg-green-500/10 text-green-400",
    REJECTED:
      "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs ${
        styles[status] ||
        "bg-slate-800 text-slate-400"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}

function Coordinate({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-mono text-lg">
        {value.toFixed(8)}
      </p>
    </div>
  );
}
