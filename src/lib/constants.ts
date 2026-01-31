/**
 * Constantes del Sistema SGDH
 * Sistema de Gerencia de Desarrollo Humano
 * San Juan de Lurigancho
 */

export const APP_NAME = "SGDH - Sistema de Gerencia de Desarrollo Humano";
export const MUNICIPALITY = "San Juan de Lurigancho";

// ============================================
// TIPOS DE SUBGERENCIAS
// ============================================
export enum SubgerenciaType {
  PROGRAMAS_SOCIALES = "programas-sociales",
  SERVICIOS_SOCIALES = "servicios-sociales",
}

// ============================================
// ROLES DEL SISTEMA
// ============================================
export enum RoleType {
  ADMIN = "admin",
  SUBGERENTE_PS = "subgerente_programas_sociales",
  SUBGERENTE_SS = "subgerente_servicios_sociales",
  // Roles de áreas - Programas Sociales
  USUARIO_PVL = "usuario_pvl",
  USUARIO_PANTBC = "usuario_pantbc",
  USUARIO_COMEDORES = "usuario_comedores",
  USUARIO_OLLAS = "usuario_ollas",
  USUARIO_ULE = "usuario_ule",
  USUARIO_OMAPED = "usuario_omaped",
  USUARIO_CIAM = "usuario_ciam",
  // Roles de áreas - Servicios Sociales
  USUARIO_PARTICIPACION = "usuario_participacion",
  USUARIO_DEPORTES = "usuario_deportes",
  USUARIO_SALUD = "usuario_salud",
}

// Configuración de Roles
export const ROLES = {
  [RoleType.ADMIN]: {
    nombre: "Administrador",
    descripcion: "Acceso total al sistema",
    permisos: ["all"],
  },
  [RoleType.SUBGERENTE_PS]: {
    nombre: "Subgerente de Programas Sociales",
    descripcion: "Acceso a todas las áreas de Programas Sociales",
    permisos: ["all_programas_sociales", "mapa_programas_sociales"],
  },
  [RoleType.SUBGERENTE_SS]: {
    nombre: "Subgerente de Servicios Sociales",
    descripcion: "Acceso a todas las áreas de Servicios Sociales",
    permisos: ["all_servicios_sociales", "mapa_servicios_sociales"],
  },
  [RoleType.USUARIO_PVL]: {
    nombre: "Usuario PVL",
    descripcion: "Acceso al área de Vaso de Leche",
    permisos: ["pvl", "mapa_pvl"],
  },
  [RoleType.USUARIO_PANTBC]: {
    nombre: "Usuario PANTBC",
    descripcion: "Acceso al área de PANTBC",
    permisos: ["pantbc", "mapa_pantbc"],
  },
  [RoleType.USUARIO_COMEDORES]: {
    nombre: "Usuario Comedores",
    descripcion: "Acceso al área de Comedores Populares",
    permisos: ["comedores_populares", "mapa_comedores"],
  },
  [RoleType.USUARIO_OLLAS]: {
    nombre: "Usuario Ollas Comunes",
    descripcion: "Acceso al área de Ollas Comunes",
    permisos: ["ollas_comunes", "mapa_ollas"],
  },
  [RoleType.USUARIO_ULE]: {
    nombre: "Usuario ULE",
    descripcion: "Acceso al área de ULE",
    permisos: ["ule", "mapa_ule"],
  },
  [RoleType.USUARIO_OMAPED]: {
    nombre: "Usuario OMAPED",
    descripcion: "Acceso al área de OMAPED",
    permisos: ["omaped", "mapa_omaped"],
  },
  [RoleType.USUARIO_CIAM]: {
    nombre: "Usuario CIAM",
    descripcion: "Acceso al área de CIAM",
    permisos: ["ciam", "mapa_ciam"],
  },
  [RoleType.USUARIO_PARTICIPACION]: {
    nombre: "Usuario Participación Ciudadana",
    descripcion: "Acceso al área de Participación Ciudadana",
    permisos: ["participacion_ciudadana", "mapa_participacion"],
  },
  [RoleType.USUARIO_DEPORTES]: {
    nombre: "Usuario Deportes",
    descripcion: "Acceso al área de Deportes",
    permisos: ["servicios_deporte", "mapa_deportes"],
  },
  [RoleType.USUARIO_SALUD]: {
    nombre: "Usuario Salud",
    descripcion: "Acceso al área de Salud",
    permisos: ["salud", "mapa_salud"],
  },
};

