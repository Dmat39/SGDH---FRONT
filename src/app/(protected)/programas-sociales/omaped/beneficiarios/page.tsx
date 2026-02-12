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
  Accessible,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];
const OMAPED_COLOR = subgerencia.color;

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

// Traducciones
const TRADUCCIONES: Record<string, Record<string, string>> = {
  degree: {
    MILD: "Leve",
    MODERATE: "Moderado",
    SEVERE: "Severo",
    VERY_SEVERE: "Muy Severo",
  },
};

const traducir = (categoria: string, valor: string | null | undefined): string => {
  if (!valor) return "-";
  return TRADUCCIONES[categoria]?.[valor] || valor;
};

// Colores para grado de discapacidad
const DEGREE_COLORS: Record<string, { bg: string; color: string }> = {
  Leve: { bg: "#fef9c3", color: "#854d0e" },
  Moderado: { bg: "#fed7aa", color: "#9a3412" },
  Severo: { bg: "#fecaca", color: "#991b1b" },
  "Muy Severo": { bg: "#e9d5ff", color: "#6b21a8" },
};

// Meses en español
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// ============================================
// INTERFACES BACKEND
// ============================================
interface BeneficiarioOMAPEDBackend {
  id: string;
  name: string;
  lastname: string;
  doc_num: string;
  doc_type: string | null;
  phone: string | null;
  address: string | null;
  birthday: string;
  certificate: string | null;
  diagnostic1: string | null;
  conadis: string | null;
  folio: string | null;
  degree: string | null;
}

