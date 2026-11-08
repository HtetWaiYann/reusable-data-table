import { describe, expect, it } from "vitest";
import { createMembers, getMembers } from "./members.ts";

describe("members mock", () => {
  it("returns the same members for the same seed", () => {
    expect(createMembers(10, 7)).toEqual(createMembers(10, 7));
  });

  it("returns the same array for the same size, so React sees stable data", () => {
    expect(getMembers(20)).toBe(getMembers(20));
  });

  it("keeps each member's bookings in date order", () => {
    for (const member of createMembers(50, 7)) {
      const times = member.bookings.map((booking) => booking.date.getTime());
      expect(times).toEqual(times.toSorted((a, b) => a - b));
    }
  });
});
