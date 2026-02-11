"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  TextField,
  MenuItem,
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
} from "@mui/material";
import {
  Download,
  Refresh,
  Search,
  FilterList,
  Cake,
  Clear,
  Close,
} from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";
import * as XLSX from "xlsx";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];
const BATCH_SIZE = 500;

// Paleta de colores para módulos
const MODULE_COLORS = [
  "#d81b7e", "#4caf50", "#ff9800", "#2196f3", "#9c27b0",
  "#00bcd4", "#e91e63", "#795548", "#607d8b", "#f44336",
];

// Meses para el filtro
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
interface GeneralPersonBackend {
  id: string;
  name: string;
  lastname: string;
  dni: string;
  phone: string | null;
  birthday: string | null;
  message: string | null;
  answer: string | null;
  citizen_id: string;
  module_id: string;
  module: { id: string; name: string } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  send: string | null;
}

interface BackendResponse {
  message: string;
  data: {
    data: GeneralPersonBackend[];
    totalCount: number;
  };
}

// ============================================
// INTERFACE FRONTEND
// ============================================
interface PersonaTabla {
  id: string;
  nombreCompleto: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  fechaNacimiento: string | null;
  edad: number;
  moduloId: string;
  moduloNombre: string;
}

interface ModuloInfo {
  id: string;
  name: string;
  color: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ListaGeneralPage() {
  const { getData } = useFetch();

  // Datos
  const [allData, setAllData] = useState<PersonaTabla[]>([]);
  const [modulos, setModulos] = useState<ModuloInfo[]>([]);
  const [moduloMap, setModuloMap] = useState<Record<string, ModuloInfo>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroModulo, setFiltroModulo] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("edad");
  const [edadRange, setEdadRange] = useState<number[]>([0, 100]);
  const [filtroMes, setFiltroMes] = useState<number | "">("");
  const [filtroDia, setFiltroDia] = useState("");
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  // Cargar datos
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const firstResponse = await getData<BackendResponse>("general?page=1&limit=1");
      const totalCount = firstResponse?.data?.totalCount || 0;

      if (totalCount > 0) {
        const totalPages = Math.ceil(totalCount / BATCH_SIZE);
        const allItems: PersonaTabla[] = [];
        const mMap: Record<string, ModuloInfo> = {};
        let colorIndex = 0;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const response = await getData<BackendResponse>(
            `general?page=${pageNum}&limit=${BATCH_SIZE}`
          );
          if (response?.data?.data) {
            allItems.push(
              ...response.data.data.map((item) => {
                const modId = item.module?.id || item.module_id;
                const modName = item.module?.name || "-";

                // Registrar módulo si es nuevo
                if (modId && !mMap[modId]) {
                  mMap[modId] = {
                    id: modId,
                    name: modName,
                    color: MODULE_COLORS[colorIndex % MODULE_COLORS.length],
                  };
                  colorIndex++;
                }

                return {
                  id: item.id,
                  nombreCompleto: `${item.name} ${item.lastname}`.trim(),
                  nombre: item.name,
                  apellido: item.lastname,
                  dni: item.dni || "-",
                  telefono: item.phone || "",
                  fechaNacimiento: item.birthday,
                  edad: calcularEdad(item.birthday),
                  moduloId: modId,
                  moduloNombre: modName,
                };
              })
            );
          }
        }

        setAllData(allItems);
        setModuloMap(mMap);
        setModulos(Object.values(mMap));
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Formatear strings (Title Case)
  const formattedData = useFormatTableData(allData);

