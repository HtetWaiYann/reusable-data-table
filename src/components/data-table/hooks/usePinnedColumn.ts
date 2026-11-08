import { useEffect } from "react";
import type { ColumnDef } from "../types.ts";
import { describePinningIssue, getPinnedColumnId } from "../utils/pinning.ts";

/**
 * The id of the pinned column, plus a dev warning when more than one is marked `pinned`.
 *
 * @param columns - Columns in display order.
 * @returns The pinned column's id, or `null`.
 */
export function usePinnedColumn<TRow>(
  columns: readonly ColumnDef<TRow>[],
): string | null {
  const issue = describePinningIssue(columns);
  useEffect(() => {
    if (import.meta.env.DEV && issue) {
      console.warn(`DataTable: ${issue}`);
    }
  }, [issue]);

  // A string, so TableRow's memo compares it by value; no useMemo needed.
  return getPinnedColumnId(columns);
}
