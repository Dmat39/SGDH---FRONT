"use client";

import LoginForm from "@/components/forms/LoginForm";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";

export default function ProgramasSocialesLoginPage() {
  const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Banner de imágenes de fondo */}
      <div
        className="relative w-full h-64 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/banner-header.jpg')",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="absolute inset-0 bg-white/70"></div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 -mt-32">
        <LoginForm
          subgerencia={SubgerenciaType.PROGRAMAS_SOCIALES}
          color={subgerencia.color}
          subgerenciaName={subgerencia.nombre}
        />
      </div>

      {/* Footer con logo */}
      <div className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold">
                <span className="text-red-600">SAN JUAN DE </span>
                <span className="text-cyan-600">LURIGANCHO</span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
