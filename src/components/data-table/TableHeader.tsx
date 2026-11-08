import type { ReactElement } from "react";
import { getCellProps } from "./cellProps.ts";
import { SortIcon } from "./icons.tsx";
import type { ColumnDef, SortDirection, SortState } from "./types.ts";
import styles from "./data-table.module.css";

/** Props of {@link TableHeader}. */
export interface TableHeaderProps<TRow> {
  columns: ColumnDef<TRow>[];
  sort: SortState;
  pinnedColumnId: string | null;
  /** Adds the header cell for the expand toggle column. */
  hasToggleColumn: boolean;
  onSort: (columnId: string) => void;
}

// Values of the aria-sort attribute. ref comes from https://www.w3.org/TR/wai-aria-1.2/#aria-sort
const ARIA_SORT: Record<SortDirection, "ascending" | "descending"> = {
  asc: "ascending",
  desc: "descending",
};

/**
 * The table's `<thead>`. Sortable headers are buttons, so the keyboard works for free.
 * Internal: not exported from the package.
 */
export function TableHeader<TRow>({
  columns,
  sort,
  pinnedColumnId,
  hasToggleColumn,
  onSort,
}: TableHeaderProps<TRow>): ReactElement {
  return (
    <thead>
      <tr>
        {hasToggleColumn && (
          <th
            scope="col"
            className={`${styles.headerCell} ${styles.toggleCell}`}
          >
            {/* Visually empty, but gives screen readers a name for the column. */}
            <span className={styles.visuallyHidden}>Details</span>
          </th>
        )}
        {columns.map((column) => {
          const direction =
            sort?.columnId === column.id ? sort.direction : undefined;

          return (
            <th
              key={column.id}
              scope="col"
              aria-sort={direction ? ARIA_SORT[direction] : undefined}
              {...getCellProps(column, pinnedColumnId, styles.headerCell)}
            >
              {column.sortable ? (
                <button
                  type="button"
                  className={styles.sortButton}
                  onClick={() => onSort(column.id)}
                >
                  {column.header}
                  {/* Decoration only: aria-sort already announces the direction. "none" still
                      shows a faint icon, so unsorted headers look clickable. */}
                  <SortIcon
                    direction={direction ?? "none"}
                    className={styles.sortIcon}
                  />
                </button>
              ) : (
                column.header
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
