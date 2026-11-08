import type { ReactElement } from "react";
import { getRowRange } from "./utils/pagination.ts";

/** Props of {@link Pagination}. */
export interface PaginationProps {
  /** Current page, 0-based. */
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  /** Total rows across all pages. */
  rowCount: number;
  pageSizeOptions: number[];
  onPageIndexChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Previous / Next controls, a "Showing 11–20 of 50" summary and a page-size selector.
 * Internal: not exported from the package.
 */
export function Pagination({
  pageIndex,
  pageSize,
  pageCount,
  rowCount,
  pageSizeOptions,
  onPageIndexChange,
  onPageSizeChange,
}: PaginationProps): ReactElement {
  const { from, to } = getRowRange({ pageIndex, pageSize }, rowCount);
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex >= pageCount - 1;
  // A controlled page size that isn't in the list (e.g. 25) would make the <select> show the wrong value.
  const sizeOptions = pageSizeOptions.includes(pageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, pageSize].toSorted((a, b) => a - b);

  return (
    <nav aria-label="Pagination">
      <p>
        Showing {from}–{to} of {rowCount}
      </p>
      <button
        type="button"
        disabled={isFirstPage}
        onClick={() => onPageIndexChange(pageIndex - 1)}
      >
        Previous
      </button>
      {/* Users count pages from 1. */}
      <span>
        Page {pageIndex + 1} of {pageCount}
      </span>
      <button
        type="button"
        disabled={isLastPage}
        onClick={() => onPageIndexChange(pageIndex + 1)}
      >
        Next
      </button>
      <label>
        Rows per page{" "}
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {sizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </nav>
  );
}
