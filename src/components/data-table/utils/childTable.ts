// Pure helpers for the built-in child table, which turns plain child data (JSON) into columns.

// Built once: creating a formatter is slow. "Nov 9, 2026, 5:54 PM" in the user's locale; no seconds.
const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * True for a plain object whose keys can become columns. Arrays and Dates are objects too, but
 * they're values, not rows.
 *
 * @param value - Anything.
 * @returns Whether `value` is a key–value object.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

/**
 * The columns of the built-in child table: every key seen across all children, in order of first
 * appearance. Collecting from every child, not just the first, means an optional field that only
 * some children have still gets a column (the others show a blank cell).
 *
 * @param children - The child rows.
 * @param hiddenKeys - Keys to leave out.
 * @returns Column keys; empty when no child is an object.
 */
export function getChildColumnKeys(
  children: readonly unknown[],
  hiddenKeys: readonly string[],
): string[] {
  // A Set keeps insertion order and drops duplicates.
  const keys = new Set<string>();
  for (const child of children) {
    if (!isRecord(child)) {
      continue;
    }
    for (const key of Object.keys(child)) {
      if (!hiddenKeys.includes(key)) {
        keys.add(key);
      }
    }
  }
  return [...keys];
}

/**
 * Turns a data key into a header label: `bookingStatus` → "Booking status", `created_at` → "Created at".
 *
 * @param key - A camelCase, snake_case or kebab-case key.
 * @returns A sentence-case label.
 */
export function humanizeKey(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Text for one cell of the built-in child table. The design is fixed, so this picks one sensible
 * format per type; anything else needs `renderChildren`.
 *
 * @param value - A child field's value.
 * @returns The text to show; "" for missing values.
 */
export function formatChildValue(value: unknown): string {
  // Blank cell instead of the words "null", "undefined" or "NaN".
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  // String(date) is "Mon Nov 09 2026 06:00:00 GMT+…"; the user's locale is far easier to read.
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : dateFormat.format(value);
  }
  // Nested data stays readable instead of "[object Object]".
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
