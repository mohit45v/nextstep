import { DISPLAY_LOCALE, DISPLAY_TIMEZONE } from "@/lib/constants";

/**
 * Formatting happens on the server, and the result is passed to client
 * components as a plain string.
 *
 * Rendering a Date in the browser instead would format it in the visitor's
 * timezone on the client and the server's timezone during SSR — the classic
 * hydration mismatch. Pinning locale and timezone makes both passes agree, and
 * the college is in one timezone anyway.
 */

const dateTime = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  timeZone: DISPLAY_TIMEZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateOnly = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  timeZone: DISPLAY_TIMEZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDateTime(value: Date): string {
  return dateTime.format(value);
}

export function formatDate(value: Date): string {
  return dateOnly.format(value);
}

/** 125 → "2m 05s". Used for both a whole paper and one question. */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}
