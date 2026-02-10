"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Slider,
} from "@mui/material";
import {
  Search,
  People,
  Refresh,
  Download,
  Clear,
  Visibility,
  Edit,
  Delete,
  Close,
  Person,
  Phone,
  Badge,
  Home,
  CalendarMonth,
  Groups,
  Assignment,
  FilterList,
  Cake,
} from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";
import * as XLSX from "xlsx";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];
const BATCH_SIZE = 500; // Cargar en lotes de 500 registros

// Nombres de los meses en español
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Tipo de filtro de cumpleaños
type CumpleanosModo = "mes" | "dia";

// Tipo de filtro
type FilterType = "edad" | "cumpleanos";

// Función para calcular edad desde fecha de nacimiento
const calcularEdad = (fechaNacimiento: string): number => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getUTCFullYear() - nacimiento.getUTCFullYear();
  const mes = hoy.getUTCMonth() - nacimiento.getUTCMonth();
  if (mes < 0 || (mes === 0 && hoy.getUTCDate() < nacimiento.getUTCDate())) {
    edad--;
  }
  return edad;
};

// Interfaces para el backend
interface RegisteredPerson {
  id: string;
  fsu: string;
  s100: string;
  dni: string;
  name: string;
  lastname: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  members: number;
  birthday: string;
  registered_at: string;
  format: string;
  level: string;
  enumerator: {
    id: string;
    dni: string;
    name: string;
    lastname: string;
    phone: string;
    birthday: string;
  } | null;
  urban: {
    id: string;
    name: string;
  } | null;
  box: {
    id: string;
    code_num: number;
  } | null;
}

interface BackendResponse {
  message: string;
  data: {
    data: RegisteredPerson[];
    currentPage: number;
    pageCount: number;
    totalCount: number;
    totalPages: number;
  };
}

