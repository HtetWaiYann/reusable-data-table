import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ColumnDef } from "../components/data-table/index.ts";
import {
  fetchChildren,
  fetchRows,
  fetchRowsPage,
  parseScenario,
} from "./api.ts";

const LATENCY_MS = 800;

interface Item {
  id: string;
  value: number;
}
const items: Item[] = [3, 1, 2, 5, 4].map((value) => ({
  id: String(value),
  value,
}));
const columns: ColumnDef<Item>[] = [
  { id: "value", header: "Value", getValue: (row) => row.value },
];

function signal(): AbortSignal {
  return new AbortController().signal;
}

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

describe("fake endpoints", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns all rows after the latency", async () => {
    const request = fetchRows(items, "normal", signal());
    await vi.advanceTimersByTimeAsync(LATENCY_MS);

    await expect(request).resolves.toBe(items);
  });

  it("returns nothing for the empty scenario", async () => {
    const rows = fetchRows(items, "empty", signal());
    const children = fetchChildren(["a"], "empty", signal());
    await vi.advanceTimersByTimeAsync(LATENCY_MS);

    await expect(rows).resolves.toEqual([]);
    await expect(children).resolves.toEqual([]);
  });

  it("rejects for the error scenario", async () => {
    const request = fetchRows(items, "error", signal());
    const assertion = expect(request).rejects.toThrow("500");
    await vi.advanceTimersByTimeAsync(LATENCY_MS);

    await assertion;
  });

  it("rejects right away when aborted", async () => {
    const controller = new AbortController();
    const request = fetchRows(items, "normal", controller.signal);

    controller.abort();

    await expect(request).rejects.toThrow();
  });

  it("sorts and pages on the server, returning the total", async () => {
    const request = fetchRowsPage(
      items,
      columns,
      {
        sort: { columnId: "value", direction: "desc" },
        pagination: { pageIndex: 1, pageSize: 2 },
      },
      "normal",
      signal(),
    );
    await vi.advanceTimersByTimeAsync(LATENCY_MS);

    const page = await request;
    expect(page.rows.map((row) => row.value)).toEqual([3, 2]);
    expect(page.rowCount).toBe(5);
  });

  it("clamps an out-of-range page to the last page", async () => {
    const request = fetchRowsPage(
      items,
      columns,
      { sort: null, pagination: { pageIndex: 99, pageSize: 2 } },
      "normal",
      signal(),
    );
    await vi.advanceTimersByTimeAsync(LATENCY_MS);

    expect((await request).rows.map((row) => row.value)).toEqual([4]);
  });
});
