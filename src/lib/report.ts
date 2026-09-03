import type { PlannerData, ReportPreset } from '../types';
import { toIso } from './format';
import { jalaliMonthStart, jalaliYearStart } from './jalali';

export function computeReportDates(preset: ReportPreset, from: string, to: string) {
  const now = new Date();
  let start = new Date(now);
  const end = new Date(now);
  if (preset === 'هفتگی') start.setDate(now.getDate() - ((now.getDay() + 1) % 7));
  if (preset === 'ماهانه') start = jalaliMonthStart(now);
  if (preset === 'سالانه') start = jalaliYearStart(now);
  if (preset === 'دلخواه') return { from, to };
  return { from: toIso(start), to: toIso(end) };
}

export function computeShoppingReport(data: PlannerData, preset: ReportPreset, from: string, to: string) {
  const dates = computeReportDates(preset, from, to);
  const items = data.shopping.filter((item) => item.bought && item.date >= dates.from && item.date <= dates.to);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalsByCategory = data.categories
    .filter((category) => category.area === 'shopping')
    .map((category) => ({
      category,
      total: items.filter((item) => item.categoryId === category.id).reduce((sum, item) => sum + item.price * item.quantity, 0),
    }))
    .filter((row) => row.total > 0);
  return { dates, items, total, totalsByCategory };
}
