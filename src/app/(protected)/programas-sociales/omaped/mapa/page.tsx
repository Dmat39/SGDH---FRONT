"use client";

import ModuleMapa from "@/components/modules/ModuleMapa";

export default function OMAPEDMapaPage() {
  return (
    <ModuleMapa
      title="OMAPED - Mapa"
      subtitle="Visualización geográfica de beneficiarios OMAPED"
      mainColor="#d81b7e"
      layers={[
        { id: "jurisdicciones", name: "Jurisdicciones", description: "Límites territoriales", color: "#34b429", defaultVisible: true },
        { id: "beneficiarios", name: "Beneficiarios", description: "Ubicación de beneficiarios", color: "#d81b7e", defaultVisible: true },
        { id: "centros", name: "Centros de Atención", description: "Puntos de servicio", color: "#1976d2", defaultVisible: false },
      ]}
    />
  );
}
