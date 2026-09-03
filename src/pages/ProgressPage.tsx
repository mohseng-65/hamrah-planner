import { useMemo, useState } from 'react';
import { BarChart3, Download } from 'lucide-react';
import type { Category, PlanKind, PlannerData } from '../types';
import { digits } from '../lib/format';
import { kinds } from '../lib/storage';
import { EmptyState, PageHeading, StatCard } from '../components/common';
import { PlanRow } from '../components/PlanRow';

export function ProgressPage({
  data,
  categoryById,
  togglePlan,
  onExportPdf,
}: {
  data: PlannerData;
  categoryById: (id: string) => Category | undefined;
  togglePlan: (id: string) => void;
  onExportPdf: () => void;
}) {
  const [progressRange, setProgressRange] = useState<PlanKind>('هفتگی');

  const planStats = useMemo(() => {
    const plans = data.plans.filter((plan) => plan.kind === progressRange);
    const finished = plans.filter((plan) => plan.done).length;
    return { plans, finished, percent: plans.length ? Math.round((finished / plans.length) * 100) : 0 };
  }, [data.plans, progressRange]);

  const taskPercent = data.tasks.length ? Math.round((data.tasks.filter((task) => task.done).length / data.tasks.length) * 100) : 0;
  const goalPercent = data.goals.length ? Math.round((data.goals.filter((goal) => goal.done).length / data.goals.length) * 100) : 0;

  return (
    <section data-testid="progress-page" className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeading title="پیشرفت" description="گزارش برنامه‌ها مستقیماً از پلنر ساخته می‌شود." icon={BarChart3} />
        <button data-testid="progress-pdf-button" onClick={onExportPdf} className="no-print secondary-button">
          <Download size={17} />خروجی پی‌دی‌اف
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {kinds.map((kind) => (
          <button
            key={kind}
            data-testid={`progress-range-${kind}`}
            onClick={() => setProgressRange(kind)}
            className={`min-h-11 rounded-xl px-4 text-sm font-bold ${progressRange === kind ? 'bg-[#0e6038] text-white' : 'bg-white text-[#52675a] ring-1 ring-[#dbe5dd]'}`}
          >
            {kind}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title={`برنامه‌های ${progressRange}`} value={`${digits.format(planStats.percent)}٪`} text={`${digits.format(planStats.finished)} از ${digits.format(planStats.plans.length)} انجام شده`} />
        <StatCard title="تمام کارها" value={`${digits.format(taskPercent)}٪`} text={`${digits.format(data.tasks.filter((task) => task.done).length)} کار به پایان رسیده`} />
        <StatCard title="اهداف شخصی" value={`${digits.format(goalPercent)}٪`} text={`${digits.format(data.goals.filter((goal) => goal.done).length)} هدف کامل شده`} />
      </div>
      <section className="planner-card p-5 sm:p-6">
        <h2 className="font-black">جزئیات پلنر {progressRange}</h2>
        <div className="mt-4 space-y-3">
          {planStats.plans.length ? (
            planStats.plans.map((plan) => <PlanRow key={plan.id} plan={plan} category={categoryById(plan.categoryId)} onToggle={() => togglePlan(plan.id)} />)
          ) : (
            <EmptyState text={`برای بازهٔ ${progressRange} داده‌ای وجود ندارد.`} />
          )}
        </div>
      </section>
    </section>
  );
}
