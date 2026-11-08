import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { classSessions } from "../mocks/timetable.ts";
import TimetablePage from "./TimetablePage.tsx";

describe("TimetablePage", () => {
  it("renders every class, earliest first by default", () => {
    render(<TimetablePage />);
    const [, firstRow, ...otherRows] = screen.getAllByRole("row");
    const earliest = classSessions.toSorted(
      (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
    )[0];

    expect(otherRows).toHaveLength(classSessions.length - 1);
    expect(screen.getByRole("columnheader", { name: /Time/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(within(firstRow).getAllByRole("cell")[1]).toHaveTextContent(
      earliest.name,
    );
  });
});
