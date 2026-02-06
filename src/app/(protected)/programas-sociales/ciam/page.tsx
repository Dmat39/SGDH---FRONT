"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Skeleton,
  Chip,
} from "@mui/material";
import {
  Elderly,
  HealthAndSafety,
  MenuBook,
  CalendarMonth,
  Work,
} from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";
import { useFetch } from "@/lib/hooks/useFetch";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];

// ============================================
// INTERFACES
// ============================================
interface BeneficiarioCIAM {
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
    data: BeneficiarioCIAM[];
    currentPage: number;
    pageCount: number;
    totalCount: number;
    totalPages: number;
  };
}

// ============================================
// COLORES Y CONFIGURACIÓN
// ============================================
const CIAM_COLOR = "#9c27b0";
const CIAM_GRADIENT = "linear-gradient(to bottom, rgba(156, 39, 176, 0.3), rgba(156, 39, 176, 0))";
const CIAM_BAR_GRADIENT = "linear-gradient(135deg, #ce93d8, #9c27b0, #7b1fa2)";

const POVERTY_COLORS: Record<string, string> = {
  "No pobre": "#4caf50",
  "Pobre": "#ff9800",
  "Pobre extremo": "#f44336",
  "Sin clasificar": "#9e9e9e",
};

const INSURANCE_COLORS: Record<string, string> = {
  SIS: "#2196f3",
  EsSalud: "#4caf50",
  "Seguro privado": "#9c27b0",
  "Sin seguro": "#f44336",
  Otro: "#ff9800",
};

const AGE_RANGE_COLORS = [
  "#7b1fa2",
  "#9c27b0",
  "#ab47bc",
  "#ce93d8",
  "#e1bee7",
  "#ba68c8",
  "#8e24aa",
];

