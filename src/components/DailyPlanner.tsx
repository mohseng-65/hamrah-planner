import { Clock3 } from 'lucide-react';
import type { Category, Plan } from '../types';
import { minutesOf } from '../lib/format';
import { EmptyState } from './common';
import { PlanRow } from './PlanRow';

export function DailyPlanner({
  plans,
  categories,
  onToggle,
  onDelete,
}: {
  plans: Plan[];
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const timedPlans = plans.filter((plan) => plan.time && plan.endTime).sort((a, b) => minutesOf(a.time) - minutesOf(b.time));

  return (
    <div>
      <div className="border-b border-[#e6ece7] p-5 sm:p-6">
        <h3 className="mb-3 text-sm font-black">چک‌لیست امروز</h3>
        <div className="space-y-2">
          {plans.length ? (
            plans.map((plan) => (
              <PlanRow
                key={plan.id}
                plan={plan}
                category={categories.find((category) => category.id === plan.categoryId)}
                onToggle={() => onToggle(plan.id)}
                onDelete={() => onDelete(plan.id)}
              />
            ))
          ) : (
            <EmptyState text="برای این روز برنامه‌ای ثبت نشده است." />
          )}
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 size={19} className="text-[#176b3f]" />
          <h3 className="text-sm font-black">نمای ۲۴ ساعته</h3>
        </div>
        <div data-testid="daily-timeline" className="timeline" dir="ltr">
          {Array.from({ length: 25 }).map((_, hour) => (
            <div key={hour} className="timeline-hour" style={{ top: `${(hour / 24) * 100}%` }}>
              <span>{String(hour).padStart(2, '0')}:00</span>
              <i />
            </div>
          ))}
          {timedPlans.map((plan) => {
            const start = minutesOf(plan.time);
            const end = minutesOf(plan.endTime);
            const category = categories.find((item) => item.id === plan.categoryId);
            return (
              <button
                key={plan.id}
                data-testid={`timeline-plan-${plan.id}`}
                onClick={() => onToggle(plan.id)}
                className={`timeline-bar ${plan.done ? 'opacity-50 line-through' : ''}`}
                style={{
                  top: `calc(${(start / 1440) * 100}% + 2px)`,
                  height: `calc(${Math.max(30, ((end - start) / 1440) * 100)}% - 4px)`,
                  background: `${category?.color ?? '#2f8b57'}30`,
                  borderColor: category?.color ?? '#2f8b57',
                  color: '#263b2e',
                }}
                dir="rtl"
              >
                <b>{plan.title}</b>
                <small>{plan.time} تا {plan.endTime}</small>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
