/**
 * Constantes del Sistema SGDH
 * Sistema de Gerencia de Desarrollo Humano
 * San Juan de Lurigancho
 */

export const APP_NAME = "SGDH - Sistema de Gerencia de Desarrollo Humano";
export const MUNICIPALITY = "San Juan de Lurigancho";

// Tipos de Subgerencias
export enum SubgerenciaType {
  PROGRAMAS_SOCIALES = "programas-sociales",
  SERVICIOS_SOCIALES = "servicios-sociales",
}

// Configuración de Subgerencias
export const SUBGERENCIAS = {
  [SubgerenciaType.PROGRAMAS_SOCIALES]: {
    id: SubgerenciaType.PROGRAMAS_SOCIALES,
    nombre: "Subgerencia de Programas Sociales",
    color: "#d81b7e",
    colorHover: "#b81667",
    descripcion: "Gestión de programas sociales y asistencia alimentaria",
  },
  [SubgerenciaType.SERVICIOS_SOCIALES]: {
    id: SubgerenciaType.SERVICIOS_SOCIALES,
    nombre: "Subgerencia de Servicios Sociales",
    color: "#00a3a8",
    colorHover: "#008a8e",
    descripcion: "Gestión de servicios sociales y actividades comunitarias",
  },
};

// Módulos de Programas Sociales
export const MODULOS_PROGRAMAS_SOCIALES = [
  {
    id: "pvl",
    nombre: "PVL - Programa de Vaso de Leche",
    ruta: "/programas-sociales/pvl",
    icono: "LocalDrink",
    descripcion: "Gestión del Programa de Vaso de Leche",
    permisos: ["pvl", "all_programas_sociales"],
  },
  {
    id: "pantbc",
    nombre: "PANTBC - Programa de Alimentación TBC",
    ruta: "/programas-sociales/pantbc",
    icono: "Restaurant",
    descripcion: "Programa de Alimentación y Nutrición para pacientes con Tuberculosis",
    permisos: ["pantbc", "all_programas_sociales"],
  },
  {
    id: "comedores-populares",
    nombre: "Comedores Populares",
    ruta: "/programas-sociales/comedores-populares",
    icono: "RestaurantMenu",
    descripcion: "Gestión de Comedores Populares",
    permisos: ["comedores_populares", "all_programas_sociales"],
  },
  {
    id: "ollas-comunes",
    nombre: "Ollas Comunes",
    ruta: "/programas-sociales/ollas-comunes",
    icono: "SoupKitchen",
    descripcion: "Gestión de Ollas Comunes",
    permisos: ["ollas_comunes", "all_programas_sociales"],
  },
  {
    id: "ule",
    nombre: "ULE - Unidad Local de Empadronamiento",
    ruta: "/programas-sociales/ule",
    icono: "AssignmentInd",
    descripcion: "Unidad Local de Empadronamiento",
    permisos: ["ule", "all_programas_sociales"],
  },
  {
    id: "omaped",
    nombre: "OMAPED - Personas con Discapacidad",
    ruta: "/programas-sociales/omaped",
    icono: "Accessible",
    descripcion: "Oficina Municipal de Atención a las Personas con Discapacidad",
    permisos: ["omaped", "all_programas_sociales"],
  },
  {
    id: "ciam",
    nombre: "CIAM - Centro Integral del Adulto Mayor",
    ruta: "/programas-sociales/ciam",
    icono: "Elderly",
    descripcion: "Centro Integral de Atención al Adulto Mayor",
    permisos: ["ciam", "all_programas_sociales"],
  },
];

// Módulos de Servicios Sociales
export const MODULOS_SERVICIOS_SOCIALES = [
  {
    id: "participacion-ciudadana",
    nombre: "Participación Ciudadana",
    ruta: "/servicios-sociales/participacion-ciudadana",
    icono: "Groups",
    descripcion: "Gestión de programas de participación ciudadana",
    permisos: ["participacion_ciudadana", "all_servicios_sociales"],
  },
  {
    id: "servicios-deporte",
    nombre: "Servicios de Deporte",
    ruta: "/servicios-sociales/servicios-deporte",
    icono: "SportsScore",
    descripcion: "Gestión de actividades deportivas y recreativas",
    permisos: ["servicios_deporte", "all_servicios_sociales"],
  },
  {
    id: "salud",
    nombre: "Salud (Compromiso 1 y Veterinaria)",
    ruta: "/servicios-sociales/salud",
    icono: "HealthAndSafety",
    descripcion: "Gestión de servicios de salud y veterinaria",
    permisos: ["salud", "all_servicios_sociales"],
  },
];

// Estructura de Menú
export interface MenuItem {
  id: string;
  nombre: string;
  ruta?: string;
  icono?: string;
  descripcion?: string;
  permisos?: string[];
  subgerencia: SubgerenciaType;
  children?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "programas-sociales",
    nombre: "Programas Sociales",
    subgerencia: SubgerenciaType.PROGRAMAS_SOCIALES,
    children: MODULOS_PROGRAMAS_SOCIALES.map((modulo) => ({
      ...modulo,
      subgerencia: SubgerenciaType.PROGRAMAS_SOCIALES,
    })),
  },
  {
    id: "servicios-sociales",
    nombre: "Servicios Sociales",
    subgerencia: SubgerenciaType.SERVICIOS_SOCIALES,
    children: MODULOS_SERVICIOS_SOCIALES.map((modulo) => ({
      ...modulo,
      subgerencia: SubgerenciaType.SERVICIOS_SOCIALES,
    })),
  },
];

// Rutas públicas (sin autenticación)
export const PUBLIC_ROUTES = ["/", "/login/programas-sociales", "/login/servicios-sociales"];

// Tipos de operaciones CRUD
export enum CRUDOperation {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
}

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
};

// Formatos de fecha
export const DATE_FORMATS = {
  DISPLAY: "DD/MM/YYYY",
  DISPLAY_WITH_TIME: "DD/MM/YYYY HH:mm",
  API: "YYYY-MM-DD",
  API_WITH_TIME: "YYYY-MM-DD HH:mm:ss",
};

// Configuración de SweetAlert2
export const SWAL_CONFIG = {
  confirmButtonColor: "#d81b7e",
  cancelButtonColor: "#6c757d",
  confirmButtonText: "Confirmar",
  cancelButtonText: "Cancelar",
};
