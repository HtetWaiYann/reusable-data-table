import { describe, expect, it } from "vitest";
import type { ColumnDef } from "../types.ts";
import { describePage, describeSort } from "./announcements.ts";

const columns: ColumnDef<{ name: string }>[] = [{ id: "name", header: "Name" }];

describe("describeSort", () => {
  it("names the column and the direction", () => {
    expect(describeSort({ columnId: "name", direction: "asc" }, columns)).toBe(
      "Sorted by Name, ascending.",
    );
    expect(describeSort({ columnId: "name", direction: "desc" }, columns)).toBe(
      "Sorted by Name, descending.",
    );
  });

  it("says when the sort is cleared", () => {
    expect(describeSort(null, columns)).toBe("Sort cleared.");
  });

  it("says nothing for an unknown column", () => {
    expect(describeSort({ columnId: "age", direction: "asc" }, columns)).toBe(
      "",
    );
  });
});

describe("describePage", () => {
  it("counts pages from 1", () => {
    expect(describePage(1, 5)).toBe("Page 2 of 5.");
  });
});
