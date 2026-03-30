'use client';

import { useMemo } from 'react';
import { getBookedSet, dateToKey, addDays, normalizeDate } from '@/lib/dateUtils';
import type { DateRange } from '@/lib/dateUtils';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function MonthGrid({ year, month, bookedSet, todayKey }: {
  year: number;
  month: number; // 0-indexed
  bookedSet: Set<string>;
  todayKey: string;
}) {
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay(); // 0=Sun

  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">
        {MONTH_NAMES[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} />;
          }
          const m = String(month + 1).padStart(2, '0');
          const d = String(day).padStart(2, '0');
          const key = `${year}-${m}-${d}`;
          const isToday = key === todayKey;
          const isBooked = bookedSet.has(key);
          const isPast = key < todayKey;

          let cls = 'text-xs rounded-full w-7 h-7 mx-auto flex items-center justify-center ';
          if (isToday) {
            cls += isBooked
              ? 'bg-red-500 text-white ring-2 ring-offset-1 ring-red-400'
              : 'ring-2 ring-offset-1 ring-gray-800 font-bold text-gray-900';
          } else if (isBooked) {
            cls += 'bg-red-100 text-red-500 line-through';
          } else if (isPast) {
            cls += 'text-gray-300';
          } else {
            cls += 'text-gray-700 hover:bg-gray-100';
          }

          return (
            <div key={key} className={cls} aria-label={isBooked ? `${key} unavailable` : key}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AvailabilityDisplay({ bookedRanges }: { bookedRanges: DateRange[] }) {
  const bookedSet = useMemo(() => getBookedSet(bookedRanges), [bookedRanges]);
  const today = normalizeDate(new Date());
  const todayKey = dateToKey(today);

  const months = useMemo(() => {
    const result: { year: number; month: number }[] = [];
    let cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let i = 0; i < 3; i++) {
      result.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
      cursor = addDays(cursor, 32);
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    }
    return result;
  }, [today]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-100 border border-red-300 inline-block" /> Unavailable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-white border border-gray-800 inline-block" /> Today
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            bookedSet={bookedSet}
            todayKey={todayKey}
          />
        ))}
      </div>
    </div>
  );
}
