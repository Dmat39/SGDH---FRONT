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
} from "@mui/material";
import { Search, Visibility, Edit, Delete, People } from "@mui/icons-material";
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
        {/* Sombra rosa difuminada debajo */}
        <Box
          sx={{
            position: "absolute",
            bottom: "-15px",
            left: "5%",
            right: "5%",
            height: "30px",
            background: "linear-gradient(to bottom, rgba(216, 27, 126, 0.2), rgba(216, 27, 126, 0))",
            borderRadius: "50%",
            filter: "blur(15px)",
            zIndex: 0,
          }}
        />
        <Card
          sx={{
            borderRadius: "24px",
            boxShadow: "0 8px 20px rgba(216, 27, 126, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08)",
            position: "relative",
            zIndex: 1,
            overflow: "visible",
            "&::after": {
              content: '""',
              position: "absolute",
              right: "-6px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "12px",
              height: "40%",
              background: "linear-gradient(to bottom, #f472b6, #d81b7e, #be185d)",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(216, 27, 126, 0.35)",
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Buscador */}
            <Box mb={3}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre, DNI o jurisdicción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: subgerencia.color }} />
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#fdf2f8",
                    "&:hover fieldset": {
                      borderColor: subgerencia.color,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: subgerencia.color,
                    },
                  },
                }}
              />
            </Box>

            {/* Tabla */}
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: "16px",
                boxShadow: "none",
                border: "1px solid rgba(216, 27, 126, 0.1)",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#831843" }}>DNI</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#831843" }}>Nombres</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#831843" }}>Jurisdicción</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#831843" }}>Comité</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#831843" }}>Estado</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#831843" }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          backgroundColor: index % 2 === 0 ? "white" : "rgba(253, 242, 248, 0.5)",
                          "&:hover": {
                            backgroundColor: "rgba(216, 27, 126, 0.08)",
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
                                color: subgerencia.color,
                                "&:hover": {
                                  backgroundColor: "rgba(216, 27, 126, 0.1)",
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
                borderTop: "1px solid rgba(216, 27, 126, 0.1)",
                mt: 2,
                "& .MuiTablePagination-selectIcon": {
                  color: subgerencia.color,
                },
              }}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
