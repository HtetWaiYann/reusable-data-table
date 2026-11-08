// Text for the table's live region. Screen readers read it out after a sort or page change, since
// those change the rows without moving focus, so nothing else tells a non-sighted user it worked.
import type { ColumnDef, SortState } from "../types.ts";

/**
 * Describes a sort for the live region.
 *
 * @param sort - The new sort.
 * @param columns - To look up the column's header.
 * @returns E.g. "Sorted by Time, ascending.", or "Sort cleared."; "" for an unknown column.
 */
export function describeSort<TRow>(
  sort: SortState,
  columns: readonly ColumnDef<TRow>[],
): string {
  if (!sort) {
    return "Sort cleared.";
  }
  const column = columns.find((candidate) => candidate.id === sort.columnId);
  if (!column) {
    return "";
  }
  const direction = sort.direction === "asc" ? "ascending" : "descending";
  return `Sorted by ${column.header}, ${direction}.`;
}

/**
 * Describes the current page for the live region.
 *
 * @param pageIndex - Zero-based page index.
 * @param pageCount - Total pages.
 * @returns E.g. "Page 2 of 5." (users count pages from 1).
 */
export function describePage(pageIndex: number, pageCount: number): string {
  return `Page ${pageIndex + 1} of ${pageCount}.`;
}
