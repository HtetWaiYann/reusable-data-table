import type { ColumnDef } from "../types.ts";

/**
 * Returns the column to pin: the first one with `pinned: true`. Only one column is pinned,
 * and it can be anywhere; with `left: 0` it scrolls normally until it reaches the left edge, then sticks.
 *
 * @param columns - Columns in display order.
 * @returns The pinned column's id, or `null` when none is pinned.
 */
export function getPinnedColumnId<TRow>(
  columns: readonly ColumnDef<TRow>[],
): string | null {
  return columns.find((column) => column.pinned)?.id ?? null;
}

/**
 * Explains a pinning setup the table can't fully honour, or returns `null` when it's fine.
 *
 * @param columns - Columns in display order.
 * @returns A message for the dev warning, or `null`.
 */
export function describePinningIssue<TRow>(
  columns: readonly ColumnDef<TRow>[],
): string | null {
  const pinnedIds = columns
    .filter((column) => column.pinned)
    .map((column) => column.id);
  if (pinnedIds.length <= 1) {
    return null;
  }
  return `only one column can be pinned; pinning "${pinnedIds[0]}" and ignoring ${pinnedIds
    .slice(1)
    .map((id) => `"${id}"`)
    .join(", ")}.`;
}
