import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { classSessions } from "../mocks/timetable.ts";
import TimetablePage from "./TimetablePage.tsx";

const LATENCY_MS = 800;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

async function renderLoadedPage(path = "/"): Promise<void> {
  render(
    <MemoryRouter initialEntries={[path]}>
      <TimetablePage />
    </MemoryRouter>,
  );
  await act(() => vi.advanceTimersByTimeAsync(LATENCY_MS));
}

describe("TimetablePage", () => {
  it("loads the classes and shows the first page, earliest first", async () => {
    await renderLoadedPage();

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
    // Cells: [0] expand toggle, [1] Class (pinned).
    expect(within(firstRow).getAllByRole("cell")[1]).toHaveTextContent(
      earliest.name,
    );
  });

  it("shows attendees as child rows when a class is expanded (inline)", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderLoadedPage();

    await user.click(screen.getAllByRole("button", { name: "Details" })[0]);

    // Either the nested attendee table or the "no attendees" message, both rendered by our feature.
    expect(
      screen.queryByRole("table", { name: /^Attendees:/ }) ??
        screen.getByText("No attendees yet."),
    ).toBeInTheDocument();
  });

  it("loads attendees on demand in lazy mode", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderLoadedPage("/?attendees=lazy");

    expect(screen.getByRole("radio", { name: /Lazy/ })).toBeChecked();
    await user.click(screen.getAllByRole("button", { name: "Details" })[0]);
    expect(screen.getByLabelText("Loading details")).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(LATENCY_MS));
    expect(screen.queryByLabelText("Loading details")).not.toBeInTheDocument();
  });
});
