"use client";

import { Box, Card, CardContent, Typography, Paper } from "@mui/material";
import { People, LocalDrink, Map, TrendingUp } from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];

const stats = [
  {
    title: "Total Beneficiarios",
    value: "15,234",
    icon: <People sx={{ fontSize: 32 }} />,
    color: "#d81b7e",
  },
  {
    title: "Comités Activos",
    value: "423",
    icon: <LocalDrink sx={{ fontSize: 32 }} />,
    color: "#00a3a8",
  },
  {
    title: "Jurisdicciones",
    value: "18",
    icon: <Map sx={{ fontSize: 32 }} />,
    color: "#4caf50",
  },
  {
    title: "Crecimiento Mensual",
    value: "+2.5%",
    icon: <TrendingUp sx={{ fontSize: 32 }} />,
    color: "#ff9800",
  },
];

// Datos del gráfico de rango de edades (niños de 0 a 12 años)
const rangoEdades = [
  { rango: "0-2 años", cantidad: 2850, color: "#d81b7e" },
  { rango: "3-5 años", cantidad: 3420, color: "#c026d3" },
  { rango: "6-8 años", cantidad: 4150, color: "#a855f7" },
  { rango: "9-10 años", cantidad: 2680, color: "#8b5cf6" },
  { rango: "11-12 años", cantidad: 2134, color: "#c4b5fd" },
];

const maxCantidad = Math.max(...rangoEdades.map((item) => item.cantidad));

// Datos de las 18 comunas
const comunasData = [
  { nombre: "Comuna 1", cantidad: 1250, color: "#06b6d4" },
  { nombre: "Comuna 2", cantidad: 980, color: "#0891b2" },
  { nombre: "Comuna 3", cantidad: 1120, color: "#0e7490" },
  { nombre: "Comuna 4", cantidad: 750, color: "#22d3ee" },
  { nombre: "Comuna 5", cantidad: 890, color: "#67e8f9" },
  { nombre: "Comuna 6", cantidad: 1050, color: "#a78bfa" },
  { nombre: "Comuna 7", cantidad: 680, color: "#8b5cf6" },
  { nombre: "Comuna 8", cantidad: 920, color: "#7c3aed" },
  { nombre: "Comuna 9", cantidad: 1180, color: "#c4b5fd" },
  { nombre: "Comuna 10", cantidad: 760, color: "#34d399" },
  { nombre: "Comuna 11", cantidad: 840, color: "#10b981" },
  { nombre: "Comuna 12", cantidad: 1020, color: "#059669" },
  { nombre: "Comuna 13", cantidad: 690, color: "#6ee7b7" },
  { nombre: "Comuna 14", cantidad: 950, color: "#f472b6" },
  { nombre: "Comuna 15", cantidad: 1100, color: "#ec4899" },
  { nombre: "Comuna 16", cantidad: 780, color: "#db2777" },
  { nombre: "Comuna 17", cantidad: 870, color: "#f9a8d4" },
  { nombre: "Comuna 18", cantidad: 404, color: "#fb7185" },
];

const totalComunas = comunasData.reduce((sum, c) => sum + c.cantidad, 0);

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
  // Calcular ángulos para el donut chart
  let currentAngle = -Math.PI / 2; // Empezar desde arriba
  const segments = comunasData.map((comuna) => {
    const angle = (comuna.cantidad / totalComunas) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calcular posición del label
    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = 70;
    const labelX = 100 + labelRadius * Math.cos(midAngle);
    const labelY = 100 + labelRadius * Math.sin(midAngle);

    return {
      ...comuna,
      startAngle,
      endAngle,
      midAngle,
      labelX,
      labelY,
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
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
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
        {/* Gráfico de Rango de Edades */}
        <Paper
          sx={{
            p: 3,
            height: "400px",
            borderRadius: "20px",
            boxShadow: "0 8px 20px rgba(216, 27, 126, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08)",
            background: "linear-gradient(145deg, rgba(241, 245, 249, 0.95) 0%, rgba(226, 232, 240, 0.85) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: "#334155" }}>
            Rango de Edades
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
            Distribución de beneficiarios por grupo etario
          </Typography>

          {/* Gráfico de barras */}
          <Box
            sx={{
              height: "280px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: { xs: 2, sm: 3, md: 4 },
              px: 2,
              pt: 2,
            }}
          >
            {rangoEdades.map((item, index) => {
              const heightPercent = (item.cantidad / maxCantidad) * 100;
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    maxWidth: "80px",
                  }}
                >
                  {/* Cantidad encima de la barra */}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "#334155",
                      mb: 1,
                      fontSize: "0.75rem",
                    }}
                  >
                    {item.cantidad.toLocaleString()}
                  </Typography>

                  {/* Barra */}
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "50px",
                      height: `${Math.max(heightPercent * 2, 20)}px`,
                      background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}dd 100%)`,
                      borderRadius: "8px 8px 4px 4px",
                      transition: "all 0.3s ease",
                      boxShadow: `0 4px 12px ${item.color}40`,
                      "&:hover": {
                        transform: "scaleY(1.05)",
                        boxShadow: `0 6px 16px ${item.color}60`,
                      },
                    }}
                  />

                  {/* Etiqueta */}
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1.5,
                      color: "#475569",
                      fontWeight: 500,
                      fontSize: "0.7rem",
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.rango}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* Cantidades por Comuna */}
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
            Cantidades por Comuna
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Distribución de beneficiarios por comuna
          </Typography>

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
                {totalComunas.toLocaleString()}
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
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f5f9",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#cbd5e1",
                borderRadius: "4px",
              },
            }}
          >
            {comunasData.map((comuna, index) => (
              <Box
                key={index}
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
                    fontSize: "0.65rem",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  C{index + 1}: {comuna.cantidad.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
