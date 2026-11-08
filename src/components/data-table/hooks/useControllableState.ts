import { useCallback, useEffect, useRef, useState } from "react";

/** Options for {@link useControllableState}. */
export interface UseControllableStateOptions<TValue> {
  /** The parent's value. `undefined` means uncontrolled; `null` still counts as controlled. */
  value: TValue | undefined;
  /** Starting value when uncontrolled. Only read on mount. */
  defaultValue: TValue;
  /** Called on every change, controlled or not. */
  onChange?: (next: TValue) => void;
  /** Prop name for the dev warning, e.g. "sort". */
  name: string;
}

/**
 * A value that can be controlled or uncontrolled, like `<input value>` vs `defaultValue`.
 *
 * @typeParam TValue - Any type except `undefined`, since `undefined` means "not passed".
 * @param options - See {@link UseControllableStateOptions}.
 * @returns The current value and a setter.
 * @example
 * const [sort, setSort] = useControllableState({
 *   value: props.sort,
 *   defaultValue: props.defaultSort ?? null,
 *   onChange: props.onSortChange,
 *   name: "sort",
 * });
 */
export function useControllableState<
  TValue extends NonNullable<unknown> | null,
>({
  value,
  defaultValue,
  onChange,
  name,
}: UseControllableStateOptions<TValue>): [TValue, (next: TValue) => void] {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;

  // Switching modes mid-life makes the value jump, so we warn like React does for inputs.
  const wasControlledRef = useRef(isControlled);
  useEffect(() => {
    if (import.meta.env.DEV && wasControlledRef.current !== isControlled) {
      const [from, to] = isControlled
        ? ["uncontrolled", "controlled"]
        : ["controlled", "uncontrolled"];
      console.warn(
        `DataTable: \`${name}\` switched from ${from} to ${to}. Pass the prop on every render or never.`,
      );
    }
    wasControlledRef.current = isControlled;
  }, [isControlled, name]);

  const setValue = useCallback(
    (next: TValue) => {
      // When controlled, the parent decides whether the change sticks.
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [isControlled ? value : internalValue, setValue];
}
