"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Card, CardContent, Typography, Paper, CircularProgress, Skeleton } from "@mui/material";
import { People, LocalDrink, Groups, Accessible } from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";
import { useFetch } from "@/lib/hooks/useFetch";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];

// Lista de comunas con nombres y colores
const COMUNAS_INFO = [
  { id: 1, name: "ZARATE", color: "#9f004c" },
  { id: 2, name: "CAMPOY", color: "#52f9eb" },
  { id: 3, name: "MANGOMARCA", color: "#54cdd3" },
  { id: 4, name: "SALSAS", color: "#6119f9" },
  { id: 5, name: "HUAYRONA", color: "#d16567" },
  { id: 6, name: "CANTO REY", color: "#ac9da9" },
  { id: 7, name: "HUANCARAY", color: "#ecc20f" },
  { id: 8, name: "MARISCAL CACERES", color: "#72427c" },
  { id: 9, name: "MOTUPE", color: "#eb147c" },
  { id: 10, name: "JICAMARCA", color: "#db63b2" },
  { id: 11, name: "MARIATEGUI", color: "#d6a59c" },
  { id: 12, name: "CASA BLANCA", color: "#fdd15d" },
  { id: 13, name: "BAYOVAR", color: "#5c335d" },
  { id: 14, name: "HUASCAR", color: "#efaeac" },
  { id: 15, name: "CANTO GRANDE", color: "#8768c9" },
  { id: 16, name: "SAN HILARION", color: "#73165f" },
  { id: 17, name: "LAS FLORES", color: "#ab83cf" },
  { id: 18, name: "CAJA DE AGUA", color: "#72cfdf" },
];

// Interfaces para el backend
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
  couple: { id: string; name: string } | null;
  town: { id: string; name: string } | null;
  coordinator: {
    id: string;
    name: string;
    lastname: string;
    dni: string;
    phone: string;
    birthday?: string;
  } | null;
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

