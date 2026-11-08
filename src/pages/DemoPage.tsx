import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { MembersTable } from "../features/members/MembersTable.tsx";
import { ControlPanel } from "../features/showcase/ControlPanel.tsx";
import {
  parseShowcaseOptions,
  toSearchParams,
  type Dataset,
  type ShowcaseOptions,
} from "../features/showcase/options.ts";
import { TimetableTable } from "../features/timetable/TimetableTable.tsx";

const TITLES: Record<Dataset, string> = {
  timetable: "Class timetable",
  members: "Members",
};

const DESCRIPTIONS: Record<Dataset, string> = {
  timetable:
    "This week's classes. Expand a class to see who booked, how they paid and whether they checked in.",
  members:
    "Studio members and their upcoming bookings. Same table component, different columns and data.",
};

/**
 * Route "/demo": the table playground. The control panel switches dataset and modes (second
 * dataset, server mode, lazy or built-in child rows, large data, API scenarios); the options live
 * in the URL, so every setup can be shared or bookmarked.
 *
 * @returns The page content.
 */
export default function DemoPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const options = parseShowcaseOptions(searchParams);

  function handleOptionsChange(next: ShowcaseOptions): void {
    setSearchParams(toSearchParams(next));
  }

  // Any option change remounts the table, so each setup starts clean: no stale cache, open rows,
  // or server-side sort/page from the previous setup.
  const tableKey = toSearchParams(options).toString();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-zinc-500">
          Table playground · one component, every configuration
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {TITLES[options.dataset]}
        </h1>
        <p className="text-pretty text-zinc-600">
          {DESCRIPTIONS[options.dataset]}
        </p>
      </header>
      <ControlPanel options={options} onChange={handleOptionsChange} />
      {options.dataset === "timetable" ? (
        <TimetableTable key={tableKey} options={options} />
      ) : (
        <MembersTable key={tableKey} options={options} />
      )}
    </div>
  );
}