// Interfaz completa del GET ONE (más campos que el listado)
interface BeneficiarioOMAPEDDetalle extends BeneficiarioOMAPEDBackend {
  diagnostic2: string | null;
  atention: string | null;
  cert_disc: string | null;
  beca: string | null;
  job_placement: boolean | null;
  entrepreneurship: string | null;
  therapy: string | null;
  therapy_schedule: string | null;
  reniec: string | null;
  reniec_shift: string | null;
  fair: string | null;
  conadis_date: string | null;
  conadis_procedure: string | null;
  conadis_validity: string | null;
  unnamed: string | null;
  contigo: string | null;
  pc1000: string | null;
  fad: string | null;
  census_taker: string | null;
  state: string | null;
  commune: string | null;
  wheelchair: boolean | null;
  registered_at: string | null;
  change_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

interface BackendResponse {
  message: string;
  data: {
    data: BeneficiarioOMAPEDBackend[];
    currentPage: number;
    pageCount: number;
    totalCount: number;
    totalPages: number;
  };
}

// ============================================
// INTERFACE FRONTEND
// ============================================
interface BeneficiarioTabla {
  id: string;
  docNum: string;
  docType: string;
  nombreCompleto: string;
  telefono: string;
  fechaNacimiento: string;
  edad: number;
  grado: string;
  diagnostico: string;
  certificado: string;
  conadis: string;
  folio: string;
  direccion: string;
}

// Interfaz detalle frontend
interface BeneficiarioDetalleView {
  id: string;
  nombreCompleto: string;
  docNum: string;
  docType: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  edad: number;
  grado: string;
  diagnostico1: string;
  diagnostico2: string;
  certificado: string;
  certDiscapacidad: string;
  conadis: string;
  conadisFecha: string;
  conadisTramite: string;
  conadisVigencia: string;
  folio: string;
  atencion: string;
  terapia: string;
  horarioTerapia: string;
  beca: string;
  insercionLaboral: string;
  emprendimiento: string;
  feria: string;
  reniec: string;
  turnoReniec: string;
  contigo: string;
  pc1000: string;
  fad: string;
  empadronador: string;
  estado: string;
  comuna: string;
  sillaDeRuedas: string;
  fechaRegistro: string;
  fechaCambio: string;
}

const mapDetalleToView = (item: BeneficiarioOMAPEDDetalle): BeneficiarioDetalleView => ({
  id: item.id,
  nombreCompleto: `${item.name} ${item.lastname}`.trim(),
  docNum: item.doc_num || "-",
  docType: item.doc_type || "DNI",
  telefono: item.phone || "-",
  direccion: item.address || "-",
  fechaNacimiento: item.birthday,
  edad: calcularEdad(item.birthday),
  grado: traducir("degree", item.degree),
  diagnostico1: item.diagnostic1 || "-",
  diagnostico2: item.diagnostic2 || "-",
  certificado: item.certificate || "-",
  certDiscapacidad: item.cert_disc || "-",
  conadis: item.conadis || "-",
  conadisFecha: item.conadis_date ? formatearFecha(item.conadis_date) : "-",
  conadisTramite: item.conadis_procedure || "-",
  conadisVigencia: item.conadis_validity || "-",
  folio: item.folio || "-",
  atencion: item.atention || "-",
  terapia: item.therapy || "-",
  horarioTerapia: item.therapy_schedule || "-",
  beca: item.beca || "-",
  insercionLaboral: item.job_placement === true ? "Sí" : item.job_placement === false ? "No" : "-",
  emprendimiento: item.entrepreneurship || "-",
  feria: item.fair || "-",
  reniec: item.reniec || "-",
  turnoReniec: item.reniec_shift || "-",
  contigo: item.contigo || "-",
  pc1000: item.pc1000 || "-",
  fad: item.fad || "-",
  empadronador: item.census_taker || "-",
  estado: item.state || "-",
  comuna: item.commune || "-",
  sillaDeRuedas: item.wheelchair === true ? "Sí" : item.wheelchair === false ? "No" : "-",
  fechaRegistro: item.registered_at ? formatearFecha(item.registered_at) : "-",
  fechaCambio: item.change_at ? formatearFecha(item.change_at) : "-",
});

const mapBackendToTabla = (item: BeneficiarioOMAPEDBackend): BeneficiarioTabla => ({
  id: item.id,
  docNum: item.doc_num || "-",
  docType: item.doc_type || "DNI",
  nombreCompleto: `${item.name} ${item.lastname}`.trim(),
  telefono: item.phone || "-",
  fechaNacimiento: item.birthday,
  edad: calcularEdad(item.birthday),
  grado: traducir("degree", item.degree),
  diagnostico: item.diagnostic1 || "-",
  certificado: item.certificate || "-",
  conadis: item.conadis || "-",
  folio: item.folio || "-",
  direccion: item.address || "-",
});

// Tipo de filtro
type FilterType = "edad" | "cumpleanos";
type CumpleanosModo = "mes" | "dia";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function OMAPEDBeneficiariosPage() {
  const { getData } = useFetch();

  // Estados para datos
  const [data, setData] = useState<BeneficiarioTabla[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Paginación server-side
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fetchKey, setFetchKey] = useState(0);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("edad");
  const [edadRange, setEdadRange] = useState<number[]>([0, 110]);
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [cumpleanosModo, setCumpleanosModo] = useState<CumpleanosModo>("mes");
  const [diaCumpleanos, setDiaCumpleanos] = useState<string>("");
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  // Estados para detalle
  const [detailData, setDetailData] = useState<BeneficiarioDetalleView | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Cargar datos con paginación y filtros server-side
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page + 1));
        params.set("limit", String(rowsPerPage));

        // Filtro de edad (server-side)
        if (edadRange[0] > 0 || edadRange[1] < 110) {
          params.set("age_min", String(edadRange[0]));
          params.set("age_max", String(edadRange[1]));
        }

        // Filtro de cumpleaños/mes (server-side)
        if (cumpleanosModo === "mes" && mesSeleccionado !== null) {
          params.set("month", String(mesSeleccionado + 1));
        } else if (cumpleanosModo === "dia" && diaCumpleanos) {
          const parts = diaCumpleanos.split("-"); // YYYY-MM-DD
          params.set("birthday", `${parts[1]}-${parts[2]}`);
        }

        const response = await getData<BackendResponse>(
          `omaped/disabled?${params.toString()}`
        );

        if (response?.data) {
          setData(response.data.data.map(mapBackendToTabla));
          setTotalCount(response.data.totalCount);
        }
      } catch (error) {
        console.error("Error fetching OMAPED beneficiarios:", error);
        setData([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, fetchKey, getData]);

  // Handlers de filtros
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchor(event.currentTarget);
  };
  const handleFilterClose = () => setFilterAnchor(null);
  const handleFilterTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilterType: FilterType | null
  ) => {
    if (newFilterType !== null) setFilterType(newFilterType);
  };
  const handleEdadChange = (_event: Event, newValue: number | number[]) => {
    setEdadRange(newValue as number[]);
  };
  const handleMesToggle = (mes: number) => {
    setMesSeleccionado((prev) => (prev === mes ? null : mes));
  };

  const filterOpen = Boolean(filterAnchor);
  const isEdadFiltered = edadRange[0] > 0 || edadRange[1] < 110;
  const isCumpleanosFiltered =
    cumpleanosModo === "mes" ? mesSeleccionado !== null : diaCumpleanos !== "";

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleRowClick = async (row: BeneficiarioTabla) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await getData<{ message: string; data: BeneficiarioOMAPEDDetalle }>(
        `omaped/disabled/${row.id}`
      );
      if (response?.data) {
        setDetailData(mapDetalleToView(response.data));
      } else {
        setDetailData(null);
      }
    } catch (error) {
      console.error("Error fetching detalle OMAPED:", error);
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };
  const handleDetailClose = () => {
    setDetailOpen(false);
    setDetailData(null);
  };

  // Formatear strings del backend (Title Case)
  const dataFormateados = useFormatTableData(data);

  // Filtrado client-side (solo búsqueda - edad/cumpleaños se filtran en el servidor)
  const filteredData = dataFormateados.filter((row: BeneficiarioTabla) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      row.nombreCompleto.toLowerCase().includes(term) ||
      row.docNum.includes(searchTerm) ||
      row.telefono.includes(searchTerm)
    );
  });

  // Exportar a Excel
  const handleExport = () => {
    const exportData = filteredData.map((row: BeneficiarioTabla) => ({
      "Nombre Completo": row.nombreCompleto,
      "Tipo Doc": row.docType,
      "Nro. Doc": row.docNum,
      Teléfono: row.telefono,
      "Fecha de Nacimiento": formatearFecha(row.fechaNacimiento),
      Edad: row.edad,
      Grado: row.grado,
      Diagnóstico: row.diagnostico,
      Certificado: row.certificado,
      CONADIS: row.conadis,
      Folio: row.folio,
      Dirección: row.direccion,
    }));

    if (exportData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "OMAPED Beneficiarios");
    worksheet["!cols"] = Object.keys(exportData[0] || {}).map(() => ({ wch: 20 }));
    XLSX.writeFile(
      workbook,
      `omaped_beneficiarios_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setEdadRange([0, 110]);
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
              background: `linear-gradient(135deg, ${OMAPED_COLOR}15 0%, ${OMAPED_COLOR}30 100%)`,
              color: OMAPED_COLOR,
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              boxShadow: `0 4px 12px ${OMAPED_COLOR}25`,
            }}
          >
            <Accessible sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: OMAPED_COLOR }}>
            OMAPED - Beneficiarios
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 7.5 }}>
          Listado de personas con discapacidad registradas en OMAPED
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
                placeholder="Buscar por nombre, DNI o teléfono..."
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
                  width: 320,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    "&:hover fieldset": { borderColor: "#64748b" },
                    "&.Mui-focused fieldset": { borderColor: OMAPED_COLOR },
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
                <Box sx={{ backgroundColor: "#f3e5f5", borderRadius: "16px", px: 1.5, py: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="caption" color="#7b1fa2">
                    Edad: {edadRange[0]} - {edadRange[1]} años
                  </Typography>
                  <IconButton size="small" onClick={() => { setEdadRange([0, 110]); setPage(0); setFetchKey((k) => k + 1); }} sx={{ p: 0.25 }}>
                    <Close sx={{ fontSize: 14, color: "#7b1fa2" }} />
                  </IconButton>
                </Box>
              )}
              {isCumpleanosFiltered && (
                <Box sx={{ backgroundColor: "#fce7f3", borderRadius: "16px", px: 1.5, py: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Cake sx={{ fontSize: 14, color: "#be185d" }} />
                  <Typography variant="caption" color="#be185d">
                    {cumpleanosModo === "mes" && mesSeleccionado !== null
                      ? MESES[mesSeleccionado].slice(0, 3)
                      : diaCumpleanos.split("-").slice(1).reverse().join("/")}
                  </Typography>
                  <IconButton size="small" onClick={() => { setMesSeleccionado(null); setDiaCumpleanos(""); setPage(0); setFetchKey((k) => k + 1); }} sx={{ p: 0.25 }}>
                    <Close sx={{ fontSize: 14, color: "#be185d" }} />
                  </IconButton>
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                {totalCount.toLocaleString()} beneficiario(s)
              </Typography>
            </Box>

            {/* Popover de filtros (igual al diseño de CIAM) */}
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
                  <ToggleButton value="edad" sx={{ textTransform: "none", fontSize: "0.7rem", "&.Mui-selected": { backgroundColor: "#f3e5f5", color: "#7b1fa2", "&:hover": { backgroundColor: "#e1bee7" } } }}>
                    Edad
                  </ToggleButton>
                  <ToggleButton value="cumpleanos" sx={{ textTransform: "none", fontSize: "0.7rem", "&.Mui-selected": { backgroundColor: "#fce7f3", color: "#be185d", "&:hover": { backgroundColor: "#fbcfe8" } } }}>
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
                      max={110}
                      sx={{
                        color: OMAPED_COLOR,
                        "& .MuiSlider-thumb": { backgroundColor: OMAPED_COLOR },
                        "& .MuiSlider-track": { backgroundColor: OMAPED_COLOR },
                      }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">{edadRange[0]} años</Typography>
                      <Typography variant="caption" color="text.secondary">{edadRange[1]} años</Typography>
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
                      <ToggleButton value="mes" sx={{ textTransform: "none", fontSize: "0.75rem", "&.Mui-selected": { backgroundColor: "#fce7f3", color: "#be185d", "&:hover": { backgroundColor: "#fbcfe8" } } }}>
                        Por mes
                      </ToggleButton>
                      <ToggleButton value="dia" sx={{ textTransform: "none", fontSize: "0.75rem", "&.Mui-selected": { backgroundColor: "#fce7f3", color: "#be185d", "&:hover": { backgroundColor: "#fbcfe8" } } }}>
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
                                borderColor: mesSeleccionado === index ? "#be185d" : "#e2e8f0",
                                backgroundColor: mesSeleccionado === index ? "#be185d" : "transparent",
                                color: mesSeleccionado === index ? "white" : "#64748b",
                                "&:hover": {
                                  backgroundColor: mesSeleccionado === index ? "#9d174d" : "#fce7f3",
                                  borderColor: "#be185d",
                                },
                              }}
                            >
                              {mes.slice(0, 3)}
                            </Button>
                          ))}
                        </Box>
                        {mesSeleccionado !== null && (
                          <Typography variant="caption" color="#be185d" sx={{ mt: 1, display: "block" }}>
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
                            "&.Mui-focused fieldset": { borderColor: "#be185d" },
                          },
                        }}
                      />
                    )}
                  </>
                )}

                <Box display="flex" justifyContent="flex-end" mt={2.5} gap={1}>
                  <Button size="small" onClick={limpiarFiltros} sx={{ color: "#64748b", textTransform: "none" }}>
                    Limpiar todo
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => { setPage(0); setFetchKey((k) => k + 1); handleFilterClose(); }}
                    sx={{ backgroundColor: OMAPED_COLOR, textTransform: "none", "&:hover": { backgroundColor: "#b01668" } }}
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
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>DNI</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Teléfono</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Edad</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Grado</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Diagnóstico</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>CONADIS</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={32} sx={{ color: OMAPED_COLOR }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Cargando beneficiarios...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron beneficiarios
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row: BeneficiarioTabla, index: number) => {
                      const gradeColors = DEGREE_COLORS[row.grado] || { bg: "#f1f5f9", color: "#475569" };
                      return (
                        <TableRow
                          key={row.id}
                          onClick={() => handleRowClick(row)}
                          sx={{
                            backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                            "&:hover": { backgroundColor: "#f1f5f9", cursor: "pointer" },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{row.nombreCompleto}</TableCell>
                          <TableCell>{row.docNum}</TableCell>
                          <TableCell>{row.telefono}</TableCell>
                          <TableCell align="center">
                            <Box display="flex" flexDirection="column" alignItems="center" gap={0.3}>
                              <Chip label={`${row.edad} años`} size="small" sx={{ backgroundColor: "#f3e5f5", color: "#7b1fa2", fontWeight: 600, fontSize: "0.75rem" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                                {formatearFecha(row.fechaNacimiento)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {row.grado !== "-" ? (
                              <Chip label={row.grado} size="small" sx={{ backgroundColor: gradeColors.bg, color: gradeColors.color, fontWeight: 600, fontSize: "0.7rem" }} />
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {row.diagnostico}
                          </TableCell>
                          <TableCell>{row.conadis}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}
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
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Accessible sx={{ color: OMAPED_COLOR }} />
            <Typography variant="h6" fontWeight={600} color="#334155">
              Detalle del Beneficiario
            </Typography>
          </Box>
          <IconButton onClick={handleDetailClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, mt: 1 }}>
          {detailLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <CircularProgress size={32} sx={{ color: OMAPED_COLOR }} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                Cargando detalle...
              </Typography>
            </Box>
          ) : detailData && (
            <Grid container spacing={2}>
              {/* Datos Personales */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color={OMAPED_COLOR} gutterBottom>
                  Datos Personales
                </Typography>
                <Divider sx={{ mb: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Nombre Completo</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.nombreCompleto}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Tipo de Documento</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.docType}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Nro. Documento</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.docNum}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Fecha de Nacimiento</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearFecha(detailData.fechaNacimiento)}{" "}
                  <span style={{ color: "#64748b", fontWeight: 400 }}>({detailData.edad} años)</span>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.telefono}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Estado</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.estado}</Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="caption" color="text.secondary">Dirección</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.direccion}</Typography>
              </Grid>

              {/* Información de Discapacidad */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color={OMAPED_COLOR} gutterBottom sx={{ mt: 2 }}>
                  Información de Discapacidad
                </Typography>
                <Divider sx={{ mb: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Grado</Typography>
                <Box mt={0.5}>
                  {detailData.grado !== "-" ? (
                    <Chip
                      label={detailData.grado}
                      size="small"
                      sx={{
                        backgroundColor: DEGREE_COLORS[detailData.grado]?.bg || "#f1f5f9",
                        color: DEGREE_COLORS[detailData.grado]?.color || "#475569",
                        fontWeight: 600,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" fontWeight={500}>-</Typography>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Diagnóstico 1</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.diagnostico1}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Diagnóstico 2</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.diagnostico2}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Certificado</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.certificado}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Cert. Discapacidad</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.certDiscapacidad}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Silla de Ruedas</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.sillaDeRuedas}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Folio</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.folio}</Typography>
              </Grid>

              {/* CONADIS */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color={OMAPED_COLOR} gutterBottom sx={{ mt: 2 }}>
                  CONADIS
                </Typography>
                <Divider sx={{ mb: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Nro. CONADIS</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.conadis}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Fecha</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.conadisFecha}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Trámite</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.conadisTramite}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Vigencia</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.conadisVigencia}</Typography>
              </Grid>

              {/* Atención y Servicios */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color={OMAPED_COLOR} gutterBottom sx={{ mt: 2 }}>
                  Atención y Servicios
                </Typography>
                <Divider sx={{ mb: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Atención</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.atencion}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Terapia</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.terapia}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Horario de Terapia</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.horarioTerapia}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Beca</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.beca}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Inserción Laboral</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.insercionLaboral}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Emprendimiento</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.emprendimiento}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Feria</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.feria}</Typography>
              </Grid>

              {/* RENIEC */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color={OMAPED_COLOR} gutterBottom sx={{ mt: 2 }}>
                  RENIEC
                </Typography>
                <Divider sx={{ mb: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">RENIEC</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.reniec}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Turno RENIEC</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.turnoReniec}</Typography>
              </Grid>

              {/* Programas */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color={OMAPED_COLOR} gutterBottom sx={{ mt: 2 }}>
                  Programas
                </Typography>
                <Divider sx={{ mb: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Contigo</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.contigo}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">PC1000</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.pc1000}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">FAD</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.fad}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Comuna</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.comuna}</Typography>
              </Grid>

              {/* Otros */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color={OMAPED_COLOR} gutterBottom sx={{ mt: 2 }}>
                  Otros
                </Typography>
                <Divider sx={{ mb: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Empadronador</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.empadronador}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Fecha de Registro</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.fechaRegistro}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Fecha de Cambio</Typography>
                <Typography variant="body2" fontWeight={500}>{detailData.fechaCambio}</Typography>
              </Grid>
            </Grid>
          )}
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
