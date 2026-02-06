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
  Elderly,
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
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";

const CIAM_COLOR = "#9c27b0";

// ============================================
// UTILIDADES
// ============================================
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

const formatearFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return "-";
  const date = new Date(fecha);
  const dia = date.getDate().toString().padStart(2, "0");
  const mes = (date.getMonth() + 1).toString().padStart(2, "0");
  const anio = date.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

// ============================================
// INTERFACES
// ============================================
interface BeneficiarioBackend {
  id: string;
  name: string;
  lastname: string;
  dni: string;
  birthday: string;
  poverty_level: string;
  health_insurance: string;
  can_read_write: boolean;
  profession: string;
  address?: string;
  phone?: string;
  observation?: string;
}

interface BackendResponse {
  message: string;
  data: {
    data: BeneficiarioBackend[];
    currentPage: number;
    pageCount: number;
    totalCount: number;
    totalPages: number;
  };
}

interface BeneficiarioFrontend {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  edad: number;
  nivelPobreza: string;
  seguroSalud: string;
  sabeLeerEscribir: boolean;
  profesion: string;
  direccion: string;
  telefono: string;
  observaciones: string | null;
}

// ============================================
// MAPEO BACKEND -> FRONTEND
// ============================================
const mapBackendToFrontend = (item: BeneficiarioBackend): BeneficiarioFrontend => ({
  id: item.id,
  nombre: item.name,
  apellido: item.lastname,
  dni: item.dni,
  fechaNacimiento: item.birthday,
  edad: calcularEdad(item.birthday),
  nivelPobreza: item.poverty_level || "Sin clasificar",
  seguroSalud: item.health_insurance || "Sin seguro",
  sabeLeerEscribir: item.can_read_write,
  profesion: item.profession || "Sin profesión",
  direccion: item.address || "-",
  telefono: item.phone || "-",
  observaciones: item.observation || null,
});

