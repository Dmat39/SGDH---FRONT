"use client";

import ModuleMapa from "@/components/modules/ModuleMapa";

export default function CIAMMapaPage() {
  return (
    <ModuleMapa
      title="CIAM - Mapa"
      subtitle="Visualización geográfica de beneficiarios CIAM"
      mainColor="#d81b7e"
      layers={[
        { id: "jurisdicciones", name: "Jurisdicciones", description: "Límites territoriales", color: "#34b429", defaultVisible: true },
        { id: "beneficiarios", name: "Adultos Mayores", description: "Ubicación de beneficiarios", color: "#d81b7e", defaultVisible: true },
        { id: "centros", name: "Centros CIAM", description: "Locales de atención", color: "#1976d2", defaultVisible: false },
      ]}
    />
  );
}
