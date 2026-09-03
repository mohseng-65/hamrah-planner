import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PlanKind } from '../types';
import { periodLabel, shiftPeriod } from '../lib/jalali';
import { todayIso } from '../lib/format';

export function PeriodNav({ kind, date, onChange }: { kind: PlanKind; date: string; onChange: (iso: string) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#dce6de] bg-[#f7faf7] px-2 py-2">
      <button
        type="button"
        data-testid="period-next"
        onClick={() => onChange(shiftPeriod(kind, date, 1))}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-[#377250] hover:bg-white"
        aria-label="دوره‌ی بعد"
      >
        <ChevronRight size={18} />
      </button>
      <b className="flex-1 text-center text-xs leading-6 sm:text-sm">{periodLabel(kind, date)}</b>
      <button
        type="button"
        data-testid="period-prev"
        onClick={() => onChange(shiftPeriod(kind, date, -1))}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-[#377250] hover:bg-white"
        aria-label="دوره‌ی قبل"
      >
        <ChevronLeft size={18} />
      </button>
      <button type="button" data-testid="period-today" onClick={() => onChange(todayIso())} className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-[#17663b] ring-1 ring-[#d5e3d8]">
        اکنون
      </button>
    </div>
  );
}
