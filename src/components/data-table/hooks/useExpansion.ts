import { useCallback, useState } from "react";

/** What {@link useExpansion} gives the table. */
export interface UseExpansionResult {
  /**
   * Row id → open. A row is in the map once it has been opened, and stays after closing,
   * so its detail row stays mounted and the close can animate.
   */
  expandedRows: ReadonlyMap<string, boolean>;
  /** Opens a closed row, closes an open one. Stable between renders. */
  toggle: (rowId: string) => void;
}

/**
 * Which rows are expanded, keyed by row id, so the right rows stay open after sorting or paging.
 *
 * @returns See {@link UseExpansionResult}.
 */
export function useExpansion(): UseExpansionResult {
  const [expandedRows, setExpandedRows] = useState<
    ReadonlyMap<string, boolean>
  >(() => new Map());

  // Functional update, so the callback needs no dependencies and memoized rows keep the same prop.
  const toggle = useCallback((rowId: string) => {
    setExpandedRows((previous) =>
      new Map(previous).set(rowId, previous.get(rowId) !== true),
    );
  }, []);

  return { expandedRows, toggle };
}
