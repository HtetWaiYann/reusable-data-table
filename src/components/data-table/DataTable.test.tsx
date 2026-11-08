import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DataTable, type ColumnDef } from "./index.ts";

interface Person {
  id: string;
  name: string;
  age: number;
}

const people: Person[] = [
  { id: "1", name: "Cara", age: 31 },
  { id: "2", name: "Abe", age: 45 },
  { id: "3", name: "Ben", age: 9 },
];

const columns: ColumnDef<Person>[] = [
  { id: "name", header: "Name", getValue: (row) => row.name, sortable: true },
  {
    id: "age",
    header: "Age",
    getValue: (row) => row.age,
    renderCell: (row) => `${row.age} yrs`,
  },
];

function renderTable() {
  return render(
    <DataTable
      caption="People"
      data={people}
      getRowId={(row) => row.id}
      columns={columns}
    />,
  );
}

/** Text of the first cell in each body row, in display order. */
function firstColumn(): (string | null)[] {
  const [, ...bodyRows] = screen.getAllByRole("row");
  return bodyRows.map((row) => within(row).getAllByRole("cell")[0].textContent);
}

describe("DataTable", () => {
  it("renders the caption, headers and cells from the column definitions", () => {
    renderTable();

    expect(screen.getByRole("table", { name: "People" })).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Age" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "45 yrs" })).toBeInTheDocument();
  });

  it("cycles sort asc → desc → none on repeated header clicks", async () => {
    const user = userEvent.setup();
    renderTable();
    const button = screen.getByRole("button", { name: /Name/ });
    const header = screen.getByRole("columnheader", { name: /Name/ });

    await user.click(button);
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(firstColumn()).toEqual(["Abe", "Ben", "Cara"]);

    await user.click(button);
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(firstColumn()).toEqual(["Cara", "Ben", "Abe"]);

    await user.click(button);
    expect(header).not.toHaveAttribute("aria-sort");
    expect(firstColumn()).toEqual(["Cara", "Abe", "Ben"]);
  });

  it("sorts with the keyboard", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.tab();
    await user.keyboard("{Enter}");

    expect(firstColumn()).toEqual(["Abe", "Ben", "Cara"]);
  });

  it("renders no sort button for a non-sortable column", () => {
    renderTable();

    expect(
      screen.queryByRole("button", { name: /Age/ }),
    ).not.toBeInTheDocument();
  });
});
