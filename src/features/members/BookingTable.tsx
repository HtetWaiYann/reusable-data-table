import type { ReactElement } from "react";
import {
  CHILD_EMPTY_CLASS,
  CHILD_TABLE_CARD_CLASS,
  CHILD_TABLE_CLASS,
} from "../common/childTable.ts";
import type { Booking } from "./types.ts";

// Built once: creating a formatter is slow.
const bookingDateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** Props of {@link BookingTable}. */
export interface BookingTableProps {
  bookings: Booking[];
  /** Member name, for the nested table's accessible name. */
  memberName: string;
}

/**
 * The child rows under a member: their upcoming bookings, or a message when there are none.
 *
 * @param props - See {@link BookingTableProps}.
 * @returns The booking table or the empty message.
 */
export function BookingTable({
  bookings,
  memberName,
}: BookingTableProps): ReactElement {
  if (bookings.length === 0) {
    return <p className={CHILD_EMPTY_CLASS}>No upcoming bookings.</p>;
  }
  return (
    <div className={CHILD_TABLE_CARD_CLASS}>
      <table
        className={CHILD_TABLE_CLASS}
        aria-label={`Upcoming bookings: ${memberName}`}
      >
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Class</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{bookingDateFormat.format(booking.date)}</td>
              <td>{booking.className}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
