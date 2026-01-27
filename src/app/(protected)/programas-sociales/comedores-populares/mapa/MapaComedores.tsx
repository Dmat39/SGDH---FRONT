"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
import type { FeatureCollection, Feature } from "geojson";
import type { PathOptions, Layer, Path } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los iconos de Leaflet en Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Tipo para los comedores
export interface Comedor {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  jurisdiccion: string;
  coordenadas: {
    latitud: number;
    longitud: number;
  };
  beneficiarios: number;
  racionesDiarias: number;
  responsable: {
    nombre: string;
    telefono: string;
  };
  estado: "activo" | "inactivo";
}

interface CapasVisibles {
  sectores: boolean;
  jurisdicciones: boolean;
  comedores: boolean;
}

interface MapaComedoresProps {
  comedores: Comedor[];
  comedorSeleccionado: Comedor | null;
  onComedorClick: (comedor: Comedor) => void;
  limiteVisible: number;
  filterOpen?: boolean;
  capasVisibles?: CapasVisibles;
}

// Icono personalizado para los marcadores - Olla de comida estilo cute (color terracota/naranja)
const createCustomIcon = (isSelected: boolean) => {
  const size = isSelected ? 42 : 34;

  const potSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
      <defs>
        <radialGradient id="potGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:#fb923c"/>
          <stop offset="100%" style="stop-color:#ea580c"/>
        </radialGradient>
        <radialGradient id="lidGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:#fdba74"/>
          <stop offset="100%" style="stop-color:#f97316"/>
        </radialGradient>
        <radialGradient id="handleGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:#c2410c"/>
          <stop offset="100%" style="stop-color:#9a3412"/>
        </radialGradient>
        <linearGradient id="foodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#fcd34d"/>
          <stop offset="100%" style="stop-color:#f59e0b"/>
        </linearGradient>
      </defs>

      <!-- Vapor/steam -->
      <path d="M35 25 Q32 18 35 12 Q38 6 35 0" stroke="#e5e5e5" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>
      <path d="M50 22 Q47 14 50 8 Q53 2 50 -4" stroke="#e5e5e5" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.9"/>
      <path d="M65 25 Q68 18 65 12 Q62 6 65 0" stroke="#e5e5e5" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>

      <!-- Asas de la olla -->
      <ellipse cx="12" cy="60" rx="8" ry="12" fill="url(#potGrad)" stroke="#c2410c" stroke-width="2"/>
      <ellipse cx="12" cy="60" rx="4" ry="8" fill="#9a3412"/>
      <ellipse cx="88" cy="60" rx="8" ry="12" fill="url(#potGrad)" stroke="#c2410c" stroke-width="2"/>
      <ellipse cx="88" cy="60" rx="4" ry="8" fill="#9a3412"/>

      <!-- Cuerpo de la olla -->
      <path d="M20 45 L20 75 Q20 90 50 90 Q80 90 80 75 L80 45 Z" fill="url(#potGrad)" stroke="#c2410c" stroke-width="2"/>

      <!-- Comida visible (guiso/sopa) -->
      <ellipse cx="50" cy="45" rx="28" ry="8" fill="url(#foodGrad)"/>

      <!-- Decoración de la comida (vegetales) -->
      <circle cx="38" cy="44" r="4" fill="#22c55e"/>
      <circle cx="55" cy="43" r="3" fill="#ef4444"/>
      <circle cx="62" cy="45" r="3.5" fill="#22c55e"/>
      <circle cx="45" cy="46" r="2.5" fill="#fbbf24"/>

      <!-- Tapa de la olla (levantada) -->
      <ellipse cx="50" cy="35" rx="32" ry="6" fill="url(#lidGrad)" stroke="#c2410c" stroke-width="2"/>

      <!-- Manija de la tapa -->
      <ellipse cx="50" cy="30" rx="6" ry="4" fill="url(#handleGrad)"/>
      <ellipse cx="50" cy="29" rx="4" ry="2.5" fill="#fdba74"/>

      <!-- Brillo en la olla -->
      <path d="M25 50 Q28 55 25 65" stroke="rgba(255,255,255,0.5)" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Corazón pequeño (indica amor por cocinar) -->
      <path d="M75 38 C75 35 72 33 70 35 C68 33 65 35 65 38 C65 42 70 45 70 45 C70 45 75 42 75 38" fill="#ef4444" opacity="0.95"/>
    </svg>
  `;

  return L.divIcon({
    className: "custom-marker-comedores",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
      ${isSelected ? "transform: scale(1.15); filter: drop-shadow(0 4px 8px rgba(216, 27, 126, 0.5));" : ""}
    ">
      ${potSvg}
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const MAP_CENTER: [number, number] = [-11.9699, -76.998];
const MAP_ZOOM = 13;

// Componente para centrar el mapa en un comedor seleccionado
function CentrarMapa({ comedor }: { comedor: Comedor | null }) {
  const map = useMap();

  useEffect(() => {
    if (comedor) {
      map.flyTo([comedor.coordenadas.latitud, comedor.coordenadas.longitud], 16, {
        duration: 0.5,
      });
    }
  }, [comedor, map]);

  return null;
}

// Componente para ajustar posición de controles de zoom
function ZoomControlPosition({ filterOpen }: { filterOpen: boolean }) {
  useEffect(() => {
    const zoomControl = document.querySelector(".leaflet-control-zoom");
    if (zoomControl) {
      const rightContainer = document.querySelector(".leaflet-right.leaflet-top");
      if (rightContainer && !rightContainer.contains(zoomControl)) {
        rightContainer.appendChild(zoomControl);
      }
    }
  }, []);

  useEffect(() => {
    const zoomControl = document.querySelector(".leaflet-control-zoom") as HTMLElement;
    if (zoomControl) {
      zoomControl.style.transition = "margin-right 0.3s ease";
      zoomControl.style.marginRight = filterOpen ? "330px" : "10px";
    }
  }, [filterOpen]);

  return null;
}

// Interfaces para propiedades GeoJSON
interface SectorProperties {
  id: number;
  name: string;
  numero: number;
  color: string;
}

interface JurisdiccionProperties {
  id: string;
  name: string;
  description: string;
  color: string;
}

export default function MapaComedores({
  comedores,
  comedorSeleccionado,
  onComedorClick,
  limiteVisible,
  filterOpen = false,
  capasVisibles = { sectores: true, jurisdicciones: false, comedores: true }
}: MapaComedoresProps) {
  const [jurisdiccionesData, setJurisdiccionesData] = useState<FeatureCollection | null>(null);
  const [sectoresData, setSectoresData] = useState<FeatureCollection | null>(null);

  // Cargar GeoJSON de jurisdicciones
  useEffect(() => {
    fetch("/data/jurisdicciones.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => {
        if (data?.features) {
          setJurisdiccionesData(data);
        }
      })
      .catch((err) => console.error("Error cargando jurisdicciones:", err));
  }, []);

  // Cargar GeoJSON de sectores
  useEffect(() => {
    fetch("/data/sectores-pvl.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => {
        if (data?.features) {
          setSectoresData(data);
        }
      })
      .catch((err) => console.error("Error cargando sectores:", err));
  }, []);

  // Estilo para las jurisdicciones
  const estiloJurisdiccion = (feature: Feature | undefined): PathOptions => {
    const props = feature?.properties as JurisdiccionProperties | undefined;
    const color = props?.color || "#34b429";
    return {
      color: color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.35,
      interactive: true,
    };
  };

  // Función para manejar eventos de cada jurisdicción
  const onEachJurisdiccion = (feature: Feature, layer: Layer) => {
    const props = feature.properties as JurisdiccionProperties;
    if (props?.name) {
      layer.bindTooltip(props.name, {
        permanent: false,
        direction: "center",
        className: "jurisdiccion-tooltip",
      });

      const pathLayer = layer as Path;
      layer.on({
        mouseover: () => {
          pathLayer.setStyle({
            fillOpacity: 0.6,
            weight: 3,
          });
        },
        mouseout: () => {
          pathLayer.setStyle({
            fillOpacity: 0.35,
            weight: 2,
          });
        },
      });
    }
  };

  // Estilo para cada sector
  const estiloSector = (feature: Feature | undefined): PathOptions => {
    const props = feature?.properties as SectorProperties | undefined;
    const color = props?.color || "#888888";
    return {
      color: color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.35,
      interactive: true,
    };
  };

  // Función para manejar eventos de cada sector
  const onEachSector = (feature: Feature, layer: Layer) => {
    const props = feature.properties as SectorProperties;
    if (props?.name) {
      layer.bindTooltip(props.name, {
        permanent: false,
        direction: "center",
        className: "sector-tooltip",
      });

      const pathLayer = layer as Path;
      layer.on({
        mouseover: () => {
          pathLayer.setStyle({
            fillOpacity: 0.6,
            weight: 3,
          });
        },
        mouseout: () => {
          pathLayer.setStyle({
            fillOpacity: 0.35,
            weight: 2,
          });
        },
      });
    }
  };

  // Limitar los comedores mostrados
  const comedoresMostrados = comedores.slice(0, limiteVisible);

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

      {/* Sectores/Comunas */}
      {sectoresData && capasVisibles.sectores && (
        <GeoJSON
          key="sectores"
          data={sectoresData}
          style={estiloSector}
          onEachFeature={onEachSector}
        />
      )}

      {/* Jurisdicciones */}
      {jurisdiccionesData && capasVisibles.jurisdicciones && (
        <GeoJSON
          key="jurisdicciones"
          data={jurisdiccionesData}
          style={estiloJurisdiccion}
          onEachFeature={onEachJurisdiccion}
        />
      )}

      {/* Marcadores de comedores */}
      {capasVisibles.comedores && comedoresMostrados.map((comedor) => (
        <Marker
          key={comedor.id}
          position={[comedor.coordenadas.latitud, comedor.coordenadas.longitud]}
          icon={createCustomIcon(comedorSeleccionado?.id === comedor.id)}
          eventHandlers={{
            click: () => onComedorClick(comedor),
          }}
        >
          <Popup>
            <strong>{comedor.nombre}</strong>
            <br />
            {comedor.direccion}
          </Popup>
        </Marker>
      ))}

      {/* Centrar en comedor seleccionado */}
      <CentrarMapa comedor={comedorSeleccionado} />

      {/* Controlar posición del zoom */}
      <ZoomControlPosition filterOpen={filterOpen} />
    </MapContainer>
  );
}