export default function PVLDashboardPage() {
  const { getData } = useFetch();
  const [isLoading, setIsLoading] = useState(true);
  const [comitesData, setComitesData] = useState<CommitteeBackend[]>([]);

  // Cargar datos del backend
  const fetchData = useCallback(async () => {
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
        if (response?.data?.data) {
          setComitesData(response.data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calcular estadísticas
  const totalBeneficiarios = comitesData.reduce((sum, c) => sum + c.beneficiaries, 0);
  const totalComites = comitesData.length;
  const totalSocios = comitesData.reduce((sum, c) => sum + c.members, 0);
  const totalDiscapacitados = comitesData.reduce((sum, c) => sum + c.handicappeds, 0);
  const totalExtranjeros = comitesData.reduce((sum, c) => sum + c.beneficiaries_foreign, 0);

  // Estadísticas para las tarjetas
  const stats = [
    {
      title: "Total Beneficiarios",
      value: totalBeneficiarios.toLocaleString(),
      icon: <People sx={{ fontSize: 32 }} />,
      color: "#d81b7e",
    },
    {
      title: "Total Comités",
      value: totalComites.toLocaleString(),
      icon: <LocalDrink sx={{ fontSize: 32 }} />,
      color: "#00a3a8",
    },
    {
      title: "Total Socios",
      value: totalSocios.toLocaleString(),
      icon: <Groups sx={{ fontSize: 32 }} />,
      color: "#4caf50",
    },
    {
      title: "Discapacitados",
      value: totalDiscapacitados.toLocaleString(),
      icon: <Accessible sx={{ fontSize: 32 }} />,
      color: "#ff9800",
    },
  ];

  // Calcular beneficiarios por comuna
  const beneficiariosPorComuna = COMUNAS_INFO.map((comuna) => {
    const comitesComuna = comitesData.filter((c) => c.commune === comuna.id);
    const totalBenef = comitesComuna.reduce((sum, c) => sum + c.beneficiaries, 0);
    return {
      id: comuna.id,
      nombre: comuna.name,
      cantidad: totalBenef,
      color: comuna.color,
    };
  }).filter((c) => c.cantidad > 0);

  // Calcular comités por comuna
  const comitesPorComuna = COMUNAS_INFO.map((comuna) => {
    const cantidad = comitesData.filter((c) => c.commune === comuna.id).length;
    return {
      id: comuna.id,
      nombre: comuna.name,
      cantidad,
      color: comuna.color,
    };
  }).filter((c) => c.cantidad > 0);

  const totalBenefComuna = beneficiariosPorComuna.reduce((sum, c) => sum + c.cantidad, 0);
  const maxComites = Math.max(...comitesPorComuna.map((c) => c.cantidad), 1);

  // Calcular segmentos del donut para beneficiarios
  let currentAngle = -Math.PI / 2;
  const segments = beneficiariosPorComuna.map((comuna) => {
    const angle = totalBenefComuna > 0 ? (comuna.cantidad / totalBenefComuna) * 2 * Math.PI : 0;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...comuna,
      startAngle,
      endAngle,
      path: generateDonutSegment(startAngle, endAngle, 90, 50, 100, 100),
    };
  });

  return (
    <Box>
      {/* Encabezado */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: subgerencia.color }}>
          PVL - Programa de Vaso de Leche
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Dashboard del Programa de Vaso de Leche
        </Typography>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              height: "100%",
            }}
          >
            {/* Sombra rosa difuminada debajo */}
            <Box
              sx={{
                position: "absolute",
                bottom: "-15px",
                left: "10%",
                right: "10%",
                height: "30px",
                background: "linear-gradient(to bottom, rgba(216, 27, 126, 0.3), rgba(216, 27, 126, 0))",
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
                  background: "linear-gradient(to bottom, #f472b6, #d81b7e, #be185d)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 10px rgba(216, 27, 126, 0.35)",
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

      {/* Contenido adicional */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* Gráfico de Comités por Comuna */}
        <Paper
          sx={{
            p: 3,
            height: "400px",
            borderRadius: "20px",
            boxShadow: "0 8px 20px rgba(216, 27, 126, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08)",
            background: "linear-gradient(145deg, rgba(241, 245, 249, 0.95) 0%, rgba(226, 232, 240, 0.85) 100%)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: "#334155" }}>
            Comités por Comuna
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Distribución de comités por zona
          </Typography>

          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
              <CircularProgress sx={{ color: "#d81b7e" }} />
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                pr: 1,
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-track": { background: "#f1f5f9", borderRadius: "4px" },
                "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "4px" },
              }}
            >
              {comitesPorComuna
                .sort((a, b) => b.cantidad - a.cantidad)
                .map((comuna) => (
                  <Box key={comuna.id} sx={{ mb: 1.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" sx={{ color: "#475569", fontWeight: 500, fontSize: "0.7rem" }}>
                        {comuna.id}. {comuna.nombre}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#334155", fontWeight: 600, fontSize: "0.7rem" }}>
                        {comuna.cantidad}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 8,
                        backgroundColor: "#e2e8f0",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${(comuna.cantidad / maxComites) * 100}%`,
                          backgroundColor: comuna.color,
                          borderRadius: "4px",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </Box>
                  </Box>
                ))}
            </Box>
          )}
        </Paper>

        {/* Beneficiarios por Comuna - Donut Chart */}
        <Paper
          sx={{
            p: 3,
            height: "400px",
            borderRadius: "20px",
            boxShadow: "0 8px 20px rgba(216, 27, 126, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08)",
            background: "linear-gradient(145deg, rgba(241, 245, 249, 0.95) 0%, rgba(226, 232, 240, 0.85) 100%)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: "#334155" }}>
            Beneficiarios por Comuna
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Distribución de beneficiarios por zona
          </Typography>

          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
              <CircularProgress sx={{ color: "#d81b7e" }} />
            </Box>
          ) : (
            <>
              {/* Gráfico Donut */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <svg width="200" height="200" viewBox="0 0 200 200">
                  {/* Círculo de fondo con borde punteado */}
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Segmentos del donut */}
                  {segments.map((segment, index) => (
                    <path
                      key={index}
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

                  {/* Círculo central blanco */}
                  <circle cx="100" cy="100" r="45" fill="white" />

                  {/* Texto central */}
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
                    fill="#d81b7e"
                  >
                    {totalBenefComuna.toLocaleString()}
                  </text>
                </svg>
              </Box>

              {/* Lista de comunas con cantidades */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 1,
                  flex: 1,
                  overflowY: "auto",
                  px: 1,
                  "&::-webkit-scrollbar": { width: "4px" },
                  "&::-webkit-scrollbar-track": { background: "#f1f5f9", borderRadius: "4px" },
                  "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "4px" },
                }}
              >
                {beneficiariosPorComuna
                  .sort((a, b) => b.cantidad - a.cantidad)
                  .map((comuna) => (
                    <Box
                      key={comuna.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        py: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "3px",
                          backgroundColor: comuna.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#475569",
                          fontSize: "0.6rem",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        C{comuna.id}: {comuna.cantidad.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* Fila adicional de estadísticas */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 3,
          mt: 3,
        }}
      >
        {/* Extranjeros */}
        <Paper
          sx={{
            p: 3,
            borderRadius: "20px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="#92400e" fontWeight={500}>
                Beneficiarios Extranjeros
              </Typography>
              {isLoading ? (
                <Skeleton variant="text" width={60} height={36} />
              ) : (
                <Typography variant="h4" fontWeight="bold" color="#78350f">
                  {totalExtranjeros.toLocaleString()}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "16px",
                backgroundColor: "rgba(120, 53, 15, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <People sx={{ fontSize: 28, color: "#92400e" }} />
            </Box>
          </Box>
        </Paper>

        {/* Comunas activas */}
        <Paper
          sx={{
            p: 3,
            borderRadius: "20px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="#1e40af" fontWeight={500}>
                Comunas con Comités
              </Typography>
              {isLoading ? (
                <Skeleton variant="text" width={60} height={36} />
              ) : (
                <Typography variant="h4" fontWeight="bold" color="#1e3a8a">
                  {comitesPorComuna.length} de 18
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "16px",
                backgroundColor: "rgba(30, 64, 175, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalDrink sx={{ fontSize: 28, color: "#1e40af" }} />
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
