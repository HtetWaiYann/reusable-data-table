import { useMemo, type ReactElement } from "react";
import {
  DataTable,
  type ColumnDef,
  type ExpansionConfig,
  type SortState,
} from "../../components/data-table/index.ts";
import { fetchChildren, type MockScenario } from "../../mocks/api.ts";
import { getMembers } from "../../mocks/members.ts";
import { ROW_COUNTS, type ShowcaseOptions } from "../showcase/options.ts";
import { useTableData } from "../showcase/useTableData.ts";
import { BookingTable } from "./BookingTable.tsx";
import type { Booking, Member } from "./types.ts";

// Built once: creating a formatter is slow.
const joinedFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  year: "numeric",
});

// Module level, so the array and its functions stay the same between renders.
const memberColumns: ColumnDef<Member>[] = [
  {
    id: "name",
    header: "Name",
    getValue: (row) => row.name,
    sortable: true,
    pinned: true,
  },
  { id: "plan", header: "Plan", getValue: (row) => row.plan, sortable: true },
  {
    id: "joined",
    header: "Joined",
    getValue: (row) => row.joinedAt,
    renderCell: (row) => joinedFormat.format(row.joinedAt),
    sortable: true,
  },
  {
    id: "visits",
    header: "Visits (30 days)",
    getValue: (row) => row.visits,
    sortable: true,
  },
  {
    id: "bookings",
    header: "Upcoming",
    getValue: (row) => row.bookings.length,
    sortable: true,
  },
];

const DEFAULT_MEMBER_SORT: SortState = { columnId: "name", direction: "asc" };

// Custom render, added on top of the data-only configs below when "Custom" is picked.
function renderBookings(bookings: Booking[], row: Member) {
  return <BookingTable bookings={bookings} memberName={row.name} />;
}

const inlineBookingsExpansion: ExpansionConfig<Member, Booking> = {
  mode: "inline",
  getChildren: (row) => row.bookings,
  childIdKey: "id",
  hideChildKeys: ["id"],
};

function createLazyBookingsExpansion(
  scenario: MockScenario,
): ExpansionConfig<Member, Booking> {
  return {
    mode: "lazy",
    loadChildren: (row, signal) =>
      fetchChildren(row.bookings, scenario, signal),
    childIdKey: "id",
    hideChildKeys: ["id"],
  };
}

/** Props of {@link MembersTable}. */
export interface MembersTableProps {
  options: ShowcaseOptions;
}

/**
 * The second, differently shaped dataset: members with their bookings as child rows. Same
 * DataTable, different columns and data, which is what shows the component isn't tied to classes.
 *
 * @param props - See {@link MembersTableProps}.
 * @returns The table.
 */
export function MembersTable({ options }: MembersTableProps): ReactElement {
  const dataProps = useTableData({
    rows: getMembers(ROW_COUNTS[options.size]),
    columns: memberColumns,
    dataMode: options.dataMode,
    scenario: options.scenario,
    defaultSort: DEFAULT_MEMBER_SORT,
    errorMessage: "We couldn't load the members. Please try again.",
  });

  const expansion = useMemo((): ExpansionConfig<Member, Booking> => {
    const dataOnly =
      options.childRows === "lazy"
        ? createLazyBookingsExpansion(options.scenario)
        : inlineBookingsExpansion;
    return options.childRender === "custom"
      ? { ...dataOnly, renderChildren: renderBookings }
      : dataOnly;
  }, [options.childRows, options.childRender, options.scenario]);

  return (
    <DataTable
      caption="Members"
      getRowId={(row) => row.id}
      columns={memberColumns}
      expansion={expansion}
      {...dataProps}
    />
  );
}
