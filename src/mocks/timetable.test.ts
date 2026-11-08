import { describe, expect, it } from "vitest";
import { createClassSessions } from "./timetable.ts";

describe("createClassSessions", () => {
  it("returns the same sessions for the same seed", () => {
    expect(createClassSessions(10, 42)).toEqual(createClassSessions(10, 42));
  });

  it("never books more spots than the capacity", () => {
    for (const session of createClassSessions(200, 42)) {
      expect(session.booked).toBeLessThanOrEqual(session.capacity);
    }
  });
});
