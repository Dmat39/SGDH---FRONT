"use client";

import { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  FilterList,
  Refresh,
  Search,
  ExpandMore,
  Close,
  Map as MapIcon,
  Visibility,
  MyLocation,
  TuneRounded,
  Place,
  Person,
  Phone,
  Badge as BadgeIcon,
  Group,
  Home,
  Edit,
  MoreVert,
  LocalShipping,
  AssignmentInd,
} from "@mui/icons-material";
import type { Comite } from "./MapaPVL";

// Importar el mapa dinámicamente para evitar SSR
const MapaPVL = dynamic(() => import("./MapaPVL"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    </div>
  ),
});

// Configuración de filtros
const FILTROS_CONFIG = [
  {
    id: "estado",
    label: "Estado",
    opciones: [
      { id: "activo", label: "Activo" },
      { id: "inactivo", label: "Inactivo" },
      { id: "suspendido", label: "Suspendido" },
    ],
  },
  {
    id: "tipo_beneficiario",
    label: "Tipo de Beneficiario",
    opciones: [
      { id: "gestante", label: "Gestante" },
      { id: "lactante", label: "Madre Lactante" },
      { id: "adulto_mayor", label: "Adulto Mayor" },
      
    ],
  },
  {
    id: "ruta",
    label: "Ruta",
    opciones: [
      { id: "A", label: "Ruta A" },
      { id: "B", label: "Ruta B" },
      { id: "C", label: "Ruta C" },
      { id: "D", label: "Ruta D" },
    ],
  },
  {
    id: "comuna",
    label: "Comuna",
    opciones: [
      { id: "1", label: "Comuna 1" },
      { id: "2", label: "Comuna 2" },
      { id: "3", label: "Comuna 3" },
      { id: "10", label: "Comuna 10" },
      { id: "12", label: "Comuna 12" },
    ],
  },
];

// Configuración de rango de edad
interface RangoEdadState {
  activo: boolean;
  min: number;
  max: number;
}

// Opciones preestablecidas para el límite
const LIMITE_OPCIONES = [100, 300, 500, 1000];

// Interface para los datos del JSON
interface PVLData {
  metadata: {
    total: number;
    generado: string;
    fuente: string;
    version: string;
  };
  comites: Comite[];
}

