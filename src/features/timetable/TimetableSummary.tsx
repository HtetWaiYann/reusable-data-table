import type { ReactElement } from "react";
import { getRate, type ClassSummary } from "./summary.ts";

// Built once: creating a formatter is slow. "1,234" and "54%" in the user's locale.
const countFormat = new Intl.NumberFormat();
const percentFormat = new Intl.NumberFormat(undefined, {
  style: "percent",
  maximumFractionDigits: 0,
});

/** One figure: a label, a big number and one line of context. */
interface Figure {
  label: string;
  value: number;
  detail: string;
}

function getFigures(summary: ClassSummary): Figure[] {
  const { activeBookings } = summary;
  return [
    {
      label: "Classes",
      value: summary.classCount,
      detail: `${countFormat.format(summary.cancelledCount)} cancelled`,
    },
    {
      label: "Bookings",
      value: activeBookings,
      detail: `of ${countFormat.format(summary.capacity)} spots · ${percentFormat.format(getRate(activeBookings, summary.capacity))} full`,
    },
    {
      label: "Checked in",
      value: summary.checkedIn,
      detail: `${percentFormat.format(getRate(summary.checkedIn, activeBookings))} of bookings`,
    },
    {
      label: "No-shows",
      value: summary.noShows,
      detail: `${percentFormat.format(getRate(summary.noShows, activeBookings))} of bookings`,
    },
  ];
}

/** Props of {@link TimetableSummary}. */
export interface TimetableSummaryProps {
  summary: ClassSummary;
  /** Shows placeholders instead of numbers, like the table's skeleton rows. */
  isLoading: boolean;
  /** Hides the numbers (they'd read as real zeros) when the data failed to load. */
  hasError: boolean;
}

/**
 * The headline figures above the timetable. A description list, so screen readers pair each
 * label with its number ("Bookings, 412").
 *
 * @param props - See {@link TimetableSummaryProps}.
 * @returns Four figures in a responsive grid.
 */
export function TimetableSummary({
  summary,
  isLoading,
  hasError,
}: TimetableSummaryProps): ReactElement {
  return (
    <dl aria-busy={isLoading} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {getFigures(summary).map((figure) => (
        <div
          key={figure.label}
          className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4 shadow-xs"
        >
          <dt className="text-sm font-medium text-zinc-500">{figure.label}</dt>
          {isLoading ? (
            // Same height as the number and the detail line, so nothing moves when data arrives.
            <dd className="flex flex-col gap-1" aria-hidden="true">
              <span className="my-1 block h-7 w-16 animate-pulse rounded-md bg-zinc-100 motion-reduce:animate-none" />
              <span className="my-0.5 block h-4 w-28 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
            </dd>
          ) : (
            <dd className="flex flex-col gap-1">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {hasError ? "—" : countFormat.format(figure.value)}
              </span>
              <span className="text-sm text-zinc-500 tabular-nums">
                {hasError ? "Not available" : figure.detail}
              </span>
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
