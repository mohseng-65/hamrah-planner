import { NotebookPen, CalendarDays, Plus } from 'lucide-react';
import type { Category, PlannerData } from '../types';
import { digits, formatFull, todayIso } from '../lib/format';
import { EmptyState, SectionTitle } from '../components/common';
import { PlanRow } from '../components/PlanRow';

export function TodayPage({
  data,
  update,
  categoryById,
  togglePlan,
  openPlanner,
}: {
  data: PlannerData;
  update: (patch: Partial<PlannerData>) => void;
  categoryById: (id: string) => Category | undefined;
  togglePlan: (id: string) => void;
  openPlanner: () => void;
}) {
  const todayPlans = data.plans.filter((plan) => plan.date === todayIso());
  const pendingTasks = data.tasks.filter((task) => !task.done).length;

  return (
    <section data-testid="today-page" className="space-y-5">
      <div className="rounded-[1.5rem] bg-[#0d4d31] px-5 py-6 text-[#fbf8ee] sm:px-8">
        <p className="text-sm text-[#c1d9c7]">{formatFull(new Date())}</p>
        <h1 className="mt-4 text-2xl font-black sm:text-3xl">سلام، روز خوبی داشته باشی!</h1>
        <p className="mt-2 text-sm leading-7 text-[#cde1d2]">کارهای مهم امروز را انتخاب کن و قدم‌به‌قدم پیش برو.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="rounded-2xl bg-white/10 p-3">
            <b className="block text-2xl">{digits.format(pendingTasks)} / {digits.format(data.tasks.length)}</b>
            <span className="text-xs text-[#cfe0d2]">کارهای باقی‌مانده</span>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <b className="block text-2xl">{digits.format(todayPlans.length)}</b>
            <span className="text-xs text-[#cfe0d2]">برنامه ثبت‌شده</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="planner-card p-5 sm:p-6">
          <SectionTitle title="یادداشت روزانه" subtitle="فکرها و نکات مهم امروز را بنویسید." icon={NotebookPen} />
          <textarea
            data-testid="daily-note-input"
            value={data.note}
            onChange={(event) => update({ note: event.target.value })}
            placeholder="امروز چه چیزی مهم است؟"
            className="mt-4 min-h-48 w-full resize-y rounded-2xl border border-[#d9e3da] bg-[#f7faf7] p-4 text-sm leading-7 outline-none placeholder:text-[#94a49a] focus:border-[#22834d]"
          />
          <p className="mt-3 text-xs text-[#819086]">یادداشت به‌صورت خودکار ذخیره می‌شود.</p>
        </section>
        <section className="planner-card p-5 sm:p-6">
          <SectionTitle title="برنامه امروز" subtitle="فعالیت‌های زمان‌دار شما" icon={CalendarDays} />
          <div className="mt-4 space-y-3">
            {todayPlans.length ? (
              todayPlans.map((plan) => (
                <PlanRow key={plan.id} plan={plan} category={categoryById(plan.categoryId)} onToggle={() => togglePlan(plan.id)} />
              ))
            ) : (
              <EmptyState text="برای امروز برنامه‌ای ثبت نشده است." />
            )}
          </div>
          <button
            data-testid="go-to-planner-button"
            onClick={openPlanner}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#b9d6c0] text-sm font-bold text-[#12653a] hover:bg-[#e9f4eb]"
          >
            <Plus size={17} />افزودن برنامه
          </button>
        </section>
      </div>
    </section>
  );
}
