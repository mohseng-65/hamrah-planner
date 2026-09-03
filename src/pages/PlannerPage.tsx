import { useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import type { Category, Plan, PlanKind, PlannerData, Priority } from '../types';
import { dateFromIso, digits, formatShort, minutesOf, priorityValue, uid } from '../lib/format';
import { isSameJalaliMonth, isSameJalaliWeek, isSameJalaliYear, jalaliWeekDates, periodLabel } from '../lib/jalali';
import { kinds, priorities, reminderOptions } from '../lib/storage';
import { EmptyState, PageHeading } from '../components/common';
import { PlanRow } from '../components/PlanRow';
import { DailyPlanner } from '../components/DailyPlanner';
import { JalaliDatePicker } from '../components/JalaliDatePicker';
import { PeriodNav } from '../components/PeriodNav';

const weekdayLabels = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

function samePeriod(kind: PlanKind, planDateIso: string, anchorIso: string) {
  if (kind === 'هفتگی') return isSameJalaliWeek(planDateIso, anchorIso);
  if (kind === 'ماهانه') return isSameJalaliMonth(planDateIso, anchorIso);
  if (kind === 'سالانه') return isSameJalaliYear(planDateIso, anchorIso);
  return planDateIso === anchorIso;
}

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
  const [reminderMinutes, setReminderMinutes] = useState(0);
  const [selectedWeekDay, setSelectedWeekDay] = useState('');

  const addPlan = () => {
    const title = planTitle.trim();
    if (!title) return notify('لطفاً عنوان برنامه را بنویسید.');
    if (planKind === 'روزانه' && (!planTime || !planEndTime || minutesOf(planEndTime) <= minutesOf(planTime))) {
      return notify('برای برنامه روزانه، ساعت پایان باید بعد از ساعت شروع باشد.');
    }
    const plan: Plan = {
      id: uid(),
      title,
      kind: planKind,
      date: planDate,
      time: planKind === 'روزانه' ? planTime : '',
      endTime: planKind === 'روزانه' ? planEndTime : '',
      done: false,
      priority: planPriority,
      categoryId: planCategory,
      reminderMinutes: planKind === 'روزانه' && reminderMinutes > 0 ? reminderMinutes : undefined,
    };
    update({ plans: [plan, ...data.plans] });
    setPlanTitle('');
    notify('برنامه در پلنر ثبت شد.');
  };

  const periodPlans = data.plans.filter((plan) => plan.kind === plannerFilter && samePeriod(plannerFilter, plan.date, planDate));
  const filteredSorted = [...periodPlans].sort((a, b) => priorityValue(a.priority) - priorityValue(b.priority));

  // Cross-links: daily plans inside the selected week, weekly plans inside the selected month, monthly plans inside the selected year.
  const weekDates = jalaliWeekDates(dateFromIso(planDate));
  const activeWeekDay = weekDates.includes(selectedWeekDay) ? selectedWeekDay : weekDates[0];
  const relatedWeeklyInMonth = data.plans.filter((plan) => plan.kind === 'هفتگی' && isSameJalaliMonth(plan.date, planDate));
  const relatedDailyInMonth = data.plans
    .filter((plan) => plan.kind === 'روزانه' && isSameJalaliMonth(plan.date, planDate))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const relatedMonthlyInYear = data.plans
    .filter((plan) => plan.kind === 'ماهانه' && isSameJalaliYear(plan.date, planDate))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <section data-testid="planner-page" className="space-y-5">
      <PageHeading title="پلنر" description="روزانه، هفتگی، ماهانه و سالانه — همه به هم مرتبط‌اند." icon={CalendarDays} />
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
          {planKind === 'روزانه' ? (
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
          ) : (
            <div>
              <span className="label mt-0">بازه‌ی زمانی برنامه</span>
              <div className="mt-2">
                <PeriodNav kind={planKind} date={planDate} onChange={setPlanDate} />
              </div>
              <label className="label">
                اولویت
                <select data-testid="plan-priority-select" value={planPriority} onChange={(event) => setPlanPriority(event.target.value as Priority)} className="field mt-2">
                  {priorities.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
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
            <>
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
              <label className="label">
                یادآوری
                <select data-testid="plan-reminder-select" value={reminderMinutes} onChange={(event) => setReminderMinutes(Number(event.target.value))} className="field mt-2">
                  {reminderOptions.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes === 0 ? 'بدون یادآوری' : `${digits.format(minutes)} دقیقه قبل`}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <button data-testid="add-plan-button" type="submit" className="primary-button mt-5 w-full">
            <Plus size={18} />ثبت برنامه
          </button>
        </form>

        <section className="planner-card overflow-hidden">
          <div className="border-b border-[#e2e9e3] px-5 py-5 sm:px-6">
            <h2 className="text-lg font-black">{periodLabel(plannerFilter, planDate)}</h2>
            <p className="mt-1 text-sm text-[#748278]">{plannerFilter === 'روزانه' ? 'چک‌لیست و بازه‌های زمانی ۲۴ ساعت' : 'مرتب‌شده از اولویت زیاد به کم'}</p>
          </div>

          {plannerFilter !== 'روزانه' && (
            <div className="border-b border-[#e2e9e3] p-4 sm:p-5">
              <PeriodNav kind={plannerFilter} date={planDate} onChange={setPlanDate} />
            </div>
          )}

          {plannerFilter === 'روزانه' && (
            <DailyPlanner
              plans={data.plans.filter((plan) => plan.kind === 'روزانه' && plan.date === planDate)}
              categories={data.categories}
              onToggle={togglePlan}
              onDelete={(id) => update({ plans: data.plans.filter((plan) => plan.id !== id) })}
            />
          )}

          {plannerFilter !== 'روزانه' && (
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
                  <EmptyState text={`برنامهٔ ${plannerFilter} برای این دوره ثبت نشده است.`} />
                )}
              </div>
            </div>
          )}

          {plannerFilter === 'هفتگی' && (
            <div className="border-t border-[#e2e9e3] p-5 sm:p-6">
              <h3 className="mb-3 text-sm font-black">برنامه‌های روزانه‌ی این هفته</h3>
              <div className="mb-4 grid grid-cols-7 gap-1">
                {weekDates.map((iso, index) => (
                  <button
                    key={iso}
                    data-testid={`week-day-${iso}`}
                    onClick={() => setSelectedWeekDay(iso)}
                    className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold ${
                      activeWeekDay === iso ? 'bg-[#0e6038] text-white' : 'bg-[#f2f6f2] text-[#4c5e51] hover:bg-[#e6efe7]'
                    }`}
                  >
                    <span>{weekdayLabels[index]}</span>
                    <span>{digits.format(Number(iso.split('-')[2]))}</span>
                  </button>
                ))}
              </div>
              <DailyPlanner
                plans={data.plans.filter((plan) => plan.kind === 'روزانه' && plan.date === activeWeekDay)}
                categories={data.categories}
                onToggle={togglePlan}
                onDelete={(id) => update({ plans: data.plans.filter((plan) => plan.id !== id) })}
              />
            </div>
          )}

          {plannerFilter === 'ماهانه' && (
            <div className="space-y-6 border-t border-[#e2e9e3] p-5 sm:p-6">
              <div>
                <h3 className="mb-3 text-sm font-black">برنامه‌های هفتگی این ماه</h3>
                <div className="space-y-3">
                  {relatedWeeklyInMonth.length ? (
                    relatedWeeklyInMonth.map((plan) => <PlanRow key={plan.id} plan={plan} category={categoryById(plan.categoryId)} onToggle={() => togglePlan(plan.id)} />)
                  ) : (
                    <EmptyState text="برنامه‌ی هفتگی‌ای در این ماه ثبت نشده است." />
                  )}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-black">کارهای روزانه‌ی این ماه</h3>
                <div className="space-y-3">
                  {relatedDailyInMonth.length ? (
                    relatedDailyInMonth.map((plan) => <PlanRow key={plan.id} plan={plan} category={categoryById(plan.categoryId)} onToggle={() => togglePlan(plan.id)} />)
                  ) : (
                    <EmptyState text="برنامه‌ی روزانه‌ای در این ماه ثبت نشده است." />
                  )}
                </div>
              </div>
            </div>
          )}

          {plannerFilter === 'سالانه' && (
            <div className="border-t border-[#e2e9e3] p-5 sm:p-6">
              <h3 className="mb-3 text-sm font-black">برنامه‌های ماهانه‌ی این سال</h3>
              <div className="space-y-3">
                {relatedMonthlyInYear.length ? (
                  relatedMonthlyInYear.map((plan) => <PlanRow key={plan.id} plan={plan} category={categoryById(plan.categoryId)} onToggle={() => togglePlan(plan.id)} />)
                ) : (
                  <EmptyState text="برنامه‌ی ماهانه‌ای در این سال ثبت نشده است." />
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
