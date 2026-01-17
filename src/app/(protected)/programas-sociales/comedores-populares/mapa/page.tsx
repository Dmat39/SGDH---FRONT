"use client";

import ModuleMapa from "@/components/modules/ModuleMapa";

export default function ComedoresMapaPage() {
  return (
    <ModuleMapa
      title="Comedores Populares - Mapa"
      subtitle="Visualización geográfica de Comedores Populares"
      mainColor="#d81b7e"
      layers={[
        { id: "jurisdicciones", name: "Jurisdicciones", description: "Límites territoriales", color: "#34b429", defaultVisible: true },
        { id: "comedores", name: "Comedores", description: "Ubicación de comedores", color: "#d81b7e", defaultVisible: true },
        { id: "beneficiarios", name: "Beneficiarios", description: "Distribución de beneficiarios", color: "#1976d2", defaultVisible: false },
      ]}
    />
  );
}