export default function ULEEmpadronadosPage() {
  const { getData } = useFetch();
  const [isLoading, setIsLoading] = useState(true);
  const [empadronados, setEmpadronados] = useState<RegisteredPerson[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const hasFetched = useRef(false);

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroFormato, setFiltroFormato] = useState<string>("");
  const [filtroUrban, setFiltroUrban] = useState<string>("");

  // Estados para filtros de edad y cumpleaños
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("edad");
  const [edadRange, setEdadRange] = useState<number[]>([0, 100]);
  const [cumpleanosModo, setCumpleanosModo] = useState<CumpleanosModo>("mes");
  const [mesesCumpleanos, setMesesCumpleanos] = useState<number[]>([]);
  const [diaCumpleanos, setDiaCumpleanos] = useState<string>("");

  // Estados para el dialog de detalles
  const [selectedEmpadronado, setSelectedEmpadronado] = useState<RegisteredPerson | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Cargar datos en lotes
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      // Primero obtener el total
      const firstResponse = await getData<BackendResponse>(`ule/registered?page=1&limit=1`, { showErrorAlert: false });
      const totalCount = firstResponse?.data?.totalCount || 0;

      if (totalCount === 0) {
        setEmpadronados([]);
        setIsLoading(false);
        return;
      }

      // Calcular número de páginas necesarias
      const totalPages = Math.ceil(totalCount / BATCH_SIZE);
      const allData: RegisteredPerson[] = [];

      // Cargar en lotes
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const response = await getData<BackendResponse>(
          `ule/registered?page=${pageNum}&limit=${BATCH_SIZE}`,
          { showErrorAlert: false }
        );

        if (response?.data?.data) {
          allData.push(...response.data.data);
        }

        // Actualizar progreso
        setLoadingProgress(Math.round((pageNum / totalPages) * 100));
      }

      setEmpadronados(allData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error al cargar los datos. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [getData]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, [fetchData]);

  // Formatear strings del backend (Title Case, preservar siglas en direcciones)
  const empadronadosFormateados = useFormatTableData(empadronados);

  // Obtener lista única de urbanizaciones para el filtro
  const urbanizaciones = useMemo(() => {
    const uniqueUrban = new Map<string, string>();
    empadronadosFormateados.forEach((e) => {
      if (e.urban) {
        uniqueUrban.set(e.urban.id, e.urban.name);
      }
    });
    return Array.from(uniqueUrban.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [empadronadosFormateados]);

  // Filtrar datos
  const empadronadosFiltrados = useMemo(() => {
    return empadronadosFormateados.filter((e) => {
      // Filtro por búsqueda
      if (searchTerm) {
        const busqueda = searchTerm.toLowerCase();
        const coincide =
          e.name.toLowerCase().includes(busqueda) ||
          e.lastname.toLowerCase().includes(busqueda) ||
          e.dni.toLowerCase().includes(busqueda) ||
          e.fsu?.toLowerCase().includes(busqueda) ||
          e.s100?.toLowerCase().includes(busqueda) ||
          e.urban?.name.toLowerCase().includes(busqueda) ||
          e.enumerator?.name.toLowerCase().includes(busqueda) ||
          e.enumerator?.lastname.toLowerCase().includes(busqueda);
        if (!coincide) return false;
      }

      // Filtro por formato
      if (filtroFormato && e.format !== filtroFormato) {
        return false;
      }

      // Filtro por urbanización
      if (filtroUrban && e.urban?.id !== filtroUrban) {
        return false;
      }

      // Filtro por edad
      const edad = e.birthday ? calcularEdad(e.birthday) : 0;
      if (edad < edadRange[0] || edad > edadRange[1]) {
        return false;
      }

      // Filtro por cumpleaños
      if (cumpleanosModo === "mes" && mesesCumpleanos.length > 0) {
        if (e.birthday) {
          const mesCumple = new Date(e.birthday).getMonth();
          if (!mesesCumpleanos.includes(mesCumple)) return false;
        } else {
          return false;
        }
      } else if (cumpleanosModo === "dia" && diaCumpleanos) {
        if (e.birthday) {
          const fechaNac = new Date(e.birthday);
          const [, mes, dia] = diaCumpleanos.split("-").map(Number);
          if (!(fechaNac.getMonth() + 1 === mes && fechaNac.getDate() === dia)) return false;
        } else {
          return false;
        }
      }

      return true;
    });
  }, [empadronadosFormateados, searchTerm, filtroFormato, filtroUrban, edadRange, cumpleanosModo, mesesCumpleanos, diaCumpleanos]);

  // Paginación
  const empadronadosPaginados = useMemo(() => {
    return empadronadosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [empadronadosFiltrados, page, rowsPerPage]);

  // Formatear teléfono con prefijo +51
  const formatearTelefono = (telefono: string | null | undefined): string => {
    if (!telefono || telefono.trim() === "") return "";
    const telefonoLimpio = telefono.trim();
    if (telefonoLimpio.startsWith("+51")) {
      return telefonoLimpio;
    }
    if (telefonoLimpio.startsWith("51") && telefonoLimpio.length >= 11) {
      return `+${telefonoLimpio}`;
    }
    return `+51${telefonoLimpio}`;
  };

  // Formatear fecha
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltroFormato("");
    setFiltroUrban("");
    setEdadRange([0, 100]);
    setMesesCumpleanos([]);
    setDiaCumpleanos("");
    setPage(0);
  };

  // Handlers para filtro de cumpleaños
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleFilterTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilterType: FilterType | null
  ) => {
    if (newFilterType !== null) {
      setFilterType(newFilterType);
    }
  };

  const handleEdadChange = (_event: unknown, newValue: number | number[]) => {
    setEdadRange(newValue as number[]);
  };

  const handleMesToggle = (mes: number) => {
    setMesesCumpleanos((prev) =>
      prev.includes(mes) ? prev.filter((m) => m !== mes) : [...prev, mes]
    );
  };

  const filterOpen = Boolean(filterAnchor);
  const isEdadFiltered = edadRange[0] > 0 || edadRange[1] < 100;
  const isCumpleanosFiltered = cumpleanosModo === "mes" ? mesesCumpleanos.length > 0 : diaCumpleanos !== "";

  // Handlers para el dialog
  const handleRowClick = (empadronado: RegisteredPerson) => {
    setSelectedEmpadronado(empadronado);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedEmpadronado(null);
  };

  // Descargar Excel
  const descargarExcel = () => {
    const datosExcel = empadronadosFiltrados.map((e) => ({
      "DNI": e.dni,
      "Nombres": e.name,
      "Apellidos": e.lastname,
      "Teléfono": formatearTelefono(e.phone),
      "Formato": e.format,
      "FSU": e.fsu || "",
      "S100": e.s100 || "",
      "Nivel": e.level,
      "Miembros": e.members,
      "Urbanización": e.urban?.name || "",
      "Empadronador": e.enumerator ? `${e.enumerator.name} ${e.enumerator.lastname}` : "",
      "Fecha Registro": formatearFecha(e.registered_at),
      "Fecha Nacimiento": formatearFecha(e.birthday),
      "Edad": e.birthday ? calcularEdad(e.birthday) : "",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosExcel);

    const colWidths = [
      { wch: 12 }, // DNI
      { wch: 20 }, // Nombres
      { wch: 20 }, // Apellidos
      { wch: 14 }, // Teléfono
      { wch: 10 }, // Formato
      { wch: 12 }, // FSU
      { wch: 12 }, // S100
      { wch: 8 },  // Nivel
      { wch: 10 }, // Miembros
      { wch: 25 }, // Urbanización
      { wch: 30 }, // Empadronador
      { wch: 14 }, // Fecha Registro
      { wch: 14 }, // Fecha Nacimiento
      { wch: 6 },  // Edad
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Empadronados ULE");

    let fileName = "empadronados_ule";
    if (filtroFormato) fileName += `_${filtroFormato}`;
    if (filtroUrban) {
      const urban = urbanizaciones.find((u) => u.id === filtroUrban);
      if (urban) fileName += `_${urban.name.replace(/\s+/g, "_")}`;
    }
    fileName += ".xlsx";

    XLSX.writeFile(wb, fileName);
  };

  const hayFiltrosActivos = searchTerm || filtroFormato || filtroUrban || isEdadFiltered || isCumpleanosFiltered;

  // Color por formato
  const getFormatoColor = (formato: string) => {
    switch (formato) {
      case "FSU":
        return "#d81b7e";
      case "S100":
        return "#00a3a8";
      default:
        return "#64748b";
    }
  };

  // Color por nivel
  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "P":
        return "success";
      case "NP":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box>
      {/* Encabezado */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${subgerencia.color}15 0%, ${subgerencia.color}30 100%)`,
              color: subgerencia.color,
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              boxShadow: `0 4px 12px ${subgerencia.color}25`,
            }}
          >
            <People sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: subgerencia.color }}>
            ULE - Empadronados
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 7.5 }}>
          Listado de personas empadronadas en la Unidad Local de Empadronamiento
        </Typography>
      </Box>

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tarjeta principal */}
      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Filtros */}
          <Box mb={3} display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Buscar por nombre, DNI, FSU, S100..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
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
                minWidth: 300,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Formato"
              value={filtroFormato}
              onChange={(e) => {
                setFiltroFormato(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="FSU">FSU</MenuItem>
              <MenuItem value="S100">S100</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="Urbanización"
              value={filtroUrban}
              onChange={(e) => {
                setFiltroUrban(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {urbanizaciones.map((urban) => (
                <MenuItem key={urban.id} value={urban.id}>
                  {urban.name}
                </MenuItem>
              ))}
            </TextField>

            <Tooltip title="Filtros de edad y cumpleaños">
              <IconButton
                onClick={handleFilterClick}
                sx={{
                  backgroundColor: filterOpen || isEdadFiltered || isCumpleanosFiltered ? "#fce7f3" : "#f8fafc",
                  border: `1px solid ${filterOpen || isEdadFiltered || isCumpleanosFiltered ? subgerencia.color : "#e2e8f0"}`,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#fce7f3",
                    borderColor: subgerencia.color,
                  },
                }}
              >
                <FilterList sx={{ color: filterOpen || isEdadFiltered || isCumpleanosFiltered ? subgerencia.color : "#64748b", fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Chip de filtro de edad activo */}
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
                  onClick={() => setEdadRange([0, 100])}
                  sx={{ p: 0.25 }}
                >
                  <Close sx={{ fontSize: 14, color: "#1e40af" }} />
                </IconButton>
              </Box>
            )}

            {/* Chip de filtro de cumpleaños activo */}
            {isCumpleanosFiltered && (
              <Box
                sx={{
                  backgroundColor: "#fce7f3",
                  borderRadius: "16px",
                  px: 1.5,
                  py: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Cake sx={{ fontSize: 14, color: "#be185d" }} />
                <Typography variant="caption" color="#be185d">
                  {cumpleanosModo === "mes"
                    ? mesesCumpleanos.map((m) => MESES[m].slice(0, 3)).join(", ")
                    : diaCumpleanos.split("-").slice(1).reverse().join("/")}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setMesesCumpleanos([]);
                    setDiaCumpleanos("");
                  }}
                  sx={{ p: 0.25 }}
                >
                  <Close sx={{ fontSize: 14, color: "#be185d" }} />
                </IconButton>
              </Box>
            )}

            <Box sx={{ flex: 1 }} />

            {hayFiltrosActivos && (
              <Tooltip title="Limpiar filtros">
                <IconButton onClick={limpiarFiltros} size="small">
                  <Clear />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Actualizar datos">
              <IconButton onClick={() => { hasFetched.current = false; fetchData(); }} disabled={isLoading} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={descargarExcel}
              disabled={isLoading || empadronadosFiltrados.length === 0}
              sx={{
                backgroundColor: subgerencia.color,
                "&:hover": { backgroundColor: "#b01668" },
              }}
            >
              Descargar Excel
            </Button>
          </Box>

          {/* Popover de filtro de edad y cumpleaños */}
          <Popover
            open={filterOpen}
            anchorEl={filterAnchor}
            onClose={handleFilterClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            sx={{ mt: 1 }}
          >
            <Box sx={{ p: 2.5, width: 320 }}>
              {/* Selector de tipo de filtro */}
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
                      backgroundColor: "#fce7f3",
                      color: "#be185d",
                      "&:hover": { backgroundColor: "#fbcfe8" },
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
                    max={100}
                    sx={{
                      color: "#3b82f6",
                      "& .MuiSlider-thumb": {
                        backgroundColor: "#1e40af",
                      },
                      "& .MuiSlider-track": {
                        backgroundColor: "#3b82f6",
                      },
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
                    Cumpleaños
                  </Typography>

                  {/* Selector de modo */}
                  <ToggleButtonGroup
                    value={cumpleanosModo}
                    exclusive
                    onChange={(_, value) => value && setCumpleanosModo(value)}
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
                          backgroundColor: "#fce7f3",
                          color: "#be185d",
                          "&:hover": { backgroundColor: "#fbcfe8" },
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
                          backgroundColor: "#fce7f3",
                          color: "#be185d",
                          "&:hover": { backgroundColor: "#fbcfe8" },
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
                            variant={mesesCumpleanos.includes(index) ? "contained" : "outlined"}
                            onClick={() => handleMesToggle(index)}
                            sx={{
                              textTransform: "none",
                              fontSize: "0.7rem",
                              py: 0.5,
                              px: 1,
                              minWidth: 0,
                              borderColor: mesesCumpleanos.includes(index) ? "#be185d" : "#e2e8f0",
                              backgroundColor: mesesCumpleanos.includes(index) ? "#be185d" : "transparent",
                              color: mesesCumpleanos.includes(index) ? "white" : "#64748b",
                              "&:hover": {
                                backgroundColor: mesesCumpleanos.includes(index) ? "#9d174d" : "#fce7f3",
                                borderColor: "#be185d",
                              },
                            }}
                          >
                            {mes.slice(0, 3)}
                          </Button>
                        ))}
                      </Box>
                      {mesesCumpleanos.length > 0 && (
                        <Typography variant="caption" color="#be185d" sx={{ mt: 1, display: "block" }}>
                          {mesesCumpleanos.length} mes(es) seleccionado(s)
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
                      helperText="Selecciona una fecha para filtrar por día y mes"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          "&.Mui-focused fieldset": {
                            borderColor: "#be185d",
                          },
                        },
                      }}
                    />
                  )}
                </>
              )}

              <Box display="flex" justifyContent="flex-end" mt={2.5} gap={1}>
                <Button
                  size="small"
                  onClick={() => {
                    setEdadRange([0, 100]);
                    setMesesCumpleanos([]);
                    setDiaCumpleanos("");
                  }}
                  sx={{
                    color: "#64748b",
                    textTransform: "none",
                  }}
                >
                  Limpiar todo
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleFilterClose}
                  sx={{
                    backgroundColor: subgerencia.color,
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#be185d" },
                  }}
                >
                  Aplicar
                </Button>
              </Box>
            </Box>
          </Popover>

          {/* Resumen */}
          <Box mb={2} display="flex" gap={2} flexWrap="wrap">
            <Chip
              label={`${empadronadosFiltrados.length} de ${empadronados.length} registros`}
              size="small"
              sx={{ backgroundColor: "#f1f5f9" }}
            />
            {filtroFormato && (
              <Chip
                label={`Formato: ${filtroFormato}`}
                size="small"
                onDelete={() => setFiltroFormato("")}
                sx={{ backgroundColor: getFormatoColor(filtroFormato), color: "white" }}
              />
            )}
            {filtroUrban && (
              <Chip
                label={`Urbanización: ${urbanizaciones.find((u) => u.id === filtroUrban)?.name}`}
                size="small"
                onDelete={() => setFiltroUrban("")}
              />
            )}
          </Box>

          {/* Tabla */}
          {isLoading ? (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={400} gap={1}>
              <CircularProgress sx={{ color: subgerencia.color }} />
              {loadingProgress > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Cargando... {loadingProgress}%
                </Typography>
              )}
            </Box>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: "12px",
                  boxShadow: "none",
                  border: "1px solid #e2e8f0",
                  maxHeight: "calc(100vh - 420px)",
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>DNI</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Nombre Completo</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Teléfono</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Formato</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>FSU / S100</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Nivel</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Miembros</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Fecha Nacimiento</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Empadronador</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {empadronadosPaginados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No se encontraron registros con los filtros aplicados
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      empadronadosPaginados.map((empadronado, index) => (
                        <TableRow
                          key={empadronado.id}
                          onClick={() => handleRowClick(empadronado)}
                          sx={{
                            backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                            "&:hover": { backgroundColor: "#fdf2f8", cursor: "pointer" },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <TableCell sx={{ fontFamily: "monospace", fontWeight: 500 }}>
                            {empadronado.dni}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {empadronado.name} {empadronado.lastname}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatearTelefono(empadronado.phone) || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={empadronado.format}
                              size="small"
                              sx={{
                                backgroundColor: getFormatoColor(empadronado.format),
                                color: "white",
                                fontWeight: 500,
                                fontSize: "0.7rem",
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                            {empadronado.format === "FSU" ? empadronado.fsu : empadronado.s100}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={empadronado.level}
                              size="small"
                              color={getNivelColor(empadronado.level) as "success" | "warning" | "default"}
                              sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={500}>
                              {empadronado.members}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {empadronado.birthday
                                ? `${formatearFecha(empadronado.birthday)} (${calcularEdad(empadronado.birthday)})`
                                : "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 150,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={empadronado.enumerator ? `${empadronado.enumerator.name} ${empadronado.enumerator.lastname}` : ""}
                            >
                              {empadronado.enumerator
                                ? `${empadronado.enumerator.name} ${empadronado.enumerator.lastname}`
                                : "-"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                              <Tooltip title="Ver detalles">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRowClick(empadronado);
                                  }}
                                  sx={{
                                    color: "#64748b",
                                    "&:hover": { backgroundColor: "#f1f5f9" },
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Implementar edición
                                  }}
                                  sx={{
                                    color: "#0891b2",
                                    "&:hover": { backgroundColor: "rgba(8, 145, 178, 0.1)" },
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Implementar eliminación
                                  }}
                                  sx={{
                                    color: "#dc2626",
                                    "&:hover": { backgroundColor: "rgba(220, 38, 38, 0.1)" },
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={empadronadosFiltrados.length}
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
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
                sx={{
                  borderTop: "1px solid #e2e8f0",
                  mt: 2,
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalles */}
      <Dialog
        open={detailOpen}
        onClose={handleDetailClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px" },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#fdf2f8",
            borderBottom: "1px solid #fce7f3",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <People sx={{ color: subgerencia.color }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#334155" }}>
              Detalles del Empadronado
            </Typography>
          </Box>
          <IconButton onClick={handleDetailClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {selectedEmpadronado && (
            <Grid container spacing={3}>
              {/* Información Personal */}
              <Grid size={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#475569" }} gutterBottom>
                  <Person sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                  Información Personal
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  <Badge sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                  DNI
                </Typography>
                <Typography variant="body2" fontWeight={500}>{selectedEmpadronado.dni}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Nombres</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedEmpadronado.name}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Apellidos</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedEmpadronado.lastname}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  <Phone sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                  Teléfono
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearTelefono(selectedEmpadronado.phone) || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  <CalendarMonth sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                  Fecha de Nacimiento
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedEmpadronado.birthday
                    ? `${formatearFecha(selectedEmpadronado.birthday)} (${calcularEdad(selectedEmpadronado.birthday)} años)`
                    : "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  <Groups sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                  Miembros del Hogar
                </Typography>
                <Typography variant="body2" fontWeight={600} fontSize="1.1rem">
                  {selectedEmpadronado.members}
                </Typography>
              </Grid>

              {/* Información de Registro */}
              <Grid size={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#475569", mt: 2 }} gutterBottom>
                  <Assignment sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                  Información de Registro
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Formato</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={selectedEmpadronado.format}
                    size="small"
                    sx={{
                      backgroundColor: getFormatoColor(selectedEmpadronado.format),
                      color: "white",
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Código FSU</Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontFamily: "monospace" }}>
                  {selectedEmpadronado.fsu || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Código S100</Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontFamily: "monospace" }}>
                  {selectedEmpadronado.s100 || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Nivel</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={selectedEmpadronado.level === "P" ? "Pobre" : selectedEmpadronado.level === "NP" ? "No Pobre" : selectedEmpadronado.level}
                    size="small"
                    color={getNivelColor(selectedEmpadronado.level) as "success" | "warning" | "default"}
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Fecha de Registro</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearFecha(selectedEmpadronado.registered_at)}
                </Typography>
              </Grid>

              {/* Ubicación */}
              <Grid size={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#475569", mt: 2 }} gutterBottom>
                  <Home sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                  Ubicación
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Urbanización</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedEmpadronado.urban?.name || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">Latitud</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedEmpadronado.latitude || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">Longitud</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedEmpadronado.longitude || "-"}
                </Typography>
              </Grid>

              {/* Empadronador */}
              <Grid size={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#475569", mt: 2 }} gutterBottom>
                  <Person sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                  Empadronador
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              {selectedEmpadronado.enumerator ? (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">Nombre Completo</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedEmpadronado.enumerator.name} {selectedEmpadronado.enumerator.lastname}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">DNI</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedEmpadronado.enumerator.dni}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatearTelefono(selectedEmpadronado.enumerator.phone) || "-"}
                    </Typography>
                  </Grid>
                </>
              ) : (
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Sin empadronador asignado
                  </Typography>
                </Grid>
              )}

              {/* Caja */}
              {selectedEmpadronado.box && (
                <>
                  <Grid size={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#475569", mt: 2 }} gutterBottom>
                      Caja
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">Código de Caja</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedEmpadronado.box.code_num}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={handleDetailClose}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Cerrar
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => {
              // TODO: Implementar edición
              handleDetailClose();
            }}
            sx={{
              textTransform: "none",
              backgroundColor: "#0891b2",
              "&:hover": { backgroundColor: "#0e7490" },
            }}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
