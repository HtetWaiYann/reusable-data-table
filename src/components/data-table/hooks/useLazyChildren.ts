import { useCallback, useEffect, useRef, useState } from "react";

/** One row's lazily loaded children. */
export type LazyChildrenEntry<TChild> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; children: TChild[] };

type LazyStatus = LazyChildrenEntry<unknown>["status"];

/** What {@link useLazyChildren} gives the table. */
export interface UseLazyChildrenResult<TRow, TChild> {
  /** Row id → loading / error / success. Rows never loaded aren't in the map. */
  entries: ReadonlyMap<string, LazyChildrenEntry<TChild>>;
  /**
   * Starts loading a row's children. Does nothing when they're already loading or loaded (cache),
   * or failed, unless `isRetry` is set. Stable while `loadChildren` is.
   */
  load: (row: TRow, rowId: string, isRetry?: boolean) => void;
}

/**
 * Per-row cache for children fetched on demand, with de-duplication, cancellation and retry.
 *
 * @param loadChildren - The lazy loader from the expansion config, or `undefined` in inline mode.
 *   Keep it stable (define the config outside the component or memoize it).
 * @returns See {@link UseLazyChildrenResult}.
 */
export function useLazyChildren<TRow, TChild>(
  loadChildren:
    ((row: TRow, signal: AbortSignal) => Promise<TChild[]>) | undefined,
): UseLazyChildrenResult<TRow, TChild> {
  const [entries, setEntries] = useState<
    ReadonlyMap<string, LazyChildrenEntry<TChild>>
  >(() => new Map());

  // Refs, not state: `load` reads them to decide whether to fetch, and reading state would make
  // `load` change on every result, which would re-render every memoized row.
  const statusesRef = useRef(new Map<string, LazyStatus>());
  const controllersRef = useRef(new Map<string, AbortController>());

  const setEntry = useCallback(
    (rowId: string, entry: LazyChildrenEntry<TChild>) => {
      statusesRef.current.set(rowId, entry.status);
      setEntries((previous) => new Map(previous).set(rowId, entry));
    },
    [],
  );

  const load = useCallback(
    (row: TRow, rowId: string, isRetry = false) => {
      const status = statusesRef.current.get(rowId);
      // In flight → de-duplicate. Loaded → reuse the cache. Failed → wait for an explicit Retry.
      const shouldLoad =
        status === undefined || (status === "error" && isRetry);
      if (!loadChildren || !shouldLoad) {
        return;
      }

      const controller = new AbortController();
      controllersRef.current.set(rowId, controller);
      setEntry(rowId, { status: "loading" });

      loadChildren(row, controller.signal)
        .then(
          (children) => {
            if (!controller.signal.aborted) {
              setEntry(rowId, { status: "success", children });
            }
          },
          () => {
            // Aborted means the table unmounted, so the outcome doesn't matter.
            if (!controller.signal.aborted) {
              setEntry(rowId, { status: "error" });
            }
          },
        )
        .finally(() => {
          controllersRef.current.delete(rowId);
        });
    },
    [loadChildren, setEntry],
  );

  // Cancel every request still running when the table unmounts.
  useEffect(() => {
    const controllers = controllersRef.current;
    return () => {
      for (const controller of controllers.values()) {
        controller.abort();
      }
    };
  }, []);

  return { entries, load };
}
