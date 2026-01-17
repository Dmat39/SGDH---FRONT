"use client";

import ModuleDashboard from "@/components/modules/ModuleDashboard";

export default function PANTBCDashboardPage() {
  return (
    <ModuleDashboard
      title="PANTBC"
      subtitle="Programa de Alimentación y Nutrición para pacientes con TBC"
      icon="restaurant"
      color="#d81b7e"
      stats={[
        { title: "Total Beneficiarios", value: "2,456", color: "#d81b7e" },
        { title: "Activos en Tratamiento", value: "2,100", color: "#4caf50" },
        { title: "Establecimientos", value: "45", color: "#00a3a8" },
        { title: "Nuevos este Mes", value: "+85", color: "#ff9800" },
      ]}
    />
  );
}
