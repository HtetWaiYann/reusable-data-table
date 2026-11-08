import type { ReactElement, ReactNode } from "react";
import type { LazyChildrenEntry } from "./hooks/useLazyChildren.ts";
import type { ExpansionConfig } from "./types.ts";
import styles from "./data-table.module.css";

const LAZY_ERROR_MESSAGE = "Couldn't load the details.";
const SKELETON_LINE_COUNT = 3;

/** Props of {@link ExpandedRow}. */
export interface ExpandedRowProps<TRow, TChild> {
  row: TRow;
  /** DOM id, referenced by the toggle button's `aria-controls`. */
  id: string;
  /** Number of columns including the toggle column, so the cell spans the full width. */
  colSpan: number;
  isOpen: boolean;
  expansion: ExpansionConfig<TRow, TChild>;
  /** Lazy mode only: this row's cache entry. */
  lazyEntry: LazyChildrenEntry<TChild> | undefined;
  onRetry: () => void;
}

/**
 * The full-width row under an expanded row. Stays mounted after closing so the close animates.
 * Internal: not exported from the package.
 */
export function ExpandedRow<TRow, TChild>({
  row,
  id,
  colSpan,
  isOpen,
  expansion,
  lazyEntry,
  onRetry,
}: ExpandedRowProps<TRow, TChild>): ReactElement {
  function renderContent(): ReactNode {
    if (expansion.mode === "inline") {
      return expansion.renderChildren(expansion.getChildren(row), row);
    }
    if (lazyEntry?.status === "success") {
      return expansion.renderChildren(lazyEntry.children, row);
    }
    if (lazyEntry?.status === "error") {
      return (
        <>
          <p role="alert" className={styles.errorMessage}>
            {LAZY_ERROR_MESSAGE}
          </p>
          <button type="button" className={styles.button} onClick={onRetry}>
            Retry
          </button>
        </>
      );
    }
    // Loading (or about to start): placeholder lines instead of a spinner, like the table itself.
    return (
      <div aria-busy="true" aria-label="Loading details">
        {Array.from({ length: SKELETON_LINE_COUNT }, (_, index) => (
          <span key={index} className={styles.skeletonBar} />
        ))}
      </div>
    );
  }

  return (
    <tr id={id} className={styles.detailRow} data-open={isOpen}>
      <td colSpan={colSpan} className={styles.detailCell}>
        {/* grid-template-rows 0fr → 1fr animates to the content's natural height. */}
        <div className={styles.detailCollapse}>
          {/* inert while closed: out of Tab order and hidden from screen readers. */}
          <div className={styles.detailClip} inert={!isOpen}>
            <div className={styles.detailContent}>{renderContent()}</div>
          </div>
        </div>
      </td>
    </tr>
  );
}
