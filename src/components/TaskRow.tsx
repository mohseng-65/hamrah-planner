import { Check, Trash2 } from 'lucide-react';
import type { Task } from '../types';
import { formatShort } from '../lib/format';

export function TaskRow({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  return (
    <article className={`flex items-center gap-3 rounded-2xl border p-3.5 sm:p-4 ${task.done ? 'border-[#d5ead9] bg-[#f1f9f2]' : 'border-[#dce6de] bg-white'}`}>
      <button
        data-testid={`toggle-task-${task.id}`}
        onClick={onToggle}
        className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 ${task.done ? 'border-[#28a75b] bg-[#28a75b] text-white' : 'border-[#aebfb2] text-transparent'}`}
      >
        <Check size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <h2 className={`text-sm font-bold sm:text-base ${task.done ? 'text-[#718077] line-through' : ''}`}>{task.title}</h2>
        <p className="mt-1 text-xs text-[#89968e]">ثبت‌شده برای {formatShort(task.createdAt)}</p>
      </div>
      <button
        data-testid={`delete-task-${task.id}`}
        onClick={onDelete}
        className="grid size-10 shrink-0 place-items-center rounded-xl text-[#88978c] hover:bg-red-50 hover:text-red-600"
        aria-label="حذف کار"
      >
        <Trash2 size={18} />
      </button>
    </article>
  );
}
