"use client";

import { useState, useEffect, useCallback } from "react";
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
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Grid,
} from "@mui/material";
import {
  Download,
  Refresh,
  Search,
  Visibility,
  Close,
  ChildCare,
  Badge,
  Phone,
  CalendarMonth,
  PersonSearch,
} from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";
import * as XLSX from "xlsx";

const subgerencia = SUBGERENCIAS[SubgerenciaType.SERVICIOS_SOCIALES];
const MODULE_COLOR = subgerencia.color; // #00a3a8

// ============================================
// TIPOS
// ============================================
interface MadreBackend {
  id: string;
  name: string;
  lastname: string;
  doc_num: string;
  phone: string | null;
  birthday: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  doc_type: string;
}

interface BackendResponse {
  message: string;
  data: {
    data: MadreBackend[];
    currentPage: number;
    pageCount: number;
    totalCount: number;
    totalPages: number;
  };
}

interface MadreTabla {
  id: string;
  nombreCompleto: string;
  nombre: string;
  apellido: string;
  tipoDoc: string;
  numDoc: string;
  telefono: string | null;
  fechaNacimiento: string | null;
  fechaRegistro: string;
}

// ============================================
// UTILIDADES
// ============================================
const toTitleCase = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatearFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return "-";
  const d = new Date(fecha);
  const dia = d.getUTCDate().toString().padStart(2, "0");
  const mes = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const anio = d.getUTCFullYear();
  return `${dia}/${mes}/${anio}`;
};

