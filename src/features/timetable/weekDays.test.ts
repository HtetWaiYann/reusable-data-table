import { describe, expect, it } from "vitest";
import { classSessions } from "../../mocks/timetable.ts";
import { filterByDay, parseDayFilter } from "./weekDays.ts";

describe("parseDayFilter", () => {
  it("accepts known days and falls back to the whole week", () => {
    expect(parseDayFilter("tue")).toBe("tue");
    expect(parseDayFilter(null)).toBe("all");
    expect(parseDayFilter("<script>")).toBe("all");
  });
});

describe("filterByDay", () => {
  it("returns the same array for the whole week", () => {
    expect(filterByDay(classSessions, "all")).toBe(classSessions);
  });

  it("keeps only the chosen weekday", () => {
    const mondays = filterByDay(classSessions, "mon");

    expect(mondays.length).toBeGreaterThan(0);
    expect(mondays.every((session) => session.startsAt.getDay() === 1)).toBe(
      true,
    );
  });
});
