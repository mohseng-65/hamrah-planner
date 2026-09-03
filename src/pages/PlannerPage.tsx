import { useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import type { Category, Plan, PlanKind, PlannerData, Priority } from '../types';
import { formatShort, priorityValue, uid, minutesOf } from '../lib/format';
import { kinds, priorities } from '../lib/storage';
import { EmptyState, PageHeading } from '../components/common';
import { PlanRow } from '../components/PlanRow';
import { DailyPlanner } from '../components/DailyPlanner';
import { JalaliDatePicker } from '../components/JalaliDatePicker';

export function PlannerPage({
  data,
  update,
  notify,
  categoryById,
  categoryName,
  plannerCategories,
  togglePlan,
  plannerFilter,
  planKind,
  planDate,
  onSwitchKind,
  setPlanDate,
}: {
  data: PlannerData;
  update: (patch: Partial<PlannerData>) => void;
  notify: (text: string) => void;
  categoryById: (id: string) => Category | undefined;
  categoryName: (id: string) => string;
  plannerCategories: Category[];
  togglePlan: (id: string) => void;
  plannerFilter: PlanKind;
  planKind: PlanKind;
  planDate: string;
  onSwitchKind: (kind: PlanKind) => void;
  setPlanDate: (iso: string) => void;
}) {
  const [planTitle, setPlanTitle] = useState('');
  const [planTime, setPlanTime] = useState('08:00');
  const [planEndTime, setPlanEndTime] = useState('09:00');
  const [planPriority, setPlanPriority] = useState<Priority>('متوسط');
  const [planCategory, setPlanCategory] = useState('cat-work');

  const addPlan = () => {
    const title = planTitle.trim();
    if (!title) return notify('لطفاً عنوان برنامه را بنویسید.');
    if (planKind === 'روزانه' && (!planTime || !planEndTime || minutesOf(planEndTime) <= minutesOf(planTime))) {
      return notify('برای برنامه روزانه، ساعت پایان باید بعد از ساعت شروع باشد.');
    }
    const plan: Plan = { id: uid(), title, kind: planKind, date: planDate, time: planTime, endTime: planEndTime, done: false, priority: planPriority, categoryId: planCategory };
    update({ plans: [plan, ...data.plans] });
    setPlanTitle('');
    notify('برنامه در پلنر و تقویم ثبت شد.');
  };

  const filteredSorted = data.plans.filter((plan) => plan.kind === plannerFilter).sort((a, b) => priorityValue(a.priority) - priorityValue(b.priority));

  return (
    <section data-testid="planner-page" className="space-y-5">
      <PageHeading title="پلنر" description="روز خود را با انتخاب تاریخ شمسی برنامه‌ریزی کنید." icon={CalendarDays} />
      <div className="planner-tabs no-print">
        {kinds.map((kind) => (
          <button key={kind} data-testid={`planner-filter-${kind}`} onClick={() => onSwitchKind(kind)} className={plannerFilter === kind ? 'active' : ''}>
            {kind}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[.82fr_1.18fr]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            addPlan();
          }}
          className="planner-card p-5 sm:p-6"
        >
          <h2 className="text-lg font-black">برنامه جدید {planKind}</h2>
          <label className="label">
            عنوان برنامه
            <input data-testid="plan-title-input" value={planTitle} onChange={(event) => setPlanTitle(event.target.value)} className="field mt-2" placeholder="مثلاً: پیاده‌روی صبحگاهی" />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <JalaliDatePicker testId="plan-date-input" label="تاریخ شمسی" value={planDate} onChange={setPlanDate} />
            <label className="label">
              اولویت
              <select data-testid="plan-priority-select" value={planPriority} onChange={(event) => setPlanPriority(event.target.value as Priority)} className="field mt-2">
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="label">
            دسته‌بندی
            <select data-testid="plan-category-select" value={planCategory} onChange={(event) => setPlanCategory(event.target.value)} className="field mt-2">
              {plannerCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {categoryName(category.id)}
                </option>
              ))}
            </select>
          </label>
          {planKind === 'روزانه' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="label">
                از ساعت
                <input data-testid="plan-time-input" type="time" value={planTime} onChange={(event) => setPlanTime(event.target.value)} className="field mt-2" />
              </label>
              <label className="label">
                تا ساعت
                <input data-testid="plan-end-time-input" type="time" value={planEndTime} onChange={(event) => setPlanEndTime(event.target.value)} className="field mt-2" />
              </label>
            </div>
          )}
          <button data-testid="add-plan-button" type="submit" className="primary-button mt-5 w-full">
            <Plus size={18} />ثبت برنامه
          </button>
        </form>
        <section className="planner-card overflow-hidden">
          <div className="border-b border-[#e2e9e3] px-5 py-5 sm:px-6">
            <h2 className="text-lg font-black">{plannerFilter === 'روزانه' ? `برنامهٔ ${formatShort(planDate)}` : `برنامه‌های ${plannerFilter}`}</h2>
            <p className="mt-1 text-sm text-[#748278]">{plannerFilter === 'روزانه' ? 'چک‌لیست و بازه‌های زمانی ۲۴ ساعت' : 'مرتب‌شده از اولویت زیاد به کم'}</p>
          </div>
          {plannerFilter === 'روزانه' ? (
            <DailyPlanner
              plans={data.plans.filter((plan) => plan.kind === 'روزانه' && plan.date === planDate)}
              categories={data.categories}
              onToggle={togglePlan}
              onDelete={(id) => update({ plans: data.plans.filter((plan) => plan.id !== id) })}
            />
          ) : (
            <div className="p-5 sm:p-6">
              <div className="space-y-3">
                {filteredSorted.length ? (
                  filteredSorted.map((plan, index) => (
                    <PlanRow
                      key={plan.id}
                      number={index + 1}
                      plan={plan}
                      category={categoryById(plan.categoryId)}
                      onToggle={() => togglePlan(plan.id)}
                      onDelete={() => update({ plans: data.plans.filter((item) => item.id !== plan.id) })}
                    />
                  ))
                ) : (
                  <EmptyState text={`برنامهٔ ${plannerFilter} ثبت نشده است.`} />
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
