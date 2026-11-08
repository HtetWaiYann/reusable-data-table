import type { ReactElement } from "react";
import { usePagination } from "./hooks/usePagination.ts";
import { useSorting } from "./hooks/useSorting.ts";
import { Pagination } from "./Pagination.tsx";
import { TableHeader } from "./TableHeader.tsx";
import { TableRow } from "./TableRow.tsx";
import type { DataTableProps } from "./types.ts";
import styles from "./data-table.module.css";

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

  function handleSort(columnId: string): void {
    sorting.toggleSort(columnId);
    // Back to page 1: page 3 of the old order would show unrelated rows.
    if (paging.pageIndex !== 0) {
      paging.setPageIndex(0);
    }
  }

  return (
    <div className={styles.root}>
      {/* The wrapper scrolls, so a wide table never widens the page. */}
      <div className={styles.scroll}>
        <table className={styles.table}>
          <caption className={styles.caption}>
            <span className={styles.captionText}>{caption}</span>
          </caption>
          <TableHeader
            columns={columns}
            sort={sorting.sort}
            onSort={handleSort}
          />
          <tbody>
            {paging.pageRows.map((row) => (
              // Never use the index. After sorting, index keys would attach state to the wrong row.
              <TableRow key={getRowId(row)} row={row} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        pageIndex={paging.pageIndex}
        pageSize={paging.pageSize}
        pageCount={paging.pageCount}
        rowCount={rowCount}
        pageSizeOptions={paging.pageSizeOptions}
        onPageIndexChange={paging.setPageIndex}
        onPageSizeChange={paging.setPageSize}
      />
    </div>
  );
}
