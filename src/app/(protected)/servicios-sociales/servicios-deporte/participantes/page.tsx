"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Slider,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import {
  FileDownload,
  Refresh,
  Search,
  FilterList,
  Cake,
  Clear,
  Close,
  Visibility,
  Badge,
  Phone,
  CalendarMonth,
  PersonSearch,
  Groups,
  EmojiEvents,
} from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";
import * as XLSX from "xlsx";

const subgerencia = SUBGERENCIAS[SubgerenciaType.SERVICIOS_SOCIALES];
const MODULE_COLOR = subgerencia.color; // #00a3a8

// ============================================
// TALLERES
// ============================================
const TALLERES = [
  { id: "8d36a33e-65e7-48bd-b513-978ad63b237a", name: "Ballet" },
  { id: "56949f0f-9bd6-4b9f-aae0-e4abc00ab0b8", name: "Dibujo y Pintura" },
  { id: "6ffa2818-ac6a-4d59-8897-6b7425cac2d1", name: "Futbol" },
  { id: "140bf549-1e37-431e-8372-3df0fe867903", name: "Taekwondo" },
];

// ============================================
// MESES
// ============================================
const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

type FilterType = "edad" | "cumpleanos";

// ============================================
// UTILIDADES
// ============================================
const calcularEdad = (fechaNacimiento: string | null | undefined): number => {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getUTCFullYear() - nacimiento.getUTCFullYear();
  const mes = hoy.getUTCMonth() - nacimiento.getUTCMonth();
  if (mes < 0 || (mes === 0 && hoy.getUTCDate() < nacimiento.getUTCDate())) {
    edad--;
  }
  return edad;
};

const formatearFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return "-";
  const d = new Date(fecha);
  const dia = d.getUTCDate().toString().padStart(2, "0");
  const mes = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const anio = d.getUTCFullYear();
  return `${dia}/${mes}/${anio}`;
};

const formatearTelefono = (telefono: string | null | undefined): string => {
  if (!telefono || !telefono.trim()) return "-";
  const t = telefono.trim();
  if (t.startsWith("+51")) return t;
  if (t.startsWith("51") && t.length >= 11) return `+${t}`;
  return `+51${t}`;
};

// ============================================
// INTERFACES BACKEND
// ============================================
interface WorkshopEntity {
  id: string;
  name: string;
}

interface ParticipanteBackend {
  id: string;
  dni: string;
  name: string;
  lastname: string;
  phone: string | null;
  birthday: string;
  workshop: WorkshopEntity | null;
}

interface BackendResponse {
  message: string;
  data: {
    data: ParticipanteBackend[];
    totalCount: number;
    currentPage: number;
    pageCount: number;
    totalPages: number;
  };
}

interface BackendDetalleResponse {
  message: string;
  data: ParticipanteBackend;
}

// ============================================
// INTERFACE FRONTEND
// ============================================
interface ParticipanteTabla {
  id: string;
  nombreCompleto: string;
  dni: string;
  celular: string;
  fechaNacimiento: string;
  edad: number;
  taller: string;
  tallerId: string;
}

// ============================================
// MAPEO
// ============================================
const mapToTabla = (item: ParticipanteBackend): ParticipanteTabla => ({
  id: item.id,
  nombreCompleto: `${item.name} ${item.lastname}`,
  dni: item.dni || "-",
  celular: item.phone || "",
  fechaNacimiento: item.birthday,
  edad: calcularEdad(item.birthday),
  taller: item.workshop?.name || "-",
  tallerId: item.workshop?.id || "",
});

// ============================================
// COLORES PARA TALLERES
// ============================================
const TALLER_PALETTE = [
  "#00897b", "#1e88e5", "#8e24aa", "#f4511e",
  "#3949ab", "#00acc1", "#43a047", "#fb8c00",
  "#e53935", "#6d4c41",
];

const tallerColorCache = new Map<string, string>();
let paletteIndex = 0;

