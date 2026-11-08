import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRequest } from "./useRequest.ts";

type Request = (signal: AbortSignal) => Promise<string>;

/** A request the test settles by hand. */
function controllable() {
  const resolvers: ((value: string) => void)[] = [];
  const rejecters: ((reason: unknown) => void)[] = [];
  const signals: AbortSignal[] = [];
  const request = vi.fn<Request>(
    (signal) =>
      new Promise<string>((resolve, reject) => {
        resolvers.push(resolve);
        rejecters.push(reject);
        signals.push(signal);
      }),
  );
  return { request, resolvers, rejecters, signals };
}

describe("useRequest", () => {
  it("is loading first, then has the value", async () => {
    const { request, resolvers } = controllable();
    const { result } = renderHook(() => useRequest(request));

    expect(result.current.isLoading).toBe(true);
    await act(async () => resolvers[0]("data"));

    expect(result.current).toMatchObject({
      value: "data",
      isLoading: false,
      isError: false,
    });
  });

  it("reports an error, and loads again on retry with the error cleared", async () => {
    const { request, rejecters } = controllable();
    const { result } = renderHook(() => useRequest(request));
    await act(async () => rejecters[0](new Error("500")));

    expect(result.current.isError).toBe(true);
    act(() => result.current.retry());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("keeps the old value while a new request loads, and aborts the old one", async () => {
    const first = controllable();
    const second = controllable();
    const { result, rerender } = renderHook(
      (props: { request: Request }) => useRequest(props.request),
      { initialProps: { request: first.request } },
    );
    await act(async () => first.resolvers[0]("old"));

    rerender({ request: second.request });

    expect(result.current).toMatchObject({ value: "old", isLoading: true });
    // The effect cleanup aborts the previous request when the request changes.
    expect(first.signals[0].aborted).toBe(true);
    await act(async () => second.resolvers[0]("new"));
    expect(result.current.value).toBe("new");
  });

  it("ignores a request that finishes after unmount", async () => {
    const { request, resolvers, signals } = controllable();
    const { result, unmount } = renderHook(() => useRequest(request));

    unmount();
    await act(async () => resolvers[0]("late"));

    expect(signals[0].aborted).toBe(true);
    expect(result.current.value).toBeUndefined();
  });
});
