import type { PaginationState } from "../types.ts";

/** 1-based, inclusive row range for "Showing 21–40 of 95". Both 0 when there are no rows. */
export interface RowRange {
  from: number;
  to: number;
}

/**
 * Returns how many pages `rowCount` rows need. Never less than 1.
 *
 * @param rowCount - Total rows.
 * @param pageSize - Rows per page, at least 1.
 * @returns The page count.
 */
export function getPageCount(rowCount: number, pageSize: number): number {
  // No rows is still 1 page, so the UI says "Page 1 of 1", not "of 0".
  return Math.max(1, Math.ceil(rowCount / pageSize));
}

/**
 * Forces a page index into `[0, pageCount - 1]`.
 *
 * @param pageIndex - Requested 0-based index; may be invalid (bad prop or URL).
 * @param pageCount - Number of pages, at least 1.
 * @returns A valid 0-based index.
 */
export function clampPageIndex(pageIndex: number, pageCount: number): number {
  // NaN or Infinity → first page, not a blank table.
  if (!Number.isFinite(pageIndex)) {
    return 0;
  }
  const wholeIndex = Math.floor(pageIndex);
  // Past the end (data shrank) → last page. Negative → first page.
  return Math.min(Math.max(wholeIndex, 0), pageCount - 1);
}

/**
 * Returns the rows of the current page. Client mode only; in server mode `data` is already one page.
 *
 * @param rows - All rows, already sorted.
 * @param pagination - Current page, already clamped.
 * @returns The rows to render.
 */
export function getPageRows<TRow>(
  rows: readonly TRow[],
  pagination: PaginationState,
): TRow[] {
  const start = pagination.pageIndex * pagination.pageSize;
  return rows.slice(start, start + pagination.pageSize);
}

/**
 * Returns the 1-based range shown on the current page.
 *
 * @param pagination - Current page, already clamped.
 * @param rowCount - Total rows.
 * @returns `{ from, to }`, or both 0 when there are no rows.
 */
export function getRowRange(
  pagination: PaginationState,
  rowCount: number,
): RowRange {
  // Otherwise it would say "Showing 1–0 of 0".
  if (rowCount === 0) {
    return { from: 0, to: 0 };
  }
  const from = pagination.pageIndex * pagination.pageSize + 1;
  const to = Math.min(from + pagination.pageSize - 1, rowCount);
  return { from, to };
}
