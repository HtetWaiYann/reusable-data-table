import type { ClassSession } from "./types.ts";

/**
 * Keeps the classes whose name or instructor contains the query, ignoring case and surrounding
 * spaces. A plain substring match: with ~50 classes a week there's no need for fuzzy search.
 *
 * @param sessions - The classes to search.
 * @param query - What the user typed.
 * @returns The same array for an empty query (so memoized work downstream is reused), else the matches.
 */
export function filterBySearch(
  sessions: ClassSession[],
  query: string,
): ClassSession[] {
  const needle = query.trim().toLocaleLowerCase();
  if (needle === "") {
    return sessions;
  }
  return sessions.filter(
    (session) =>
      session.name.toLocaleLowerCase().includes(needle) ||
      session.instructor.toLocaleLowerCase().includes(needle),
  );
}
