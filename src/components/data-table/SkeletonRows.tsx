import type { ReactElement } from "react";
import { getCellProps } from "./cellProps.ts";
import type { ColumnDef } from "./types.ts";
import styles from "./data-table.module.css";

/** Props of {@link SkeletonRows}. */
export interface SkeletonRowsProps<TRow> {
  columns: ColumnDef<TRow>[];
  pinnedColumnId: string | null;
  /** Adds an empty first cell to line up with the expand toggle column. */
  hasToggleColumn: boolean;
  /** How many placeholder rows; the page size, so the table doesn't jump when data arrives. */
  rowCount: number;
}

/**
 * Placeholder rows shown during the first load. Same columns, widths and pinned cell as the real rows.
 * Internal: not exported from the package.
 */
export function SkeletonRows<TRow>({
  columns,
  pinnedColumnId,
  hasToggleColumn,
  rowCount,
}: SkeletonRowsProps<TRow>): ReactElement {
  return (
    <>
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        // Placeholders have no content to read, and the table is aria-busy, so hide them from screen readers.
        // Index keys are fine: these rows never reorder and hold no state.
        <tr key={rowIndex} aria-hidden="true">
          {hasToggleColumn && (
            <td className={`${styles.cell} ${styles.toggleCell}`} />
          )}
          {columns.map((column) => (
            <td
              key={column.id}
              {...getCellProps(column, pinnedColumnId, styles.cell)}
            >
              <span className={styles.skeletonBar} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
