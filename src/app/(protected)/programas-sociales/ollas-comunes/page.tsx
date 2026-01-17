"use client";

import ModuleDashboard from "@/components/modules/ModuleDashboard";

export default function OllasDashboardPage() {
  return (
    <ModuleDashboard
      title="Ollas Comunes"
      subtitle="Gestión de Ollas Comunes"
      icon="soup"
      color="#d81b7e"
      stats={[
        { title: "Total Ollas", value: "234", color: "#d81b7e" },
        { title: "Beneficiarios", value: "12,500", color: "#4caf50" },
        { title: "Jurisdicciones", value: "18", color: "#00a3a8" },
        { title: "Raciones Diarias", value: "18,000", color: "#ff9800" },
      ]}
    />
  );
}
