import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type ColumnDef, type DataTableProps } from "./index.ts";

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

  it("announces each sort change in a polite live region", async () => {
    const user = userEvent.setup();
    renderTable();
    const button = screen.getByRole("button", { name: /Name/ });
    const status = screen.getByRole("status");

    // Empty until the user acts, so loading the table announces nothing.
    expect(status).toBeEmptyDOMElement();
    await user.click(button);
    expect(status).toHaveTextContent("Sorted by Name, ascending.");
    await user.click(button);
    expect(status).toHaveTextContent("Sorted by Name, descending.");
    await user.click(button);
    expect(status).toHaveTextContent("Sort cleared.");
  });

  it("renders no sort button for a non-sortable column", () => {
    renderTable();

    expect(
      screen.queryByRole("button", { name: /Age/ }),
    ).not.toBeInTheDocument();
  });
});

describe("DataTable pagination", () => {
  // 25 people named P01…P25, so pages are easy to read: 10 + 10 + 5.
  const manyPeople: Person[] = Array.from({ length: 25 }, (_, index) => ({
    id: String(index + 1),
    name: `P${String(index + 1).padStart(2, "0")}`,
    age: index,
  }));

  function renderPagedTable() {
    return render(
      <DataTable
        caption="People"
        data={manyPeople}
        getRowId={(row) => row.id}
        columns={columns}
      />,
    );
  }

  it("shows 10 rows per page and moves with Next and Previous", async () => {
    const user = userEvent.setup();
    renderPagedTable();
    const previous = screen.getByRole("button", { name: "Previous" });
    const next = screen.getByRole("button", { name: "Next" });

    expect(firstColumn()).toHaveLength(10);
    expect(previous).toBeDisabled();
    expect(screen.getByText("Showing 1–10 of 25")).toBeInTheDocument();

    await user.click(next);
    expect(firstColumn()[0]).toBe("P11");
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();

    await user.click(next);
    expect(firstColumn()).toEqual(["P21", "P22", "P23", "P24", "P25"]);
    expect(next).toBeDisabled();

    await user.click(previous);
    expect(firstColumn()[0]).toBe("P11");
  });

  it("announces page and page-size changes", async () => {
    const user = userEvent.setup();
    renderPagedTable();
    const status = screen.getByRole("status");

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(status).toHaveTextContent("Page 2 of 3.");

    await user.selectOptions(screen.getByRole("combobox"), "20");
    expect(status).toHaveTextContent("20 rows per page. Page 1 of 2.");
  });

  it("goes back to page 1 when the page size changes", async () => {
    const user = userEvent.setup();
    renderPagedTable();

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Rows per page" }),
      "20",
    );

    expect(firstColumn()).toHaveLength(20);
    expect(firstColumn()[0]).toBe("P01");
  });

  it("goes back to page 1 when the sort changes", async () => {
    const user = userEvent.setup();
    renderPagedTable();

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: /Name/ }));

    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(firstColumn()[0]).toBe("P01");
  });
});

describe("DataTable pinned column", () => {
  it("pins the first pinned column, even when it isn't the first column", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const pinnedColumns: ColumnDef<Person>[] = [
      { id: "id", header: "Id", getValue: (row) => row.id },
      columns[1],
      { ...columns[0], pinned: true },
      { id: "extra", header: "Extra", pinned: true },
    ];
    render(
      <DataTable
        caption="People"
        data={people}
        getRowId={(row) => row.id}
        columns={pinnedColumns}
      />,
    );

    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "data-pinned",
    );
    expect(screen.getByRole("cell", { name: "Abe" })).toHaveAttribute(
      "data-pinned",
    );
    expect(
      screen.getByRole("columnheader", { name: "Extra" }),
    ).not.toHaveAttribute("data-pinned");
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('ignoring "extra"'),
    );
    warn.mockRestore();
  });
});

