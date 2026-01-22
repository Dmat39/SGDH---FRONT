"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
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

// Tipo para los comités
export interface Comite {
  id: number;
  codigo: number;
  ruta: string;
  centroAcopio: string;
  comite: string;
  pueblo: string;
  coordenadas: {
    latitud: number;
    longitud: number;
  };
  inspector: string;
  beneficiarios: number;
  socios: number;
  comuna: number;
  coordinadora: {
    nombre: string;
    dni: number;
    celular: number;
  };
  beneficiariosExtranjeros: number;
  discapacitados: number;
  direccion: string;
  observacion: string | null;
}

interface MapaPVLProps {
  comites: Comite[];
  comiteSeleccionado: Comite | null;
  onComiteClick: (comite: Comite) => void;
  limiteVisible: number;
  filterOpen?: boolean;
}

// Icono personalizado para los marcadores - Vaso de Leche (estilo gubernamental)
const createCustomIcon = (isSelected: boolean) => {
  const size = isSelected ? 28 : 22;
  const iconSvg = isSelected ? 16 : 12;

  // Colores institucionales/gubernamentales
  const bgColor = isSelected ? "#1E293B" : "#334155";
const borderColor = isSelected ? "#0F172A" : "#ffffffff";

  return L.divIcon({
    className: "custom-marker-pvl",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${bgColor};
      border: 2px solid ${borderColor};
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    ">
      <svg width="${iconSvg}" height="${iconSvg}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 6h14l-1.5 12a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2L5 6z"/>
        <path d="M6.5 10h11" stroke-width="1.5"/>
        <path d="M4 6h16" stroke-width="2.5"/>
      </svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const MAP_CENTER: [number, number] = [-11.9699, -76.998];
const MAP_ZOOM = 13;

// Componente para centrar el mapa en un comité seleccionado
function CentrarMapa({ comite }: { comite: Comite | null }) {
  const map = useMap();

  useEffect(() => {
    if (comite) {
      map.flyTo([comite.coordenadas.latitud, comite.coordenadas.longitud], 16, {
        duration: 0.5,
      });
    }
  }, [comite, map]);

  return null;
}

// Componente para ajustar posición de controles de zoom
function ZoomControlPosition({ filterOpen }: { filterOpen: boolean }) {
  const map = useMap();

  useEffect(() => {
    // Mover el control de zoom al lado derecho
    const zoomControl = document.querySelector(".leaflet-control-zoom");
    if (zoomControl) {
      const parent = zoomControl.parentElement;
      if (parent) {
        // Mover al contenedor de la derecha
        const rightContainer = document.querySelector(".leaflet-right.leaflet-top");
        if (rightContainer && !rightContainer.contains(zoomControl)) {
          rightContainer.appendChild(zoomControl);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Ajustar posición cuando se abre/cierra el filtro
    const zoomControl = document.querySelector(".leaflet-control-zoom") as HTMLElement;
    if (zoomControl) {
      zoomControl.style.transition = "margin-right 0.3s ease";
      zoomControl.style.marginRight = filterOpen ? "330px" : "10px";
    }
  }, [filterOpen]);

  return null;
}

export default function MapaPVL({ comites, comiteSeleccionado, onComiteClick, limiteVisible, filterOpen = false }: MapaPVLProps) {
  const [jurisdiccionesData, setJurisdiccionesData] = useState<FeatureCollection | null>(null);

  // Cargar GeoJSON de jurisdicciones
  useEffect(() => {
    fetch("/data/comunas.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => {
        if (data?.features) {
          setJurisdiccionesData(data);
        }
      })
      .catch((err) => console.error("Error cargando jurisdicciones:", err));
  }, []);

  // Estilo para las jurisdicciones
  const estiloJurisdiccion = (): PathOptions => ({
    color: "#34b429",
    weight: 2,
    fillOpacity: 0.1,
    interactive: false,
  });

  // Limitar los comités mostrados
  const comitesMostrados = comites.slice(0, limiteVisible);

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      style={{ height: "100%", width: "100%" }}
      minZoom={11}
      maxZoom={18}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Jurisdicciones */}
      {jurisdiccionesData && (
        <GeoJSON
          data={jurisdiccionesData}
          style={estiloJurisdiccion}
        />
      )}

      {/* Marcadores de comités */}
      {comitesMostrados.map((comite) => (
        <Marker
          key={comite.id}
          position={[comite.coordenadas.latitud, comite.coordenadas.longitud]}
          icon={createCustomIcon(comiteSeleccionado?.id === comite.id)}
          eventHandlers={{
            click: () => onComiteClick(comite),
          }}
        >
          <Popup>
            <strong>{comite.comite}</strong>
            <br />
            {comite.pueblo}
          </Popup>
        </Marker>
      ))}

      {/* Centrar en comité seleccionado */}
      <CentrarMapa comite={comiteSeleccionado} />

      {/* Controlar posición del zoom */}
      <ZoomControlPosition filterOpen={filterOpen} />
    </MapContainer>
  );
}
