import type { ClassSession } from "./types.ts";

/** The timetable's day filter: the whole week or one weekday. */
export type DayFilter =
  "all" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** In display order, Monday first, as studios plan their week. */
// label: short, for the filter buttons. name: for sentences, e.g. "Classes on Monday".
export const DAY_FILTERS: readonly {
  value: DayFilter;
  label: string;
  name: string;
}[] = [
  { value: "all", label: "All week", name: "this week" },
  { value: "mon", label: "Mon", name: "Monday" },
  { value: "tue", label: "Tue", name: "Tuesday" },
  { value: "wed", label: "Wed", name: "Wednesday" },
  { value: "thu", label: "Thu", name: "Thursday" },
  { value: "fri", label: "Fri", name: "Friday" },
  { value: "sat", label: "Sat", name: "Saturday" },
  { value: "sun", label: "Sun", name: "Sunday" },
];

// Date.getDay() numbers the days from Sunday = 0.
const DAY_NUMBERS: Record<Exclude<DayFilter, "all">, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

/**
 * Reads the day filter from untrusted input (the URL). Anything unknown means the whole week.
 *
 * @param value - Raw value, e.g. `searchParams.get("day")`.
 * @returns A valid filter.
 */
export function parseDayFilter(value: string | null): DayFilter {
  return DAY_FILTERS.find((day) => day.value === value)?.value ?? "all";
}

/**
 * Keeps the classes on the chosen day.
 *
 * @param sessions - The week's classes.
 * @param day - The filter.
 * @returns The same array for "all" (so memoized work downstream is reused), else a filtered copy.
 */
export function filterByDay(
  sessions: ClassSession[],
  day: DayFilter,
): ClassSession[] {
  if (day === "all") {
    return sessions;
  }
  return sessions.filter(
    (session) => session.startsAt.getDay() === DAY_NUMBERS[day],
  );
}
