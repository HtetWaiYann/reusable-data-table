import type { ReactElement } from "react";
import {
  CHILD_EMPTY_CLASS,
  CHILD_TABLE_CARD_CLASS,
  CHILD_TABLE_CLASS,
} from "../common/childTable.ts";
import { StatusBadge, type BadgeTone } from "../common/StatusBadge.tsx";
import type { Attendee, BookingStatus } from "./types.ts";

const BOOKING_STATUS_TONE: Record<BookingStatus, BadgeTone> = {
  Booked: "neutral",
  "Checked-in": "success",
  Cancelled: "danger",
  "No-show": "danger",
};

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
    return <p className={CHILD_EMPTY_CLASS}>No attendees yet.</p>;
  }
  return (
    <div className={CHILD_TABLE_CARD_CLASS}>
      <table
        className={CHILD_TABLE_CLASS}
        aria-label={`Attendees: ${className}`}
      >
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
                <StatusBadge
                  label={attendee.bookingStatus}
                  tone={BOOKING_STATUS_TONE[attendee.bookingStatus]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
