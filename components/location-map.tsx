"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  iconSize: [25, 41],
});

function MapClick({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function LocationMap({
  latitude,

  longitude,

  onChange,

  disabled,
}: {
  latitude: number;

  longitude: number;

  onChange: (lat: number, lng: number) => void;

  disabled: boolean;
}) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      style={{
        height: "420px",

        width: "100%",

        borderRadius: "16px",
      }}
    >
      <TileLayer
        url="
https://tile.openstreetmap.org/{z}/{x}/{y}.png
"
      />

      <Marker position={[latitude, longitude]} icon={icon} />

      {!disabled && <MapClick onChange={onChange} />}
    </MapContainer>
  );
}
