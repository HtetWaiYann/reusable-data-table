import { useEffect, useState } from "react";
import { fetchClassSessions, type MockScenario } from "../../mocks/api.ts";
import type { ClassSession } from "./types.ts";

// The parent controls the wording users see; the raw error stays out of the UI.
const LOAD_ERROR_MESSAGE = "We couldn't load the timetable. Please try again.";

/** What {@link useClassSessions} returns. */
export interface ClassSessionsResult {
  /** The last loaded sessions. Kept while a refetch runs, so the table doesn't flash empty. */
  data: ClassSession[];
  isLoading: boolean;
  /** User-facing message, or `null`. Cleared while a retry is loading. */
  error: string | null;
  retry: () => void;
}

/** The result of one request, tagged with the request it belongs to. */
interface LoadedResult {
  requestKey: string;
  data: ClassSession[];
  error: string | null;
}

/**
 * Loads the timetable from the fake API. Refetches when the scenario changes or on retry.
 *
 * @param scenario - Fake API behaviour (from `?scenario=`).
 * @returns The data plus loading and error state.
 */
export function useClassSessions(scenario: MockScenario): ClassSessionsResult {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<LoadedResult | null>(null);

  // Each request has a key. Loading is derived ("the last result isn't for this request"),
  // not stored, so there's no setState at the start of the effect.
  const requestKey = `${scenario}#${attempt}`;
  const isLoading = result?.requestKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();

    fetchClassSessions(scenario, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) {
          setResult({ requestKey, data, error: null });
        }
      },
      () => {
        // Aborted means a newer request (or unmount) replaced this one, so its outcome doesn't matter.
        if (!controller.signal.aborted) {
          setResult({ requestKey, data: [], error: LOAD_ERROR_MESSAGE });
        }
      },
    );

    return () => controller.abort();
  }, [scenario, requestKey]);

  return {
    data: result?.data ?? [],
    isLoading,
    error: isLoading ? null : (result?.error ?? null),
    retry: () => setAttempt((count) => count + 1),
  };
}
