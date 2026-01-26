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
} from "@mui/material";
import {
  Search,
  Restaurant,
  FilterList,
  FileDownload,
  Close,
  Visibility,
  Edit,
  Delete,
  LocationOn,
  Male,
  Female,
} from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];

// Interface para el presidente
interface President {
  id: string;
  name: string;
  lastname: string;
  dni: string;
  phone: string;
  birthday: string;
  sex: string;
}

// Interface para la directiva
interface Directive {
  id: string;
  resolution: string;
  start_at: string;
  end_at: string;
}

// Interface para el comedor (API)
interface ComedorAPI {
  id: string;
  code: string;
  name: string;
  address: string;
  members: number;
  members_male: number;
  members_female: number;
  situation: string | null;
  latitude: number;
  longitude: number;
  modality: string;
  directive: Directive | null;
  president: President | null;
}

// Interface para la respuesta de la API
interface APIResponse {
  message: string;
  data: {
    data: ComedorAPI[];
    currentPage: number;
    pageCount: number;
    totalCount: number;
    totalPages: number;
  };
}

// Lista de modalidades
const MODALIDADES = ["CPOT", "CAE", "OTROS"];

type FilterType = "miembros" | "modalidad";

// URL base de la API
const API_BASE_URL = "https://sgdh-backend.onrender.com/api/pca/center";

