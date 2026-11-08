import type { ReactElement } from "react";

/** How a status reads: neutral, done well, needs attention, or went wrong. */
export type BadgeTone = "neutral" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-zinc-100 text-zinc-700",
  success: "bg-teal-50 text-teal-800",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-red-50 text-red-700",
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-zinc-400",
  success: "bg-teal-600",
  warning: "bg-amber-500",
  danger: "bg-red-600",
};

/** Props of {@link StatusBadge}. */
export interface StatusBadgeProps {
  label: string;
  tone: BadgeTone;
}

/**
 * A small status label with a coloured dot. The text always says the status; colour only
 * reinforces it, so it never relies on colour alone.
 *
 * @param props - See {@link StatusBadgeProps}.
 * @returns The badge.
 */
export function StatusBadge({ label, tone }: StatusBadgeProps): ReactElement {
  return (
    // h-5 = the row's 20px line, and align-top keeps it inside that line, so rows with a badge
    // stay as tall as skeleton rows (on the baseline it stretched the row by half a pixel).
    <span
      className={`inline-flex h-5 items-center gap-1.5 rounded-md px-2 align-top text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      <span
        className={`size-1.5 rounded-full ${DOT_CLASSES[tone]}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
