"use client";

import Link from "next/link";
import { SUBGERENCIAS, SubgerenciaType, MUNICIPALITY } from "@/lib/constants";
import Image from "next/image";

export default function HomePage() {
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
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">BIENVENIDO</h1>
            <p className="text-xl md:text-2xl text-gray-600">PORTAL DE INICIO DE SESIÓN</p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Botones de selección de subgerencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Botón Programas Sociales */}
            <Link
              href="/login/programas-sociales"
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div
                className="h-48 flex items-center justify-center text-white p-8 bg-programas-sociales hover:bg-programas-sociales-hover transition-colors"
                style={{ backgroundColor: SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES].color }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-center leading-tight">
                  SUBGERENCIA DE
                  <br />
                  PROGRAMAS SOCIALES
                </h2>
              </div>
            </Link>

            {/* Botón Servicios Sociales */}
            <Link
              href="/login/servicios-sociales"
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div
                className="h-48 flex items-center justify-center text-white p-8 bg-servicios-sociales hover:bg-servicios-sociales-hover transition-colors"
                style={{ backgroundColor: SUBGERENCIAS[SubgerenciaType.SERVICIOS_SOCIALES].color }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-center leading-tight">
                  SUBGERENCIA DE
                  <br />
                  SERVICIOS SOCIALES
                </h2>
              </div>
            </Link>
          </div>

          {/* Texto de instrucción */}
          <p className="text-center text-gray-600 text-lg mb-8">Selecciona tu área para iniciar sesión</p>
        </div>
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

      {/* Elemento decorativo (esquina) */}
      <div className="fixed bottom-0 right-0 w-32 h-32 opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="100,0 100,100 0,100" fill="#00a3a8" />
          <polygon points="100,0 100,60 40,100 0,100" fill="#d81b7e" />
        </svg>
      </div>
    </div>
  );
}