  // Filtrar datos
  const filteredData = useMemo(() => {
    return formattedData.filter((row: PersonaTabla) => {
      // Búsqueda
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (
          !row.nombreCompleto.toLowerCase().includes(s) &&
          !row.dni.includes(s) &&
          !row.telefono.includes(s) &&
          !row.moduloNombre.toLowerCase().includes(s)
        ) {
          return false;
        }
      }

      // Filtro por módulo
      if (filtroModulo && row.moduloId !== filtroModulo) return false;

      // Filtro por edad
      if (edadRange[0] > 0 || edadRange[1] < 100) {
        if (row.fechaNacimiento) {
          const edad = calcularEdad(row.fechaNacimiento);
          if (edad < edadRange[0] || edad > edadRange[1]) return false;
        }
      }

      // Filtro por cumpleaños
      if (filtroDia || filtroMes) {
        if (!row.fechaNacimiento) return false;
        const fecha = new Date(row.fechaNacimiento);
        if (filtroMes && fecha.getUTCMonth() + 1 !== filtroMes) return false;
        if (filtroDia && fecha.getUTCDate() !== parseInt(filtroDia)) return false;
      }

      return true;
    });
  }, [formattedData, searchTerm, filtroModulo, edadRange, filtroDia, filtroMes]);

  // Paginación local
  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filtroModulo, edadRange, filtroDia, filtroMes]);

  // Exportar Excel
  const handleExport = () => {
    const exportData = filteredData.map((row: PersonaTabla) => ({
      "Nombre Completo": row.nombreCompleto,
      DNI: row.dni,
      Teléfono: formatearTelefono(row.telefono),
      "Fecha de Nacimiento": formatearFecha(row.fechaNacimiento),
      Edad: row.edad,
      Módulo: row.moduloNombre,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 30 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 6 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Lista General");

    let fileName = "lista_general";
    if (filtroModulo) fileName += `_${moduloMap[filtroModulo]?.name || "modulo"}`;
    fileName += `_${new Date().toISOString().split("T")[0]}`;
    fileName += ".xlsx";

    XLSX.writeFile(wb, fileName);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltroModulo("");
    setEdadRange([0, 100]);
    setFiltroDia("");
    setFiltroMes("");
    setPage(0);
  };

  // Handlers de filtro
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
    if (newFilterType !== null) setFilterType(newFilterType);
  };

  const handleEdadChange = (_event: unknown, newValue: number | number[]) => {
    setEdadRange(newValue as number[]);
  };

  const filterOpen = Boolean(filterAnchor);
  const isEdadFiltered = edadRange[0] > 0 || edadRange[1] < 100;
  const hayFiltrosActivos = searchTerm || filtroModulo || filtroDia || filtroMes || isEdadFiltered;

  // Estadísticas por módulo
  const statsByModule = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredData.forEach((row: PersonaTabla) => {
      stats[row.moduloId] = (stats[row.moduloId] || 0) + 1;
    });
    return stats;
  }, [filteredData]);

  return (
    <Box>
      {/* Encabezado */}
      <Box mb={3}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: subgerencia.color,
            fontWeight: 700,
            fontFamily: "'Poppins', 'Roboto', sans-serif",
          }}
        >
          Lista General
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Listado general de personas registradas en todos los módulos
        </Typography>
      </Box>

      {/* Filtros */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Búsqueda */}
          <TextField
            size="small"
            placeholder="Buscar por nombre, DNI, teléfono, módulo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 300 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Filtro por módulo */}
          <TextField
            select
            size="small"
            label="Módulo"
            value={filtroModulo}
            onChange={(e) => setFiltroModulo(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos los módulos</MenuItem>
            {modulos.map((mod) => (
              <MenuItem key={mod.id} value={mod.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: mod.color,
                    }}
                  />
                  {mod.name}
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Botón filtros de edad/cumpleaños */}
          <Tooltip title="Filtros de edad y cumpleaños">
            <IconButton
              onClick={handleFilterClick}
              sx={{
                backgroundColor:
                  filterOpen || isEdadFiltered || filtroDia || filtroMes
                    ? "#fce7f3"
                    : "#f8fafc",
                border: `1px solid ${
                  filterOpen || isEdadFiltered || filtroDia || filtroMes
                    ? subgerencia.color
                    : "#e2e8f0"
                }`,
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#fce7f3",
                  borderColor: subgerencia.color,
                },
              }}
            >
              <FilterList
                sx={{
                  color:
                    filterOpen || isEdadFiltered || filtroDia || filtroMes
                      ? subgerencia.color
                      : "#64748b",
                  fontSize: 20,
                }}
              />
            </IconButton>
          </Tooltip>

          {/* Chips de filtros activos */}
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
          {(filtroDia || filtroMes) && (
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
                {filtroMes && !filtroDia && MESES.find((m) => m.value === filtroMes)?.label}
                {filtroDia && filtroMes && `${filtroDia}/${filtroMes}`}
                {filtroDia && !filtroMes && `Día ${filtroDia}`}
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  setFiltroDia("");
                  setFiltroMes("");
                }}
                sx={{ p: 0.25 }}
              >
                <Close sx={{ fontSize: 14, color: "#be185d" }} />
              </IconButton>
            </Box>
          )}

          {/* Espaciador */}
          <Box sx={{ flex: 1 }} />

          {/* Botones de acción */}
          {hayFiltrosActivos && (
            <Tooltip title="Limpiar filtros">
              <IconButton onClick={limpiarFiltros} size="small">
                <Clear />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Actualizar datos">
            <IconButton onClick={fetchAllData} disabled={isLoading} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={isLoading || filteredData.length === 0}
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
                    "& .MuiSlider-thumb": { backgroundColor: "#1e40af" },
                    "& .MuiSlider-track": { backgroundColor: "#3b82f6" },
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
                  {MESES.map((mes) => (
                    <MenuItem key={mes.value} value={mes.value}>
                      {mes.label}
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
                    const value = e.target.value;
                    if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 31)) {
                      setFiltroDia(value);
                    }
                  }}
                  slotProps={{ htmlInput: { min: 1, max: 31 } }}
                  helperText="Selecciona un día específico (opcional)"
                />
              </>
            )}

            <Box display="flex" justifyContent="flex-end" mt={2.5} gap={1}>
              <Button
                size="small"
                onClick={() => {
                  setEdadRange([0, 100]);
                  setFiltroDia("");
                  setFiltroMes("");
                }}
                sx={{ color: "#64748b", textTransform: "none" }}
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

        {/* Chips de filtros activos */}
        {hayFiltrosActivos && (
          <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Filtros activos:
            </Typography>
            {filtroModulo && (
              <Chip
                size="small"
                label={moduloMap[filtroModulo]?.name || "Módulo"}
                onDelete={() => setFiltroModulo("")}
                sx={{
                  backgroundColor: moduloMap[filtroModulo]?.color || "#666",
                  color: "white",
                }}
              />
            )}
            {filtroMes && (
              <Chip
                size="small"
                label={`Mes: ${MESES.find((m) => m.value === filtroMes)?.label}`}
                onDelete={() => setFiltroMes("")}
                icon={<Cake sx={{ color: "white !important", fontSize: 16 }} />}
                sx={{ backgroundColor: "#d81b7e", color: "white" }}
              />
            )}
            {filtroDia && (
              <Chip
                size="small"
                label={`Día: ${filtroDia}`}
                onDelete={() => setFiltroDia("")}
                sx={{ backgroundColor: "#d81b7e", color: "white" }}
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
      </Paper>

      {/* Estadísticas rápidas */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Paper
          sx={{
            px: 2,
            py: 1,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <FilterList fontSize="small" color="action" />
          <Typography variant="body2">
            <strong>{filteredData.length}</strong> de {allData.length} registros
          </Typography>
        </Paper>
        {modulos.map((mod) => {
          const count = statsByModule[mod.id] || 0;
          return (
            <Paper
              key={mod.id}
              sx={{
                px: 2,
                py: 1,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderLeft: `4px solid ${mod.color}`,
              }}
            >
              <Typography variant="body2">
                <strong>{count}</strong> {mod.name}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Tabla */}
      <Paper
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: 400,
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: subgerencia.color }} />
            <Typography variant="body2" color="text.secondary">
              Cargando registros...
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: "calc(100vh - 400px)" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      Nombre Completo
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      DNI
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      Teléfono
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      Cumpleaños / Edad
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      Módulo
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron registros con los filtros aplicados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row: PersonaTabla, index: number) => {
                      const modColor = moduloMap[row.moduloId]?.color || "#666";
                      return (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{
                            backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                            "&:hover": { backgroundColor: "#f1f5f9" },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {row.nombreCompleto}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                              {row.dni}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatearTelefono(row.telefono)}
                            </Typography>
                          </TableCell>
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
                                  <Cake sx={{ fontSize: 12, color: "#d81b7e" }} />
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
                          <TableCell>
                            {row.moduloNombre && row.moduloNombre !== "-" ? (
                              <Chip
                                size="small"
                                label={row.moduloNombre}
                                sx={{
                                  backgroundColor: modColor,
                                  color: "white",
                                  fontSize: "0.7rem",
                                  height: 24,
                                  fontWeight: 600,
                                }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
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
              count={filteredData.length}
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
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
