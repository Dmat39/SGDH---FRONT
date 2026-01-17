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
import { Search, Visibility, Edit, Delete } from "@mui/icons-material";

interface Beneficiario {
  id: number;
  dni: string;
  nombres: string;
  jurisdiccion: string;
  unidad: string;
  estado: string;
}

interface ModuleBeneficiariosProps {
  title: string;
  subtitle: string;
  unidadLabel?: string;
  data?: Beneficiario[];
}

// Datos de ejemplo
const defaultData: Beneficiario[] = [
  { id: 1, dni: "12345678", nombres: "María García López", jurisdiccion: "Canto Grande", unidad: "Unidad 01", estado: "Activo" },
  { id: 2, dni: "23456789", nombres: "Juan Pérez Huamán", jurisdiccion: "Zarate", unidad: "Unidad 02", estado: "Activo" },
  { id: 3, dni: "34567890", nombres: "Ana Torres Sánchez", jurisdiccion: "Mangomarca", unidad: "Unidad 03", estado: "Pendiente" },
  { id: 4, dni: "45678901", nombres: "Carlos Mendoza Quispe", jurisdiccion: "Bayovar", unidad: "Unidad 04", estado: "Activo" },
  { id: 5, dni: "56789012", nombres: "Rosa Fernández Villa", jurisdiccion: "Mariscal Cáceres", unidad: "Unidad 05", estado: "Inactivo" },
];

export default function ModuleBeneficiarios({
  title,
  subtitle,
  unidadLabel = "Unidad",
  data = defaultData,
}: ModuleBeneficiariosProps) {
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

  const filteredData = data.filter(
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
    <div>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        {subtitle}
      </Typography>

      <Card>
        <CardContent>
          <Box mb={3}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, DNI o jurisdicción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell>DNI</TableCell>
                  <TableCell>Nombres</TableCell>
                  <TableCell>Jurisdicción</TableCell>
                  <TableCell>{unidadLabel}</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.dni}</TableCell>
                      <TableCell>{row.nombres}</TableCell>
                      <TableCell>{row.jurisdiccion}</TableCell>
                      <TableCell>{row.unidad}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.estado}
                          color={getEstadoColor(row.estado) as "success" | "warning" | "error" | "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalles">
                          <IconButton size="small" color="primary">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" color="info">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

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
          />
        </CardContent>
      </Card>
    </div>
  );
}
