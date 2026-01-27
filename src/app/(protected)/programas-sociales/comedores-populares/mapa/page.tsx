"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  IconButton,
  Typography,
  Drawer,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Badge,
  Tooltip,
  Slider,
  Popover,
  Chip,
  Paper,
  Avatar,
  Switch,
} from "@mui/material";
import {
  FilterList,
  Refresh,
  ExpandMore,
  Close,
  Map as MapIcon,
  Layers,
  TuneRounded,
  Place,
  Person,
  Phone,
  Group,
  Restaurant,
  Edit,
  MoreVert,
  Visibility,
  VisibilityOff,
  LocalDining,
} from "@mui/icons-material";
import type { Comedor } from "./MapaComedores";

// Importar el mapa dinámicamente para evitar SSR
const MapaComedores = dynamic(() => import("./MapaComedores"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    </div>
  ),
});

// Lista de jurisdicciones
const JURISDICCIONES_MAPA = [
  { id: 1, name: "ZARATE" },
  { id: 2, name: "CAMPOY" },
  { id: 3, name: "MANGOMARCA" },
  { id: 4, name: "HUAYRONA" },
  { id: 5, name: "CANTO REY" },
  { id: 6, name: "HUANCARAY" },
  { id: 7, name: "MARISCAL CACERES" },
  { id: 8, name: "MOTUPE" },
  { id: 9, name: "JICAMARCA" },
  { id: 10, name: "BAYOVAR" },
  { id: 11, name: "CANTO GRANDE" },
  { id: 12, name: "SAN HILARION" },
];

// Configuración de filtros
const FILTROS_CONFIG = [
  {
    id: "estado",
    label: "Estado",
    opciones: [
      { id: "activo", label: "Activo" },
      { id: "inactivo", label: "Inactivo" },
    ],
  },
  {
    id: "raciones",
    label: "Raciones Diarias",
    opciones: [
      { id: "menos50", label: "Menos de 50" },
      { id: "50-100", label: "50 - 100" },
      { id: "100-150", label: "100 - 150" },
      { id: "mas150", label: "Más de 150" },
    ],
  },
];

// Datos de ejemplo estáticos
const COMEDORES_EJEMPLO: Comedor[] = [
  {
    id: "1",
    codigo: "CP-001",
    nombre: "Comedor Popular San Martín",
    direccion: "Av. Los Pinos 123, Zarate",
    jurisdiccion: "ZARATE",
    coordenadas: { latitud: -11.9650, longitud: -76.9950 },
    beneficiarios: 85,
    racionesDiarias: 120,
    responsable: { nombre: "María García López", telefono: "987654321" },
    estado: "activo",
  },
  {
    id: "2",
    codigo: "CP-002",
    nombre: "Comedor Señor de los Milagros",
    direccion: "Jr. Las Flores 456, Campoy",
    jurisdiccion: "CAMPOY",
    coordenadas: { latitud: -11.9720, longitud: -76.9900 },
    beneficiarios: 65,
    racionesDiarias: 90,
    responsable: { nombre: "Rosa Mendoza Quispe", telefono: "912345678" },
    estado: "activo",
  },
  {
    id: "3",
    codigo: "CP-003",
    nombre: "Comedor Virgen del Carmen",
    direccion: "Calle Principal 789, Mangomarca",
    jurisdiccion: "MANGOMARCA",
    coordenadas: { latitud: -11.9680, longitud: -77.0020 },
    beneficiarios: 92,
    racionesDiarias: 130,
    responsable: { nombre: "Carmen Huamán Torres", telefono: "945678123" },
    estado: "activo",
  },
  {
    id: "4",
    codigo: "CP-004",
    nombre: "Comedor Santa Rosa de Lima",
    direccion: "Av. Central 321, Canto Rey",
    jurisdiccion: "CANTO REY",
    coordenadas: { latitud: -11.9750, longitud: -76.9850 },
    beneficiarios: 78,
    racionesDiarias: 110,
    responsable: { nombre: "Juana Pérez Sánchez", telefono: "956789234" },
    estado: "activo",
  },
  {
    id: "5",
    codigo: "CP-005",
    nombre: "Comedor Sagrado Corazón",
    direccion: "Jr. Los Cedros 654, Huayrona",
    jurisdiccion: "HUAYRONA",
    coordenadas: { latitud: -11.9630, longitud: -77.0080 },
    beneficiarios: 55,
    racionesDiarias: 75,
    responsable: { nombre: "Ana Castillo Ramos", telefono: "967890345" },
    estado: "inactivo",
  },
];

