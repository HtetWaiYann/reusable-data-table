import type { Attendee, ClassSession } from "../features/timetable/types.ts";
import { classSessions } from "./timetable.ts";

/** How the fake API behaves, picked with `?scenario=` in the URL to demo each table state. */
export type MockScenario = "normal" | "slow" | "error" | "empty";

const SCENARIOS: readonly MockScenario[] = ["normal", "slow", "error", "empty"];

const LATENCY_MS: Record<MockScenario, number> = {
  normal: 800,
  slow: 3000,
  error: 800,
  empty: 800,
};

/**
 * Reads a scenario from untrusted input (the URL). Anything unknown means "normal".
 *
 * @param value - Raw value, e.g. `searchParams.get("scenario")`.
 * @returns A valid scenario.
 */
export function parseScenario(value: string | null): MockScenario {
  return SCENARIOS.find((scenario) => scenario === value) ?? "normal";
}

/** Resolves after `ms`, or rejects as soon as `signal` aborts, so a cancelled request stops waiting. */
function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

/**
 * Fake "GET /classes": the timetable data after some latency, or a failure.
 *
 * @param scenario - Which behaviour to simulate.
 * @param signal - Aborts the request, like `fetch`'s `signal`.
 * @returns All class sessions, or `[]` for the "empty" scenario.
 */
export async function fetchClassSessions(
  scenario: MockScenario,
  signal: AbortSignal,
): Promise<ClassSession[]> {
  await wait(LATENCY_MS[scenario], signal);
  if (scenario === "error") {
    throw new Error("Mock API: 500 while loading classes.");
  }
  if (scenario === "empty") {
    return [];
  }
  return classSessions;
}

/**
 * Fake "GET /classes/:id/attendees": the timetable's child rows in lazy mode.
 * (The class list still carries attendees for the Attendance count; a real API would send a count.)
 *
 * @param classId - The expanded class.
 * @param scenario - Which behaviour to simulate; "empty" means nobody booked.
 * @param signal - Aborts the request, like `fetch`'s `signal`.
 * @returns The class's attendees, possibly none.
 */
export async function fetchClassAttendees(
  classId: string,
  scenario: MockScenario,
  signal: AbortSignal,
): Promise<Attendee[]> {
  await wait(LATENCY_MS[scenario], signal);
  if (scenario === "error") {
    throw new Error("Mock API: 500 while loading attendees.");
  }
  if (scenario === "empty") {
    return [];
  }
  return (
    classSessions.find((session) => session.id === classId)?.attendees ?? []
  );
}
