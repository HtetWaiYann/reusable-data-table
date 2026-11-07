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

  it('renders the demo on "/demo" and marks its nav link as current', () => {
    renderAt("/demo");
    expect(
      screen.getByRole("heading", { name: "Data table demo" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Demo" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
