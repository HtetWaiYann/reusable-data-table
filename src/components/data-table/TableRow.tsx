import { memo, type ReactElement } from "react";
import type { ColumnDef } from "./types.ts";
import { formatCellValue } from "./utils/cell.ts";

/** Props of {@link TableRow}. */
export interface TableRowProps<TRow> {
  row: TRow;
  columns: ColumnDef<TRow>[];
}

function TableRowComponent<TRow>({
  row,
  columns,
}: TableRowProps<TRow>): ReactElement {
  return (
    <tr>
      {columns.map((column) => (
        <td key={column.id}>
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
