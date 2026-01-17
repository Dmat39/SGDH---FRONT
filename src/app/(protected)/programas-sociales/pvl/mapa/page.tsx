"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
} from "@mui/material";
import { Layers, Place, MyLocation } from "@mui/icons-material";
import MapaJurisdicciones from "@/components/map/MapaJurisdicciones";

export default function PVLMapaPage() {
  const [showJurisdicciones, setShowJurisdicciones] = useState(true);
  const [showComites, setShowComites] = useState(true);
  const [showBeneficiarios, setShowBeneficiarios] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-4">
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          PVL - Mapa
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualización geográfica del Programa de Vaso de Leche
        </Typography>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Panel de Control de Capas */}
        <Paper sx={{ width: 280, flexShrink: 0, overflow: "auto" }}>
          <Box p={2}>
            <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1}>
              <Layers fontSize="small" />
              Control de Capas
            </Typography>
          </Box>
          <Divider />
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Place color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Jurisdicciones" secondary="Límites territoriales" />
              <Switch
                checked={showJurisdicciones}
                onChange={(e) => setShowJurisdicciones(e.target.checked)}
                size="small"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <MyLocation color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Comités" secondary="Ubicación de comités PVL" />
              <Switch
                checked={showComites}
                onChange={(e) => setShowComites(e.target.checked)}
                size="small"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Place color="secondary" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Beneficiarios" secondary="Distribución de beneficiarios" />
              <Switch
                checked={showBeneficiarios}
                onChange={(e) => setShowBeneficiarios(e.target.checked)}
                size="small"
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Box px={2} pb={2}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
              Leyenda
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: "#34b429", borderRadius: 0.5 }} />
                <Typography variant="caption">Jurisdicción</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: "#d81b7e", borderRadius: "50%" }} />
                <Typography variant="caption">Comité PVL</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: "#1976d2", borderRadius: "50%" }} />
                <Typography variant="caption">Beneficiario</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Mapa */}
        <Card sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <CardContent sx={{ flex: 1, p: 0, "&:last-child": { pb: 0 }, height: "100%" }}>
            <MapaJurisdicciones className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
