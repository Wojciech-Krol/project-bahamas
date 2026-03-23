"use client";

import { useEffect, useState } from "react";
import { ClassItem } from "@/lib/types";

interface MapProps {
  classes: ClassItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (classItem: ClassItem) => void;
}

export function Map({
  classes,
  center = [52.2297, 21.0122],
  zoom = 13,
  height = "400px",
  onMarkerClick,
}: MapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        style={{
          height,
          background: "#f1f5f9",
          borderRadius: "var(--radius)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        Ładowanie mapy...
      </div>
    );
  }

  return <MapInner classes={classes} center={center} zoom={zoom} height={height} onMarkerClick={onMarkerClick} />;
}

function MapInner({ classes, center, zoom, height, onMarkerClick }: MapProps & { height: string }) {
  const [MapContainer, setMapContainer] = useState<typeof import("react-leaflet").MapContainer | null>(null);
  const [TileLayer, setTileLayer] = useState<typeof import("react-leaflet").TileLayer | null>(null);
  const [Marker, setMarker] = useState<typeof import("react-leaflet").Marker | null>(null);
  const [Popup, setPopup] = useState<typeof import("react-leaflet").Popup | null>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    Promise.all([import("react-leaflet"), import("leaflet")]).then(([rl, leaflet]) => {
      setMapContainer(() => rl.MapContainer);
      setTileLayer(() => rl.TileLayer);
      setMarker(() => rl.Marker);
      setPopup(() => rl.Popup);
      setL(() => leaflet.default || leaflet);
    });
  }, []);

  if (!MapContainer || !TileLayer || !Marker || !Popup || !L) {
    return (
      <div style={{ height, background: "#f1f5f9", borderRadius: "var(--radius)" }} />
    );
  }

  const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%", borderRadius: "var(--radius)", zIndex: 1 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {classes.map((c) => (
        <Marker
          key={c.id}
          position={[c.location.lat, c.location.lng]}
          icon={icon}
          eventHandlers={{
            click: () => onMarkerClick?.(c),
          }}
        >
          <Popup>
            <strong>{c.name}</strong>
            <br />
            {c.price} zł/mies. &middot; {c.location.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
