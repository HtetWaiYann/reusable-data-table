import type { ReactElement } from "react";
import styles from "../common/childTable.module.css";
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
    return <p className={styles.empty}>No upcoming bookings.</p>;
  }
  return (
    <table
      className={styles.childTable}
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
  );
}
