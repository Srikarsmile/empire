/**
 * Shared date utility functions used across components.
 * Consolidates duplicated date logic from FleetExplorer and ReservationFlow.
 */

export interface DateRange {
  start: string;
  end: string;
}

/** Normalize a date to midnight (strip time) */
export function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Convert a Date to a YYYY-MM-DD key string */
export function dateToKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Convert a YYYY-MM-DD key string to a Date (at midnight) */
export function keyToDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Add (or subtract) days from a Date */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Get an array of YYYY-MM-DD keys for each night in a stay */
export function getStayNights(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  let cursor = normalizeDate(keyToDate(checkIn));
  const end = normalizeDate(keyToDate(checkOut));

  while (cursor < end) {
    nights.push(dateToKey(cursor));
    cursor = addDays(cursor, 1);
  }

  return nights;
}

/** Build a Set of all booked day keys from an array of DateRange */
export function getBookedSet(ranges: DateRange[]): Set<string> {
  const set = new Set<string>();

  ranges.forEach((range) => {
    let cursor = keyToDate(range.start);
    const end = keyToDate(range.end);

    while (cursor < end) {
      set.add(dateToKey(cursor));
      cursor = addDays(cursor, 1);
    }
  });

  return set;
}

/** Format a YYYY-MM-DD string to a human-readable short date */
export function formatDateShort(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format a YYYY-MM-DD string to a human-readable long date */
export function formatDateLong(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
