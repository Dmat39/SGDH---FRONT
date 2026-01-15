"use client";

import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import Header from "@/components/navigation/Header";
import Sidebar from "@/components/navigation/Sidebar";
import { SUBGERENCIAS, SubgerenciaType, MODULOS_SERVICIOS_SOCIALES } from "@/lib/constants";

const subgerencia = SUBGERENCIAS[SubgerenciaType.SERVICIOS_SOCIALES];

// Crear menú con Dashboard como primer item
const menuItems = [
  {
    id: "dashboard",
    nombre: "Dashboard",
    ruta: "/servicios-sociales",
    icono: "Dashboard",
    subgerencia: SubgerenciaType.SERVICIOS_SOCIALES,
  },
  ...MODULOS_SERVICIOS_SOCIALES.map((modulo) => ({
    ...modulo,
    subgerencia: SubgerenciaType.SERVICIOS_SOCIALES,
  })),
];

export default function ServiciosSocialesLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        title={subgerencia.nombre}
        color={subgerencia.color}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={menuItems}
        color={subgerencia.color}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: "100%", md: `calc(100% - 280px)` },
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
