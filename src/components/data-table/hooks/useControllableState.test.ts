import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  useControllableState,
  type UseControllableStateOptions,
} from "./useControllableState.ts";

type Options = UseControllableStateOptions<string | null>;

function renderControllable(initialProps: Options) {
  return renderHook((props: Options) => useControllableState(props), {
    initialProps,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useControllableState — uncontrolled", () => {
  it("starts at defaultValue", () => {
    const { result } = renderControllable({
      value: undefined,
      defaultValue: "a",
      name: "test",
    });

    expect(result.current[0]).toBe("a");
  });

  it("updates its own value and calls onChange", () => {
    const onChange = vi.fn();
    const { result } = renderControllable({
      value: undefined,
      defaultValue: "a",
      onChange,
      name: "test",
    });

    act(() => result.current[1]("b"));

    expect(result.current[0]).toBe("b");
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("ignores later changes to defaultValue", () => {
    const { result, rerender } = renderControllable({
      value: undefined,
      defaultValue: "a",
      name: "test",
    });

    rerender({ value: undefined, defaultValue: "z", name: "test" });

    expect(result.current[0]).toBe("a");
  });
});

describe("useControllableState — controlled", () => {
  it("calls onChange but keeps the prop value until the parent rerenders", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderControllable({
      value: "a",
      defaultValue: "ignored",
      onChange,
      name: "test",
    });

    act(() => result.current[1]("b"));

    expect(onChange).toHaveBeenCalledWith("b");
    expect(result.current[0]).toBe("a");

    rerender({ value: "b", defaultValue: "ignored", onChange, name: "test" });

    expect(result.current[0]).toBe("b");
  });

  it("treats null as a controlled value, not as uncontrolled", () => {
    const { result } = renderControllable({
      value: null,
      defaultValue: "a",
      name: "test",
    });

    expect(result.current[0]).toBeNull();
  });
});

describe("useControllableState — mode switch", () => {
  it("warns in dev when switching from controlled to uncontrolled", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = renderControllable({
      value: "a",
      defaultValue: "a",
      name: "sort",
    });

    rerender({ value: undefined, defaultValue: "a", name: "sort" });

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain(
      "`sort` switched from controlled to uncontrolled",
    );
  });

  it("doesn't warn while the mode stays the same", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = renderControllable({
      value: "a",
      defaultValue: "a",
      name: "sort",
    });

    rerender({ value: "b", defaultValue: "a", name: "sort" });

    expect(warn).not.toHaveBeenCalled();
  });
});
