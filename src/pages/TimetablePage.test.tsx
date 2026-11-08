import { act, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { classSessions } from "../mocks/timetable.ts";
import TimetablePage from "./TimetablePage.tsx";

const LATENCY_MS = 800;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TimetablePage", () => {
  it("loads the classes and shows the first page, earliest first", async () => {
    render(
      <MemoryRouter>
        <TimetablePage />
      </MemoryRouter>,
    );
    await act(() => vi.advanceTimersByTimeAsync(LATENCY_MS));

    const [, firstRow, ...otherRows] = screen.getAllByRole("row");
    const earliest = classSessions.toSorted(
      (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
    )[0];

    // 10 rows on the first page: firstRow + 9 others (the header row is skipped).
    expect(otherRows).toHaveLength(9);
    expect(
      screen.getByText(`Showing 1–10 of ${classSessions.length}`),
    ).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Time/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(within(firstRow).getAllByRole("cell")[1]).toHaveTextContent(
      earliest.name,
    );
  });
});
