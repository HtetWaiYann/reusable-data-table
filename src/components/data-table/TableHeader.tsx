import type { ReactElement } from "react";
import type { ColumnDef, SortDirection, SortState } from "./types.ts";
import styles from "./data-table.module.css";

/** Props of {@link TableHeader}. */
export interface TableHeaderProps<TRow> {
  columns: ColumnDef<TRow>[];
  sort: SortState;
  onSort: (columnId: string) => void;
}

// Values of the aria-sort attribute. ref comes from https://www.w3.org/TR/wai-aria-1.2/#aria-sort
const ARIA_SORT: Record<SortDirection, "ascending" | "descending"> = {
  asc: "ascending",
  desc: "descending",
};

// The following is temp design, will fix the UI after completing the logic
const SORT_ARROW: Record<SortDirection, string> = { asc: "▲", desc: "▼" };
// Hints that an unsorted header is still clickable.
const UNSORTED_ARROW = "↕";

/**
 * The table's `<thead>`. Sortable headers are buttons, so the keyboard works for free.
 * Internal: not exported from the package.
 */
export function TableHeader<TRow>({
  columns,
  sort,
  onSort,
}: TableHeaderProps<TRow>): ReactElement {
  return (
    <thead>
      <tr>
        {columns.map((column) => {
          const direction =
            sort?.columnId === column.id ? sort.direction : undefined;

          return (
            <th
              key={column.id}
              scope="col"
              aria-sort={direction ? ARIA_SORT[direction] : undefined}
              style={{ width: column.width }}
              className={styles.headerCell}
            >
              {column.sortable ? (
                <button
                  type="button"
                  className={styles.sortButton}
                  onClick={() => onSort(column.id)}
                >
                  {column.header}
                  {/* This is just for decoration. aria-sort already announces the direction. */}
                  <span aria-hidden="true">
                    {direction ? SORT_ARROW[direction] : UNSORTED_ARROW}
                  </span>
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
