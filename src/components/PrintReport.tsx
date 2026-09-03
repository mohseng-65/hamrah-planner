import type { PlannerData, PrintMode, ReportPreset } from '../types';
import { formatFull, formatMoney, formatShort } from '../lib/format';
import { computeShoppingReport } from '../lib/report';

export function PrintReport({
  data,
  printMode,
  reportPreset,
  reportFrom,
  reportTo,
  categoryName,
}: {
  data: PlannerData;
  printMode: PrintMode;
  reportPreset: ReportPreset;
  reportFrom: string;
  reportTo: string;
  categoryName: (id: string) => string;
}) {
  const shoppingReport = computeShoppingReport(data, reportPreset, reportFrom, reportTo);

  return (
    <section className="print-only mt-8 rounded-xl border border-[#d7e3d9] p-6">
      {printMode === 'shopping' ? (
        <>
          <h1 className="text-2xl font-black">گزارش خرج‌کرد</h1>
          <p className="mt-2 text-sm">
            بازه: {formatShort(shoppingReport.dates.from)} تا {formatShort(shoppingReport.dates.to)}
          </p>
          <h2 className="mt-6 font-black">جمع کل: {formatMoney(shoppingReport.total)}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {shoppingReport.items.map((item) => (
              <li key={item.id}>
                • {item.title} — {categoryName(item.categoryId)} — {formatMoney(item.price * item.quantity)} — {formatShort(item.date)}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-black">گزارش دفتر برنامه‌ریزی</h1>
          <p className="mt-2 text-sm">تهیه‌شده در {formatFull(new Date())}</p>
          <h2 className="mt-6 font-black">برنامه‌های ثبت‌شده</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.plans.map((plan) => (
              <li key={plan.id}>
                • {plan.title} — {formatShort(plan.date)} — {plan.done ? 'انجام شده' : 'در انتظار'}
              </li>
            ))}
          </ul>
          <h2 className="mt-6 font-black">یادداشت امروز</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{data.note || 'یادداشتی ثبت نشده است.'}</p>
        </>
      )}
    </section>
  );
}
