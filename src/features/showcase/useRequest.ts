import { useEffect, useState } from "react";

/** What {@link useRequest} returns. */
export interface RequestState<TValue> {
  /** Last successful value. Kept while a new request runs, so the table doesn't flash empty. */
  value: TValue | undefined;
  isLoading: boolean;
  /** The latest request failed. Cleared while a retry is loading. */
  isError: boolean;
  /** Runs the same request again. */
  retry: () => void;
}

/** One finished request, tagged with what it was for. */
interface Settled<TValue> {
  request: (signal: AbortSignal) => Promise<TValue>;
  attempt: number;
  value: TValue | undefined;
  isError: boolean;
}

/**
 * Runs an async request and tracks loading, error and retry. A new `request` function means a
 * new request, so memoize it on what it depends on (`useCallback`).
 *
 * @param request - Fetches the value; receives an AbortSignal that aborts on change or unmount.
 * @returns See {@link RequestState}.
 */
export function useRequest<TValue>(
  request: (signal: AbortSignal) => Promise<TValue>,
): RequestState<TValue> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<TValue> | null>(null);

  // Loading is derived, not stored: it's loading whenever the last result belongs to a different
  // request or attempt. So nothing calls setState at the start of the effect.
  const isLoading = settled?.request !== request || settled.attempt !== attempt;

  useEffect(() => {
    const controller = new AbortController();

    request(controller.signal).then(
      (value) => {
        if (!controller.signal.aborted) {
          setSettled({ request, attempt, value, isError: false });
        }
      },
      () => {
        // Aborted means a newer request (or unmount) replaced this one, so its outcome doesn't matter.
        if (!controller.signal.aborted) {
          // Keep the last good value; the error state replaces it on screen anyway.
          setSettled((previous) => ({
            request,
            attempt,
            value: previous?.value,
            isError: true,
          }));
        }
      },
    );

    return () => controller.abort();
  }, [request, attempt]);

  return {
    value: settled?.value,
    isLoading,
    isError: !isLoading && settled.isError,
    retry: () => setAttempt((count) => count + 1),
  };
}
