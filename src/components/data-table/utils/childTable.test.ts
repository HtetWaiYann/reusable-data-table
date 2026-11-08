import { describe, expect, it } from "vitest";
import {
  formatChildValue,
  getChildColumnKeys,
  humanizeKey,
  isRecord,
} from "./childTable.ts";

describe("isRecord", () => {
  it("accepts plain objects and rejects arrays, dates and primitives", () => {
    expect(isRecord({ a: 1 })).toBe(true);
    expect(isRecord([1])).toBe(false);
    expect(isRecord(new Date())).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord("a")).toBe(false);
  });
});

describe("getChildColumnKeys", () => {
  it("collects keys from every child in order of first appearance", () => {
    const children = [{ name: "A" }, { name: "B", note: "late" }];

    expect(getChildColumnKeys(children, [])).toEqual(["name", "note"]);
  });

  it("leaves out hidden keys", () => {
    expect(getChildColumnKeys([{ id: "1", name: "A" }], ["id"])).toEqual([
      "name",
    ]);
  });

  it("returns no keys when the children aren't objects", () => {
    expect(getChildColumnKeys(["a", "b"], [])).toEqual([]);
  });
});

describe("humanizeKey", () => {
  it("turns camelCase, snake_case and kebab-case into sentence case", () => {
    expect(humanizeKey("bookingStatus")).toBe("Booking status");
    expect(humanizeKey("created_at")).toBe("Created at");
    expect(humanizeKey("first-name")).toBe("First name");
    expect(humanizeKey("name")).toBe("Name");
  });
});

describe("formatChildValue", () => {
  it("shows missing values as blank", () => {
    expect(formatChildValue(null)).toBe("");
    expect(formatChildValue(undefined)).toBe("");
    expect(formatChildValue(Number.NaN)).toBe("");
    expect(formatChildValue(new Date("nope"))).toBe("");
  });

  it("formats booleans, dates and nested data", () => {
    const date = new Date(2026, 10, 9, 6, 0);

    expect(formatChildValue(true)).toBe("Yes");
    expect(formatChildValue(false)).toBe("No");
    expect(formatChildValue(date)).toBe(
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date),
    );
    expect(formatChildValue({ a: 1 })).toBe('{"a":1}');
    expect(formatChildValue(["x", "y"])).toBe('["x","y"]');
  });

  it("shows strings and numbers as they are", () => {
    expect(formatChildValue("Ella")).toBe("Ella");
    expect(formatChildValue(0)).toBe("0");
  });
});
