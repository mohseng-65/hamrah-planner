import { useState } from 'react';
import { Check, Target, Trash2 } from 'lucide-react';
import type { GoalPeriodKind, PlannerData } from '../types';
import { todayIso, uid } from '../lib/format';
import { periodLabel } from '../lib/jalali';
import { EmptyState, PageHeading } from '../components/common';
import { PeriodNav } from '../components/PeriodNav';

const periodOptions: { id: GoalPeriodKind | 'none'; title: string }[] = [
  { id: 'none', title: 'بدون بازه' },
  { id: 'ماهانه', title: 'ماهانه' },
  { id: 'سالانه', title: 'سالانه' },
];

export function GoalsPage({ data, update, notify }: { data: PlannerData; update: (patch: Partial<PlannerData>) => void; notify: (text: string) => void }) {
  const [goalTitle, setGoalTitle] = useState('');
  const [goalNote, setGoalNote] = useState('');
  const [periodKind, setPeriodKind] = useState<GoalPeriodKind | 'none'>('none');
  const [periodDate, setPeriodDate] = useState(todayIso());

  const addGoal = () => {
    const title = goalTitle.trim();
    if (!title) return notify('لطفاً عنوان هدف را بنویسید.');
    update({
      goals: [
        {
          id: uid(),
          title,
          note: goalNote.trim(),
          done: false,
          periodKind: periodKind === 'none' ? undefined : periodKind,
          periodDate: periodKind === 'none' ? undefined : periodDate,
        },
        ...data.goals,
      ],
    });
    setGoalTitle('');
    setGoalNote('');
    notify('هدف جدید ثبت شد.');
  };

  return (
    <section data-testid="goals-page" className="mx-auto max-w-4xl">
      <PageHeading title="اهداف من" description="هدف‌های مهم را روشن و قابل پیگیری نگه دارید." icon={Target} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          addGoal();
        }}
        className="planner-card mb-5 space-y-3 p-4"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input data-testid="goal-title-input" value={goalTitle} onChange={(event) => setGoalTitle(event.target.value)} placeholder="عنوان هدف" className="field" />
          <input data-testid="goal-note-input" value={goalNote} onChange={(event) => setGoalNote(event.target.value)} placeholder="توضیح کوتاه (اختیاری)" className="field" />
        </div>
        <div>
          <span className="label mt-0">بازه‌ی زمانی هدف</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {periodOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                data-testid={`goal-period-${option.id}`}
                onClick={() => setPeriodKind(option.id)}
                className={`min-h-10 rounded-xl px-3 text-xs font-bold ${periodKind === option.id ? 'bg-[#0e6038] text-white' : 'bg-[#edf3ee] text-[#53695c]'}`}
              >
                {option.title}
              </button>
            ))}
          </div>
          {periodKind !== 'none' && (
            <div className="mt-3">
              <PeriodNav kind={periodKind} date={periodDate} onChange={setPeriodDate} />
            </div>
          )}
        </div>
        <button data-testid="add-goal-button" className="primary-button w-full">
          ثبت هدف
        </button>
      </form>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.goals.length ? (
          data.goals.map((goal) => (
            <article key={goal.id} className={`rounded-2xl border p-5 ${goal.done ? 'border-[#bfe4c9] bg-[#eff9f1]' : 'border-[#dce6de] bg-white'}`}>
              <div className="flex items-start gap-3">
                <button
                  data-testid={`toggle-goal-${goal.id}`}
                  onClick={() => update({ goals: data.goals.map((item) => (item.id === goal.id ? { ...item, done: !item.done } : item)) })}
                  className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 ${goal.done ? 'border-[#28a75b] bg-[#28a75b] text-white' : 'border-[#aebfb2] text-transparent'}`}
                >
                  <Check size={16} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className={`font-black ${goal.done ? 'text-[#4f7659] line-through' : ''}`}>{goal.title}</h2>
                    {goal.periodKind && goal.periodDate && (
                      <span className="rounded-lg bg-[#eaf2ec] px-2 py-0.5 text-[11px] font-bold text-[#356247]">{periodLabel(goal.periodKind, goal.periodDate)}</span>
                    )}
                  </div>
                  {goal.note && <p className="mt-2 text-sm leading-6 text-[#718077]">{goal.note}</p>}
                </div>
                <button
                  data-testid={`delete-goal-${goal.id}`}
                  onClick={() => update({ goals: data.goals.filter((item) => item.id !== goal.id) })}
                  className="grid size-10 place-items-center rounded-xl text-[#88978c] hover:bg-red-50 hover:text-red-600"
                  aria-label="حذف هدف"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="sm:col-span-2">
            <EmptyState text="هدف تازه‌ای ثبت نشده است." />
          </div>
        )}
      </div>
    </section>
  );
}
