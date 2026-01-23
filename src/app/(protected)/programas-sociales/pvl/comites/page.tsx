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
  Groups,
  FilterList,
  FileDownload,
  Close,
  Visibility,
  Edit,
  Delete,
  Cake,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { useFetch } from "@/lib/hooks/useFetch";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];
// Función para calcular edad desde fecha de nacimiento
const calcularEdad = (fechaNacimiento: string | null | undefined): number => {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

// Función para formatear fecha a DD/MM/YYYY
const formatearFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return "-";
  const date = new Date(fecha);
  const dia = date.getDate().toString().padStart(2, "0");
  const mes = (date.getMonth() + 1).toString().padStart(2, "0");
  const anio = date.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

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
  fechaNacimientoCoordinadora: string | null;
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
  fechaNacimientoCoordinadora: item.coordinator?.birthday || null,
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

type FilterType = "beneficiarios" | "edad" | "cumpleanos";

// Nombres de los meses en español
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function PVLComitesPage() {
  const { getData } = useFetch();

  // Estados para datos
  const [allComitesData, setAllComitesData] = useState<ComiteFrontend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para paginación local
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("beneficiarios");
  const [beneficiariosRange, setBeneficiariosRange] = useState<number[]>([0, 200]);
  const [edadRange, setEdadRange] = useState<number[]>([0, 100]);
  const [mesesCumpleanos, setMesesCumpleanos] = useState<number[]>([]);
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  // Estados para detalle
  const [selectedComite, setSelectedComite] = useState<ComiteFrontend | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Función para cargar TODOS los datos del backend
  const fetchAllComites = useCallback(async () => {
    setIsLoading(true);
    try {
      // Primero obtener el total
      const firstResponse = await getData<BackendResponse>(`pvl/committee?page=1&limit=1`);
      const totalCount = firstResponse?.data?.totalCount || 0;

      if (totalCount > 0) {
        // Luego obtener todos los datos
        const response = await getData<BackendResponse>(
          `pvl/committee?page=1&limit=${totalCount}`
        );
        if (response?.data) {
          const mappedData = response.data.data.map(mapBackendToFrontend);
          setAllComitesData(mappedData);
        }
      }
    } catch (error) {
      console.error("Error fetching comités:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getData]);

  // Cargar todos los datos al montar
  useEffect(() => {
    fetchAllComites();
  }, [fetchAllComites]);

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

  const handleEdadChange = (_event: Event, newValue: number | number[]) => {
    setEdadRange(newValue as number[]);
  };

  const handleMesToggle = (mes: number) => {
    setMesesCumpleanos((prev) =>
      prev.includes(mes) ? prev.filter((m) => m !== mes) : [...prev, mes]
    );
  };

  const filterOpen = Boolean(filterAnchor);

  const isBeneficiariosFiltered = beneficiariosRange[0] > 0 || beneficiariosRange[1] < 100;
  const isEdadFiltered = edadRange[0] > 0 || edadRange[1] < 100;
  const isCumpleanosFiltered = mesesCumpleanos.length > 0;

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

  // Filtrar datos localmente sobre TODOS los datos
  const filteredData = allComitesData.filter((c: ComiteFrontend) => {
    const matchesSearch =
      c.comite.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.codigo.includes(searchTerm) ||
      c.coordinadora.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pueblo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBeneficiarios =
      c.beneficiarios >= beneficiariosRange[0] && c.beneficiarios <= beneficiariosRange[1];

    const edadCoordinadora = calcularEdad(c.fechaNacimientoCoordinadora);
    const matchesEdad =
      edadCoordinadora >= edadRange[0] && edadCoordinadora <= edadRange[1];

    // Filtro por mes de cumpleaños
    let matchesCumpleanos = true;
    if (mesesCumpleanos.length > 0 && c.fechaNacimientoCoordinadora) {
      const mesCumple = new Date(c.fechaNacimientoCoordinadora).getMonth();
      matchesCumpleanos = mesesCumpleanos.includes(mesCumple);
    } else if (mesesCumpleanos.length > 0 && !c.fechaNacimientoCoordinadora) {
      matchesCumpleanos = false;
    }

    return matchesSearch && matchesBeneficiarios && matchesEdad && matchesCumpleanos;
  });

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPage(0);
  }, [searchTerm, beneficiariosRange, edadRange, mesesCumpleanos]);

  // Datos paginados para mostrar en la tabla
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Exportar a Excel (exporta TODOS los datos filtrados, no solo la página actual)
  const handleExport = () => {
    const exportData = filteredData.map((c: ComiteFrontend) => ({
      Código: c.codigo,
      "Centro de Acopio": c.centroAcopio,
      Comité: c.comite,
      Beneficiarios: c.beneficiarios,
      Socios: c.socios,
      Coordinadora: c.coordinadora,
      "DNI Coordinadora": c.dniCoordinadora,
      "Teléfono Coordinadora": c.telefonoCoordinadora,
      "Fecha Nac. Coordinadora": formatearFecha(c.fechaNacimientoCoordinadora),
      "Edad Coordinadora": calcularEdad(c.fechaNacimientoCoordinadora),
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
                    onClick={() => setBeneficiariosRange([0, 100])}
                    sx={{ p: 0.25 }}
                  >
                    <Close sx={{ fontSize: 14, color: "#64748b" }} />
                  </IconButton>
                </Box>
              )}
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
                    Edad coordinadora: {edadRange[0]} - {edadRange[1]} años
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
                    {mesesCumpleanos.map((m) => MESES[m].slice(0, 3)).join(", ")}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setMesesCumpleanos([])}
                    sx={{ p: 0.25 }}
                  >
                    <Close sx={{ fontSize: 14, color: "#be185d" }} />
                  </IconButton>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                {filteredData.length.toLocaleString()} de {allComitesData.length.toLocaleString()} comité(s)
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
                      fontSize: "0.75rem",
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
                        {beneficiariosRange[0]} beneficiarios
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {beneficiariosRange[1]} beneficiarios
                      </Typography>
                    </Box>
                  </>
                )}

                {/* Filtro por edad de coordinadora */}
                {filterType === "edad" && (
                  <>
                    <Typography variant="body2" color="#475569" mb={1.5}>
                      Edad de la coordinadora
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

                {/* Filtro por mes de cumpleaños */}
                {filterType === "cumpleanos" && (
                  <>
                    <Typography variant="body2" color="#475569" mb={1.5}>
                      Mes de cumpleaños de la coordinadora
                    </Typography>
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
                )}

                <Box display="flex" justifyContent="flex-end" mt={2.5} gap={1}>
                  <Button
                    size="small"
                    onClick={() => {
                      setBeneficiariosRange([0, 100]);
                      setEdadRange([0, 100]);
                      setMesesCumpleanos([]);
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
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron comités
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row: ComiteFrontend, index: number) => (
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
              count={filteredData.length}
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
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Fecha de Nacimiento</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedComite.fechaNacimientoCoordinadora
                    ? `${formatearFecha(selectedComite.fechaNacimientoCoordinadora)} (${calcularEdad(selectedComite.fechaNacimientoCoordinadora)} años)`
                    : "-"}
                </Typography>
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
