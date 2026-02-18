"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  Popover,
  Slider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Search,
  FilterList,
  FileDownload,
  Close,
  Visibility,
  Cake,
  LocalDrink,
  Person,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";

const PVL_COLOR = "#d81b7e";

// ============================================
// UTILIDADES
// ============================================
const calcularEdad = (fechaNacimiento: string | null | undefined): number => {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getUTCFullYear();
  const mes = hoy.getMonth() - nacimiento.getUTCMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getUTCDate())) {
    edad--;
  }
  return edad;
};

const formatearFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return "-";
  const date = new Date(fecha);
  const dia = date.getUTCDate().toString().padStart(2, "0");
  const mes = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const anio = date.getUTCFullYear();
  return `${dia}/${mes}/${anio}`;
};

// ============================================
// INTERFACES BACKEND
// ============================================
interface BeneficiarioListaBackend {
  id: string;
  committee: string;
  doc_num: string;
  lastname: string;
  name: string;
  phone: string | null;
  priority: number;
  birthday: string;
  doc_type: string;
}

interface BackendListaResponse {
  message: string;
  data: {
    data: BeneficiarioListaBackend[];
    currentPage: number;
    pageCount: number;
    totalCount: number;
    totalPages: number;
  };
}

// Interface para la tabla
interface BeneficiarioTabla {
  id: string;
  nombreCompleto: string;
  tipoDoc: string;
  numDoc: string;
  edad: number;
  fechaNacimiento: string;
  prioridad: number;
  comite: string;
  celular: string;
}

// ============================================
// MAPEO BACKEND -> FRONTEND
// ============================================
const mapListaToTabla = (item: BeneficiarioListaBackend): BeneficiarioTabla => ({
  id: item.id,
  nombreCompleto: `${item.name} ${item.lastname}`,
  tipoDoc: item.doc_type || "DNI",
  numDoc: item.doc_num || "-",
  edad: calcularEdad(item.birthday),
  fechaNacimiento: item.birthday,
  prioridad: item.priority,
  comite: item.committee || "-",
  celular: item.phone || "-",
});

// ============================================
// CONSTANTES
// ============================================
type FilterType = "edad" | "cumpleanos";
type CumpleanosModo = "mes" | "dia";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const PRIORIDAD_CONFIG: Record<number, { label: string; bg: string; color: string }> = {
  1: { label: "1° Prioridad", bg: "#ffebee", color: "#c62828" },
  2: { label: "2° Prioridad", bg: "#fff3e0", color: "#e65100" },
  3: { label: "3° Prioridad", bg: "#fffde7", color: "#f57f17" },
};

// ============================================
// COMPONENTE DE DETALLE
// ============================================
interface DetalleProps {
  beneficiario: BeneficiarioListaBackend | null;
  loading: boolean;
}

