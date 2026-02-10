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
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search,
  Elderly,
  FilterList,
  FileDownload,
  Close,
  Visibility,
  Cake,
  Person,
  LocationOn,
  Home,
  Work,
  LocalHospital,
  Accessibility,
  Psychology,
  Warning,
  Assignment,
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

// Traducciones de valores del backend
const TRADUCCIONES: Record<string, Record<string, string>> = {
  civil: {
    SINGLE: "Soltero(a)",
    MARRIED: "Casado(a)",
    DIVORCED: "Divorciado(a)",
    WIDOWED: "Viudo(a)",
    COHABITANT: "Conviviente",
  },
  sex: {
    MALE: "Masculino",
    FEMALE: "Femenino",
  },
  health: {
    SIS: "SIS",
    ESSALUD: "EsSalud",
    PRIVATE: "Privado",
    NONE: "Sin seguro",
    OTHER: "Otro",
  },
  housing_status: {
    OWN: "Propia",
    RENTED: "Alquilada",
    BORROWED: "Prestada",
    OTHER: "Otro",
  },
  mode: {
    HIGH: "Alta",
    MEDIUM: "Media",
    LOW: "Baja",
  },
  disability: {
    NONE: "Sin dificultad",
    SOME: "Alguna dificultad",
    SEVERE: "Mucha dificultad",
    TOTAL: "No puede hacerlo",
  },
};

const traducir = (categoria: string, valor: string | null | undefined): string => {
  if (!valor) return "-";
  return TRADUCCIONES[categoria]?.[valor] || valor;
};

// ============================================
// INTERFACES BACKEND
// ============================================
interface RelatedEntity {
  id: string;
  name: string;
}

interface BeneficiarioListaBackend {
  id: string;
  name: string;
  lastname: string;
  cellphone: string | null;
  birthday: string;
  civil: string;
  doc_type: string;
  health: string;
  poverty_level: string | null;
  housing_status: string;
  mode: string;
  sex: string;
  country: RelatedEntity | null;
  department_birth: RelatedEntity | null;
  department_live: RelatedEntity | null;
  district_live: RelatedEntity | null;
  education: RelatedEntity | null;
  ethnic: RelatedEntity | null;
  housing: RelatedEntity | null;
  language_learned: RelatedEntity | null;
  language_native: RelatedEntity | null;
  province_birth: RelatedEntity | null;
  province_live: RelatedEntity | null;
}

interface BeneficiarioDetalleBackend {
  id: string;
  doc_num: string;
  name: string;
  lastname: string;
  children: number;
  address: string;
  cellphone: string | null;
  telephone: string | null;
  assessment_cognitive: number;
  assessment_emotional: number;
  assessment_functional: number;
  assessment_sociofamily: number;
  read_write: boolean;
  profession: string | null;
  housing_onservation: string | null;
  state_services: boolean;
  pension_65: boolean;
  onp: boolean;
  police_pension: boolean;
  other_pension: string | null;
  sisfoh: boolean;
  works: boolean;
  occupation_type: string | null;
  occupation_other: string | null;
  monthly_income: number;
  other_income: string | null;
  income_source: string | null;
  income_amount: number;
  health_problem: boolean;
  health_condition: string | null;
  treatment: boolean;
  conadis: boolean;
  disability_vision: string | null;
  disability_hearing: string | null;
  disability_walking: string | null;
  disability_memory: string | null;
  disability_selfcare: string | null;
  disability_communication: string | null;
  violence_by: string | null;
  violence_type: string | null;
  abused: boolean;
  abuse_type: string | null;
  registration_reason: string | null;
  registration_reason_old: string | null;
  expected_services: string | null;
  birthday: string;
  registered_at: string | null;
  enrollmented_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  civil: string;
  doc_type: string;
  health: string;
  poverty_level: string | null;
  housing_status: string;
  mode: string;
  sex: string;
  country: RelatedEntity | null;
  department_birth: RelatedEntity | null;
  department_live: RelatedEntity | null;
  district_live: RelatedEntity | null;
  education: RelatedEntity | null;
  ethnic: RelatedEntity | null;
  housing: RelatedEntity | null;
  language_learned: RelatedEntity | null;
  language_native: RelatedEntity | null;
  province_birth: RelatedEntity | null;
  province_live: RelatedEntity | null;
}

