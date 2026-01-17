"use client";

import ModuleMapa from "@/components/modules/ModuleMapa";

export default function OllasMapaPage() {
  return (
    <ModuleMapa
      title="Ollas Comunes - Mapa"
      subtitle="Visualización geográfica de Ollas Comunes"
      mainColor="#d81b7e"
      layers={[
        { id: "jurisdicciones", name: "Jurisdicciones", description: "Límites territoriales", color: "#34b429", defaultVisible: true },
        { id: "ollas", name: "Ollas Comunes", description: "Ubicación de ollas", color: "#d81b7e", defaultVisible: true },
        { id: "beneficiarios", name: "Beneficiarios", description: "Distribución de beneficiarios", color: "#1976d2", defaultVisible: false },
      ]}
    />
  );
}
