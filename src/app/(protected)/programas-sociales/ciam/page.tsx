"use client";

import ModuleDashboard from "@/components/modules/ModuleDashboard";

export default function CIAMDashboardPage() {
  return (
    <ModuleDashboard
      title="CIAM"
      subtitle="Centro Integral de Atención al Adulto Mayor"
      icon="elderly"
      color="#d81b7e"
      stats={[
        { title: "Adultos Mayores", value: "4,567", color: "#d81b7e" },
        { title: "Activos", value: "3,890", color: "#4caf50" },
        { title: "Talleres Activos", value: "24", color: "#00a3a8" },
        { title: "Asistencia Mensual", value: "2,345", color: "#ff9800" },
      ]}
    />
  );
}
