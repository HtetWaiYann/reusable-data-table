import { describe, expect, it } from "vitest";
import { classSessions } from "../../mocks/timetable.ts";
import { filterBySearch } from "./search.ts";

describe("filterBySearch", () => {
  it("returns the same array for an empty or blank query", () => {
    expect(filterBySearch(classSessions, "")).toBe(classSessions);
    expect(filterBySearch(classSessions, "   ")).toBe(classSessions);
  });

  it("matches the class name or the instructor, ignoring case", () => {
    const byName = filterBySearch(classSessions, "  YOGA ");
    const instructor = classSessions[0].instructor;
    const byInstructor = filterBySearch(
      classSessions,
      instructor.toUpperCase(),
    );

    expect(byName.length).toBeGreaterThan(0);
    expect(byName.every((session) => /yoga/i.test(session.name))).toBe(true);
    expect(
      byInstructor.every(
        (session) =>
          session.instructor === instructor ||
          session.name.toLowerCase().includes(instructor.toLowerCase()),
      ),
    ).toBe(true);
  });

  it("returns nothing when nothing matches", () => {
    expect(filterBySearch(classSessions, "zzz")).toEqual([]);
  });
});
