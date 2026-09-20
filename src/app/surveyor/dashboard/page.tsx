
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAllBuildings,
} from "@/src/app/actions/cadastre";
import { getSurveyorSession } from "@/src/lib/auth";

export default async function SurveyorDashboardPage() {
  const session = await getSurveyorSession();

  if (!session) {
    redirect("/surveyor/login");
  }

  const result = await getAllBuildings();
  const buildings = result.success ? result.data : [];

  const pending = buildings.filter(
    (building) =>
      building.approvalStatus === "PENDING_REVIEW"
  );

  const approved = buildings.filter(
    (building) =>
      building.approvalStatus === "APPROVED"
  );

  const rejected = buildings.filter(
    (building) =>
      building.approvalStatus === "REJECTED"
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
                3D
              </div>

              <div>
                <h1 className="font-semibold">
                  3D ULPIN
                </h1>

                <p className="text-xs text-slate-500">
                  Surveyor Portal
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-300">
              {session.email}
            </p>

            <p className="text-xs text-green-400">
              ● Authenticated
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* TITLE */}
        <div className="mb-10">
          <p className="text-sm font-medium text-blue-400">
            Verification Center
          </p>

          <h2 className="mt-2 text-4xl font-bold tracking-tight">
            Cadastral Dashboard
          </h2>

          <p className="mt-3 max-w-2xl text-slate-400">
            Review uploaded cadastral structures, inspect
            their spatial geometry and verify properties
            before generating 3D ULPIN identifiers.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total"
            value={buildings.length}
            description="All submissions"
          />

          <StatCard
            label="Pending"
            value={pending.length}
            description="Require verification"
          />

          <StatCard
            label="Approved"
            value={approved.length}
            description="Publicly visible"
          />

          <StatCard
            label="Rejected"
            value={rejected.length}
            description="Rejected submissions"
          />
        </div>

        {/* PENDING */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-semibold">
                Pending Verification
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                These properties require surveyor review.
              </p>
            </div>

            <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
              {pending.length} pending
            </span>
          </div>

          {pending.length === 0 ? (
            <EmptyState
              title="No pending submissions"
              description="All uploaded properties have been processed."
            />
          ) : (
            <div className="grid gap-5">
              {pending.map((building) => (
                <BuildingCard
                  key={building.id}
                  building={building}
                />
              ))}
            </div>
          )}
        </section>

        {/* APPROVED */}
        <section className="mt-12">
          <h3 className="mb-5 text-2xl font-semibold">
            Approved Properties
          </h3>

          {approved.length === 0 ? (
            <EmptyState
              title="No approved properties"
              description="Approved buildings will appear here."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {approved.map((building) => (
                <ApprovedCard
                  key={building.id}
                  building={building}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function BuildingCard({
  building,
}: {
  building: any;
}) {
  const unitCount = building.floors.reduce(
    (total: number, floor: any) =>
      total + floor.units.length,
    0
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h4 className="text-xl font-semibold">
                {building.name}
              </h4>

              <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-[11px] font-medium text-yellow-400">
                PENDING
              </span>
            </div>

            <p className="font-mono text-xs text-slate-500">
              {building.id}
            </p>
          </div>

          <Link
            href={`/surveyor/review/${building.id}`}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium transition hover:bg-blue-500"
          >
            Inspect Property →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-5 border-t border-slate-800 pt-5 sm:grid-cols-4">
          <DataItem
            label="Latitude"
            value={building.latitude.toFixed(5)}
          />

          <DataItem
            label="Longitude"
            value={building.longitude.toFixed(5)}
          />

          <DataItem
            label="Floors"
            value={String(building.floors.length)}
          />

          <DataItem
            label="Properties"
            value={String(unitCount)}
          />
        </div>
      </div>
    </div>
  );
}

function ApprovedCard({
  building,
}: {
  building: any;
}) {
  const unitCount = building.floors.reduce(
    (total: number, floor: any) =>
      total + floor.units.length,
    0
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold">
            {building.name}
          </h4>

          <p className="mt-1 font-mono text-xs text-slate-500">
            {building.id}
          </p>
        </div>

        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
          APPROVED
        </span>
      </div>

      <div className="mt-5 flex gap-6 text-sm">
        <div>
          <span className="text-slate-500">
            Floors
          </span>

          <p className="font-medium">
            {building.floors.length}
          </p>
        </div>

        <div>
          <span className="text-slate-500">
            Properties
          </span>

          <p className="font-medium">
            {unitCount}
          </p>
        </div>
      </div>

      <Link
        href={`/property/${building.id}`}
        className="mt-5 block rounded-lg border border-slate-700 px-4 py-2.5 text-center text-sm transition hover:bg-slate-800"
      >
        Open Public 3D View
      </Link>
    </div>
  );
}

function DataItem({
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

      <p className="mt-1 font-medium text-slate-200">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-10 text-center">
      <p className="font-medium text-slate-300">
        {title}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}