export default function PVLMapaPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState<Record<string, string[]>>({});
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>("estado");

  // Control de rango de edad (general)
  const [rangoEdad, setRangoEdad] = useState<RangoEdadState>({
    activo: false,
    min: 0,
    max: 18,
  });

  // Control de límite de visualización
  const [limiteVisible, setLimiteVisible] = useState(300);
  const [limiteAnchorEl, setLimiteAnchorEl] = useState<HTMLElement | null>(null);

  // Datos de comités
  const [comites, setComites] = useState<Comite[]>([]);
  const [totalComites, setTotalComites] = useState(0);
  const [loading, setLoading] = useState(true);

  // Comité seleccionado para el panel de información
  const [comiteSeleccionado, setComiteSeleccionado] = useState<Comite | null>(null);

  const limitePopoverOpen = Boolean(limiteAnchorEl);

  // Cargar datos del GeoJSON
  useEffect(() => {
    fetch("/data/pvlprueba.geojson")
      .then((res) => res.json())
      .then((data: PVLData) => {
        if (data?.comites) {
          setComites(data.comites);
          setTotalComites(data.metadata?.total || data.comites.length);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando comités:", err);
        setLoading(false);
      });
  }, []);

  // Calcular valores
  const totalFiltrados = comites.length; // En producción, filtrar según criterios
  const comitesMostrados = Math.min(limiteVisible, totalFiltrados);

  // Contar filtros activos (incluyendo rango de edad)
  const contarFiltrosActivos = () => {
    const filtrosBasicos = Object.values(filtrosSeleccionados).reduce((acc, arr) => acc + arr.length, 0);
    const filtroEdad = rangoEdad.activo ? 1 : 0;
    return filtrosBasicos + filtroEdad;
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = () => {
    return contarFiltrosActivos() > 0;
  };

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
    setRangoEdad({ activo: false, min: 0, max: 18 });
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    console.log("Filtros aplicados:", filtrosSeleccionados);
    console.log("Rango de edad:", rangoEdad);
    setFilterOpen(false);
  };

  // Manejar clic en comité
  const handleComiteClick = (comite: Comite) => {
    setComiteSeleccionado(comite);
  };

  // Cerrar panel de información
  const cerrarPanelInfo = () => {
    setComiteSeleccionado(null);
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
          <Typography variant="h6" fontWeight="bold">
            Mapa PVL
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
            <Typography variant="body2" color="text.secondary">
              Mostrando <strong>{comitesMostrados}</strong> de <strong>{totalFiltrados}</strong> comités
              {hayFiltrosActivos() && totalFiltrados < totalComites && (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: "#d81b7e" }}>
                  (filtrado de {totalComites})
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
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                Límite de visualización
              </Typography>

              {hayFiltrosActivos() && (
                <Box sx={{ mb: 2, p: 1, bgcolor: "#fce4ec", borderRadius: 1 }}>
                  <Typography variant="caption" color="#d81b7e">
                    Filtros activos: {totalFiltrados} comités coinciden de {totalComites} total
                  </Typography>
                </Box>
              )}

              <Box sx={{ px: 1 }}>
                <Slider
                  value={Math.min(limiteVisible, totalFiltrados)}
                  onChange={(_, value) => setLimiteVisible(value as number)}
                  min={50}
                  max={totalFiltrados || 1500}
                  step={50}
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
                  <Typography variant="caption" color="text.secondary">50</Typography>
                  <Typography variant="caption" color="text.secondary">{totalFiltrados}</Typography>
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, mb: 1 }}>
                Opciones rápidas:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {LIMITE_OPCIONES.filter(op => op <= (totalFiltrados || 1500)).map((opcion) => (
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
                  onClick={() => setLimiteVisible(totalFiltrados || 1500)}
                  sx={{
                    bgcolor: limiteVisible >= totalFiltrados ? "#d81b7e" : "grey.200",
                    color: limiteVisible >= totalFiltrados ? "white" : "text.primary",
                    "&:hover": { bgcolor: limiteVisible >= totalFiltrados ? "#b8176b" : "grey.300" },
                  }}
                />
              </Box>

              <Box sx={{ mt: 2, p: 1.5, bgcolor: "grey.100", borderRadius: 1 }}>
                <Typography variant="body2" textAlign="center">
                  Mostrando <strong>{comitesMostrados}</strong> de <strong>{totalFiltrados}</strong> comités
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
          <Tooltip title="Mi ubicación">
            <IconButton size="small">
              <MyLocation />
            </IconButton>
          </Tooltip>
          <Tooltip title="Buscar">
            <IconButton size="small">
              <Search />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filtros">
            <IconButton
              size="small"
              onClick={() => setFilterOpen(true)}
              sx={{
                bgcolor: filtrosActivos > 0 ? "primary.main" : "transparent",
                color: filtrosActivos > 0 ? "white" : "inherit",
                "&:hover": { bgcolor: filtrosActivos > 0 ? "primary.dark" : "action.hover" },
              }}
            >
              <Badge badgeContent={filtrosActivos} color="error">
                <FilterList />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Capas">
            <IconButton size="small">
              <Visibility />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Contenedor del mapa con panel de información */}
      <Box sx={{ flex: 1, position: "relative", display: "flex" }}>
        {/* Panel de información del comité seleccionado */}
        {comiteSeleccionado && (
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
                bgcolor: "#a62651",
                color: "white",
                p: 2,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ flex: 1, pr: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                  {comiteSeleccionado.comite}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Código: {comiteSeleccionado.codigo}
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
              {/* Dirección */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary" fontWeight="bold">
                  Dirección
                </Typography>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mt: 0.5 }}>
                  <Place fontSize="small" color="action" />
                  <Typography variant="body2">
                    {comiteSeleccionado.direccion}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                  {comiteSeleccionado.pueblo} - Comuna {comiteSeleccionado.comuna}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Coordinadora */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary" fontWeight="bold">
                  Coordinadora
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                  <Avatar sx={{ bgcolor: "#1E293B", width: 40, height: 40 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {comiteSeleccionado.coordinadora.nombre}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <BadgeIcon fontSize="inherit" sx={{ color: "text.secondary", fontSize: 14 }} />
                      <Typography variant="caption" color="text.secondary">
                        DNI: {comiteSeleccionado.coordinadora.dni}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Phone fontSize="inherit" sx={{ color: "text.secondary", fontSize: 14 }} />
                      <Typography variant="caption" color="text.secondary">
                        {comiteSeleccionado.coordinadora.celular}
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
                  <Box sx={{ bgcolor: "grey.100", p: 1.5, borderRadius: 1, textAlign: "center" }}>
                    <Typography variant="h5" fontWeight="bold" color="#1E293B">
                      {comiteSeleccionado.beneficiarios}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Beneficiarios
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: "grey.100", p: 1.5, borderRadius: 1, textAlign: "center" }}>
                    <Typography variant="h5" fontWeight="bold" color="#1E293B">
                      {comiteSeleccionado.socios}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Socios
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Información adicional */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary" fontWeight="bold">
                  Información Adicional
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <LocalShipping fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Centro de Acopio:</strong> {comiteSeleccionado.centroAcopio}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <AssignmentInd fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Inspector:</strong> {comiteSeleccionado.inspector}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Home fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Ruta:</strong> {comiteSeleccionado.ruta}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Otros datos */}
              <Box sx={{ bgcolor: "grey.50", p: 1.5, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Beneficiarios extranjeros: {comiteSeleccionado.beneficiariosExtranjeros} |
                  Discapacitados: {comiteSeleccionado.discapacitados}
                </Typography>
                {comiteSeleccionado.observacion && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    <strong>Obs:</strong> {comiteSeleccionado.observacion}
                  </Typography>
                )}
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
            <MapaPVL
              comites={comites}
              comiteSeleccionado={comiteSeleccionado}
              onComiteClick={handleComiteClick}
              limiteVisible={limiteVisible}
              filterOpen={filterOpen}
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
            <Typography variant="h6" fontWeight="bold">
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
            const cantidadFiltros = categoria.id === "tipo_beneficiario"
              ? (filtrosSeleccionados[categoria.id]?.length || 0) + (rangoEdad.activo ? 1 : 0)
              : filtrosSeleccionados[categoria.id]?.length || 0;

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
                  {categoria.id === "tipo_beneficiario" && (
                    <Box sx={{ mb: 2, pb: 2, borderBottom: "1px dashed", borderColor: "divider" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={rangoEdad.activo}
                            onChange={() => setRangoEdad((prev) => ({ ...prev, activo: !prev.activo }))}
                            sx={{ color: "#d81b7e", "&.Mui-checked": { color: "#d81b7e" } }}
                          />
                        }
                        label={
                          <Typography variant="body2">
                            Rango de edad: <strong>{rangoEdad.min} - {rangoEdad.max} años</strong>
                          </Typography>
                        }
                      />
                      {rangoEdad.activo && (
                        <Box sx={{ px: 2, mt: 1 }}>
                          <Slider
                            value={[rangoEdad.min, rangoEdad.max]}
                            onChange={(_, value) => {
                              const [min, max] = value as number[];
                              setRangoEdad((prev) => ({ ...prev, min, max }));
                            }}
                            min={0}
                            max={100}
                            valueLabelDisplay="auto"
                            marks={[
                              { value: 0, label: "0" },
                              { value: 18, label: "18" },
                              { value: 40, label: "40" },
                              { value: 60, label: "60" },
                              { value: 100, label: "100" },
                            ]}
                            sx={{
                              color: "#d81b7e",
                              "& .MuiSlider-thumb": {
                                "&:hover, &.Mui-focusVisible": {
                                  boxShadow: "0 0 0 8px rgba(216, 27, 126, 0.16)",
                                },
                              },
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  )}

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
        </Box>
      </Drawer>
    </Box>
  );
}
