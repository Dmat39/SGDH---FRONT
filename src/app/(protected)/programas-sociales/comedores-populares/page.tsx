"use client";

import { Box, Card, CardContent, Typography, Paper } from "@mui/material";
import { Restaurant, People, Groups, LocationOn } from "@mui/icons-material";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];

export default function ComedoresDashboardPage() {
  // Estadísticas para las tarjetas (datos estáticos por ahora)
  const stats = [
    {
      title: "Total Comedores",
      value: "156",
      icon: <Restaurant sx={{ fontSize: 32 }} />,
      color: "#d81b7e",
    },
    {
      title: "Beneficiarios",
      value: "8,900",
      icon: <People sx={{ fontSize: 32 }} />,
      color: "#4caf50",
    },
    {
      title: "Jurisdicciones",
      value: "18",
      icon: <LocationOn sx={{ fontSize: 32 }} />,
      color: "#00a3a8",
    },
    {
      title: "Raciones Diarias",
      value: "12,500",
      icon: <Groups sx={{ fontSize: 32 }} />,
      color: "#ff9800",
    },
  ];

  return (
    <Box>
      {/* Encabezado */}
      <Box mb={4}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: subgerencia.color,
            fontWeight: 700,
            fontFamily: "'Poppins', 'Roboto', sans-serif",
            letterSpacing: "-0.5px"
          }}
        >
          Comedores Populares
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontFamily: "'Inter', 'Roboto', sans-serif"
          }}
        >
          Dashboard de Gestión de Comedores Populares
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
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontFamily: "'Poppins', 'Roboto', sans-serif"
                    }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontFamily: "'Inter', 'Roboto', sans-serif",
                    fontWeight: 500
                  }}
                >
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Sección de gráficos (vacía por ahora) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* Gráfico 1 - Placeholder */}
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
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: "#334155",
              fontWeight: 700,
              fontFamily: "'Poppins', 'Roboto', sans-serif"
            }}
          >
            Comedores por Zona
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mb: 2,
              fontFamily: "'Inter', 'Roboto', sans-serif"
            }}
          >
            Distribución de comedores por jurisdicción
          </Typography>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flex={1}
            sx={{
              border: "2px dashed #cbd5e1",
              borderRadius: "12px",
              backgroundColor: "rgba(241, 245, 249, 0.5)"
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#94a3b8",
                fontFamily: "'Inter', 'Roboto', sans-serif",
                fontStyle: "italic"
              }}
            >
              Contenido próximamente
            </Typography>
          </Box>
        </Paper>

        {/* Gráfico 2 - Placeholder */}
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
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: "#334155",
              fontWeight: 700,
              fontFamily: "'Poppins', 'Roboto', sans-serif"
            }}
          >
            Beneficiarios por Comedor
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mb: 2,
              fontFamily: "'Inter', 'Roboto', sans-serif"
            }}
          >
            Distribución de beneficiarios
          </Typography>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flex={1}
            sx={{
              border: "2px dashed #cbd5e1",
              borderRadius: "12px",
              backgroundColor: "rgba(241, 245, 249, 0.5)"
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#94a3b8",
                fontFamily: "'Inter', 'Roboto', sans-serif",
                fontStyle: "italic"
              }}
            >
              Contenido próximamente
            </Typography>
          </Box>
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
        {/* Tarjeta informativa 1 */}
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
              <Typography
                variant="body2"
                sx={{
                  color: "#92400e",
                  fontWeight: 500,
                  fontFamily: "'Inter', 'Roboto', sans-serif"
                }}
              >
                Raciones Mensuales
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#78350f",
                  fontFamily: "'Poppins', 'Roboto', sans-serif"
                }}
              >
                375,000
              </Typography>
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
              <Restaurant sx={{ fontSize: 28, color: "#92400e" }} />
            </Box>
          </Box>
        </Paper>

        {/* Tarjeta informativa 2 */}
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
              <Typography
                variant="body2"
                sx={{
                  color: "#1e40af",
                  fontWeight: 500,
                  fontFamily: "'Inter', 'Roboto', sans-serif"
                }}
              >
                Comedores Activos
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#1e3a8a",
                  fontFamily: "'Poppins', 'Roboto', sans-serif"
                }}
              >
                156 de 160
              </Typography>
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
              <LocationOn sx={{ fontSize: 28, color: "#1e40af" }} />
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
