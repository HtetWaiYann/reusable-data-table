import type { ReactElement } from "react";

/** Props of {@link SegmentedControl}. */
export interface SegmentedControlProps<TValue extends string> {
  legend: string;
  name: string;
  value: TValue;
  choices: readonly { value: TValue; label: string }[];
  onChange: (value: TValue) => void;
}

/**
 * A segmented control (pick one of a few). Each segment is a real radio input, visually hidden with
 * sr-only but still focusable, so arrow keys move between choices and screen readers announce
 * "Dataset, Class timetable, radio button, 1 of 2", with no ARIA or key handling of our own.
 *
 * @param props - See {@link SegmentedControlProps}.
 * @returns The labelled group of choices.
 */
export function SegmentedControl<TValue extends string>({
  legend,
  name,
  value,
  choices,
  onChange,
}: SegmentedControlProps<TValue>): ReactElement {
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5">
      <legend className="mb-1.5 text-xs font-medium text-zinc-500">
        {legend}
      </legend>
      {/* Outer radius 8px with 4px padding → segments use 4px (rounded-sm), so the corners nest evenly. */}
      <div className="inline-flex w-max max-w-full flex-wrap gap-0.5 rounded-lg bg-zinc-100 p-1">
        {choices.map((choice) => (
          <label key={choice.value} className="relative">
            <input
              type="radio"
              name={name}
              className="peer sr-only"
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
            />
            <span className="block cursor-pointer rounded-sm px-3 py-1 text-sm font-medium whitespace-nowrap text-zinc-600 transition-colors duration-200 ease-out-soft peer-checked:bg-white peer-checked:text-zinc-900 peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:text-zinc-900">
              {choice.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
