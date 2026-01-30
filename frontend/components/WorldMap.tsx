"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  countryCode?: string | null;
};

export default function WorldMap({ places }: { places: Place[] }) {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-3xl border border-white/10">
      <MapContainer
        center={[20, 0]}
        zoom={1.6}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((place) => (
          <CircleMarker
            key={place.id}
            center={[place.lat, place.lng]}
            radius={8}
            pathOptions={{ color: "#19D3FF", weight: 2, fillColor: "#7C5CFF", className: "glow-pin" }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
              <span className="text-xs text-ink">{place.name}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
