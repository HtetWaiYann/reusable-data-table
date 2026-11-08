import type { ReactElement } from "react";
import type {
  ColumnDef,
  ExpansionConfig,
  SortState,
} from "../../components/data-table/index.ts";
import { fetchChildren, type MockScenario } from "../../mocks/api.ts";
import { AttendeeTable } from "./AttendeeTable.tsx";
import { getAttendance, getClassStatus } from "./classStatus.ts";
import { StatusBadge, type BadgeTone } from "../common/StatusBadge.tsx";
import type { Attendee, ClassSession, ClassStatus } from "./types.ts";

const MS_PER_MINUTE = 60_000;

const CLASS_STATUS_TONE: Record<ClassStatus, BadgeTone> = {
  Scheduled: "neutral",
  Full: "warning",
  Cancelled: "danger",
};

// Built once: creating a formatter is slow, and every Time cell uses them.
const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

/** "Mon · 10:00 AM – 11:00 AM". The end is derived from the duration, never stored. */
function formatTimeRange(session: ClassSession): string {
  const endsAt = new Date(
    session.startsAt.getTime() + session.durationMinutes * MS_PER_MINUTE,
  );
  return `${dayFormat.format(session.startsAt)} · ${timeFormat.format(session.startsAt)} – ${timeFormat.format(endsAt)}`;
}

/** Timetable columns. Module level, so the array and its functions stay the same between renders. */
export const timetableColumns: ColumnDef<ClassSession>[] = [
  {
    id: "class",
    header: "Class",
    getValue: (row) => row.name,
    sortable: true,
    // The brief: pin the class name so it stays visible while scrolling sideways.
    pinned: true,
  },
  {
    id: "instructor",
    header: "Instructor",
    getValue: (row) => row.instructor,
    sortable: true,
  },
  {
    id: "time",
    header: "Time",
    // Sort by the real start time; display the formatted range.
    getValue: (row) => row.startsAt,
    renderCell: formatTimeRange,
    sortable: true,
  },
  {
    id: "attendance",
    header: "Attendance",
    getValue: getAttendance,
    renderCell: (row) => `${getAttendance(row)} / ${row.capacity}`,
    sortable: true,
  },
  {
    id: "status",
    header: "Status",
    getValue: getClassStatus,
    renderCell: (row) => {
      const status = getClassStatus(row);
      return <StatusBadge label={status} tone={CLASS_STATUS_TONE[status]} />;
    },
    sortable: true,
  },
];

/** Earliest class first. */
export const DEFAULT_TIMETABLE_SORT: SortState = {
  columnId: "time",
  direction: "asc",
};

/**
 * Custom render for attendees: a table with status badges. Added on top of the data-only configs
 * below; without it the DataTable draws its built-in child table from the same data.
 *
 * @param attendees - The class's attendees.
 * @param row - The class, for the nested table's accessible name.
 * @returns The attendee table.
 */
export function renderAttendees(
  attendees: Attendee[],
  row: ClassSession,
): ReactElement {
  return <AttendeeTable attendees={attendees} className={row.name} />;
}

/** Inline mode: attendees arrive with each class, so expanding is instant. Data only: no render. */
export const inlineAttendeesExpansion: ExpansionConfig<ClassSession, Attendee> =
  {
    mode: "inline",
    getChildren: (row) => row.attendees,
    // For the built-in child table: ids make good React keys but mean nothing to a reader.
    childIdKey: "id",
    hideChildKeys: ["id"],
  };

/**
 * Lazy mode: attendees are fetched when a class is expanded. Same child data as
 * inline, so the two modes are directly comparable. Call it inside `useMemo` to keep it stable.
 *
 * @param scenario - Fake API behaviour (from `?scenario=`).
 * @returns The lazy expansion config.
 */
export function createLazyAttendeesExpansion(
  scenario: MockScenario,
): ExpansionConfig<ClassSession, Attendee> {
  return {
    mode: "lazy",
    // A real API would fetch by `row.id`; the fake one is handed the class's attendees to return.
    loadChildren: (row, signal) =>
      fetchChildren(row.attendees, scenario, signal),
    childIdKey: "id",
    hideChildKeys: ["id"],
  };
}
