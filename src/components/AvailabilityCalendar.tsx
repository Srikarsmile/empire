'use client';

import { useMemo } from 'react';
import type { DateRange } from '@/data/propertyMeta';

interface AvailabilityCalendarProps {
  bookedRanges: DateRange[];
  checkIn: string;
  checkOut: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  onInvalidSelection?: (message: string) => void;
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function enumerateDays(from: string, to: string) {
  const start = parseDateKey(from);
  const end = parseDateKey(to);
  const keys: string[] = [];
  let cursor = normalizeDate(start);
  const endDate = normalizeDate(end);

  while (cursor <= endDate) {
    keys.push(formatDateKey(cursor));
    cursor = addDays(cursor, 1);
  }

  return keys;
}

function getMonthMatrix(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export default function AvailabilityCalendar({
  bookedRanges,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  onInvalidSelection,
}: AvailabilityCalendarProps) {
  const today = useMemo(() => normalizeDate(new Date()), []);

  const bookedSet = useMemo(() => {
    const set = new Set<string>();
    bookedRanges.forEach((range) => {
      enumerateDays(range.start, range.end).forEach((day) => set.add(day));
    });
    return set;
  }, [bookedRanges]);

  const monthStarts = useMemo(() => {
    const now = normalizeDate(new Date());
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const second = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return [first, second];
  }, []);

  const inSelectedRange = (dateKey: string) => {
    if (!checkIn || !checkOut) return false;
    return dateKey >= checkIn && dateKey <= checkOut;
  };

  const hasBlockedDateBetween = (from: string, to: string) => {
    const days = enumerateDays(from, to);
    // Exclude checkout day from blocking check.
    return days.slice(0, -1).some((day) => bookedSet.has(day));
  };

  const handleDateClick = (date: Date) => {
    const dateKey = formatDateKey(date);

    if (date < today || bookedSet.has(dateKey)) return;

    if (!checkIn || (checkIn && checkOut)) {
      onCheckInChange(dateKey);
      onCheckOutChange('');
      return;
    }

    if (dateKey <= checkIn) {
      onCheckInChange(dateKey);
      onCheckOutChange('');
      return;
    }

    if (hasBlockedDateBetween(checkIn, dateKey)) {
      onInvalidSelection?.('This range crosses unavailable dates. Pick an earlier checkout or different check-in.');
      return;
    }

    onCheckOutChange(dateKey);
  };

  return (
    <div className="availability-calendar">
      <div className="calendar-head">
        <p>Pick your check-in and check-out</p>
        <div className="calendar-legend">
          <span><i /> Available</span>
          <span><i className="booked" /> Unavailable</span>
          <span><i className="selected" /> Selected</span>
        </div>
      </div>

      <div className="calendar-months">
        {monthStarts.map((monthDate) => {
          const days = getMonthMatrix(monthDate);
          const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

          return (
            <div key={monthLabel} className="calendar-month">
              <h4>{monthLabel}</h4>
              <div className="calendar-weekdays">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="calendar-grid">
                {days.map((day) => {
                  const dayKey = formatDateKey(day);
                  const inMonth = day.getMonth() === monthDate.getMonth();
                  const isPast = day < today;
                  const isBooked = bookedSet.has(dayKey);
                  const isSelectedEdge = dayKey === checkIn || dayKey === checkOut;
                  const isInRange = inSelectedRange(dayKey);

                  return (
                    <button
                      type="button"
                      key={dayKey}
                      className={`calendar-day ${inMonth ? '' : 'outside'} ${isBooked ? 'booked' : ''} ${isInRange ? 'in-range' : ''} ${isSelectedEdge ? 'selected-edge' : ''}`}
                      disabled={!inMonth || isPast || isBooked}
                      onClick={() => handleDateClick(day)}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