const formatearTelefono = (tel: string | null | undefined): string => {
  if (!tel) return "-";
  const limpio = tel.replace(/\D/g, "");
  if (limpio.length === 9) {
    return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`;
  }
  return tel;
};

const calcularEdad = (fechaNacimiento: string | null | undefined): number | null => {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getUTCFullYear() - nacimiento.getUTCFullYear();
  const mes = hoy.getUTCMonth() - nacimiento.getUTCMonth();
  if (mes < 0 || (mes === 0 && hoy.getUTCDate() < nacimiento.getUTCDate())) {
    edad--;
  }
  return edad;
};

// ============================================
// MAPEO DE DATOS
// ============================================
const mapToTabla = (item: MadreBackend): MadreTabla => ({
  id: item.id,
  nombreCompleto: toTitleCase(`${item.name} ${item.lastname}`),
  nombre: toTitleCase(item.name),
  apellido: toTitleCase(item.lastname),
  tipoDoc: item.doc_type,
  numDoc: item.doc_num,
  telefono: item.phone,
  fechaNacimiento: item.birthday,
  fechaRegistro: item.created_at,
});

// ============================================
// COMPONENTE DE DETALLE
// ============================================
interface DetalleMadreProps {
  madre: MadreTabla | null;
  isLoading: boolean;
  onClose: () => void;
}

function DetalleMadre({ madre, isLoading, onClose }: DetalleMadreProps) {
  const edad = madre ? calcularEdad(madre.fechaNacimiento) : null;

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
            Datos de la Madre
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {isLoading || !madre ? (
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
                  {madre.nombre.charAt(0)}
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {madre.nombreCompleto}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {madre.tipoDoc} · {madre.numDoc}
              </Typography>
            </Box>

            {/* Datos de Identificación */}
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
                  {madre.nombre}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Apellidos
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {madre.apellido}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Tipo de Documento
                </Typography>
                <Chip
                  label={madre.tipoDoc}
                  size="small"
                  sx={{ backgroundColor: `${MODULE_COLOR}20`, color: MODULE_COLOR, fontWeight: 600 }}
                />
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  N° de Documento
                </Typography>
                <Typography variant="body2" fontWeight={500} fontFamily="monospace">
                  {madre.numDoc}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            {/* Datos de Contacto */}
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
                  Teléfono / Celular
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearTelefono(madre.telefono) || "-"}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Fecha de Nacimiento
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearFecha(madre.fechaNacimiento)}
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
                  {formatearFecha(madre.fechaRegistro)}
                </Typography>
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
// PÁGINA PRINCIPAL
// ============================================
export default function Compromiso1Page() {
  // --- Estado: Datos ---
  const [rawData, setRawData] = useState<MadreTabla[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- Estado: Paginación ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [fetchKey, setFetchKey] = useState(0);

  // --- Estado: Búsqueda ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // --- Estado: Detalle ---
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detalleMadre, setDetalleMadre] = useState<MadreTabla | null>(null);

  const { getData } = useFetch();
  const dataFormateados = useFormatTableData(rawData);

  // --- Debounce búsqueda ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- Fetch de datos ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page + 1));
      params.set("limit", String(rowsPerPage));

      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      const response = await getData<BackendResponse>(`compromise/mother?${params.toString()}`);

      if (response?.data) {
        setRawData(response.data.data.map(mapToTabla));
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error al cargar madres:", error);
      setRawData([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, fetchKey, getData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers ---
  const handleRefresh = () => setFetchKey((k) => k + 1);

  const handleVerDetalle = (madre: MadreTabla) => {
    setDetalleMadre(madre);
    setDetalleOpen(true);
  };

  const handleExport = () => {
    const fechaISO = new Date().toISOString().slice(0, 10);
    const exportData = dataFormateados.map((row, index) => ({
      "#": index + 1 + page * rowsPerPage,
      "Nombre Completo": row.nombreCompleto,
      "Tipo Documento": row.tipoDoc,
      "N° Documento": row.numDoc,
      Teléfono: row.telefono || "-",
      "Fecha Nacimiento": formatearFecha(row.fechaNacimiento),
      "Fecha Registro": formatearFecha(row.fechaRegistro),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const colWidths = [
      { wch: 5 },
      { wch: 35 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
    ];
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Madres");
    XLSX.writeFile(workbook, `compromiso1_madres_${fechaISO}.xlsx`);
  };

  return (
    <Box>
      {/* ── Header ── */}
      <Box mb={3} display="flex" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <ChildCare sx={{ color: MODULE_COLOR, fontSize: 32 }} />
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Compromiso 1 · Bajo Hierro
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Registro de madres con niños diagnosticados con anemia (bajo hierro) ·{" "}
            <span style={{ color: MODULE_COLOR, fontWeight: 600 }}>Área de Salud</span>
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Actualizar datos">
            <IconButton onClick={handleRefresh} sx={{ color: MODULE_COLOR }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar a Excel">
            <span>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExport}
                disabled={dataFormateados.length === 0}
                sx={{ borderColor: MODULE_COLOR, color: MODULE_COLOR, "&:hover": { borderColor: MODULE_COLOR } }}
              >
                Exportar
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Barra de búsqueda ── */}
      <Paper sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Buscar por nombre o DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{
            minWidth: 280,
            flexGrow: 1,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": { borderColor: MODULE_COLOR },
              "&.Mui-focused fieldset": { borderColor: MODULE_COLOR },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: MODULE_COLOR }} fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto", whiteSpace: "nowrap" }}>
          {isLoading ? "Cargando..." : `${totalCount.toLocaleString()} madres registradas`}
        </Typography>
      </Paper>

      {/* ── Tabla ── */}
      <Paper sx={{ overflow: "hidden" }}>
        {isLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} gap={2}>
            <CircularProgress sx={{ color: MODULE_COLOR }} />
            <Typography variant="body2" color="text.secondary">
              Cargando registros...
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {["#", "Nombre Completo", "Tipo Doc / N° Documento", "Teléfono", "F. Nacimiento", "F. Registro", ""].map(
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
                  {dataFormateados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                          <PersonSearch sx={{ fontSize: 40, color: "text.disabled" }} />
                          <Typography color="text.secondary">
                            {debouncedSearch ? "No se encontraron resultados para la búsqueda" : "No hay madres registradas"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataFormateados.map((row, index) => (
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

                        {/* Documento */}
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={row.tipoDoc}
                              size="small"
                              sx={{
                                backgroundColor: `${MODULE_COLOR}20`,
                                color: MODULE_COLOR,
                                fontWeight: 700,
                                fontSize: "0.68rem",
                                height: 20,
                              }}
                            />
                            <Typography variant="body2" fontFamily="monospace">
                              {row.numDoc}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Teléfono */}
                        <TableCell>
                          <Typography variant="body2">
                            {formatearTelefono(row.telefono)}
                          </Typography>
                        </TableCell>

                        {/* Fecha Nacimiento */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatearFecha(row.fechaNacimiento)}
                          </Typography>
                        </TableCell>

                        {/* Fecha Registro */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatearFecha(row.fechaRegistro)}
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
              }}
            />
          </>
        )}
      </Paper>

      {/* ── Modal de Detalle ── */}
      <Dialog open={detalleOpen} onClose={() => setDetalleOpen(false)} maxWidth="sm" fullWidth>
        <DetalleMadre
          madre={detalleMadre}
          isLoading={false}
          onClose={() => setDetalleOpen(false)}
        />
      </Dialog>
    </Box>
  );
}
