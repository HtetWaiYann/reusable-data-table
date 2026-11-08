import type { ReactElement } from "react";
import type { Attendee } from "./types.ts";
import styles from "../common/childTable.module.css";

/** Props of {@link AttendeeTable}. */
export interface AttendeeTableProps {
  attendees: Attendee[];
  /** Class name, for the nested table's accessible name. */
  className: string;
}

/**
 * The child rows under a class: one row per attendee. A real nested table, so screen readers can
 * navigate it by row and column. Empty lists are ours to render (the DataTable leaves them to us).
 *
 * @param props - See {@link AttendeeTableProps}.
 * @returns The attendee table, or a "no attendees" message.
 */
export function AttendeeTable({
  attendees,
  className,
}: AttendeeTableProps): ReactElement {
  if (attendees.length === 0) {
    return <p className={styles.empty}>No attendees yet.</p>;
  }
  return (
    <table className={styles.childTable} aria-label={`Attendees: ${className}`}>
      <thead>
        <tr>
          <th scope="col">Customer</th>
          <th scope="col">Payment</th>
          <th scope="col">Booking status</th>
        </tr>
      </thead>
      <tbody>
        {attendees.map((attendee) => (
          <tr key={attendee.id}>
            <td>{attendee.name}</td>
            <td>{attendee.paymentType}</td>
            <td>
              <span
                className={styles.badge}
                data-status={attendee.bookingStatus}
              >
                {attendee.bookingStatus}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
