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
  Alert,
} from "@mui/material";
import { Search, People, Refresh, Download, Clear } from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";
import { useFetch } from "@/lib/hooks/useFetch";
import * as XLSX from "xlsx";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];
const BATCH_SIZE = 500; // Cargar en lotes de 500 registros

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

  // Obtener lista única de urbanizaciones para el filtro
  const urbanizaciones = useMemo(() => {
    const uniqueUrban = new Map<string, string>();
    empadronados.forEach((e) => {
      if (e.urban) {
        uniqueUrban.set(e.urban.id, e.urban.name);
      }
    });
    return Array.from(uniqueUrban.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [empadronados]);

  // Filtrar datos
  const empadronadosFiltrados = useMemo(() => {
    return empadronados.filter((e) => {
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

      return true;
    });
  }, [empadronados, searchTerm, filtroFormato, filtroUrban]);

  // Paginación
  const empadronadosPaginados = useMemo(() => {
    return empadronadosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [empadronadosFiltrados, page, rowsPerPage]);

  // Calcular edad
  const calcularEdad = (fechaNacimiento: string): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();

    if (mesActual < mesNacimiento ||
        (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
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
    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltroFormato("");
    setFiltroUrban("");
    setPage(0);
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

  const hayFiltrosActivos = searchTerm || filtroFormato || filtroUrban;

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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#64748b", fontSize: 20 }} />
                  </InputAdornment>
                ),
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
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Urbanización</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Empadronador</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Fecha Registro</TableCell>
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
    </Box>
  );
}
