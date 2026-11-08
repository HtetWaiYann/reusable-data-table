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

  it("marks the dashboard link as the current page", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("sends unknown paths to the timetable", () => {
    renderAt("/demo");
    expect(
      screen.getByRole("heading", { name: "Class timetable" }),
    ).toBeInTheDocument();
  });
});
