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
  id: string;
  codigo: string;
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
    dni: string;
    celular: string;
    fechaNacimiento?: string;
  };
  beneficiariosExtranjeros: number;
  discapacitados: number;
  direccion: string;
  observacion: string | null;
}

interface CapasVisibles {
  sectores: boolean;
  jurisdicciones: boolean;
  comites: boolean;
}

interface MapaPVLProps {
  comites: Comite[];
  comiteSeleccionado: Comite | null;
  onComiteClick: (comite: Comite) => void;
  limiteVisible: number;
  filterOpen?: boolean;
  capasVisibles?: CapasVisibles;
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

// Lista de comunas para la leyenda
const COMUNAS_LEYENDA = [
  { name: "ZARATE", color: "#9f004c" },
  { name: "CAMPOY", color: "#52f9eb" },
  { name: "MANGOMARCA", color: "#54cdd3" },
  { name: "SALSAS", color: "#6119f9" },
  { name: "HUAYRONA", color: "#d16567" },
  { name: "CANTO REY", color: "#ac9da9" },
  { name: "HUANCARAY", color: "#ecc20f" },
  { name: "MARISCAL CACERES", color: "#72427c" },
  { name: "MOTUPE", color: "#eb147c" },
  { name: "JICAMARCA", color: "#db63b2" },
  { name: "MARIATEGUI", color: "#d6a59c"},
  { name: "CASA BLANCA", color: "#fdd15d"},
  { name: "BAYOVAR", color: "#5c335d" },
  { name: "HUASCAR", color: "#efaeac" },
  { name: "CANTO GRANDE", color: "#8768c9" },
  { name: "SAN HILARION", color: "#73165f" },
  { name: "LAS FLORES", color: "#ab83cf"},
  { name: "CAJA DE AGUA", color: "#72cfdf" },
  
];

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

// Interfaz para las propiedades del sector
interface SectorProperties {
  id: number;
  name: string;
  numero: number;
  color: string;
}

// Interfaz para las propiedades de jurisdicción
interface JurisdiccionProperties {
  id: string;
  name: string;
  description: string;
  color: string;
}

export default function MapaPVL({
  comites,
  comiteSeleccionado,
  onComiteClick,
  limiteVisible,
  filterOpen = false,
  capasVisibles = { sectores: true, jurisdicciones: true, comites: true }
}: MapaPVLProps) {
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

  // Cargar GeoJSON de sectores/comunas
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

  // Estilo para las jurisdicciones basado en su color definido
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

      // Efecto hover
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

  // Estilo para cada sector basado en su color definido
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

      // Efecto hover
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

      {/* Sectores/Comunas con colores */}
      {sectoresData && capasVisibles.sectores && (
        <GeoJSON
          key="sectores"
          data={sectoresData}
          style={estiloSector}
          onEachFeature={onEachSector}
        />
      )}

      {/* Jurisdicciones (límite exterior) */}
      {jurisdiccionesData && capasVisibles.jurisdicciones && (
        <GeoJSON
          key="jurisdicciones"
          data={jurisdiccionesData}
          style={estiloJurisdiccion}
          onEachFeature={onEachJurisdiccion}
        />
      )}

      {/* Marcadores de comités */}
      {capasVisibles.comites && comitesMostrados.map((comite) => (
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

      
      {/* aqui iba la tarjeta de las leyendas de los sectores pero se quito */}
    </MapContainer>
  );
}
