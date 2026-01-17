"use client";

import ModuleMapa from "@/components/modules/ModuleMapa";

export default function PANTBCMapaPage() {
  return (
    <ModuleMapa
      title="PANTBC - Mapa"
      subtitle="Visualización geográfica del Programa PANTBC"
      mainColor="#d81b7e"
      layers={[
        { id: "jurisdicciones", name: "Jurisdicciones", description: "Límites territoriales", color: "#34b429", defaultVisible: true },
        { id: "establecimientos", name: "Establecimientos", description: "Centros de atención", color: "#d81b7e", defaultVisible: true },
        { id: "beneficiarios", name: "Beneficiarios", description: "Ubicación de beneficiarios", color: "#1976d2", defaultVisible: false },
      ]}
    />
  );
}
