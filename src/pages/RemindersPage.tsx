import { Bell, BellOff } from 'lucide-react';
import type { Category, PlannerData } from '../types';
import { digits, formatShort, todayIso } from '../lib/format';
import { EmptyState, PageHeading } from '../components/common';

export function RemindersPage({
  data,
  categoryById,
  notificationsEnabled,
  onEnableNotifications,
}: {
  data: PlannerData;
  categoryById: (id: string) => Category | undefined;
  notificationsEnabled: boolean;
  onEnableNotifications: () => void;
}) {
  const upcoming = data.plans
    .filter((plan) => plan.kind === 'روزانه' && !plan.done && (plan.reminderMinutes ?? 0) > 0 && plan.date >= todayIso())
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date < b.date ? -1 : 1));

  return (
    <section data-testid="reminders-page" className="mx-auto max-w-3xl space-y-5">
      <PageHeading title="یادآوری‌ها" description="برنامه‌های روزانه‌ای که برایشان یادآوری تنظیم کرده‌اید." icon={Bell} />

      {!notificationsEnabled && (
        <button
          data-testid="enable-notifications-button"
          onClick={onEnableNotifications}
          className="planner-card flex w-full items-center gap-3 p-4 text-right text-sm font-bold text-[#17663b] hover:bg-[#f3f9f4]"
        >
          <BellOff size={19} />
          فعال‌سازی اعلان مرورگر برای یادآوری‌ها (اختیاری — بدون آن هم پیام داخل برنامه نشان داده می‌شود)
        </button>
      )}

      <div className="space-y-3">
        {upcoming.length ? (
          upcoming.map((plan) => {
            const category = categoryById(plan.categoryId);
            return (
              <article key={plan.id} className="flex items-center gap-3 rounded-2xl border border-[#dce6de] bg-white p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: `${category?.color ?? '#2f8b57'}20`, color: category?.color ?? '#17663b' }}>
                  <Bell size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block text-sm">{plan.title}</b>
                  <p className="mt-1 text-xs text-[#718077]">
                    {formatShort(plan.date)} • ساعت {plan.time} • یادآوری {digits.format(plan.reminderMinutes ?? 0)} دقیقه قبل
                  </p>
                </div>
              </article>
            );
          })
        ) : (
          <EmptyState text="یادآوری فعالی ندارید. از صفحه‌ی پلنر، هنگام ساخت برنامه‌ی روزانه، یک بازه‌ی یادآوری انتخاب کنید." />
        )}
      </div>
    </section>
  );
}
