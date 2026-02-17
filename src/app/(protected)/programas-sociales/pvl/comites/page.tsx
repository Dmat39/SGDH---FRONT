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
} from "@mui/material";
import {
  Search,
  Groups,
  FilterList,
  FileDownload,
  Close,
  Visibility,
  Edit,
  Delete,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];

// Interfaces para el backend
interface CoordinatorBackend {
  id: string;
  name: string;
  lastname: string;
  dni: string;
  phone: string;
  birthday: string | null;
}

interface CoupleBackend {
  id: string;
  name: string;
}

interface TownBackend {
  id: string;
  name: string;
}

interface CommitteeBackend {
  id: string;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  beneficiaries: number;
  beneficiaries_foreign: number;
  members: number;
  handicappeds: number;
  commune: number;
  observation: string | null;
  route: string;
  couple: CoupleBackend | null;
  town: TownBackend | null;
  coordinator: CoordinatorBackend | null;
  created_at: string;
}

interface BackendResponse {
  message: string;
  data: {
    data: CommitteeBackend[];
    currentPage: number;
    pageCount: number;
    totalCount: number;
    totalPages: number;
  };
}

// Interface para el comité en el frontend
interface ComiteFrontend {
  id: string;
  codigo: string;
  centroAcopio: string;
  comite: string;
  beneficiarios: number;
  socios: number;
  coordinadora: string;
  dniCoordinadora: string;
  telefonoCoordinadora: string;
  direccionReferencia: string;
  comuna: number;
  pueblo: string;
  ruta: string;
  beneficiariosExtranjeros: number;
  discapacitados: number;
  observaciones: string | null;
  fechaCreacion: string;
}

// Función para mapear datos del backend al frontend
const mapBackendToFrontend = (item: CommitteeBackend): ComiteFrontend => ({
  id: item.id,
  codigo: item.code,
  centroAcopio: item.couple?.name || "-",
  comite: item.name,
  beneficiarios: item.beneficiaries,
  socios: item.members,
  coordinadora: item.coordinator ? `${item.coordinator.name} ${item.coordinator.lastname}` : "-",
  dniCoordinadora: item.coordinator?.dni || "-",
  telefonoCoordinadora: item.coordinator?.phone || "-",
  direccionReferencia: item.address,
  comuna: item.commune,
  pueblo: item.town?.name || "-",
  ruta: item.route,
  beneficiariosExtranjeros: item.beneficiaries_foreign,
  discapacitados: item.handicappeds,
  observaciones: item.observation,
  fechaCreacion: item.created_at,
});

type FilterType = "beneficiarios" | "comuna";

// Lista de comunas basada en el GeoJSON de sectores PVL
const COMUNAS = [
  { id: 1, name: "ZARATE" },
  { id: 2, name: "CAMPOY" },
  { id: 3, name: "MANGOMARCA" },
  { id: 4, name: "SALSAS" },
  { id: 5, name: "HUAYRONA" },
  { id: 6, name: "CANTO REY" },
  { id: 7, name: "HUANCARAY" },
  { id: 8, name: "MARISCAL CACERES" },
  { id: 9, name: "MOTUPE" },
  { id: 10, name: "JICAMARCA" },
  { id: 11, name: "MARIATEGUI" },
  { id: 12, name: "CASA BLANCA" },
  { id: 13, name: "BAYOVAR" },
  { id: 14, name: "HUASCAR" },
  { id: 15, name: "CANTO GRANDE" },
  { id: 16, name: "SAN HILARION" },
  { id: 17, name: "LAS FLORES" },
  { id: 18, name: "CAJA DE AGUA" },
];

