import type { SortValue } from "../types.ts";

/**
 * Default text for a cell without `renderCell`. Kept plain since real formatting (dates, currency…) belongs in `renderCell`.
 * `String()` is still needed: React can't render a Date object and renders booleans as nothing.
 *
 * @param value - The column's `getValue` result.
 * @returns The text to show, or "" for missing values.
 */
export function formatCellValue(value: SortValue): string {
  // Blank cell instead of the words "null", "undefined" or "NaN".
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "";
  }
  return String(value);
}
