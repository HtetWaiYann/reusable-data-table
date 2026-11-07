import { describe, expect, it } from "vitest";
import type { SortDirection, SortValue } from "../types.ts";
import { compareValues, nextSort, sortRows } from "./sorting.ts";

/** Sorts plain values with compareValues, so tests read as input → expected order. */
function sortValues(
  values: SortValue[],
  direction: SortDirection,
): SortValue[] {
  return values.toSorted((a, b) => compareValues(a, b, direction));
}

describe("nextSort", () => {
  it("cycles asc → desc → none on repeated clicks of the same column", () => {
    const asc = nextSort(null, "time");
    expect(asc).toEqual({ columnId: "time", direction: "asc" });

    const desc = nextSort(asc, "time");
    expect(desc).toEqual({ columnId: "time", direction: "desc" });

    expect(nextSort(desc, "time")).toBeNull();
  });

  it("starts a different column at asc, whatever the current direction", () => {
    expect(nextSort({ columnId: "time", direction: "desc" }, "name")).toEqual({
      columnId: "name",
      direction: "asc",
    });
  });
});

describe("compareValues", () => {
  it("sorts numbers inside strings by value", () => {
    expect(sortValues(["Room 10", "room 2", "Room 1"], "asc")).toEqual([
      "Room 1",
      "room 2",
      "Room 10",
    ]);
  });

  it("treats strings that differ only in case or accents as equal", () => {
    expect(compareValues("anna", "Ánna", "asc")).toBe(0);
  });

  it("sorts numbers in both directions", () => {
    expect(sortValues([3, -1, 10], "asc")).toEqual([-1, 3, 10]);
    expect(sortValues([3, -1, 10], "desc")).toEqual([10, 3, -1]);
  });

  it("treats equal infinities as equal instead of returning NaN", () => {
    expect(compareValues(Infinity, Infinity, "asc")).toBe(0);
  });

  it("sorts dates by time", () => {
    const jan = new Date(2026, 0, 1);
    const mar = new Date(2026, 2, 1);
    expect(sortValues([mar, jan], "asc")).toEqual([jan, mar]);
    expect(sortValues([jan, mar], "desc")).toEqual([mar, jan]);
  });

  it("sorts false before true", () => {
    expect(sortValues([true, false], "asc")).toEqual([false, true]);
  });

  it("keeps empty values last in both directions", () => {
    // Uses getValue so the comparator really sees `undefined`. Sorting a raw array with an `undefined`
    // element would skip the comparator: JS always moves undefined elements to the end by itself.
    const rows = [null, 2, undefined, NaN, 1].map((value, index) => ({
      id: String(index),
      value,
    }));
    const getRowValue = (row: { value: SortValue }): SortValue => row.value;

    const asc = sortRows(rows, getRowValue, "asc").map((row) => row.value);
    const desc = sortRows(rows, getRowValue, "desc").map((row) => row.value);

    // Empty values tie with each other, so they keep their input order: null, undefined, NaN.
    expect(asc).toEqual([1, 2, null, undefined, NaN]);
    expect(desc).toEqual([2, 1, null, undefined, NaN]);
  });

  it("keeps invalid dates last in both directions", () => {
    const invalid = new Date("not a date");
    const valid = new Date(2026, 0, 1);
    expect(sortValues([invalid, valid], "asc")).toEqual([valid, invalid]);
    expect(sortValues([invalid, valid], "desc")).toEqual([valid, invalid]);
  });

  it("orders mixed types predictably by comparing them as text", () => {
    expect(sortValues(["b", 1, "a"], "asc")).toEqual([1, "a", "b"]);
  });
});

describe("sortRows", () => {
  const getValue = (row: { id: string; value: number }): number => row.value;

  it("returns a sorted copy without mutating the input", () => {
    const rows = [
      { id: "a", value: 2 },
      { id: "b", value: 1 },
    ];
    const original = [...rows];

    const sorted = sortRows(rows, getValue, "asc");

    expect(sorted.map((row) => row.id)).toEqual(["b", "a"]);
    expect(rows).toEqual(original);
    expect(sorted).not.toBe(rows);
  });

  it("keeps the original order of rows with equal values in both directions", () => {
    const rows = [
      { id: "a", value: 1 },
      { id: "b", value: 0 },
      { id: "c", value: 1 },
    ];
    expect(sortRows(rows, getValue, "asc").map((row) => row.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(sortRows(rows, getValue, "desc").map((row) => row.id)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });
});
