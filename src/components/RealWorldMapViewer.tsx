
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map,
  NavigationControl,
  ScaleControl,
  Popup,
  LngLatBounds,
  setWorkerUrl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface Point2D {
  x: number;
  y: number;
}

export interface Property2D {
  id: string;
  unitNumber: string;
  floorNumber: number;
  area: number;
  polygon: Point2D[];
  ulpin?: string;
  spaceType?: string;
}

export interface Floor2D {
  floorNumber: number;
  elevation: number;
  height: number;
  units: Property2D[];
}

export interface ParsedBuilding {
  id: string;
  name?: string;
  address?: string;
  georeference?: {
    latitude: number;
    longitude: number;
  };
  floors: Floor2D[];
}

interface RealWorldMapViewerProps {
  building?: Partial<ParsedBuilding> | ParsedBuilding;
  approvalStatus?: string;
  onPropertyNavigate?: (property: Property2D) => void;
  onPropertySelect?: (property: Property2D) => void;
}

const SOURCE_ID = "cadastral-source";
const FOOTPRINT_LAYER = "cadastral-footprints";
const EXTRUSION_LAYER = "cadastral-extrusions";
const OUTLINE_LAYER = "cadastral-outlines";

/**
 * MapLibre v6 + Next.js/Turbopack
 *
 * Required:
 * public/maplibre/maplibre-gl-worker.mjs
 * public/maplibre/maplibre-gl-shared.mjs
 */
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