// ============================================
// CONFIGURACIÓN DE SUBGERENCIAS
// ============================================
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

// ============================================
// ESTRUCTURA DE MENÚ
// ============================================
export interface MenuItem {
  id: string;
  nombre: string;
  ruta?: string;
  icono?: string;
  descripcion?: string;
  permisos?: string[];
  subgerencia?: SubgerenciaType;
  children?: MenuItem[];
}

// ============================================
// MÓDULOS DE PROGRAMAS SOCIALES
// ============================================
export const MODULOS_PROGRAMAS_SOCIALES: MenuItem[] = [
  // Lista General (para búsqueda unificada y cumpleaños)
  {
    id: "lista-general",
    nombre: "Lista General",
    ruta: "/programas-sociales/lista-general",
    icono: "List",
    descripcion: "Lista unificada de PVL, Ollas Comunes y Comedores Populares",
    permisos: ["pvl", "ollas_comunes", "comedores_populares", "all_programas_sociales", "all"],
  },
  {
    id: "pvl",
    nombre: "PVL - Vaso de Leche",
    icono: "FreeBreakfast",
    descripcion: "Gestión del Programa de Vaso de Leche",
    permisos: ["pvl", "all_programas_sociales", "all"],
    children: [
      {
        id: "pvl-dashboard",
        nombre: "Dashboard",
        ruta: "/programas-sociales/pvl",
        icono: "SpaceDashboard",
        permisos: ["pvl", "all_programas_sociales", "all"],
      },
      /*
      {
        id: "pvl-beneficiarios",
        nombre: "Beneficiarios",
        ruta: "/programas-sociales/pvl/beneficiarios",
        icono: "Diversity1",
        permisos: ["pvl", "all_programas_sociales", "all"],
      },
      */
      {
        id: "pvl-comites",
        nombre: "Comités",
        ruta: "/programas-sociales/pvl/comites",
        icono: "Groups",
        permisos: ["pvl", "all_programas_sociales", "all"],
      },
      {
        id: "pvl-mapa",
        nombre: "Mapa",
        ruta: "/programas-sociales/pvl/mapa",
        icono: "Explore",
        permisos: ["pvl", "mapa_pvl", "all_programas_sociales", "all"],
      },
    ],
  },
  {
    id: "pantbc",
    nombre: "PANTBC",
    icono: "Restaurant",
    descripcion: "Programa de Alimentación y Nutrición para pacientes con TBC",
    permisos: ["pantbc", "all_programas_sociales", "all"],
    children: [
      {
        id: "pantbc-dashboard",
        nombre: "Dashboard",
        ruta: "/programas-sociales/pantbc",
        icono: "Dashboard",
        permisos: ["pantbc", "all_programas_sociales", "all"],
      },
      {
        id: "pantbc-beneficiarios",
        nombre: "Beneficiarios",
        ruta: "/programas-sociales/pantbc/beneficiarios",
        icono: "People",
        permisos: ["pantbc", "all_programas_sociales", "all"],
      },
      {
        id: "pantbc-mapa",
        nombre: "Mapa",
        ruta: "/programas-sociales/pantbc/mapa",
        icono: "Map",
        permisos: ["pantbc", "mapa_pantbc", "all_programas_sociales", "all"],
      },
    ],
  },
  {
    id: "comedores-populares",
    nombre: "Comedores Populares",
    icono: "RestaurantMenu",
    descripcion: "Gestión de Comedores Populares",
    permisos: ["comedores_populares", "all_programas_sociales", "all"],
    children: [
      {
        id: "comedores-dashboard",
        nombre: "Dashboard",
        ruta: "/programas-sociales/comedores-populares",
        icono: "Dashboard",
        permisos: ["comedores_populares", "all_programas_sociales", "all"],
      },
      {
        id: "comedores-lista",
        nombre: "Lista de Comedores",
        ruta: "/programas-sociales/comedores-populares/lista",
        icono: "List",
        permisos: ["comedores_populares", "all_programas_sociales", "all"],
      },
      {
        id: "comedores-mapa",
        nombre: "Mapa",
        ruta: "/programas-sociales/comedores-populares/mapa",
        icono: "Map",
        permisos: ["comedores_populares", "mapa_comedores", "all_programas_sociales", "all"],
      },
    ],
  },
  {
    id: "ollas-comunes",
    nombre: "Ollas Comunes",
    icono: "SoupKitchen",
    descripcion: "Gestión de Ollas Comunes",
    permisos: ["ollas_comunes", "all_programas_sociales", "all"],
    children: [
      {
        id: "ollas-dashboard",
        nombre: "Dashboard",
        ruta: "/programas-sociales/ollas-comunes",
        icono: "Dashboard",
        permisos: ["ollas_comunes", "all_programas_sociales", "all"],
      },
      {
        id: "ollas-lista",
        nombre: "Lista de Ollas",
        ruta: "/programas-sociales/ollas-comunes/lista",
        icono: "List",
        permisos: ["ollas_comunes", "all_programas_sociales", "all"],
      },
      {
        id: "ollas-mapa",
        nombre: "Mapa",
        ruta: "/programas-sociales/ollas-comunes/mapa",
        icono: "Map",
        permisos: ["ollas_comunes", "mapa_ollas", "all_programas_sociales", "all"],
      },
    ],
  },
  {
    id: "ule",
    nombre: "ULE - Empadronamiento",
    icono: "AssignmentInd",
    descripcion: "Unidad Local de Empadronamiento",
    permisos: ["ule", "all_programas_sociales", "all"],
    children: [
      {
        id: "ule-dashboard",
        nombre: "Dashboard",
        ruta: "/programas-sociales/ule",
        icono: "Dashboard",
        permisos: ["ule", "all_programas_sociales", "all"],
      },
      {
        id: "ule-empadronados",
        nombre: "Empadronados",
        ruta: "/programas-sociales/ule/empadronados",
        icono: "People",
        permisos: ["ule", "all_programas_sociales", "all"],
      },
      {
        id: "ule-mapa",
        nombre: "Mapa",
        ruta: "/programas-sociales/ule/mapa",
        icono: "Map",
        permisos: ["ule", "mapa_ule", "all_programas_sociales", "all"],
      },
    ],
  },
  {
    id: "omaped",
    nombre: "OMAPED - Discapacidad",
    icono: "Accessible",
    descripcion: "Oficina Municipal de Atención a las Personas con Discapacidad",
    permisos: ["omaped", "all_programas_sociales", "all"],
    children: [
      {
        id: "omaped-dashboard",
        nombre: "Dashboard",
        ruta: "/programas-sociales/omaped",
        icono: "Dashboard",
        permisos: ["omaped", "all_programas_sociales", "all"],
      },
      {
        id: "omaped-beneficiarios",
        nombre: "Beneficiarios",
        ruta: "/programas-sociales/omaped/beneficiarios",
        icono: "People",
        permisos: ["omaped", "all_programas_sociales", "all"],
      },
      {
        id: "omaped-mapa",
        nombre: "Mapa",
        ruta: "/programas-sociales/omaped/mapa",
        icono: "Map",
        permisos: ["omaped", "mapa_omaped", "all_programas_sociales", "all"],
      },
    ],
  },
  {
    id: "ciam",
    nombre: "CIAM - Adulto Mayor",
    icono: "Elderly",
    descripcion: "Centro Integral de Atención al Adulto Mayor",
    permisos: ["ciam", "all_programas_sociales", "all"],
    children: [
      {
        id: "ciam-dashboard",
        nombre: "Dashboard",
        ruta: "/programas-sociales/ciam",
        icono: "Dashboard",
        permisos: ["ciam", "all_programas_sociales", "all"],
      },
      {
        id: "ciam-beneficiarios",
        nombre: "Beneficiarios",
        ruta: "/programas-sociales/ciam/beneficiarios",
        icono: "People",
        permisos: ["ciam", "all_programas_sociales", "all"],
      },
      {
        id: "ciam-mapa",
        nombre: "Mapa",
        ruta: "/programas-sociales/ciam/mapa",
        icono: "Map",
        permisos: ["ciam", "mapa_ciam", "all_programas_sociales", "all"],
      },
    ],
  },
  // Módulo de Mapa General (solo para subgerente)
  {
    id: "mapa-general-ps",
    nombre: "Mapa General",
    ruta: "/programas-sociales/mapa",
    icono: "Map",
    descripcion: "Mapa con todas las capas de Programas Sociales",
    permisos: ["all_programas_sociales", "all"],
  },
];

