import { useMemo, type ReactElement } from "react";
import { DataTable } from "../../components/data-table/index.ts";
import { getClassSessions } from "../../mocks/timetable.ts";
import { ROW_COUNTS, type ShowcaseOptions } from "../showcase/options.ts";
import { useTableData } from "../showcase/useTableData.ts";
import {
  createLazyAttendeesExpansion,
  DEFAULT_TIMETABLE_SORT,
  inlineAttendeesExpansion,
  timetableColumns,
} from "./columns.tsx";

/** Props of {@link TimetableTable}. */
export interface TimetableTableProps {
  options: ShowcaseOptions;
}

/**
 * The class timetable: classes as parent rows, attendees as child rows, configured by the control panel.
 *
 * @param props - See {@link TimetableTableProps}.
 * @returns The table.
 */
export function TimetableTable({ options }: TimetableTableProps): ReactElement {
  const dataProps = useTableData({
    rows: getClassSessions(ROW_COUNTS[options.size]),
    columns: timetableColumns,
    dataMode: options.dataMode,
    scenario: options.scenario,
    defaultSort: DEFAULT_TIMETABLE_SORT,
    errorMessage: "We couldn't load the timetable. Please try again.",
  });

  // Memoized on what the lazy loader depends on, so it stays the same function between renders.
  const expansion = useMemo(
    () =>
      options.childRows === "lazy"
        ? createLazyAttendeesExpansion(options.scenario)
        : inlineAttendeesExpansion,
    [options.childRows, options.scenario],
  );

  return (
    <DataTable
      caption="Classes this week"
      getRowId={(row) => row.id}
      columns={timetableColumns}
      expansion={expansion}
      {...dataProps}
    />
  );
}
