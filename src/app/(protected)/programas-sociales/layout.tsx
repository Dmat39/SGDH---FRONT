"use client";

import { useState } from "react";
import Header from "@/components/navigation/Header";
import Sidebar from "@/components/navigation/Sidebar";
import { SUBGERENCIAS, SubgerenciaType, MODULOS_PROGRAMAS_SOCIALES } from "@/lib/constants";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];

// Crear menú con Dashboard como primer item
const menuItems = [
  {
    id: "dashboard",
    nombre: "Dashboard",
    ruta: "/programas-sociales",
    icono: "Dashboard",
    subgerencia: SubgerenciaType.PROGRAMAS_SOCIALES,
  },
  ...MODULOS_PROGRAMAS_SOCIALES.map((modulo) => ({
    ...modulo,
    subgerencia: SubgerenciaType.PROGRAMAS_SOCIALES,
  })),
];

export default function ProgramasSocialesLayout({ children }: { children: React.ReactNode }) {
  const [toggled, setToggled] = useState(false);

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        toggled={toggled}
        setToggled={setToggled}
        menuItems={menuItems}
        color={subgerencia.color}
        subgerenciaName={subgerencia.nombre}
      />
      <div className="w-full overflow-auto flex flex-col relative">
        <Header toggled={toggled} setToggled={setToggled} />
        <div className="bg-gray-100 flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
