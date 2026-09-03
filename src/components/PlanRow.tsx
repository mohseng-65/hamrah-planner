import { Check, Trash2 } from 'lucide-react';
import type { Category, Plan } from '../types';
import { digits, formatShort } from '../lib/format';

export function PlanRow({
  plan,
  category,
  number,
  onToggle,
  onDelete,
}: {
  plan: Plan;
  category?: Category;
  number?: number;
  onToggle: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3.5 ${plan.done ? 'border-[#d5ead9] bg-[#f1f9f2]' : 'border-[#dce6de] bg-white'}`}>
      {number && (
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#edf3ee] text-xs font-black text-[#336149]">
          {digits.format(number)}
        </span>
      )}
      <button
        data-testid={`toggle-plan-${plan.id}`}
        onClick={onToggle}
        className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 ${plan.done ? 'border-[#28a75b] bg-[#28a75b] text-white' : 'border-[#aebfb2] text-transparent'}`}
      >
        <Check size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <h3 className={`text-sm font-bold ${plan.done ? 'text-[#718077] line-through' : ''}`}>{plan.title}</h3>
        <p className="mt-1 break-words text-xs text-[#718177]">
          {formatShort(plan.date)} {plan.time ? `• ${plan.time}${plan.endTime ? ` تا ${plan.endTime}` : ''}` : ''}
        </p>
      </div>
      {/* Priority badge: now visible on every screen size, not just sm+ */}
      <span
        className="rounded-lg px-2 py-1 text-xs font-bold"
        style={{ background: `${category?.color ?? '#2f8b57'}20`, color: category?.color ?? '#17633b' }}
      >
        {plan.priority}
      </span>
      {onDelete && (
        <button
          data-testid={`delete-plan-${plan.id}`}
          onClick={onDelete}
          className="grid size-10 shrink-0 place-items-center rounded-xl text-[#88978c] hover:bg-red-50 hover:text-red-600"
          aria-label="حذف برنامه"
        >
          <Trash2 size={18} />
        </button>
      )}
    </article>
  );
}
