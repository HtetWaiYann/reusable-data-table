import type { ClassSession, ClassStatus } from "./types.ts";

/**
 * Bookings that take a spot: everything except cancelled bookings (a no-show still held the spot).
 *
 * @param session - The class.
 * @returns The number of active bookings.
 */
export function getAttendance(session: ClassSession): number {
  return session.attendees.filter(
    (attendee) => attendee.bookingStatus !== "Cancelled",
  ).length;
}

/**
 * The class status, derived so it can never disagree with the bookings.
 *
 * @param session - The class.
 * @returns "Cancelled" if the studio cancelled it, "Full" at capacity, else "Scheduled".
 */
export function getClassStatus(session: ClassSession): ClassStatus {
  if (session.isCancelled) {
    return "Cancelled";
  }
  if (getAttendance(session) >= session.capacity) {
    return "Full";
  }
  return "Scheduled";
}
