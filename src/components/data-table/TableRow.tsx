import { memo, type ReactElement } from "react";
import { getCellProps } from "./cellProps.ts";
import type { ColumnDef } from "./types.ts";
import { formatCellValue } from "./utils/cell.ts";
import styles from "./data-table.module.css";

/** Props of {@link TableRow}. */
export interface TableRowProps<TRow> {
  row: TRow;
  columns: ColumnDef<TRow>[];
  pinnedColumnId: string | null;
}

function TableRowComponent<TRow>({
  row,
  columns,
  pinnedColumnId,
}: TableRowProps<TRow>): ReactElement {
  return (
    <tr className={styles.row}>
      {columns.map((column) => (
        <td
          key={column.id}
          {...getCellProps(column, pinnedColumnId, styles.cell)}
        >
          {column.renderCell
            ? column.renderCell(row)
            : formatCellValue(column.getValue?.(row))}
        </td>
      ))}
    </tr>
  );
}

/**
 * One data row. Memoized, so a re-render skips rows that didn't change.
 * Internal: not exported from the package.
 */
// memo() drops the generic, so we cast it back. Safe: memo doesn't change the props.
export const TableRow = memo(TableRowComponent) as typeof TableRowComponent;
