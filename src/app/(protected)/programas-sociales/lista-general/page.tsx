"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import {
  Download,
  Refresh,
  Search,
  FilterList,
  Cake,
  Clear,
  WhatsApp,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import WhatsAppMessageDialog from "../mensajeria-whatsapp/components/WhatsAppMessageDialog";
import { PersonaParaEnvio } from "../mensajeria-whatsapp/types";
import { showSuccess, showError } from "@/lib/utils/swalConfig";
import { SUBGERENCIAS, SubgerenciaType } from "@/lib/constants";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFormatTableData } from "@/lib/hooks/useFormatTableData";
import * as XLSX from "xlsx";

const subgerencia = SUBGERENCIAS[SubgerenciaType.PROGRAMAS_SOCIALES];

// Tipos de módulos
type ModuloType = "PVL" | "OLLAS_COMUNES" | "COMEDORES_POPULARES" | "ULE";

const MODULOS_CONFIG: { id: ModuloType; label: string; color: string }[] = [
  { id: "PVL", label: "PVL", color: "#d81b7e" },
  { id: "OLLAS_COMUNES", label: "Ollas Comunes", color: "#4caf50" },
  { id: "COMEDORES_POPULARES", label: "Comedores Populares", color: "#ff9800" },
  { id: "ULE", label: "ULE", color: "#2196f3" },
];

// Meses para el filtro
const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

// Interface unificada para la lista
interface PersonaUnificada {
  id: string;
  modulo: ModuloType;
  moduloLabel: string;
  entidadNombre: string;
  entidadCodigo: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  cumpleanos: string | null;
  rol: string;
}

// Interfaces para los backends
interface PVLCommittee {
  id: string;
  code: string;
  name: string;
  coordinator: {
    id: string;
    name: string;
    lastname: string;
    dni: string;
    phone: string;
    birthday?: string;
  } | null;
}

interface PCACenter {
  id: string;
  code: string;
  name: string;
  modality: string;
  president: {
    id: string;
    name: string;
    lastname: string;
    dni: string;
    phone: string;
    birthday: string;
  } | null;
}

interface BackendResponsePVL {
  message: string;
  data: {
    data: PVLCommittee[];
    totalCount: number;
  };
}

interface BackendResponsePCA {
  message: string;
  data: {
    data: PCACenter[];
    totalCount: number;
  };
}

interface ULERegisteredPerson {
  id: string;
  fsu: string;
  s100: string;
  dni: string;
  name: string;
  lastname: string;
  phone: string;
  birthday: string;
  format: string;
  urban: { id: string; name: string } | null;
}

interface BackendResponseULE {
  message: string;
  data: {
    data: ULERegisteredPerson[];
    totalCount: number;
  };
}

