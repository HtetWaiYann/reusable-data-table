import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import { useId, useState, type ReactElement } from "react";
import type { MockScenario } from "../../mocks/api.ts";
import { SegmentedControl } from "../common/SegmentedControl.tsx";
import type { ShowcaseOptions } from "./options.ts";

const SCENARIO_CHOICES: readonly { value: MockScenario; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "slow", label: "Slow (3 s)" },
  { value: "error", label: "Error" },
  { value: "empty", label: "Empty" },
];

/** Props of {@link ControlPanel}. */
export interface ControlPanelProps {
  options: ShowcaseOptions;
  onChange: (options: ShowcaseOptions) => void;
}

/**
 * Switches between the scenarios the brief asks to show, all on the same table component.
 *
 * @param props - See {@link ControlPanelProps}.
 * @returns The panel.
 */
export function ControlPanel({
  options,
  onChange,
}: ControlPanelProps): ReactElement {
  // Open on first load, so testers see the options straight away.
  const [isOpen, setIsOpen] = useState(true);
  const contentId = useId();
  const titleId = useId();
  const descriptionId = useId();

  return (
    // Not <details>: the browser hides its content instantly on close, so only opening could animate.
    // A button + aria-expanded + the same 0fr → 1fr grid as the table's expanded rows animates both ways.
    // Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
    <section
      data-open={isOpen}
      className="group rounded-xl border border-zinc-200 bg-white shadow-xs"
    >
      {/* The heading wraps the button (APG accordion), so screen-reader users can jump to it by heading. */}
      <h2>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          // Name is just the title; the description is read as a description, not as part of the name.
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          onClick={() => setIsOpen((open) => !open)}
          // Inner radius = card radius minus its 1px border, so the hover fill meets the corners.
          // Square bottom corners while open: the hover fill stops flat at the divider below.
          className="flex w-full cursor-pointer items-start gap-3 rounded-[calc(var(--radius-xl)-1px)] p-4 text-left transition-colors duration-200 ease-out-soft group-data-[open=true]:rounded-b-none hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:p-5"
        >
          <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
            <AdjustmentsHorizontalIcon className="size-4" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span id={titleId} className="text-sm font-semibold">
              Table setup
            </span>
            <span
              id={descriptionId}
              className="text-sm font-normal text-pretty text-zinc-500"
            >
              One table component, configured differently. Every choice is saved
              in the URL, so a setup can be shared.
            </span>
          </span>
          {/* Points down when open, right when closed. Decorative: aria-expanded announces the state. */}
          <ChevronDownIcon
            className="mt-1.5 ml-auto size-5 flex-none text-zinc-400 transition-transform duration-300 ease-out-soft group-data-[open=false]:-rotate-90 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </button>
      </h2>
      {/* grid-template-rows 0fr → 1fr animates to the content's natural height, which height: auto can't.
          inert while closed: the hidden radios can't be tabbed to or read. */}
      <div
        id={contentId}
        inert={!isOpen}
        className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out-soft group-data-[open=true]:grid-rows-[1fr] motion-reduce:transition-none"
      >
        {/* min-h-0 lets the row shrink below the content; overflow-hidden clips the rest. */}
        <div className="min-h-0 overflow-hidden">
          {/* The divider lives inside the clipped area, so it collapses away with the options. */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 border-t border-zinc-200 p-4 sm:p-5">
            <SegmentedControl
              legend="Dataset"
              name="dataset"
              value={options.dataset}
              choices={[
                { value: "members", label: "Members" },
                { value: "timetable", label: "Class timetable" },
              ]}
              onChange={(dataset) => onChange({ ...options, dataset })}
            />
            <SegmentedControl
              legend="Child rows"
              name="children"
              value={options.childRows}
              choices={[
                { value: "inline", label: "Inline" },
                { value: "lazy", label: "Lazy (on expand)" },
              ]}
              onChange={(childRows) => onChange({ ...options, childRows })}
            />
            <SegmentedControl
              legend="Child render"
              name="render"
              value={options.childRender}
              choices={[
                { value: "custom", label: "Custom" },
                { value: "builtin", label: "Built-in (data only)" },
              ]}
              onChange={(childRender) => onChange({ ...options, childRender })}
            />
            <SegmentedControl
              legend="Sort & page"
              name="mode"
              value={options.dataMode}
              choices={[
                { value: "client", label: "Client-side" },
                { value: "server", label: "Server-side" },
              ]}
              onChange={(dataMode) => onChange({ ...options, dataMode })}
            />
            <SegmentedControl
              legend="Data size"
              name="size"
              value={options.size}
              choices={[
                { value: "small", label: "50 rows" },
                { value: "large", label: "50,000 rows" },
              ]}
              onChange={(size) => onChange({ ...options, size })}
            />
            <SegmentedControl
              legend="API response"
              name="scenario"
              value={options.scenario}
              choices={SCENARIO_CHOICES}
              onChange={(scenario) => onChange({ ...options, scenario })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
