import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useExpansion } from "./useExpansion.ts";

describe("useExpansion", () => {
  it("opens and closes a row, keeping it in the map after closing", () => {
    const { result } = renderHook(() => useExpansion());

    act(() => result.current.toggle("a"));
    expect(result.current.expandedRows.get("a")).toBe(true);

    act(() => result.current.toggle("a"));
    expect(result.current.expandedRows.get("a")).toBe(false);
    expect(result.current.expandedRows.has("a")).toBe(true);
  });

  it("keeps rows independent", () => {
    const { result } = renderHook(() => useExpansion());

    act(() => result.current.toggle("a"));
    act(() => result.current.toggle("b"));
    act(() => result.current.toggle("a"));

    expect(result.current.expandedRows.get("a")).toBe(false);
    expect(result.current.expandedRows.get("b")).toBe(true);
  });

  it("keeps the same toggle function between renders", () => {
    const { result, rerender } = renderHook(() => useExpansion());
    const firstToggle = result.current.toggle;

    act(() => result.current.toggle("a"));
    rerender();

    expect(result.current.toggle).toBe(firstToggle);
  });
});