describe("DataTable states", () => {
  // Only the fields these tests change; a Partial of the whole props type would lose the pagination-mode union.
  type StateProps = Pick<
    DataTableProps<Person>,
    "data" | "isLoading" | "error" | "onRetry" | "emptyState"
  >;

  function renderWithState(props: Partial<StateProps> = {}) {
    return render(
      <DataTable
        caption="People"
        data={[]}
        getRowId={(row) => row.id}
        columns={columns}
        {...props}
      />,
    );
  }

  it("shows a page of skeleton rows on the first load, and no pagination", () => {
    const { container } = renderWithState({ isLoading: true });

    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelectorAll("tbody tr[aria-hidden]")).toHaveLength(
      10,
    );
    expect(
      screen.queryByRole("navigation", { name: "Pagination" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the rows visible while refetching", () => {
    renderWithState({ data: people, isLoading: true });

    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(firstColumn()).toEqual(["Cara", "Abe", "Ben"]);
  });

  it("shows the error with a Retry button and keeps the header", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderWithState({ error: "Couldn't load people.", onRetry });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't load people.",
    );
    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeVisible();
    expect(
      screen.queryByRole("navigation", { name: "Pagination" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("shows the default empty message, or custom empty content", () => {
    const { unmount } = renderWithState();
    expect(screen.getByRole("cell", { name: "No results." })).toBeVisible();
    unmount();

    renderWithState({ emptyState: <strong>No classes this week</strong> });
    expect(screen.getByText("No classes this week")).toBeVisible();
  });
});

describe("DataTable expandable rows", () => {
  interface Pet {
    id: string;
    name: string;
  }
  const petsByPerson: Record<string, Pet[]> = {
    "1": [{ id: "p1", name: "Rex" }],
    "2": [],
    "3": [{ id: "p2", name: "Tom" }],
  };
  const renderPets = (pets: Pet[]) =>
    pets.length === 0 ? "No pets" : pets.map((pet) => pet.name).join(", ");

  it("inline: toggles the detail row and its aria-expanded state", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        caption="People"
        data={people}
        getRowId={(row) => row.id}
        columns={columns}
        expansion={{
          mode: "inline",
          getChildren: (row) => petsByPerson[row.id],
          renderChildren: renderPets,
          canExpand: (row) => row.id !== "3",
        }}
      />,
    );
    const [caraToggle] = screen.getAllByRole("button", { name: "Details" });

    expect(caraToggle).toHaveAttribute("aria-expanded", "false");
    await user.click(caraToggle);
    expect(caraToggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Rex")).toBeVisible();
    expect(
      document.getElementById(caraToggle.getAttribute("aria-controls") ?? ""),
    ).toHaveTextContent("Rex");

    // canExpand false for Ben (id 3): only two toggles.
    expect(screen.getAllByRole("button", { name: "Details" })).toHaveLength(2);
  });

  it("renders the built-in child table from the data when no renderChildren is given", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        caption="People"
        data={people}
        getRowId={(row) => row.id}
        columns={columns}
        expansion={{
          mode: "inline",
          getChildren: (row) =>
            (petsByPerson[row.id] ?? []).map((pet) => ({
              ...pet,
              isVaccinated: true,
            })),
          childIdKey: "id",
          hideChildKeys: ["id"],
        }}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: "Details" })[0]);
    const childTable = screen.getByRole("table", { name: "Details" });

    // Headers come from the keys, humanized; the hidden id has no column.
    expect(
      within(childTable)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["Name", "Is vaccinated"]);
    expect(within(childTable).getByText("Rex")).toBeVisible();
    expect(within(childTable).getByText("Yes")).toBeVisible();
    expect(within(childTable).queryByText("p1")).not.toBeInTheDocument();
  });

  it("lazy: shows loading, then children, and doesn't refetch on re-expand", async () => {
    const user = userEvent.setup();
    let resolveRequest: (pets: Pet[]) => void = () => {};
    const loadChildren = vi.fn(
      () =>
        new Promise<Pet[]>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    render(
      <DataTable
        caption="People"
        data={people}
        getRowId={(row) => row.id}
        columns={columns}
        expansion={{ mode: "lazy", loadChildren, renderChildren: renderPets }}
      />,
    );
    const [caraToggle] = screen.getAllByRole("button", { name: "Details" });

    await user.click(caraToggle);
    expect(screen.getByLabelText("Loading details")).toBeInTheDocument();

    await act(async () => resolveRequest([{ id: "p1", name: "Rex" }]));
    expect(screen.getByText("Rex")).toBeVisible();

    await user.click(caraToggle);
    await user.click(caraToggle);
    expect(loadChildren).toHaveBeenCalledOnce();
  });

  it("lazy: shows an error with Retry when the loader fails", async () => {
    const user = userEvent.setup();
    const loadChildren = vi
      .fn<(row: Person, signal: AbortSignal) => Promise<Pet[]>>()
      .mockRejectedValueOnce(new Error("500"))
      .mockResolvedValueOnce([{ id: "p1", name: "Rex" }]);
    render(
      <DataTable
        caption="People"
        data={people}
        getRowId={(row) => row.id}
        columns={columns}
        expansion={{ mode: "lazy", loadChildren, renderChildren: renderPets }}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: "Details" })[0]);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't load the details.",
    );

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Rex")).toBeVisible();
    expect(loadChildren).toHaveBeenCalledTimes(2);
  });
});
