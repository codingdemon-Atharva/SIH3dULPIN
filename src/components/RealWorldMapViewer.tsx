
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Map,
  NavigationControl,
  ScaleControl,
  Popup,
  LngLatBounds,
  Marker,
  setWorkerUrl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type {
  ParsedBuilding,
  Property2D,
} from "@/src/lib/parser/types";

setWorkerUrl(
  "/maplibre/maplibre-gl-worker.mjs"
);

/* ============================================================
   TYPES
   ============================================================ */

interface RealWorldMapViewerProps {
  /**
   * Single-building mode.
   */
  building?: ParsedBuilding | null;

  /**
   * Multi-building mode.
   *
   * Used by Public Viewer.
   */
  buildings?: ParsedBuilding[];

  approvalStatus?:
    | "PENDING_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | string;

  onPropertySelect?: (
    property: Property2D
  ) => void;

  onPropertyNavigate?: (
    property: Property2D
  ) => void;

  onBuildingSelect?: (
    building: ParsedBuilding
  ) => void;
}

type PointLike =
  | Point2D
  | [number, number]
  | {
      x?: number;
      y?: number;
      lng?: number;
      lat?: number;
    };

interface Point2D {
  x: number;
  y: number;
}

/* ============================================================
   IDS
   ============================================================ */

const SOURCE_ID =
  "ulpin-cadastral-source";

const FOOTPRINT_LAYER =
  "ulpin-cadastral-footprints";

const EXTRUSION_LAYER =
  "ulpin-cadastral-extrusions";

const OUTLINE_LAYER =
  "ulpin-cadastral-outlines";

/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Parse a possible JSON string safely.
 */
function parseMaybeJSON<T>(
  value: unknown,
  fallback: T
): T {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  if (
    typeof value !== "string"
  ) {
    return value as T;
  }

  try {
    return JSON.parse(
      value
    ) as T;
  } catch {
    return fallback;
  }
}

/**
 * Extract x/y from different possible point shapes.
 */
function getXY(
  point: PointLike
): [number, number] {
  if (
    Array.isArray(point)
  ) {
    return [
      Number(point[0]) || 0,
      Number(point[1]) || 0,
    ];
  }

  const obj = point as {
    x?: number;
    y?: number;
    lng?: number;
    lat?: number;
  };

  return [
    Number(
      obj.x ??
        obj.lng ??
        0
    ) || 0,

    Number(
      obj.y ??
        obj.lat ??
        0
    ) || 0,
  ];
}

/**
 * A local floor-plan coordinate can easily be:
 *
 * [6,0]
 * [8,27]
 *
 * so merely checking the valid longitude/latitude range
 * is NOT enough.
 */
function isProbablyGeographic(
  points: PointLike[],
  anchorLng: number,
  anchorLat: number
) {
  if (
    !points.length
  ) {
    return false;
  }

  /**
   * Geographic polygon should be near the anchor.
   */
  return points.every(
    (point) => {
      const [x, y] =
        getXY(point);

      return (
        x >= -180 &&
        x <= 180 &&
        y >= -90 &&
        y <= 90 &&
        Math.abs(
          x - anchorLng
        ) < 0.05 &&
        Math.abs(
          y - anchorLat
        ) < 0.05
      );
    }
  );
}

/**
 * Convert local metre offsets into WGS84.
 */
function localToLngLat(
  x: number,
  y: number,
  anchorLng: number,
  anchorLat: number
): [number, number] {
  const metersPerDegreeLat =
    111320;

  const metersPerDegreeLng =
    111320 *
    Math.cos(
      (anchorLat *
        Math.PI) /
        180
    );

  return [
    anchorLng +
      x /
        metersPerDegreeLng,

    anchorLat +
      y /
        metersPerDegreeLat,
  ];
}

/**
 * Normalize a DB building.
 *
 * Handles:
 * - floors as array
 * - floors as JSON string
 * - units as array
 * - units as JSON string
 * - polygon as JSON string
 * - latitude / longitude at different nesting levels
 */
