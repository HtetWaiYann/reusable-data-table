import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { classSessions } from "../mocks/timetable.ts";
import TimetablePage from "./TimetablePage.tsx";

describe("TimetablePage", () => {
  it("shows the first page of classes, earliest first by default", () => {
    render(<TimetablePage />);
    const [, firstRow, ...otherRows] = screen.getAllByRole("row");
    const earliest = classSessions.toSorted(
      (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
    )[0];

    // 10 rows on the first page: the header row + firstRow + 9 others.
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
