"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type { PathOptions, Layer, Path } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los iconos de Leaflet en Next.js - solo en cliente
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface MapaBaseProps {
  className?: string;
  showJurisdicciones?: boolean;
  children?: React.ReactNode;
}

interface JurisdiccionProperties {
  name?: string;
  color?: string;
  [key: string]: unknown;
}

const MAP_CENTER: [number, number] = [-11.9699, -76.998]; // San Juan de Lurigancho
const MAP_ZOOM = 13;

export default function MapaBase({ className = "", showJurisdicciones = true, children }: MapaBaseProps) {
  const [jurisdiccionesData, setJurisdiccionesData] = useState<FeatureCollection | null>(null);
  const [key, setKey] = useState(0);
  const mapRef = useRef<L.Map | null>(null);

  // Cargar GeoJSON de jurisdicciones
  useEffect(() => {
    if (showJurisdicciones) {
      fetch("/data/comunas.geojson")
        .then((res) => res.json())
        .then((data: FeatureCollection) => setJurisdiccionesData(data))
        .catch((err) => console.error("Error cargando jurisdicciones:", err));
    }
  }, [showJurisdicciones]);

  // Estilo para las jurisdicciones
  const estiloJurisdiccion = (feature: Feature<Geometry, JurisdiccionProperties> | undefined): PathOptions => ({
    color: feature?.properties?.color || "#34b429",
    weight: 2,
    fillOpacity: 0.2,
    interactive: true,
  });

  // Popup para cada jurisdicción
  const onEachJurisdiccion = (feature: Feature<Geometry, JurisdiccionProperties>, layer: Layer) => {
    const nombre = feature.properties?.name || "Jurisdicción";
    if ("bindPopup" in layer) {
      (layer as Path).bindPopup(`<b>${nombre}</b>`);
    }
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        style={{ height: "100%", width: "100%" }}
        minZoom={11}
        maxZoom={18}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showJurisdicciones && jurisdiccionesData && (
          <GeoJSON
            key={key}
            data={jurisdiccionesData}
            style={estiloJurisdiccion as (feature?: Feature) => PathOptions}
            onEachFeature={onEachJurisdiccion as (feature: Feature, layer: Layer) => void}
          />
        )}

        {children}
      </MapContainer>
    </div>
  );
}
