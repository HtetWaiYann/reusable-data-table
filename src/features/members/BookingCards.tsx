import type { ReactElement } from "react";
import { CHILD_EMPTY_CLASS } from "../common/childTable.ts";
import type { Booking } from "./types.ts";

// Built once: creating a formatter is slow. Weekday and day number for the date tile,
// "Nov 9, 5:54 PM" for the detail line, all in the user's locale.
const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const dayFormat = new Intl.DateTimeFormat(undefined, { day: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** Props of {@link BookingCards}. */
export interface BookingCardsProps {
  bookings: Booking[];
  /** Member name, for the list's accessible name. */
  memberName: string;
}

/**
 * The child rows under a member, as cards instead of a nested table: a booking is one item with a
 * date and a class, not a row of comparable columns, so a card reads faster. Shows that
 * `renderChildren` can return any layout, not only tables.
 *
 * @param props - See {@link BookingCardsProps}.
 * @returns A list of booking cards, or a message when there are none.
 */
export function BookingCards({
  bookings,
  memberName,
}: BookingCardsProps): ReactElement {
  if (bookings.length === 0) {
    return <p className={CHILD_EMPTY_CLASS}>No upcoming bookings.</p>;
  }
  return (
    // A list, so screen readers announce "Upcoming bookings: Aye Aung, list, 3 items".
    <ul
      aria-label={`Upcoming bookings: ${memberName}`}
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
    >
      {bookings.map((booking) => (
        <li
          key={booking.id}
          className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3"
        >
          {/* Decorative: the <time> below says the same date in full. */}
          <span
            aria-hidden="true"
            className="flex size-12 flex-none flex-col items-center justify-center rounded-md bg-zinc-100"
          >
            <span className="text-xs font-medium text-zinc-500">
              {weekdayFormat.format(booking.date)}
            </span>
            <span className="text-lg leading-6 font-semibold tabular-nums">
              {dayFormat.format(booking.date)}
            </span>
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">
              {booking.className}
            </span>
            <time
              dateTime={booking.date.toISOString()}
              className="text-sm text-zinc-500 tabular-nums"
            >
              {dateTimeFormat.format(booking.date)}
            </time>
          </span>
        </li>
      ))}
    </ul>
  );
}
