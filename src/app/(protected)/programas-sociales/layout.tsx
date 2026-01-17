"use client";

import { useState } from "react";
import Header from "@/components/navigation/Header";
import Sidebar from "@/components/navigation/Sidebar";
import { SUBGERENCIAS, SubgerenciaType, MODULOS_PROGRAMAS_SOCIALES } from "@/lib/constants";
import { usePermissions } from "@/lib/hooks/usePermissions";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];

export default function ProgramasSocialesLayout({ children }: { children: React.ReactNode }) {
  const [toggled, setToggled] = useState(false);
  const { filterMenuItems } = usePermissions();

  // Crear menú con Dashboard como primer item
  const allMenuItems = [
    {
      id: "dashboard",
      nombre: "Dashboard",
      ruta: "/programas-sociales",
      icono: "Dashboard",
      permisos: ["all", "all_programas_sociales"], // Solo admin y subgerente ven el dashboard general
    },
    ...MODULOS_PROGRAMAS_SOCIALES.map((modulo) => ({
      ...modulo,
      subgerencia: SubgerenciaType.PROGRAMAS_SOCIALES,
    })),
  ];

  // Filtrar módulos según permisos del usuario
  const menuItems = filterMenuItems(allMenuItems);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        toggled={toggled}
        setToggled={setToggled}
        menuItems={menuItems}
        color={subgerencia.color}
        subgerenciaName={subgerencia.nombre}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header toggled={toggled} setToggled={setToggled} />
        <main className="bg-gray-100 flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
