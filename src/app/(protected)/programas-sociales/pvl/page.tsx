"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";
import { People, LocalDrink, Map, TrendingUp } from "@mui/icons-material";

const stats = [
  {
    title: "Total Beneficiarios",
    value: "15,234",
    icon: <People sx={{ fontSize: 40 }} />,
    color: "#d81b7e",
  },
  {
    title: "Comités Activos",
    value: "423",
    icon: <LocalDrink sx={{ fontSize: 40 }} />,
    color: "#00a3a8",
  },
  {
    title: "Jurisdicciones",
    value: "18",
    icon: <Map sx={{ fontSize: 40 }} />,
    color: "#4caf50",
  },
  {
    title: "Crecimiento Mensual",
    value: "+2.5%",
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    color: "#ff9800",
  },
];

export default function PVLDashboardPage() {
  return (
    <div>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        PVL - Programa de Vaso de Leche
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Dashboard del Programa de Vaso de Leche
      </Typography>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Beneficiarios por Mes
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
                color="text.secondary"
              >
                Gráfico de beneficiarios (próximamente)
              </Box>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Jurisdicción
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
                color="text.secondary"
              >
                Gráfico circular (próximamente)
              </Box>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