interface BackendListaResponse {
  message: string;
  data: {
    data: BeneficiarioListaBackend[];
    currentPage: number;
    pageCount: number;
    totalCount: number;
    totalPages: number;
  };
}

interface BackendDetalleResponse {
  message: string;
  data: BeneficiarioDetalleBackend;
}

// Interface para la tabla (datos esenciales)
interface BeneficiarioTabla {
  id: string;
  nombreCompleto: string;
  tipoDoc: string;
  sexo: string;
  edad: number;
  fechaNacimiento: string;
  estadoCivil: string;
  seguroSalud: string;
  distritoResidencia: string;
  modo: string;
  celular: string;
  housingStatus: string;
}

// ============================================
// MAPEO BACKEND -> FRONTEND (TABLA)
// ============================================
const mapListaToTabla = (item: BeneficiarioListaBackend): BeneficiarioTabla => ({
  id: item.id,
  nombreCompleto: `${item.name} ${item.lastname}`,
  tipoDoc: item.doc_type || "DNI",
  sexo: traducir("sex", item.sex),
  edad: calcularEdad(item.birthday),
  fechaNacimiento: item.birthday,
  estadoCivil: traducir("civil", item.civil),
  seguroSalud: traducir("health", item.health),
  distritoResidencia: item.district_live?.name || "-",
  modo: traducir("mode", item.mode),
  celular: item.cellphone || "-",
  housingStatus: traducir("housing_status", item.housing_status),
});

// ============================================
// CONSTANTES
// ============================================
type FilterType = "edad" | "cumpleanos" | "sexo" | "seguro";
type CumpleanosModo = "mes" | "dia";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const SEXOS = ["Masculino", "Femenino"];
const SEGUROS_SALUD = ["SIS", "EsSalud", "Privado", "Sin seguro", "Otro"];

const SEXO_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
  Masculino: { bg: "#e3f2fd", color: "#1565c0" },
  Femenino: { bg: "#fce4ec", color: "#c2185b" },
};

const SEGURO_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
  SIS: { bg: "#e3f2fd", color: "#1565c0" },
  EsSalud: { bg: "#e8f5e9", color: "#2e7d32" },
  Privado: { bg: "#f3e5f5", color: "#7b1fa2" },
  "Sin seguro": { bg: "#ffebee", color: "#c62828" },
  Otro: { bg: "#fff3e0", color: "#e65100" },
};

const MODO_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
  Alta: { bg: "#e8f5e9", color: "#2e7d32" },
  Media: { bg: "#fff3e0", color: "#e65100" },
  Baja: { bg: "#ffebee", color: "#c62828" },
};

const HOUSING_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
  Propia: { bg: "#e8f5e9", color: "#2e7d32" },
  Alquilada: { bg: "#e3f2fd", color: "#1565c0" },
  Prestada: { bg: "#fff3e0", color: "#e65100" },
  Otro: { bg: "#f3e5f5", color: "#7b1fa2" },
};

// ============================================
// COMPONENTE DE DETALLE
// ============================================
interface DetalleProps {
  beneficiario: BeneficiarioDetalleBackend | null;
  loading: boolean;
}

