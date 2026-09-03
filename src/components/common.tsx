import type { LucideIcon } from 'lucide-react';

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#c9d5cc] bg-[#f7faf7] px-5 py-9 text-center text-sm leading-7 text-[#66756a]">
      {text}
    </div>
  );
}

export function PageHeading({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e3f0e6] text-[#12643a]">
        <Icon size={21} />
      </span>
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
        <p className="mt-1.5 text-sm leading-6 text-[#708075]">{description}</p>
      </div>
    </div>
  );
}

export function SectionTitle({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: LucideIcon }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-black">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-[#748278]">{subtitle}</p>
      </div>
      <Icon className="shrink-0 text-[#188044]" size={22} />
    </div>
  );
}

export function StatCard({ title, value, text }: { title: string; value: string; text: string }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#dce6de]">
      <p className="text-sm font-bold text-[#5e7264]">{title}</p>
      <b className="mt-3 block break-words text-2xl font-black text-[#13673b] sm:text-3xl">{value}</b>
      <p className="mt-3 text-xs leading-6 text-[#748278]">{text}</p>
    </article>
  );
}
