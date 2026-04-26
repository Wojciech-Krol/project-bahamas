"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Activity } from "../lib/mockData";
import { tablerSvgString } from "../lib/tablerIcons";

type MapPoint = Pick<Activity, "id" | "title" | "price"> & {
  lng: number;
  lat: number;
  icon?: string;
};

export default function MapboxMap({
  points,
  center = [-0.1276, 51.5072],
  zoom = 11,
  styleUrl = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL ?? "mapbox://styles/mapbox/light-v11",
}: {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  styleUrl?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setErrorMsg("NEXT_PUBLIC_MAPBOX_TOKEN missing at runtime. Restart `next dev` after editing .env.local.");
      return;
    }
    mapboxgl.accessToken = token;

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: styleUrl,
        center,
        zoom,
        attributionControl: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Map init failed: ${message}`);
      return;
    }

    map.on("error", (e) => {
      const msg = e?.error?.message ?? "Unknown Mapbox error";
      setErrorMsg(msg);
    });
    map.on("style.load", () => map.resize());
    map.on("load", () => map.resize());

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);
    const raf = requestAnimationFrame(() => map.resize());

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addMarkers = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      points.forEach((p) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className =
          "px-3 py-1.5 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center gap-1";
        const svg = tablerSvgString(p.icon ?? "map-pin", "#fff", 14);
        el.innerHTML = `${svg}<span>${p.price}</span>`;
        el.title = p.title;
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([p.lng, p.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });
    };

    if (map.isStyleLoaded()) addMarkers();
    else map.once("style.load", addMarkers);
  }, [points]);

  return (
    <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-surface-container-high">
      <div ref={containerRef} className="absolute inset-0" style={{ width: "100%", height: "100%" }} />
      {errorMsg && (
        <div className="absolute top-3 left-3 right-3 bg-red-50 border border-red-300 text-red-900 editorial-shadow rounded-2xl px-4 py-2 text-xs font-semibold">
          Map: {errorMsg}
        </div>
      )}
      <div className="absolute left-1/2 bottom-4 -translate-x-1/2 bg-surface-container-lowest editorial-shadow rounded-full px-4 py-2 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-semibold text-on-surface">
          {points.length} Activities Live
        </span>
      </div>
    </div>
  );
}
