import { useMemo, type ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable } from "../components/data-table/index.ts";
import {
  createLazyAttendeesExpansion,
  DEFAULT_TIMETABLE_SORT,
  inlineAttendeesExpansion,
  timetableColumns,
} from "../features/timetable/columns.tsx";
import styles from "../features/timetable/timetable.module.css";
import { useClassSessions } from "../features/timetable/useClassSessions.ts";
import { parseScenario } from "../mocks/api.ts";

type AttendeesMode = "inline" | "lazy";

export default function TimetablePage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  // `?scenario=slow|error|empty` demos the table states; anything else loads normally.
  const scenario = parseScenario(searchParams.get("scenario"));
  // `?attendees=lazy` switches the child rows to on-demand loading. Anything else means inline.
  const attendeesMode: AttendeesMode =
    searchParams.get("attendees") === "lazy" ? "lazy" : "inline";
  const sessions = useClassSessions(scenario);

  // Memoized on the scenario, so the lazy loader is the same function between renders.
  const expansion = useMemo(
    () =>
      attendeesMode === "lazy"
        ? createLazyAttendeesExpansion(scenario)
        : inlineAttendeesExpansion,
    [attendeesMode, scenario],
  );

  // Keeps the other URL params (e.g. ?scenario=) when switching mode.
  function handleModeChange(mode: AttendeesMode): void {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("attendees", mode);
      return next;
    });
  }

  return (
    <>
      <h1>Class timetable</h1>
      <fieldset className={styles.modeSwitch}>
        <legend>Attendees:</legend>
        <label>
          <input
            type="radio"
            name="attendees-mode"
            checked={attendeesMode === "inline"}
            onChange={() => handleModeChange("inline")}
          />
          Inline (loaded with the class)
        </label>
        <label>
          <input
            type="radio"
            name="attendees-mode"
            checked={attendeesMode === "lazy"}
            onChange={() => handleModeChange("lazy")}
          />
          Lazy (loaded on expand)
        </label>
      </fieldset>
      <DataTable
        // A different mode or API means a fresh table, so the lazy cache and open rows start clean.
        key={`${attendeesMode}-${scenario}`}
        caption="Classes this week"
        data={sessions.data}
        getRowId={(row) => row.id}
        columns={timetableColumns}
        defaultSort={DEFAULT_TIMETABLE_SORT}
        isLoading={sessions.isLoading}
        error={sessions.error}
        onRetry={sessions.retry}
        expansion={expansion}
      />
    </>
  );
}
