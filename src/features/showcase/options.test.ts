import { describe, expect, it } from "vitest";
import {
  DEFAULT_OPTIONS,
  parseShowcaseOptions,
  toSearchParams,
} from "./options.ts";

describe("showcase options", () => {
  it("uses the defaults for an empty URL", () => {
    expect(parseShowcaseOptions(new URLSearchParams())).toEqual(
      DEFAULT_OPTIONS,
    );
  });

  it("reads every option from its URL param", () => {
    const params = new URLSearchParams(
      "dataset=members&children=lazy&render=builtin&mode=server&size=large&scenario=slow",
    );

    expect(parseShowcaseOptions(params)).toEqual({
      dataset: "members",
      childRows: "lazy",
      childRender: "builtin",
      dataMode: "server",
      size: "large",
      scenario: "slow",
    });
  });

  it("ignores unknown values", () => {
    const params = new URLSearchParams("dataset=orders&mode=<script>");

    expect(parseShowcaseOptions(params)).toEqual(DEFAULT_OPTIONS);
  });

  it("writes only the options that differ from the defaults", () => {
    const params = toSearchParams({ ...DEFAULT_OPTIONS, dataMode: "server" });

    expect(params.toString()).toBe("mode=server");
  });

  it("round-trips through the URL", () => {
    const options = {
      ...DEFAULT_OPTIONS,
      dataset: "members" as const,
      size: "large" as const,
    };

    expect(parseShowcaseOptions(toSearchParams(options))).toEqual(options);
  });
});
