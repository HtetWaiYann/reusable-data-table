import type { ReactElement } from "react";
import type { SortDirection } from "./types.ts";

// Inline SVGs so the generic table ships with no icon dependency. All are decorative (aria-hidden):
// the buttons around them carry the accessible name or state. 20×20 grid, drawn with currentColor
// so they follow the text colour.

interface IconProps {
  className?: string;
}

/** Up for ascending, down for descending, both for "sortable, not sorted". */
export function SortIcon({
  direction,
  className,
}: IconProps & { direction: SortDirection | "none" }): ReactElement {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      data-direction={direction}
    >
      {direction !== "desc" && <path d="M10 4.5 14 9H6l4-4.5Z" />}
      {direction !== "asc" && <path d="M10 15.5 6 11h8l-4 4.5Z" />}
    </svg>
  );
}

/** Points right; the stylesheet rotates it down when the row is open. */
export function ChevronRightIcon({ className }: IconProps): ReactElement {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m8 5 5 5-5 5" />
    </svg>
  );
}

/** Points left; for "Previous page". */
export function ChevronLeftIcon({ className }: IconProps): ReactElement {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m12 5-5 5 5 5" />
    </svg>
  );
}

/** Exclamation in a circle, for the error state. */
export function AlertIcon({ className }: IconProps): ReactElement {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6.5v4" />
      <path d="M10 13.5h.01" />
    </svg>
  );
}