export default function RealWorldMapViewer({
  building,
  approvalStatus,
  onPropertyNavigate,
  onPropertySelect,
}: RealWorldMapViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const didFitRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [rotating, setRotating] = useState(false);

  const anchor = building?.georeference;

  const hasValidGeoreference =
    !!anchor &&
    Number.isFinite(anchor.latitude) &&
    Number.isFinite(anchor.longitude);

  /**
   * Convert local metre offsets into WGS84.
   */
  const localToLngLat = (
    point: Point2D,
    anchorLng: number,
    anchorLat: number
  ): [number, number] => {
    const metersPerDegreeLat = 111320;

    const metersPerDegreeLng =
      111320 *
      Math.cos((anchorLat * Math.PI) / 180);

    return [
      anchorLng + point.x / metersPerDegreeLng,
      anchorLat + point.y / metersPerDegreeLat,
    ];
  };

  /**
   * Create GeoJSON from all floors and units.
   */
  const createGeoJSON = () => {
    if (!hasValidGeoreference) {
      return {
        type: "FeatureCollection" as const,
        features: [],
      };
    }

    const features: any[] = [];

    for (const floor of building?.floors ?? []) {
      for (const unit of floor.units ?? []) {
        if (!unit.polygon || unit.polygon.length < 3) {
          continue;
        }

        const coordinates = unit.polygon.map((point) =>
          localToLngLat(
            point,
            anchor!.longitude,
            anchor!.latitude
          )
        );

        /**
         * Close polygon.
         */
        const first = coordinates[0];
        const last =
          coordinates[coordinates.length - 1];

        if (
          first &&
          last &&
          (first[0] !== last[0] ||
            first[1] !== last[1])
        ) {
          coordinates.push(first);
        }

        const base =
          Number(floor.elevation) || 0;

        const floorHeight =
          Number(floor.height) || 3;

        const height =
          base + floorHeight;

        features.push({
          type: "Feature",
          id: unit.id,

          properties: {
            id: unit.id,
            unitNumber: unit.unitNumber,
            floorNumber: floor.floorNumber,
            area: unit.area,
            ulpin: unit.ulpin ?? "",
            spaceType:
              unit.spaceType ?? "Unit",
            base,
            height,
          },

          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
        });
      }
    }

    return {
      type: "FeatureCollection" as const,
      features,
    };
  };

  /**
   * Calculate complete building bounds.
   */
  const getBuildingBounds = () => {
    if (!hasValidGeoreference) {
      return null;
    }

    const bounds = new LngLatBounds();

    let hasCoordinates = false;

    for (const floor of building?.floors ?? []) {
      for (const unit of floor.units ?? []) {
        for (const point of unit.polygon ?? []) {
          const [lng, lat] =
            localToLngLat(
              point,
              anchor!.longitude,
              anchor!.latitude
            );

          bounds.extend([lng, lat]);
          hasCoordinates = true;
        }
      }
    }

    return hasCoordinates ? bounds : null;
  };

  /**
   * Fit the entire uploaded structure.
   */
  const fitBuilding = (duration = 800) => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const bounds = getBuildingBounds();

    if (!bounds) {
      return;
    }

    map.fitBounds(bounds, {
      padding: {
        top: 140,
        bottom: 190,
        left: 240,
        right: 240,
      },

      duration,

      maxZoom: 18,

      pitch: is3D ? 55 : 0,

      bearing: map.getBearing(),
    });
  };

  /**
   * ---------------------------------------------------------
   * MAP INITIALIZATION
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    if (!hasValidGeoreference) {
      return;
    }

    if (mapRef.current) {
      return;
    }

    const map = new Map({
      container: containerRef.current,

      /**
       * OpenFreeMap vector basemap.
       */
      style:
        "https://tiles.openfreemap.org/styles/bright",

      center: [
        anchor!.longitude,
        anchor!.latitude,
      ],

      zoom: 16.5,

      minZoom: 3,
      maxZoom: 22,

      pitch: 55,
      bearing: 0,

      antialias: true,

      attributionControl: true,
    });

    mapRef.current = map;

    map.addControl(
      new NavigationControl({
        showCompass: true,
        showZoom: false,
        visualizePitch: true,
      }),
      "top-right"
    );

    map.addControl(
      new ScaleControl({
        maxWidth: 140,
        unit: "metric",
      }),
      "bottom-left"
    );

    map.on("load", () => {
      setMapReady(true);
    });

    return () => {
      setMapReady(false);

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    hasValidGeoreference,
    anchor?.latitude,
    anchor?.longitude,
  ]);

  /**
   * ---------------------------------------------------------
   * CADASTRAL LAYERS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) {
      return;
    }

    if (!hasValidGeoreference) {
      return;
    }

    const addLayers = () => {
      /**
       * Remove old layers.
       */
      if (map.getLayer(OUTLINE_LAYER)) {
        map.removeLayer(OUTLINE_LAYER);
      }

      if (map.getLayer(EXTRUSION_LAYER)) {
        map.removeLayer(EXTRUSION_LAYER);
      }

      if (map.getLayer(FOOTPRINT_LAYER)) {
        map.removeLayer(FOOTPRINT_LAYER);
      }

      if (map.getSource(SOURCE_ID)) {
        map.removeSource(SOURCE_ID);
      }

      const geojson = createGeoJSON();

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: geojson,
      });

      /**
       * Ground footprint.
       */
      map.addLayer({
        id: FOOTPRINT_LAYER,
        type: "fill",
        source: SOURCE_ID,

        paint: {
          "fill-color": [
            "match",
            ["get", "spaceType"],

            "STAIR",
            "#f97316",

            "STAIRS",
            "#f97316",

            "LIFT",
            "#8b5cf6",

            "ELEVATOR",
            "#8b5cf6",

            "CORRIDOR",
            "#64748b",

            "COMMON",
            "#0ea5e9",

            "#22c55e",
          ],

          "fill-opacity": 0.28,
        },
      });

      /**
       * 3D extrusion.
       */
      map.addLayer({
        id: EXTRUSION_LAYER,
        type: "fill-extrusion",
        source: SOURCE_ID,

        paint: {
          "fill-extrusion-color": [
            "match",
            ["get", "spaceType"],

            "STAIR",
            "#f97316",

            "STAIRS",
            "#f97316",

            "LIFT",
            "#8b5cf6",

            "ELEVATOR",
            "#8b5cf6",

            "CORRIDOR",
            "#64748b",

            "COMMON",
            "#0ea5e9",

            "#22c55e",
          ],

          "fill-extrusion-base": [
            "to-number",
            ["get", "base"],
            0,
          ],

          "fill-extrusion-height": [
            "to-number",
            ["get", "height"],
            3,
          ],

          "fill-extrusion-opacity": 0.86,

          "fill-extrusion-vertical-gradient": true,
        },
      });

      /**
       * Unit outlines.
       */
      map.addLayer({
        id: OUTLINE_LAYER,
        type: "line",
        source: SOURCE_ID,

        paint: {
          "line-color": [
            "match",
            ["get", "spaceType"],

            "STAIR",
            "#c2410c",

            "STAIRS",
            "#c2410c",

            "LIFT",
            "#6d28d9",

            "ELEVATOR",
            "#6d28d9",

            "CORRIDOR",
            "#334155",

            "#111827",
          ],

          "line-width": [
            "match",
            ["get", "spaceType"],

            "STAIR",
            2.8,

            "STAIRS",
            2.8,

            "LIFT",
            2.8,

            "ELEVATOR",
            2.8,

            1.8,
          ],

          "line-opacity": 0.95,
        },
      });

      /**
       * Click unit.
       */
      const handleClick = (event: any) => {
        const features =
          map.queryRenderedFeatures(
            event.point,
            {
              layers: [
                EXTRUSION_LAYER,
                FOOTPRINT_LAYER,
              ],
            }
          );

        if (!features.length) {
          return;
        }

        const feature = features[0];

        const properties =
          feature.properties ?? {};

        const unit: Property2D = {
          id: String(
            properties.id ?? ""
          ),

          unitNumber: String(
            properties.unitNumber ?? ""
          ),

          floorNumber: Number(
            properties.floorNumber ?? 0
          ),

          area: Number(
            properties.area ?? 0
          ),

          polygon: [],

          ulpin:
            properties.ulpin ||
            undefined,

          spaceType:
            properties.spaceType ||
            undefined,
        };

        const popupHtml = `
          <div
            style="
              min-width:230px;
              font-family:Arial,sans-serif;
              color:#111827;
              padding:2px;
            "
          >
            <div
              style="
                font-size:17px;
                font-weight:800;
                margin-bottom:9px;
              "
            >
              Unit ${
                unit.unitNumber || "—"
              }
            </div>

            <div
              style="
                font-size:13px;
                line-height:1.8;
              "
            >
              <div>
                <strong>Floor:</strong>
                ${unit.floorNumber}
              </div>

              <div>
                <strong>Area:</strong>
                ${
                  unit.area || "—"
                } m²
              </div>

              <div>
                <strong>Type:</strong>
                ${
                  unit.spaceType ||
                  "Unit"
                }
              </div>

              ${
                unit.ulpin
                  ? `
                    <div>
                      <strong>ULPIN:</strong>
                      ${unit.ulpin}
                    </div>
                  `
                  : ""
              }
            </div>
          </div>
        `;

        new Popup({
          closeButton: true,
          closeOnClick: true,
          maxWidth: "330px",
        })
          .setLngLat(event.lngLat)
          .setHTML(popupHtml)
          .addTo(map);

        onPropertySelect?.(unit);
        onPropertyNavigate?.(unit);
      };

      map.on(
        "click",
        EXTRUSION_LAYER,
        handleClick
      );

      map.on(
        "click",
        FOOTPRINT_LAYER,
        handleClick
      );

      /**
       * Hover pointer.
       */
      const pointerOn = () => {
        map.getCanvas().style.cursor =
          "pointer";
      };

      const pointerOff = () => {
        map.getCanvas().style.cursor =
          "";
      };

      map.on(
        "mouseenter",
        EXTRUSION_LAYER,
        pointerOn
      );

      map.on(
        "mouseenter",
        FOOTPRINT_LAYER,
        pointerOn
      );

      map.on(
        "mouseleave",
        EXTRUSION_LAYER,
        pointerOff
      );

      map.on(
        "mouseleave",
        FOOTPRINT_LAYER,
        pointerOff
      );

      /**
       * Automatically fit once.
       */
      if (!didFitRef.current) {
        const bounds =
          getBuildingBounds();

        if (bounds) {
          map.fitBounds(bounds, {
            padding: {
              top: 140,
              bottom: 190,
              left: 240,
              right: 240,
            },

            duration: 900,

            maxZoom: 18,

            pitch: is3D ? 55 : 0,
          });
        }

        didFitRef.current = true;
      }

      return () => {
        map.off(
          "click",
          EXTRUSION_LAYER,
          handleClick
        );

        map.off(
          "click",
          FOOTPRINT_LAYER,
          handleClick
        );

        map.off(
          "mouseenter",
          EXTRUSION_LAYER,
          pointerOn
        );

        map.off(
          "mouseenter",
          FOOTPRINT_LAYER,
          pointerOn
        );

        map.off(
          "mouseleave",
          EXTRUSION_LAYER,
          pointerOff
        );

        map.off(
          "mouseleave",
          FOOTPRINT_LAYER,
          pointerOff
        );
      };
    };

    if (map.isStyleLoaded()) {
      return addLayers();
    }

    map.once(
      "style.load",
      addLayers
    );

    return () => {
      map.off(
        "style.load",
        addLayers
      );
    };
  }, [
    mapReady,
    building,
    hasValidGeoreference,
    onPropertyNavigate,
    onPropertySelect,
  ]);

  /**
   * Reset automatic fit for a new building.
   */
  useEffect(() => {
    didFitRef.current = false;
  }, [building?.id]);

  /**
   * ---------------------------------------------------------
   * ZOOM
   * ---------------------------------------------------------
   */
  const zoomIn = () => {
    mapRef.current?.zoomIn({
      duration: 300,
    });
  };

  const zoomOut = () => {
    mapRef.current?.zoomOut({
      duration: 300,
    });
  };

  /**
   * ---------------------------------------------------------
   * 2D / 3D
   * ---------------------------------------------------------
   */
  const toggle3D = () => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    setIs3D((previous) => {
      const next = !previous;

      map.easeTo({
        pitch: next ? 55 : 0,
        duration: 700,
      });

      return next;
    });
  };

  /**
   * ---------------------------------------------------------
   * ROTATE
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !rotating) {
      return;
    }

    let animationFrame = 0;

    const rotate = () => {
      map.setBearing(
        map.getBearing() + 0.15
      );

      animationFrame =
        requestAnimationFrame(rotate);
    };

    animationFrame =
      requestAnimationFrame(rotate);

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };
  }, [rotating]);

  /**
   * ---------------------------------------------------------
   * UNIT COUNT
   * ---------------------------------------------------------
   */
  const buildingUnitCount =
    building?.floors?.reduce(
      (total, floor) =>
        total +
        (floor.units?.length ?? 0),
      0
    ) ?? 0;

  /**
   * ---------------------------------------------------------
   * WAITING STATE
   * ---------------------------------------------------------
   */
  if (!hasValidGeoreference) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "78vh",
          minHeight: "650px",
          maxHeight: "920px",

          borderRadius: 18,
          overflow: "hidden",

          background:
            "linear-gradient(135deg,#e0f2fe,#f8fafc)",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: 26,

            background:
              "rgba(255,255,255,0.94)",

            borderRadius: 16,

            boxShadow:
              "0 10px 35px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Waiting for cadastral data
          </div>

          <div
            style={{
              marginTop: 7,
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            Upload a cadastral file with
            valid GNSS coordinates.
          </div>
        </div>
      </div>
    );
  }

  /**
   * ---------------------------------------------------------
   * MAIN MAP
   * ---------------------------------------------------------
   */
  return (
    <div
      style={{
        position: "relative",
        width: "100%",

        /**
         * Large viewport.
         */
        height: "78vh",

        minHeight: "650px",
        maxHeight: "920px",

        overflow: "hidden",

        borderRadius: 18,

        background: "#dbeafe",

        boxShadow:
          "0 12px 35px rgba(15,23,42,0.10)",
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,
        }}
      />

      {/* -------------------------------------------------- */}
      {/* BUILDING INFO */}
      {/* -------------------------------------------------- */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          zIndex: 10,

          maxWidth: 320,

          background:
            "rgba(255,255,255,0.95)",

          borderRadius: 14,

          padding:
            "13px 16px",

          boxShadow:
            "0 8px 24px rgba(0,0,0,0.13)",

          backdropFilter:
            "blur(12px)",

          border:
            "1px solid rgba(255,255,255,0.7)",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#111827",
          }}
        >
          {building?.name ||
            "Cadastral Building"}
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "#64748b",
          }}
        >
          {buildingUnitCount} accessible
          units
        </div>

        {building?.address && (
          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            {building.address}
          </div>
        )}

        {approvalStatus && (
          <div
            style={{
              marginTop: 8,

              display:
                "inline-flex",

              alignItems:
                "center",

              padding:
                "4px 9px",

              borderRadius: 999,

              background:
                "#ecfdf5",

              color:
                "#047857",

              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {approvalStatus}
          </div>
        )}
      </div>

      {/* -------------------------------------------------- */}
      {/* MAP CONTROLS */}
      {/* -------------------------------------------------- */}
      <div
        style={{
          position: "absolute",

          right: 18,

          /**
           * IMPORTANT:
           * Kept significantly above the bottom edge
           * so the rotate/3D controls are never clipped.
           */
          bottom: 125,

          zIndex: 30,

          display: "flex",

          flexDirection: "column",

          gap: 8,
        }}
      >
        {/* Zoom in */}
        <button
          type="button"
          onClick={zoomIn}
          title="Zoom in"
          style={{
            width: 46,
            height: 46,

            flexShrink: 0,

            border: "none",
            borderRadius: 11,

            background: "#ffffff",

            boxShadow:
              "0 5px 16px rgba(0,0,0,0.16)",

            fontSize: 25,
            fontWeight: 700,

            cursor: "pointer",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>

        {/* Zoom out */}
        <button
          type="button"
          onClick={zoomOut}
          title="Zoom out"
          style={{
            width: 46,
            height: 46,

            flexShrink: 0,

            border: "none",
            borderRadius: 11,

            background: "#ffffff",

            boxShadow:
              "0 5px 16px rgba(0,0,0,0.16)",

            fontSize: 25,
            fontWeight: 700,

            cursor: "pointer",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          −
        </button>

        {/* 2D / 3D */}
        <button
          type="button"
          onClick={toggle3D}
          title="Toggle 2D / 3D"
          style={{
            width: 46,
            height: 46,

            flexShrink: 0,

            border: "none",
            borderRadius: 11,

            background: is3D
              ? "#111827"
              : "#ffffff",

            color: is3D
              ? "#ffffff"
              : "#111827",

            boxShadow:
              "0 5px 16px rgba(0,0,0,0.16)",

            fontSize: 13,
            fontWeight: 800,

            cursor: "pointer",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          3D
        </button>

        {/* Rotate */}
        <button
          type="button"
          onClick={() =>
            setRotating(
              (value) => !value
            )
          }
          title={
            rotating
              ? "Stop rotation"
              : "Rotate map"
          }
          style={{
            width: 46,
            height: 46,

            flexShrink: 0,

            border: "none",
            borderRadius: 11,

            background: rotating
              ? "#2563eb"
              : "#ffffff",

            color: rotating
              ? "#ffffff"
              : "#111827",

            boxShadow:
              "0 5px 16px rgba(0,0,0,0.16)",

            fontSize: 21,

            cursor: "pointer",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ↻
        </button>

        {/* Fit building */}
        <button
          type="button"
          onClick={() =>
            fitBuilding(700)
          }
          title="Show complete building"
          style={{
            width: 46,
            height: 46,

            flexShrink: 0,

            border: "none",
            borderRadius: 11,

            background: "#ffffff",

            boxShadow:
              "0 5px 16px rgba(0,0,0,0.16)",

            fontSize: 18,

            cursor: "pointer",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⌂
        </button>
      </div>

      {/* -------------------------------------------------- */}
      {/* LEGEND */}
      {/* -------------------------------------------------- */}
      <div
        style={{
          position: "absolute",

          left: 18,

          bottom: 18,

          zIndex: 10,

          display: "flex",

          alignItems: "center",

          flexWrap: "wrap",

          gap: 10,

          padding:
            "10px 13px",

          background:
            "rgba(255,255,255,0.95)",

          borderRadius: 11,

          boxShadow:
            "0 5px 18px rgba(0,0,0,0.12)",

          fontSize: 11,

          color: "#374151",

          backdropFilter:
            "blur(8px)",
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,

            background:
              "#22c55e",

            display:
              "inline-block",
          }}
        />

        Units

        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,

            background:
              "#f97316",

            display:
              "inline-block",
          }}
        />

        Stairs

        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,

            background:
              "#8b5cf6",

            display:
              "inline-block",
          }}
        />

        Lift
      </div>
    </div>
  );
}
