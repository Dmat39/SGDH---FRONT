import { useMemo } from "react";
import { toTitleCase, formatDireccion } from "@/lib/utils/formatters";

const SKIP_KEYS_PATTERN =
  /id|dni|code|codigo|phone|telefono|fsu|s100|email|ruc/i;

const ADDRESS_KEYS_PATTERN = /direccion|domicilio|address/i;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;

function shouldSkipValue(value: string): boolean {
  return value.length <= 3 || ISO_DATE_PATTERN.test(value);
}

function formatRecord<T extends object>(obj: T): T {
  const result = { ...obj } as Record<string, unknown>;

  for (const key in result) {
    const value = result[key];

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      result[key] = formatRecord(value as Record<string, unknown>);
      continue;
    }

    if (typeof value !== "string") continue;
    if (SKIP_KEYS_PATTERN.test(key)) continue;
    if (shouldSkipValue(value)) continue;

    result[key] = ADDRESS_KEYS_PATTERN.test(key)
      ? formatDireccion(value)
      : toTitleCase(value);
  }

  return result as T;
}

/**
 * Hook que formatea automáticamente los strings de un array de datos para tabla.
 *
 * - Convierte nombres a Title Case
 * - Preserva siglas urbanas en direcciones
 * - Excluye DNIs, teléfonos, códigos, IDs, fechas ISO y valores cortos (≤3 chars)
 * - Procesa objetos anidados recursivamente
 *
 * @example
 * const formattedData = useFormatTableData(beneficiarios);
 */
export function useFormatTableData<T extends object>(data: T[]): T[] {
  return useMemo(() => data.map(formatRecord), [data]);
}
