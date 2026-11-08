import { describe, expect, it } from "vitest";
import type { ColumnDef } from "../types.ts";
import { describePinningIssue, getPinnedColumnId } from "./pinning.ts";

type Column = ColumnDef<unknown>;

describe("getPinnedColumnId", () => {
  it("returns null when nothing is pinned", () => {
    expect(getPinnedColumnId<unknown>([{ id: "a", header: "A" }])).toBeNull();
  });

  it("pins a column anywhere, not just the first", () => {
    const columns: Column[] = [
      { id: "a", header: "A" },
      { id: "b", header: "B" },
      { id: "c", header: "C", pinned: true },
    ];

    expect(getPinnedColumnId(columns)).toBe("c");
  });

  it("uses the first pinned column when several are pinned", () => {
    const columns: Column[] = [
      { id: "a", header: "A" },
      { id: "b", header: "B", pinned: true },
      { id: "c", header: "C", pinned: true },
    ];

    expect(getPinnedColumnId(columns)).toBe("b");
  });
});

describe("describePinningIssue", () => {
  it("is null for zero or one pinned column", () => {
    expect(
      describePinningIssue<unknown>([{ id: "a", header: "A" }]),
    ).toBeNull();
    expect(
      describePinningIssue<unknown>([{ id: "a", header: "A", pinned: true }]),
    ).toBeNull();
  });

  it("names the pinned and the ignored columns", () => {
    const columns: Column[] = [
      { id: "a", header: "A", pinned: true },
      { id: "b", header: "B", pinned: true },
      { id: "c", header: "C", pinned: true },
    ];

    expect(describePinningIssue(columns)).toBe(
      'only one column can be pinned; pinning "a" and ignoring "b", "c".',
    );
  });
});
