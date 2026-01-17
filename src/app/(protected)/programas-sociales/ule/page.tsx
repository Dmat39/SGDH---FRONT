"use client";

import ModuleDashboard from "@/components/modules/ModuleDashboard";

export default function ULEDashboardPage() {
  return (
    <ModuleDashboard
      title="ULE - Unidad Local de Empadronamiento"
      subtitle="Gestión de la Unidad Local de Empadronamiento"
      icon="accessible"
      color="#d81b7e"
      stats={[
        { title: "Solicitudes Atendidas", value: "5,678", color: "#d81b7e" },
        { title: "Pendientes", value: "234", color: "#ff9800" },
        { title: "Aprobadas", value: "4,890", color: "#4caf50" },
        { title: "Este Mes", value: "+456", color: "#00a3a8" },
      ]}
    />
  );
}
