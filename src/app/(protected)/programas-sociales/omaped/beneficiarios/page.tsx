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
  Chip,
} from "@mui/material";
import {
  Search,
  FilterList,
  FileDownload,
  Close,
  Visibility,
  Cake,
  Accessible,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];
const OMAPED_COLOR = subgerencia.color;
const BATCH_SIZE = 500;

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
  const date = new Date(fecha);
  const dia = date.getUTCDate().toString().padStart(2, "0");
  const mes = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const anio = date.getUTCFullYear();
  return `${dia}/${mes}/${anio}`;
};

// Traducciones
const TRADUCCIONES: Record<string, Record<string, string>> = {
  sex: {
    MALE: "Masculino",
    FEMALE: "Femenino",
  },
  civil: {
    SINGLE: "Soltero(a)",
    MARRIED: "Casado(a)",
    DIVORCED: "Divorciado(a)",
    WIDOWED: "Viudo(a)",
    COHABITANT: "Conviviente",
  },
  health: {
    SIS: "SIS",
    ESSALUD: "EsSalud",
    PRIVATE: "Privado",
    NONE: "Sin seguro",
    OTHER: "Otro",
  },
  disability_grade: {
    MILD: "Leve",
    MODERATE: "Moderado",
    SEVERE: "Severo",
    VERY_SEVERE: "Muy Severo",
  },
  disability_type: {
    PHYSICAL: "Física",
    VISUAL: "Visual",
    HEARING: "Auditiva",
    MENTAL: "Mental",
    INTELLECTUAL: "Intelectual",
    MULTIPLE: "Múltiple",
    OTHER: "Otra",
  },
};

const traducir = (categoria: string, valor: string | null | undefined): string => {
  if (!valor) return "-";
  return TRADUCCIONES[categoria]?.[valor] || valor;
};

// Colores para grado de discapacidad
const DISABILITY_GRADE_COLORS: Record<string, { bg: string; color: string }> = {
  "Leve": { bg: "#fef9c3", color: "#854d0e" },
  "Moderado": { bg: "#fed7aa", color: "#9a3412" },
  "Severo": { bg: "#fecaca", color: "#991b1b" },
  "Muy Severo": { bg: "#e9d5ff", color: "#6b21a8" },
};

// Meses en español
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// ============================================
// INTERFACES BACKEND
// ============================================
interface RelatedEntity {
  id: string;
  name: string;
}

interface BeneficiarioOMAPEDBackend {
  id: string;
  doc_num: string;
  name: string;
  lastname: string;
  birthday: string;
  cellphone: string | null;
  telephone: string | null;
  address: string | null;
  sex: string;
  civil: string;
  health: string | null;
  disability_grade: string | null;
  disability_type: string | null;
  conadis: boolean;
  conadis_code: string | null;
  observation: string | null;
  registered_at: string | null;
  created_at: string;
  district_live: RelatedEntity | null;
  province_live: RelatedEntity | null;
  department_live: RelatedEntity | null;
  education: RelatedEntity | null;
  ethnic: RelatedEntity | null;
}

interface BackendResponse {
  message: string;
  data: {
    data: BeneficiarioOMAPEDBackend[];
    currentPage: number;
    pageCount: number;
    totalCount: number;
    totalPages: number;
  };
}

// ============================================
// INTERFACE FRONTEND
// ============================================
interface BeneficiarioTabla {
  id: string;
  docNum: string;
  nombreCompleto: string;
  celular: string;
  fechaNacimiento: string;
  edad: number;
  gradoDiscapacidad: string;
  tipoDiscapacidad: string;
  direccion: string;
  sexo: string;
  estadoCivil: string;
  salud: string;
  conadis: boolean;
  conadisCode: string;
  observacion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  educacion: string;
  etnia: string;
  telefono: string;
  fechaRegistro: string;
}

const mapBackendToTabla = (item: BeneficiarioOMAPEDBackend): BeneficiarioTabla => ({
  id: item.id,
  docNum: item.doc_num || "-",
  nombreCompleto: `${item.name} ${item.lastname}`.trim(),
  celular: item.cellphone || "-",
  fechaNacimiento: item.birthday,
  edad: calcularEdad(item.birthday),
  gradoDiscapacidad: traducir("disability_grade", item.disability_grade),
  tipoDiscapacidad: traducir("disability_type", item.disability_type),
  direccion: item.address || "-",
  sexo: traducir("sex", item.sex),
  estadoCivil: traducir("civil", item.civil),
  salud: traducir("health", item.health),
  conadis: item.conadis,
  conadisCode: item.conadis_code || "-",
  observacion: item.observation || "-",
  distrito: item.district_live?.name || "-",
  provincia: item.province_live?.name || "-",
  departamento: item.department_live?.name || "-",
  educacion: item.education?.name || "-",
  etnia: item.ethnic?.name || "-",
  telefono: item.telephone || "-",
  fechaRegistro: item.registered_at || item.created_at,
});

