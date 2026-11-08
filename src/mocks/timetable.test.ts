import { describe, expect, it } from "vitest";
import {
  getAttendance,
  getClassStatus,
} from "../features/timetable/classStatus.ts";
import { classSessions, createClassSessions } from "./timetable.ts";

describe("createClassSessions", () => {
  it("returns the same sessions for the same seed", () => {
    expect(createClassSessions(10, 42)).toEqual(createClassSessions(10, 42));
  });

  it("never has more active bookings than the capacity", () => {
    for (const session of createClassSessions(200, 42)) {
      expect(getAttendance(session)).toBeLessThanOrEqual(session.capacity);
    }
  });

  it("cancels every booking on a cancelled class", () => {
    for (const session of createClassSessions(200, 42)) {
      if (session.isCancelled) {
        expect(getAttendance(session)).toBe(0);
      }
    }
  });

  it("includes every class status in the demo data", () => {
    const statuses = new Set(classSessions.map(getClassStatus));

    expect(statuses).toEqual(new Set(["Scheduled", "Full", "Cancelled"]));
  });
});
