import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePagination, type UsePaginationOptions } from "./usePagination.ts";

// 25 rows: 1, 2, …, 25
const rows = Array.from({ length: 25 }, (_, index) => index + 1);

function renderPagination(options: Partial<UsePaginationOptions<number>> = {}) {
  return renderHook(
    (props: UsePaginationOptions<number>) => usePagination(props),
    { initialProps: { rows, rowCount: rows.length, ...options } },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usePagination", () => {
  it("starts on the first page with the first page-size option", () => {
    const { result } = renderPagination();

    expect(result.current.pageSize).toBe(10);
    expect(result.current.pageCount).toBe(3);
    expect(result.current.pageRows).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("moves between pages and shows a partial last page", () => {
    const { result } = renderPagination();

    act(() => result.current.setPageIndex(2));

    expect(result.current.pageRows).toEqual([21, 22, 23, 24, 25]);
  });

  it("goes back to the first page when the page size changes", () => {
    const onPaginationChange = vi.fn();
    const { result } = renderPagination({ onPaginationChange });

    act(() => result.current.setPageIndex(2));
    act(() => result.current.setPageSize(20));

    expect(result.current.pageIndex).toBe(0);
    expect(onPaginationChange).toHaveBeenLastCalledWith({
      pageIndex: 0,
      pageSize: 20,
    });
  });

  it("clamps to the last page when the data shrinks", () => {
    const { result, rerender } = renderPagination({
      defaultPagination: { pageIndex: 2, pageSize: 10 },
    });

    rerender({ rows: rows.slice(0, 12), rowCount: 12 });

    expect(result.current.pageIndex).toBe(1);
    expect(result.current.pageRows).toEqual([11, 12]);
  });

  it("follows controlled pagination and only emits changes", () => {
    const onPaginationChange = vi.fn();
    const { result } = renderPagination({
      pagination: { pageIndex: 1, pageSize: 10 },
      onPaginationChange,
    });

    act(() => result.current.setPageIndex(2));

    expect(onPaginationChange).toHaveBeenCalledWith({
      pageIndex: 2,
      pageSize: 10,
    });
    expect(result.current.pageIndex).toBe(1);
  });

  it("shows server rows as-is and counts pages from rowCount", () => {
    const serverPage = [41, 42, 43];
    const { result } = renderPagination({
      rows: serverPage,
      rowCount: 95,
      manualPagination: true,
      defaultPagination: { pageIndex: 4, pageSize: 10 },
    });

    expect(result.current.pageRows).toBe(serverPage);
    expect(result.current.pageCount).toBe(10);
    expect(result.current.pageIndex).toBe(4);
  });

  it("falls back to 10 rows and warns for an invalid page size", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderPagination({
      pagination: { pageIndex: 0, pageSize: 0 },
    });

    expect(result.current.pageSize).toBe(10);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("pageSize 0"));
  });
});
