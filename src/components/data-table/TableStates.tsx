import type { ReactElement, ReactNode } from "react";
import { AlertIcon } from "./icons.tsx";
import styles from "./data-table.module.css";

const DEFAULT_EMPTY_STATE = "No results.";

/** Props of {@link EmptyRow}. */
export interface EmptyRowProps {
  /** Number of columns, so the cell spans the full width. */
  colSpan: number;
  /** Custom content; plain text by default. */
  content?: ReactNode;
}

/**
 * Full-width row shown when there's nothing to display. Internal: not exported from the package.
 */
export function EmptyRow({ colSpan, content }: EmptyRowProps): ReactElement {
  return (
    <tr>
      <td colSpan={colSpan} className={styles.stateCell}>
        <div className={styles.stateContent}>
          {content ?? DEFAULT_EMPTY_STATE}
        </div>
      </td>
    </tr>
  );
}

/** Props of {@link ErrorRow}. */
export interface ErrorRowProps {
  /** Number of columns, so the cell spans the full width. */
  colSpan: number;
  /** User-facing message from the parent. */
  message: string;
  /** Shows a Retry button when given. */
  onRetry?: () => void;
}

/**
 * Full-width row with the error message and an optional Retry button. The header stays visible above it.
 * Internal: not exported from the package.
 */
export function ErrorRow({
  colSpan,
  message,
  onRetry,
}: ErrorRowProps): ReactElement {
  return (
    <tr>
      <td colSpan={colSpan} className={styles.stateCell}>
        <div className={styles.stateContent}>
          <span className={styles.stateIcon}>
            <AlertIcon />
          </span>
          {/* role="alert" so screen readers announce the error without the user having to find it. */}
          <p role="alert" className={styles.errorMessage}>
            {message}
          </p>
          {onRetry && (
            <button type="button" className={styles.button} onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
