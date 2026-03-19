'use client';

import { useMemo } from 'react';
import type { DateRange } from '@/lib/dateUtils';
import { normalizeDate, dateToKey, keyToDate, addDays } from '@/lib/dateUtils';

interface AvailabilityCalendarProps {
  bookedRanges: DateRange[];
  checkIn: string;
  checkOut: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  onInvalidSelection?: (message: string) => void;
}

function enumerateDays(from: string, to: string) {
  const start = keyToDate(from);
  const end = keyToDate(to);
  const keys: string[] = [];
  let cursor = normalizeDate(start);
  const endDate = normalizeDate(end);

  while (cursor <= endDate) {
    keys.push(dateToKey(cursor));
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
  const todayKey = useMemo(() => dateToKey(today), [today]);

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
    const dateKey = dateToKey(date);

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
      onInvalidSelection?.('This range crosses unavailable days. Pick an earlier return date or different pickup.');
      return;
    }

    onCheckOutChange(dateKey);
  };

  const hasDates = checkIn || checkOut;

  return (
    <div className="availability-calendar">
      <div className="calendar-head">
        <p>Pick your pickup and return dates</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="calendar-legend">
            <span><i /> Available</span>
            <span><i className="booked" /> Unavailable</span>
            <span><i className="selected" /> Selected</span>
          </div>
          {hasDates && (
            <button
              type="button"
              onClick={() => { onCheckInChange(''); onCheckOutChange(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                padding: '0.2rem 0.4rem',
                borderRadius: '0.4rem',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="calendar-months">
        {monthStarts.map((monthDate, index) => {
          const days = getMonthMatrix(monthDate);
          const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

          return (
            <div key={monthLabel} className={`calendar-month${index === 1 ? ' calendar-month--second' : ''}`}>
              <h4>{monthLabel}</h4>
              <div className="calendar-weekdays">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <span key={i}>{day}</span>
                ))}
              </div>

              <div className="calendar-grid">
                {days.map((day) => {
                  const dayKey = dateToKey(day);
                  const inMonth = day.getMonth() === monthDate.getMonth();
                  const isPast = day < today;
                  const isBooked = bookedSet.has(dayKey);
                  const isSelectedEdge = dayKey === checkIn || dayKey === checkOut;
                  const isInRange = inSelectedRange(dayKey);
                  const isToday = dayKey === todayKey;

                  return (
                    <button
                      type="button"
                      key={dayKey}
                      className={[
                        'calendar-day',
                        inMonth ? '' : 'outside',
                        isBooked ? 'booked' : '',
                        isInRange ? 'in-range' : '',
                        isSelectedEdge ? 'selected-edge' : '',
                        isToday ? 'today' : '',
                      ].filter(Boolean).join(' ')}
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