const getTallerColor = (tallerId: string): string => {
  if (!tallerId) return "#64748b";
  if (!tallerColorCache.has(tallerId)) {
    tallerColorCache.set(tallerId, TALLER_PALETTE[paletteIndex % TALLER_PALETTE.length]);
    paletteIndex++;
  }
  return tallerColorCache.get(tallerId)!;
};

// ============================================
// COMPONENTE DE DETALLE
// ============================================
function DetalleParticipante({
  participante,
  isLoading,
  onClose,
}: {
  participante: ParticipanteBackend | null;
  isLoading: boolean;
  onClose: () => void;
}) {
  const edad = participante ? calcularEdad(participante.birthday) : null;
  const tallerColor = participante?.workshop ? getTallerColor(participante.workshop.id) : "#64748b";

  return (
    <>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: MODULE_COLOR,
          color: "white",
          py: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <PersonSearch />
          <Typography variant="h6" fontWeight={600}>
            Datos del Participante
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {isLoading || !participante ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress sx={{ color: MODULE_COLOR }} />
          </Box>
        ) : (
          <Box>
            {/* Header de identidad */}
            <Box
              sx={{
                textAlign: "center",
                mb: 3,
                p: 2,
                bgcolor: `${MODULE_COLOR}10`,
                borderRadius: 2,
                border: `1px solid ${MODULE_COLOR}30`,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: MODULE_COLOR,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <Typography variant="h5" color="white" fontWeight={700}>
                  {participante.name.charAt(0)}
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {`${participante.name} ${participante.lastname}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                DNI · {participante.dni}
              </Typography>
            </Box>

            {/* Identificación */}
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={MODULE_COLOR}
              sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <Badge fontSize="small" />
              Identificación
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Nombres
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {participante.name}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Apellidos
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {participante.lastname}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  N° de Documento (DNI)
                </Typography>
                <Typography variant="body2" fontWeight={500} fontFamily="monospace">
                  {participante.dni}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            {/* Contacto y Nacimiento */}
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={MODULE_COLOR}
              sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <Phone fontSize="small" />
              Contacto y Nacimiento
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Celular
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearTelefono(participante.phone)}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Fecha de Nacimiento
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearFecha(participante.birthday)}
                </Typography>
              </Grid>
              {edad !== null && (
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Edad
                  </Typography>
                  <Chip
                    label={`${edad} años`}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: MODULE_COLOR, color: MODULE_COLOR }}
                  />
                </Grid>
              )}
            </Grid>

            <Divider sx={{ mb: 2 }} />

            {/* Taller */}
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={MODULE_COLOR}
              sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <EmojiEvents fontSize="small" />
              Taller
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Taller Asignado
                </Typography>
                {participante.workshop ? (
                  <Chip
                    label={participante.workshop.name}
                    size="small"
                    sx={{ backgroundColor: tallerColor, color: "white", fontWeight: 600 }}
                  />
                ) : (
                  <Typography variant="body2" fontWeight={500}>-</Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: MODULE_COLOR, color: MODULE_COLOR }}>
          Cerrar
        </Button>
      </DialogActions>
    </>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ParticipantesPage() {
  const { getData } = useFetch();

  // Datos
  const [rawData, setRawData] = useState<ParticipanteTabla[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const rawDataMap = useRef<Map<string, ParticipanteBackend>>(new Map());

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [fetchKey, setFetchKey] = useState(0);

  // Búsqueda con debounce
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filtros
  const [filtroTaller, setFiltroTaller] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("edad");
  const [edadRange, setEdadRange] = useState<number[]>([0, 110]);
  const [edadRangePending, setEdadRangePending] = useState<number[]>([0, 110]);
  const [filtroMes, setFiltroMes] = useState<number | "">("");
  const [filtroDia, setFiltroDia] = useState("");
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  // Detalle
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detalleParticipante, setDetalleParticipante] = useState<ParticipanteBackend | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);

  // Debounce búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch datos
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page + 1));
      params.set("limit", String(rowsPerPage));

      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }
      if (filtroTaller) {
        params.set("workshop", filtroTaller);
      }
      if (edadRange[0] > 0 || edadRange[1] < 110) {
        params.set("age_min", String(edadRange[0]));
        params.set("age_max", String(edadRange[1]));
      }
      if (filtroMes && filtroDia) {
        const mm = String(filtroMes).padStart(2, "0");
        const dd = String(filtroDia).padStart(2, "0");
        params.set("birthday", `${mm}-${dd}`);
      } else if (filtroMes) {
        params.set("month", String(filtroMes));
      }

      const response = await getData<BackendResponse>(
        `recreation/participant?${params.toString()}`
      );

      if (response?.data) {
        const items = response.data.data.map((item) => {
          rawDataMap.current.set(item.id, item);
          return mapToTabla(item);
        });
        setRawData(items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error cargando participantes:", error);
      setRawData([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, fetchKey, debouncedSearch, filtroTaller, filtroMes, filtroDia, edadRange, getData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dataFormateados = useFormatTableData(rawData);
  const filteredData = dataFormateados;

  // Exportar
  const handleExport = () => {
    const fechaISO = new Date().toISOString().slice(0, 10);
    const exportData = filteredData.map((r: ParticipanteTabla) => ({
      "Nombre Completo": r.nombreCompleto,
      DNI: r.dni,
      Celular: formatearTelefono(r.celular),
      "F. Nacimiento": formatearFecha(r.fechaNacimiento),
      Edad: r.edad,
      Taller: r.taller,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 6 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, ws, "Participantes");
    XLSX.writeFile(wb, `participantes_${fechaISO}.xlsx`);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setFiltroTaller("");
    setEdadRange([0, 110]);
    setEdadRangePending([0, 110]);
    setFiltroMes("");
    setFiltroDia("");
    setPage(0);
    setFetchKey((k) => k + 1);
  };

  // Abrir detalle
  const handleVerDetalle = async (row: ParticipanteTabla) => {
    setDetalleParticipante(null);
    setDetalleLoading(true);
    setDetalleOpen(true);
    try {
      const res = await getData<BackendDetalleResponse>(
        `recreation/participant/${row.id}`
      );
      if (res?.data) {
        setDetalleParticipante(res.data);
      }
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setDetalleLoading(false);
    }
  };

  const filterOpen = Boolean(filterAnchor);
  const isEdadFiltered = edadRange[0] > 0 || edadRange[1] < 110;
  const hayFiltrosActivos = searchTerm || filtroDia || filtroMes || isEdadFiltered || filtroTaller;

  return (
    <Box>
      {/* ── Header ── */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${MODULE_COLOR}15 0%, ${MODULE_COLOR}30 100%)`,
              color: MODULE_COLOR,
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              boxShadow: `0 4px 12px ${MODULE_COLOR}25`,
            }}
          >
            <Groups sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: MODULE_COLOR }}>
            Participantes
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 7.5 }}>
          Listado de participantes del módulo de Cultura y Deporte
        </Typography>
      </Box>

      {/* ── Tarjeta principal ── */}
      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* ── Barra de búsqueda y filtros ── */}
          <Box mb={2} display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
            {/* Búsqueda */}
            <TextField
              size="small"
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#64748b", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: 280,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                  "&:hover fieldset": { borderColor: "#64748b" },
                  "&.Mui-focused fieldset": { borderColor: "#475569" },
                },
              }}
            />

            {/* Filtro por taller */}
            <TextField
              select
              size="small"
              label="Taller"
              value={filtroTaller}
              onChange={(e) => { setFiltroTaller(e.target.value); setPage(0); setFetchKey((k) => k + 1); }}
              sx={{
                minWidth: 180,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                },
              }}
            >
              <MenuItem value="">Todos los talleres</MenuItem>
              {TALLERES.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: getTallerColor(t.id) }} />
                    {t.name}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Filtros avanzados */}
            <Tooltip title="Filtros de edad y cumpleaños">
              <IconButton
                onClick={(e) => setFilterAnchor(e.currentTarget)}
                sx={{
                  backgroundColor: filterOpen || isEdadFiltered || filtroDia || filtroMes ? "#e0f7f7" : "#f8fafc",
                  border: `1px solid ${filterOpen || isEdadFiltered || filtroDia || filtroMes ? MODULE_COLOR : "#e2e8f0"}`,
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#e0f7f7", borderColor: MODULE_COLOR },
                }}
              >
                <FilterList sx={{ color: filterOpen || isEdadFiltered || filtroDia || filtroMes ? MODULE_COLOR : "#64748b", fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Chips de filtros activos */}
            {isEdadFiltered && (
              <Box sx={{ backgroundColor: "#dbeafe", borderRadius: "16px", px: 1.5, py: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="caption" color="#1e40af">
                  Edad: {edadRange[0]} - {edadRange[1]} años
                </Typography>
                <IconButton size="small" onClick={() => { setEdadRange([0, 110]); setEdadRangePending([0, 110]); setPage(0); setFetchKey((k) => k + 1); }} sx={{ p: 0.25 }}>
                  <Close sx={{ fontSize: 14, color: "#1e40af" }} />
                </IconButton>
              </Box>
            )}
            {(filtroDia || filtroMes) && (
              <Box sx={{ backgroundColor: "#e0f7f7", borderRadius: "16px", px: 1.5, py: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                <Cake sx={{ fontSize: 14, color: MODULE_COLOR }} />
                <Typography variant="caption" color={MODULE_COLOR}>
                  {filtroMes && !filtroDia && MESES.find((m) => m.value === filtroMes)?.label}
                  {filtroDia && filtroMes && `${filtroDia}/${filtroMes}`}
                  {filtroDia && !filtroMes && `Día ${filtroDia}`}
                </Typography>
                <IconButton size="small" onClick={() => { setFiltroDia(""); setFiltroMes(""); setPage(0); setFetchKey((k) => k + 1); }} sx={{ p: 0.25 }}>
                  <Close sx={{ fontSize: 14, color: MODULE_COLOR }} />
                </IconButton>
              </Box>
            )}

            <Box sx={{ flex: 1 }} />

            {hayFiltrosActivos && (
              <Tooltip title="Limpiar filtros">
                <IconButton onClick={limpiarFiltros} size="small" sx={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                  <Clear sx={{ color: "#64748b", fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Actualizar */}
            <Tooltip title="Actualizar datos">
              <IconButton
                onClick={() => { setPage(0); setFetchKey((k) => k + 1); }}
                sx={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#e2e8f0" },
                }}
              >
                <Refresh sx={{ color: "#64748b", fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Exportar Excel */}
            <Tooltip title="Descargar listado en formato Excel">
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownload />}
                  onClick={handleExport}
                  disabled={isLoading || filteredData.length === 0}
                  sx={{
                    borderColor: "#22c55e",
                    color: "#16a34a",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "#dcfce7", borderColor: "#16a34a" },
                    "&.Mui-disabled": { opacity: 0.4 },
                  }}
                >
                  Exportar Excel
                </Button>
              </span>
            </Tooltip>

            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
              {isLoading ? "Cargando..." : `${totalCount.toLocaleString()} participante(s)`}
            </Typography>
          </Box>

        {/* Popover filtros avanzados */}
        <Popover
          open={filterOpen}
          anchorEl={filterAnchor}
          onClose={() => setFilterAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          sx={{ mt: 1 }}
        >
          <Box sx={{ p: 2.5, width: 320 }}>
            <Typography variant="subtitle2" fontWeight={600} color="#334155" mb={1.5}>
              Tipo de filtro
            </Typography>
            <ToggleButtonGroup
              value={filterType}
              exclusive
              onChange={(_e, v) => { if (v !== null) setFilterType(v); }}
              size="small"
              fullWidth
              sx={{ mb: 2.5 }}
            >
              <ToggleButton
                value="edad"
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  "&.Mui-selected": { backgroundColor: "#dbeafe", color: "#1e40af", "&:hover": { backgroundColor: "#bfdbfe" } },
                }}
              >
                Edad
              </ToggleButton>
              <ToggleButton
                value="cumpleanos"
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  "&.Mui-selected": { backgroundColor: "#e0f7f7", color: MODULE_COLOR, "&:hover": { backgroundColor: "#b2ebf2" } },
                }}
              >
                Cumpleaños
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider sx={{ mb: 2 }} />

            {filterType === "edad" && (
              <>
                <Typography variant="body2" color="#475569" mb={1.5}>
                  Rango de edad
                </Typography>
                <Slider
                  value={edadRangePending}
                  onChange={(_e, v) => setEdadRangePending(v as number[])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={110}
                  sx={{ color: "#3b82f6", "& .MuiSlider-thumb": { backgroundColor: "#1e40af" } }}
                />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="caption" color="text.secondary">{edadRangePending[0]} años</Typography>
                  <Typography variant="caption" color="text.secondary">{edadRangePending[1]} años</Typography>
                </Box>
              </>
            )}

            {filterType === "cumpleanos" && (
              <>
                <Typography variant="body2" color="#475569" mb={1.5}>
                  Filtrar por cumpleaños
                </Typography>
                <TextField
                  select
                  size="small"
                  label="Mes"
                  fullWidth
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value as number | "")}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">Todos los meses</MenuItem>
                  {MESES.map((m) => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  label="Día (opcional)"
                  type="number"
                  fullWidth
                  value={filtroDia}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || (parseInt(v) >= 1 && parseInt(v) <= 31)) setFiltroDia(v);
                  }}
                  slotProps={{ htmlInput: { min: 1, max: 31 } }}
                  helperText="Selecciona un día específico (opcional)"
                />
              </>
            )}

            <Box display="flex" justifyContent="flex-end" mt={2.5} gap={1}>
              <Button
                size="small"
                onClick={() => { setEdadRange([0, 110]); setEdadRangePending([0, 110]); setFiltroDia(""); setFiltroMes(""); setPage(0); setFetchKey((k) => k + 1); }}
                sx={{ color: "#64748b", textTransform: "none" }}
              >
                Limpiar todo
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => { setEdadRange(edadRangePending); setPage(0); setFetchKey((k) => k + 1); setFilterAnchor(null); }}
                sx={{ backgroundColor: MODULE_COLOR, textTransform: "none", "&:hover": { backgroundColor: subgerencia.colorHover } }}
              >
                Aplicar
              </Button>
            </Box>
          </Box>
        </Popover>

        {/* Chips resumen filtros activos */}
        {hayFiltrosActivos && (
          <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Filtros activos:
            </Typography>
            {filtroTaller && (
              <Chip
                size="small"
                label={TALLERES.find((t) => t.id === filtroTaller)?.name}
                onDelete={() => { setFiltroTaller(""); setPage(0); setFetchKey((k) => k + 1); }}
                sx={{ backgroundColor: getTallerColor(filtroTaller), color: "white" }}
              />
            )}
            {filtroMes && (
              <Chip
                size="small"
                label={`Mes: ${MESES.find((m) => m.value === filtroMes)?.label}`}
                onDelete={() => { setFiltroMes(""); setPage(0); setFetchKey((k) => k + 1); }}
                icon={<Cake sx={{ color: "white !important", fontSize: 16 }} />}
                sx={{ backgroundColor: MODULE_COLOR, color: "white" }}
              />
            )}
            {filtroDia && (
              <Chip
                size="small"
                label={`Día: ${filtroDia}`}
                onDelete={() => { setFiltroDia(""); setPage(0); setFetchKey((k) => k + 1); }}
                sx={{ backgroundColor: MODULE_COLOR, color: "white" }}
              />
            )}
            {searchTerm && (
              <Chip size="small" label={`Búsqueda: "${searchTerm}"`} onDelete={() => setSearchTerm("")} />
            )}
          </Box>
        )}

          {/* ── Tabla ── */}
          <Paper
            sx={{
              borderRadius: "12px",
              boxShadow: "none",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              mt: 2,
            }}
          >
        {isLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} gap={2}>
            <CircularProgress sx={{ color: MODULE_COLOR }} />
            <Typography variant="body2" color="text.secondary">
              Cargando participantes...
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {["#", "Nombre Completo", "DNI", "Taller", "Celular", "Edad / Nacimiento", ""].map(
                      (col, i) => (
                        <TableCell
                          key={i}
                          align={i === 0 || i === 6 ? "center" : "left"}
                          sx={{
                            backgroundColor: MODULE_COLOR,
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            whiteSpace: "nowrap",
                            py: 1.5,
                          }}
                        >
                          {col}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                          <PersonSearch sx={{ fontSize: 40, color: "text.disabled" }} />
                          <Typography color="text.secondary">
                            {debouncedSearch || hayFiltrosActivos
                              ? "No se encontraron participantes con los filtros aplicados"
                              : "No hay participantes registrados"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row: ParticipanteTabla, index: number) => {
                      const tallerColor = getTallerColor(row.tallerId);
                      return (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{
                            backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                            "&:hover": { backgroundColor: `${MODULE_COLOR}10`, cursor: "pointer" },
                            transition: "background-color 0.15s",
                          }}
                          onClick={() => handleVerDetalle(row)}
                        >
                          {/* # */}
                          <TableCell align="center" sx={{ color: "text.disabled", fontSize: "0.75rem", width: 48 }}>
                            {page * rowsPerPage + index + 1}
                          </TableCell>

                          {/* Nombre */}
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              {row.nombreCompleto}
                            </Typography>
                          </TableCell>

                          {/* DNI */}
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {row.dni}
                            </Typography>
                          </TableCell>

                          {/* Taller */}
                          <TableCell>
                            {row.taller !== "-" ? (
                              <Chip
                                size="small"
                                label={row.taller}
                                sx={{
                                  backgroundColor: tallerColor,
                                  color: "white",
                                  fontWeight: 600,
                                  fontSize: "0.7rem",
                                  height: 24,
                                  maxWidth: 180,
                                  "& .MuiChip-label": {
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  },
                                }}
                                title={row.taller}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>

                          {/* Celular */}
                          <TableCell>
                            <Typography variant="body2">
                              {formatearTelefono(row.celular)}
                            </Typography>
                          </TableCell>

                          {/* Edad / Nacimiento */}
                          <TableCell>
                            {row.fechaNacimiento ? (
                              <Box display="flex" flexDirection="column" gap={0.25}>
                                <Chip
                                  label={`${row.edad} años`}
                                  size="small"
                                  sx={{
                                    backgroundColor: "#dbeafe",
                                    color: "#1e40af",
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    height: 22,
                                    width: "fit-content",
                                  }}
                                />
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Cake sx={{ fontSize: 12, color: MODULE_COLOR }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {formatearFecha(row.fechaNacimiento)}
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>

                          {/* Acciones */}
                          <TableCell align="center" sx={{ width: 56 }}>
                            <Tooltip title="Ver detalle">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerDetalle(row);
                                }}
                                sx={{ color: MODULE_COLOR }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} de ${count !== -1 ? count.toLocaleString() : `más de ${to}`}`
              }
              sx={{
                borderTop: "1px solid #e2e8f0",
                mt: 2,
                "& .MuiTablePagination-select": { fontWeight: 500 },
                "& .MuiTablePagination-selectIcon": { color: "#64748b" },
              }}
            />
          </>
        )}
          </Paper>
        </CardContent>
      </Card>

      {/* ── Modal de Detalle ── */}
      <Dialog open={detalleOpen} onClose={() => setDetalleOpen(false)} maxWidth="sm" fullWidth>
        <DetalleParticipante
          participante={detalleParticipante}
          isLoading={detalleLoading}
          onClose={() => setDetalleOpen(false)}
        />
      </Dialog>
    </Box>
  );
}
