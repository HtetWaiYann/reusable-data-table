// A fake backend. Every endpoint waits like a network call, honours an AbortSignal like `fetch`,
// and can be made slow, failing or empty with `?scenario=`, so each table state can be demoed.
import type {
  ColumnDef,
  PaginationState,
  SortState,
} from "../components/data-table/index.ts";
import {
  clampPageIndex,
  getPageCount,
  getPageRows,
} from "../components/data-table/utils/pagination.ts";
import { sortRows } from "../components/data-table/utils/sorting.ts";

/** How the fake API behaves. */
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

/** Waits, then fails for "error", returns `empty` for "empty", or builds the normal response. */
async function respond<TResponse>(
  scenario: MockScenario,
  signal: AbortSignal,
  empty: TResponse,
  buildResponse: () => TResponse,
): Promise<TResponse> {
  await wait(LATENCY_MS[scenario], signal);
  if (scenario === "error") {
    throw new Error("Mock API: 500 Internal Server Error");
  }
  return scenario === "empty" ? empty : buildResponse();
}

/**
 * Fake "GET /rows": the whole list, for client-side sorting and pagination.
 *
 * @param rows - The dataset the fake server holds.
 * @param scenario - Which behaviour to simulate.
 * @param signal - Aborts the request.
 * @returns All rows, or `[]` for "empty".
 */
export function fetchRows<TRow>(
  rows: TRow[],
  scenario: MockScenario,
  signal: AbortSignal,
): Promise<TRow[]> {
  return respond(scenario, signal, [], () => rows);
}

/** Query for one server-side page. */
export interface PageQuery {
  sort: SortState;
  pagination: PaginationState;
}

/** One server-side page plus the total, which the table needs for its page count. */
export interface PageResponse<TRow> {
  rows: TRow[];
  rowCount: number;
}

/**
 * Fake "GET /rows?sort=…&page=…&size=…": the server sorts and slices, the table only shows the page.
 * Sorts with the same helpers as the table, standing in for the database's ORDER BY / LIMIT.
 *
 * @param rows - The dataset the fake server holds.
 * @param columns - Used to find the sorted column's value; a real server would map the id to a field.
 * @param query - Sort and page requested by the table.
 * @param scenario - Which behaviour to simulate.
 * @param signal - Aborts the request.
 * @returns The requested page and the total row count.
 */
export function fetchRowsPage<TRow>(
  rows: TRow[],
  columns: readonly ColumnDef<TRow>[],
  query: PageQuery,
  scenario: MockScenario,
  signal: AbortSignal,
): Promise<PageResponse<TRow>> {
  return respond(scenario, signal, { rows: [], rowCount: 0 }, () => {
    const { sort, pagination } = query;
    const getValue = sort
      ? columns.find((column) => column.id === sort.columnId)?.getValue
      : undefined;
    // An unknown sort key is ignored, like the client side does.
    const sorted =
      sort && getValue ? sortRows(rows, getValue, sort.direction) : rows;
    // The server clamps too, so an out-of-range page returns the last page instead of nothing.
    const pageIndex = clampPageIndex(
      pagination.pageIndex,
      getPageCount(rows.length, pagination.pageSize),
    );
    return {
      rows: getPageRows(sorted, { ...pagination, pageIndex }),
      rowCount: rows.length,
    };
  });
}

/**
 * Fake "GET /rows/:id/children": child rows fetched when a row is expanded (lazy mode).
 *
 * @param children - The children the fake server holds for that row.
 * @param scenario - Which behaviour to simulate; "empty" means no children.
 * @param signal - Aborts the request.
 * @returns The children, possibly none.
 */
export function fetchChildren<TChild>(
  children: TChild[],
  scenario: MockScenario,
  signal: AbortSignal,
): Promise<TChild[]> {
  return respond(scenario, signal, [], () => children);
}
