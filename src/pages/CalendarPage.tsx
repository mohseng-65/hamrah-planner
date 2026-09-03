import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Category, PlanKind, PlannerData } from '../types';
import { digits, formatFull, jalaliMonth, todayIso, toIso, weekDays } from '../lib/format';
import { createMonth, jalaliDate } from '../lib/jalali';
import { EmptyState, PageHeading, SectionTitle } from '../components/common';
import { PlanRow } from '../components/PlanRow';

export function CalendarPage({
  data,
  categoryById,
  togglePlan,
  onAddPlanForDate,
}: {
  data: PlannerData;
  categoryById: (id: string) => Category | undefined;
  togglePlan: (id: string) => void;
  onAddPlanForDate: (iso: string, kind: PlanKind) => void;
}) {
  const [calendarAnchor, setCalendarAnchor] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(todayIso());

  const calendar = useMemo(() => createMonth(calendarAnchor), [calendarAnchor]);
  // Only داily plans have a real calendar-day meaning; weekly/monthly/yearly plans live on the Planner page instead.
  const dailyPlans = useMemo(() => data.plans.filter((plan) => plan.kind === 'روزانه'), [data.plans]);
  const selectedPlans = dailyPlans.filter((plan) => plan.date === selectedCalendarDate);

  return (
    <section data-testid="calendar-page" className="space-y-5">
      <PageHeading title="تقویم شمسی" description="روزهای دارای برنامه با نقطه رنگی مشخص شده‌اند." icon={CalendarDays} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <section className="planner-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e2e9e3] px-4 py-4 sm:px-6">
            <button data-testid="next-calendar-month" onClick={() => setCalendarAnchor(calendar.afterLast)} className="grid size-10 place-items-center rounded-xl text-[#377250] hover:bg-[#e9f2ea]" aria-label="ماه بعد">
              <ChevronRight size={21} />
            </button>
            <h2 data-testid="calendar-month-title" className="text-base font-black sm:text-lg">{jalaliMonth.format(calendarAnchor)}</h2>
            <button
              data-testid="previous-calendar-month"
              onClick={() => setCalendarAnchor(new Date(calendar.first.getFullYear(), calendar.first.getMonth(), calendar.first.getDate() - 1))}
              className="grid size-10 place-items-center rounded-xl text-[#377250] hover:bg-[#e9f2ea]"
              aria-label="ماه قبل"
            >
              <ChevronLeft size={21} />
            </button>
          </div>
          <div className="grid grid-cols-7 border-b border-[#e2e9e3] bg-[#f7faf7] px-2 py-2 text-center text-xs font-bold text-[#6e8275]">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 p-2 sm:gap-2 sm:p-4">
            {Array.from({ length: calendar.blankDays }).map((_, index) => (
              <div key={`blank-${index}`} />
            ))}
            {calendar.calendarDays.map((date) => {
              const iso = toIso(date);
              const scheduled = dailyPlans.filter((plan) => plan.date === iso);
              const active = iso === selectedCalendarDate;
              const today = iso === todayIso();
              return (
                <button
                  key={iso}
                  data-testid={`calendar-day-${iso}`}
                  onClick={() => setSelectedCalendarDate(iso)}
                  className={`relative flex aspect-square min-h-10 flex-col items-center justify-center rounded-xl text-sm font-bold ${
                    active ? 'bg-[#0e6038] text-white shadow-md' : today ? 'bg-[#e5f1e7] text-[#0b6035]' : 'text-[#415749] hover:bg-[#eef4ef]'
                  }`}
                >
                  <span>{digits.format(jalaliDate(date).day)}</span>
                  {scheduled.length > 0 && <i className="mt-1 block size-1.5 rounded-full" style={{ background: categoryById(scheduled[0].categoryId)?.color ?? '#21a75b' }} />}
                </button>
              );
            })}
          </div>
        </section>
        <section className="planner-card p-5 sm:p-6">
          <SectionTitle title="برنامه‌های روز انتخاب‌شده" subtitle={formatFull(selectedCalendarDate)} icon={CalendarDays} />
          <div className="mt-4 space-y-3">
            {selectedPlans.length ? (
              selectedPlans.map((plan) => <PlanRow key={plan.id} plan={plan} category={categoryById(plan.categoryId)} onToggle={() => togglePlan(plan.id)} />)
            ) : (
              <EmptyState text="برای این روز برنامه‌ای ثبت نشده است." />
            )}
          </div>
          <button
            data-testid="calendar-add-plan-button"
            onClick={() => onAddPlanForDate(selectedCalendarDate, 'روزانه')}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#b9d6c0] text-sm font-bold text-[#12653a] hover:bg-[#e9f4eb]"
          >
            <Plus size={17} />ثبت برنامه برای این روز
          </button>
        </section>
      </div>
    </section>
  );
}
