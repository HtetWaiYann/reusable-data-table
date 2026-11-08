import { describe, expect, it } from "vitest";
import { getRate, summarizeClasses } from "./summary.ts";
import type { Attendee, BookingStatus, ClassSession } from "./types.ts";

function attendee(bookingStatus: BookingStatus): Attendee {
  return {
    id: bookingStatus,
    name: "A",
    paymentType: "Package",
    bookingStatus,
  };
}

function session(
  overrides: Partial<ClassSession> & Pick<ClassSession, "attendees">,
): ClassSession {
  return {
    id: "c",
    name: "Yoga Flow",
    instructor: "Ella",
    startsAt: new Date(2026, 10, 9, 6),
    durationMinutes: 45,
    capacity: 10,
    isCancelled: false,
    ...overrides,
  };
}

describe("summarizeClasses", () => {
  it("counts bookings, check-ins and no-shows, ignoring cancelled bookings", () => {
    const summary = summarizeClasses([
      session({
        attendees: [
          attendee("Booked"),
          attendee("Checked-in"),
          attendee("No-show"),
          attendee("Cancelled"),
        ],
      }),
    ]);

    expect(summary).toEqual({
      classCount: 1,
      cancelledCount: 0,
      activeBookings: 3,
      capacity: 10,
      checkedIn: 1,
      noShows: 1,
    });
  });

  it("counts a cancelled class but not its spots or bookings", () => {
    const summary = summarizeClasses([
      session({ isCancelled: true, attendees: [attendee("Booked")] }),
    ]);

    expect(summary.classCount).toBe(1);
    expect(summary.cancelledCount).toBe(1);
    expect(summary.capacity).toBe(0);
    expect(summary.activeBookings).toBe(0);
  });
});

describe("getRate", () => {
  it("divides, and returns 0 for an empty total instead of NaN", () => {
    expect(getRate(1, 4)).toBe(0.25);
    expect(getRate(0, 0)).toBe(0);
  });
});
