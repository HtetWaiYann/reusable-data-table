import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "./App.tsx";

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App routing", () => {
  it('renders the timetable on "/"', () => {
    renderAt("/");
    expect(
      screen.getByRole("heading", { name: "Class timetable" }),
    ).toBeInTheDocument();
  });

  it("renders the table playground on /demo", () => {
    renderAt("/demo");
    expect(screen.getByText(/Table playground/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Table setup" }),
    ).toBeInTheDocument();
  });

  it("marks the current page's link", () => {
    renderAt("/demo");
    expect(screen.getByRole("link", { name: "Demo" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Timetable" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("sends unknown paths to the timetable", () => {
    renderAt("/no-such-page");
    expect(
      screen.getByRole("heading", { name: "Class timetable" }),
    ).toBeInTheDocument();
  });
});