// ============================================
// UTILIDADES
// ============================================
const calcularEdad = (birthday: string): number => {
  const hoy = new Date();
  const nacimiento = new Date(birthday);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

const getRangoEdad = (edad: number): string => {
  if (edad < 65) return "60-64";
  if (edad < 70) return "65-69";
  if (edad < 75) return "70-74";
  if (edad < 80) return "75-79";
  if (edad < 85) return "80-84";
  if (edad < 90) return "85-89";
  return "90+";
};

// Función para generar el path de un segmento del donut
const generateDonutSegment = (
  startAngle: number,
  endAngle: number,
  outerRadius: number,
  innerRadius: number,
  cx: number,
  cy: number
) => {
  const startOuterX = cx + outerRadius * Math.cos(startAngle);
  const startOuterY = cy + outerRadius * Math.sin(startAngle);
  const endOuterX = cx + outerRadius * Math.cos(endAngle);
  const endOuterY = cy + outerRadius * Math.sin(endAngle);
  const startInnerX = cx + innerRadius * Math.cos(endAngle);
  const startInnerY = cy + innerRadius * Math.sin(endAngle);
  const endInnerX = cx + innerRadius * Math.cos(startAngle);
  const endInnerY = cy + innerRadius * Math.sin(startAngle);

  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return `
    M ${startOuterX} ${startOuterY}
    A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
    L ${startInnerX} ${startInnerY}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInnerX} ${endInnerY}
    Z
  `;
};

// ============================================
// DATA DEMO (se usa si el backend no responde)
// ============================================
const generarDataDemo = (): BeneficiarioCIAM[] => {
  const nombres = ["María", "Rosa", "Carmen", "Julia", "Elena", "Ana", "Luisa", "Teresa", "Martha", "Gloria", "Pedro", "Juan", "Carlos", "José", "Manuel", "Luis", "Alberto", "Jorge", "Ricardo", "Francisco"];
  const apellidos = ["García", "López", "Martínez", "Rodríguez", "Hernández", "Flores", "Torres", "Ramos", "Quispe", "Mamani", "Huamán", "Chávez", "Mendoza", "Sánchez", "Cruz", "Vargas", "Rojas", "Díaz", "Castillo", "Morales"];
  const niveles_pobreza = ["No pobre", "No pobre", "No pobre", "Pobre", "Pobre", "Pobre", "Pobre", "Pobre extremo", "Pobre extremo", "Sin clasificar"];
  const seguros = ["SIS", "SIS", "SIS", "SIS", "SIS", "EsSalud", "EsSalud", "EsSalud", "Sin seguro", "Sin seguro", "Sin seguro", "Seguro privado", "Otro"];
  const profesiones = [
    "Ama de casa", "Ama de casa", "Ama de casa", "Ama de casa", "Ama de casa", "Ama de casa",
    "Comerciante", "Comerciante", "Comerciante", "Comerciante",
    "Agricultor", "Agricultor", "Agricultor",
    "Albañil", "Albañil",
    "Costurera", "Costurera", "Costurera",
    "Carpintero", "Carpintero",
    "Docente", "Docente",
    "Chofer", "Chofer",
    "Mecánico",
    "Enfermera",
    "Cocinero",
    "Vendedor ambulante", "Vendedor ambulante",
    "Sin profesión", "Sin profesión",
    "Sastre",
    "Zapatero",
    "Electricista",
  ];

  const data: BeneficiarioCIAM[] = [];
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
      poverty_level: niveles_pobreza[Math.floor(Math.random() * niveles_pobreza.length)],
      health_insurance: seguros[Math.floor(Math.random() * seguros.length)],
      can_read_write: Math.random() > 0.28,
      profession: profesiones[Math.floor(Math.random() * profesiones.length)],
    });
  }
  return data;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function CIAMDashboardPage() {
  const { getData } = useFetch();
  const [isLoading, setIsLoading] = useState(true);
  const [beneficiarios, setBeneficiarios] = useState<BeneficiarioCIAM[]>([]);
  const [usandoDemo, setUsandoDemo] = useState(false);

  // Cargar datos del backend (si falla, usa data demo)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const firstResponse = await getData<BackendResponse>(
        `ciam/beneficiary?page=1&limit=1`
      );
      const totalCount = firstResponse?.data?.totalCount || 0;

      if (totalCount > 0) {
        const response = await getData<BackendResponse>(
          `ciam/beneficiary?page=1&limit=${totalCount}`
        );
        if (response?.data?.data) {
          setBeneficiarios(response.data.data);
          setUsandoDemo(false);
          return;
        }
      }
      // Si no hay datos en el backend, usar demo
      setBeneficiarios(generarDataDemo());
      setUsandoDemo(true);
    } catch {
      // Si el backend falla, cargar data demo
      setBeneficiarios(generarDataDemo());
      setUsandoDemo(true);
    } finally {
      setIsLoading(false);
    }
  }, [getData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================
  // CÁLCULOS ESTADÍSTICOS
  // ============================================
  const estadisticas = useMemo(() => {
    if (beneficiarios.length === 0) {
      return {
        total: 0,
        conSeguro: 0,
        sabenLeerEscribir: 0,
        edadPromedio: 0,
        edades: [] as number[],
      };
    }

    const edades = beneficiarios.map((b) => calcularEdad(b.birthday));
    const conSeguro = beneficiarios.filter(
      (b) => b.health_insurance && b.health_insurance !== "Sin seguro"
    ).length;
    const sabenLeerEscribir = beneficiarios.filter(
      (b) => b.can_read_write
    ).length;
    const edadPromedio =
      edades.length > 0
        ? Math.round(edades.reduce((a, b) => a + b, 0) / edades.length)
        : 0;

    return {
      total: beneficiarios.length,
      conSeguro,
      sabenLeerEscribir,
      edadPromedio,
      edades,
    };
  }, [beneficiarios]);

  // Distribución por nivel de pobreza
  const distribucionPobreza = useMemo(() => {
    const conteo: Record<string, number> = {};
    beneficiarios.forEach((b) => {
      const nivel = b.poverty_level || "Sin clasificar";
      conteo[nivel] = (conteo[nivel] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
        color: POVERTY_COLORS[nombre] || "#9e9e9e",
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [beneficiarios]);

  // Distribución por seguro de salud
  const distribucionSeguro = useMemo(() => {
    const conteo: Record<string, number> = {};
    beneficiarios.forEach((b) => {
      const seguro = b.health_insurance || "Sin seguro";
      conteo[seguro] = (conteo[seguro] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
        color: INSURANCE_COLORS[nombre] || "#9e9e9e",
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [beneficiarios]);

  // Distribución por alfabetización
  const distribucionAlfabetizacion = useMemo(() => {
    const sabenLeer = beneficiarios.filter((b) => b.can_read_write).length;
    const noSabenLeer = beneficiarios.filter((b) => !b.can_read_write).length;
    return [
      { nombre: "Sí sabe", cantidad: sabenLeer, color: "#4caf50" },
      { nombre: "No sabe", cantidad: noSabenLeer, color: "#f44336" },
    ];
  }, [beneficiarios]);

  // Distribución por profesión (top 8)
  const distribucionProfesion = useMemo(() => {
    const conteo: Record<string, number> = {};
    beneficiarios.forEach((b) => {
      const profesion = b.profession || "Sin profesión";
      conteo[profesion] = (conteo[profesion] || 0) + 1;
    });
    const sorted = Object.entries(conteo)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Tomar top 7 y agrupar el resto como "Otros"
    if (sorted.length > 8) {
      const top = sorted.slice(0, 7);
      const otros = sorted.slice(7).reduce((sum, item) => sum + item.cantidad, 0);
      return [...top, { nombre: "Otros", cantidad: otros }];
    }
    return sorted;
  }, [beneficiarios]);

  // Distribución por rango de edad
  const distribucionEdad = useMemo(() => {
    const rangos = ["60-64", "65-69", "70-74", "75-79", "80-84", "85-89", "90+"];
    const conteo: Record<string, number> = {};
    rangos.forEach((r) => (conteo[r] = 0));

    estadisticas.edades.forEach((edad) => {
      const rango = getRangoEdad(edad);
      conteo[rango] = (conteo[rango] || 0) + 1;
    });

    return rangos.map((rango, i) => ({
      rango,
      cantidad: conteo[rango] || 0,
      color: AGE_RANGE_COLORS[i],
    }));
  }, [estadisticas.edades]);

  // ============================================
  // STAT CARDS
  // ============================================
  const stats = [
    {
      title: "Total Adultos Mayores",
      value: estadisticas.total.toLocaleString(),
      icon: <Elderly sx={{ fontSize: 32 }} />,
      color: CIAM_COLOR,
    },
    {
      title: "Con Seguro de Salud",
      value: estadisticas.conSeguro.toLocaleString(),
      icon: <HealthAndSafety sx={{ fontSize: 32 }} />,
      color: "#2196f3",
    },
    {
      title: "Saben Leer / Escribir",
      value: estadisticas.sabenLeerEscribir.toLocaleString(),
      icon: <MenuBook sx={{ fontSize: 32 }} />,
      color: "#4caf50",
    },
    {
      title: "Edad Promedio",
      value: `${estadisticas.edadPromedio} años`,
      icon: <CalendarMonth sx={{ fontSize: 32 }} />,
      color: "#ff9800",
    },
  ];

  // ============================================
  // DONUT CHART HELPERS
  // ============================================
  const buildDonutSegments = (
    data: { nombre: string; cantidad: number; color: string }[]
  ) => {
    const total = data.reduce((s, d) => s + d.cantidad, 0);
    if (total === 0) return [];
    let currentAngle = -Math.PI / 2;
    return data.map((item) => {
      const angle = (item.cantidad / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;
      return {
        ...item,
        startAngle,
        endAngle,
        path: generateDonutSegment(startAngle, endAngle, 90, 50, 100, 100),
        porcentaje: ((item.cantidad / total) * 100).toFixed(1),
      };
    });
  };

  const seguroSegments = buildDonutSegments(distribucionSeguro);
  const pobrezaSegments = buildDonutSegments(distribucionPobreza);
  const alfabetizacionSegments = buildDonutSegments(distribucionAlfabetizacion);

  const totalSeguro = distribucionSeguro.reduce((s, d) => s + d.cantidad, 0);
  const totalPobreza = distribucionPobreza.reduce((s, d) => s + d.cantidad, 0);

  const maxProfesion = Math.max(
    ...distribucionProfesion.map((p) => p.cantidad),
    1
  );
  const maxEdadRango = Math.max(
    ...distribucionEdad.map((e) => e.cantidad),
    1
  );

  // ============================================
  // ESTILOS COMPARTIDOS
  // ============================================
  const paperStyle = {
    p: 3,
    borderRadius: "20px",
    boxShadow: `0 8px 20px rgba(156, 39, 176, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)`,
    background:
      "linear-gradient(145deg, rgba(241, 245, 249, 0.95) 0%, rgba(226, 232, 240, 0.85) 100%)",
    backdropFilter: "blur(8px)",
    display: "flex",
    flexDirection: "column" as const,
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <Box>
      {/* Encabezado */}
      <Box mb={4}>
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="bold"
          sx={{ color: CIAM_COLOR }}
        >
          CIAM - Centro Integral de Atención al Adulto Mayor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Dashboard estadístico del programa CIAM
        </Typography>
        {usandoDemo && !isLoading && (
          <Chip
            label="Mostrando datos de demostración"
            size="small"
            sx={{
              mt: 1.5,
              backgroundColor: "#fff3e0",
              color: "#e65100",
              fontWeight: 600,
              border: "1px solid #ffcc80",
            }}
          />
        )}
      </Box>

      {/* ============================================ */}
      {/* TARJETAS DE ESTADÍSTICAS */}
      {/* ============================================ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <Box key={index} sx={{ position: "relative", height: "100%" }}>
            {/* Sombra morada difuminada */}
            <Box
              sx={{
                position: "absolute",
                bottom: "-15px",
                left: "10%",
                right: "10%",
                height: "30px",
                background: CIAM_GRADIENT,
                borderRadius: "50%",
                filter: "blur(12px)",
                zIndex: 0,
              }}
            />
            <Card
              sx={{
                height: "100%",
                borderRadius: "24px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
                border: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
                position: "relative",
                overflow: "visible",
                zIndex: 1,
                "&:hover": {
                  transform: "translateY(-4px)",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  right: "-6px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "12px",
                  height: "60%",
                  background: CIAM_BAR_GRADIENT,
                  borderRadius: "12px",
                  boxShadow: "0 4px 10px rgba(156, 39, 176, 0.35)",
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}30 100%)`,
                      color: stat.color,
                      width: 56,
                      height: 56,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "16px",
                      mr: 2,
                      boxShadow: `0 4px 12px ${stat.color}25`,
                      border: `1px solid ${stat.color}20`,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  {isLoading ? (
                    <Skeleton variant="text" width={80} height={40} />
                  ) : (
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* ============================================ */}
      {/* FILA 1: Nivel de Pobreza + Seguro de Salud */}
      {/* ============================================ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Nivel de Pobreza - Donut Chart */}
        <Paper sx={{ ...paperStyle, height: "420px" }}>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight="bold"
            sx={{ color: "#334155" }}
          >
            Nivel de Pobreza
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Clasificación socioeconómica de los adultos mayores
          </Typography>

          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              <CircularProgress sx={{ color: CIAM_COLOR }} />
            </Box>
          ) : distribucionPobreza.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              <Typography variant="body2" color="text.secondary">
                No hay datos disponibles
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  {pobrezaSegments.map((segment, i) => (
                    <path
                      key={i}
                      d={segment.path}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.transformOrigin = "100px 100px";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />
                  ))}
                  <circle cx="100" cy="100" r="45" fill="white" />
                  <text
                    x="100"
                    y="95"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#334155"
                  >
                    Total
                  </text>
                  <text
                    x="100"
                    y="112"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="700"
                    fill={CIAM_COLOR}
                  >
                    {totalPobreza.toLocaleString()}
                  </text>
                </svg>
              </Box>
              {/* Leyenda */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  px: 2,
                }}
              >
                {pobrezaSegments.map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "3px",
                          backgroundColor: item.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#475569", fontSize: "0.85rem" }}
                      >
                        {item.nombre}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${item.cantidad} (${item.porcentaje}%)`}
                      size="small"
                      sx={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Paper>

        {/* Seguro de Salud - Donut Chart */}
        <Paper sx={{ ...paperStyle, height: "420px" }}>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight="bold"
            sx={{ color: "#334155" }}
          >
            Seguro de Salud
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Cobertura de seguro de salud
          </Typography>

          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              <CircularProgress sx={{ color: CIAM_COLOR }} />
            </Box>
          ) : distribucionSeguro.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              <Typography variant="body2" color="text.secondary">
                No hay datos disponibles
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  {seguroSegments.map((segment, i) => (
                    <path
                      key={i}
                      d={segment.path}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.transformOrigin = "100px 100px";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />
                  ))}
                  <circle cx="100" cy="100" r="45" fill="white" />
                  <text
                    x="100"
                    y="95"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#334155"
                  >
                    Total
                  </text>
                  <text
                    x="100"
                    y="112"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="700"
                    fill="#2196f3"
                  >
                    {totalSeguro.toLocaleString()}
                  </text>
                </svg>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  px: 2,
                }}
              >
                {seguroSegments.map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "3px",
                          backgroundColor: item.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#475569", fontSize: "0.85rem" }}
                      >
                        {item.nombre}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${item.cantidad} (${item.porcentaje}%)`}
                      size="small"
                      sx={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* ============================================ */}
      {/* FILA 2: Alfabetización + Distribución por Edad */}
      {/* ============================================ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Alfabetización - Donut pequeño */}
        <Paper sx={{ ...paperStyle, height: "400px" }}>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight="bold"
            sx={{ color: "#334155" }}
          >
            Alfabetización
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            ¿Saben leer y escribir?
          </Typography>

          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              <CircularProgress sx={{ color: CIAM_COLOR }} />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 2,
                  flex: 1,
                }}
              >
                <svg width="180" height="180" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  {alfabetizacionSegments.map((segment, i) => (
                    <path
                      key={i}
                      d={segment.path}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.transformOrigin = "100px 100px";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />
                  ))}
                  <circle cx="100" cy="100" r="45" fill="white" />
                  <text
                    x="100"
                    y="90"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#334155"
                  >
                    Saben leer
                  </text>
                  <text
                    x="100"
                    y="108"
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="700"
                    fill="#4caf50"
                  >
                    {estadisticas.total > 0
                      ? (
                          (estadisticas.sabenLeerEscribir /
                            estadisticas.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </text>
                </svg>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 3,
                  px: 2,
                }}
              >
                {alfabetizacionSegments.map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "3px",
                        backgroundColor: item.color,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "#475569", fontSize: "0.85rem" }}
                    >
                      {item.nombre}: {item.cantidad} ({item.porcentaje}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Paper>

        {/* Distribución por Rango de Edad - Barras */}
        <Paper sx={{ ...paperStyle, height: "400px" }}>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight="bold"
            sx={{ color: "#334155" }}
          >
            Distribución por Edad
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Rangos de edad de los adultos mayores
          </Typography>

          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              <CircularProgress sx={{ color: CIAM_COLOR }} />
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "240px",
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 1.5,
                  px: 2,
                }}
              >
                {distribucionEdad.map((item) => {
                  const maxBarHeight = 200;
                  const barHeight = Math.max(
                    (item.cantidad / maxEdadRango) * maxBarHeight,
                    8
                  );
                  return (
                    <Box
                      key={item.rango}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#334155",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          mb: 0.5,
                        }}
                      >
                        {item.cantidad}
                      </Typography>
                      <Box
                        sx={{
                          width: "70%",
                          height: `${barHeight}px`,
                          background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}90 100%)`,
                          borderRadius: "6px 6px 0 0",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          boxShadow: `0 2px 6px ${item.color}40`,
                          "&:hover": {
                            opacity: 0.85,
                            transform: "scaleX(1.1)",
                            boxShadow: `0 4px 12px ${item.color}60`,
                          },
                        }}
                        title={`${item.rango} años: ${item.cantidad} personas`}
                      />
                    </Box>
                  );
                })}
              </Box>
              {/* Línea base */}
              <Box
                sx={{
                  height: "2px",
                  backgroundColor: "#94a3b8",
                  borderRadius: "1px",
                  mx: 2,
                }}
              />
              {/* Etiquetas */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  px: 2,
                  mt: 0.5,
                }}
              >
                {distribucionEdad.map((item) => (
                  <Box key={item.rango} sx={{ flex: 1, textAlign: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                      }}
                    >
                      {item.rango}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* ============================================ */}
      {/* FILA 3: Profesiones - Barras horizontales */}
      {/* ============================================ */}
      <Paper sx={{ ...paperStyle, height: "auto", minHeight: "350px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 0.5,
          }}
        >
          <Work sx={{ color: CIAM_COLOR, fontSize: 24 }} />
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: "#334155" }}
          >
            Distribución por Profesión
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
          Principales profesiones u ocupaciones de los adultos mayores
        </Typography>

        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flex={1}
            py={4}
          >
            <CircularProgress sx={{ color: CIAM_COLOR }} />
          </Box>
        ) : distribucionProfesion.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flex={1}
            py={4}
          >
            <Typography variant="body2" color="text.secondary">
              No hay datos disponibles
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {distribucionProfesion.map((item, i) => {
              const porcentaje = (item.cantidad / maxProfesion) * 100;
              const colorIdx = i % AGE_RANGE_COLORS.length;
              const barColor = AGE_RANGE_COLORS[colorIdx];
              return (
                <Box key={item.nombre}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#475569",
                        fontWeight: 500,
                        fontSize: "0.85rem",
                      }}
                    >
                      {item.nombre}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#334155",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {item.cantidad}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      height: "24px",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "12px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${porcentaje}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${barColor}80 0%, ${barColor} 100%)`,
                        borderRadius: "12px",
                        transition: "width 0.6s ease",
                        boxShadow: `0 2px 6px ${barColor}30`,
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
