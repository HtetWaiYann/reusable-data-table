import { memo, type ReactElement } from "react";
import { getCellProps } from "./cellProps.ts";
import { ExpandedRow } from "./ExpandedRow.tsx";
import type { LazyChildrenEntry } from "./hooks/useLazyChildren.ts";
import type { ColumnDef, ExpansionConfig } from "./types.ts";
import { formatCellValue } from "./utils/cell.ts";
import styles from "./data-table.module.css";

/** Props of {@link TableRow}. */
export interface TableRowProps<TRow, TChild> {
  row: TRow;
  rowId: string;
  columns: ColumnDef<TRow>[];
  pinnedColumnId: string | null;
  /** Expansion config; when set, the row starts with a toggle cell. */
  expansion?: ExpansionConfig<TRow, TChild>;
  /** Prefix for the detail row's DOM id, unique per table. */
  detailIdPrefix: string;
  isExpanded: boolean;
  /** Opened at least once, so the detail row is mounted (and can animate closed). */
  isDetailMounted: boolean;
  lazyEntry: LazyChildrenEntry<TChild> | undefined;
  onToggle: (row: TRow, rowId: string) => void;
  onRetry: (row: TRow, rowId: string) => void;
}

function TableRowComponent<TRow, TChild>({
  row,
  rowId,
  columns,
  pinnedColumnId,
  expansion,
  detailIdPrefix,
  isExpanded,
  isDetailMounted,
  lazyEntry,
  onToggle,
  onRetry,
}: TableRowProps<TRow, TChild>): ReactElement {
  const detailId = `${detailIdPrefix}-${rowId}`;
  const canExpand = expansion ? (expansion.canExpand?.(row) ?? true) : false;

  return (
    <>
      <tr className={styles.row}>
        {expansion && (
          <td className={`${styles.cell} ${styles.toggleCell}`}>
            {canExpand && (
              <button
                type="button"
                className={styles.toggleButton}
                aria-label="Details"
                aria-expanded={isExpanded}
                // Only point at the detail row once it exists in the DOM.
                aria-controls={isDetailMounted ? detailId : undefined}
                onClick={() => onToggle(row, rowId)}
              >
                <span aria-hidden="true">▸</span>
              </button>
            )}
          </td>
        )}
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
      {expansion && isDetailMounted && (
        <ExpandedRow
          row={row}
          id={detailId}
          colSpan={columns.length + 1}
          isOpen={isExpanded}
          expansion={expansion}
          lazyEntry={lazyEntry}
          onRetry={() => onRetry(row, rowId)}
        />
      )}
    </>
  );
}

/**
 * One data row, plus its detail row once expanded. Memoized, so a re-render skips rows that
 * didn't change. Internal: not exported from the package.
 */
// memo() drops the generic, so we cast it back. Safe: memo doesn't change the props.
export const TableRow = memo(TableRowComponent) as typeof TableRowComponent;
