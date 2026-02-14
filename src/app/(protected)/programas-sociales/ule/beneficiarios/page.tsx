"use client";

import { useState, useEffect } from "react";
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
  Alert,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Slider,
} from "@mui/material";
import {
  Search,
  People,
  Download,
  Clear,
  FilterList,
  Cake,
  Close,
} from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";
import * as XLSX from "xlsx";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];

// Nombres de los meses en español
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

type CumpleanosModo = "mes" | "dia";
type FilterType = "edad" | "cumpleanos";

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

export default function ULEBeneficiariosPage() {
  const { getData } = useFetch();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<RegisteredPerson[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Paginación server-side
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [fetchKey, setFetchKey] = useState(0);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroFormato, setFiltroFormato] = useState<string>("");

  // Estados para filtros de edad y cumpleaños
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("edad");
  const [edadRange, setEdadRange] = useState<number[]>([0, 100]);
  const [cumpleanosModo, setCumpleanosModo] = useState<CumpleanosModo>("mes");
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [diaCumpleanos, setDiaCumpleanos] = useState<string>("");

  // Cargar datos con paginación y filtros server-side
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(page + 1));
        params.set("limit", String(rowsPerPage));

        // Filtro por búsqueda (server-side)
        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim());
        }

        // Filtro por formato (server-side)
        if (filtroFormato) {
          params.set("format", filtroFormato);
        }

        // Filtro de edad (server-side)
        if (edadRange[0] > 0 || edadRange[1] < 100) {
          params.set("age_min", String(edadRange[0]));
          params.set("age_max", String(edadRange[1]));
        }

        // Filtro de cumpleaños (server-side)
        if (cumpleanosModo === "mes" && mesSeleccionado !== null) {
          params.set("birthday_month", String(mesSeleccionado + 1));
        } else if (cumpleanosModo === "dia" && diaCumpleanos) {
          const parts = diaCumpleanos.split("-"); // YYYY-MM-DD
          params.set("birthday_day", `${parts[1]}-${parts[2]}`);
        }

        const response = await getData<BackendResponse>(
          `ule/registered?${params.toString()}`
        );

        if (response?.data) {
          setData(response.data.data);
          setTotalCount(response.data.totalCount);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error al cargar los datos. Por favor, intenta de nuevo.");
        setData([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filtroFormato, searchTerm, fetchKey, getData]);

  // Formatear strings del backend (Title Case, preservar siglas en direcciones)
  const dataFormateados = useFormatTableData(data);

  // Los datos ya vienen filtrados del backend
  const empadronadosFiltrados = dataFormateados;

  // Calcular edad
  const calcularEdad = (fechaNacimiento: string): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getUTCFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getUTCMonth();

    if (mesActual < mesNacimiento ||
        (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getUTCDate())) {
      edad--;
    }

    return edad;
  };

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
    const d = new Date(fecha);
    const dia = d.getUTCDate().toString().padStart(2, "0");
    const mes = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const anio = d.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltroFormato("");
    setEdadRange([0, 100]);
    setMesSeleccionado(null);
    setDiaCumpleanos("");
    setCumpleanosModo("mes");
    setPage(0);
    setFetchKey((k) => k + 1);
  };

  // Handlers para filtros
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
    setMesSeleccionado((prev) => (prev === mes ? null : mes));
  };

  const filterOpen = Boolean(filterAnchor);
  const isEdadFiltered = edadRange[0] > 0 || edadRange[1] < 100;
  const isCumpleanosFiltered = cumpleanosModo === "mes" ? mesSeleccionado !== null : diaCumpleanos !== "";

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
    fileName += ".xlsx";

    XLSX.writeFile(wb, fileName);
  };

  const hayFiltrosActivos = searchTerm || filtroFormato || isEdadFiltered || isCumpleanosFiltered;

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
                  onClick={() => { setEdadRange([0, 100]); setPage(0); setFetchKey((k) => k + 1); }}
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
                  {cumpleanosModo === "mes" && mesSeleccionado !== null
                    ? MESES[mesSeleccionado].slice(0, 3)
                    : diaCumpleanos.split("-").slice(1).reverse().join("/")}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => { setMesSeleccionado(null); setDiaCumpleanos(""); setPage(0); setFetchKey((k) => k + 1); }}
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
                    setMesSeleccionado(null);
                    setDiaCumpleanos("");
                    setCumpleanosModo("mes");
                    setPage(0);
                    setFetchKey((k) => k + 1);
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
                  onClick={() => { setPage(0); setFetchKey((k) => k + 1); handleFilterClose(); }}
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
              label={`${totalCount.toLocaleString()} registros`}
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
          </Box>

          {/* Tabla */}
          {isLoading ? (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={400} gap={1}>
              <CircularProgress sx={{ color: subgerencia.color }} />
              <Typography variant="caption" color="text.secondary">
                Cargando empadronados...
              </Typography>
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
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Urbanización</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Empadronador</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Fecha Registro</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {empadronadosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No se encontraron registros con los filtros aplicados
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      empadronadosFiltrados.map((empadronado, index) => (
                        <TableRow
                          key={empadronado.id}
                          sx={{
                            backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                            "&:hover": { backgroundColor: "#f1f5f9" },
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
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 150,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={empadronado.urban?.name}
                            >
                              {empadronado.urban?.name || "-"}
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
                          <TableCell>
                            <Typography variant="body2">
                              {formatearFecha(empadronado.registered_at)}
                            </Typography>
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
    </Box>
  );
}
