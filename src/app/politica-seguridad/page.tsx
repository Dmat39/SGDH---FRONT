"use client";

import { Box, Container, Typography, Paper, Divider } from "@mui/material";
import Link from "next/link";

export default function PoliticaSeguridadPage() {
  const fechaActualizacion = "31 de enero de 2026";
  const nombreEntidad = "Municipalidad Distrital de San Juan de Lurigancho";
  const nombreSistema = "SGDH - Sistema de Gerencia de Desarrollo Humano";
  const emailContacto = "desarrollohumano@munisjl.gob.pe";
  const direccion = "Av. Próceres de la Independencia 1632, San Juan de Lurigancho, Lima, Perú";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              color="#1e293b"
              gutterBottom
            >
              Política de Seguridad de la Información
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Última actualización: {fechaActualizacion}
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Contenido */}
          <Box sx={{ "& > section": { mb: 4 } }}>
            {/* Introducción */}
            <section>
              <Typography variant="h6" fontWeight={600} color="#1e293b" gutterBottom>
                Introducción
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                La <strong>{nombreEntidad}</strong>, a través de su sistema{" "}
                <strong>{nombreSistema}</strong>, establece la presente Política de Seguridad
                de la Información con el objetivo de proteger los activos de información,
                garantizar la continuidad de los servicios y minimizar los riesgos de seguridad.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Esta política se alinea con las mejores prácticas de seguridad de la información
                y cumple con la normativa vigente en el Perú, incluyendo la Ley N° 29733 de
                Protección de Datos Personales y la normativa de gobierno digital.
              </Typography>
            </section>

            {/* Alcance */}
            <section>
              <Typography variant="h6" fontWeight={600} color="#1e293b" gutterBottom>
                1. Alcance
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Esta política aplica a:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                <li><Typography variant="body1">Todos los usuarios del sistema SGDH</Typography></li>
                <li><Typography variant="body1">Personal administrativo y técnico de la municipalidad</Typography></li>
                <li><Typography variant="body1">Coordinadores y presidentes de programas sociales</Typography></li>
                <li><Typography variant="body1">Sistemas, aplicaciones y datos gestionados por el SGDH</Typography></li>
                <li><Typography variant="body1">Infraestructura tecnológica asociada</Typography></li>
              </Box>
            </section>

            {/* Objetivos de Seguridad */}
            <section>
              <Typography variant="h6" fontWeight={600} color="#1e293b" gutterBottom>
                2. Objetivos de Seguridad
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Nuestros principales objetivos de seguridad son:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                <li>
                  <Typography variant="body1" paragraph>
                    <strong>Confidencialidad:</strong> Garantizar que la información sea accesible
                    únicamente por personal autorizado.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" paragraph>
                    <strong>Integridad:</strong> Asegurar que la información sea exacta, completa
                    y no haya sido modificada sin autorización.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" paragraph>
                    <strong>Disponibilidad:</strong> Garantizar el acceso oportuno a la información
                    y sistemas cuando sea requerido.
                  </Typography>
                </li>
              </Box>
            </section>

            {/* Control de Acceso */}
            <section>
              <Typography variant="h6" fontWeight={600} color="#1e293b" gutterBottom>
                3. Control de Acceso
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                El acceso al sistema está controlado mediante:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                <li><Typography variant="body1">Autenticación mediante usuario y contraseña segura</Typography></li>
                <li><Typography variant="body1">Control de acceso basado en roles (RBAC)</Typography></li>
                <li><Typography variant="body1">Sesiones con tiempo de expiración automático</Typography></li>
                <li><Typography variant="body1">Bloqueo de cuenta tras intentos fallidos de acceso</Typography></li>
                <li><Typography variant="body1">Registro de auditoría de accesos y actividades</Typography></li>
              </Box>
            </section>

            {/* Seguridad de Contraseñas */}
            <section>
              <Typography variant="h6" fontWeight={600} color="#1e293b" gutterBottom>
                4. Seguridad de Contraseñas
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Las contraseñas deben cumplir con los siguientes requisitos:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                <li><Typography variant="body1">Longitud mínima de 8 caracteres</Typography></li>
                <li><Typography variant="body1">Combinación de mayúsculas, minúsculas, números y caracteres especiales</Typography></li>
                <li><Typography variant="body1">No utilizar información personal fácilmente identificable</Typography></li>
                <li><Typography variant="body1">Cambio periódico de contraseña recomendado cada 90 días</Typography></li>
                <li><Typography variant="body1">Las contraseñas se almacenan cifradas mediante algoritmos seguros</Typography></li>
              </Box>
            </section>

            {/* Protección de Datos */}
            <section>
              <Typography variant="h6" fontWeight={600} color="#1e293b" gutterBottom>
                5. Protección de Datos
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Implementamos las siguientes medidas para proteger los datos:
              </Typography>
              <Box
                sx={{
                  backgroundColor: "#f1f5f9",
                  p: 2,
                  borderRadius: "8px",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} color="#1e293b">
                  Cifrado de datos:
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: "text.secondary", mt: 1 }}>
                  <li><Typography variant="body2">Comunicaciones cifradas con TLS 1.3</Typography></li>
                  <li><Typography variant="body2">Datos sensibles cifrados en reposo (AES-256)</Typography></li>
                  <li><Typography variant="body2">Certificados SSL/TLS válidos y actualizados</Typography></li>
                </Box>
              </Box>
              <Box
                sx={{
                  backgroundColor: "#f1f5f9",
                  p: 2,
                  borderRadius: "8px",
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} color="#1e293b">
                  Respaldo de información:
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: "text.secondary", mt: 1 }}>
                  <li><Typography variant="body2">Copias de seguridad automáticas diarias</Typography></li>
                  <li><Typography variant="body2">Almacenamiento redundante en ubicaciones separadas</Typography></li>
                  <li><Typography variant="body2">Pruebas periódicas de restauración</Typography></li>
                </Box>
              </Box>
            </section>

            {/* Seguridad de la Infraestructura */}
            <section>
              <Typography variant="h6" fontWeight={600} color="#1e293b" gutterBottom>
                6. Seguridad de la Infraestructura
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                La infraestructura del sistema cuenta con:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                <li><Typography variant="body1">Firewalls y sistemas de detección de intrusos</Typography></li>
                <li><Typography variant="body1">Protección contra malware y amenazas</Typography></li>
                <li><Typography variant="body1">Actualizaciones de seguridad periódicas</Typography></li>
                <li><Typography variant="body1">Monitoreo continuo de la infraestructura</Typography></li>
                <li><Typography variant="body1">Segmentación de redes</Typography></li>
              </Box>
            </section>

            {/* Gestión de Incidentes */}
            <section>
              <Typography variant="h6" fontWeight={600} color="#1e293b" gutterBottom>
                7. Gestión de Incidentes de Seguridad
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Contamos con un proceso de gestión de incidentes que incluye:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                <li><Typography variant="body1">Detección y registro de incidentes de seguridad</Typography></li>
                <li><Typography variant="body1">Clasificación según severidad e impacto</Typography></li>
                <li><Typography variant="body1">Respuesta y contención inmediata</Typography></li>
                <li><Typography variant="body1">Investigación y análisis de causa raíz</Typography></li>
                <li><Typography variant="body1">Notificación a usuarios afectados cuando corresponda</Typography></li>
                <li><Typography variant="body1">Implementación de medidas correctivas</Typography></li>
              </Box>
            </section>

            {/* Responsabilidades del Usuario */}
            <section>
              <Typography variant="h6" fontWeight={600} color="#1e293b" gutterBottom>
                8. Responsabilidades del Usuario
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Los usuarios del sistema deben:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                <li><Typography variant="body1">Mantener la confidencialidad de sus credenciales de acceso</Typography></li>
                <li><Typography variant="body1">No compartir sus contraseñas con terceros</Typography></li>
                <li><Typography variant="body1">Reportar inmediatamente cualquier actividad sospechosa</Typography></li>
                <li><Typography variant="body1">Cerrar sesión al terminar de usar el sistema</Typography></li>
                <li><Typography variant="body1">No acceder al sistema desde dispositivos públicos o no confiables</Typography></li>
                <li><Typography variant="body1">Cumplir con las políticas de uso aceptable</Typography></li>
              </Box>
            </section>

            {/* Cumplimiento Normativo */}
            <section>
              <Typography variant="h6" fontWeight={600} color="#1e293b" gutterBottom>
                9. Cumplimiento Normativo
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Esta política cumple con:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                <li><Typography variant="body1">Ley N° 29733 - Ley de Protección de Datos Personales</Typography></li>
                <li><Typography variant="body1">D.S. N° 003-2013-JUS - Reglamento de la Ley N° 29733</Typography></li>
                <li><Typography variant="body1">Normativa de Gobierno Digital del Perú</Typography></li>
                <li><Typography variant="body1">Lineamientos de seguridad de la ONGEI/PCM</Typography></li>
              </Box>
            </section>

            {/* Revisión y Actualización */}
            <section>
              <Typography variant="h6" fontWeight={600} color="#1e293b" gutterBottom>
                10. Revisión y Actualización
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Esta política será revisada y actualizada:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: "text.secondary" }}>
                <li><Typography variant="body1">Anualmente de forma programada</Typography></li>
                <li><Typography variant="body1">Cuando ocurran cambios significativos en la infraestructura</Typography></li>
                <li><Typography variant="body1">Ante nuevas amenazas o vulnerabilidades identificadas</Typography></li>
                <li><Typography variant="body1">Por cambios en la normativa aplicable</Typography></li>
              </Box>
            </section>

            {/* Contacto */}
            <section>
              <Typography variant="h6" fontWeight={600} color="#1e293b" gutterBottom>
                11. Contacto
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Para reportar incidentes de seguridad o consultas relacionadas:
              </Typography>
              <Box
                sx={{
                  backgroundColor: "#f1f5f9",
                  p: 2,
                  borderRadius: "8px",
                  mt: 2,
                }}
              >
                <Typography variant="body1" fontWeight={500}>
                  {nombreEntidad}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Subgerencia de Programas Sociales - Área de Tecnología
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Dirección: {direccion}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Correo electrónico: {emailContacto}
                </Typography>
              </Box>
            </section>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Footer */}
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} {nombreEntidad}. Todos los derechos reservados.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {nombreSistema}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Link href="/terminos-condiciones" style={{ color: "#64748b", fontSize: "0.875rem" }}>
                Términos y Condiciones
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