// Tipo de filtro
type FilterType = "edad" | "cumpleanos";
type CumpleanosModo = "mes" | "dia";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function OMAPEDBeneficiariosPage() {
  const { getData } = useFetch();

  // Estados para datos
  const [allData, setAllData] = useState<BeneficiarioTabla[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para paginación local
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("edad");
  const [edadRange, setEdadRange] = useState<number[]>([0, 100]);
  const [mesesCumpleanos, setMesesCumpleanos] = useState<number[]>([]);
  const [cumpleanosModo, setCumpleanosModo] = useState<CumpleanosModo>("mes");
  const [diaCumpleanos, setDiaCumpleanos] = useState<string>("");
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  // Estados para detalle
  const [selectedRow, setSelectedRow] = useState<BeneficiarioTabla | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Cargar todos los datos del backend en lotes
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const firstResponse = await getData<BackendResponse>(`omaped/benefited?page=1&limit=1`);
      const totalCount = firstResponse?.data?.totalCount || 0;

      if (totalCount > 0) {
        const totalPages = Math.ceil(totalCount / BATCH_SIZE);
        const allItems: BeneficiarioTabla[] = [];

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const response = await getData<BackendResponse>(
            `omaped/benefited?page=${pageNum}&limit=${BATCH_SIZE}`
          );
          if (response?.data?.data) {
            allItems.push(...response.data.data.map(mapBackendToTabla));
          }
        }

        setAllData(allItems);
      }
    } catch (error) {
      console.error("Error fetching OMAPED beneficiarios:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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

  const handleEdadChange = (_event: Event, newValue: number | number[]) => {
    setEdadRange(newValue as number[]);
  };

  const handleMesToggle = (mes: number) => {
    setMesesCumpleanos((prev) =>
      prev.includes(mes) ? prev.filter((m) => m !== mes) : [...prev, mes]
    );
  };

  const filterOpen = Boolean(filterAnchor);

  const isEdadFiltered = edadRange[0] > 0 || edadRange[1] < 100;
  const isCumpleanosFiltered =
    cumpleanosModo === "mes" ? mesesCumpleanos.length > 0 : diaCumpleanos !== "";

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (row: BeneficiarioTabla) => {
    setSelectedRow(row);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedRow(null);
  };

  // Formatear strings del backend (Title Case)
  const allDataFormateados = useFormatTableData(allData);

  // Filtrar datos localmente
  const filteredData = allDataFormateados.filter((row: BeneficiarioTabla) => {
    const matchesSearch =
      row.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.docNum.includes(searchTerm) ||
      row.celular.includes(searchTerm);

    const matchesEdad = row.edad >= edadRange[0] && row.edad <= edadRange[1];

    let matchesCumpleanos = true;
    if (cumpleanosModo === "mes" && mesesCumpleanos.length > 0) {
      if (row.fechaNacimiento) {
        const mesCumple = new Date(row.fechaNacimiento).getUTCMonth();
        matchesCumpleanos = mesesCumpleanos.includes(mesCumple);
      } else {
        matchesCumpleanos = false;
      }
    } else if (cumpleanosModo === "dia" && diaCumpleanos) {
      if (row.fechaNacimiento) {
        const fechaNac = new Date(row.fechaNacimiento);
        const [, mes, dia] = diaCumpleanos.split("-").map(Number);
        matchesCumpleanos =
          fechaNac.getUTCMonth() + 1 === mes && fechaNac.getUTCDate() === dia;
      } else {
        matchesCumpleanos = false;
      }
    }

    return matchesSearch && matchesEdad && matchesCumpleanos;
  });

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPage(0);
  }, [searchTerm, edadRange, mesesCumpleanos, cumpleanosModo, diaCumpleanos]);

  // Datos paginados
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Exportar a Excel
  const handleExport = () => {
    const exportData = filteredData.map((row: BeneficiarioTabla) => ({
      "Nombre Completo": row.nombreCompleto,
      DNI: row.docNum,
      Celular: row.celular,
      "Fecha de Nacimiento": formatearFecha(row.fechaNacimiento),
      Edad: row.edad,
      "Grado de Discapacidad": row.gradoDiscapacidad,
      "Tipo de Discapacidad": row.tipoDiscapacidad,
      Dirección: row.direccion,
      Sexo: row.sexo,
      "Estado Civil": row.estadoCivil,
      Salud: row.salud,
      CONADIS: row.conadis ? "Sí" : "No",
      "Código CONADIS": row.conadisCode,
      Distrito: row.distrito,
      Provincia: row.provincia,
      Departamento: row.departamento,
      Educación: row.educacion,
      Observación: row.observacion,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "OMAPED Beneficiarios");

    const colWidths = Object.keys(exportData[0] || {}).map(() => ({ wch: 20 }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(
      workbook,
      `omaped_beneficiarios_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <Box>
      {/* Encabezado */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${OMAPED_COLOR}15 0%, ${OMAPED_COLOR}30 100%)`,
              color: OMAPED_COLOR,
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              boxShadow: `0 4px 12px ${OMAPED_COLOR}25`,
            }}
          >
            <Accessible sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: OMAPED_COLOR }}>
            OMAPED - Beneficiarios
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 7.5 }}>
          Listado de personas registradas en OMAPED
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
                placeholder="Buscar por nombre, DNI o celular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                    "&:hover fieldset": { borderColor: "#64748b" },
                    "&.Mui-focused fieldset": { borderColor: OMAPED_COLOR },
                  },
                }}
              />
              <Tooltip title="Filtrar por edad y cumpleaños">
                <IconButton
                  onClick={handleFilterClick}
                  sx={{
                    backgroundColor: filterOpen ? "#e2e8f0" : "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    "&:hover": { backgroundColor: "#e2e8f0" },
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
                    {cumpleanosModo === "mes"
                      ? mesesCumpleanos.map((m) => MESES[m].slice(0, 3)).join(", ")
                      : diaCumpleanos.split("-").slice(1).reverse().join("/")}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setMesesCumpleanos([]);
                      setDiaCumpleanos("");
                    }}
                    sx={{ p: 0.25 }}
                  >
                    <Close sx={{ fontSize: 14, color: "#be185d" }} />
                  </IconButton>
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                {filteredData.length.toLocaleString()} de {allData.length.toLocaleString()} beneficiario(s)
              </Typography>
            </Box>

            {/* Popover de filtros */}
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
                      Rango de edad del beneficiario
                    </Typography>
                    <Slider
                      value={edadRange}
                      onChange={handleEdadChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={100}
                      sx={{
                        color: OMAPED_COLOR,
                        "& .MuiSlider-thumb": { backgroundColor: OMAPED_COLOR },
                        "& .MuiSlider-track": { backgroundColor: OMAPED_COLOR },
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
                      Cumpleaños del beneficiario
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
                              variant={mesesCumpleanos.includes(index) ? "contained" : "outlined"}
                              onClick={() => handleMesToggle(index)}
                              sx={{
                                textTransform: "none",
                                fontSize: "0.7rem",
                                py: 0.5,
                                px: 1,
                                minWidth: 0,
                                borderColor: mesesCumpleanos.includes(index) ? "#be185d" : "#e2e8f0",
                                backgroundColor: mesesCumpleanos.includes(index)
                                  ? "#be185d"
                                  : "transparent",
                                color: mesesCumpleanos.includes(index) ? "white" : "#64748b",
                                "&:hover": {
                                  backgroundColor: mesesCumpleanos.includes(index)
                                    ? "#9d174d"
                                    : "#fce7f3",
                                  borderColor: "#be185d",
                                },
                              }}
                            >
                              {mes.slice(0, 3)}
                            </Button>
                          ))}
                        </Box>
                        {mesesCumpleanos.length > 0 && (
                          <Typography
                            variant="caption"
                            color="#be185d"
                            sx={{ mt: 1, display: "block" }}
                          >
                            {mesesCumpleanos.length} mes(es) seleccionado(s)
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
                            "&.Mui-focused fieldset": { borderColor: "#be185d" },
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
                      setMesesCumpleanos([]);
                      setCumpleanosModo("mes");
                      setDiaCumpleanos("");
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
                      backgroundColor: OMAPED_COLOR,
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#1565c0" },
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
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Nombre Completo</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>DNI</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Celular</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Edad</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Grado Discapacidad</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Dirección</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={32} sx={{ color: OMAPED_COLOR }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Cargando beneficiarios...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron beneficiarios
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row: BeneficiarioTabla, index: number) => {
                      const gradeColors = DISABILITY_GRADE_COLORS[row.gradoDiscapacidad] || {
                        bg: "#f1f5f9",
                        color: "#475569",
                      };
                      return (
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
                          <TableCell sx={{ fontWeight: 500 }}>{row.nombreCompleto}</TableCell>
                          <TableCell>{row.docNum}</TableCell>
                          <TableCell>{row.celular}</TableCell>
                          <TableCell>
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
                              <Typography variant="caption" color="text.secondary">
                                {formatearFecha(row.fechaNacimiento)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {row.gradoDiscapacidad !== "-" ? (
                              <Chip
                                label={row.gradoDiscapacidad}
                                size="small"
                                sx={{
                                  backgroundColor: gradeColors.bg,
                                  color: gradeColors.color,
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.direccion}
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
                                  "&:hover": { backgroundColor: "#f1f5f9" },
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
                "& .MuiTablePagination-selectIcon": { color: "#64748b" },
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
          sx: { borderRadius: "16px" },
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
            <Accessible sx={{ color: OMAPED_COLOR }} />
            <Typography variant="h6" fontWeight={600} color="#334155">
              Detalle del Beneficiario
            </Typography>
          </Box>
          <IconButton onClick={handleDetailClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, mt: 1 }}>
          {selectedRow && (
            <Grid container spacing={3}>
              {/* Datos Personales */}
              <Grid size={12}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="#475569"
                  gutterBottom
                >
                  Datos Personales
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Nombre Completo
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.nombreCompleto}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  DNI
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.docNum}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Sexo
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.sexo}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Estado Civil
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.estadoCivil}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Fecha de Nacimiento
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearFecha(selectedRow.fechaNacimiento)}{" "}
                  <span style={{ color: "#64748b", fontWeight: 400 }}>
                    ({selectedRow.edad} años)
                  </span>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Seguro de Salud
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.salud}
                </Typography>
              </Grid>

              {/* Contacto y Ubicación */}
              <Grid size={12}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="#475569"
                  gutterBottom
                  sx={{ mt: 2 }}
                >
                  Contacto y Ubicación
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Celular
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.celular}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Teléfono
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.telefono}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Distrito
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.distrito}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Provincia
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.provincia}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Departamento
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.departamento}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Dirección
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.direccion}
                </Typography>
              </Grid>

              {/* Discapacidad */}
              <Grid size={12}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="#475569"
                  gutterBottom
                  sx={{ mt: 2 }}
                >
                  Información sobre Discapacidad
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Grado de Discapacidad
                </Typography>
                <Box mt={0.5}>
                  {selectedRow.gradoDiscapacidad !== "-" ? (
                    <Chip
                      label={selectedRow.gradoDiscapacidad}
                      size="small"
                      sx={{
                        backgroundColor:
                          DISABILITY_GRADE_COLORS[selectedRow.gradoDiscapacidad]?.bg || "#f1f5f9",
                        color:
                          DISABILITY_GRADE_COLORS[selectedRow.gradoDiscapacidad]?.color ||
                          "#475569",
                        fontWeight: 600,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" fontWeight={500}>
                      -
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Tipo de Discapacidad
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.tipoDiscapacidad}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Registrado en CONADIS
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.conadis ? "Sí" : "No"}
                </Typography>
              </Grid>
              {selectedRow.conadis && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Código CONADIS
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedRow.conadisCode}
                  </Typography>
                </Grid>
              )}

              {/* Información adicional */}
              <Grid size={12}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="#475569"
                  gutterBottom
                  sx={{ mt: 2 }}
                >
                  Información Adicional
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Educación
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.educacion}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Etnia
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedRow.etnia}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Fecha de Registro
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearFecha(selectedRow.fechaRegistro)}
                </Typography>
              </Grid>

              {/* Observaciones */}
              {selectedRow.observacion !== "-" && (
                <>
                  <Grid size={12}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="#475569"
                      gutterBottom
                      sx={{ mt: 2 }}
                    >
                      Observaciones
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="body2">{selectedRow.observacion}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={handleDetailClose}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