// ============================================
// MÓDULOS DE SERVICIOS SOCIALES
// ============================================
export const MODULOS_SERVICIOS_SOCIALES: MenuItem[] = [
  {
    id: "participacion-ciudadana",
    nombre: "Participación Ciudadana",
    icono: "Groups",
    descripcion: "Gestión de programas de participación ciudadana",
    permisos: ["participacion_ciudadana", "all_servicios_sociales", "all"],
    children: [
      {
        id: "participacion-dashboard",
        nombre: "Dashboard",
        ruta: "/servicios-sociales/participacion-ciudadana",
        icono: "Dashboard",
        permisos: ["participacion_ciudadana", "all_servicios_sociales", "all"],
      },
      {
        id: "participacion-programas",
        nombre: "Programas",
        ruta: "/servicios-sociales/participacion-ciudadana/programas",
        icono: "List",
        permisos: ["participacion_ciudadana", "all_servicios_sociales", "all"],
      },
      {
        id: "participacion-mapa",
        nombre: "Mapa",
        ruta: "/servicios-sociales/participacion-ciudadana/mapa",
        icono: "Map",
        permisos: ["participacion_ciudadana", "mapa_participacion", "all_servicios_sociales", "all"],
      },
    ],
  },
  {
    id: "servicios-deporte",
    nombre: "Servicios de Deporte",
    icono: "SportsScore",
    descripcion: "Gestión de actividades deportivas y recreativas",
    permisos: ["servicios_deporte", "all_servicios_sociales", "all"],
    children: [
      {
        id: "deportes-dashboard",
        nombre: "Dashboard",
        ruta: "/servicios-sociales/servicios-deporte",
        icono: "Dashboard",
        permisos: ["servicios_deporte", "all_servicios_sociales", "all"],
      },
      {
        id: "deportes-actividades",
        nombre: "Actividades",
        ruta: "/servicios-sociales/servicios-deporte/actividades",
        icono: "List",
        permisos: ["servicios_deporte", "all_servicios_sociales", "all"],
      },
      {
        id: "deportes-mapa",
        nombre: "Mapa",
        ruta: "/servicios-sociales/servicios-deporte/mapa",
        icono: "Map",
        permisos: ["servicios_deporte", "mapa_deportes", "all_servicios_sociales", "all"],
      },
    ],
  },
  {
    id: "salud",
    nombre: "Salud",
    icono: "HealthAndSafety",
    descripcion: "Gestión de servicios de salud y veterinaria",
    permisos: ["salud", "all_servicios_sociales", "all"],
    children: [
      {
        id: "salud-dashboard",
        nombre: "Dashboard",
        ruta: "/servicios-sociales/salud",
        icono: "Dashboard",
        permisos: ["salud", "all_servicios_sociales", "all"],
      },
      {
        id: "salud-campanas",
        nombre: "Campañas",
        ruta: "/servicios-sociales/salud/campanas",
        icono: "List",
        permisos: ["salud", "all_servicios_sociales", "all"],
      },
      {
        id: "salud-mapa",
        nombre: "Mapa",
        ruta: "/servicios-sociales/salud/mapa",
        icono: "Map",
        permisos: ["salud", "mapa_salud", "all_servicios_sociales", "all"],
      },
    ],
  },
  // Módulo de Mapa General (solo para subgerente)
  {
    id: "mapa-general-ss",
    nombre: "Mapa General",
    ruta: "/servicios-sociales/mapa",
    icono: "Map",
    descripcion: "Mapa con todas las capas de Servicios Sociales",
    permisos: ["all_servicios_sociales", "all"],
  },
];