export default function PVLComitesPage() {
  const { getData } = useFetch();

  // Estados para datos
  const [data, setData] = useState<ComiteFrontend[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Paginación server-side
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fetchKey, setFetchKey] = useState(0);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("beneficiarios");
  const [beneficiariosRange, setBeneficiariosRange] = useState<number[]>([0, 200]);
  const [comunasSeleccionadas, setComunasSeleccionadas] = useState<number[]>([]);
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  // Estados para detalle
  const [selectedComite, setSelectedComite] = useState<ComiteFrontend | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Cargar datos con paginación server-side
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page + 1));
        params.set("limit", String(rowsPerPage));

        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim());
        }

        if (beneficiariosRange[0] > 0 || beneficiariosRange[1] < 200) {
          params.set("beneficiaries_min", String(beneficiariosRange[0]));
          params.set("beneficiaries_max", String(beneficiariosRange[1]));
        }

        if (comunasSeleccionadas.length > 0) {
          params.set("commune", comunasSeleccionadas.join(","));
        }

        const response = await getData<BackendResponse>(
          `pvl/committee?${params.toString()}`
        );
        if (response?.data) {
          const mappedData = response.data.data.map(mapBackendToFrontend);
          setData(mappedData);
          setTotalCount(response.data.totalCount);
        }
      } catch (error) {
        console.error("Error fetching comités:", error);
        setData([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchTerm, fetchKey, getData]);

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

  const handleBeneficiariosChange = (_event: Event, newValue: number | number[]) => {
    setBeneficiariosRange(newValue as number[]);
  };

  const handleComunaToggle = (comunaId: number) => {
    setComunasSeleccionadas((prev) =>
      prev.includes(comunaId) ? prev.filter((c) => c !== comunaId) : [...prev, comunaId]
    );
  };

  const filterOpen = Boolean(filterAnchor);

  const isBeneficiariosFiltered = beneficiariosRange[0] > 0 || beneficiariosRange[1] < 200;
  const isComunaFiltered = comunasSeleccionadas.length > 0;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (comite: ComiteFrontend) => {
    setSelectedComite(comite);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedComite(null);
  };

  // Formatear strings del backend (Title Case, preservar siglas en direcciones)
  const dataFormateados = useFormatTableData(data);

  // Exportar a Excel
  const handleExport = () => {
    const exportData = dataFormateados.map((c: ComiteFrontend) => ({
      Código: c.codigo,
      "Centro de Acopio": c.centroAcopio,
      Comité: c.comite,
      Beneficiarios: c.beneficiarios,
      Socios: c.socios,
      Coordinadora: c.coordinadora,
      "DNI Coordinadora": c.dniCoordinadora,
      "Teléfono Coordinadora": c.telefonoCoordinadora,
      "Dirección": c.direccionReferencia,
      Pueblo: c.pueblo,
      Comuna: c.comuna,
      Ruta: c.ruta,
      "Beneficiarios Extranjeros": c.beneficiariosExtranjeros,
      Discapacitados: c.discapacitados,
      Observaciones: c.observaciones || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Comités PVL");

    // Ajustar ancho de columnas
    const colWidths = Object.keys(exportData[0] || {}).map(() => ({ wch: 20 }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `comites_pvl_${new Date().toISOString().split("T")[0]}.xlsx`);
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
            <Groups sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: subgerencia.color }}>
            PVL - Comités
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 7.5 }}>
          Listado de comités del Programa de Vaso de Leche
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
                placeholder="Buscar por código, comité, coordinadora..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
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
                    "&:hover fieldset": {
                      borderColor: "#64748b",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#475569",
                    },
                  },
                }}
              />
              <Tooltip title="Filtrar por beneficiarios">
                <IconButton
                  onClick={handleFilterClick}
                  sx={{
                    backgroundColor: filterOpen ? "#e2e8f0" : "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#e2e8f0",
                    },
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
                    "&:hover": {
                      backgroundColor: "#dcfce7",
                      borderColor: "#22c55e",
                    },
                  }}
                >
                  <FileDownload sx={{ color: "#22c55e", fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              {isBeneficiariosFiltered && (
                <Box
                  sx={{
                    backgroundColor: "#e2e8f0",
                    borderRadius: "16px",
                    px: 1.5,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" color="#475569">
                    Beneficiarios: {beneficiariosRange[0]} - {beneficiariosRange[1]}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => { setBeneficiariosRange([0, 200]); setPage(0); setFetchKey((k) => k + 1); }}
                    sx={{ p: 0.25 }}
                  >
                    <Close sx={{ fontSize: 14, color: "#64748b" }} />
                  </IconButton>
                </Box>
              )}
              {isComunaFiltered && (
                <Box
                  sx={{
                    backgroundColor: "#e0f2fe",
                    borderRadius: "16px",
                    px: 1.5,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" color="#0369a1">
                    Comunas: {comunasSeleccionadas.length}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => { setComunasSeleccionadas([]); setPage(0); setFetchKey((k) => k + 1); }}
                    sx={{ p: 0.25 }}
                  >
                    <Close sx={{ fontSize: 14, color: "#0369a1" }} />
                  </IconButton>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                {totalCount.toLocaleString()} comité(s)
              </Typography>
            </Box>

            {/* Popover de filtro */}
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
                    value="beneficiarios"
                    sx={{
                      textTransform: "none",
                      fontSize: "0.7rem",
                      "&.Mui-selected": {
                        backgroundColor: "#e2e8f0",
                        color: "#334155",
                        "&:hover": { backgroundColor: "#cbd5e1" },
                      },
                    }}
                  >
                    Beneficiarios
                  </ToggleButton>
                  <ToggleButton
                    value="comuna"
                    sx={{
                      textTransform: "none",
                      fontSize: "0.7rem",
                      "&.Mui-selected": {
                        backgroundColor: "#e0f2fe",
                        color: "#0369a1",
                        "&:hover": { backgroundColor: "#bae6fd" },
                      },
                    }}
                  >
                    Comuna
                  </ToggleButton>
                </ToggleButtonGroup>

                <Divider sx={{ mb: 2 }} />

                {/* Filtro por beneficiarios */}
                {filterType === "beneficiarios" && (
                  <>
                    <Typography variant="body2" color="#475569" mb={1.5}>
                      Cantidad de beneficiarios
                    </Typography>
                    <Slider
                      value={beneficiariosRange}
                      onChange={handleBeneficiariosChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={200}
                      sx={{
                        color: "#64748b",
                        "& .MuiSlider-thumb": {
                          backgroundColor: "#475569",
                        },
                        "& .MuiSlider-track": {
                          backgroundColor: "#64748b",
                        },
                      }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        {beneficiariosRange[0]} beneficiarios
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {beneficiariosRange[1]} beneficiarios
                      </Typography>
                    </Box>
                  </>
                )}

                {/* Filtro por comuna */}
                {filterType === "comuna" && (
                  <>
                    <Typography variant="body2" color="#475569" mb={1.5}>
                      Selecciona las comunas
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 0.75,
                        maxHeight: 250,
                        overflowY: "auto",
                      }}
                    >
                      {COMUNAS.map((comuna) => (
                        <Button
                          key={comuna.id}
                          size="small"
                          variant={comunasSeleccionadas.includes(comuna.id) ? "contained" : "outlined"}
                          onClick={() => handleComunaToggle(comuna.id)}
                          sx={{
                            textTransform: "none",
                            fontSize: "0.65rem",
                            py: 0.5,
                            px: 0.75,
                            minWidth: 0,
                            justifyContent: "flex-start",
                            borderColor: comunasSeleccionadas.includes(comuna.id) ? "#0369a1" : "#e2e8f0",
                            backgroundColor: comunasSeleccionadas.includes(comuna.id) ? "#0369a1" : "transparent",
                            color: comunasSeleccionadas.includes(comuna.id) ? "white" : "#64748b",
                            "&:hover": {
                              backgroundColor: comunasSeleccionadas.includes(comuna.id) ? "#075985" : "#e0f2fe",
                              borderColor: "#0369a1",
                            },
                          }}
                        >
                          {comuna.id}. {comuna.name}
                        </Button>
                      ))}
                    </Box>
                    {comunasSeleccionadas.length > 0 && (
                      <Typography variant="caption" color="#0369a1" sx={{ mt: 1, display: "block" }}>
                        {comunasSeleccionadas.length} comuna(s) seleccionada(s)
                      </Typography>
                    )}
                  </>
                )}

                <Box display="flex" justifyContent="flex-end" mt={2.5} gap={1}>
                  <Button
                    size="small"
                    onClick={() => {
                      setBeneficiariosRange([0, 200]);
                      setComunasSeleccionadas([]);
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
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Centro Acopio</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Comité</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Beneficiarios</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Socios</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Coordinadora</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Dirección Referencia</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={32} sx={{ color: "#64748b" }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Cargando comités...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : dataFormateados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron comités
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataFormateados.map((row: ComiteFrontend, index: number) => (
                      <TableRow
                        key={row.id}
                        onClick={() => handleRowClick(row)}
                        sx={{
                          backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                            cursor: "pointer",
                          },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{row.codigo}</TableCell>
                        <TableCell>{row.centroAcopio}</TableCell>
                        <TableCell>{row.comite}</TableCell>
                        <TableCell align="center">{row.beneficiarios}</TableCell>
                        <TableCell align="center">{row.socios}</TableCell>
                        <TableCell>{row.coordinadora}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {row.direccionReferencia}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(row);
                              }}
                              sx={{
                                color: "#64748b",
                                "&:hover": {
                                  backgroundColor: "#f1f5f9",
                                },
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
                                "&:hover": {
                                  backgroundColor: "rgba(8, 145, 178, 0.1)",
                                },
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
                                "&:hover": {
                                  backgroundColor: "rgba(220, 38, 38, 0.1)",
                                },
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
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
                "& .MuiTablePagination-selectIcon": {
                  color: "#64748b",
                },
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
        PaperProps={{
          sx: {
            borderRadius: "16px",
          },
        }}
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
            <Groups sx={{ color: "#475569" }} />
            <Typography variant="h6" fontWeight={600} color="#334155">
              Detalles del Comité
            </Typography>
          </Box>
          <IconButton onClick={handleDetailClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {selectedComite && (
            <Grid container spacing={3}>
              {/* Información General */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom>
                  Información General
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Código</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.codigo}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Comité</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.comite}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Centro de Acopio</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.centroAcopio}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Ruta</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.ruta}</Typography>
              </Grid>
              

              {/* Ubicación */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom sx={{ mt: 2 }}>
                  Ubicación
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Pueblo</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.pueblo}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Comuna</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.comuna}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Dirección</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.direccionReferencia}</Typography>
              </Grid>

              {/* Estadísticas */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom sx={{ mt: 2 }}>
                  Estadísticas
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Beneficiarios</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.beneficiarios}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Socios</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.socios}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Beneficiarios Extranjeros</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.beneficiariosExtranjeros}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Discapacitados</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.discapacitados}</Typography>
              </Grid>

              {/* Coordinadora */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom sx={{ mt: 2 }}>
                  Coordinadora
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Nombre</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.coordinadora}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">DNI</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.dniCoordinadora}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComite.telefonoCoordinadora}</Typography>
              </Grid>

              {/* Observaciones */}
              {selectedComite.observaciones && (
                <>
                  <Grid size={12}>
                    <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom sx={{ mt: 2 }}>
                      Observaciones
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="body2">{selectedComite.observaciones}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={handleDetailClose}
            sx={{
              textTransform: "none",
              color: "#64748b",
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
