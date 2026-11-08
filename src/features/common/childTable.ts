// Shared Tailwind classes for the custom child tables (attendees) and child empty messages. Arbitrary variants
// ([&_th]) style the cells from the table, so each <th>/<td> stays free of repeated classes.

/** The card around a child table: white on the detail row's gray, so it reads as nested. */
export const CHILD_TABLE_CARD_CLASS =
  "overflow-x-auto rounded-lg border border-zinc-200 bg-white";

/** The child table itself. */
export const CHILD_TABLE_CLASS =
  "w-full text-sm tabular-nums [&_td]:px-3 [&_td]:py-2 [&_td]:whitespace-nowrap [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-medium [&_th]:text-zinc-500 [&_tbody_tr]:border-t [&_tbody_tr]:border-zinc-200";

/** "No attendees yet." and similar empty messages. */
export const CHILD_EMPTY_CLASS = "py-1 text-sm text-zinc-500";