export default function ComedoresListaPage() {
  // Estados para datos
  const [comedores, setComedores] = useState<ComedorAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para paginación (server-side)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("miembros");
  const [miembrosRange, setMiembrosRange] = useState<number[]>([0, 500]);
  const [modalidadSeleccionada, setModalidadSeleccionada] = useState<string>("");
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  // Estados para detalle
  const [selectedComedor, setSelectedComedor] = useState<ComedorAPI | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Función para obtener comedores de la API
  const fetchComedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}?page=${page + 1}&limit=${rowsPerPage}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener los comedores");
      }
      const data: APIResponse = await response.json();
      setComedores(data.data.data);
      setTotalCount(data.data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchComedores();
  }, [fetchComedores]);

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

  const handleMiembrosChange = (_event: Event, newValue: number | number[]) => {
    setMiembrosRange(newValue as number[]);
  };

  const filterOpen = Boolean(filterAnchor);

  const isMiembrosFiltered = miembrosRange[0] > 0 || miembrosRange[1] < 500;
  const isModalidadFiltered = modalidadSeleccionada !== "";

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (comedor: ComedorAPI) => {
    setSelectedComedor(comedor);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedComedor(null);
  };

  // Formatear fecha
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Filtrar datos localmente (búsqueda y filtros adicionales)
  const filteredData = comedores.filter((c: ComedorAPI) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.president?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (c.president?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesMiembros =
      c.members >= miembrosRange[0] && c.members <= miembrosRange[1];

    const matchesModalidad = modalidadSeleccionada === "" || c.modality === modalidadSeleccionada;

    return matchesSearch && matchesMiembros && matchesModalidad;
  });

  // Exportar a Excel (placeholder)
  const handleExport = () => {
    console.log("Exportar comedores");
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
            <Restaurant sx={{ fontSize: 28 }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: subgerencia.color,
              fontFamily: "'Poppins', 'Roboto', sans-serif",
            }}
          >
            Lista de Comedores
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            ml: 7.5,
            fontFamily: "'Inter', 'Roboto', sans-serif",
          }}
        >
          Listado de comedores populares registrados
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
                placeholder="Buscar por código, nombre, dirección, presidente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#64748b", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{
                  width: 380,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    fontFamily: "'Inter', 'Roboto', sans-serif",
                    "&:hover fieldset": {
                      borderColor: "#64748b",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: subgerencia.color,
                    },
                  },
                }}
              />
              <Tooltip title="Filtros avanzados">
                <IconButton
                  onClick={handleFilterClick}
                  sx={{
                    backgroundColor: filterOpen ? "#fce7f3" : "#f8fafc",
                    border: `1px solid ${filterOpen ? subgerencia.color : "#e2e8f0"}`,
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#fce7f3",
                      borderColor: subgerencia.color,
                    },
                  }}
                >
                  <FilterList sx={{ color: filterOpen ? subgerencia.color : "#64748b", fontSize: 20 }} />
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

              {/* Chips de filtros activos */}
              {isMiembrosFiltered && (
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
                  <Typography variant="caption" color="#be185d" fontWeight={500}>
                    Miembros: {miembrosRange[0]} - {miembrosRange[1]}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setMiembrosRange([0, 500])}
                    sx={{ p: 0.25 }}
                  >
                    <Close sx={{ fontSize: 14, color: "#be185d" }} />
                  </IconButton>
                </Box>
              )}
              {isModalidadFiltered && (
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
                  <Typography variant="caption" color="#1e40af" fontWeight={500}>
                    Modalidad: {modalidadSeleccionada}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setModalidadSeleccionada("")}
                    sx={{ p: 0.25 }}
                  >
                    <Close sx={{ fontSize: 14, color: "#1e40af" }} />
                  </IconButton>
                </Box>
              )}

              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  ml: "auto",
                  fontFamily: "'Inter', 'Roboto', sans-serif",
                }}
              >
                {filteredData.length} de {totalCount} comedor(es)
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
              <Box sx={{ p: 2.5, width: 340 }}>
                {/* Selector de tipo de filtro */}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "#334155",
                    mb: 1.5,
                    fontFamily: "'Poppins', 'Roboto', sans-serif",
                  }}
                >
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
                    value="miembros"
                    sx={{
                      textTransform: "none",
                      fontSize: "0.75rem",
                      fontFamily: "'Inter', 'Roboto', sans-serif",
                      "&.Mui-selected": {
                        backgroundColor: "#fce7f3",
                        color: "#be185d",
                        "&:hover": { backgroundColor: "#fbcfe8" },
                      },
                    }}
                  >
                    Miembros
                  </ToggleButton>
                  <ToggleButton
                    value="modalidad"
                    sx={{
                      textTransform: "none",
                      fontSize: "0.75rem",
                      fontFamily: "'Inter', 'Roboto', sans-serif",
                      "&.Mui-selected": {
                        backgroundColor: "#dbeafe",
                        color: "#1e40af",
                        "&:hover": { backgroundColor: "#bfdbfe" },
                      },
                    }}
                  >
                    Modalidad
                  </ToggleButton>
                </ToggleButtonGroup>

                <Divider sx={{ mb: 2 }} />

                {/* Filtro por miembros */}
                {filterType === "miembros" && (
                  <>
                    <Typography variant="body2" color="#475569" mb={1.5}>
                      Cantidad de miembros
                    </Typography>
                    <Slider
                      value={miembrosRange}
                      onChange={handleMiembrosChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={500}
                      sx={{
                        color: "#be185d",
                        "& .MuiSlider-thumb": {
                          backgroundColor: "#be185d",
                        },
                        "& .MuiSlider-track": {
                          backgroundColor: "#be185d",
                        },
                      }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        {miembrosRange[0]} miembros
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {miembrosRange[1]} miembros
                      </Typography>
                    </Box>
                  </>
                )}

                {/* Filtro por modalidad */}
                {filterType === "modalidad" && (
                  <>
                    <Typography variant="body2" color="#475569" mb={1.5}>
                      Modalidad del comedor
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {MODALIDADES.map((modalidad) => (
                        <Button
                          key={modalidad}
                          size="small"
                          variant={modalidadSeleccionada === modalidad ? "contained" : "outlined"}
                          onClick={() => setModalidadSeleccionada(modalidadSeleccionada === modalidad ? "" : modalidad)}
                          sx={{
                            textTransform: "none",
                            fontFamily: "'Inter', 'Roboto', sans-serif",
                            borderColor: modalidadSeleccionada === modalidad ? "#1e40af" : "#e2e8f0",
                            backgroundColor: modalidadSeleccionada === modalidad ? "#1e40af" : "transparent",
                            color: modalidadSeleccionada === modalidad ? "white" : "#64748b",
                            "&:hover": {
                              backgroundColor: modalidadSeleccionada === modalidad ? "#1e3a8a" : "#dbeafe",
                              borderColor: "#1e40af",
                            },
                          }}
                        >
                          {modalidad}
                        </Button>
                      ))}
                    </Box>
                  </>
                )}

                <Box display="flex" justifyContent="flex-end" mt={2.5} gap={1}>
                  <Button
                    size="small"
                    onClick={() => {
                      setMiembrosRange([0, 500]);
                      setModalidadSeleccionada("");
                    }}
                    sx={{
                      color: "#64748b",
                      textTransform: "none",
                      fontFamily: "'Inter', 'Roboto', sans-serif",
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
                      fontFamily: "'Inter', 'Roboto', sans-serif",
                      "&:hover": { backgroundColor: "#be185d" },
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
                overflow: "auto",
              }}
            >
              <Table sx={{ minWidth: 1400 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#334155", fontFamily: "'Inter', 'Roboto', sans-serif", whiteSpace: "nowrap" }}>
                      Código
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155", fontFamily: "'Inter', 'Roboto', sans-serif", whiteSpace: "nowrap" }}>
                      Nombre
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155", fontFamily: "'Inter', 'Roboto', sans-serif", whiteSpace: "nowrap" }}>
                      Dirección
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155", fontFamily: "'Inter', 'Roboto', sans-serif", whiteSpace: "nowrap" }}>
                      Miembros
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155", fontFamily: "'Inter', 'Roboto', sans-serif", whiteSpace: "nowrap" }}>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                        <Female sx={{ fontSize: 16, color: "#ec4899" }} />
                        Mujeres
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155", fontFamily: "'Inter', 'Roboto', sans-serif", whiteSpace: "nowrap" }}>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                        <Male sx={{ fontSize: 16, color: "#3b82f6" }} />
                        Varones
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155", fontFamily: "'Inter', 'Roboto', sans-serif", whiteSpace: "nowrap" }}>
                      Modalidad
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155", fontFamily: "'Inter', 'Roboto', sans-serif", whiteSpace: "nowrap" }}>
                      Fecha Inicio
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155", fontFamily: "'Inter', 'Roboto', sans-serif", whiteSpace: "nowrap" }}>
                      Fecha Fin
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155", fontFamily: "'Inter', 'Roboto', sans-serif", whiteSpace: "nowrap" }}>
                      Presidente
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155", fontFamily: "'Inter', 'Roboto', sans-serif", whiteSpace: "nowrap" }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={40} sx={{ color: subgerencia.color }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          Cargando comedores...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="error">
                          {error}
                        </Typography>
                        <Button
                          size="small"
                          onClick={fetchComedores}
                          sx={{ mt: 1, textTransform: "none" }}
                        >
                          Reintentar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron comedores
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row: ComedorAPI, index: number) => (
                      <TableRow
                        key={row.id}
                        onClick={() => handleRowClick(row)}
                        sx={{
                          backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                          "&:hover": {
                            backgroundColor: "#fdf2f8",
                            cursor: "pointer",
                          },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500, fontFamily: "'Inter', 'Roboto', sans-serif", whiteSpace: "nowrap" }}>
                          {row.code}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', 'Roboto', sans-serif", maxWidth: 200 }}>
                          {row.name}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', 'Roboto', sans-serif", maxWidth: 250, fontSize: "0.8rem" }}>
                          {row.address}
                        </TableCell>
                        <TableCell align="center" sx={{ fontFamily: "'Inter', 'Roboto', sans-serif", fontWeight: 600 }}>
                          {row.members}
                        </TableCell>
                        <TableCell align="center" sx={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              backgroundColor: "#fce7f3",
                              px: 1,
                              py: 0.25,
                              borderRadius: "8px",
                              color: "#be185d",
                              fontSize: "0.8rem",
                            }}
                          >
                            {row.members_female}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ fontFamily: "'Inter', 'Roboto', sans-serif" }}>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              backgroundColor: "#dbeafe",
                              px: 1,
                              py: 0.25,
                              borderRadius: "8px",
                              color: "#1e40af",
                              fontSize: "0.8rem",
                            }}
                          >
                            {row.members_male}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "inline-block",
                              px: 1.5,
                              py: 0.25,
                              borderRadius: "12px",
                              backgroundColor: "#f0fdf4",
                              color: "#166534",
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              fontFamily: "'Inter', 'Roboto', sans-serif",
                            }}
                          >
                            {row.modality || "-"}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ fontFamily: "'Inter', 'Roboto', sans-serif", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                          {formatDate(row.directive?.start_at)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontFamily: "'Inter', 'Roboto', sans-serif", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                          {formatDate(row.directive?.end_at)}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', 'Roboto', sans-serif", maxWidth: 180, fontSize: "0.85rem" }}>
                          {row.president ? `${row.president.name} ${row.president.lastname}` : "-"}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} flexWrap="nowrap">
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
                          </Box>
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
              rowsPerPageOptions={[10, 25, 50]}
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
            backgroundColor: "#fdf2f8",
            borderBottom: "1px solid #fce7f3",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Restaurant sx={{ color: subgerencia.color }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#334155",
                fontFamily: "'Poppins', 'Roboto', sans-serif",
              }}
            >
              Detalles del Comedor
            </Typography>
          </Box>
          <IconButton onClick={handleDetailClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {selectedComedor && (
            <Grid container spacing={3}>
              {/* Información General */}
              <Grid size={12}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    fontFamily: "'Poppins', 'Roboto', sans-serif",
                  }}
                  gutterBottom
                >
                  Información General
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Código</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComedor.code}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Nombre</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComedor.name}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Modalidad</Typography>
                <Box
                  sx={{
                    display: "inline-block",
                    px: 1.5,
                    py: 0.25,
                    borderRadius: "12px",
                    backgroundColor: "#f0fdf4",
                    color: "#166534",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  {selectedComedor.modality || "-"}
                </Box>
              </Grid>

              {/* Ubicación */}
              <Grid size={12}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    mt: 2,
                    fontFamily: "'Poppins', 'Roboto', sans-serif",
                  }}
                  gutterBottom
                >
                  Ubicación
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">Dirección</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComedor.address}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  <LocationOn sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                  Latitud
                </Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComedor.latitude}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  <LocationOn sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                  Longitud
                </Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComedor.longitude}</Typography>
              </Grid>

              {/* Miembros */}
              <Grid size={12}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    mt: 2,
                    fontFamily: "'Poppins', 'Roboto', sans-serif",
                  }}
                  gutterBottom
                >
                  Miembros
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Total Miembros</Typography>
                <Typography variant="body2" fontWeight={600} fontSize="1.1rem">{selectedComedor.members}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  <Female sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle", color: "#ec4899" }} />
                  Mujeres
                </Typography>
                <Typography variant="body2" fontWeight={500} color="#be185d">{selectedComedor.members_female}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  <Male sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle", color: "#3b82f6" }} />
                  Varones
                </Typography>
                <Typography variant="body2" fontWeight={500} color="#1e40af">{selectedComedor.members_male}</Typography>
              </Grid>

              {/* Directiva */}
              <Grid size={12}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    mt: 2,
                    fontFamily: "'Poppins', 'Roboto', sans-serif",
                  }}
                  gutterBottom
                >
                  Directiva
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Resolución</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedComedor.directive?.resolution || "-"}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">Fecha Inicio</Typography>
                <Typography variant="body2" fontWeight={500}>{formatDate(selectedComedor.directive?.start_at)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">Fecha Fin</Typography>
                <Typography variant="body2" fontWeight={500}>{formatDate(selectedComedor.directive?.end_at)}</Typography>
              </Grid>

              {/* Presidente */}
              <Grid size={12}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    mt: 2,
                    fontFamily: "'Poppins', 'Roboto', sans-serif",
                  }}
                  gutterBottom
                >
                  Presidente
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              {selectedComedor.president ? (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">Nombre Completo</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedComedor.president.name} {selectedComedor.president.lastname}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">DNI</Typography>
                    <Typography variant="body2" fontWeight={500}>{selectedComedor.president.dni}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                    <Typography variant="body2" fontWeight={500}>{selectedComedor.president.phone}</Typography>
                  </Grid>
                </>
              ) : (
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Sin presidente asignado
                  </Typography>
                </Grid>
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
              fontFamily: "'Inter', 'Roboto', sans-serif",
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
