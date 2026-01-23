"use client";

import { useState } from "react";
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
  Popover,
  Slider,
  Button,
} from "@mui/material";
import { Search, Visibility, Edit, Delete, People, FilterList } from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];

// Datos de ejemplo
const beneficiariosData = [
  {
    id: 1,
    dni: "12345678",
    nombres: "María García López",
    jurisdiccion: "Canto Grande",
    comite: "Comité Las Flores",
    estado: "Activo",
  },
  {
    id: 2,
    dni: "23456789",
    nombres: "Juan Pérez Huamán",
    jurisdiccion: "Zarate",
    comite: "Comité Los Olivos",
    estado: "Activo",
  },
  {
    id: 3,
    dni: "34567890",
    nombres: "Ana Torres Sánchez",
    jurisdiccion: "Mangomarca",
    comite: "Comité Sol Naciente",
    estado: "Pendiente",
  },
  {
    id: 4,
    dni: "45678901",
    nombres: "Carlos Mendoza Quispe",
    jurisdiccion: "Bayovar",
    comite: "Comité Nueva Esperanza",
    estado: "Activo",
  },
  {
    id: 5,
    dni: "56789012",
    nombres: "Rosa Fernández Villa",
    jurisdiccion: "Mariscal Cáceres",
    comite: "Comité Las Brisas",
    estado: "Inactivo",
  },
];

export default function PVLBeneficiariosPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [ageRange, setAgeRange] = useState<number[]>([0, 100]);
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleAgeChange = (_event: Event, newValue: number | number[]) => {
    setAgeRange(newValue as number[]);
  };

  const filterOpen = Boolean(filterAnchor);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = beneficiariosData.filter(
    (b) =>
      b.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.dni.includes(searchTerm) ||
      b.jurisdiccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "success";
      case "Pendiente":
        return "warning";
      case "Inactivo":
        return "error";
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
            <Box mb={3} display="flex" gap={1.5} alignItems="center">
              <TextField
                placeholder="Buscar por nombre, DNI o jurisdicción..."
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
              <Tooltip title="Filtrar por edad">
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
              {(ageRange[0] > 0 || ageRange[1] < 100) && (
                <Chip
                  label={`Edad: ${ageRange[0]} - ${ageRange[1]}`}
                  size="small"
                  onDelete={() => setAgeRange([0, 100])}
                  sx={{ backgroundColor: "#e2e8f0" }}
                />
              )}
            </Box>

            {/* Popover de filtro por edad */}
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
              <Box sx={{ p: 2.5, width: 280 }}>
                <Typography variant="subtitle2" fontWeight={600} color="#334155" mb={2}>
                  Filtrar por rango de edad
                </Typography>
                <Slider
                  value={ageRange}
                  onChange={handleAgeChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
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
                    {ageRange[0]} años
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ageRange[1]} años
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
                  <Button
                    size="small"
                    onClick={() => setAgeRange([0, 100])}
                    sx={{ color: "#64748b", textTransform: "none" }}
                  >
                    Limpiar
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleFilterClose}
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
                  <TableRow
                    sx={{
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>DNI</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Nombres</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Jurisdicción</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Comité</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Estado</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                          "&:hover": {
                            backgroundColor: "#f1f5f9",
                          },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{row.dni}</TableCell>
                        <TableCell>{row.nombres}</TableCell>
                        <TableCell>{row.jurisdiccion}</TableCell>
                        <TableCell>{row.comite}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={row.estado}
                            color={getEstadoColor(row.estado) as "success" | "warning" | "error" | "default"}
                            size="small"
                            sx={{
                              fontWeight: 500,
                              borderRadius: "8px",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
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
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginación */}
            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
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
    </Box>
  );
}
