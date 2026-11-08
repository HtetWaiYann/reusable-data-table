import { describe, expect, it } from "vitest";
import { formatCellValue } from "./cell.ts";

describe("formatCellValue", () => {
  it("shows strings, numbers and booleans as text", () => {
    expect(formatCellValue("Yoga")).toBe("Yoga");
    expect(formatCellValue(0)).toBe("0");
    expect(formatCellValue(false)).toBe("false");
  });

  it("shows missing values as an empty cell", () => {
    expect(formatCellValue(null)).toBe("");
    expect(formatCellValue(undefined)).toBe("");
    expect(formatCellValue(NaN)).toBe("");
  });

  it("doesn't format dates, leaving that to renderCell", () => {
    const date = new Date(2026, 10, 8);

    expect(formatCellValue(date)).toBe(String(date));
  });
});
