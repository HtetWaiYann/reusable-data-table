import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchClassSessions, parseScenario } from "./api.ts";
import { classSessions } from "./timetable.ts";

describe("parseScenario", () => {
  it("accepts known scenarios", () => {
    expect(parseScenario("error")).toBe("error");
    expect(parseScenario("empty")).toBe("empty");
  });

  it("falls back to normal for missing or unknown values", () => {
    expect(parseScenario(null)).toBe("normal");
    expect(parseScenario("<script>")).toBe("normal");
  });
});

describe("fetchClassSessions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves with the sessions after the latency", async () => {
    const request = fetchClassSessions("normal", new AbortController().signal);

    await vi.advanceTimersByTimeAsync(800);

    await expect(request).resolves.toBe(classSessions);
  });

  it("resolves with no sessions for the empty scenario", async () => {
    const request = fetchClassSessions("empty", new AbortController().signal);

    await vi.advanceTimersByTimeAsync(800);

    await expect(request).resolves.toEqual([]);
  });

  it("rejects for the error scenario", async () => {
    const request = fetchClassSessions("error", new AbortController().signal);
    const assertion = expect(request).rejects.toThrow("500");

    await vi.advanceTimersByTimeAsync(800);

    await assertion;
  });

  it("rejects right away when aborted", async () => {
    const controller = new AbortController();
    const request = fetchClassSessions("normal", controller.signal);

    controller.abort();

    await expect(request).rejects.toThrow();
  });
});
