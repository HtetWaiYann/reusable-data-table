import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ColumnDef } from "../types.ts";
import { useSorting, type UseSortingOptions } from "./useSorting.ts";

interface Person {
  name: string;
}

const data: Person[] = [{ name: "Cara" }, { name: "Abe" }, { name: "Ben" }];
const columns: ColumnDef<Person>[] = [
  { id: "name", header: "Name", getValue: (row) => row.name, sortable: true },
  { id: "actions", header: "Actions", sortable: true },
];

function renderSorting(options: Partial<UseSortingOptions<Person>> = {}) {
  return renderHook((props: UseSortingOptions<Person>) => useSorting(props), {
    initialProps: { data, columns, ...options },
  });
}

function names(rows: readonly Person[]): string[] {
  return rows.map((row) => row.name);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useSorting", () => {
  it("cycles asc → desc → none on repeated toggles", () => {
    const { result } = renderSorting();

    act(() => result.current.toggleSort("name"));
    expect(names(result.current.sortedRows)).toEqual(["Abe", "Ben", "Cara"]);

    act(() => result.current.toggleSort("name"));
    expect(names(result.current.sortedRows)).toEqual(["Cara", "Ben", "Abe"]);

    act(() => result.current.toggleSort("name"));
    expect(result.current.sort).toBeNull();
    expect(result.current.sortedRows).toBe(data);
  });

  it("never mutates data", () => {
    const { result } = renderSorting({
      defaultSort: { columnId: "name", direction: "asc" },
    });

    expect(names(result.current.sortedRows)).toEqual(["Abe", "Ben", "Cara"]);
    expect(names(data)).toEqual(["Cara", "Abe", "Ben"]);
  });

  it("follows the controlled sort prop and only emits changes", () => {
    const onSortChange = vi.fn();
    const { result } = renderSorting({
      sort: { columnId: "name", direction: "desc" },
      onSortChange,
    });

    act(() => result.current.toggleSort("name"));

    expect(onSortChange).toHaveBeenCalledWith(null);
    expect(names(result.current.sortedRows)).toEqual(["Cara", "Ben", "Abe"]);
  });

  it("leaves data in server order with manualSorting but still emits changes", () => {
    const onSortChange = vi.fn();
    const { result } = renderSorting({ manualSorting: true, onSortChange });

    act(() => result.current.toggleSort("name"));

    expect(onSortChange).toHaveBeenCalledWith({
      columnId: "name",
      direction: "asc",
    });
    expect(result.current.sortedRows).toBe(data);
  });

  it("renders unsorted and warns for an unknown sort column", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderSorting({
      sort: { columnId: "missing", direction: "asc" },
    });

    expect(result.current.sortedRows).toBe(data);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"missing"'));
  });

  it("renders unsorted and warns for a sorted column without getValue", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderSorting({
      sort: { columnId: "actions", direction: "asc" },
    });

    expect(result.current.sortedRows).toBe(data);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no getValue"));
  });

  it("doesn't warn about a missing getValue in server mode", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderSorting({
      sort: { columnId: "actions", direction: "asc" },
      manualSorting: true,
    });

    expect(warn).not.toHaveBeenCalled();
  });
});
