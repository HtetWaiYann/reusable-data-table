import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DataTable,
  type ColumnDef,
  type SortState,
} from "../components/data-table/index.ts";
import type { ClassSession } from "../features/timetable/types.ts";
import { useClassSessions } from "../features/timetable/useClassSessions.ts";
import { parseScenario } from "../mocks/api.ts";

// Built once: creating a formatter is slow, and every Time cell uses it.
const timeFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

// Outside the component so the array and its functions stay the same between renders.
const columns: ColumnDef<ClassSession>[] = [
  {
    id: "time",
    header: "Time",
    getValue: (row) => row.startsAt,
    renderCell: (row) => timeFormat.format(row.startsAt),
    sortable: true,
    width: 100,
    pinned: true,
  },
  {
    id: "class",
    header: "Class",
    getValue: (row) => row.name,
    sortable: true,
    width: 100,
    pinned: true,
  },
  {
    id: "instructor",
    header: "Instructor",
    getValue: (row) => row.instructor,
    sortable: true,
  },
  { id: "room", header: "Room", getValue: (row) => row.room, sortable: true },
  {
    id: "duration",
    header: "Duration",
    getValue: (row) => row.durationMinutes,
    renderCell: (row) => `${row.durationMinutes} min`,
    sortable: true,
  },
  {
    id: "spots",
    header: "Spots",
    getValue: (row) => row.booked,
    renderCell: (row) => `${row.booked} / ${row.capacity}`,
    sortable: true,
  },
];

const DEFAULT_SORT: SortState = { columnId: "time", direction: "asc" };

export default function TimetablePage(): ReactElement {
  // `?scenario=slow|error|empty` demos the table states; anything else loads normally.
  const [searchParams] = useSearchParams();
  const scenario = parseScenario(searchParams.get("scenario"));
  const sessions = useClassSessions(scenario);

  return (
    <>
      <h1>Class timetable</h1>
      <DataTable
        caption="Classes this week"
        data={sessions.data}
        getRowId={(row) => row.id}
        columns={columns}
        defaultSort={DEFAULT_SORT}
        isLoading={sessions.isLoading}
        error={sessions.error}
        onRetry={sessions.retry}
      />
    </>
  );
}
