import type { MockScenario } from "../../mocks/api.ts";

/** Which dataset the table shows. Members is the second, differently shaped dataset. */
export type Dataset = "timetable" | "members";
/** How child rows arrive: with the parent row, or fetched when a row expands. */
export type ChildRowsMode = "inline" | "lazy";
/** Where sorting and paging happen: in the browser, or on the (fake) server. */
export type DataMode = "client" | "server";
/** Normal size, or the large dataset for the performance check. */
export type DataSize = "small" | "large";

/** Everything the control panel can change. Lives in the URL, so a setup can be shared or bookmarked. */
export interface ShowcaseOptions {
  dataset: Dataset;
  childRows: ChildRowsMode;
  dataMode: DataMode;
  size: DataSize;
  scenario: MockScenario;
}

/** Row counts per size. */
export const ROW_COUNTS: Record<DataSize, number> = { small: 50, large: 5000 };

export const DEFAULT_OPTIONS: ShowcaseOptions = {
  dataset: "timetable",
  childRows: "inline",
  dataMode: "client",
  size: "small",
  scenario: "normal",
};

// URL parameter name and allowed values for each option. Short names keep shared links readable.
const PARAMS: {
  [Key in keyof ShowcaseOptions]: {
    name: string;
    values: readonly ShowcaseOptions[Key][];
  };
} = {
  dataset: { name: "dataset", values: ["timetable", "members"] },
  childRows: { name: "children", values: ["inline", "lazy"] },
  dataMode: { name: "mode", values: ["client", "server"] },
  size: { name: "size", values: ["small", "large"] },
  scenario: { name: "scenario", values: ["normal", "slow", "error", "empty"] },
};

// Explicit list instead of Object.keys(), which TypeScript types as string[] and would need a cast.
const OPTION_KEYS: readonly (keyof ShowcaseOptions)[] = [
  "dataset",
  "childRows",
  "dataMode",
  "size",
  "scenario",
];

/** Returns the allowed value equal to `value`, or the fallback. `find` keeps the type, so no cast. */
function pick<TValue extends string>(
  value: string | null,
  allowed: readonly TValue[],
  fallback: TValue,
): TValue {
  return allowed.find((option) => option === value) ?? fallback;
}

/**
 * Reads the options from the URL. The URL is user input, so every value is checked against
 * its allowed list; anything unknown falls back to the default.
 *
 * @param params - The current search params.
 * @returns Valid options.
 */
export function parseShowcaseOptions(params: URLSearchParams): ShowcaseOptions {
  return {
    dataset: pick(
      params.get(PARAMS.dataset.name),
      PARAMS.dataset.values,
      DEFAULT_OPTIONS.dataset,
    ),
    childRows: pick(
      params.get(PARAMS.childRows.name),
      PARAMS.childRows.values,
      DEFAULT_OPTIONS.childRows,
    ),
    dataMode: pick(
      params.get(PARAMS.dataMode.name),
      PARAMS.dataMode.values,
      DEFAULT_OPTIONS.dataMode,
    ),
    size: pick(
      params.get(PARAMS.size.name),
      PARAMS.size.values,
      DEFAULT_OPTIONS.size,
    ),
    scenario: pick(
      params.get(PARAMS.scenario.name),
      PARAMS.scenario.values,
      DEFAULT_OPTIONS.scenario,
    ),
  };
}

/**
 * Writes the options as URL params, leaving out defaults so the plain URL stays clean.
 *
 * @param options - The options to write.
 * @returns Search params, e.g. `?dataset=members&mode=server`.
 */
export function toSearchParams(options: ShowcaseOptions): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of OPTION_KEYS) {
    if (options[key] !== DEFAULT_OPTIONS[key]) {
      params.set(PARAMS[key].name, options[key]);
    }
  }
  return params;
}
