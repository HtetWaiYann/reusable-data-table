import {
  useCallback,
  useId,
  type ReactElement,
  type ReactNode,
  type UIEvent,
} from "react";
import { useExpansion } from "./hooks/useExpansion.ts";
import { useLazyChildren } from "./hooks/useLazyChildren.ts";
import { usePagination } from "./hooks/usePagination.ts";
import { usePinnedColumn } from "./hooks/usePinnedColumn.ts";
import { useSorting } from "./hooks/useSorting.ts";
import { Pagination } from "./Pagination.tsx";
import { SkeletonRows } from "./SkeletonRows.tsx";
import { TableHeader } from "./TableHeader.tsx";
import { TableRow } from "./TableRow.tsx";
import { EmptyRow, ErrorRow } from "./TableStates.tsx";
import type { DataTableProps } from "./types.ts";
import styles from "./data-table.module.css";

// Shows the pinned column's shadow only while it's stuck and other cells pass underneath.
// Writes a data attribute instead of setting state, so scrolling never re-renders the table.
function handleScroll(event: UIEvent<HTMLDivElement>): void {
  const box = event.currentTarget;
  const pinnedHeader = box.querySelector("th[data-pinned]");
  if (!pinnedHeader) {
    return;
  }
  // The pinned column's resting position is where the column before it ends (0 if it's first).
  // It sticks once the box has scrolled past that point.
  const previous = pinnedHeader.previousElementSibling;
  const restingLeft =
    previous instanceof HTMLElement
      ? previous.offsetLeft + previous.offsetWidth
      : 0;
  box.dataset.pinnedStuck = String(box.scrollLeft > restingLeft);
}

/**
 * A reusable data table
 *
 * @param props - See {@link DataTableProps}.
 * @returns The table and its pagination controls.
 * @example
 * const columns: ColumnDef<Person>[] = [
 *   { id: "name", header: "Name", getValue: (row) => row.name, sortable: true },
 * ];
 *
 * <DataTable
 *   caption="People"
 *   data={people}
 *   getRowId={(row) => row.id}
 *   columns={columns}
 *   defaultSort={{ columnId: "name", direction: "asc" }}
 * />
 */
export function DataTable<TRow, TChild = never>(
  props: DataTableProps<TRow, TChild>,
): ReactElement {
  const {
    data,
    getRowId,
    caption,
    columns,
    sort,
    defaultSort,
    onSortChange,
    manualSorting,
    pagination,
    defaultPagination,
    onPaginationChange,
    pageSizeOptions,
    isLoading = false,
    error = null,
    onRetry,
    emptyState,
    expansion,
  } = props;

  const sorting = useSorting({
    data,
    columns,
    sort,
    defaultSort,
    onSortChange,
    manualSorting,
  });

  // Read through `props` so TypeScript narrows: rowCount is a number whenever manualPagination is true.
  const rowCount = props.manualPagination
    ? props.rowCount
    : sorting.sortedRows.length;

  const paging = usePagination({
    rows: sorting.sortedRows,
    rowCount,
    manualPagination: props.manualPagination,
    pagination,
    defaultPagination,
    onPaginationChange,
    pageSizeOptions,
  });

  const pinnedColumnId = usePinnedColumn(columns);

  // --- Expansion ---
  const detailIdPrefix = useId();
  const { expandedRows, toggle } = useExpansion();
  const lazyChildren = useLazyChildren(
    expansion?.mode === "lazy" ? expansion.loadChildren : undefined,
  );
  const { load } = lazyChildren;
  // The toggle column adds one cell to every row, so full-width cells span one more.
  const colSpan = columns.length + (expansion ? 1 : 0);

  // Stable callbacks (no getRowId inside; rows pass their own id), so memoized rows don't re-render.
  // Loading starts in the click handler, not an effect: the user's action is what causes the fetch.
  // load() is a no-op in inline mode, and when the children are already loading or loaded.
  const handleToggleRow = useCallback(
    (row: TRow, rowId: string) => {
      toggle(rowId);
      load(row, rowId);
    },
    [toggle, load],
  );
  const handleRetryRow = useCallback(
    (row: TRow, rowId: string) => load(row, rowId, true),
    [load],
  );

  // First load shows skeletons. A refetch keeps the current rows and shows a progress bar instead,
  // so the table doesn't flash back to placeholders on every sort or page change in server mode.
  const isFirstLoad = isLoading && data.length === 0;
  const isRefetching = isLoading && !isFirstLoad;
  // "Showing 0–0 of 0" would be wrong while loading or after a failure.
  const showPagination = !isFirstLoad && !error;

  function renderBody(): ReactNode {
    if (isFirstLoad) {
      return (
        <SkeletonRows
          columns={columns}
          pinnedColumnId={pinnedColumnId}
          hasToggleColumn={expansion !== undefined}
          rowCount={paging.pageSize}
        />
      );
    }
    if (error) {
      return <ErrorRow colSpan={colSpan} message={error} onRetry={onRetry} />;
    }
    if (paging.pageRows.length === 0) {
      return <EmptyRow colSpan={colSpan} content={emptyState} />;
    }
    return paging.pageRows.map((row) => {
      const rowId = getRowId(row);
      return (
        // Never use the index. After sorting, index keys would attach state to the wrong row.
        <TableRow
          key={rowId}
          row={row}
          rowId={rowId}
          columns={columns}
          pinnedColumnId={pinnedColumnId}
          expansion={expansion}
          detailIdPrefix={detailIdPrefix}
          isExpanded={expandedRows.get(rowId) === true}
          isDetailMounted={expandedRows.has(rowId)}
          lazyEntry={lazyChildren.entries.get(rowId)}
          onToggle={handleToggleRow}
          onRetry={handleRetryRow}
        />
      );
    });
  }

  function handleSort(columnId: string): void {
    sorting.toggleSort(columnId);
    // Back to page 1: page 3 of the old order would show unrelated rows.
    if (paging.pageIndex !== 0) {
      paging.setPageIndex(0);
    }
  }

  return (
    <div className={styles.root}>
      {/* Decorative: aria-busy on the table already tells screen readers it's loading. */}
      {isRefetching && (
        <div className={styles.progressBar} aria-hidden="true" />
      )}
      {/* The wrapper scrolls, so a wide table never widens the page. */}
      <div className={styles.scroll} onScroll={handleScroll}>
        <table className={styles.table} aria-busy={isLoading}>
          <caption className={styles.caption}>
            <span className={styles.captionText}>{caption}</span>
          </caption>
          <TableHeader
            columns={columns}
            sort={sorting.sort}
            pinnedColumnId={pinnedColumnId}
            hasToggleColumn={expansion !== undefined}
            onSort={handleSort}
          />
          <tbody>{renderBody()}</tbody>
        </table>
      </div>
      {showPagination && (
        <Pagination
          pageIndex={paging.pageIndex}
          pageSize={paging.pageSize}
          pageCount={paging.pageCount}
          rowCount={rowCount}
          pageSizeOptions={paging.pageSizeOptions}
          onPageIndexChange={paging.setPageIndex}
          onPageSizeChange={paging.setPageSize}
        />
      )}
    </div>
  );
}
