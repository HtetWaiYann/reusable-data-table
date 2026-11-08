import { describe, expect, it } from "vitest";
import { getAttendance, getClassStatus } from "./classStatus.ts";
import type { Attendee, BookingStatus, ClassSession } from "./types.ts";

function attendee(bookingStatus: BookingStatus): Attendee {
  return {
    id: bookingStatus,
    name: "A",
    paymentType: "Package",
    bookingStatus,
  };
}

function session(overrides: Partial<ClassSession>): ClassSession {
  return {
    id: "c1",
    name: "Yoga Flow",
    instructor: "John Doe",
    startsAt: new Date(2026, 10, 9, 10),
    durationMinutes: 60,
    capacity: 2,
    isCancelled: false,
    attendees: [],
    ...overrides,
  };
}

describe("getAttendance", () => {
  it("counts every booking except cancelled ones", () => {
    const attendees = [
      attendee("Booked"),
      attendee("Checked-in"),
      attendee("No-show"),
      attendee("Cancelled"),
    ];

    expect(getAttendance(session({ attendees }))).toBe(3);
  });
});

describe("getClassStatus", () => {
  it("is Scheduled while there are free spots", () => {
    expect(getClassStatus(session({ attendees: [attendee("Booked")] }))).toBe(
      "Scheduled",
    );
  });

  it("is Full at capacity, ignoring cancelled bookings", () => {
    const full = [attendee("Booked"), attendee("Checked-in")];
    const notFull = [attendee("Booked"), attendee("Cancelled")];

    expect(getClassStatus(session({ attendees: full }))).toBe("Full");
    expect(getClassStatus(session({ attendees: notFull }))).toBe("Scheduled");
  });

  it("is Cancelled when the studio cancelled the class, even if full", () => {
    const full = [attendee("Booked"), attendee("Booked")];

    expect(
      getClassStatus(session({ attendees: full, isCancelled: true })),
    ).toBe("Cancelled");
  });
});
