import { describe, expect, it } from "vitest";
import {
  clampPageIndex,
  getPageCount,
  getPageRows,
  getRowRange,
} from "./pagination.ts";

describe("getPageCount", () => {
  it("rounds up so a partial last page still counts", () => {
    expect(getPageCount(95, 20)).toBe(5);
  });

  it("doesn't add an extra page when rows fit exactly", () => {
    expect(getPageCount(100, 20)).toBe(5);
  });

  it("returns 1 page for empty data", () => {
    expect(getPageCount(0, 20)).toBe(1);
  });
});

describe("clampPageIndex", () => {
  it("keeps a valid index unchanged", () => {
    expect(clampPageIndex(2, 5)).toBe(2);
  });

  it("clamps to the last page when data shrinks below the current page", () => {
    expect(clampPageIndex(4, 2)).toBe(1);
  });

  it("clamps a negative index to the first page", () => {
    expect(clampPageIndex(-1, 5)).toBe(0);
  });

  it("rounds a fractional index down", () => {
    expect(clampPageIndex(2.5, 5)).toBe(2);
  });

  it("falls back to the first page for NaN and Infinity", () => {
    expect(clampPageIndex(NaN, 5)).toBe(0);
    expect(clampPageIndex(Infinity, 5)).toBe(0);
  });
});

describe("getPageRows", () => {
  const rows = ["a", "b", "c", "d", "e"];

  it("returns the first, middle and partial last page", () => {
    expect(getPageRows(rows, { pageIndex: 0, pageSize: 2 })).toEqual([
      "a",
      "b",
    ]);
    expect(getPageRows(rows, { pageIndex: 1, pageSize: 2 })).toEqual([
      "c",
      "d",
    ]);
    expect(getPageRows(rows, { pageIndex: 2, pageSize: 2 })).toEqual(["e"]);
  });

  it("returns a copy without mutating the input", () => {
    const page = getPageRows(rows, { pageIndex: 0, pageSize: 5 });

    expect(page).toEqual(rows);
    expect(page).not.toBe(rows);
  });
});

describe("getRowRange", () => {
  it("returns the 1-based range of a full page", () => {
    expect(getRowRange({ pageIndex: 1, pageSize: 20 }, 95)).toEqual({
      from: 21,
      to: 40,
    });
  });

  it("caps the end of the range on a partial last page", () => {
    expect(getRowRange({ pageIndex: 4, pageSize: 20 }, 95)).toEqual({
      from: 81,
      to: 95,
    });
  });

  it("returns 0–0 for empty data", () => {
    expect(getRowRange({ pageIndex: 0, pageSize: 20 }, 0)).toEqual({
      from: 0,
      to: 0,
    });
  });
});
