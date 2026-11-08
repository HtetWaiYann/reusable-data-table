import type { ClassSession } from "./types.ts";

/** Headline figures for the timetable dashboard. */
export interface ClassSummary {
  classCount: number;
  cancelledCount: number;
  /** Bookings that hold a spot (not cancelled), in classes that still run. */
  activeBookings: number;
  /** Total spots in classes that still run. */
  capacity: number;
  checkedIn: number;
  noShows: number;
}

/**
 * Adds up the figures shown above the timetable. Cancelled classes count as classes but not as
 * bookings or spots: nobody can attend them, so they would make the fill rate look worse than it is.
 *
 * @param sessions - The classes in view (the whole week or one day).
 * @returns The totals; rates are worked out where they're shown.
 */
export function summarizeClasses(
  sessions: readonly ClassSession[],
): ClassSummary {
  const summary: ClassSummary = {
    classCount: sessions.length,
    cancelledCount: 0,
    activeBookings: 0,
    capacity: 0,
    checkedIn: 0,
    noShows: 0,
  };
  for (const session of sessions) {
    if (session.isCancelled) {
      summary.cancelledCount += 1;
      continue;
    }
    summary.capacity += session.capacity;
    for (const attendee of session.attendees) {
      if (attendee.bookingStatus === "Cancelled") {
        continue;
      }
      summary.activeBookings += 1;
      if (attendee.bookingStatus === "Checked-in") {
        summary.checkedIn += 1;
      }
      if (attendee.bookingStatus === "No-show") {
        summary.noShows += 1;
      }
    }
  }
  return summary;
}

/**
 * A share as a fraction, safe for an empty total.
 *
 * @param part - E.g. checked-in bookings.
 * @param total - E.g. all active bookings.
 * @returns `part / total`, or 0 when `total` is 0 (an empty day, not "NaN%").
 */
export function getRate(part: number, total: number): number {
  return total === 0 ? 0 : part / total;
}
