"use client";

import ModuleMapa from "@/components/modules/ModuleMapa";

export default function ULEMapaPage() {
  return (
    <ModuleMapa
      title="ULE - Mapa"
      subtitle="Visualización geográfica de solicitudes ULE"
      mainColor="#d81b7e"
      layers={[
        { id: "jurisdicciones", name: "Jurisdicciones", description: "Límites territoriales", color: "#34b429", defaultVisible: true },
        { id: "solicitudes", name: "Solicitudes", description: "Ubicación de solicitantes", color: "#d81b7e", defaultVisible: true },
        { id: "atendidos", name: "Atendidos", description: "Solicitudes atendidas", color: "#4caf50", defaultVisible: false },
      ]}
    />
  );
}