// ============================================
// MENÚ COMPLETO
// ============================================
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

// ============================================
// CONFIGURACIÓN DEL MAPA
// ============================================
export const MAP_CONFIG = {
  center: [-11.9699, -76.998] as [number, number], // Centro de San Juan de Lurigancho
  zoom: 13,
  minZoom: 11,
  maxZoom: 18,
  tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

// Capas del mapa por área
export const MAP_LAYERS = {
  jurisdicciones: {
    id: "jurisdicciones",
    nombre: "Jurisdicciones",
    descripcion: "Límites de las jurisdicciones de San Juan de Lurigancho",
    visible: true,
    color: "#34b429",
  },
  pvl: {
    id: "pvl",
    nombre: "Puntos PVL",
    descripcion: "Ubicación de beneficiarios del Vaso de Leche",
    visible: false,
    color: "#d81b7e",
    permisos: ["pvl", "all_programas_sociales", "all"],
  },
  comedores: {
    id: "comedores",
    nombre: "Comedores Populares",
    descripcion: "Ubicación de Comedores Populares",
    visible: false,
    color: "#ff9800",
    permisos: ["comedores_populares", "all_programas_sociales", "all"],
  },
  ollas: {
    id: "ollas",
    nombre: "Ollas Comunes",
    descripcion: "Ubicación de Ollas Comunes",
    visible: false,
    color: "#4caf50",
    permisos: ["ollas_comunes", "all_programas_sociales", "all"],
  },
  ciam: {
    id: "ciam",
    nombre: "Centros CIAM",
    descripcion: "Ubicación de Centros del Adulto Mayor",
    visible: false,
    color: "#9c27b0",
    permisos: ["ciam", "all_programas_sociales", "all"],
  },
  omaped: {
    id: "omaped",
    nombre: "Puntos OMAPED",
    descripcion: "Ubicación de servicios OMAPED",
    visible: false,
    color: "#2196f3",
    permisos: ["omaped", "all_programas_sociales", "all"],
  },
};

// ============================================
// RUTAS Y CONFIGURACIÓN
// ============================================
export const PUBLIC_ROUTES = ["/", "/login/programas-sociales", "/login/servicios-sociales"];

export enum CRUDOperation {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
}

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
};

export const DATE_FORMATS = {
  DISPLAY: "DD/MM/YYYY",
  DISPLAY_WITH_TIME: "DD/MM/YYYY HH:mm",
  API: "YYYY-MM-DD",
  API_WITH_TIME: "YYYY-MM-DD HH:mm:ss",
};

export const SWAL_CONFIG = {
  confirmButtonColor: "#d81b7e",
  cancelButtonColor: "#6c757d",
  confirmButtonText: "Confirmar",
  cancelButtonText: "Cancelar",
};