function normalizeBuilding(
  input: any
): ParsedBuilding | null {
  if (!input) {
    return null;
  }

  const latitude = Number(
    input?.georeference
      ?.latitude ??
      input?.latitude ??
      input?.lat
  );

  const longitude = Number(
    input?.georeference
      ?.longitude ??
      input?.longitude ??
      input?.lng
  );

  const hasCoordinates =
    Number.isFinite(
      latitude
    ) &&
    Number.isFinite(
      longitude
    ) &&
    Math.abs(latitude) <=
      90 &&
    Math.abs(longitude) <=
      180;

  let floors =
    parseMaybeJSON<any[]>(
      input?.floors,
      []
    );

  if (
    !Array.isArray(
      floors
    )
  ) {
    floors = [];
  }

  /**
   * Some records may store a direct `units`
   * collection rather than nested floors.
   */
  if (
    floors.length === 0 &&
    input?.units
  ) {
    const directUnits =
      parseMaybeJSON<any[]>(
        input.units,
        []
      );

    if (
      Array.isArray(
        directUnits
      ) &&
      directUnits.length
    ) {
      floors = [
        {
          floorNumber: 0,
          elevation: 0,
          height: 3.2,
          units: directUnits,
        },
      ];
    }
  }

  /**
   * Some database serializers wrap the data.
   */
  if (
    floors.length === 0 &&
    input?.data
  ) {
    const data =
      parseMaybeJSON<any>(
        input.data,
        null
      );

    if (
      data?.floors
    ) {
      floors =
        parseMaybeJSON<any[]>(
          data.floors,
          []
        );
    }
  }

  return {
    id: String(
      input?.id ??
        `BUILDING-${Date.now()}-${Math.random()}`
    ),

    name:
      input?.name ??
      input?.buildingName ??
      input?.title ??
      "Cadastral Building",

    ...(hasCoordinates
      ? {
          georeference: {
            latitude,
            longitude,
          },
        }
      : {}),

    floors: floors.map(
      (
        floor: any,
        floorIndex: number
      ) => {
        const parsedUnits =
          parseMaybeJSON<any[]>(
            floor?.units,
            []
          );

        const units =
          Array.isArray(
            parsedUnits
          )
            ? parsedUnits
            : [];

        return {
          floorNumber:
            Number(
              floor?.floorNumber ??
                floor?.level ??
                floorIndex
            ) || 0,

          elevation:
            Number(
              floor?.elevation ??
                floor?.elevationMeters ??
                floorIndex * 3.2
            ) || 0,

          height:
            Number(
              floor?.height ??
                floor?.heightMeters ??
                3.2
            ) || 3.2,

          units: units.map(
            (
              unit: any,
              unitIndex: number
            ) => {
              let polygon =
                parseMaybeJSON<
                  any[]
                >(
                  unit?.polygon ??
                    unit?.geometry
                      ?.coordinates?.[0],
                  []
                );

              /**
               * Normalize GeoJSON geometry.
               */
              if (
                unit?.geometry
                  ?.type ===
                  "Polygon"
              ) {
                polygon =
                  unit
                    .geometry
                    .coordinates?.[0] ??
                  polygon;
              }

              return {
                id: String(
                  unit?.id ??
                    `UNIT-${floorIndex}-${unitIndex}`
                ),

                unitNumber: String(
                  unit?.unitNumber ??
                    unit?.unit ??
                    unit?.name ??
                    unit?.id ??
                    `UNIT-${unitIndex + 1}`
                ),

                floorNumber:
                  Number(
                    floor?.floorNumber ??
                      floor?.level ??
                      floorIndex
                  ) || 0,

                area:
                  Number(
                    unit?.area ??
                      unit?.areaSqm ??
                      unit?.areaMeters
                  ) || 0,

                polygon:
                  Array.isArray(
                    polygon
                  )
                    ? polygon
                    : [],

                ulpin:
                  unit?.ulpin ??
                  unit?.ULPIN ??
                  undefined,

                spaceType:
                  unit?.spaceType ??
                  unit?.category ??
                  "RESIDENTIAL",
              };
            }
          ),
        };
      }
    ),
  };
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function RealWorldMapViewer({
  building,
  buildings = [],
  approvalStatus,
  onPropertySelect,
  onPropertyNavigate,
  onBuildingSelect,
}: RealWorldMapViewerProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef =
    useRef<Map | null>(
      null
    );

  const markerRefs =
    useRef<Marker[]>([]);

  const [mapReady, setMapReady] =
    useState(false);

  const [is3D, setIs3D] =
    useState(true);

  const [rotating, setRotating] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedUnitDetails, setSelectedUnitDetails] =
    useState<Property2D | null>(null);

  /**
   * Normalize incoming records.
   */
  const normalizedBuildings =
    useMemo(() => {
      const input =
        buildings.length > 0
          ? buildings
          : building
            ? [building]
            : [];

      return input
        .map(
          normalizeBuilding
        )
        .filter(
          (
            item
          ): item is ParsedBuilding =>
            item !== null
        );
    }, [
      buildings,
      building,
    ]);

  /**
   * Buildings with coordinates.
   */
  const mapBuildings =
    useMemo(() => {
      return normalizedBuildings.filter(
        (item) =>
          item.georeference &&
          Number.isFinite(
            item.georeference
              .latitude
          ) &&
          Number.isFinite(
            item.georeference
              .longitude
          )
      );
    }, [
      normalizedBuildings,
    ]);

  const multiBuildingMode =
    buildings.length > 0;

  /**
   * ----------------------------------------------------------
   * CREATE GEOJSON
   * ----------------------------------------------------------
   */
  const createGeoJSON =
    () => {
      const features: any[] =
        [];

      for (const currentBuilding of mapBuildings) {
        const anchor =
          currentBuilding.georeference!;

        for (const floor of
          currentBuilding.floors ??
          []) {
          for (const unit of
            floor.units ??
            []) {
            const rawPolygon =
              Array.isArray(
                unit.polygon
              )
                ? unit.polygon
                : [];

            /**
             * No valid polygon?
             * Do not fabricate the unit in GeoJSON.
             *
             * A structure marker will still be
             * displayed for the building.
             */
            if (
              rawPolygon.length <
              3
            ) {
              continue;
            }

            const geographic =
              isProbablyGeographic(
                rawPolygon as PointLike[],
                anchor.longitude,
                anchor.latitude
              );

            const geoPolygon =
              rawPolygon.map(
                (point) => {
                  const [
                    x,
                    y,
                  ] =
                    getXY(
                      point as PointLike
                    );

                  return geographic
                    ? [x, y]
                    : localToLngLat(
                        x,
                        y,
                        anchor.longitude,
                        anchor.latitude
                      );
                }
              );

            /**
             * Close ring.
             */
            const first =
              geoPolygon[0];

            const last =
              geoPolygon[
                geoPolygon.length -
                  1
              ];

            if (
              first &&
              last &&
              (first[0] !==
                last[0] ||
                first[1] !==
                  last[1])
            ) {
              geoPolygon.push([
                first[0],
                first[1],
              ]);
            }

            if (
              geoPolygon.length <
              4
            ) {
              continue;
            }

            const space =
              `${unit.spaceType ?? ""} ${unit.unitNumber ?? ""}`.toLowerCase();

            // Earthy forest green & natural tones strictly conforming to BhuVista design system
            let fillColor = "#2d6a4f"; // Forest Green (default structure/residential)

            if (
              space.includes("stair") ||
              space.includes("staircase")
            ) {
              fillColor = "#d4a373"; // Warm Sand / Earthy Gold
            } else if (
              space.includes("lift") ||
              space.includes("elevator")
            ) {
              fillColor = "#52b788"; // Sage Accent
            } else if (
              space.includes("corridor") ||
              space.includes("passage")
            ) {
              fillColor = "#74c69d"; // Soft Meadow Green
            } else if (
              space.includes("toilet") ||
              space.includes("restroom") ||
              space.includes("utility")
            ) {
              fillColor = "#b7b7a4"; // Muted Earth Grey/Taupe
            } else if (
              space.includes("commercial") ||
              space.includes("office") ||
              space.includes("shop")
            ) {
              fillColor = "#1b4332"; // Deep Pine
            }

            const base =
              Number(
                floor.elevation
              ) || 0;

            const height =
              base +
              (Number(
                floor.height
              ) || 3.2);

            features.push({
              type:
                "Feature",

              id:
                `${currentBuilding.id}-${unit.id}`,

              properties: {
                buildingId:
                  currentBuilding.id,

                buildingName:
                  currentBuilding.name ??
                  "Cadastral Building",

                unitId:
                  unit.id,

                unitNumber:
                  unit.unitNumber,

                floorNumber:
                  floor.floorNumber,

                area:
                  unit.area,

                ulpin:
                  unit.ulpin ??
                  "",

                spaceType:
                  unit.spaceType ??
                  "RESIDENTIAL",

                base,

                height,

                fillColor,
              },

              geometry: {
                type:
                  "Polygon",

                coordinates: [
                  geoPolygon,
                ],
              },
            });
          }
        }
      }

      return {
        type:
          "FeatureCollection" as const,

        features,
      };
    };

  /**
   * ----------------------------------------------------------
   * FIT ALL BUILDINGS
   * ----------------------------------------------------------
   */
  const fitAllBuildings =
    () => {
      const map =
        mapRef.current;

      if (
        !map ||
        mapBuildings.length ===
          0
      ) {
        return;
      }

      const bounds =
        new LngLatBounds();

      for (const item of mapBuildings) {
        const anchor =
          item.georeference!;

        /**
         * Always include GNSS anchor.
         */
        bounds.extend([
          anchor.longitude,
          anchor.latitude,
        ]);

        /**
         * Include actual polygon geometry
         * when available.
         */
        for (const floor of
          item.floors ??
          []) {
          for (const unit of
            floor.units ??
            []) {
            const polygon =
              Array.isArray(
                unit.polygon
              )
                ? unit.polygon
                : [];

            if (
              polygon.length <
              3
            ) {
              continue;
            }

            const geographic =
              isProbablyGeographic(
                polygon as PointLike[],
                anchor.longitude,
                anchor.latitude
              );

            for (const point of polygon) {
              const [
                x,
                y,
              ] =
                getXY(
                  point as PointLike
                );

              const coordinate =
                geographic
                  ? [x, y]
                  : localToLngLat(
                      x,
                      y,
                      anchor.longitude,
                      anchor.latitude
                    );

              bounds.extend(
                coordinate as [
                  number,
                  number
                ]
              );
            }
          }
        }
      }

      if (
        !bounds.isEmpty()
      ) {
        map.fitBounds(
          bounds,
          {
            padding:
              multiBuildingMode
                ? {
                    top: 120,
                    right: 180,
                    bottom: 160,
                    left: 180,
                  }
                : {
                    top: 120,
                    right: 220,
                    bottom: 180,
                    left: 220,
                  },

            maxZoom:
              multiBuildingMode
                ? 16
                : 18,

            pitch:
              is3D
                ? multiBuildingMode
                  ? 45
                  : 55
                : 0,

            duration:
              700,
          }
        );
      }
    };

  /**
   * ----------------------------------------------------------
   * INITIALIZE MAP
   * ----------------------------------------------------------
   *
   * IMPORTANT:
   * We do NOT block map creation when there is
   * no building geometry. A valid coordinate alone
   * is enough to create a visible structure marker.
   */
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    if (mapRef.current) {
      return;
    }

    const anchorLng =
      mapBuildings.length > 0
        ? mapBuildings[0].georeference!.longitude
        : 73.8567;

    const anchorLat =
      mapBuildings.length > 0
        ? mapBuildings[0].georeference!.latitude
        : 18.5204;

    const map = new Map({
      container: containerRef.current,

      style: "https://tiles.openfreemap.org/styles/bright",

      center: [anchorLng, anchorLat],

      zoom: mapBuildings.length > 0 ? (multiBuildingMode ? 13 : 16) : 12,

      minZoom: 3,

      maxZoom: 22,

      pitch: mapBuildings.length > 0 ? (multiBuildingMode ? 42 : 55) : 30,

      bearing: 0,
    });

    mapRef.current =
      map;

    map.addControl(
      new NavigationControl({
        showCompass: true,
        showZoom: false,
        visualizePitch:
          true,
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

    map.on(
      "load",
      () => {
        setMapReady(true);

        window.setTimeout(
          () => {
            map.resize();
          },
          200
        );
      }
    );

    return () => {
      markerRefs.current.forEach(
        (marker) =>
          marker.remove()
      );

      markerRefs.current =
        [];

      map.remove();

      mapRef.current =
        null;

      setMapReady(false);
    };
  }, [
    mapBuildings.length,
    mapBuildings[0]?.id,
    mapBuildings[0]
      ?.georeference
      ?.latitude,
    mapBuildings[0]
      ?.georeference
      ?.longitude,
    multiBuildingMode,
  ]);

  /**
   * ----------------------------------------------------------
   * ADD BUILDING MARKERS
   * ----------------------------------------------------------
   *
   * This is the critical fallback.
   *
   * Every building with valid GNSS coordinates gets a
   * structure marker even when floor geometry isn't returned.
   */
  useEffect(() => {
    const map =
      mapRef.current;

    if (
      !map ||
      !mapReady
    ) {
      return;
    }

    /**
     * Remove old markers.
     */
    markerRefs.current.forEach(
      (marker) =>
        marker.remove()
    );

    markerRefs.current =
      [];

    for (const currentBuilding of mapBuildings) {
      const anchor =
        currentBuilding.georeference;

      if (!anchor) {
        continue;
      }

      /**
       * Structure-style marker.
       */
      const element =
        document.createElement(
          "button"
        );

      element.type =
        "button";

      element.setAttribute(
        "aria-label",
        `Open ${currentBuilding.name ?? "building"}`
      );

      element.style.width =
        multiBuildingMode
          ? "42px"
          : "34px";

      element.style.height =
        multiBuildingMode
          ? "42px"
          : "34px";

      element.style.padding =
        "0";

      element.style.border =
        "2px solid #ffffff";

      element.style.borderRadius =
        "9px";

      element.style.background =
        "linear-gradient(135deg, #2d6a4f, #1b4332)";

      element.style.boxShadow =
        "0 5px 18px rgba(45,106,79,0.45)";

      element.style.cursor =
        "pointer";

      element.style.display =
        "flex";

      element.style.alignItems =
        "center";

      element.style.justifyContent =
        "center";

      element.style.color =
        "#ffffff";

      element.style.fontSize =
        multiBuildingMode
          ? "19px"
          : "15px";

      element.style.fontWeight =
        "800";

      element.style.lineHeight =
        "1";

      element.innerHTML =
        "▦";

      element.addEventListener(
        "mouseenter",
        () => {
          element.style.transform =
            "scale(1.12)";
        }
      );

      element.addEventListener(
        "mouseleave",
        () => {
          element.style.transform =
            "scale(1)";
        }
      );

      element.addEventListener(
        "click",
        () => {
          if (
            multiBuildingMode
          ) {
            onBuildingSelect?.(
              currentBuilding
            );

            /**
             * Focus on selected building.
             */
            const bounds =
              getSingleBuildingBounds(
                currentBuilding
              );

            if (
              bounds
            ) {
              map.fitBounds(
                bounds,
                {
                  padding: {
                    top: 170,
                    right: 240,
                    bottom: 220,
                    left: 240,
                  },

                  maxZoom:
                    18,

                  pitch:
                    55,

                  duration:
                    800,
                }
              );
            }

            return;
          }
        }
      );

      const marker =
        new Marker({
          element,
          anchor:
            "center",
        })
          .setLngLat([
            anchor.longitude,
            anchor.latitude,
          ])
          .addTo(map);

      /**
       * Popup for building marker.
       */
      const popup =
        new Popup({
          offset: 24,
          closeButton:
            true,
          closeOnClick:
            false,
          maxWidth:
            "300px",
        }).setHTML(
          `
            <div
              style="
                font-family:system-ui,sans-serif;
                color:#0f172a;
                padding:5px;
              "
            >
              <div
                style="
                  font-size:15px;
                  font-weight:800;
                  margin-bottom:6px;
                "
              >
                ${
                  currentBuilding.name ??
                  "Cadastral Building"
                }
              </div>

              <div
                style="
                  font-size:11px;
                  color:#64748b;
                  line-height:1.7;
                "
              >
                <div>
                  📍 ${
                    anchor.latitude.toFixed(
                      6
                    )
                  }, ${
                    anchor.longitude.toFixed(
                      6
                    )
                  }
                </div>

                <div>
                  Floors: ${
                    currentBuilding.floors
                      ?.length ??
                    0
                  }
                </div>
              </div>

              ${
                multiBuildingMode
                  ? `
                    <div
                      style="
                        margin-top:8px;
                        color:#2563eb;
                        font-size:11px;
                        font-weight:800;
                      "
                    >
                      Click structure to explore →
                    </div>
                  `
                  : ""
              }
            </div>
          `
        );

      marker.setPopup(
        popup
      );

      markerRefs.current.push(
        marker
      );
    }
  }, [
    mapReady,
    mapBuildings,
    multiBuildingMode,
    onBuildingSelect,
  ]);

  /**
   * ----------------------------------------------------------
   * SINGLE BUILDING BOUNDS
   * ----------------------------------------------------------
   */
  function getSingleBuildingBounds(
    target: ParsedBuilding
  ) {
    if (
      !target.georeference
    ) {
      return null;
    }

    const anchor =
      target.georeference;

    const bounds =
      new LngLatBounds();

    bounds.extend([
      anchor.longitude,
      anchor.latitude,
    ]);

    for (const floor of
      target.floors ??
      []) {
      for (const unit of
        floor.units ??
        []) {
        const polygon =
          Array.isArray(
            unit.polygon
          )
            ? unit.polygon
            : [];

        if (
          polygon.length <
          3
        ) {
          continue;
        }

        const geographic =
          isProbablyGeographic(
            polygon as PointLike[],
            anchor.longitude,
            anchor.latitude
          );

        for (const point of polygon) {
          const [
            x,
            y,
          ] =
            getXY(
              point as PointLike
            );

          const coordinate =
            geographic
              ? [x, y]
              : localToLngLat(
                  x,
                  y,
                  anchor.longitude,
                  anchor.latitude
                );

          bounds.extend(
            coordinate as [
              number,
              number
            ]
          );
        }
      }
    }

    return bounds;
  }

  /**
   * ----------------------------------------------------------
   * CADASTRAL POLYGON LAYERS
   * ----------------------------------------------------------
   */
  useEffect(() => {
    const map =
      mapRef.current;

    if (
      !map ||
      !mapReady
    ) {
      return;
    }

    /**
     * Safety cleanup.
     */
    if (
      map.getLayer(
        OUTLINE_LAYER
      )
    ) {
      map.removeLayer(
        OUTLINE_LAYER
      );
    }

    if (
      map.getLayer(
        EXTRUSION_LAYER
      )
    ) {
      map.removeLayer(
        EXTRUSION_LAYER
      );
    }

    if (
      map.getLayer(
        FOOTPRINT_LAYER
      )
    ) {
      map.removeLayer(
        FOOTPRINT_LAYER
      );
    }

    if (
      map.getSource(
        SOURCE_ID
      )
    ) {
      map.removeSource(
        SOURCE_ID
      );
    }

    const geojson =
      createGeoJSON();

    /**
     * It is perfectly valid for this to be empty
     * when the DB has anchor coordinates but no
     * usable unit geometry.
     */
    map.addSource(
      SOURCE_ID,
      {
        type:
          "geojson",

        data:
          geojson,
      }
    );

    map.addLayer({
      id:
        FOOTPRINT_LAYER,

      type:
        "fill",

      source:
        SOURCE_ID,

      paint: {
        "fill-color": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          "#d4a373", // Warm earthy gold highlight for selected unit
          ["get", "fillColor"],
        ],

        "fill-opacity":
          multiBuildingMode
            ? 0.78
            : 0.35,
      },
    });

    map.addLayer({
      id:
        EXTRUSION_LAYER,

      type:
        "fill-extrusion",

      source:
        SOURCE_ID,

      paint: {
        "fill-extrusion-color": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          "#d4a373", // Warm earthy gold highlight for selected 3D building
          ["get", "fillColor"],
        ],

        "fill-extrusion-base":
          [
            "to-number",
            [
              "get",
              "base",
            ],
            0,
          ],

        "fill-extrusion-height":
          [
            "to-number",
            [
              "get",
              "height",
            ],
            3,
          ],

        "fill-extrusion-opacity":
          multiBuildingMode
            ? 0.9
            : 0.88,

        "fill-extrusion-vertical-gradient":
          true,
      },
    });

    map.addLayer({
      id:
        OUTLINE_LAYER,

      type:
        "line",

      source:
        SOURCE_ID,

      paint: {
        "line-color":
          "#0f172a",

        "line-width":
          2.1,

        "line-opacity":
          0.95,
      },
    });

    /**
     * --------------------------------------------------------
     * POLYGON CLICK & UNSELECT ON EMPTY CANVAS
     * --------------------------------------------------------
     */
    let selectedFeatureId: string | number | null = null;

    const clearFeatureSelection = () => {
      if (selectedFeatureId !== null && map.getSource(SOURCE_ID)) {
        map.setFeatureState(
          { source: SOURCE_ID, id: selectedFeatureId },
          { selected: false }
        );
        selectedFeatureId = null;
      }
    };

    const handlePolygonClick =
      (event: any) => {
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

        if (
          !features.length
        ) {
          clearFeatureSelection();
          setSelectedUnitDetails(null);
          return;
        }

        const feature = features[0];
        const properties = feature?.properties;

        if (feature.id !== undefined) {
          clearFeatureSelection();
          selectedFeatureId = feature.id;
          map.setFeatureState(
            { source: SOURCE_ID, id: feature.id },
            { selected: true }
          );
        }

        if (
          !properties
        ) {
          return;
        }

        if (
          multiBuildingMode
        ) {
          const selected =
            mapBuildings.find(
              (item) =>
                String(
                  item.id
                ) ===
                String(
                  properties.buildingId
                )
            );

          if (
            selected
          ) {
            onBuildingSelect?.(
              selected
            );
          }

          return;
        }

        const target =
          normalizedBuildings[0];

        if (!target) {
          return;
        }

        const unitId =
          String(
            properties.unitId ??
              ""
          );

        const unit =
          target.floors
            ?.flatMap(
              (floor) =>
                floor.units ??
                []
            )
            .find(
              (item) =>
                String(
                  item.id
                ) ===
                unitId
            );

        if (!unit) {
          return;
        }

        onPropertySelect?.(
          unit
        );

        setSelectedUnitDetails(unit);

        onPropertyNavigate?.(
          unit
        );
      };

    map.on(
      "click",
      EXTRUSION_LAYER,
      handlePolygonClick
    );

    map.on(
      "click",
      FOOTPRINT_LAYER,
      handlePolygonClick
    );

    // Unselect when clicking empty canvas
    const handleMapClick = (event: any) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: [EXTRUSION_LAYER, FOOTPRINT_LAYER],
      });
      if (!features.length) {
        clearFeatureSelection();
        setSelectedUnitDetails(null);
      }
    };

    map.on("click", handleMapClick);

    /**
     * Initial fit.
     */
    fitAllBuildings();

    return () => {
      map.off(
        "click",
        EXTRUSION_LAYER,
        handlePolygonClick
      );

      map.off(
        "click",
        FOOTPRINT_LAYER,
        handlePolygonClick
      );

      map.off("click", handleMapClick);

      if (
        map.getLayer(
          OUTLINE_LAYER
        )
      ) {
        map.removeLayer(
          OUTLINE_LAYER
        );
      }

      if (
        map.getLayer(
          EXTRUSION_LAYER
        )
      ) {
        map.removeLayer(
          EXTRUSION_LAYER
        );
      }

      if (
        map.getLayer(
          FOOTPRINT_LAYER
        )
      ) {
        map.removeLayer(
          FOOTPRINT_LAYER
        );
      }

      if (
        map.getSource(
          SOURCE_ID
        )
      ) {
        map.removeSource(
          SOURCE_ID
        );
      }
    };
  }, [
    mapReady,
    mapBuildings,
    normalizedBuildings,
    multiBuildingMode,
    onBuildingSelect,
    onPropertySelect,
    onPropertyNavigate,
  ]);

  /**
   * ----------------------------------------------------------
   * BUTTONS
   * ----------------------------------------------------------
   */

  const zoomIn =
    () => {
      mapRef.current?.zoomIn({
        duration: 300,
      });
    };

  const zoomOut =
    () => {
      mapRef.current?.zoomOut({
        duration: 300,
      });
    };

  const toggle3D =
    () => {
      const map =
        mapRef.current;

      if (!map) {
        return;
      }

      setIs3D(
        (previous) => {
          const next =
            !previous;

          map.easeTo({
            pitch:
              next
                ? multiBuildingMode
                  ? 45
                  : 55
                : 0,

            duration:
              650,
          });

          return next;
        }
      );
    };

  /**
   * ----------------------------------------------------------
   * ROTATION
   * ----------------------------------------------------------
   */
  useEffect(() => {
    const map =
      mapRef.current;

    if (
      !map ||
      !rotating
    ) {
      return;
    }

    let frame =
      0;

    const rotate =
      () => {
        map.setBearing(
          map.getBearing() +
            0.15
        );

        frame =
          requestAnimationFrame(
            rotate
          );
      };

    frame =
      requestAnimationFrame(
        rotate
      );

    return () => {
      cancelAnimationFrame(
        frame
      );
    };
  }, [
    rotating,
  ]);

  /**
   * ----------------------------------------------------------
   * MAP UI
   * ----------------------------------------------------------
   */
  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden bg-[#d1e3d4]">
      {/* MAP CANVAS */}
      <div ref={containerRef} className="w-full h-full min-h-[600px]" />

      {/* ---------------------------------------------------- */}
      {/* FLOATING SEARCH BAR (TOP-LEFT) */}
      {/* ---------------------------------------------------- */}
      <div className="absolute top-6 left-6 z-30 w-[520px] max-w-[calc(100vw-4rem)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!searchQuery.trim()) return;
            const term = searchQuery.trim().toLowerCase();
            const matched = mapBuildings.find((b) =>
              b.name?.toLowerCase().includes(term) ||
              b.id.toLowerCase().includes(term) ||
              b.floors?.some((f) =>
                f.units?.some((u) =>
                  u.unitNumber.toLowerCase().includes(term) ||
                  u.ulpin?.toLowerCase().includes(term)
                )
              )
            );
            if (matched && mapRef.current) {
              onBuildingSelect?.(matched);
              const bounds = getSingleBuildingBounds(matched);
              if (bounds) {
                mapRef.current.fitBounds(bounds, {
                  padding: 180,
                  maxZoom: 18,
                  pitch: 55,
                  duration: 800,
                });
              }
            }
          }}
          className="flex items-center rounded-full border border-[#e2dad0] bg-[#fdfbf7]/95 px-4 py-2 shadow-lg backdrop-blur-md"
        >
          <div className="flex h-8 w-8 items-center justify-center text-[#2d6a4f] shrink-0">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by ULPIN, Owner Name, Survey Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent px-3 py-1 text-xs text-[#162a21] placeholder-[#6b887a] outline-none font-medium"
          />
          <button
            type="button"
            title="Search filters"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#2d6a4f] hover:bg-[#f3efe6] transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </form>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FLOATING LOCATION CARD (TOP-RIGHT) */}
      {/* ---------------------------------------------------- */}
      <div className="absolute top-6 right-6 z-30 hidden sm:flex items-center gap-3 rounded-2xl border border-[#e2dad0] bg-[#fdfbf7]/95 px-4 py-3 text-xs text-[#162a21] shadow-lg backdrop-blur-md">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f5ee] border border-[#e2dad0] text-[#2d6a4f] text-base">
          📍
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[#162a21] text-xs">
            {building?.name || (multiBuildingMode && mapBuildings.length > 0 ? "National Cadastral Zone" : "BhuVista Public Viewer")}
          </span>
          <span className="text-[10px] font-semibold text-[#3d5a4c]">
            {building?.georeference
              ? `${building.georeference.latitude.toFixed(4)}° N, ${building.georeference.longitude.toFixed(4)}° E`
              : "State Land Registry • Verified GIS"}
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FLOATING PROPERTY DETAILS CARD (LOWER-LEFT) */}
      {/* ---------------------------------------------------- */}
      <div className="absolute bottom-8 left-6 z-30 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl border border-[#e2dad0] bg-[#fdfbf7]/95 p-5 text-[#162a21] shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-[#e2dad0] pb-3 mb-3">
          <h4 className="text-sm font-bold text-[#162a21]">Property Details</h4>
          {selectedUnitDetails && (
            <button
              type="button"
              onClick={() => setSelectedUnitDetails(null)}
              className="text-xs text-[#6b887a] hover:text-[#162a21]"
            >
              ✕
            </button>
          )}
        </div>

        <div className="space-y-2.5 text-xs">
          {selectedUnitDetails ? (
            <>
              <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                <span className="text-[#6b887a] font-medium">ULPIN</span>
                <span className="font-bold text-[#162a21]">{selectedUnitDetails.ulpin || "27012345678910"}</span>
              </div>
              <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                <span className="text-[#6b887a] font-medium">Survey Number</span>
                <span className="font-bold text-[#162a21]">{selectedUnitDetails.unitNumber}</span>
              </div>
              <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                <span className="text-[#6b887a] font-medium">Land Use</span>
                <span className="font-bold text-[#2d6a4f]">{selectedUnitDetails.spaceType || "Residential"}</span>
              </div>
              <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                <span className="text-[#6b887a] font-medium">Area</span>
                <span className="font-bold text-[#162a21]">{selectedUnitDetails.area ? `${selectedUnitDetails.area} m²` : "N/A"}</span>
              </div>

              <button
                type="button"
                onClick={() => onPropertyNavigate?.(selectedUnitDetails)}
                className="mt-4 w-full rounded-xl bg-[#2d6a4f] py-2.5 text-center text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-md cursor-pointer"
              >
                View Full Details
              </button>
            </>
          ) : building ? (
            <>
              <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                <span className="text-[#6b887a] font-medium">Structure Name</span>
                <span className="font-bold text-[#162a21] truncate max-w-[180px]">{building.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                <span className="text-[#6b887a] font-medium">Floors</span>
                <span className="font-bold text-[#162a21]">{building.floors?.length || 0} Levels</span>
              </div>
              <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                <span className="text-[#6b887a] font-medium">Status</span>
                <span className="font-bold text-[#2d6a4f]">VERIFIED CADASTRE</span>
              </div>

              <button
                type="button"
                onClick={() => onBuildingSelect?.(building)}
                className="mt-4 w-full rounded-xl bg-[#2d6a4f] py-2.5 text-center text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-md cursor-pointer"
              >
                View Full Details
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                <span className="text-[#6b887a] font-medium">Registry Zone</span>
                <span className="font-bold text-[#162a21]">National Cadastre</span>
              </div>
              <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                <span className="text-[#6b887a] font-medium">Active Parcels</span>
                <span className="font-bold text-[#162a21]">{mapBuildings.length} Registered</span>
              </div>
              <div className="flex justify-between border-b border-[#e2dad0]/60 pb-1.5">
                <span className="text-[#6b887a] font-medium">GIS System</span>
                <span className="font-bold text-[#2d6a4f]">MapLibre 3D</span>
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-xl bg-[#2d6a4f] py-2.5 text-center text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-md cursor-pointer"
              >
                View Full Details
              </button>
            </>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FLOATING MAP CONTROLS (RIGHT SIDE) */}
      {/* ---------------------------------------------------- */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={fitAllBuildings}
          title="Home / Center View"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e2dad0] bg-[#fdfbf7] text-base font-bold text-[#2d6a4f] shadow-md hover:bg-[#f3efe6] transition cursor-pointer"
        >
          ⌂
        </button>

        <button
          type="button"
          onClick={zoomIn}
          title="Zoom In"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e2dad0] bg-[#fdfbf7] text-xl font-bold text-[#2d6a4f] shadow-md hover:bg-[#f3efe6] transition cursor-pointer"
        >
          +
        </button>

        <button
          type="button"
          onClick={zoomOut}
          title="Zoom Out"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e2dad0] bg-[#fdfbf7] text-xl font-bold text-[#2d6a4f] shadow-md hover:bg-[#f3efe6] transition cursor-pointer"
        >
          −
        </button>

        <button
          type="button"
          onClick={toggle3D}
          title="Toggle 2D / 3D Mode"
          className={`flex h-11 w-11 items-center justify-center rounded-full border text-xs font-extrabold shadow-md transition cursor-pointer ${
            is3D
              ? "border-[#2d6a4f] bg-[#2d6a4f] text-white"
              : "border-[#e2dad0] bg-[#fdfbf7] text-[#2d6a4f] hover:bg-[#f3efe6]"
          }`}
        >
          3D
        </button>

        <button
          type="button"
          onClick={() => setRotating((value) => !value)}
          title={rotating ? "Stop Rotation" : "Rotate Map"}
          className={`flex h-11 w-11 items-center justify-center rounded-full border text-base font-bold shadow-md transition cursor-pointer ${
            rotating
              ? "border-[#2d6a4f] bg-[#2d6a4f] text-white"
              : "border-[#e2dad0] bg-[#fdfbf7] text-[#2d6a4f] hover:bg-[#f3efe6]"
          }`}
        >
          ↻
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FLOATING MINIMAP (BOTTOM-RIGHT) */}
      {/* ---------------------------------------------------- */}
      <div className="absolute bottom-8 right-6 z-20 hidden md:block">
        <div className="w-44 h-32 rounded-2xl border-2 border-white bg-[#f8f5ee] shadow-xl overflow-hidden relative border-[#e2dad0]">
          <div className="absolute inset-0 bg-[#e5e0d8] opacity-80" />
          <div className="absolute inset-2 rounded-xl border border-[#2d6a4f]/20 bg-[#fdfbf7]/60 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center p-1">
              <span className="text-[10px] font-bold text-[#2d6a4f]">MINIMAP</span>
              <span className="text-[9px] text-[#6b887a]">Overview Map</span>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-[#2d6a4f] rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-[#2d6a4f] rounded-full" />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* UNOBTRUSIVE FLOATING NOTIFICATION OVERLAY */}
      {/* ---------------------------------------------------- */}
      {mapBuildings.length === 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 rounded-full border border-[#e2dad0] bg-[#fdfbf7]/90 px-5 py-2 text-xs font-semibold text-[#162a21] shadow-lg backdrop-blur-md flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>No 3D map-ready structures in current region</span>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* LEGEND */}
      {/* ---------------------------------------------------- */}
      <div className="absolute left-6 bottom-36 z-20 flex items-center gap-2.5 px-3 py-2 bg-[#fdfbf7]/95 rounded-xl border border-[#e2dad0] shadow-md text-[11px] text-[#162a21] backdrop-blur-md">
        <LegendDot color="#2d6a4f" />
        <span>{multiBuildingMode ? "Structures" : "Units"}</span>
        <LegendDot color="#d4a373" />
        <span>Stairs</span>
        <LegendDot color="#52b788" />
        <span>Lift</span>
      </div>
    </div>
  );
}

/* ============================================================
   UI HELPERS
   ============================================================ */

function LegendDot({
  color,
}: {
  color: string;
}) {
  return (
    <span
      style={{
        width:
          "12px",

        height:
          "12px",

        borderRadius:
          "3px",

        background:
          color,

        display:
          "inline-block",
      }}
    />
  );
}
