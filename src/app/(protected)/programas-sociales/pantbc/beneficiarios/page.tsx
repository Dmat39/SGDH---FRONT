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
  LocalHospital,
  Person,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";

const PANTBC_COLOR = "#d81b7e";

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

const TRADUCCIONES: Record<string, Record<string, string>> = {
  sex: {
    MALE: "Masculino",
    FEMALE: "Femenino",
  },
  patient_type: {
    NEW: "Nuevo",
    RELAPSE: "Recaída",
    TREATMENT_AFTER_FAILURE: "Fracaso de Tto.",
    TREATMENT_AFTER_LOSS: "Abandono recuperado",
    OTHER: "Otro",
  },
};

const traducir = (categoria: string, valor: string | null | undefined): string => {
  if (!valor) return "-";
  return TRADUCCIONES[categoria]?.[valor] || valor;
};

// ============================================
// INTERFACES BACKEND
// ============================================
interface CensusEntity {
  id: string;
  name: string;
}

interface PacienteListaBackend {
  id: string;
  doc_num: string;
  name: string;
  lastname: string;
  phone: string;
  start_at: string;
  birthday: string;
  doc_type: string;
  patient_type: string;
  sector: string | null;
  sex: string;
  census: CensusEntity | null;
}

interface BackendListaResponse {
  message: string;
  data: {
    data: PacienteListaBackend[];
    currentPage: number;
    pageCount: number;
    totalCount: number;
    totalPages: number;
  };
}

interface BackendDetalleResponse {
  message: string;
  data: PacienteListaBackend;
}

// Interface para la tabla
interface PacienteTabla {
  id: string;
  nombreCompleto: string;
  tipoDoc: string;
  numDoc: string;
  sexo: string;
  edad: number;
  fechaNacimiento: string;
  tipoPaciente: string;
  establecimiento: string;
  celular: string;
  fechaInicio: string;
  sector: string;
}

// ============================================
// MAPEO BACKEND -> FRONTEND (TABLA)
// ============================================
const mapListaToTabla = (item: PacienteListaBackend): PacienteTabla => ({
  id: item.id,
  nombreCompleto: `${item.name} ${item.lastname}`,
  tipoDoc: item.doc_type || "DNI",
  numDoc: item.doc_num || "-",
  sexo: traducir("sex", item.sex),
  edad: calcularEdad(item.birthday),
  fechaNacimiento: item.birthday,
  tipoPaciente: traducir("patient_type", item.patient_type),
  establecimiento: item.census?.name || "-",
  celular: item.phone || "-",
  fechaInicio: item.start_at,
  sector: item.sector || "-",
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

const SEXO_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
  Masculino: { bg: "#e3f2fd", color: "#1565c0" },
  Femenino: { bg: "#fce4ec", color: "#c2185b" },
};

const TIPO_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
  Nuevo: { bg: "#fce4ec", color: "#880e4f" },
  "Recaída": { bg: "#fff3e0", color: "#e65100" },
  "Fracaso de Tto.": { bg: "#ffebee", color: "#c62828" },
  "Abandono recuperado": { bg: "#e8f5e9", color: "#2e7d32" },
  Otro: { bg: "#f3e5f5", color: "#7b1fa2" },
};

// ============================================
// COMPONENTE DE DETALLE
// ============================================
interface DetalleProps {
  paciente: PacienteListaBackend | null;
  loading: boolean;
}

