"use client";

import Link from "next/link";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";
import Image from "next/image";

// Importar imágenes
import bannerImg from "@/assets/logos/banner.png";
import fondoImg from "@/assets/logos/fondo.png";
import logoSjlImg from "@/assets/logos/logo_sjl.png";
import fondoSjlBottomImg from "@/assets/logos/fondo_sjl_bottom.png";

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Fondo de la página */}
      <div className="absolute inset-0 z-0">
        <Image
          src={fondoImg}
          alt="Fondo"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Banner superior */}
      <div className="relative w-full z-10 max-h-[30vh]">
        <Image
          src={bannerImg}
          alt="Banner San Juan de Lurigancho"
          width={1920}
          height={567}
          className="w-full h-auto max-h-[30vh] object-cover object-center"
          priority
        />
        {/* Gradiente difuminado en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 relative z-10">
        {/* Título de bienvenida */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">BIENVENIDO</h1>
          <p className="text-xl md:text-2xl text-gray-600">PORTAL DE INICIO DE SESIÓN</p>
        </div>

        <div className="w-full max-w-4xl">
          {/* Botones de selección de subgerencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Botón Programas Sociales */}
            <Link
              href="/login/programas-sociales"
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-102 border-2 border-white/50"
            >
              <div
                className="h-20 md:h-24 flex items-center justify-center text-white px-6 transition-all duration-300"
                style={{ backgroundColor: SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES].color }}
              >
                <h2 className="text-lg md:text-xl font-bold text-center leading-tight drop-shadow-md">
                  SUBGERENCIA DE PROGRAMAS SOCIALES
                </h2>
              </div>
            </Link>

            {/* Botón Servicios Sociales */}
            <Link
              href="/login/servicios-sociales"
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-102 border-2 border-white/50"
            >
              <div
                className="h-20 md:h-24 flex items-center justify-center text-white px-6 transition-all duration-300"
                style={{ backgroundColor: SUBGERENCIAS[SubgerenciaType.SERVICIOS_SOCIALES].color }}
              >
                <h2 className="text-lg md:text-xl font-bold text-center leading-tight drop-shadow-md">
                  SUBGERENCIA DE SERVICIOS SOCIALES
                </h2>
              </div>
            </Link>
          </div>

          {/* Texto de instrucción */}
          <p className="text-center text-gray-600 text-base md:text-lg">Seleccione su área para iniciar sesión</p>
        </div>
      </div>

      {/* Footer con logo */}
      <div className="py-4 relative z-10">
        <div className="flex justify-center items-center">
          <Image
            src={logoSjlImg}
            alt="San Juan de Lurigancho - Es momento de crecer"
            width={220}
            height={80}
            className="object-contain"
          />
        </div>
      </div>

      {/* Elemento decorativo (esquina inferior derecha) */}
      <div className="fixed bottom-0 right-0 w-40 h-40 md:w-56 md:h-56 z-20 pointer-events-none">
        <Image
          src={fondoSjlBottomImg}
          alt="Decoración"
          fill
          className="object-contain object-right-bottom"
        />
      </div>
    </div>
  );
}