function DetalleContent({ beneficiario, loading }: DetalleProps) {
  const [tabValue, setTabValue] = useState(0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={40} sx={{ color: CIAM_COLOR }} />
      </Box>
    );
  }

  if (!beneficiario) {
    return (
      <Typography color="text.secondary" textAlign="center" py={4}>
        No se pudo cargar la información
      </Typography>
    );
  }

  const renderCampo = (label: string, valor: React.ReactNode) => (
    <Box mb={2}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {valor || "-"}
      </Typography>
    </Box>
  );

  const renderChipBoolean = (valor: boolean, textoSi = "Sí", textoNo = "No") => (
    <Chip
      label={valor ? textoSi : textoNo}
      size="small"
      sx={{
        backgroundColor: valor ? "#e8f5e9" : "#ffebee",
        color: valor ? "#2e7d32" : "#c62828",
        fontWeight: 600,
      }}
    />
  );

  const renderValoracion = (valor: number, label: string) => {
    const colores = ["#e8f5e9", "#fff3e0", "#ffebee", "#ffcdd2"];
    const textos = ["Bueno", "Regular", "Deficiente", "Muy deficiente"];
    return (
      <Box mb={2}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Chip
          label={`${valor} - ${textos[valor - 1] || "N/A"}`}
          size="small"
          sx={{
            mt: 0.5,
            backgroundColor: colores[valor - 1] || "#f5f5f5",
            color: valor <= 2 ? "#2e7d32" : "#c62828",
            fontWeight: 600,
          }}
        />
      </Box>
    );
  };

  const renderDiscapacidad = (nivel: string | null, label: string) => (
    <Box mb={2}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Chip
        label={traducir("disability", nivel)}
        size="small"
        sx={{
          mt: 0.5,
          backgroundColor: nivel === "NONE" ? "#e8f5e9" : nivel === "SOME" ? "#fff3e0" : "#ffebee",
          color: nivel === "NONE" ? "#2e7d32" : nivel === "SOME" ? "#e65100" : "#c62828",
          fontWeight: 600,
        }}
      />
    </Box>
  );

  const tabs = [
    { label: "Personal", icon: <Person fontSize="small" /> },
    { label: "Ubicación", icon: <LocationOn fontSize="small" /> },
    { label: "Vivienda", icon: <Home fontSize="small" /> },
    { label: "Economía", icon: <Work fontSize="small" /> },
    { label: "Salud", icon: <LocalHospital fontSize="small" /> },
    { label: "Discapacidad", icon: <Accessibility fontSize="small" /> },
    { label: "Valoración", icon: <Psychology fontSize="small" /> },
    { label: "Violencia", icon: <Warning fontSize="small" /> },
    { label: "Registro", icon: <Assignment fontSize="small" /> },
  ];

  return (
    <Box>
      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          "& .MuiTab-root": {
            textTransform: "none",
            minHeight: 48,
            fontSize: "0.8rem",
          },
          "& .Mui-selected": { color: CIAM_COLOR },
          "& .MuiTabs-indicator": { backgroundColor: CIAM_COLOR },
        }}
      >
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} icon={tab.icon} iconPosition="start" />
        ))}
      </Tabs>

      {/* Tab 0: Datos Personales */}
      {tabValue === 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Nombre", beneficiario.name)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Apellidos", beneficiario.lastname)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Tipo de Documento", beneficiario.doc_type)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Número de Documento", beneficiario.doc_num)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Fecha de Nacimiento", `${formatearFecha(beneficiario.birthday)} (${calcularEdad(beneficiario.birthday)} años)`)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Sexo", traducir("sex", beneficiario.sex))}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Estado Civil", traducir("civil", beneficiario.civil))}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Número de Hijos", beneficiario.children)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                Sabe Leer y Escribir
              </Typography>
              {renderChipBoolean(beneficiario.read_write)}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Etnia", beneficiario.ethnic?.name)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Idioma Materno", beneficiario.language_native?.name)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Idioma Aprendido", beneficiario.language_learned?.name)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Nivel Educativo", beneficiario.education?.name)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Celular", beneficiario.cellphone)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Teléfono Fijo", beneficiario.telephone)}
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Ubicación */}
      {tabValue === 1 && (
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom>
              Lugar de Nacimiento
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("País", beneficiario.country?.name)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Departamento", beneficiario.department_birth?.name)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Provincia", beneficiario.province_birth?.name)}
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom sx={{ mt: 2 }}>
              Lugar de Residencia
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Departamento", beneficiario.department_live?.name)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Provincia", beneficiario.province_live?.name)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Distrito", beneficiario.district_live?.name)}
          </Grid>
          <Grid size={12}>
            {renderCampo("Dirección", beneficiario.address)}
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Vivienda */}
      {tabValue === 2 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Tipo de Vivienda", beneficiario.housing?.name)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Condición de Vivienda", traducir("housing_status", beneficiario.housing_status))}
          </Grid>
          <Grid size={12}>
            {renderCampo("Observación de Vivienda", beneficiario.housing_onservation)}
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Economía */}
      {tabValue === 3 && (
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom>
              Situación Laboral
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                Trabaja Actualmente
              </Typography>
              {renderChipBoolean(beneficiario.works)}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Profesión", beneficiario.profession)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Tipo de Ocupación", beneficiario.occupation_type)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Otra Ocupación", beneficiario.occupation_other)}
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom sx={{ mt: 2 }}>
              Ingresos
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Ingreso Mensual", beneficiario.monthly_income ? `S/ ${beneficiario.monthly_income}` : "-")}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Otros Ingresos", beneficiario.other_income)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Fuente de Ingreso", beneficiario.income_source)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Monto Adicional", beneficiario.income_amount ? `S/ ${beneficiario.income_amount}` : "-")}
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom sx={{ mt: 2 }}>
              Pensiones y Programas Sociales
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                Pensión 65
              </Typography>
              {renderChipBoolean(beneficiario.pension_65)}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                ONP
              </Typography>
              {renderChipBoolean(beneficiario.onp)}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                Pensión Policial
              </Typography>
              {renderChipBoolean(beneficiario.police_pension)}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            {renderCampo("Otra Pensión", beneficiario.other_pension)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                SISFOH
              </Typography>
              {renderChipBoolean(beneficiario.sisfoh)}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                Servicios del Estado
              </Typography>
              {renderChipBoolean(beneficiario.state_services)}
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Tab 4: Salud */}
      {tabValue === 4 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Seguro de Salud", traducir("health", beneficiario.health))}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Nivel de Pobreza", beneficiario.poverty_level)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                Problema de Salud
              </Typography>
              {renderChipBoolean(beneficiario.health_problem)}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {renderCampo("Condición de Salud", beneficiario.health_condition)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                En Tratamiento
              </Typography>
              {renderChipBoolean(beneficiario.treatment)}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                Inscrito en CONADIS
              </Typography>
              {renderChipBoolean(beneficiario.conadis)}
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Tab 5: Discapacidad */}
      {tabValue === 5 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderDiscapacidad(beneficiario.disability_vision, "Dificultad para Ver")}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderDiscapacidad(beneficiario.disability_hearing, "Dificultad para Oír")}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderDiscapacidad(beneficiario.disability_walking, "Dificultad para Caminar")}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderDiscapacidad(beneficiario.disability_memory, "Dificultad de Memoria")}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderDiscapacidad(beneficiario.disability_selfcare, "Dificultad para el Autocuidado")}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderDiscapacidad(beneficiario.disability_communication, "Dificultad para Comunicarse")}
          </Grid>
        </Grid>
      )}

      {/* Tab 6: Valoración */}
      {tabValue === 6 && (
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Valoración geriátrica integral (1: Bueno, 2: Regular, 3: Deficiente, 4: Muy deficiente)
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            {renderValoracion(beneficiario.assessment_cognitive, "Valoración Cognitiva")}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            {renderValoracion(beneficiario.assessment_emotional, "Valoración Emocional")}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            {renderValoracion(beneficiario.assessment_functional, "Valoración Funcional")}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            {renderValoracion(beneficiario.assessment_sociofamily, "Valoración Sociofamiliar")}
          </Grid>
        </Grid>
      )}

      {/* Tab 7: Violencia */}
      {tabValue === 7 && (
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom>
              Situación de Violencia
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Violencia por parte de", beneficiario.violence_by)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Tipo de Violencia", beneficiario.violence_type)}
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" fontWeight={600} color="#475569" gutterBottom sx={{ mt: 2 }}>
              Situación de Abuso
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                Ha sufrido abuso
              </Typography>
              {renderChipBoolean(beneficiario.abused)}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Tipo de Abuso", beneficiario.abuse_type)}
          </Grid>
        </Grid>
      )}

      {/* Tab 8: Registro */}
      {tabValue === 8 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            {renderCampo("Motivo de Registro", beneficiario.registration_reason)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {renderCampo("Motivo Anterior", beneficiario.registration_reason_old)}
          </Grid>
          <Grid size={12}>
            {renderCampo("Servicios Esperados", beneficiario.expected_services)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Modo de Atención", traducir("mode", beneficiario.mode))}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Fecha de Registro", formatearFecha(beneficiario.registered_at))}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Fecha de Empadronamiento", formatearFecha(beneficiario.enrollmented_at))}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Fecha de Creación", formatearFecha(beneficiario.created_at))}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            {renderCampo("Última Actualización", formatearFecha(beneficiario.updated_at))}
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

