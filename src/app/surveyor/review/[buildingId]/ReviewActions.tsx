
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  approveBuilding,
  updateBuildingStatus,
} from "@/src/app/actions/cadastre";

interface Props {
  buildingId: string;
  currentStatus: string;
}

export default function ReviewActions({
  buildingId,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState<
    "approve" | "reject" | null
  >(null);

  const [error, setError] = useState("");

  async function handleApprove() {
    const confirmed = window.confirm(
      "Approve this building and generate 3D ULPINs for all properties?"
    );

    if (!confirmed) {
      return;
    }

    setLoading("approve");
    setError("");

    const result =
      await approveBuilding(buildingId);

    if (!result.success) {
      setError(
        result.error ||
          "Approval failed."
      );

      setLoading(null);
      return;
    }

    router.refresh();
  }

  async function handleReject() {
    const confirmed = window.confirm(
      "Reject this cadastral submission?"
    );

    if (!confirmed) {
      return;
    }

    setLoading("reject");
    setError("");

    const result =
      await updateBuildingStatus(
        buildingId,
        "REJECTED"
      );

    if (!result.success) {
      setError(
        result.error ||
          "Rejection failed."
      );

      setLoading(null);
      return;
    }

    router.push("/surveyor/dashboard");
    router.refresh();
  }

  if (currentStatus === "APPROVED") {
    return (
      <div className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400">
        ✓ Building verified
      </div>
    );
  }

  if (currentStatus === "REJECTED") {
    return (
      <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
        Submission rejected
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        onClick={handleReject}
        disabled={loading !== null}
        className="rounded-lg border border-red-900 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-950 disabled:opacity-50"
      >
        {loading === "reject"
          ? "Rejecting..."
          : "Reject"}
      </button>

      <button
        onClick={handleApprove}
        disabled={loading !== null}
        className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-500 disabled:opacity-50"
      >
        {loading === "approve"
          ? "Generating ULPIN..."
          : "✓ Approve & Generate ULPIN"}
      </button>
    </div>
  );
}
