import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLazyChildren } from "./useLazyChildren.ts";

/** A promise the test resolves or rejects by hand, to control when a load finishes. */
function deferred<TValue>() {
  let resolve: (value: TValue) => void = () => {};
  let reject: (reason: unknown) => void = () => {};
  const promise = new Promise<TValue>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

describe("useLazyChildren", () => {
  it("goes from loading to the loaded children", async () => {
    const request = deferred<string[]>();
    const loader = vi.fn(() => request.promise);
    const { result } = renderHook(() => useLazyChildren(loader));

    act(() => result.current.load("row", "1"));
    expect(result.current.entries.get("1")).toEqual({ status: "loading" });

    await act(async () => request.resolve(["child"]));
    expect(result.current.entries.get("1")).toEqual({
      status: "success",
      children: ["child"],
    });
  });

  it("doesn't start a second request while one is in flight, or after success", async () => {
    const request = deferred<string[]>();
    const loader = vi.fn(() => request.promise);
    const { result } = renderHook(() => useLazyChildren(loader));

    act(() => result.current.load("row", "1"));
    act(() => result.current.load("row", "1"));
    await act(async () => request.resolve(["child"]));
    act(() => result.current.load("row", "1"));

    expect(loader).toHaveBeenCalledOnce();
  });

  it("shows an error, waits for Retry, then loads again", async () => {
    const failing = deferred<string[]>();
    const loader = vi
      .fn<(row: string, signal: AbortSignal) => Promise<string[]>>()
      .mockReturnValueOnce(failing.promise)
      .mockResolvedValueOnce(["child"]);
    const { result } = renderHook(() => useLazyChildren(loader));

    act(() => result.current.load("row", "1"));
    await act(async () => failing.reject(new Error("500")));
    expect(result.current.entries.get("1")).toEqual({ status: "error" });

    act(() => result.current.load("row", "1"));
    expect(loader).toHaveBeenCalledOnce();

    await act(async () => result.current.load("row", "1", true));
    expect(result.current.entries.get("1")).toEqual({
      status: "success",
      children: ["child"],
    });
  });

  it("aborts requests still running when it unmounts", () => {
    let signal: AbortSignal | undefined;
    const loader = vi.fn((_row: string, requestSignal: AbortSignal) => {
      signal = requestSignal;
      return new Promise<string[]>(() => {});
    });
    const { result, unmount } = renderHook(() => useLazyChildren(loader));

    act(() => result.current.load("row", "1"));
    unmount();

    expect(signal?.aborted).toBe(true);
  });

  it("does nothing without a loader (inline mode)", () => {
    const { result } = renderHook(() => useLazyChildren(undefined));

    act(() => result.current.load("row", "1"));

    expect(result.current.entries.size).toBe(0);
  });
});