function DetalleContent({ paciente, loading }: DetalleProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={40} sx={{ color: PANTBC_COLOR }} />
      </Box>
    );
  }

  if (!paciente) {
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

  const edad = calcularEdad(paciente.birthday);
  const tipoPaciente = traducir("patient_type", paciente.patient_type);
  const tipoColors = TIPO_CHIP_COLORS[tipoPaciente] || { bg: "#f5f5f5", color: "#757575" };
  const sexoLabel = traducir("sex", paciente.sex);
  const sexoColors = SEXO_CHIP_COLORS[sexoLabel] || { bg: "#f5f5f5", color: "#757575" };

  return (
    <Box>
      {/* Encabezado del paciente */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PANTBC_COLOR}10 0%, ${PANTBC_COLOR}20 100%)`,
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
            background: `linear-gradient(135deg, ${PANTBC_COLOR}20 0%, ${PANTBC_COLOR}40 100%)`,
            color: PANTBC_COLOR,
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
            {paciente.name} {paciente.lastname}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {paciente.doc_type} · {paciente.doc_num} · {edad} años
          </Typography>
          <Box display="flex" gap={1} mt={0.5}>
            <Chip
              label={sexoLabel}
              size="small"
              sx={{ backgroundColor: sexoColors.bg, color: sexoColors.color, fontWeight: 600, fontSize: "0.7rem" }}
            />
            <Chip
              label={tipoPaciente}
              size="small"
              sx={{ backgroundColor: tipoColors.bg, color: tipoColors.color, fontWeight: 600, fontSize: "0.7rem" }}
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
          {renderCampo("Nombre", paciente.name)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Apellidos", paciente.lastname)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Tipo de Documento", paciente.doc_type)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Número de Documento", paciente.doc_num)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Fecha de Nacimiento", `${formatearFecha(paciente.birthday)} (${edad} años)`)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Sexo", traducir("sex", paciente.sex))}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Celular", paciente.phone)}
        </Grid>

        {/* Datos del programa */}
        <Grid size={12}>
          <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom sx={{ mt: 2 }}>
            Datos del Programa
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" display="block">
              Tipo de Paciente
            </Typography>
            <Chip
              label={tipoPaciente}
              size="small"
              sx={{ mt: 0.5, backgroundColor: tipoColors.bg, color: tipoColors.color, fontWeight: 600 }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Fecha de Inicio", formatearFecha(paciente.start_at))}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Sector", paciente.sector)}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {renderCampo("Establecimiento", paciente.census?.name)}
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function PANTBCBeneficiariosPage() {
  const { getData } = useFetch();

  const [data, setData] = useState<PacienteTabla[]>([]);
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
  const [detalleData, setDetalleData] = useState<PacienteListaBackend | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);

  // Mapa de datos originales para detalle rápido
  const [rawDataMap, setRawDataMap] = useState<Record<string, PacienteListaBackend>>({});

  // Debounce de búsqueda (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar lista de pacientes
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

        // Filtro de edad (server-side)
        if (edadRange[0] > 0 || edadRange[1] < 120) {
          params.set("age_min", String(edadRange[0]));
          params.set("age_max", String(edadRange[1]));
        }

        // Filtro de cumpleaños/mes (server-side)
        if (cumpleanosModo === "mes" && mesSeleccionado !== null) {
          params.set("month", String(mesSeleccionado + 1));
        } else if (cumpleanosModo === "dia" && diaCumpleanos) {
          const parts = diaCumpleanos.split("-");
          params.set("birthday", `${parts[1]}-${parts[2]}`);
        }

        const response = await getData<BackendListaResponse>(
          `pantbc/patient?${params.toString()}`
        );

        if (response?.data) {
          const rawList = response.data.data;
          setData(rawList.map(mapListaToTabla));
          setTotalCount(response.data.totalCount);
          // Guardar datos originales para detalle rápido
          const map: Record<string, PacienteListaBackend> = {};
          rawList.forEach((p) => { map[p.id] = p; });
          setRawDataMap((prev) => ({ ...prev, ...map }));
        }
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
        setData([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, fetchKey, debouncedSearch, getData]);

  // Cargar detalle de un paciente
  const fetchDetalle = useCallback(
    async (id: string) => {
      // Usar datos ya cargados si están disponibles
      if (rawDataMap[id]) {
        setDetalleData(rawDataMap[id]);
        setDetalleLoading(false);
        return;
      }
      setDetalleLoading(true);
      try {
        const response = await getData<BackendDetalleResponse>(`pantbc/patient/${id}`);
        if (response?.data) {
          setDetalleData(response.data);
        }
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
    if (selectedId && detailOpen) {
      fetchDetalle(selectedId);
    }
  }, [selectedId, detailOpen, fetchDetalle]);

  // Handlers de filtros
  const handleFilterClick = (e: React.MouseEvent<HTMLButtonElement>) =>
    setFilterAnchor(e.currentTarget);
  const handleFilterClose = () => setFilterAnchor(null);
  const handleFilterTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    v: FilterType | null
  ) => {
    if (v !== null) setFilterType(v);
  };
  const handleEdadChange = (_: Event, v: number | number[]) =>
    setEdadRange(v as number[]);
  const handleMesToggle = (mes: number) => {
    setMesSeleccionado((prev) => (prev === mes ? null : mes));
  };
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
    const exportData = filteredData.map((p: PacienteTabla) => ({
      "Nombre Completo": p.nombreCompleto,
      "Tipo Doc": p.tipoDoc,
      "N° Documento": p.numDoc,
      "Sexo": p.sexo,
      "Edad": p.edad,
      "Fecha Nacimiento": formatearFecha(p.fechaNacimiento),
      "Tipo Paciente": p.tipoPaciente,
      "Establecimiento": p.establecimiento,
      "Celular": p.celular,
      "Fecha Inicio": formatearFecha(p.fechaInicio),
      "Sector": p.sector,
    }));
    if (exportData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pacientes PANTBC");
    worksheet["!cols"] = Object.keys(exportData[0] || {}).map(() => ({ wch: 20 }));
    XLSX.writeFile(
      workbook,
      `pacientes_pantbc_${new Date().toISOString().split("T")[0]}.xlsx`
    );
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
              background: `linear-gradient(135deg, ${PANTBC_COLOR}15 0%, ${PANTBC_COLOR}30 100%)`,
              color: PANTBC_COLOR,
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              boxShadow: `0 4px 12px ${PANTBC_COLOR}25`,
            }}
          >
            <LocalHospital sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: PANTBC_COLOR }}>
            PANTBC - Pacientes
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 7.5 }}>
          Listado de pacientes registrados en el Programa de Alimentación y Nutrición para TBC
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
                placeholder="Buscar por nombre, documento, celular..."
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
                    onClick={() => {
                      setEdadRange([0, 120]);
                      setPage(0);
                      setFetchKey((k) => k + 1);
                    }}
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
                    onClick={() => {
                      setMesSeleccionado(null);
                      setDiaCumpleanos("");
                      setPage(0);
                      setFetchKey((k) => k + 1);
                    }}
                    sx={{ p: 0.25 }}
                  >
                    <Close sx={{ fontSize: 14, color: "#880e4f" }} />
                  </IconButton>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                {totalCount.toLocaleString()} paciente(s)
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
                    Cumple
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
                        color: PANTBC_COLOR,
                        "& .MuiSlider-thumb": { backgroundColor: "#880e4f" },
                        "& .MuiSlider-track": { backgroundColor: PANTBC_COLOR },
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
                      Cumpleaños del paciente
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
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 0.75,
                          }}
                        >
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
                                borderColor:
                                  mesSeleccionado === index ? "#880e4f" : "#e2e8f0",
                                backgroundColor:
                                  mesSeleccionado === index ? "#880e4f" : "transparent",
                                color:
                                  mesSeleccionado === index ? "white" : "#64748b",
                                "&:hover": {
                                  backgroundColor:
                                    mesSeleccionado === index ? "#6a0036" : "#fce4ec",
                                  borderColor: "#880e4f",
                                },
                              }}
                            >
                              {mes.slice(0, 3)}
                            </Button>
                          ))}
                        </Box>
                        {mesSeleccionado !== null && (
                          <Typography
                            variant="caption"
                            color="#880e4f"
                            sx={{ mt: 1, display: "block" }}
                          >
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
                    onClick={() => {
                      setPage(0);
                      setFetchKey((k) => k + 1);
                      handleFilterClose();
                    }}
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
              sx={{
                borderRadius: "12px",
                boxShadow: "none",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>
                      Nombre Completo
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Doc.</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>
                      Sexo
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>
                      Edad
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>
                      Tipo Paciente
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>
                      Establecimiento
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Celular</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>
                      Fecha Inicio
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={32} sx={{ color: PANTBC_COLOR }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Cargando pacientes...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron pacientes
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row: PacienteTabla, index: number) => {
                      const sexoColors =
                        SEXO_CHIP_COLORS[row.sexo] || { bg: "#f5f5f5", color: "#757575" };
                      const tipoColors =
                        TIPO_CHIP_COLORS[row.tipoPaciente] || {
                          bg: "#f5f5f5",
                          color: "#757575",
                        };
                      return (
                        <TableRow
                          key={row.id}
                          onClick={() => handleRowClick(row.id)}
                          sx={{
                            backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                            "&:hover": {
                              backgroundColor: "#f1f5f9",
                              cursor: "pointer",
                            },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.nombreCompleto}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                              {row.tipoDoc}
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {row.numDoc}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={row.sexo}
                              size="small"
                              sx={{
                                backgroundColor: sexoColors.bg,
                                color: sexoColors.color,
                                fontWeight: 600,
                                fontSize: "0.7rem",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              gap={0.3}
                            >
                              <Chip
                                label={`${row.edad} años`}
                                size="small"
                                sx={{
                                  backgroundColor: "#fce4ec",
                                  color: "#880e4f",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: "0.65rem" }}
                              >
                                {formatearFecha(row.fechaNacimiento)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.tipoPaciente}
                              size="small"
                              sx={{
                                backgroundColor: tipoColors.bg,
                                color: tipoColors.color,
                                fontWeight: 600,
                                fontSize: "0.7rem",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                              {row.establecimiento}
                            </Typography>
                          </TableCell>
                          <TableCell>{row.celular}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                              {formatearFecha(row.fechaInicio)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(row.id);
                                }}
                                sx={{
                                  color: "#64748b",
                                  "&:hover": { backgroundColor: "#f1f5f9" },
                                }}
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
            <LocalHospital sx={{ color: PANTBC_COLOR }} />
            <Typography variant="h6" fontWeight={600} color="#334155">
              Ficha del Paciente
            </Typography>
          </Box>
          <IconButton onClick={handleDetailClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DetalleContent paciente={detalleData} loading={detalleLoading} />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={handleDetailClose}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
