import { useEffect, useMemo } from "react";
import type { ColumnDef, DataTableProps, SortState } from "../types.ts";
import { nextSort, sortRows } from "../utils/sorting.ts";
import { useControllableState } from "./useControllableState.ts";

/** Options for {@link useSorting}. Picked from the table props so the docs live in `types.ts`. */
export type UseSortingOptions<TRow> = Pick<
  DataTableProps<TRow>,
  "data" | "columns" | "sort" | "defaultSort" | "onSortChange" | "manualSorting"
>;

/** What {@link useSorting} gives the table. */
export interface UseSortingResult<TRow> {
  sort: SortState;
  /** Rows in display order. Same `data` array when nothing is sorted locally. */
  sortedRows: readonly TRow[];
  /** Cycles a column asc → desc → none. */
  toggleSort: (columnId: string) => void;
}

/**
 * Sort state plus the sorted rows. With `manualSorting` it only emits changes and shows `data` as given.
 *
 * Keep `columns` stable (outside the component or memoized), or rows get re-sorted on every render.
 *
 * @param options - See {@link UseSortingOptions}.
 * @returns See {@link UseSortingResult}.
 */
export function useSorting<TRow>({
  data,
  columns,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  manualSorting = false,
}: UseSortingOptions<TRow>): UseSortingResult<TRow> {
  const [sort, setSort] = useControllableState({
    value: sortProp,
    defaultValue: defaultSort,
    onChange: onSortChange,
    name: "sort",
  });

  const sortColumn = sort
    ? columns.find((column) => column.id === sort.columnId)
    : undefined;
  const getValue = sortColumn?.getValue;
  const direction = sort?.direction;

  // The server does the sorting in manual mode, so nothing to warn about there.
  const sortIssue = manualSorting ? null : describeSortIssue(sort, sortColumn);
  // Keyed on the message, not on columns: inline columns would re-warn on every render.
  useEffect(() => {
    if (import.meta.env.DEV && sortIssue) {
      console.warn(`DataTable: ${sortIssue}`);
    }
  }, [sortIssue]);

  const sortedRows = useMemo(() => {
    // Server mode, no sort, or an invalid sort: leave the order alone.
    if (manualSorting || !getValue || !direction) {
      return data;
    }
    return sortRows(data, getValue, direction);
  }, [data, getValue, direction, manualSorting]);

  // No useCallback: it changes with every sort anyway.
  function toggleSort(columnId: string): void {
    setSort(nextSort(sort, columnId));
  }

  return { sort, sortedRows, toggleSort };
}

/** Why the active sort can't be applied client-side, or `null` when it can. */
function describeSortIssue<TRow>(
  sort: SortState,
  column: ColumnDef<TRow> | undefined,
): string | null {
  if (!sort) {
    return null;
  }
  // e.g. a stale `?sort=` in the URL.
  if (!column) {
    return `sort column "${sort.columnId}" matches no column; rows are shown unsorted.`;
  }
  if (!column.getValue) {
    return `column "${column.id}" is sorted but has no getValue; rows are shown unsorted.`;
  }
  return null;
}