const BATCH_SIZE = 500; // Cargar en lotes de 500 registros

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function CIAMBeneficiariosPage() {
  const { getData } = useFetch();

  const [allData, setAllData] = useState<BeneficiarioTabla[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Paginación local
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("edad");
  const [edadRange, setEdadRange] = useState<number[]>([60, 100]);
  const [mesesCumpleanos, setMesesCumpleanos] = useState<number[]>([]);
  const [cumpleanosModo, setCumpleanosModo] = useState<CumpleanosModo>("mes");
  const [diaCumpleanos, setDiaCumpleanos] = useState<string>("");
  const [sexosSeleccionados, setSexosSeleccionados] = useState<string[]>([]);
  const [segurosSeleccionados, setSegurosSeleccionados] = useState<string[]>([]);
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);

  // Detalle
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detalleData, setDetalleData] = useState<BeneficiarioDetalleBackend | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);

  // Cargar lista de beneficiarios en lotes (como ULE)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setLoadingProgress(0);

    try {
      // Primero obtener el total
      const firstResponse = await getData<BackendListaResponse>(`pam/benefited?page=1&limit=1`);
      const totalCount = firstResponse?.data?.totalCount || 0;

      if (totalCount === 0) {
        setAllData([]);
        setIsLoading(false);
        return;
      }

      // Calcular número de páginas necesarias
      const totalPages = Math.ceil(totalCount / BATCH_SIZE);
      const allBeneficiarios: BeneficiarioListaBackend[] = [];

      // Cargar en lotes de 500
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const response = await getData<BackendListaResponse>(
          `pam/benefited?page=${pageNum}&limit=${BATCH_SIZE}`
        );

        if (response?.data?.data) {
          allBeneficiarios.push(...response.data.data);
        }

        // Actualizar progreso
        setLoadingProgress(Math.round((pageNum / totalPages) * 100));
      }

      setAllData(allBeneficiarios.map(mapListaToTabla));
    } catch (error) {
      console.error("Error al cargar beneficiarios:", error);
      setAllData([]);
    } finally {
      setIsLoading(false);
    }
  }, [getData]);

  // Cargar detalle de un beneficiario
  const fetchDetalle = useCallback(async (id: string) => {
    setDetalleLoading(true);
    try {
      const response = await getData<BackendDetalleResponse>(`pam/benefited/${id}`);
      if (response?.data) {
        setDetalleData(response.data);
      }
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      setDetalleData(null);
    } finally {
      setDetalleLoading(false);
    }
  }, [getData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedId && detailOpen) {
      fetchDetalle(selectedId);
    }
  }, [selectedId, detailOpen, fetchDetalle]);

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
  const handleSexoToggle = (sexo: string) => {
    setSexosSeleccionados((prev) => prev.includes(sexo) ? prev.filter((s) => s !== sexo) : [...prev, sexo]);
  };
  const handleSeguroToggle = (seguro: string) => {
    setSegurosSeleccionados((prev) => prev.includes(seguro) ? prev.filter((s) => s !== seguro) : [...prev, seguro]);
  };

  const filterOpen = Boolean(filterAnchor);
  const isEdadFiltered = edadRange[0] > 60 || edadRange[1] < 100;
  const isCumpleanosFiltered = cumpleanosModo === "mes" ? mesesCumpleanos.length > 0 : diaCumpleanos !== "";
  const isSexoFiltered = sexosSeleccionados.length > 0;
  const isSeguroFiltered = segurosSeleccionados.length > 0;

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const handleRowClick = (id: string) => {
    setSelectedId(id);
    setDetalleData(null);
    setDetailOpen(true);
  };
  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedId(null);
    setDetalleData(null);
  };

  // Formatear datos
  const allDataFormateados = useFormatTableData(allData);

  // Filtrar TODOS los datos (ahora sí funciona porque tenemos todos los registros)
  const filteredData = allDataFormateados.filter((b: BeneficiarioTabla) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      b.nombreCompleto.toLowerCase().includes(term) ||
      b.distritoResidencia.toLowerCase().includes(term) ||
      b.celular.includes(searchTerm);

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

    const matchesSexo = sexosSeleccionados.length === 0 || sexosSeleccionados.includes(b.sexo);
    const matchesSeguro = segurosSeleccionados.length === 0 || segurosSeleccionados.includes(b.seguroSalud);

    return matchesSearch && matchesEdad && matchesCumpleanos && matchesSexo && matchesSeguro;
  });

  // Resetear página al filtrar
  useEffect(() => {
    setPage(0);
  }, [searchTerm, edadRange, mesesCumpleanos, cumpleanosModo, diaCumpleanos, sexosSeleccionados, segurosSeleccionados]);

  // Paginar los datos filtrados
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Exportar a Excel (todos los datos filtrados)
  const handleExport = () => {
    const exportData = filteredData.map((b: BeneficiarioTabla) => ({
      "Nombre Completo": b.nombreCompleto,
      "Tipo Doc": b.tipoDoc,
      "Sexo": b.sexo,
      "Edad": b.edad,
      "Fecha Nacimiento": formatearFecha(b.fechaNacimiento),
      "Estado Civil": b.estadoCivil,
      "Seguro de Salud": b.seguroSalud,
      "Celular": b.celular,
      "Vivienda": b.housingStatus,
    }));
    if (exportData.length === 0) {
      return;
    }
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
    setSexosSeleccionados([]);
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
                placeholder="Buscar por nombre o celular..."
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
              {isSexoFiltered && (
                <Box sx={{ backgroundColor: "#e3f2fd", borderRadius: "16px", px: 1.5, py: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="caption" color="#1565c0">
                    Sexo: {sexosSeleccionados.join(", ")}
                  </Typography>
                  <IconButton size="small" onClick={() => setSexosSeleccionados([])} sx={{ p: 0.25 }}>
                    <Close sx={{ fontSize: 14, color: "#1565c0" }} />
                  </IconButton>
                </Box>
              )}
              {isSeguroFiltered && (
                <Box sx={{ backgroundColor: "#e8f5e9", borderRadius: "16px", px: 1.5, py: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="caption" color="#2e7d32">
                    Seguro: {segurosSeleccionados.length}
                  </Typography>
                  <IconButton size="small" onClick={() => setSegurosSeleccionados([])} sx={{ p: 0.25 }}>
                    <Close sx={{ fontSize: 14, color: "#2e7d32" }} />
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
                  <ToggleButton value="sexo" sx={{ textTransform: "none", fontSize: "0.7rem", "&.Mui-selected": { backgroundColor: "#e3f2fd", color: "#1565c0", "&:hover": { backgroundColor: "#bbdefb" } } }}>
                    Sexo
                  </ToggleButton>
                  <ToggleButton value="seguro" sx={{ textTransform: "none", fontSize: "0.7rem", "&.Mui-selected": { backgroundColor: "#e8f5e9", color: "#2e7d32", "&:hover": { backgroundColor: "#c8e6c9" } } }}>
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

                {/* Filtro por sexo */}
                {filterType === "sexo" && (
                  <>
                    <Typography variant="body2" color="#475569" mb={1.5}>
                      Sexo
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                      {SEXOS.map((sexo) => (
                        <Button
                          key={sexo}
                          size="small"
                          variant={sexosSeleccionados.includes(sexo) ? "contained" : "outlined"}
                          onClick={() => handleSexoToggle(sexo)}
                          sx={{
                            textTransform: "none",
                            fontSize: "0.8rem",
                            justifyContent: "flex-start",
                            borderColor: sexosSeleccionados.includes(sexo) ? "#1565c0" : "#e2e8f0",
                            backgroundColor: sexosSeleccionados.includes(sexo) ? "#1565c0" : "transparent",
                            color: sexosSeleccionados.includes(sexo) ? "white" : "#64748b",
                            "&:hover": {
                              backgroundColor: sexosSeleccionados.includes(sexo) ? "#0d47a1" : "#e3f2fd",
                              borderColor: "#1565c0",
                            },
                          }}
                        >
                          {sexo}
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
                            borderColor: segurosSeleccionados.includes(seguro) ? "#2e7d32" : "#e2e8f0",
                            backgroundColor: segurosSeleccionados.includes(seguro) ? "#2e7d32" : "transparent",
                            color: segurosSeleccionados.includes(seguro) ? "white" : "#64748b",
                            "&:hover": {
                              backgroundColor: segurosSeleccionados.includes(seguro) ? "#1b5e20" : "#e8f5e9",
                              borderColor: "#2e7d32",
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
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Doc.</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Sexo</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Edad</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Estado Civil</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Seguro</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>Celular</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Vivienda</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: "#334155" }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={32} sx={{ color: CIAM_COLOR }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Cargando beneficiarios... {loadingProgress > 0 && `${loadingProgress}%`}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron beneficiarios
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row: BeneficiarioTabla, index: number) => {
                      const sexoColors = SEXO_CHIP_COLORS[row.sexo] || { bg: "#f5f5f5", color: "#757575" };
                      const seguroColors = SEGURO_CHIP_COLORS[row.seguroSalud] || SEGURO_CHIP_COLORS["Otro"];
                      return (
                        <TableRow
                          key={row.id}
                          onClick={() => handleRowClick(row.id)}
                          sx={{
                            backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
                            "&:hover": { backgroundColor: "#f1f5f9", cursor: "pointer" },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.nombreCompleto}
                          </TableCell>
                          <TableCell>{row.tipoDoc}</TableCell>
                          <TableCell align="center">
                            <Chip label={row.sexo} size="small" sx={{ backgroundColor: sexoColors.bg, color: sexoColors.color, fontWeight: 600, fontSize: "0.7rem" }} />
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" flexDirection="column" alignItems="center" gap={0.3}>
                              <Chip label={`${row.edad} años`} size="small" sx={{ backgroundColor: "#f3e5f5", color: "#7b1fa2", fontWeight: 600, fontSize: "0.75rem" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                                {formatearFecha(row.fechaNacimiento)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{row.estadoCivil}</TableCell>
                          <TableCell>
                            <Chip label={row.seguroSalud} size="small" sx={{ backgroundColor: seguroColors.bg, color: seguroColors.color, fontWeight: 600, fontSize: "0.7rem" }} />
                          </TableCell>
                          <TableCell>{row.celular}</TableCell>
                          <TableCell align="center">
                            <Chip label={row.housingStatus} size="small" sx={{ backgroundColor: (HOUSING_CHIP_COLORS[row.housingStatus] || { bg: "#f5f5f5", color: "#757575" }).bg, color: (HOUSING_CHIP_COLORS[row.housingStatus] || { bg: "#f5f5f5", color: "#757575" }).color, fontWeight: 600, fontSize: "0.7rem" }} />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleRowClick(row.id); }}
                                sx={{ color: "#64748b", "&:hover": { backgroundColor: "#f1f5f9" } }}
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
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", maxHeight: "90vh" } }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Elderly sx={{ color: CIAM_COLOR }} />
            <Typography variant="h6" fontWeight={600} color="#334155">
              Ficha del Adulto Mayor
            </Typography>
          </Box>
          <IconButton onClick={handleDetailClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DetalleContent beneficiario={detalleData} loading={detalleLoading} />
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