export default function ListaGeneralPage() {
  const { getData, postData } = useFetch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [personas, setPersonas] = useState<PersonaUnificada[]>([]);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);

  // Estados de filtros
  const [filtroModulo, setFiltroModulo] = useState<ModuloType | "">("");
  const [filtroDia, setFiltroDia] = useState<string>("");
  const [filtroMes, setFiltroMes] = useState<number | "">("");
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Cargar todos los datos
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    const todasLasPersonas: PersonaUnificada[] = [];

    // Cargar PVL
    try {
      const pvlFirst = await getData<BackendResponsePVL>(`pvl/committee?page=1&limit=1`);
      const pvlTotal = pvlFirst?.data?.totalCount || 0;
      if (pvlTotal > 0) {
        const pvlResponse = await getData<BackendResponsePVL>(`pvl/committee?page=1&limit=${pvlTotal}`);
        if (pvlResponse?.data?.data) {
          pvlResponse.data.data.forEach((committee) => {
            todasLasPersonas.push({
              id: `pvl-${committee.id}-${committee.coordinator?.id || "sin-coord"}`,
              modulo: "PVL",
              moduloLabel: "PVL",
              entidadNombre: committee.name,
              entidadCodigo: committee.code,
              nombre: committee.coordinator?.name || "",
              apellido: committee.coordinator?.lastname || "",
              dni: committee.coordinator?.dni || "",
              telefono: committee.coordinator?.phone || "",
              cumpleanos: committee.coordinator?.birthday || null,
              rol: committee.coordinator ? "Coordinador/a" : "Sin asignar",
            });
          });
        }
      }
    } catch (error) {
      console.error("Error cargando PVL:", error);
    }

    // Cargar Ollas Comunes
    try {
      const ollasResponse = await getData<BackendResponsePCA>(`pca/center?page=0&modality=CPOT&limit=1000`);
      if (ollasResponse?.data?.data) {
        ollasResponse.data.data.forEach((center) => {
          todasLasPersonas.push({
            id: `ollas-${center.id}-${center.president?.id || "sin-pres"}`,
            modulo: "OLLAS_COMUNES",
            moduloLabel: "Ollas Comunes",
            entidadNombre: center.name,
            entidadCodigo: center.code,
            nombre: center.president?.name || "",
            apellido: center.president?.lastname || "",
            dni: center.president?.dni || "",
            telefono: center.president?.phone || "",
            cumpleanos: center.president?.birthday || null,
            rol: center.president ? "Presidente/a" : "Sin asignar",
          });
        });
      }
    } catch (error) {
      console.error("Error cargando Ollas Comunes:", error);
    }

    // Cargar Comedores Populares
    try {
      const comedoresResponse = await getData<BackendResponsePCA>(`pca/center?page=0&modality=EATER&limit=1000`);
      if (comedoresResponse?.data?.data) {
        comedoresResponse.data.data.forEach((center) => {
          todasLasPersonas.push({
            id: `comedores-${center.id}-${center.president?.id || "sin-pres"}`,
            modulo: "COMEDORES_POPULARES",
            moduloLabel: "Comedores Populares",
            entidadNombre: center.name,
            entidadCodigo: center.code,
            nombre: center.president?.name || "",
            apellido: center.president?.lastname || "",
            dni: center.president?.dni || "",
            telefono: center.president?.phone || "",
            cumpleanos: center.president?.birthday || null,
            rol: center.president ? "Presidente/a" : "Sin asignar",
          });
        });
      }
    } catch (error) {
      console.error("Error cargando Comedores Populares:", error);
    }

    // Cargar ULE (Empadronados) en lotes de 500
    try {
      const uleFirst = await getData<BackendResponseULE>(`ule/registered?page=1&limit=1`);
      const uleTotal = uleFirst?.data?.totalCount || 0;
      if (uleTotal > 0) {
        const BATCH_SIZE = 500;
        const totalPages = Math.ceil(uleTotal / BATCH_SIZE);

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const uleResponse = await getData<BackendResponseULE>(`ule/registered?page=${pageNum}&limit=${BATCH_SIZE}`);
          if (uleResponse?.data?.data) {
            uleResponse.data.data.forEach((person) => {
              todasLasPersonas.push({
                id: `ule-${person.id}`,
                modulo: "ULE",
                moduloLabel: "ULE",
                entidadNombre: person.urban?.name || "Sin urbanización",
                entidadCodigo: person.fsu || person.s100 || "-",
                nombre: person.name || "",
                apellido: person.lastname || "",
                dni: person.dni || "",
                telefono: person.phone || "",
                cumpleanos: person.birthday || null,
                rol: "Empadronado",
              });
            });
          }
        }
      }
    } catch (error) {
      console.error("Error cargando ULE:", error);
    }

    setPersonas(todasLasPersonas);
    setIsLoading(false);
  }, [getData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Formatear strings del backend (Title Case, preservar siglas en direcciones)
  const personasFormateadas = useFormatTableData(personas);

  // Filtrar datos
  const personasFiltradas = useMemo(() => {
    return personasFormateadas.filter((persona) => {
      // Filtro por módulo
      if (filtroModulo && persona.modulo !== filtroModulo) {
        return false;
      }

      // Filtro por búsqueda
      if (filtroBusqueda) {
        const busqueda = filtroBusqueda.toLowerCase();
        const coincide =
          persona.nombre.toLowerCase().includes(busqueda) ||
          persona.apellido.toLowerCase().includes(busqueda) ||
          persona.dni.toLowerCase().includes(busqueda) ||
          persona.entidadNombre.toLowerCase().includes(busqueda) ||
          persona.entidadCodigo.toLowerCase().includes(busqueda);
        if (!coincide) return false;
      }

      // Filtro por cumpleaños
      if (filtroDia || filtroMes) {
        if (!persona.cumpleanos) return false;

        const fecha = new Date(persona.cumpleanos);
        const dia = fecha.getDate();
        const mes = fecha.getMonth() + 1;

        if (filtroDia && dia !== parseInt(filtroDia)) {
          return false;
        }

        if (filtroMes && mes !== filtroMes) {
          return false;
        }
      }

      return true;
    });
  }, [personasFormateadas, filtroModulo, filtroBusqueda, filtroDia, filtroMes]);

  // Paginación
  const personasPaginadas = useMemo(() => {
    return personasFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [personasFiltradas, page, rowsPerPage]);

  // Función para descargar Excel
  const descargarExcel = () => {
    // Preparar datos para Excel
    const datosExcel = personasFiltradas.map((persona) => ({
      "Módulo": persona.moduloLabel,
      "Código Entidad": persona.entidadCodigo,
      "Nombre Entidad": persona.entidadNombre,
      "Rol": persona.rol,
      "Nombre": persona.nombre,
      "Apellido": persona.apellido,
      "DNI": persona.dni,
      "Teléfono": formatearTelefono(persona.telefono),
      "Cumpleaños": persona.cumpleanos
        ? new Date(persona.cumpleanos).toLocaleDateString("es-PE")
        : "",
      "Edad": persona.cumpleanos ? calcularEdad(persona.cumpleanos) : "",
    }));

    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosExcel);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 20 }, // Módulo
      { wch: 15 }, // Código Entidad
      { wch: 35 }, // Nombre Entidad
      { wch: 15 }, // Rol
      { wch: 20 }, // Nombre
      { wch: 20 }, // Apellido
      { wch: 12 }, // DNI
      { wch: 12 }, // Teléfono
      { wch: 12 }, // Cumpleaños
      { wch: 6 },  // Edad
    ];
    ws["!cols"] = colWidths;

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, "Lista General");

    // Nombre del archivo con filtros aplicados
    let fileName = "lista_general";
    if (filtroModulo) fileName += `_${filtroModulo}`;
    if (filtroMes) fileName += `_mes${filtroMes}`;
    if (filtroDia) fileName += `_dia${filtroDia}`;
    fileName += ".xlsx";

    // Descargar archivo
    XLSX.writeFile(wb, fileName);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroModulo("");
    setFiltroDia("");
    setFiltroMes("");
    setFiltroBusqueda("");
    setPage(0);
  };

  // Obtener color del módulo
  const getModuloColor = (modulo: ModuloType) => {
    return MODULOS_CONFIG.find((m) => m.id === modulo)?.color || "#666";
  };

  // Calcular edad a partir de una fecha de nacimiento
  const calcularEdad = (fechaNacimiento: string): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();

    // Ajustar si aún no ha llegado el cumpleaños este año
    if (mesActual < mesNacimiento ||
        (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  // Formatear fecha con edad
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "-";
    const fechaFormateada = new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const edad = calcularEdad(fecha);
    return `${fechaFormateada} (${edad} años)`;
  };

  // Formatear teléfono con prefijo +51
  const formatearTelefono = (telefono: string | null | undefined): string => {
    if (!telefono || telefono.trim() === "") return "";
    const telefonoLimpio = telefono.trim();
    if (telefonoLimpio.startsWith("+51")) {
      return telefonoLimpio;
    }
    if (telefonoLimpio.startsWith("51") && telefonoLimpio.length >= 11) {
      return `+${telefonoLimpio}`;
    }
    return `+51${telefonoLimpio}`;
  };

  const hayFiltrosActivos = filtroModulo || filtroDia || filtroMes || filtroBusqueda;

  // Filtrar personas con teléfono válido para WhatsApp
  const personasConTelefono = useMemo(() => {
    return personasFiltradas.filter(
      (p) => p.telefono && p.telefono.trim() !== "" && p.cumpleanos
    );
  }, [personasFiltradas]);

  // Enviar mensajes de WhatsApp
  const handleEnviarWhatsApp = async (personas: PersonaParaEnvio[]) => {
    try {
      await postData("whatsapp/messages/send", { personas });
      showSuccess(
        "Mensajes enviados",
        `Se han encolado ${personas.length} mensaje(s) para envío`
      );
      // Navegar al historial de mensajes
      router.push("/programas-sociales/mensajeria-whatsapp");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al enviar mensajes";
      showError("Error", errorMessage);
      throw error;
    }
  };

  return (
    <Box>
      {/* Encabezado */}
      <Box mb={3}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: subgerencia.color,
            fontWeight: 700,
            fontFamily: "'Poppins', 'Roboto', sans-serif",
          }}
        >
          Lista General
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Datos unificados de PVL, Ollas Comunes, Comedores Populares y ULE
        </Typography>
      </Box>

      {/* Filtros */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Búsqueda */}
          <TextField
            size="small"
            placeholder="Buscar por nombre, DNI, entidad..."
            value={filtroBusqueda}
            onChange={(e) => {
              setFiltroBusqueda(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {/* Filtro por módulo */}
          <TextField
            select
            size="small"
            label="Módulo"
            value={filtroModulo}
            onChange={(e) => {
              setFiltroModulo(e.target.value as ModuloType | "");
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Todos los módulos</MenuItem>
            {MODULOS_CONFIG.map((modulo) => (
              <MenuItem key={modulo.id} value={modulo.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: modulo.color,
                    }}
                  />
                  {modulo.label}
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Filtro por mes de cumpleaños */}
          <TextField
            select
            size="small"
            label="Mes de cumpleaños"
            value={filtroMes}
            onChange={(e) => {
              setFiltroMes(e.target.value as number | "");
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Cake fontSize="small" sx={{ color: "#d81b7e" }} />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">Todos los meses</MenuItem>
            {MESES.map((mes) => (
              <MenuItem key={mes.value} value={mes.value}>
                {mes.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Filtro por día de cumpleaños */}
          <TextField
            size="small"
            label="Día"
            type="number"
            value={filtroDia}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 31)) {
                setFiltroDia(value);
                setPage(0);
              }
            }}
            sx={{ width: 80 }}
            inputProps={{ min: 1, max: 31 }}
          />

          {/* Espaciador */}
          <Box sx={{ flex: 1 }} />

          {/* Botones de acción */}
          {hayFiltrosActivos && (
            <Tooltip title="Limpiar filtros">
              <IconButton onClick={limpiarFiltros} size="small">
                <Clear />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Actualizar datos">
            <IconButton onClick={fetchAllData} disabled={isLoading} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={descargarExcel}
            disabled={isLoading || personasFiltradas.length === 0}
            sx={{
              backgroundColor: subgerencia.color,
              "&:hover": { backgroundColor: "#b01668" },
            }}
          >
            Descargar Excel
          </Button>

          {/* Botón WhatsApp - solo visible cuando hay filtro de cumpleaños */}
          {(filtroDia || filtroMes) && personasConTelefono.length > 0 && (
            <Tooltip title={`Enviar saludo de cumpleaños a ${personasConTelefono.length} persona(s) con teléfono`}>
              <Button
                variant="contained"
                startIcon={<WhatsApp />}
                onClick={() => setWhatsappDialogOpen(true)}
                sx={{
                  backgroundColor: "#25D366",
                  "&:hover": { backgroundColor: "#128C7E" },
                }}
              >
                WhatsApp ({personasConTelefono.length})
              </Button>
            </Tooltip>
          )}

          {/* Botón Historial de WhatsApp */}
          <Tooltip title="Ver historial de mensajes WhatsApp">
            <IconButton
              onClick={() => router.push("/programas-sociales/mensajeria-whatsapp")}
              size="small"
              sx={{
                color: "#25D366",
                border: "1px solid #25D366",
                "&:hover": {
                  backgroundColor: "#dcfce7",
                },
              }}
            >
              <WhatsApp fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Resumen de filtros */}
        {hayFiltrosActivos && (
          <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Filtros activos:
            </Typography>
            {filtroModulo && (
              <Chip
                size="small"
                label={MODULOS_CONFIG.find((m) => m.id === filtroModulo)?.label}
                onDelete={() => setFiltroModulo("")}
                sx={{ backgroundColor: getModuloColor(filtroModulo), color: "white" }}
              />
            )}
            {filtroMes && (
              <Chip
                size="small"
                label={`Mes: ${MESES.find((m) => m.value === filtroMes)?.label}`}
                onDelete={() => setFiltroMes("")}
                icon={<Cake sx={{ color: "white !important", fontSize: 16 }} />}
                sx={{ backgroundColor: "#d81b7e", color: "white" }}
              />
            )}
            {filtroDia && (
              <Chip
                size="small"
                label={`Día: ${filtroDia}`}
                onDelete={() => setFiltroDia("")}
                sx={{ backgroundColor: "#d81b7e", color: "white" }}
              />
            )}
            {filtroBusqueda && (
              <Chip
                size="small"
                label={`Búsqueda: "${filtroBusqueda}"`}
                onDelete={() => setFiltroBusqueda("")}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Estadísticas rápidas */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Paper
          sx={{
            px: 2,
            py: 1,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <FilterList fontSize="small" color="action" />
          <Typography variant="body2">
            <strong>{personasFiltradas.length}</strong> de {personas.length} registros
          </Typography>
        </Paper>
        {MODULOS_CONFIG.map((modulo) => {
          const count = personasFiltradas.filter((p) => p.modulo === modulo.id).length;
          return (
            <Paper
              key={modulo.id}
              sx={{
                px: 2,
                py: 1,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderLeft: `4px solid ${modulo.color}`,
              }}
            >
              <Typography variant="body2">
                <strong>{count}</strong> {modulo.label}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Tabla */}
      <Paper
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 400,
            }}
          >
            <CircularProgress sx={{ color: subgerencia.color }} />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: "calc(100vh - 400px)" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      Módulo
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      Código
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      Entidad
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      Rol
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      Nombre Completo
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      DNI
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      Teléfono
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: "#f8fafc" }}>
                      Cumpleaños
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {personasPaginadas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron registros con los filtros aplicados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    personasPaginadas.map((persona) => (
                      <TableRow
                        key={persona.id}
                        hover
                        sx={{
                          "&:hover": { backgroundColor: "#f8fafc" },
                        }}
                      >
                        <TableCell>
                          <Chip
                            size="small"
                            label={persona.moduloLabel}
                            sx={{
                              backgroundColor: getModuloColor(persona.modulo),
                              color: "white",
                              fontSize: "0.7rem",
                              height: 24,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                            {persona.entidadCodigo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {persona.entidadNombre}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {persona.rol}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {persona.nombre} {persona.apellido}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                            {persona.dni}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatearTelefono(persona.telefono) || "-"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {persona.cumpleanos && (
                              <Cake sx={{ fontSize: 14, color: "#d81b7e" }} />
                            )}
                            <Typography variant="body2">
                              {formatearFecha(persona.cumpleanos)}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={personasFiltradas.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </>
        )}
      </Paper>

      {/* Dialog de WhatsApp */}
      <WhatsAppMessageDialog
        open={whatsappDialogOpen}
        onClose={() => setWhatsappDialogOpen(false)}
        personas={personasFiltradas}
        onConfirm={handleEnviarWhatsApp}
        calcularEdad={calcularEdad}
      />
    </Box>
  );
}
