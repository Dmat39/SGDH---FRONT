"use client";

import ModuleDashboard from "@/components/modules/ModuleDashboard";

export default function ComedoresDashboardPage() {
  return (
    <ModuleDashboard
      title="Comedores Populares"
      subtitle="Gestión de Comedores Populares"
      icon="soup"
      color="#d81b7e"
      stats={[
        { title: "Total Comedores", value: "156", color: "#d81b7e" },
        { title: "Beneficiarios", value: "8,900", color: "#4caf50" },
        { title: "Jurisdicciones", value: "18", color: "#00a3a8" },
        { title: "Raciones Diarias", value: "12,500", color: "#ff9800" },
      ]}
    />
  );
}
