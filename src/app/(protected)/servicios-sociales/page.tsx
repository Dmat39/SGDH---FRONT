"use client";

import { Box, Card, CardContent, Typography, Paper } from "@mui/material";
import {
  People,
  SportsScore,
  TrendingUp,
  Assessment,
} from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";

const subgerencia = SUBGERENCIAS[SubgerenciaType.SERVICIOS_SOCIALES];

// Datos de ejemplo para las tarjetas de estadísticas
const statsCards = [
  {
    title: "Total Participantes",
    value: "8,765",
    icon: <People fontSize="large" />,
    color: "#3f51b5",
  },
  {
    title: "Programas Activos",
    value: "3",
    icon: <SportsScore fontSize="large" />,
    color: "#4caf50",
  },
  {
    title: "Actividades del Mes",
    value: "89",
    icon: <TrendingUp fontSize="large" />,
    color: "#ff9800",
  },
  {
    title: "Reportes Generados",
    value: "32",
    icon: <Assessment fontSize="large" />,
    color: "#f44336",
  },
];

export default function ServiciosSocialesDashboard() {
  return (
    <Box>
      {/* Encabezado */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: subgerencia.color }}>
          Dashboard - Servicios Sociales
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido al panel de control de la Subgerencia de Servicios Sociales
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
        {statsCards.map((card, index) => (
          <Card
            key={index}
            sx={{
              height: "100%",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{
                    backgroundColor: `${card.color}20`,
                    color: card.color,
                    p: 1.5,
                    borderRadius: 2,
                    mr: 2,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {card.value}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Contenido adicional */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 3,
        }}
      >
        <Paper sx={{ p: 3, height: "400px" }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Actividad Reciente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aquí se mostrará un gráfico de actividad reciente
          </Typography>
          <Box
            sx={{
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
              mt: 2,
            }}
          >
            <Typography color="text.secondary">Gráfico de actividad</Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, height: "400px" }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Distribución por Servicio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gráfico de distribución
          </Typography>
          <Box
            sx={{
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
              mt: 2,
            }}
          >
            <Typography color="text.secondary">Gráfico circular</Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
