import { useState } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import type { PlannerData } from '../types';
import { todayIso, uid } from '../lib/format';
import { EmptyState, PageHeading } from '../components/common';
import { TaskRow } from '../components/TaskRow';

export function TasksPage({ data, update, notify }: { data: PlannerData; update: (patch: Partial<PlannerData>) => void; notify: (text: string) => void }) {
  const [taskTitle, setTaskTitle] = useState('');

  const addTask = () => {
    const title = taskTitle.trim();
    if (!title) return notify('لطفاً عنوان کار را بنویسید.');
    update({ tasks: [{ id: uid(), title, done: false, createdAt: todayIso() }, ...data.tasks] });
    setTaskTitle('');
    notify('کار جدید اضافه شد.');
  };

  return (
    <section data-testid="tasks-page" className="mx-auto max-w-3xl">
      <PageHeading title="کارهای من" description="فهرست کارهای روزانه را مرتب و پیگیری کنید." icon={ListChecks} />
      <div className="planner-card mb-5 flex flex-col gap-3 p-4 sm:flex-row">
        <input
          data-testid="task-input"
          value={taskTitle}
          onChange={(event) => setTaskTitle(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && addTask()}
          placeholder="مثلاً: پرداخت قبض اینترنت"
          className="field min-w-0 flex-1"
        />
        <button data-testid="add-task-button" onClick={addTask} className="primary-button">
          <Plus size={18} />افزودن کار
        </button>
      </div>
      <div className="space-y-3">
        {data.tasks.length ? (
          data.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => update({ tasks: data.tasks.map((item) => (item.id === task.id ? { ...item, done: !item.done } : item)) })}
              onDelete={() => update({ tasks: data.tasks.filter((item) => item.id !== task.id) })}
            />
          ))
        ) : (
          <EmptyState text="فهرست کارهای شما خالی است." />
        )}
      </div>
    </section>
  );
}
