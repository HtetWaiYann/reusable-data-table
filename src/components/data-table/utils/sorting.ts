import type { SortDirection, SortState, SortValue } from "../types.ts";

// We only built the collator once since it is slow and sorting calls it a lot.
// numeric: "Room 2" before "Room 10". base: "anna", "Anna" and "Ánna" are equal.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

/**
 * Returns the sort after a header click: new column → asc → desc → none.
 *
 * @param current - The active sort, or `null`.
 * @param columnId - The clicked column.
 * @returns The next sort state.
 */
export function nextSort(current: SortState, columnId: string): SortState {
  if (current?.columnId !== columnId) {
    return { columnId, direction: "asc" };
  }
  if (current.direction === "asc") {
    return { columnId, direction: "desc" };
  }
  return null;
}

/** Nothing to sort by. NaN and invalid dates count too, since they compare false with everything. */
function isEmpty(value: SortValue): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "number") {
    return Number.isNaN(value);
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime());
  }
  return false;
}

/** Returns -1, 0 or 1. Not `a - b`, because `Infinity - Infinity` is NaN. */
function compareNumbers(a: number, b: number): number {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

/** Ascending comparison of two non-empty values. */
function compareNonEmpty(a: SortValue, b: SortValue): number {
  if (typeof a === "string" && typeof b === "string") {
    return collator.compare(a, b);
  }
  if (typeof a === "number" && typeof b === "number") {
    return compareNumbers(a, b);
  }
  if (a instanceof Date && b instanceof Date) {
    return compareNumbers(a.getTime(), b.getTime());
  }
  if (typeof a === "boolean" && typeof b === "boolean") {
    return compareNumbers(Number(a), Number(b)); // false (0) before true (1)
  }
  // Mixed types (bad data): compare as text so the order is still predictable.
  return collator.compare(String(a), String(b));
}

/**
 * Compares two values for sorting. Empty values always go last, in both directions.
 *
 * @param a - First value.
 * @param b - Second value.
 * @param direction - Sort direction.
 * @returns Negative if `a` comes first, positive if `b` does, 0 if equal.
 */
export function compareValues(
  a: SortValue,
  b: SortValue,
  direction: SortDirection,
): number {
  // Before the direction flip, or "desc" would put empty values on top.
  const isAEmpty = isEmpty(a);
  const isBEmpty = isEmpty(b);
  if (isAEmpty && isBEmpty) {
    return 0;
  }
  if (isAEmpty) {
    return 1;
  }
  if (isBEmpty) {
    return -1;
  }

  const result = compareNonEmpty(a, b);
  return direction === "asc" ? result : -result;
}

/**
 * Returns a sorted copy of `rows`. Stable, so equal rows keep their order.
 *
 * @param rows - Rows to sort.
 * @param getValue - Reads the value to sort by.
 * @param direction - Sort direction.
 * @returns A new, sorted array.
 */
export function sortRows<TRow>(
  rows: readonly TRow[],
  getValue: (row: TRow) => SortValue,
  direction: SortDirection,
): TRow[] {
  // TODO(perf): getValue runs O(n log n) times. Pre-read values if profiling ever shows it.
  return rows.toSorted((a, b) =>
    compareValues(getValue(a), getValue(b), direction),
  );
}
