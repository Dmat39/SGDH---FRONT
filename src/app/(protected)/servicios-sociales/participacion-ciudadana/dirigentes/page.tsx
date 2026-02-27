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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Popover,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
} from "@mui/material";
import {
  FileDownload,
  Refresh,
  Search,
  Clear,
  Close,
  Visibility,
  Badge,
  Phone,
  CalendarMonth,
  PersonSearch,
  People,
  LocationOn,
  Cake,
  FilterList,
  PhoneEnabled,
  PhoneDisabled,
} from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";
import * as XLSX from "xlsx";

const subgerencia = SUBGERENCIAS[SubgerenciaType.SERVICIOS_SOCIALES];
const MODULE_COLOR = subgerencia.color; // #00a3a8

// ============================================
// MESES
// ============================================
const MESES = [
  { value: 1,  label: "Enero" },
  { value: 2,  label: "Febrero" },
  { value: 3,  label: "Marzo" },
  { value: 4,  label: "Abril" },
  { value: 5,  label: "Mayo" },
  { value: 6,  label: "Junio" },
  { value: 7,  label: "Julio" },
  { value: 8,  label: "Agosto" },
  { value: 9,  label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

type FilterType = "edad" | "cumpleanos" | "telefono";

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
interface DirigenteBackend {
  id: string;
  name: string;
  lastname: string;
  dni: string;
  phone: string | null;
  birthday: string | null;
  pueblo: string | null;
  charges_id: string | null;
  comunne_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface BackendResponse {
  message: string;
  data: {
    data: DirigenteBackend[];
    totalCount: number;
    currentPage: number;
    pageCount: number;
    totalPages: number;
  };
}

interface BackendDetalleResponse {
  message: string;
  data: DirigenteBackend;
}

// ============================================
// INTERFACE FRONTEND (tabla)
// ============================================
interface DirigenteTabla {
  id: string;
  nombreCompleto: string;
  dni: string;
  celular: string;
  fechaNacimiento: string;
  edad: number;
  pueblo: string;
}

// ============================================
// MAPEO
// ============================================
const mapToTabla = (item: DirigenteBackend): DirigenteTabla => ({
  id: item.id,
  nombreCompleto: `${item.name.trim()} ${item.lastname.trim()}`,
  dni: item.dni || "-",
  celular: item.phone || "",
  fechaNacimiento: item.birthday || "",
  edad: calcularEdad(item.birthday),
  pueblo: item.pueblo?.trim() || "-",
});

// ============================================
// COMPONENTE DE DETALLE
// ============================================
function DetalleDigirente({
  dirigente,
  isLoading,
  onClose,
}: {
  dirigente: DirigenteBackend | null;
  isLoading: boolean;
  onClose: () => void;
}) {
  const edad = dirigente ? calcularEdad(dirigente.birthday) : null;

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
            Datos del Dirigente
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {isLoading || !dirigente ? (
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
                  {dirigente.name.trim().charAt(0)}
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {`${dirigente.name.trim()} ${dirigente.lastname.trim()}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                DNI · {dirigente.dni}
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
                  {dirigente.name.trim()}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Apellidos
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {dirigente.lastname.trim()}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  N° de Documento (DNI)
                </Typography>
                <Typography variant="body2" fontWeight={500} fontFamily="monospace">
                  {dirigente.dni}
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
                  {formatearTelefono(dirigente.phone)}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Fecha de Nacimiento
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearFecha(dirigente.birthday)}
                </Typography>
              </Grid>
              {edad !== null && dirigente.birthday && (
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

            {/* Ubicación */}
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={MODULE_COLOR}
              sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <LocationOn fontSize="small" />
              Ubicación
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Pueblo / Asentamiento
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {dirigente.pueblo?.trim() || "-"}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2, mt: 2 }} />

            {/* Registro */}
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={MODULE_COLOR}
              sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <CalendarMonth fontSize="small" />
              Registro
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Fecha de Registro
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearFecha(dirigente.created_at)}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Última Actualización
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearFecha(dirigente.updated_at)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderColor: MODULE_COLOR, color: MODULE_COLOR }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function DirigentesPage() {
  const { getData } = useFetch();

  // Datos
  const [rawData, setRawData] = useState<DirigenteTabla[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const rawDataMap = useRef<Map<string, DirigenteBackend>>(new Map());

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [fetchKey, setFetchKey] = useState(0);

  // Búsqueda con debounce
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filtros avanzados
  const [filterType, setFilterType] = useState<FilterType>("edad");
  const [edadRange, setEdadRange] = useState<number[]>([0, 110]);
  const [edadRangePending, setEdadRangePending] = useState<number[]>([0, 110]);
  const [filtroMes, setFiltroMes] = useState<number | "">("");
  const [filtroDia, setFiltroDia] = useState("");
  const [filtroTelefono, setFiltroTelefono] = useState<"" | "con" | "sin">("");
  const [filtroTelefonoDraft, setFiltroTelefonoDraft] = useState<"" | "con" | "sin">("");
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  // Detalle
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detalleDigirente, setDetalleDigirente] = useState<DirigenteBackend | null>(null);
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
      if (filtroTelefono === "con") {
        params.set("phone", "true");
      } else if (filtroTelefono === "sin") {
        params.set("phone", "false");
      }

      const response = await getData<BackendResponse>(
        `participation/neighbors?${params.toString()}`
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
      console.error("Error cargando dirigentes:", error);
      setRawData([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, fetchKey, debouncedSearch, edadRange, filtroMes, filtroDia, filtroTelefono, getData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dataFormateados = useFormatTableData(rawData);

  const [isExporting, setIsExporting] = useState(false);

  // Exportar a Excel
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const fechaISO = new Date().toISOString().slice(0, 10);
      const params = new URLSearchParams();
      params.set("limit", "99999");
      params.set("page", "1");
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
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
      const response = await getData<BackendResponse>(`participation/neighbors?${params.toString()}`);
      if (!response?.data) return;
      const exportData = response.data.data.map((item: DirigenteBackend) => ({
        "Nombre Completo": `${item.name.trim()} ${item.lastname.trim()}`,
        DNI: item.dni || "-",
        Celular: formatearTelefono(item.phone),
        "F. Nacimiento": formatearFecha(item.birthday),
        Edad: calcularEdad(item.birthday),
        Pueblo: item.pueblo?.trim() || "-",
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = [
        { wch: 30 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 6 },
        { wch: 40 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, "Dirigentes");
      XLSX.writeFile(wb, `dirigentes_participacion_${fechaISO}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setEdadRange([0, 110]);
    setEdadRangePending([0, 110]);
    setFiltroMes("");
    setFiltroDia("");
    setFiltroTelefono("");
    setFiltroTelefonoDraft("");
    setPage(0);
    setFetchKey((k) => k + 1);
  };

  // Abrir detalle
  const handleVerDetalle = async (row: DirigenteTabla) => {
    const cached = rawDataMap.current.get(row.id);
    if (cached) {
      setDetalleDigirente(cached);
      setDetalleLoading(false);
      setDetalleOpen(true);
      return;
    }
    setDetalleDigirente(null);
    setDetalleLoading(true);
    setDetalleOpen(true);
    try {
      const res = await getData<BackendDetalleResponse>(
        `participation/neighbors/${row.id}`
      );
      if (res?.data) {
        setDetalleDigirente(res.data);
      }
    } catch (error) {
      console.error("Error cargando detalle del dirigente:", error);
    } finally {
      setDetalleLoading(false);
    }
  };

  const filterOpen = Boolean(filterAnchor);
  const isEdadFiltered = edadRange[0] > 0 || edadRange[1] < 110;
  const hayFiltrosActivos = searchTerm || filtroDia || filtroMes || isEdadFiltered || filtroTelefono;

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
            <People sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: MODULE_COLOR }}>
            Dirigentes
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 7.5 }}>
          Listado de dirigentes registrados en el módulo de Participación Vecinal
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
          {/* ── Barra de búsqueda y acciones ── */}
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
                  "&.Mui-focused fieldset": { borderColor: MODULE_COLOR },
                },
              }}
            />

            {/* Filtros avanzados */}
            <Tooltip title="Filtros de edad y cumpleaños">
              <IconButton
                onClick={(e) => setFilterAnchor(e.currentTarget)}
                sx={{
                  backgroundColor:
                    filterOpen || isEdadFiltered || filtroDia || filtroMes || filtroTelefono
                      ? "#e0f7f7"
                      : "#f8fafc",
                  border: `1px solid ${
                    filterOpen || isEdadFiltered || filtroDia || filtroMes || filtroTelefono
                      ? MODULE_COLOR
                      : "#e2e8f0"
                  }`,
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#e0f7f7", borderColor: MODULE_COLOR },
                }}
              >
                <FilterList
                  sx={{
                    color:
                      filterOpen || isEdadFiltered || filtroDia || filtroMes || filtroTelefono
                        ? MODULE_COLOR
                        : "#64748b",
                    fontSize: 20,
                  }}
                />
              </IconButton>
            </Tooltip>

            {/* Chips de filtros activos (edad / cumpleaños) */}
            {isEdadFiltered && (
              <Box
                sx={{
                  backgroundColor: "#dbeafe",
                  borderRadius: "16px",
                  px: 1.5,
                  py: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Typography variant="caption" color="#1e40af">
                  Edad: {edadRange[0]} - {edadRange[1]} años
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setEdadRange([0, 110]);
                    setEdadRangePending([0, 110]);
                    setPage(0);
                    setFetchKey((k) => k + 1);
                  }}
                  sx={{ p: 0.25 }}
                >
                  <Close sx={{ fontSize: 14, color: "#1e40af" }} />
                </IconButton>
              </Box>
            )}
            {(filtroDia || filtroMes) && (
              <Box
                sx={{
                  backgroundColor: "#e0f7f7",
                  borderRadius: "16px",
                  px: 1.5,
                  py: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Cake sx={{ fontSize: 14, color: MODULE_COLOR }} />
                <Typography variant="caption" color={MODULE_COLOR}>
                  {filtroMes && !filtroDia && MESES.find((m) => m.value === filtroMes)?.label}
                  {filtroDia && filtroMes && `${filtroDia}/${filtroMes}`}
                  {filtroDia && !filtroMes && `Día ${filtroDia}`}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setFiltroDia("");
                    setFiltroMes("");
                    setPage(0);
                    setFetchKey((k) => k + 1);
                  }}
                  sx={{ p: 0.25 }}
                >
                  <Close sx={{ fontSize: 14, color: MODULE_COLOR }} />
                </IconButton>
              </Box>
            )}

            <Box sx={{ flex: 1 }} />

            {hayFiltrosActivos && (
              <Tooltip title="Limpiar todos los filtros">
                <IconButton
                  onClick={limpiarFiltros}
                  size="small"
                  sx={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                >
                  <Clear sx={{ color: "#64748b", fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Actualizar */}
            <Tooltip title="Actualizar datos">
              <IconButton
                onClick={() => {
                  setPage(0);
                  setFetchKey((k) => k + 1);
                }}
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
                  disabled={isLoading || isExporting || dataFormateados.length === 0}
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
              {isLoading ? "Cargando..." : `${totalCount.toLocaleString()} dirigente(s)`}
            </Typography>
          </Box>

          {/* ── Popover filtros avanzados ── */}
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
                    "&.Mui-selected": {
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      "&:hover": { backgroundColor: "#bfdbfe" },
                    },
                  }}
                >
                  Edad
                </ToggleButton>
                <ToggleButton
                  value="cumpleanos"
                  sx={{
                    textTransform: "none",
                    fontSize: "0.75rem",
                    "&.Mui-selected": {
                      backgroundColor: "#e0f7f7",
                      color: MODULE_COLOR,
                      "&:hover": { backgroundColor: "#b2ebf2" },
                    },
                  }}
                >
                  Cumpleaños
                </ToggleButton>
                <ToggleButton
                  value="telefono"
                  sx={{
                    textTransform: "none",
                    fontSize: "0.75rem",
                    "&.Mui-selected": {
                      backgroundColor: "#dcfce7",
                      color: "#16a34a",
                      "&:hover": { backgroundColor: "#bbf7d0" },
                    },
                  }}
                >
                  Teléfono
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
                    sx={{
                      color: "#3b82f6",
                      "& .MuiSlider-thumb": { backgroundColor: "#1e40af" },
                    }}
                  />
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      {edadRangePending[0]} años
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {edadRangePending[1]} años
                    </Typography>
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
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
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
                      if (v === "" || (parseInt(v) >= 1 && parseInt(v) <= 31))
                        setFiltroDia(v);
                    }}
                    slotProps={{ htmlInput: { min: 1, max: 31 } }}
                    helperText="Selecciona un día específico (opcional)"
                  />
                </>
              )}

              {filterType === "telefono" && (
                <>
                  <Typography variant="body2" color="#475569" mb={1.5}>
                    Filtrar por celular registrado
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant={filtroTelefonoDraft === "con" ? "contained" : "outlined"}
                      startIcon={<PhoneEnabled fontSize="small" />}
                      onClick={() => setFiltroTelefonoDraft(filtroTelefonoDraft === "con" ? "" : "con")}
                      sx={{
                        flex: 1,
                        textTransform: "none",
                        borderColor: "#16a34a",
                        color: filtroTelefonoDraft === "con" ? "white" : "#16a34a",
                        backgroundColor: filtroTelefonoDraft === "con" ? "#16a34a" : "transparent",
                        "&:hover": { backgroundColor: filtroTelefonoDraft === "con" ? "#15803d" : "#dcfce7" },
                      }}
                    >
                      Con celular
                    </Button>
                    <Button
                      size="small"
                      variant={filtroTelefonoDraft === "sin" ? "contained" : "outlined"}
                      startIcon={<PhoneDisabled fontSize="small" />}
                      onClick={() => setFiltroTelefonoDraft(filtroTelefonoDraft === "sin" ? "" : "sin")}
                      sx={{
                        flex: 1,
                        textTransform: "none",
                        borderColor: "#dc2626",
                        color: filtroTelefonoDraft === "sin" ? "white" : "#dc2626",
                        backgroundColor: filtroTelefonoDraft === "sin" ? "#dc2626" : "transparent",
                        "&:hover": { backgroundColor: filtroTelefonoDraft === "sin" ? "#b91c1c" : "#fee2e2" },
                      }}
                    >
                      Sin celular
                    </Button>
                  </Box>
                </>
              )}

              <Box display="flex" justifyContent="flex-end" mt={2.5} gap={1}>
                <Button
                  size="small"
                  onClick={() => {
                    setEdadRange([0, 110]);
                    setEdadRangePending([0, 110]);
                    setFiltroDia("");
                    setFiltroMes("");
                    setPage(0);
                    setFetchKey((k) => k + 1);
                  }}
                  sx={{ color: "#64748b", textTransform: "none" }}
                >
                  Limpiar todo
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    setEdadRange(edadRangePending);
                    setFiltroTelefono(filtroTelefonoDraft);
                    setPage(0);
                    setFetchKey((k) => k + 1);
                    setFilterAnchor(null);
                  }}
                  sx={{
                    backgroundColor: MODULE_COLOR,
                    textTransform: "none",
                    "&:hover": { backgroundColor: subgerencia.colorHover },
                  }}
                >
                  Aplicar
                </Button>
              </Box>
            </Box>
          </Popover>

          {/* ── Chips resumen filtros activos ── */}
          {hayFiltrosActivos && (
            <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Filtros activos:
              </Typography>
              {isEdadFiltered && (
                <Chip
                  size="small"
                  label={`Edad: ${edadRange[0]}-${edadRange[1]} años`}
                  onDelete={() => {
                    setEdadRange([0, 110]);
                    setEdadRangePending([0, 110]);
                    setPage(0);
                    setFetchKey((k) => k + 1);
                  }}
                  sx={{ backgroundColor: "#dbeafe", color: "#1e40af" }}
                />
              )}
              {filtroMes && (
                <Chip
                  size="small"
                  label={`Mes: ${MESES.find((m) => m.value === filtroMes)?.label}`}
                  onDelete={() => {
                    setFiltroMes("");
                    setPage(0);
                    setFetchKey((k) => k + 1);
                  }}
                  icon={<Cake sx={{ color: "white !important", fontSize: 16 }} />}
                  sx={{ backgroundColor: MODULE_COLOR, color: "white" }}
                />
              )}
              {filtroDia && (
                <Chip
                  size="small"
                  label={`Día: ${filtroDia}`}
                  onDelete={() => {
                    setFiltroDia("");
                    setPage(0);
                    setFetchKey((k) => k + 1);
                  }}
                  sx={{ backgroundColor: MODULE_COLOR, color: "white" }}
                />
              )}
              {filtroTelefono && (
                <Chip
                  size="small"
                  label={filtroTelefono === "con" ? "Con celular" : "Sin celular"}
                  icon={filtroTelefono === "con" ? <PhoneEnabled sx={{ fontSize: 14, color: "white !important" }} /> : <PhoneDisabled sx={{ fontSize: 14, color: "white !important" }} />}
                  onDelete={() => { setFiltroTelefono(""); setFiltroTelefonoDraft(""); setPage(0); setFetchKey((k) => k + 1); }}
                  sx={{ backgroundColor: filtroTelefono === "con" ? "#16a34a" : "#dc2626", color: "white" }}
                />
              )}
              {searchTerm && (
                <Chip
                  size="small"
                  label={`Búsqueda: "${searchTerm}"`}
                  onDelete={() => setSearchTerm("")}
                />
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
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={8}
                gap={2}
              >
                <CircularProgress sx={{ color: MODULE_COLOR }} />
                <Typography variant="body2" color="text.secondary">
                  Cargando dirigentes...
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        {[
                          "#",
                          "Nombre Completo",
                          "DNI",
                          "Celular",
                          "Edad / Nacimiento",
                          "Pueblo",
                          "",
                        ].map((col, i) => (
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
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {dataFormateados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              gap={1}
                            >
                              <PersonSearch sx={{ fontSize: 40, color: "text.disabled" }} />
                              <Typography color="text.secondary">
                                {debouncedSearch || hayFiltrosActivos
                                  ? "No se encontraron dirigentes con los filtros aplicados"
                                  : "No hay dirigentes registrados"}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        dataFormateados.map((row: DirigenteTabla, index: number) => (
                          <TableRow
                            key={row.id}
                            hover
                            sx={{
                              backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                              "&:hover": {
                                backgroundColor: `${MODULE_COLOR}10`,
                                cursor: "pointer",
                              },
                              transition: "background-color 0.15s",
                            }}
                            onClick={() => handleVerDetalle(row)}
                          >
                            {/* # */}
                            <TableCell
                              align="center"
                              sx={{ color: "text.disabled", fontSize: "0.75rem", width: 48 }}
                            >
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
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>

                            {/* Pueblo */}
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 220,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={row.pueblo}
                              >
                                {row.pueblo}
                              </Typography>
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
                        ))
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
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}–${to} de ${count !== -1 ? count.toLocaleString() : `más de ${to}`}`
                  }
                  sx={{
                    borderTop: "1px solid #e2e8f0",
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
      <Dialog
        open={detalleOpen}
        onClose={() => setDetalleOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DetalleDigirente
          dirigente={detalleDigirente}
          isLoading={detalleLoading}
          onClose={() => setDetalleOpen(false)}
        />
      </Dialog>
    </Box>
  );
}
