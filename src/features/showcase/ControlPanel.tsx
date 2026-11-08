import type { ReactElement } from "react";
import type { MockScenario } from "../../mocks/api.ts";
import type { ShowcaseOptions } from "./options.ts";
import styles from "./showcase.module.css";

/** One radio group: a label and its choices. */
interface RadioGroupProps<TValue extends string> {
  legend: string;
  name: string;
  value: TValue;
  choices: readonly { value: TValue; label: string }[];
  onChange: (value: TValue) => void;
}

function RadioGroup<TValue extends string>({
  legend,
  name,
  value,
  choices,
  onChange,
}: RadioGroupProps<TValue>): ReactElement {
  return (
    // fieldset + legend: screen readers read "Dataset, Class timetable, radio button, 1 of 2".
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      {choices.map((choice) => (
        <label key={choice.value} className={styles.choice}>
          <input
            type="radio"
            name={name}
            checked={value === choice.value}
            onChange={() => onChange(choice.value)}
          />
          {choice.label}
        </label>
      ))}
    </fieldset>
  );
}

const SCENARIO_LABELS: Record<MockScenario, string> = {
  normal: "Normal",
  slow: "Slow (3 s)",
  error: "Error",
  empty: "Empty",
};
const SCENARIOS: readonly MockScenario[] = ["normal", "slow", "error", "empty"];

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
  return (
    <section className={styles.panel} aria-label="Table options">
      <p className={styles.hint}>
        One table component, configured differently: switch the dataset and
        modes to see it reused.
      </p>
      <div className={styles.groups}>
        <RadioGroup
          legend="Dataset"
          name="dataset"
          value={options.dataset}
          choices={[
            { value: "timetable", label: "Class timetable" },
            { value: "members", label: "Members" },
          ]}
          onChange={(dataset) => onChange({ ...options, dataset })}
        />
        <RadioGroup
          legend="Child rows"
          name="children"
          value={options.childRows}
          choices={[
            { value: "inline", label: "Inline" },
            { value: "lazy", label: "Lazy (on expand)" },
          ]}
          onChange={(childRows) => onChange({ ...options, childRows })}
        />
        <RadioGroup
          legend="Sort & page"
          name="mode"
          value={options.dataMode}
          choices={[
            { value: "client", label: "Client-side" },
            { value: "server", label: "Server-side" },
          ]}
          onChange={(dataMode) => onChange({ ...options, dataMode })}
        />
        <RadioGroup
          legend="Data size"
          name="size"
          value={options.size}
          choices={[
            { value: "small", label: "50 rows" },
            { value: "large", label: "5,000 rows" },
          ]}
          onChange={(size) => onChange({ ...options, size })}
        />
        <label className={styles.group}>
          <span className={styles.legend}>API</span>
          <select
            className={styles.select}
            value={options.scenario}
            onChange={(event) =>
              onChange({
                ...options,
                // The value always comes from our own <option>s, so find() always matches.
                scenario:
                  SCENARIOS.find(
                    (scenario) => scenario === event.target.value,
                  ) ?? "normal",
              })
            }
          >
            {SCENARIOS.map((scenario) => (
              <option key={scenario} value={scenario}>
                {SCENARIO_LABELS[scenario]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
