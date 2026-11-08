import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useMemo, type ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DataTable,
  type ExpansionConfig,
} from "../components/data-table/index.ts";
import { SegmentedControl } from "../features/common/SegmentedControl.tsx";
import { useTableData } from "../features/showcase/useTableData.ts";
import {
  DEFAULT_TIMETABLE_SORT,
  inlineAttendeesExpansion,
  renderAttendees,
  timetableColumns,
} from "../features/timetable/columns.tsx";
import { filterBySearch } from "../features/timetable/search.ts";
import { summarizeClasses } from "../features/timetable/summary.ts";
import { TimetableSummary } from "../features/timetable/TimetableSummary.tsx";
import type { Attendee, ClassSession } from "../features/timetable/types.ts";
import {
  DAY_FILTERS,
  filterByDay,
  parseDayFilter,
  type DayFilter,
} from "../features/timetable/weekDays.ts";
import { classSessions } from "../mocks/timetable.ts";

// The production setup: attendees arrive with each class and render with status badges.
// Module level, so it's the same object on every render.
const timetableExpansion: ExpansionConfig<ClassSession, Attendee> = {
  ...inlineAttendeesExpansion,
  renderChildren: renderAttendees,
};

// "Nov 9 – 15" in the user's locale. Built once: creating a formatter is slow.
const weekRangeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** The first and last class of the loaded week, or null before data arrives. */
function getWeekRange(sessions: readonly ClassSession[]): string | null {
  if (sessions.length === 0) {
    return null;
  }
  const times = sessions.map((session) => session.startsAt.getTime());
  return weekRangeFormat.formatRange(Math.min(...times), Math.max(...times));
}

/**
 * Route "/": the studio's class timetable as a dashboard. Headline figures for the chosen day or
 * week, a day filter (kept in the URL as `?day=`), and the table with attendees as child rows.
 * Every other table setup lives on /demo.
 *
 * @returns The page content.
 */
export default function TimetablePage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const day = parseDayFilter(searchParams.get("day"));
  // Free text, so nothing to validate: it's only ever compared as a substring, never rendered as HTML.
  const query = searchParams.get("q") ?? "";

  const { data, ...tableProps } = useTableData({
    rows: classSessions,
    columns: timetableColumns,
    dataMode: "client",
    scenario: "normal",
    defaultSort: DEFAULT_TIMETABLE_SORT,
    errorMessage: "We couldn't load the timetable. Please try again.",
  });

  // Derived, not stored: the figures and rows always match the filters and the loaded data.
  const visibleSessions = useMemo(
    () => filterBySearch(filterByDay(data, day), query),
    [data, day, query],
  );
  const summary = useMemo(
    () => summarizeClasses(visibleSessions),
    [visibleSessions],
  );
  const weekRange = useMemo(() => getWeekRange(data), [data]);
  const dayName = DAY_FILTERS.find((filter) => filter.value === day)?.name;

  // Changes one URL param and keeps the other. Defaults ("all", "") stay out of the URL.
  // replace for typing, so every keystroke doesn't add a Back-button step.
  function setParam(name: "day" | "q", value: string, replace: boolean): void {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === "" || value === "all") {
          next.delete(name);
        } else {
          next.set(name, value);
        }
        return next;
      },
      { replace },
    );
  }

  function handleDayChange(nextDay: DayFilter): void {
    setParam("day", nextDay, false);
  }

  function getEmptyState(): string {
    if (query.trim() !== "") {
      return `No classes match "${query.trim()}".`;
    }
    return day === "all"
      ? "No classes this week."
      : `No classes on ${dayName}.`;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        {/* Fixed height: the range appears after loading without pushing the page down. */}
        <p className="h-5 text-sm font-medium text-zinc-500">{weekRange}</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Class timetable
        </h1>
        <p className="text-pretty text-zinc-600">
          Every class this week with its bookings. Expand a class to see who
          booked, how they paid and whether they checked in.
        </p>
      </header>

      <TimetableSummary
        summary={summary}
        isLoading={tableProps.isLoading}
        hasError={tableProps.error !== null}
      />

      <section className="flex flex-col gap-4" aria-label="Timetable">
        {/* Filters on one line: day on the left, search pushed right; they stack on narrow screens. */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SegmentedControl
            legend="Day"
            name="day"
            value={day}
            choices={DAY_FILTERS}
            onChange={handleDayChange}
          />
          <div className="relative w-full sm:w-72">
            <label htmlFor="timetable-search" className="sr-only">
              Search classes
            </label>
            <MagnifyingGlassIcon
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            {/* type="search": the browser adds a clear button and Esc clears it. */}
            <input
              id="timetable-search"
              type="search"
              value={query}
              onChange={(event) => setParam("q", event.target.value, true)}
              placeholder="Search class or instructor"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white pr-3 pl-9 text-sm shadow-xs transition-colors duration-200 ease-out-soft placeholder:text-zinc-400 hover:border-zinc-300 focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent/20"
            />
          </div>
        </div>
        {/* Remount when a filter changes: the new results start on page 1 with no rows left open. */}
        <DataTable
          key={`${day}:${query}`}
          caption={
            day === "all" ? "Classes this week" : `Classes on ${dayName}`
          }
          data={visibleSessions}
          getRowId={(row) => row.id}
          columns={timetableColumns}
          expansion={timetableExpansion}
          emptyState={getEmptyState()}
          {...tableProps}
        />
      </section>
    </div>
  );
}
