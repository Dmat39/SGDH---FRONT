"use client";

import LoginForm from "@/components/forms/LoginForm";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";
import Image from "next/image";

// Importar imágenes
import fondoImg from "@/assets/logos/fondo.png";
import logoSjlImg from "@/assets/logos/logo_sjl.png";
import fondoSjlBottomImg from "@/assets/logos/fondo_sjl_bottom.png";

export default function ServiciosSocialesLoginPage() {
  const subgerencia = SUBGERENCIAS[SubgerenciaType.SERVICIOS_SOCIALES];

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

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <LoginForm
          subgerencia={SubgerenciaType.SERVICIOS_SOCIALES}
          color={subgerencia.color}
          subgerenciaName={subgerencia.nombre}
        />
      </div>

      {/* Footer con logo */}
      <div className="py-4 relative z-10">
        <div className="flex justify-center items-center">
          <Image
            src={logoSjlImg}
            alt="San Juan de Lurigancho - Es momento de crecer"
            width={200}
            height={70}
            className="object-contain"
          />
        </div>
      </div>

      {/* Elemento decorativo (esquina inferior derecha) */}
      <div className="fixed bottom-0 right-0 w-36 h-36 md:w-48 md:h-48 z-20 pointer-events-none">
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
