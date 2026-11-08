import type { ReactElement } from "react";
import { useSorting } from "./hooks/useSorting.ts";
import { TableHeader } from "./TableHeader.tsx";
import { TableRow } from "./TableRow.tsx";
import type { DataTableProps } from "./types.ts";

/**
 * A reusable data table
 *
 * @param props - See {@link DataTableProps}.
 * @returns The table.
 * @example
 * const columns: ColumnDef<Person>[] = [
 *   { id: "name", header: "Name", getValue: (row) => row.name, sortable: true },
 * ];
 *
 * <DataTable
 *   caption="People"
 *   data={people}
 *   getRowId={(row) => row.id}
 *   columns={columns}
 *   defaultSort={{ columnId: "name", direction: "asc" }}
 * />
 */
export function DataTable<TRow, TChild = never>(
  props: DataTableProps<TRow, TChild>,
): ReactElement {
  const {
    data,
    getRowId,
    caption,
    columns,
    sort,
    defaultSort,
    onSortChange,
    manualSorting,
  } = props;

  const sorting = useSorting({
    data,
    columns,
    sort,
    defaultSort,
    onSortChange,
    manualSorting,
  });

  return (
    <table>
      <caption>{caption}</caption>
      <TableHeader
        columns={columns}
        sort={sorting.sort}
        onSort={sorting.toggleSort}
      />
      <tbody>
        {sorting.sortedRows.map((row) => (
          // Never use the index. After sorting, index keys would attach state to the wrong row.
          <TableRow key={getRowId(row)} row={row} columns={columns} />
        ))}
      </tbody>
    </table>
  );
}