// ============================================
// DATA DEMO
// ============================================
const generarDataDemo = (): BeneficiarioBackend[] => {
  const nombres = ["María", "Rosa", "Carmen", "Julia", "Elena", "Ana", "Luisa", "Teresa", "Martha", "Gloria", "Pedro", "Juan", "Carlos", "José", "Manuel", "Luis", "Alberto", "Jorge", "Ricardo", "Francisco"];
  const apellidos = ["García", "López", "Martínez", "Rodríguez", "Hernández", "Flores", "Torres", "Ramos", "Quispe", "Mamani", "Huamán", "Chávez", "Mendoza", "Sánchez", "Cruz", "Vargas", "Rojas", "Díaz", "Castillo", "Morales"];
  const niveles = ["No pobre", "No pobre", "No pobre", "Pobre", "Pobre", "Pobre", "Pobre", "Pobre extremo", "Pobre extremo", "Sin clasificar"];
  const seguros = ["SIS", "SIS", "SIS", "SIS", "SIS", "EsSalud", "EsSalud", "EsSalud", "Sin seguro", "Sin seguro", "Sin seguro", "Seguro privado", "Otro"];
  const profesiones = [
    "Ama de casa", "Ama de casa", "Ama de casa", "Ama de casa",
    "Comerciante", "Comerciante", "Comerciante",
    "Agricultor", "Agricultor",
    "Albañil", "Albañil",
    "Costurera", "Costurera",
    "Carpintero", "Docente", "Chofer", "Mecánico", "Enfermera",
    "Vendedor ambulante", "Sin profesión", "Sastre", "Zapatero",
  ];
  const direcciones = [
    "Jr. Los Pinos 234", "Av. Canto Grande 1500", "Mz. A Lt. 5 Bayóvar", "Jr. Las Flores 890",
    "Av. El Sol 445", "Psje. Los Olivos 12", "Jr. Huáscar 678", "Calle San Martín 321",
    "Av. Próceres 1200", "Mz. C Lt. 10 Huayrona", "Jr. Tupac Amaru 555", "Av. Wiesse 2100",
  ];

  const data: BeneficiarioBackend[] = [];
  for (let i = 0; i < 347; i++) {
    const añoNac = 1935 + Math.floor(Math.random() * 30);
    const mesNac = 1 + Math.floor(Math.random() * 12);
    const diaNac = 1 + Math.floor(Math.random() * 28);
    data.push({
      id: `ciam-${String(i + 1).padStart(4, "0")}`,
      name: nombres[Math.floor(Math.random() * nombres.length)],
      lastname: apellidos[Math.floor(Math.random() * apellidos.length)],
      dni: String(10000000 + Math.floor(Math.random() * 89999999)),
      birthday: `${añoNac}-${String(mesNac).padStart(2, "0")}-${String(diaNac).padStart(2, "0")}`,
      poverty_level: niveles[Math.floor(Math.random() * niveles.length)],
      health_insurance: seguros[Math.floor(Math.random() * seguros.length)],
      can_read_write: Math.random() > 0.28,
      profession: profesiones[Math.floor(Math.random() * profesiones.length)],
      address: direcciones[Math.floor(Math.random() * direcciones.length)],
      phone: `9${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
    });
  }
  return data;
};

// ============================================
// CONSTANTES
// ============================================
type FilterType = "edad" | "cumpleanos" | "pobreza" | "seguro";
type CumpleanosModo = "mes" | "dia";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const NIVELES_POBREZA = ["No pobre", "Pobre", "Pobre extremo", "Sin clasificar"];
const SEGUROS_SALUD = ["SIS", "EsSalud", "Seguro privado", "Sin seguro", "Otro"];

const POBREZA_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
  "No pobre": { bg: "#e8f5e9", color: "#2e7d32" },
  "Pobre": { bg: "#fff3e0", color: "#e65100" },
  "Pobre extremo": { bg: "#ffebee", color: "#c62828" },
  "Sin clasificar": { bg: "#f5f5f5", color: "#757575" },
};

const SEGURO_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
  SIS: { bg: "#e3f2fd", color: "#1565c0" },
  EsSalud: { bg: "#e8f5e9", color: "#2e7d32" },
  "Seguro privado": { bg: "#f3e5f5", color: "#7b1fa2" },
  "Sin seguro": { bg: "#ffebee", color: "#c62828" },
  Otro: { bg: "#fff3e0", color: "#e65100" },
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function CIAMBeneficiariosPage() {
  const { getData } = useFetch();

  const [allData, setAllData] = useState<BeneficiarioFrontend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usandoDemo, setUsandoDemo] = useState(false);

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("edad");
  const [edadRange, setEdadRange] = useState<number[]>([60, 100]);
  const [mesesCumpleanos, setMesesCumpleanos] = useState<number[]>([]);
  const [cumpleanosModo, setCumpleanosModo] = useState<CumpleanosModo>("mes");
  const [diaCumpleanos, setDiaCumpleanos] = useState<string>("");
  const [nivelesPobreza, setNivelesPobreza] = useState<string[]>([]);
  const [segurosSeleccionados, setSegurosSeleccionados] = useState<string[]>([]);
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  // Detalle
  const [selectedBeneficiario, setSelectedBeneficiario] = useState<BeneficiarioFrontend | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Cargar datos
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const firstResponse = await getData<BackendResponse>(`ciam/beneficiary?page=1&limit=1`);
      const totalCount = firstResponse?.data?.totalCount || 0;
      if (totalCount > 0) {
        const response = await getData<BackendResponse>(`ciam/beneficiary?page=1&limit=${totalCount}`);
        if (response?.data?.data) {
          setAllData(response.data.data.map(mapBackendToFrontend));
          setUsandoDemo(false);
          return;
        }
      }
      setAllData(generarDataDemo().map(mapBackendToFrontend));
      setUsandoDemo(true);
    } catch {
      setAllData(generarDataDemo().map(mapBackendToFrontend));
      setUsandoDemo(true);
    } finally {
      setIsLoading(false);
    }
  }, [getData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers de filtros
  const handleFilterClick = (e: React.MouseEvent<HTMLButtonElement>) => setFilterAnchor(e.currentTarget);
  const handleFilterClose = () => setFilterAnchor(null);
  const handleFilterTypeChange = (_: React.MouseEvent<HTMLElement>, v: FilterType | null) => {
    if (v !== null) setFilterType(v);
  };
  const handleEdadChange = (_: Event, v: number | number[]) => setEdadRange(v as number[]);
  const handleMesToggle = (mes: number) => {
    setMesesCumpleanos((prev) => prev.includes(mes) ? prev.filter((m) => m !== mes) : [...prev, mes]);
  };
  const handlePobrezaToggle = (nivel: string) => {
    setNivelesPobreza((prev) => prev.includes(nivel) ? prev.filter((n) => n !== nivel) : [...prev, nivel]);
  };
  const handleSeguroToggle = (seguro: string) => {
    setSegurosSeleccionados((prev) => prev.includes(seguro) ? prev.filter((s) => s !== seguro) : [...prev, seguro]);
  };

  const filterOpen = Boolean(filterAnchor);
  const isEdadFiltered = edadRange[0] > 60 || edadRange[1] < 100;
  const isCumpleanosFiltered = cumpleanosModo === "mes" ? mesesCumpleanos.length > 0 : diaCumpleanos !== "";
  const isPobrezaFiltered = nivelesPobreza.length > 0;
  const isSeguroFiltered = segurosSeleccionados.length > 0;

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const handleRowClick = (b: BeneficiarioFrontend) => {
    setSelectedBeneficiario(b);
    setDetailOpen(true);
  };
  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedBeneficiario(null);
  };

  // Formatear datos
  const allDataFormateados = useFormatTableData(allData);

  // Filtrar
  const filteredData = allDataFormateados.filter((b: BeneficiarioFrontend) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      b.nombre.toLowerCase().includes(term) ||
      b.apellido.toLowerCase().includes(term) ||
      b.dni.includes(searchTerm) ||
      b.profesion.toLowerCase().includes(term);

    const matchesEdad = b.edad >= edadRange[0] && b.edad <= edadRange[1];

    let matchesCumpleanos = true;
    if (cumpleanosModo === "mes" && mesesCumpleanos.length > 0) {
      if (b.fechaNacimiento) {
        const mesCumple = new Date(b.fechaNacimiento).getMonth();
        matchesCumpleanos = mesesCumpleanos.includes(mesCumple);
      } else {
        matchesCumpleanos = false;
      }
    } else if (cumpleanosModo === "dia" && diaCumpleanos) {
      if (b.fechaNacimiento) {
        const fechaNac = new Date(b.fechaNacimiento);
        const [, mes, dia] = diaCumpleanos.split("-").map(Number);
        matchesCumpleanos = fechaNac.getMonth() + 1 === mes && fechaNac.getDate() === dia;
      } else {
        matchesCumpleanos = false;
      }
    }

    const matchesPobreza = nivelesPobreza.length === 0 || nivelesPobreza.includes(b.nivelPobreza);
    const matchesSeguro = segurosSeleccionados.length === 0 || segurosSeleccionados.includes(b.seguroSalud);

    return matchesSearch && matchesEdad && matchesCumpleanos && matchesPobreza && matchesSeguro;
  });

  // Resetear página al filtrar
  useEffect(() => {
    setPage(0);
  }, [searchTerm, edadRange, mesesCumpleanos, cumpleanosModo, diaCumpleanos, nivelesPobreza, segurosSeleccionados]);

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Exportar a Excel
  const handleExport = () => {
    const exportData = filteredData.map((b: BeneficiarioFrontend) => ({
      "Nombre": b.nombre,
      "Apellido": b.apellido,
      "DNI": b.dni,
      "Fecha Nacimiento": formatearFecha(b.fechaNacimiento),
      "Edad": b.edad,
      "Nivel de Pobreza": b.nivelPobreza,
      "Seguro de Salud": b.seguroSalud,
      "Sabe Leer/Escribir": b.sabeLeerEscribir ? "Sí" : "No",
      "Profesión": b.profesion,
      "Dirección": b.direccion,
      "Teléfono": b.telefono,
      "Observaciones": b.observaciones || "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Beneficiarios CIAM");
    worksheet["!cols"] = Object.keys(exportData[0] || {}).map(() => ({ wch: 20 }));
    XLSX.writeFile(workbook, `beneficiarios_ciam_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const limpiarFiltros = () => {
    setEdadRange([60, 100]);
    setMesesCumpleanos([]);
    setCumpleanosModo("mes");
    setDiaCumpleanos("");
    setNivelesPobreza([]);
    setSegurosSeleccionados([]);
  };

  return (
    <Box>
      {/* Encabezado */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${CIAM_COLOR}15 0%, ${CIAM_COLOR}30 100%)`,
              color: CIAM_COLOR,
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              boxShadow: `0 4px 12px ${CIAM_COLOR}25`,
            }}
          >
            <Elderly sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: CIAM_COLOR }}>
            CIAM - Beneficiarios
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 7.5 }}>
          Listado de adultos mayores registrados en el programa CIAM
        </Typography>
        {usandoDemo && !isLoading && (
          <Chip
            label="Mostrando datos de demostración"
            size="small"
            sx={{
              mt: 1,
              ml: 7.5,
              backgroundColor: "#fff3e0",
              color: "#e65100",
              fontWeight: 600,
              border: "1px solid #ffcc80",
            }}
          />
        )}
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
                placeholder="Buscar por nombre, DNI o profesión..."
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
                    "&.Mui-focused fieldset": { borderColor: "#475569" },
                  },
                }}
              />
              <Tooltip title="Filtros avanzados">
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
                    "&:hover": { backgroundColor: "#dcfce7", borderColor: "#22c55e" },
                  }}
                >
                  <FileDownload sx={{ color: "#22c55e", fontSize: 20 }} />
                </IconButton>
              </Tooltip>

              {/* Chips de filtros activos */}
              {isEdadFiltered && (
                <Box sx={{ backgroundColor: "#f3e5f5", borderRadius: "16px", px: 1.5, py: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="caption" color="#7b1fa2">
                    Edad: {edadRange[0]} - {edadRange[1]} años
                  </Typography>
                  <IconButton size="small" onClick={() => setEdadRange([60, 100])} sx={{ p: 0.25 }}>
                    <Close sx={{ fontSize: 14, color: "#7b1fa2" }} />
                  </IconButton>
                </Box>
              )}
              {isCumpleanosFiltered && (
                <Box sx={{ backgroundColor: "#fce7f3", borderRadius: "16px", px: 1.5, py: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Cake sx={{ fontSize: 14, color: "#be185d" }} />
                  <Typography variant="caption" color="#be185d">
                    {cumpleanosModo === "mes"
                      ? mesesCumpleanos.map((m) => MESES[m].slice(0, 3)).join(", ")
                      : diaCumpleanos.split("-").slice(1).reverse().join("/")}
                  </Typography>
                  <IconButton size="small" onClick={() => { setMesesCumpleanos([]); setDiaCumpleanos(""); }} sx={{ p: 0.25 }}>
                    <Close sx={{ fontSize: 14, color: "#be185d" }} />
                  </IconButton>
                </Box>
              )}
              {isPobrezaFiltered && (
                <Box sx={{ backgroundColor: "#fff3e0", borderRadius: "16px", px: 1.5, py: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="caption" color="#e65100">
                    Pobreza: {nivelesPobreza.length}
                  </Typography>
                  <IconButton size="small" onClick={() => setNivelesPobreza([])} sx={{ p: 0.25 }}>
                    <Close sx={{ fontSize: 14, color: "#e65100" }} />
                  </IconButton>
                </Box>
              )}
              {isSeguroFiltered && (
                <Box sx={{ backgroundColor: "#e3f2fd", borderRadius: "16px", px: 1.5, py: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="caption" color="#1565c0">
                    Seguro: {segurosSeleccionados.length}
                  </Typography>
                  <IconButton size="small" onClick={() => setSegurosSeleccionados([])} sx={{ p: 0.25 }}>
                    <Close sx={{ fontSize: 14, color: "#1565c0" }} />
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
                  <ToggleButton value="edad" sx={{ textTransform: "none", fontSize: "0.7rem", "&.Mui-selected": { backgroundColor: "#f3e5f5", color: "#7b1fa2", "&:hover": { backgroundColor: "#e1bee7" } } }}>
                    Edad
                  </ToggleButton>
                  <ToggleButton value="cumpleanos" sx={{ textTransform: "none", fontSize: "0.7rem", "&.Mui-selected": { backgroundColor: "#fce7f3", color: "#be185d", "&:hover": { backgroundColor: "#fbcfe8" } } }}>
                    Cumple
                  </ToggleButton>
                  <ToggleButton value="pobreza" sx={{ textTransform: "none", fontSize: "0.7rem", "&.Mui-selected": { backgroundColor: "#fff3e0", color: "#e65100", "&:hover": { backgroundColor: "#ffe0b2" } } }}>
                    Pobreza
                  </ToggleButton>
                  <ToggleButton value="seguro" sx={{ textTransform: "none", fontSize: "0.7rem", "&.Mui-selected": { backgroundColor: "#e3f2fd", color: "#1565c0", "&:hover": { backgroundColor: "#bbdefb" } } }}>
                    Seguro
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
                      min={60}
                      max={100}
                      sx={{
                        color: CIAM_COLOR,
                        "& .MuiSlider-thumb": { backgroundColor: "#7b1fa2" },
                        "& .MuiSlider-track": { backgroundColor: CIAM_COLOR },
                      }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">{edadRange[0]} años</Typography>
                      <Typography variant="caption" color="text.secondary">{edadRange[1]} años</Typography>
                    </Box>
                  </>
                )}

                {/* Filtro por cumpleaños */}
                {filterType === "cumpleanos" && (
                  <>
                    <Typography variant="body2" color="#475569" mb={1.5}>
                      Cumpleaños del adulto mayor
                    </Typography>
                    <ToggleButtonGroup
                      value={cumpleanosModo}
                      exclusive
                      onChange={(_, v) => v && setCumpleanosModo(v)}
                      size="small"
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      <ToggleButton value="mes" sx={{ textTransform: "none", fontSize: "0.75rem", "&.Mui-selected": { backgroundColor: "#fce7f3", color: "#be185d", "&:hover": { backgroundColor: "#fbcfe8" } } }}>
                        Por mes
                      </ToggleButton>
                      <ToggleButton value="dia" sx={{ textTransform: "none", fontSize: "0.75rem", "&.Mui-selected": { backgroundColor: "#fce7f3", color: "#be185d", "&:hover": { backgroundColor: "#fbcfe8" } } }}>
                        Día específico
                      </ToggleButton>
                    </ToggleButtonGroup>

                    {cumpleanosModo === "mes" ? (
                      <>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.75 }}>
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
                    ) : (
                      <TextField
                        type="date"
                        value={diaCumpleanos}
                        onChange={(e) => setDiaCumpleanos(e.target.value)}
                        fullWidth
                        size="small"
                        helperText="Filtra por día y mes de nacimiento"
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: "8px", "&.Mui-focused fieldset": { borderColor: "#be185d" } },
                        }}
                      />
                    )}
                  </>
                )}

                {/* Filtro por nivel de pobreza */}
                {filterType === "pobreza" && (
                  <>
                    <Typography variant="body2" color="#475569" mb={1.5}>
                      Nivel de pobreza
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                      {NIVELES_POBREZA.map((nivel) => (
                        <Button
                          key={nivel}
                          size="small"
                          variant={nivelesPobreza.includes(nivel) ? "contained" : "outlined"}
                          onClick={() => handlePobrezaToggle(nivel)}
                          sx={{
                            textTransform: "none",
                            fontSize: "0.8rem",
                            justifyContent: "flex-start",
                            borderColor: nivelesPobreza.includes(nivel) ? "#e65100" : "#e2e8f0",
                            backgroundColor: nivelesPobreza.includes(nivel) ? "#e65100" : "transparent",
                            color: nivelesPobreza.includes(nivel) ? "white" : "#64748b",
                            "&:hover": {
                              backgroundColor: nivelesPobreza.includes(nivel) ? "#bf360c" : "#fff3e0",
                              borderColor: "#e65100",
                            },
                          }}
                        >
                          {nivel}
                        </Button>
                      ))}
                    </Box>
                  </>
                )}

                {/* Filtro por seguro de salud */}
                {filterType === "seguro" && (
                  <>
                    <Typography variant="body2" color="#475569" mb={1.5}>
                      Seguro de salud
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                      {SEGUROS_SALUD.map((seguro) => (
                        <Button
                          key={seguro}
                          size="small"
                          variant={segurosSeleccionados.includes(seguro) ? "contained" : "outlined"}
                          onClick={() => handleSeguroToggle(seguro)}
                          sx={{
                            textTransform: "none",
                            fontSize: "0.8rem",
                            justifyContent: "flex-start",
                            borderColor: segurosSeleccionados.includes(seguro) ? "#1565c0" : "#e2e8f0",
                            backgroundColor: segurosSeleccionados.includes(seguro) ? "#1565c0" : "transparent",
                            color: segurosSeleccionados.includes(seguro) ? "white" : "#64748b",
                            "&:hover": {
                              backgroundColor: segurosSeleccionados.includes(seguro) ? "#0d47a1" : "#e3f2fd",
                              borderColor: "#1565c0",
                            },
                          }}
                        >
                          {seguro}
                        </Button>
                      ))}
                    </Box>
                  </>
                )}

                <Box display="flex" justifyContent="flex-end" mt={2.5} gap={1}>
                  <Button size="small" onClick={limpiarFiltros} sx={{ color: "#64748b", textTransform: "none" }}>
                    Limpiar todo
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleFilterClose}
                    sx={{ backgroundColor: "#475569", textTransform: "none", "&:hover": { backgroundColor: "#334155" } }}
                  >
                    Aplicar
                  </Button>
                </Box>
              </Box>
            </Popover>

            {/* Tabla */}
            <TableContainer
              component={Paper}
              sx={{ borderRadius: "12px", boxShadow: "none", border: "1px solid #e2e8f0", overflow: "hidden" }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Nombre Completo</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>DNI</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Edad</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Nivel Pobreza</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Seguro</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Lee/Escribe</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Profesión</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={32} sx={{ color: CIAM_COLOR }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Cargando beneficiarios...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron beneficiarios
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row: BeneficiarioFrontend, index: number) => {
                      const pobrezaColors = POBREZA_CHIP_COLORS[row.nivelPobreza] || POBREZA_CHIP_COLORS["Sin clasificar"];
                      const seguroColors = SEGURO_CHIP_COLORS[row.seguroSalud] || SEGURO_CHIP_COLORS["Otro"];
                      return (
                        <TableRow
                          key={row.id}
                          onClick={() => handleRowClick(row)}
                          sx={{
                            backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                            "&:hover": { backgroundColor: "#f1f5f9", cursor: "pointer" },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.nombre} {row.apellido}
                          </TableCell>
                          <TableCell>{row.dni}</TableCell>
                          <TableCell align="center">
                            <Chip label={`${row.edad} años`} size="small" sx={{ backgroundColor: "#f3e5f5", color: "#7b1fa2", fontWeight: 600, fontSize: "0.75rem" }} />
                          </TableCell>
                          <TableCell>
                            <Chip label={row.nivelPobreza} size="small" sx={{ backgroundColor: pobrezaColors.bg, color: pobrezaColors.color, fontWeight: 600, fontSize: "0.7rem" }} />
                          </TableCell>
                          <TableCell>
                            <Chip label={row.seguroSalud} size="small" sx={{ backgroundColor: seguroColors.bg, color: seguroColors.color, fontWeight: 600, fontSize: "0.7rem" }} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={row.sabeLeerEscribir ? "Sí" : "No"}
                              size="small"
                              sx={{
                                backgroundColor: row.sabeLeerEscribir ? "#e8f5e9" : "#ffebee",
                                color: row.sabeLeerEscribir ? "#2e7d32" : "#c62828",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                              }}
                            />
                          </TableCell>
                          <TableCell>{row.profesion}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}
                                sx={{ color: "#64748b", "&:hover": { backgroundColor: "#f1f5f9" } }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); }}
                                sx={{ color: "#0891b2", "&:hover": { backgroundColor: "rgba(8, 145, 178, 0.1)" } }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); }}
                                sx={{ color: "#dc2626", "&:hover": { backgroundColor: "rgba(220, 38, 38, 0.1)" } }}
                              >
                                <Delete fontSize="small" />
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
        PaperProps={{ sx: { borderRadius: "16px" } }}
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
            <Elderly sx={{ color: CIAM_COLOR }} />
            <Typography variant="h6" fontWeight={600} color="#334155">
              Detalles del Adulto Mayor
            </Typography>
          </Box>
          <IconButton onClick={handleDetailClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {selectedBeneficiario && (
            <Grid container spacing={3}>
              {/* Datos Personales */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom>
                  Datos Personales
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Nombre</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedBeneficiario.nombre}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Apellido</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedBeneficiario.apellido}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">DNI</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedBeneficiario.dni}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Fecha de Nacimiento</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatearFecha(selectedBeneficiario.fechaNacimiento)} ({selectedBeneficiario.edad} años)
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedBeneficiario.telefono}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Dirección</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedBeneficiario.direccion}</Typography>
              </Grid>

              {/* Situación Socioeconómica */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom sx={{ mt: 2 }}>
                  Situación Socioeconómica
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Nivel de Pobreza</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={selectedBeneficiario.nivelPobreza}
                    size="small"
                    sx={{
                      backgroundColor: (POBREZA_CHIP_COLORS[selectedBeneficiario.nivelPobreza] || POBREZA_CHIP_COLORS["Sin clasificar"]).bg,
                      color: (POBREZA_CHIP_COLORS[selectedBeneficiario.nivelPobreza] || POBREZA_CHIP_COLORS["Sin clasificar"]).color,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Seguro de Salud</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={selectedBeneficiario.seguroSalud}
                    size="small"
                    sx={{
                      backgroundColor: (SEGURO_CHIP_COLORS[selectedBeneficiario.seguroSalud] || SEGURO_CHIP_COLORS["Otro"]).bg,
                      color: (SEGURO_CHIP_COLORS[selectedBeneficiario.seguroSalud] || SEGURO_CHIP_COLORS["Otro"]).color,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Sabe Leer y Escribir</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={selectedBeneficiario.sabeLeerEscribir ? "Sí" : "No"}
                    size="small"
                    sx={{
                      backgroundColor: selectedBeneficiario.sabeLeerEscribir ? "#e8f5e9" : "#ffebee",
                      color: selectedBeneficiario.sabeLeerEscribir ? "#2e7d32" : "#c62828",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">Profesión</Typography>
                <Typography variant="body2" fontWeight={500}>{selectedBeneficiario.profesion}</Typography>
              </Grid>

              {/* Observaciones */}
              {selectedBeneficiario.observaciones && (
                <>
                  <Grid size={12}>
                    <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom sx={{ mt: 2 }}>
                      Observaciones
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="body2">{selectedBeneficiario.observaciones}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={handleDetailClose} sx={{ textTransform: "none", color: "#64748b" }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
