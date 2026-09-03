import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { createMonth, jalaliDate } from '../lib/jalali';
import { dateFromIso, digits, formatShort, jalaliMonth, todayIso, toIso, weekDays } from '../lib/format';

export function JalaliDatePicker({
  value,
  onChange,
  testId,
  label,
}: {
  value: string;
  onChange: (date: string) => void;
  testId: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(() => dateFromIso(value));
  const month = useMemo(() => createMonth(anchor), [anchor]);

  const chooseDate = (iso: string) => {
    onChange(iso);
    setAnchor(dateFromIso(iso));
    setOpen(false);
  };
  const previousMonth = () => setAnchor(new Date(month.first.getFullYear(), month.first.getMonth(), month.first.getDate() - 1));
  const nextMonth = () => setAnchor(month.afterLast);

  return (
    <div className="jalali-picker">
      <span className="label mt-0">{label}</span>
      <button
        type="button"
        data-testid={testId}
        onClick={() => {
          setAnchor(dateFromIso(value));
          setOpen((shown) => !shown);
        }}
        className="jalali-picker-trigger"
        aria-expanded={open}
      >
        <CalendarDays size={18} />
        <span>{formatShort(value)}</span>
        <ChevronLeft className="mr-auto" size={18} />
      </button>
      {open && (
        <div data-testid={`${testId}-menu`} className="jalali-picker-menu">
          <div className="flex items-center justify-between border-b border-[#e3e9e4] px-2 py-2">
            <button type="button" onClick={nextMonth} className="date-nav-button" aria-label="ماه بعد">
              <ChevronRight size={18} />
            </button>
            <b className="text-sm">{jalaliMonth.format(anchor)}</b>
            <button type="button" onClick={previousMonth} className="date-nav-button" aria-label="ماه قبل">
              <ChevronLeft size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 px-2 pt-2 text-center text-[11px] font-bold text-[#718177]">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 p-2">
            {Array.from({ length: month.blankDays }).map((_, index) => (
              <span key={`blank-${index}`} />
            ))}
            {month.calendarDays.map((date) => {
              const iso = toIso(date);
              const selected = iso === value;
              const today = iso === todayIso();
              return (
                <button
                  type="button"
                  key={iso}
                  data-testid={`${testId}-day-${iso}`}
                  onClick={() => chooseDate(iso)}
                  className={`date-picker-day ${selected ? 'selected' : today ? 'today' : ''}`}
                >
                  {digits.format(jalaliDate(date).day)}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => chooseDate(todayIso())} className="mx-2 mb-2 min-h-9 w-[calc(100%-1rem)] rounded-lg bg-[#edf5ef] text-xs font-bold text-[#17663b]">
            امروز
          </button>
        </div>
      )}
    </div>
  );
}
