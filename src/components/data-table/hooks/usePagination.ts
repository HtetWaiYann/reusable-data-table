import { useEffect, useMemo } from "react";
import type { DataTableProps } from "../types.ts";
import {
  clampPageIndex,
  getPageCount,
  getPageRows,
} from "../utils/pagination.ts";
import { useControllableState } from "./useControllableState.ts";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];
// Used when the given page size is unusable (0, negative, a fraction).
const FALLBACK_PAGE_SIZE = 10;

/** Options for {@link usePagination}. Picked from the table props so the docs live in `types.ts`. */
export type UsePaginationOptions<TRow> = Pick<
  DataTableProps<TRow>,
  "pagination" | "defaultPagination" | "onPaginationChange" | "pageSizeOptions"
> & {
  /** Sorted rows: all rows in client mode, the current page in server mode. */
  rows: readonly TRow[];
  /** Total rows across all pages: `rows.length` in client mode, the `rowCount` prop in server mode. */
  rowCount: number;
  /** Server mode: `rows` is already one page, so don't slice it. */
  manualPagination?: boolean;
};

/** What {@link usePagination} gives the table. */
export interface UsePaginationResult<TRow> {
  /** Rows to render on the current page. */
  pageRows: readonly TRow[];
  /** Current page (0-based), always valid. */
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  /** Options for the page-size selector, with defaults applied. */
  pageSizeOptions: number[];
  setPageIndex: (pageIndex: number) => void;
  /** Changes the page size and goes back to the first page. */
  setPageSize: (pageSize: number) => void;
}

/**
 * Pagination state plus the rows of the current page. With `manualPagination` it only emits changes.
 *
 * @param options - See {@link UsePaginationOptions}.
 * @returns See {@link UsePaginationResult}.
 */
export function usePagination<TRow>({
  rows,
  rowCount,
  manualPagination = false,
  pagination: paginationProp,
  defaultPagination,
  onPaginationChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: UsePaginationOptions<TRow>): UsePaginationResult<TRow> {
  const [pagination, setPagination] = useControllableState({
    value: paginationProp,
    defaultValue: defaultPagination ?? {
      pageIndex: 0,
      pageSize: pageSizeOptions[0],
    },
    onChange: onPaginationChange,
    name: "pagination",
  });

  const isPageSizeValid =
    Number.isInteger(pagination.pageSize) && pagination.pageSize > 0;
  const pageSize = isPageSizeValid ? pagination.pageSize : FALLBACK_PAGE_SIZE;
  useEffect(() => {
    if (import.meta.env.DEV && !isPageSizeValid) {
      console.warn(
        `DataTable: pageSize ${pagination.pageSize} isn't a positive whole number; using ${FALLBACK_PAGE_SIZE}.`,
      );
    }
  }, [isPageSizeValid, pagination.pageSize]);

  const pageCount = getPageCount(rowCount, pageSize);
  // Clamped on every render instead of synced: if data shrinks under page 5, we simply show the last page.
  const pageIndex = clampPageIndex(pagination.pageIndex, pageCount);

  const pageRows = useMemo(
    () =>
      manualPagination ? rows : getPageRows(rows, { pageIndex, pageSize }),
    [rows, pageIndex, pageSize, manualPagination],
  );

  function setPageIndex(nextPageIndex: number): void {
    setPagination({
      pageIndex: clampPageIndex(nextPageIndex, pageCount),
      pageSize,
    });
  }

  // Back to page 1: the old page number means different rows at a new size.
  function setPageSize(nextPageSize: number): void {
    setPagination({ pageIndex: 0, pageSize: nextPageSize });
  }

  return {
    pageRows,
    pageIndex,
    pageSize,
    pageCount,
    pageSizeOptions,
    setPageIndex,
    setPageSize,
  };
}
