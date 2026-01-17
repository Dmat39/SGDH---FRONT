"use client";

import ModuleDashboard from "@/components/modules/ModuleDashboard";

export default function OMAPEDDashboardPage() {
  return (
    <ModuleDashboard
      title="OMAPED"
      subtitle="Oficina Municipal de Atención a la Persona con Discapacidad"
      icon="accessible"
      color="#d81b7e"
      stats={[
        { title: "Personas Registradas", value: "3,456", color: "#d81b7e" },
        { title: "Atenciones Mensuales", value: "890", color: "#4caf50" },
        { title: "Programas Activos", value: "12", color: "#00a3a8" },
        { title: "Nuevos Registros", value: "+78", color: "#ff9800" },
      ]}
    />
  );
}
