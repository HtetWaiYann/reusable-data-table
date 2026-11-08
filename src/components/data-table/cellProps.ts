import type { CSSProperties } from "react";
import type { ColumnDef } from "./types.ts";
import styles from "./data-table.module.css";

/** Props spread on a `<th>` or `<td>`. */
export interface CellProps {
  className: string;
  style: CSSProperties;
  /** Marks the pinned cell, so the scroll handler can find the pinned header. */
  "data-pinned"?: true;
}

/**
 * Class, style and pinned marker shared by a column's header cell and body cells, so both line up.
 *
 * @param column - The column.
 * @param pinnedColumnId - From `usePinnedColumn`.
 * @param baseClassName - `styles.headerCell` or `styles.cell`.
 * @returns Props to spread on the `<th>` or `<td>`.
 */
export function getCellProps<TRow>(
  column: ColumnDef<TRow>,
  pinnedColumnId: string | null,
  baseClassName: string,
): CellProps {
  const style = { width: column.width };
  if (column.id !== pinnedColumnId) {
    return { className: baseClassName, style };
  }
  return {
    className: `${baseClassName} ${styles.pinned}`,
    style,
    "data-pinned": true,
  };
}