function DetalleContent({ beneficiario, loading }: DetalleProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={40} sx={{ color: PVL_COLOR }} />
      </Box>
    );
  }

  if (!beneficiario) {
    return (
      <Typography color="text.secondary" textAlign="center" py={4}>
        No se pudo cargar la información
      </Typography>
    );
  }

  const renderCampo = (label: string, valor: React.ReactNode) => (
    <Box mb={2}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {valor || "-"}
      </Typography>
    </Box>
  );

  const edad = calcularEdad(beneficiario.birthday);
  const prioridadCfg = PRIORIDAD_CONFIG[beneficiario.priority] || {
    label: `Prioridad ${beneficiario.priority}`,
    bg: "#f5f5f5",
    color: "#757575",
  };

  return (
    <Box>
      {/* Encabezado del beneficiario */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PVL_COLOR}10 0%, ${PVL_COLOR}20 100%)`,
          borderRadius: "12px",
          p: 2.5,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${PVL_COLOR}20 0%, ${PVL_COLOR}40 100%)`,
            color: PVL_COLOR,
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            flexShrink: 0,
          }}
        >
          <Person sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} color="#1e293b">
            {beneficiario.name} {beneficiario.lastname}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {beneficiario.doc_type} · {beneficiario.doc_num} · {edad} años
          </Typography>
          <Box display="flex" gap={1} mt={0.5}>
            <Chip
              label={prioridadCfg.label}
              size="small"
              sx={{
                backgroundColor: prioridadCfg.bg,
                color: prioridadCfg.color,
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Datos personales */}
        <Grid size={12}>
          <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom>
            Datos Personales
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Nombre", beneficiario.name)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Apellidos", beneficiario.lastname)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Tipo de Documento", beneficiario.doc_type)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Número de Documento", beneficiario.doc_num)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo(
            "Fecha de Nacimiento",
            `${formatearFecha(beneficiario.birthday)} (${edad} años)`
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Celular", beneficiario.phone)}
        </Grid>

        {/* Datos del programa */}
        <Grid size={12}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="#475569"
            gutterBottom
            sx={{ mt: 2 }}
          >
            Datos del Programa
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" display="block">
              Prioridad
            </Typography>
            <Chip
              label={prioridadCfg.label}
              size="small"
              sx={{
                mt: 0.5,
                backgroundColor: prioridadCfg.bg,
                color: prioridadCfg.color,
                fontWeight: 600,
              }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
          {renderCampo("Comité", beneficiario.committee)}
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function PVLBeneficiariosPage() {
  const { getData } = useFetch();

  const [data, setData] = useState<BeneficiarioTabla[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Paginación server-side
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fetchKey, setFetchKey] = useState(0);

  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("edad");
  const [edadRange, setEdadRange] = useState<number[]>([0, 120]);
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [cumpleanosModo, setCumpleanosModo] = useState<CumpleanosModo>("mes");
  const [diaCumpleanos, setDiaCumpleanos] = useState<string>("");
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  // Detalle
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detalleData, setDetalleData] = useState<BeneficiarioListaBackend | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);

  // Mapa de datos originales para detalle rápido
  const [rawDataMap, setRawDataMap] = useState<Record<string, BeneficiarioListaBackend>>({});

  // Debounce de búsqueda (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar lista de beneficiarios
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page + 1));
        params.set("limit", String(rowsPerPage));

        if (debouncedSearch.trim()) {
          params.set("search", debouncedSearch.trim());
        }

        if (edadRange[0] > 0 || edadRange[1] < 120) {
          params.set("age_min", String(edadRange[0]));
          params.set("age_max", String(edadRange[1]));
        }

        if (cumpleanosModo === "mes" && mesSeleccionado !== null) {
          params.set("month", String(mesSeleccionado + 1));
        } else if (cumpleanosModo === "dia" && diaCumpleanos) {
          const parts = diaCumpleanos.split("-");
          params.set("birthday", `${parts[1]}-${parts[2]}`);
        }

        const response = await getData<BackendListaResponse>(
          `pvl/dependent?${params.toString()}`
        );

        if (response?.data) {
          const rawList = response.data.data;
          setData(rawList.map(mapListaToTabla));
          setTotalCount(response.data.totalCount);
          const map: Record<string, BeneficiarioListaBackend> = {};
          rawList.forEach((b) => { map[b.id] = b; });
          setRawDataMap((prev) => ({ ...prev, ...map }));
        }
      } catch (error) {
        console.error("Error al cargar beneficiarios:", error);
        setData([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, fetchKey, debouncedSearch, getData]);

  // Cargar detalle
  const fetchDetalle = useCallback(
    async (id: string) => {
      if (rawDataMap[id]) {
        setDetalleData(rawDataMap[id]);
        setDetalleLoading(false);
        return;
      }
      setDetalleLoading(true);
      try {
        const response = await getData<{ message: string; data: BeneficiarioListaBackend }>(
          `pvl/dependent/${id}`
        );
        if (response?.data) setDetalleData(response.data);
      } catch (error) {
        console.error("Error al cargar detalle:", error);
        setDetalleData(null);
      } finally {
        setDetalleLoading(false);
      }
    },
    [getData, rawDataMap]
  );

  useEffect(() => {
    if (selectedId && detailOpen) fetchDetalle(selectedId);
  }, [selectedId, detailOpen, fetchDetalle]);

  // Handlers
  const handleFilterClick = (e: React.MouseEvent<HTMLButtonElement>) =>
    setFilterAnchor(e.currentTarget);
  const handleFilterClose = () => setFilterAnchor(null);
  const handleFilterTypeChange = (_: React.MouseEvent<HTMLElement>, v: FilterType | null) => {
    if (v !== null) setFilterType(v);
  };
  const handleEdadChange = (_: Event, v: number | number[]) => setEdadRange(v as number[]);
  const handleMesToggle = (mes: number) =>
    setMesSeleccionado((prev) => (prev === mes ? null : mes));

  const filterOpen = Boolean(filterAnchor);
  const isEdadFiltered = edadRange[0] > 0 || edadRange[1] < 120;
  const isCumpleanosFiltered =
    cumpleanosModo === "mes" ? mesSeleccionado !== null : diaCumpleanos !== "";

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const handleRowClick = (id: string) => {
    setSelectedId(id);
    setDetalleData(null);
    setDetailOpen(true);
  };
  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedId(null);
    setDetalleData(null);
  };

  const dataFormateados = useFormatTableData(data);

  // La búsqueda es server-side; se usa dataFormateados directamente
  const filteredData = dataFormateados;

  // Exportar a Excel
  const handleExport = () => {
    const exportData = filteredData.map((b: BeneficiarioTabla) => ({
      "Nombre Completo": b.nombreCompleto,
      "Tipo Doc": b.tipoDoc,
      "N° Documento": b.numDoc,
      "Edad": b.edad,
      "Fecha Nacimiento": formatearFecha(b.fechaNacimiento),
      "Prioridad": b.prioridad,
      "Comité": b.comite,
      "Celular": b.celular,
    }));
    if (exportData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Beneficiarios PVL");
    worksheet["!cols"] = Object.keys(exportData[0] || {}).map(() => ({ wch: 22 }));
    XLSX.writeFile(workbook, `beneficiarios_pvl_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const limpiarFiltros = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setEdadRange([0, 120]);
    setMesSeleccionado(null);
    setCumpleanosModo("mes");
    setDiaCumpleanos("");
    setPage(0);
    setFetchKey((k) => k + 1);
  };

  return (
    <Box>
      {/* Encabezado */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${PVL_COLOR}15 0%, ${PVL_COLOR}30 100%)`,
              color: PVL_COLOR,
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              boxShadow: `0 4px 12px ${PVL_COLOR}25`,
            }}
          >
            <LocalDrink sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: PVL_COLOR }}>
            PVL - Beneficiarios
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 7.5 }}>
          Listado de beneficiarios del Programa de Vaso de Leche
        </Typography>
      </Box>

      {/* Tarjeta principal */}
      <Box sx={{ position: "relative" }}>
        <Card
          sx={{
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            position: "relative",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Buscador y Filtros */}
            <Box mb={3} display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
              <TextField
                placeholder="Buscar por nombre, documento, comité..."
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
                size="small"
                sx={{
                  width: 340,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    "&:hover fieldset": { borderColor: "#64748b" },
                    "&.Mui-focused fieldset": { borderColor: "#475569" },
                  },
                }}
              />
              <Tooltip title="Filtros avanzados">
                <IconButton
                  onClick={handleFilterClick}
                  sx={{
                    backgroundColor: filterOpen ? "#e2e8f0" : "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    "&:hover": { backgroundColor: "#e2e8f0" },
                  }}
                >
                  <FilterList sx={{ color: "#64748b", fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exportar a Excel">
                <IconButton
                  onClick={handleExport}
                  sx={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    "&:hover": { backgroundColor: "#dcfce7", borderColor: "#22c55e" },
                  }}
                >
                  <FileDownload sx={{ color: "#22c55e", fontSize: 20 }} />
                </IconButton>
              </Tooltip>

              {/* Chips de filtros activos */}
              {isEdadFiltered && (
                <Box
                  sx={{
                    backgroundColor: "#fce4ec",
                    borderRadius: "16px",
                    px: 1.5,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" color="#880e4f">
                    Edad: {edadRange[0]} - {edadRange[1]} años
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => { setEdadRange([0, 120]); setPage(0); setFetchKey((k) => k + 1); }}
                    sx={{ p: 0.25 }}
                  >
                    <Close sx={{ fontSize: 14, color: "#880e4f" }} />
                  </IconButton>
                </Box>
              )}
              {isCumpleanosFiltered && (
                <Box
                  sx={{
                    backgroundColor: "#fce4ec",
                    borderRadius: "16px",
                    px: 1.5,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Cake sx={{ fontSize: 14, color: "#880e4f" }} />
                  <Typography variant="caption" color="#880e4f">
                    {cumpleanosModo === "mes" && mesSeleccionado !== null
                      ? MESES[mesSeleccionado].slice(0, 3)
                      : diaCumpleanos.split("-").slice(1).reverse().join("/")}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => { setMesSeleccionado(null); setDiaCumpleanos(""); setPage(0); setFetchKey((k) => k + 1); }}
                    sx={{ p: 0.25 }}
                  >
                    <Close sx={{ fontSize: 14, color: "#880e4f" }} />
                  </IconButton>
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                {totalCount.toLocaleString()} beneficiario(s)
              </Typography>
            </Box>

            {/* Popover de filtros */}
            <Popover
              open={filterOpen}
              anchorEl={filterAnchor}
              onClose={handleFilterClose}
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
                  onChange={handleFilterTypeChange}
                  size="small"
                  fullWidth
                  sx={{ mb: 2.5 }}
                >
                  <ToggleButton
                    value="edad"
                    sx={{
                      textTransform: "none",
                      fontSize: "0.7rem",
                      "&.Mui-selected": {
                        backgroundColor: "#fce4ec",
                        color: "#880e4f",
                        "&:hover": { backgroundColor: "#f8bbd0" },
                      },
                    }}
                  >
                    Edad
                  </ToggleButton>
                  <ToggleButton
                    value="cumpleanos"
                    sx={{
                      textTransform: "none",
                      fontSize: "0.7rem",
                      "&.Mui-selected": {
                        backgroundColor: "#fce4ec",
                        color: "#880e4f",
                        "&:hover": { backgroundColor: "#f8bbd0" },
                      },
                    }}
                  >
                    Cumpleaños
                  </ToggleButton>
                </ToggleButtonGroup>

                <Divider sx={{ mb: 2 }} />

                {/* Filtro por edad */}
                {filterType === "edad" && (
                  <>
                    <Typography variant="body2" color="#475569" mb={1.5}>
                      Rango de edad
                    </Typography>
                    <Slider
                      value={edadRange}
                      onChange={handleEdadChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={120}
                      sx={{
                        color: PVL_COLOR,
                        "& .MuiSlider-thumb": { backgroundColor: "#880e4f" },
                        "& .MuiSlider-track": { backgroundColor: PVL_COLOR },
                      }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        {edadRange[0]} años
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {edadRange[1]} años
                      </Typography>
                    </Box>
                  </>
                )}

                {/* Filtro por cumpleaños */}
                {filterType === "cumpleanos" && (
                  <>
                    <Typography variant="body2" color="#475569" mb={1.5}>
                      Cumpleaños del beneficiario
                    </Typography>
                    <ToggleButtonGroup
                      value={cumpleanosModo}
                      exclusive
                      onChange={(_, v) => v && setCumpleanosModo(v)}
                      size="small"
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      <ToggleButton
                        value="mes"
                        sx={{
                          textTransform: "none",
                          fontSize: "0.75rem",
                          "&.Mui-selected": {
                            backgroundColor: "#fce4ec",
                            color: "#880e4f",
                            "&:hover": { backgroundColor: "#f8bbd0" },
                          },
                        }}
                      >
                        Por mes
                      </ToggleButton>
                      <ToggleButton
                        value="dia"
                        sx={{
                          textTransform: "none",
                          fontSize: "0.75rem",
                          "&.Mui-selected": {
                            backgroundColor: "#fce4ec",
                            color: "#880e4f",
                            "&:hover": { backgroundColor: "#f8bbd0" },
                          },
                        }}
                      >
                        Día específico
                      </ToggleButton>
                    </ToggleButtonGroup>

                    {cumpleanosModo === "mes" ? (
                      <>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.75 }}>
                          {MESES.map((mes, index) => (
                            <Button
                              key={mes}
                              size="small"
                              variant={mesSeleccionado === index ? "contained" : "outlined"}
                              onClick={() => handleMesToggle(index)}
                              sx={{
                                textTransform: "none",
                                fontSize: "0.7rem",
                                py: 0.5,
                                px: 1,
                                minWidth: 0,
                                borderColor: mesSeleccionado === index ? "#880e4f" : "#e2e8f0",
                                backgroundColor: mesSeleccionado === index ? "#880e4f" : "transparent",
                                color: mesSeleccionado === index ? "white" : "#64748b",
                                "&:hover": {
                                  backgroundColor: mesSeleccionado === index ? "#6a0036" : "#fce4ec",
                                  borderColor: "#880e4f",
                                },
                              }}
                            >
                              {mes.slice(0, 3)}
                            </Button>
                          ))}
                        </Box>
                        {mesSeleccionado !== null && (
                          <Typography variant="caption" color="#880e4f" sx={{ mt: 1, display: "block" }}>
                            Mes seleccionado: {MESES[mesSeleccionado]}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <TextField
                        type="date"
                        value={diaCumpleanos}
                        onChange={(e) => setDiaCumpleanos(e.target.value)}
                        fullWidth
                        size="small"
                        helperText="Filtra por día y mes de nacimiento"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "&.Mui-focused fieldset": { borderColor: "#880e4f" },
                          },
                        }}
                      />
                    )}
                  </>
                )}

                <Box display="flex" justifyContent="flex-end" mt={2.5} gap={1}>
                  <Button
                    size="small"
                    onClick={limpiarFiltros}
                    sx={{ color: "#64748b", textTransform: "none" }}
                  >
                    Limpiar todo
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => { setPage(0); setFetchKey((k) => k + 1); handleFilterClose(); }}
                    sx={{
                      backgroundColor: "#475569",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#334155" },
                    }}
                  >
                    Aplicar
                  </Button>
                </Box>
              </Box>
            </Popover>

            {/* Tabla */}
            <TableContainer
              component={Paper}
              sx={{ borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0", overflow: "hidden" }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Nombre Completo</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Doc.</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Edad</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Prioridad</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Comité</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Celular</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={32} sx={{ color: PVL_COLOR }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Cargando beneficiarios...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron beneficiarios
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row: BeneficiarioTabla, index: number) => {
                      const prioridadCfg = PRIORIDAD_CONFIG[row.prioridad] || {
                        label: `P${row.prioridad}`,
                        bg: "#f5f5f5",
                        color: "#757575",
                      };
                      return (
                        <TableRow
                          key={row.id}
                          onClick={() => handleRowClick(row.id)}
                          sx={{
                            backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                            "&:hover": { backgroundColor: "#f1f5f9", cursor: "pointer" },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{row.nombreCompleto}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                              {row.tipoDoc}
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {row.numDoc}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" flexDirection="column" alignItems="center" gap={0.3}>
                              <Chip
                                label={`${row.edad} años`}
                                size="small"
                                sx={{ backgroundColor: "#fce4ec", color: "#880e4f", fontWeight: 600, fontSize: "0.75rem" }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                                {formatearFecha(row.fechaNacimiento)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={prioridadCfg.label}
                              size="small"
                              sx={{
                                backgroundColor: prioridadCfg.bg,
                                color: prioridadCfg.color,
                                fontWeight: 600,
                                fontSize: "0.7rem",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.78rem", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                              title={row.comite}
                            >
                              {row.comite}
                            </Typography>
                          </TableCell>
                          <TableCell>{row.celular}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleRowClick(row.id); }}
                                sx={{ color: "#64748b", "&:hover": { backgroundColor: "#f1f5f9" } }}
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

            {/* Paginación */}
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              sx={{
                borderTop: "1px solid #e2e8f0",
                mt: 2,
                "& .MuiTablePagination-selectIcon": { color: "#64748b" },
              }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Dialog de detalles */}
      <Dialog
        open={detailOpen}
        onClose={handleDetailClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", maxHeight: "90vh" } }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <LocalDrink sx={{ color: PVL_COLOR }} />
            <Typography variant="h6" fontWeight={600} color="#334155">
              Ficha del Beneficiario
            </Typography>
          </Box>
          <IconButton onClick={handleDetailClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DetalleContent beneficiario={detalleData} loading={detalleLoading} />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={handleDetailClose} sx={{ textTransform: "none", color: "#64748b" }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
