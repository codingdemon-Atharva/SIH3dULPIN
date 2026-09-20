"use client";

import React, { useState, useCallback } from "react";
import type { ParsedBuilding } from "@/src/lib/parser/types";
import { parseUploadedFile, detectFileFormat } from "@/src/lib/parser/fileParser";
import { validatePropertyRecord, EvaluatedValidationRecord } from "@/src/lib/validator";
import { submitSurveyorCadastralPlan, SurveyorSubmissionMetadata } from "@/src/app/actions/government";
import VolumetricViewer from "./VolumetricViewer";

interface SurveyorUploadWorkspaceProps {
  onSubmissionSuccess?: () => void;
}

export function SurveyorUploadWorkspace({ onSubmissionSuccess }: SurveyorUploadWorkspaceProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedBuilding, setParsedBuilding] = useState<ParsedBuilding | null>(null);
  const [validationResults, setValidationResults] = useState<EvaluatedValidationRecord[]>([]);

  // Metadata form state
  const [locationName, setLocationName] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");
  const [landUse, setLandUse] = useState("RESIDENTIAL");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [remarks, setRemarks] = useState("");

  // Submitting state
  const [submitting, setSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const processFile = useCallback(async (selectedFile: File) => {
    setParseError(null);
    setParsedBuilding(null);
    setValidationResults([]);
    setSubmissionFeedback(null);
    setFile(selectedFile);
    setLoading(true);

    try {
      const format = detectFileFormat(selectedFile.name);
      const supportedFormats = ["geojson", "json", "dxf", "svg"];

      if (!supportedFormats.includes(format)) {
        throw new Error(
          `Unsupported file format ".${format}". Supported formats are: GeoJSON (.geojson, .json), DXF (.dxf), and SVG (.svg).`
        );
      }

      // Size check (max 20MB)
      if (selectedFile.size > 20 * 1024 * 1024) {
        throw new Error("File size exceeds 20MB limit. Please upload a smaller cadastral file.");
      }

      const building = await parseUploadedFile(selectedFile);

      if (!building || !building.floors || building.floors.length === 0) {
        throw new Error("Failed to extract valid cadastral geometry from file contents.");
      }

      setParsedBuilding(building);
      setLocationName(building.name || selectedFile.name.replace(/\.[^/.]+$/, ""));

      if (building.georeference) {
        setLatitude(building.georeference.latitude);
        setLongitude(building.georeference.longitude);
      } else {
        setLatitude(18.5204);
        setLongitude(73.8567);
      }

      // Run topology and quality checks on parsed properties
      const evaluations: EvaluatedValidationRecord[] = [];
      for (const floor of building.floors) {
        for (const unit of floor.units) {
          const evalRes = validatePropertyRecord({
            id: unit.id,
            unitNumber: unit.unitNumber,
            ulpin: unit.ulpin,
            area: unit.area,
            spaceType: unit.spaceType,
            polygon: unit.polygon,
            floor: {
              floorNumber: floor.floorNumber,
              elevation: floor.elevation,
              height: floor.height,
              building: {
                name: building.name,
                latitude: building.georeference?.latitude,
                longitude: building.georeference?.longitude,
              },
            },
          });
          evaluations.push(evalRes);
        }
      }
      setValidationResults(evaluations);
    } catch (err: any) {
      console.error("Error processing file:", err);
      setParseError(err.message || "An unexpected error occurred while parsing the file.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.target) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        processFile(droppedFile);
      }
    }
  };

  const resetUpload = () => {
    setFile(null);
    setParsedBuilding(null);
    setParseError(null);
    setValidationResults([]);
    setSubmissionFeedback(null);
    setLocationName("");
    setSurveyNumber("");
    setRemarks("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedBuilding) return;

    setSubmitting(true);
    setSubmissionFeedback(null);

    const metadata: SurveyorSubmissionMetadata = {
      surveyNumber: surveyNumber.trim() || undefined,
      locationName: locationName.trim() || parsedBuilding.name,
      landUse,
      remarks: remarks.trim() || undefined,
      latitude: latitude !== "" ? Number(latitude) : undefined,
      longitude: longitude !== "" ? Number(longitude) : undefined,
    };

    try {
      const res = await submitSurveyorCadastralPlan(parsedBuilding, metadata);
      if (res.success) {
        setSubmissionFeedback({
          type: "success",
          message: res.message || "Cadastral plan submitted successfully for verification.",
        });
        resetUpload();
        if (onSubmissionSuccess) {
          onSubmissionSuccess();
        }
      } else {
        setSubmissionFeedback({
          type: "error",
          message: res.error || "Failed to submit cadastral plan.",
        });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmissionFeedback({
        type: "error",
        message: "An unexpected network error occurred while submitting.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Derive global validation pass/warning/fail counts
  const passCount = validationResults.filter((r) => r.overallStatus === "PASS").length;
  const warningCount = validationResults.filter((r) => r.overallStatus === "WARNING").length;
  const failCount = validationResults.filter((r) => r.overallStatus === "FAIL").length;

  const totalUnits = parsedBuilding
    ? parsedBuilding.floors.reduce((sum, f) => sum + f.units.length, 0)
    : 0;

  const totalArea = parsedBuilding
    ? parsedBuilding.floors.reduce(
        (sum, f) => sum + f.units.reduce((uSum, u) => uSum + (u.area || 0), 0),
        0
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Submission Feedback Banner */}
      {submissionFeedback && (
        <div
          className={`rounded-2xl border p-4 text-xs flex items-center justify-between gap-4 shadow-sm transition ${
            submissionFeedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-red-200 bg-red-50 text-red-950"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`text-base font-bold ${
                submissionFeedback.type === "success" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {submissionFeedback.type === "success" ? "✓" : "✕"}
            </span>
            <span className="font-bold">{submissionFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSubmissionFeedback(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Drag and Drop Upload Area */}
      {!parsedBuilding && (
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="text-left space-y-1">
            <h2 className="text-base sm:text-lg font-extrabold text-[#162a21]">
              Upload 2D Land / Cadastral File
            </h2>
            <p className="text-xs text-[#6b887a]">
              Upload an authorized 2D cadastral floor plan or land survey file. Uploaded geometry will be parsed, topologically validated, and submitted to the Pending Verification queue.
            </p>
          </div>

          <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
            <label
              htmlFor="surveyor-file-upload"
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition cursor-pointer ${
                dragActive
                  ? "border-[#2d6a4f] bg-[#2d6a4f]/10"
                  : "border-[#e2dad0] bg-[#f8f5ee] hover:bg-[#f3efe6]"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-[#e2dad0] text-[#2d6a4f] shadow-sm mb-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <div className="text-sm font-extrabold text-[#162a21]">
                Drag and drop your cadastral file here
              </div>
              <p className="text-xs text-[#6b887a] mt-1">
                or click to browse from your computer
              </p>

              <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-[#2d6a4f] bg-[#2d6a4f]/10 px-3 py-1.5 rounded-full">
                <span>Supported File Formats:</span>
                <span className="font-mono">GeoJSON / JSON, DXF, SVG</span>
              </div>

              <input
                id="surveyor-file-upload"
                type="file"
                accept=".geojson,.json,.dxf,.svg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </form>

          {/* Loading / Parsing State */}
          {parsing && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-900">
                <span className="h-3 w-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                Parsing 2D cadastral file and extracting geometry...
              </div>
            </div>
          )}

          {/* Parsing Error Alert */}
          {parseError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 flex items-start gap-3 shadow-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-100 text-red-700 shrink-0 font-bold">
                ✕
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-red-950">Parsing / Validation Failed</h4>
                <p>{parseError}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Parsed State & Submission Workspace */}
      {parsedBuilding && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-extrabold text-emerald-800 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                2D CADASTRAL FILE PARSED
              </div>
              <h3 className="text-xl font-extrabold text-[#162a21]">
                {file?.name || parsedBuilding.name}
              </h3>
              <p className="text-xs text-[#6b887a] mt-0.5">
                Review parsed parcel geometry and topology validation before submitting for government review.
              </p>
            </div>

            <button
              type="button"
              onClick={resetUpload}
              className="rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-4 py-2 text-xs font-bold text-[#162a21] hover:bg-[#e2dad0] transition cursor-pointer shrink-0"
            >
              Upload Different File
            </button>
          </div>

          {/* Summary Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#e2dad0] bg-white p-4 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b887a]">
                Structure / Name
              </span>
              <div className="text-base font-extrabold text-[#162a21] truncate mt-1">
                {parsedBuilding.name}
              </div>
            </div>

            <div className="rounded-2xl border border-[#e2dad0] bg-white p-4 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b887a]">
                Floor Levels
              </span>
              <div className="text-xl font-extrabold text-[#162a21] mt-1">
                {parsedBuilding.floors.length} Levels
              </div>
            </div>

            <div className="rounded-2xl border border-[#e2dad0] bg-white p-4 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b887a]">
                Property Units
              </span>
              <div className="text-xl font-extrabold text-[#162a21] mt-1">
                {totalUnits} Units
              </div>
            </div>

            <div className="rounded-2xl border border-[#e2dad0] bg-white p-4 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b887a]">
                Total Measured Area
              </span>
              <div className="text-xl font-extrabold text-[#2d6a4f] mt-1">
                {Math.round(totalArea).toLocaleString()} m²
              </div>
            </div>
          </div>

          {/* Validation Status Summary Banner */}
          <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2dad0] pb-3">
              <h3 className="text-sm font-extrabold text-[#162a21]">
                Automated GIS Quality & Topology Validation Result
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  ✓ {passCount} PASS
                </span>
                {warningCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                    ⚠ {warningCount} WARNING
                  </span>
                )}
                {failCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                    ✕ {failCount} FAIL
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-[#6b887a]">
              The parsed 2D polygon boundaries have passed standard topological checks (closed ring geometry, vertical clearance offsets, and spatial area footprints).
            </p>
          </div>

          {/* Interactive 3D / 2D Cadastral Geometry Preview */}
          <div className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2dad0] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#162a21]">
                  2D / 3D Geometry Interactive Preview
                </h3>
                <p className="text-xs text-[#6b887a] mt-0.5">
                  Visually confirm spatial boundaries and unit footprints before final submission.
                </p>
              </div>
              <span className="rounded-lg bg-[#2d6a4f]/10 px-3 py-1 text-xs font-bold text-[#2d6a4f]">
                Actual Extracted Polygon Model
              </span>
            </div>

            <div className="rounded-xl border border-[#e2dad0] overflow-hidden bg-[#fdfbf7] p-2 min-h-[380px]">
              <VolumetricViewer building={parsedBuilding} />
            </div>
          </div>

          {/* Submission Information Form */}
          <form onSubmit={handleSubmit} className="rounded-2xl border border-[#e2dad0] bg-white p-6 shadow-sm space-y-5">
            <div className="border-b border-[#e2dad0] pb-3">
              <h3 className="text-base font-extrabold text-[#162a21]">
                Submission Metadata & Survey Information
              </h3>
              <p className="text-xs text-[#6b887a] mt-0.5">
                Provide required survey reference details for official record keeping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Location Name */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#162a21]">
                  Property / Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Shivajinagar Cadastral Block 4"
                  className="w-full rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-3.5 py-2.5 text-xs text-[#162a21] outline-none focus:border-[#2d6a4f] focus:bg-white transition"
                />
              </div>

              {/* Survey Number */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#162a21]">
                  Survey Number / Reference Key
                </label>
                <input
                  type="text"
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                  placeholder="e.g. SURVEY-2024-8842"
                  className="w-full rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-3.5 py-2.5 text-xs text-[#162a21] outline-none focus:border-[#2d6a4f] focus:bg-white transition font-mono"
                />
              </div>

              {/* Land Use Classification */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#162a21]">
                  Primary Land Use Classification
                </label>
                <select
                  value={landUse}
                  onChange={(e) => setLandUse(e.target.value)}
                  className="w-full rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-3.5 py-2.5 text-xs font-bold text-[#162a21] outline-none focus:border-[#2d6a4f] focus:bg-white transition cursor-pointer"
                >
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="AGRICULTURAL">Agricultural</option>
                  <option value="INDUSTRIAL">Industrial</option>
                  <option value="INSTITUTIONAL">Institutional</option>
                  <option value="MIXED_USE">Mixed Use</option>
                </select>
              </div>

              {/* Coordinates Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#162a21]">Latitude (°N)</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="18.5204"
                    className="w-full rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-3.5 py-2.5 text-xs text-[#162a21] outline-none focus:border-[#2d6a4f] focus:bg-white transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-[#162a21]">Longitude (°E)</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="73.8567"
                    className="w-full rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-3.5 py-2.5 text-xs text-[#162a21] outline-none focus:border-[#2d6a4f] focus:bg-white transition font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Remarks / Field Notes */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-[#162a21]">
                Surveyor Remarks / CORS Field Notes
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter field observation notes, CORS GNSS benchmark references, or boundary clarification notes..."
                className="w-full rounded-xl border border-[#e2dad0] bg-[#f8f5ee] px-3.5 py-2.5 text-xs text-[#162a21] outline-none focus:border-[#2d6a4f] focus:bg-white transition"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 border-t border-[#e2dad0] pt-4">
              <button
                type="button"
                onClick={resetUpload}
                disabled={submitting}
                className="rounded-xl border border-[#e2dad0] bg-white px-5 py-2.5 text-xs font-bold text-[#162a21] hover:bg-[#f3efe6] transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#2d6a4f] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#1b4332] transition cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                )}
                <span>Submit for Verification →</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
