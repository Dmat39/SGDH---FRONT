/**
 * Siglas urbanas que deben preservarse en mayúsculas al formatear direcciones.
 */
const SIGLAS_URBANAS = new Set([
  "MZ",
  "LT",
  "AA.HH",
  "AA.FF",
  "JR",
  "AV",
  "CA",
  "PSJ",
  "URB",
  "APV",
  "ASOC",
  "COOP",
  "PP.JJ",
  "P.J",
  "SN",
  "S/N",
  "AAHH",
  "INT",
  "DPTO",
  "BLQ",
  "PISO",
  "SEC",
  "GRP",
  "CALLE",
  "PASAJE",
  "ALAMEDA",
  "JIRON",
  "AVENIDA",
]);

/**
 * Convierte un string a Title Case respetando caracteres españoles.
 *
 * @example
 * toTitleCase("JUAN CARLOS PÉREZ") // "Juan Carlos Pérez"
 * toTitleCase("maría josé") // "María José"
 */
export function toTitleCase(str: string): string {
  if (!str) return str;

  return str
    .toLowerCase()
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase());
}

/**
 * Aplica Title Case a una dirección preservando siglas urbanas en mayúsculas.
 *
 * @example
 * formatDireccion("MZ A LT 5 AA.HH LOS JARDINES") // "Mz A Lt 5 AA.HH Los Jardines"
 * formatDireccion("AV LOS INCAS 123 URB SANTA ROSA") // "Av Los Incas 123 URB Santa Rosa"
 */
export function formatDireccion(str: string): string {
  if (!str) return str;

  return str
    .split(/\s+/)
    .map((word) => {
      if (SIGLAS_URBANAS.has(word.toUpperCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