// Opciones de límite
const LIMITE_OPCIONES = [50, 100, 200, 500];

export default function ComedoresMapaPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState<Record<string, string[]>>({});
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>("estado");

  // Control de jurisdicciones seleccionadas
  const [jurisdiccionesSeleccionadas, setJurisdiccionesSeleccionadas] = useState<number[]>([]);

  // Control de límite de visualización
  const [limiteVisible, setLimiteVisible] = useState(100);
  const [limiteAnchorEl, setLimiteAnchorEl] = useState<HTMLElement | null>(null);

  // Control de capas
  const [capasAnchorEl, setCapasAnchorEl] = useState<HTMLElement | null>(null);
  const [capasVisibles, setCapasVisibles] = useState({
    sectores: true,
    jurisdicciones: false,
    comedores: true,
  });
  const capasPopoverOpen = Boolean(capasAnchorEl);

  // Comedor seleccionado para el panel de información
  const [comedorSeleccionado, setComedorSeleccionado] = useState<Comedor | null>(null);

  const limitePopoverOpen = Boolean(limiteAnchorEl);

  // Datos de comedores (estáticos por ahora)
  const comedores = COMEDORES_EJEMPLO;
  const loading = false;

  // Filtrar comedores
  const comedoresFiltrados = comedores.filter((comedor) => {
    // Filtro por jurisdicción
    if (jurisdiccionesSeleccionadas.length > 0) {
      const jurisdiccionId = JURISDICCIONES_MAPA.find(j => j.name === comedor.jurisdiccion)?.id;
      if (!jurisdiccionId || !jurisdiccionesSeleccionadas.includes(jurisdiccionId)) {
        return false;
      }
    }
    // Filtro por estado
    const estadosFiltro = filtrosSeleccionados["estado"] || [];
    if (estadosFiltro.length > 0 && !estadosFiltro.includes(comedor.estado)) {
      return false;
    }
    return true;
  });

  // Calcular valores
  const totalFiltrados = comedoresFiltrados.length;
  const comedoresMostrados = Math.min(limiteVisible, totalFiltrados);

  // Contar filtros activos
  const contarFiltrosActivos = () => {
    const filtrosBasicos = Object.values(filtrosSeleccionados).reduce((acc, arr) => acc + arr.length, 0);
    const filtroJurisdicciones = jurisdiccionesSeleccionadas.length > 0 ? 1 : 0;
    return filtrosBasicos + filtroJurisdicciones;
  };

  const hayFiltrosActivos = () => contarFiltrosActivos() > 0;

  // Manejar cambio de filtro
  const handleFilterChange = (categoriaId: string, opcionId: string, checked: boolean) => {
    setFiltrosSeleccionados((prev) => {
      const current = prev[categoriaId] || [];
      if (checked) {
        return { ...prev, [categoriaId]: [...current, opcionId] };
      } else {
        return { ...prev, [categoriaId]: current.filter((id) => id !== opcionId) };
      }
    });
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltrosSeleccionados({});
    setJurisdiccionesSeleccionadas([]);
  };

  // Manejar toggle de jurisdicción
  const handleJurisdiccionToggle = (jurisdiccionId: number) => {
    setJurisdiccionesSeleccionadas((prev) =>
      prev.includes(jurisdiccionId) ? prev.filter((c) => c !== jurisdiccionId) : [...prev, jurisdiccionId]
    );
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    setFilterOpen(false);
  };

  // Manejar clic en comedor
  const handleComedorClick = (comedor: Comedor) => {
    setComedorSeleccionado(comedor);
  };

  // Cerrar panel de información
  const cerrarPanelInfo = () => {
    setComedorSeleccionado(null);
  };

  const filtrosActivos = contarFiltrosActivos();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px + 32px)",
        marginLeft: "-16px",
        marginRight: "-16px",
        marginBottom: "-16px",
        marginTop: "-16px",
        overflow: "hidden",
        "@media (min-width: 768px)": {
          height: "calc(100vh - 64px + 48px)",
          marginLeft: "-24px",
          marginRight: "-24px",
          marginBottom: "-24px",
          marginTop: "-24px",
        },
      }}
    >
      {/* Header del mapa */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          bgcolor: "white",
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: 10,
        }}
      >
        {/* Lado izquierdo - Título */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MapIcon sx={{ color: "#d81b7e" }} />
          <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: "'Poppins', 'Roboto', sans-serif" }}>
            Mapa de Comedores
          </Typography>
        </Box>

        {/* Centro - Contador y control de límite */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "grey.100",
              px: 2,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}>
              Mostrando <strong>{comedoresMostrados}</strong> de <strong>{totalFiltrados}</strong> comedores
              {hayFiltrosActivos() && totalFiltrados < comedores.length && (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: "#d81b7e" }}>
                  (filtrado de {comedores.length})
                </Typography>
              )}
            </Typography>
          </Box>

          {/* Botón de control de límite */}
          <Tooltip title="Ajustar cantidad visible">
            <Box
              onClick={(e) => setLimiteAnchorEl(e.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "#d81b7e",
                color: "white",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: "#b8176b" },
              }}
            >
              <TuneRounded fontSize="small" />
              <Typography variant="body2" fontWeight="medium">
                {limiteVisible}
              </Typography>
            </Box>
          </Tooltip>

          {/* Popover de límite */}
          <Popover
            open={limitePopoverOpen}
            anchorEl={limiteAnchorEl}
            onClose={() => setLimiteAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Box sx={{ p: 2, width: 300 }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1} sx={{ fontFamily: "'Poppins', 'Roboto', sans-serif" }}>
                Límite de visualización
              </Typography>

              {hayFiltrosActivos() && (
                <Box sx={{ mb: 2, p: 1, bgcolor: "#fce4ec", borderRadius: 1 }}>
                  <Typography variant="caption" color="#d81b7e">
                    Filtros activos: {totalFiltrados} comedores coinciden de {comedores.length} total
                  </Typography>
                </Box>
              )}

              <Box sx={{ px: 1 }}>
                <Slider
                  value={Math.min(limiteVisible, totalFiltrados)}
                  onChange={(_, value) => setLimiteVisible(value as number)}
                  min={10}
                  max={totalFiltrados || 500}
                  step={10}
                  valueLabelDisplay="auto"
                  sx={{
                    color: "#d81b7e",
                    "& .MuiSlider-thumb": {
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0 0 0 8px rgba(216, 27, 126, 0.16)",
                      },
                    },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: -1 }}>
                  <Typography variant="caption" color="text.secondary">10</Typography>
                  <Typography variant="caption" color="text.secondary">{totalFiltrados}</Typography>
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, mb: 1 }}>
                Opciones rápidas:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {LIMITE_OPCIONES.filter(op => op <= (totalFiltrados || 500)).map((opcion) => (
                  <Chip
                    key={opcion}
                    label={opcion}
                    size="small"
                    onClick={() => setLimiteVisible(opcion)}
                    sx={{
                      bgcolor: limiteVisible === opcion ? "#d81b7e" : "grey.200",
                      color: limiteVisible === opcion ? "white" : "text.primary",
                      "&:hover": { bgcolor: limiteVisible === opcion ? "#b8176b" : "grey.300" },
                    }}
                  />
                ))}
                <Chip
                  label={`Todos (${totalFiltrados})`}
                  size="small"
                  onClick={() => setLimiteVisible(totalFiltrados || 500)}
                  sx={{
                    bgcolor: limiteVisible >= totalFiltrados ? "#d81b7e" : "grey.200",
                    color: limiteVisible >= totalFiltrados ? "white" : "text.primary",
                    "&:hover": { bgcolor: limiteVisible >= totalFiltrados ? "#b8176b" : "grey.300" },
                  }}
                />
              </Box>

              <Box sx={{ mt: 2, p: 1.5, bgcolor: "grey.100", borderRadius: 1 }}>
                <Typography variant="body2" textAlign="center">
                  Mostrando <strong>{comedoresMostrados}</strong> de <strong>{totalFiltrados}</strong> comedores
                </Typography>
              </Box>
            </Box>
          </Popover>
        </Box>

        {/* Lado derecho - Iconos de acción */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Actualizar">
            <IconButton size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filtros">
            <IconButton
              size="small"
              onClick={() => setFilterOpen(true)}
              sx={{
                bgcolor: filtrosActivos > 0 ? "#d81b7e" : "transparent",
                color: filtrosActivos > 0 ? "white" : "inherit",
                "&:hover": { bgcolor: filtrosActivos > 0 ? "#b8176b" : "action.hover" },
              }}
            >
              <Badge badgeContent={filtrosActivos} color="error">
                <FilterList />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Capas">
            <IconButton
              size="small"
              onClick={(e) => setCapasAnchorEl(e.currentTarget)}
              sx={{
                bgcolor: capasPopoverOpen ? "grey.200" : "transparent",
              }}
            >
              <Layers />
            </IconButton>
          </Tooltip>

          {/* Popover de capas */}
          <Popover
            open={capasPopoverOpen}
            anchorEl={capasAnchorEl}
            onClose={() => setCapasAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                overflow: "hidden",
              }
            }}
          >
            <Box sx={{ width: 280 }}>
              {/* Header del popover */}
              <Box
                sx={{
                  bgcolor: "#1E293B",
                  color: "white",
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Layers fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Control de Capas
                </Typography>
              </Box>

              {/* Lista de capas */}
              <Box sx={{ p: 1 }}>
                {/* Capa de Zonas */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: capasVisibles.sectores ? "rgba(216, 27, 126, 0.08)" : "transparent",
                    transition: "background-color 0.2s",
                    "&:hover": { bgcolor: capasVisibles.sectores ? "rgba(216, 27, 126, 0.12)" : "grey.50" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: "#d81b7e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: capasVisibles.sectores ? 1 : 0.4,
                        transition: "opacity 0.2s",
                      }}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: "rgba(255,255,255,0.9)",
                          borderRadius: 0.5,
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Zonas
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sectores del distrito
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    size="small"
                    checked={capasVisibles.sectores}
                    onChange={(e) => setCapasVisibles(prev => ({ ...prev, sectores: e.target.checked }))}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#d81b7e",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#d81b7e",
                      },
                    }}
                  />
                </Box>

                {/* Capa de Jurisdicciones */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: capasVisibles.jurisdicciones ? "rgba(52, 180, 41, 0.08)" : "transparent",
                    transition: "background-color 0.2s",
                    "&:hover": { bgcolor: capasVisibles.jurisdicciones ? "rgba(52, 180, 41, 0.12)" : "grey.50" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: "#34b429",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: capasVisibles.jurisdicciones ? 1 : 0.4,
                        transition: "opacity 0.2s",
                      }}
                    >
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          border: "2px solid rgba(255,255,255,0.9)",
                          borderRadius: 0.5,
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Jurisdicciones
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Límites territoriales
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    size="small"
                    checked={capasVisibles.jurisdicciones}
                    onChange={(e) => setCapasVisibles(prev => ({ ...prev, jurisdicciones: e.target.checked }))}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#34b429",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#34b429",
                      },
                    }}
                  />
                </Box>

                {/* Capa de Comedores */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: capasVisibles.comedores ? "rgba(30, 41, 59, 0.08)" : "transparent",
                    transition: "background-color 0.2s",
                    "&:hover": { bgcolor: capasVisibles.comedores ? "rgba(30, 41, 59, 0.12)" : "grey.50" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: "#1E293B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: capasVisibles.comedores ? 1 : 0.4,
                        transition: "opacity 0.2s",
                      }}
                    >
                      <Restaurant sx={{ fontSize: 18, color: "white" }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Comedores
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ubicación de comedores
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    size="small"
                    checked={capasVisibles.comedores}
                    onChange={(e) => setCapasVisibles(prev => ({ ...prev, comedores: e.target.checked }))}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#1E293B",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#1E293B",
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Footer con acciones rápidas */}
              <Divider />
              <Box sx={{ p: 1.5, display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  onClick={() => setCapasVisibles({ sectores: true, jurisdicciones: true, comedores: true })}
                  startIcon={<Visibility sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: "none",
                    borderColor: "grey.300",
                    color: "text.secondary",
                    "&:hover": { borderColor: "grey.400", bgcolor: "grey.50" },
                  }}
                >
                  Mostrar todas
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  onClick={() => setCapasVisibles({ sectores: false, jurisdicciones: false, comedores: false })}
                  startIcon={<VisibilityOff sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: "none",
                    borderColor: "grey.300",
                    color: "text.secondary",
                    "&:hover": { borderColor: "grey.400", bgcolor: "grey.50" },
                  }}
                >
                  Ocultar todas
                </Button>
              </Box>
            </Box>
          </Popover>
        </Box>
      </Box>

      {/* Contenedor del mapa con panel de información */}
      <Box sx={{ flex: 1, position: "relative", display: "flex" }}>
        {/* Panel de información del comedor seleccionado */}
        {comedorSeleccionado && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 350,
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header del panel */}
            <Box
              sx={{
                bgcolor: "#d81b7e",
                color: "white",
                p: 2,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ flex: 1, pr: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2, fontFamily: "'Poppins', 'Roboto', sans-serif" }}>
                  {comedorSeleccionado.nombre}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Código: {comedorSeleccionado.codigo}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton size="small" sx={{ color: "white" }}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: "white" }}>
                  <MoreVert fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: "white" }} onClick={cerrarPanelInfo}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Contenido del panel */}
            <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
              {/* Estado */}
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "inline-block",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "12px",
                    backgroundColor: comedorSeleccionado.estado === "activo" ? "#dcfce7" : "#fee2e2",
                    color: comedorSeleccionado.estado === "activo" ? "#166534" : "#991b1b",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {comedorSeleccionado.estado === "activo" ? "ACTIVO" : "INACTIVO"}
                </Box>
              </Box>

              {/* Dirección */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary" fontWeight="bold">
                  Dirección
                </Typography>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mt: 0.5 }}>
                  <Place fontSize="small" color="action" />
                  <Typography variant="body2">
                    {comedorSeleccionado.direccion}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                  Jurisdicción: {comedorSeleccionado.jurisdiccion}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Responsable */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary" fontWeight="bold">
                  Responsable
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                  <Avatar sx={{ bgcolor: "#1E293B", width: 40, height: 40 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {comedorSeleccionado.responsable.nombre}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Phone fontSize="inherit" sx={{ color: "text.secondary", fontSize: 14 }} />
                      <Typography variant="caption" color="text.secondary">
                        {comedorSeleccionado.responsable.telefono}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Estadísticas */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary" fontWeight="bold">
                  Estadísticas
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 1 }}>
                  <Box sx={{ bgcolor: "#fce4ec", p: 1.5, borderRadius: 1, textAlign: "center" }}>
                    <Group sx={{ color: "#d81b7e", mb: 0.5 }} />
                    <Typography variant="h5" fontWeight="bold" color="#d81b7e">
                      {comedorSeleccionado.beneficiarios}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Beneficiarios
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: "#fff3e0", p: 1.5, borderRadius: 1, textAlign: "center" }}>
                    <LocalDining sx={{ color: "#ff9800", mb: 0.5 }} />
                    <Typography variant="h5" fontWeight="bold" color="#ff9800">
                      {comedorSeleccionado.racionesDiarias}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Raciones/día
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Coordenadas */}
              <Box sx={{ bgcolor: "grey.50", p: 1.5, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Coordenadas:</strong> {comedorSeleccionado.coordenadas.latitud.toFixed(6)}, {comedorSeleccionado.coordenadas.longitud.toFixed(6)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Mapa */}
        <Box sx={{ flex: 1, position: "relative" }}>
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </Box>
          ) : (
            <MapaComedores
              comedores={comedoresFiltrados}
              comedorSeleccionado={comedorSeleccionado}
              onComedorClick={handleComedorClick}
              limiteVisible={limiteVisible}
              filterOpen={filterOpen}
              capasVisibles={capasVisibles}
            />
          )}
        </Box>
      </Box>

      {/* Drawer de filtros */}
      <Drawer
        anchor="right"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        PaperProps={{ sx: { width: 320, maxWidth: "100%" } }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterList />
            <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: "'Poppins', 'Roboto', sans-serif" }}>
              Filtros
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setFilterOpen(false)}>
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", gap: 1, p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Button variant="outlined" fullWidth onClick={limpiarFiltros} disabled={filtrosActivos === 0}>
            LIMPIAR
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={aplicarFiltros}
            sx={{ bgcolor: "#d81b7e", "&:hover": { bgcolor: "#b8176b" } }}
          >
            APLICAR
          </Button>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {FILTROS_CONFIG.map((categoria) => {
            const cantidadFiltros = filtrosSeleccionados[categoria.id]?.length || 0;

            return (
              <Accordion
                key={categoria.id}
                expanded={expandedAccordion === categoria.id}
                onChange={(_, isExpanded) => setExpandedAccordion(isExpanded ? categoria.id : false)}
                disableGutters
                elevation={0}
                sx={{ "&:before": { display: "none" }, borderBottom: "1px solid", borderColor: "divider" }}
              >
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 48, "& .MuiAccordionSummary-content": { my: 0 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography fontWeight="medium">{categoria.label}</Typography>
                    {cantidadFiltros > 0 && (
                      <Box
                        sx={{
                          bgcolor: "#d81b7e",
                          color: "white",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                        }}
                      >
                        {cantidadFiltros}
                      </Box>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <FormGroup>
                    {categoria.opciones.map((opcion) => (
                      <FormControlLabel
                        key={opcion.id}
                        control={
                          <Checkbox
                            size="small"
                            checked={filtrosSeleccionados[categoria.id]?.includes(opcion.id) || false}
                            onChange={(e) => handleFilterChange(categoria.id, opcion.id, e.target.checked)}
                            sx={{ color: "#d81b7e", "&.Mui-checked": { color: "#d81b7e" } }}
                          />
                        }
                        label={<Typography variant="body2">{opcion.label}</Typography>}
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            );
          })}

          {/* Filtro de Jurisdicciones */}
          <Accordion
            expanded={expandedAccordion === "jurisdicciones"}
            onChange={(_, isExpanded) => setExpandedAccordion(isExpanded ? "jurisdicciones" : false)}
            disableGutters
            elevation={0}
            sx={{ "&:before": { display: "none" }, borderBottom: "1px solid", borderColor: "divider" }}
          >
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 48, "& .MuiAccordionSummary-content": { my: 0 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography fontWeight="medium">Jurisdicciones</Typography>
                {jurisdiccionesSeleccionadas.length > 0 && (
                  <Box
                    sx={{
                      bgcolor: "#0369a1",
                      color: "white",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                    }}
                  >
                    {jurisdiccionesSeleccionadas.length}
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0.5,
                  maxHeight: 280,
                  overflowY: "auto",
                }}
              >
                {JURISDICCIONES_MAPA.map((jurisdiccion) => (
                  <FormControlLabel
                    key={jurisdiccion.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={jurisdiccionesSeleccionadas.includes(jurisdiccion.id)}
                        onChange={() => handleJurisdiccionToggle(jurisdiccion.id)}
                        sx={{ color: "#0369a1", "&.Mui-checked": { color: "#0369a1" }, py: 0.25 }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                        {jurisdiccion.name}
                      </Typography>
                    }
                    sx={{ mr: 0 }}
                  />
                ))}
              </Box>
              {jurisdiccionesSeleccionadas.length > 0 && (
                <Typography variant="caption" color="#0369a1" sx={{ mt: 1, display: "block" }}>
                  {jurisdiccionesSeleccionadas.length} jurisdicción(es) seleccionada(s)
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      </Drawer>
    </Box>
  );
}
