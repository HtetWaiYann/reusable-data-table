import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { filterBySearch } from "../features/timetable/search.ts";
import { summarizeClasses } from "../features/timetable/summary.ts";
import { filterByDay } from "../features/timetable/weekDays.ts";
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

/** The number shown under a figure's label, e.g. "Classes" → "50". */
function figure(label: string): string | null {
  const term = screen.getByText(label, { selector: "dt" });
  return within(term.parentElement ?? term).getByText(/^[\d,]+$/).textContent;
}

describe("TimetablePage", () => {
  it("shows the week's figures and the timetable", async () => {
    await renderLoadedPage();
    const week = summarizeClasses(classSessions);

    expect(
      screen.getByRole("heading", { name: "Class timetable" }),
    ).toBeVisible();
    expect(figure("Classes")).toBe(String(week.classCount));
    expect(figure("Bookings")).toBe(week.activeBookings.toLocaleString());
    expect(
      screen.getByRole("table", { name: "Classes this week" }),
    ).toBeVisible();
  });

  it("filters the figures and the rows by day, keeping the day in the URL", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderLoadedPage();
    const mondays = filterByDay(classSessions, "mon");

    await user.click(screen.getByRole("radio", { name: "Mon" }));

    expect(figure("Classes")).toBe(String(mondays.length));
    expect(
      screen.getByText(
        `Showing 1–${Math.min(mondays.length, 10)} of ${mondays.length}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Classes on Monday" }),
    ).toBeVisible();
  });

  it("reads the day from the URL", async () => {
    await renderLoadedPage("/?day=tue");

    expect(screen.getByRole("radio", { name: "Tue" })).toBeChecked();
    expect(
      screen.getByRole("table", { name: "Classes on Tuesday" }),
    ).toBeVisible();
  });

  it("searches by class or instructor, together with the day filter", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderLoadedPage("/?day=mon");
    const mondayYoga = filterBySearch(
      filterByDay(classSessions, "mon"),
      "yoga",
    );

    await user.type(screen.getByLabelText("Search classes"), "yoga");

    expect(figure("Classes")).toBe(String(mondayYoga.length));
    expect(screen.getByRole("radio", { name: "Mon" })).toBeChecked();
  });

  it("explains an empty search result", async () => {
    await renderLoadedPage("/?q=zzz");

    expect(screen.getByText('No classes match "zzz".')).toBeInTheDocument();
  });
});
