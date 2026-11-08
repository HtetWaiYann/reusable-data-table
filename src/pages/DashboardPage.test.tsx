import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMembers } from "../mocks/members.ts";
import { classSessions } from "../mocks/timetable.ts";
import DashboardPage from "./DashboardPage.tsx";

const LATENCY_MS = 800;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

async function finishRequest(): Promise<void> {
  await act(() => vi.advanceTimersByTimeAsync(LATENCY_MS));
}

async function renderLoadedPage(path = "/"): Promise<void> {
  render(
    <MemoryRouter initialEntries={[path]}>
      <DashboardPage />
    </MemoryRouter>,
  );
  await finishRequest();
}

/** Body rows of the main table (not the control panel, not nested child tables). */
function mainRows(): HTMLElement[] {
  const [, ...bodyRows] = within(screen.getAllByRole("table")[0]).getAllByRole(
    "row",
  );
  return bodyRows;
}

describe("DashboardPage", () => {
  it("shows the timetable's first page, earliest class first", async () => {
    await renderLoadedPage();
    const earliest = classSessions.toSorted(
      (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
    )[0];

    expect(
      screen.getByRole("heading", { name: "Class timetable" }),
    ).toBeVisible();
    expect(mainRows()).toHaveLength(10);
    expect(
      screen.getByText(`Showing 1–10 of ${classSessions.length}`),
    ).toBeInTheDocument();
    // Cells: [0] expand toggle, [1] Class (pinned).
    expect(within(mainRows()[0]).getAllByRole("cell")[1]).toHaveTextContent(
      earliest.name,
    );
  });

  it("shows attendees as child rows when a class is expanded (inline)", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderLoadedPage();

    await user.click(screen.getAllByRole("button", { name: "Details" })[0]);

    expect(
      screen.queryByRole("table", { name: /^Attendees:/ }) ??
        screen.getByText("No attendees yet."),
    ).toBeInTheDocument();
  });

  it("loads child rows on demand in lazy mode", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderLoadedPage("/?children=lazy");

    expect(screen.getByRole("radio", { name: /Lazy/ })).toBeChecked();
    await user.click(screen.getAllByRole("button", { name: "Details" })[0]);
    expect(screen.getByLabelText("Loading details")).toBeInTheDocument();

    await finishRequest();
    expect(screen.queryByLabelText("Loading details")).not.toBeInTheDocument();
  });

  it("renders the second dataset with the same table", async () => {
    await renderLoadedPage("/?dataset=members");

    expect(screen.getByRole("heading", { name: "Members" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: /Plan/ })).toBeVisible();
    expect(
      screen.getByText(`Showing 1–10 of ${getMembers(50).length}`),
    ).toBeInTheDocument();
  });

  it("switches the dataset from the control panel and updates the URL options", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderLoadedPage();

    await user.click(screen.getByRole("radio", { name: "Members" }));

    expect(screen.getByRole("heading", { name: "Members" })).toBeVisible();
  });

  it("server mode: a sort click fetches page 1 again, keeping rows visible meanwhile", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderLoadedPage("/?mode=server");

    expect(
      screen.getByText(`Showing 1–10 of ${classSessions.length}`),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByRole("table", { name: "Classes this week" }),
    ).toHaveAttribute("aria-busy", "true");
    expect(mainRows()).toHaveLength(10);

    await finishRequest();
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Class/ }));
    await finishRequest();
    expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Class/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });
});
