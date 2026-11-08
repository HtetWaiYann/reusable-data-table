import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockScenario } from "../../mocks/api.ts";
import { classSessions } from "../../mocks/timetable.ts";
import { useClassSessions } from "./useClassSessions.ts";

const LATENCY_MS = 800;

function renderClassSessions(scenario: MockScenario) {
  return renderHook(
    (props: { scenario: MockScenario }) => useClassSessions(props.scenario),
    { initialProps: { scenario } },
  );
}

async function finishRequest(): Promise<void> {
  await act(() => vi.advanceTimersByTimeAsync(LATENCY_MS));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useClassSessions", () => {
  it("is loading first, then has the data", async () => {
    const { result } = renderClassSessions("normal");

    expect(result.current.isLoading).toBe(true);
    await finishRequest();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(classSessions);
    expect(result.current.error).toBeNull();
  });

  it("reports a user-facing error and loads again on retry", async () => {
    const { result } = renderClassSessions("error");
    await finishRequest();

    expect(result.current.error).toBe(
      "We couldn't load the timetable. Please try again.",
    );

    act(() => result.current.retry());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("keeps the old rows while refetching for a new scenario", async () => {
    const { result, rerender } = renderClassSessions("normal");
    await finishRequest();

    rerender({ scenario: "empty" });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(classSessions);
    await finishRequest();
    expect(result.current.data).toEqual([]);
  });

  it("ignores a request that finishes after unmount", async () => {
    const { result, unmount } = renderClassSessions("normal");

    unmount();
    await finishRequest();

    expect(result.current.isLoading).toBe(true);
  });
});
