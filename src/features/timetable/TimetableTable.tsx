import { useMemo, type ReactElement } from "react";
import {
  DataTable,
  type ExpansionConfig,
} from "../../components/data-table/index.ts";
import { getClassSessions } from "../../mocks/timetable.ts";
import { ROW_COUNTS, type ShowcaseOptions } from "../showcase/options.ts";
import { useTableData } from "../showcase/useTableData.ts";
import {
  createLazyAttendeesExpansion,
  DEFAULT_TIMETABLE_SORT,
  inlineAttendeesExpansion,
  renderAttendees,
  timetableColumns,
} from "./columns.tsx";
import type { Attendee, ClassSession } from "./types.ts";

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

  // Memoized on what it depends on, so it stays the same object between renders.
  const expansion = useMemo((): ExpansionConfig<ClassSession, Attendee> => {
    const dataOnly =
      options.childRows === "lazy"
        ? createLazyAttendeesExpansion(options.scenario)
        : inlineAttendeesExpansion;
    // Custom adds our own render; built-in passes the data alone and the table draws the rest.
    return options.childRender === "custom"
      ? { ...dataOnly, renderChildren: renderAttendees }
      : dataOnly;
  }, [options.childRows, options.childRender, options.scenario]);

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
