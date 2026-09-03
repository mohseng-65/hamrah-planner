import type { PlanKind } from '../types';
import { dateFromIso, digitToLatin, digits, formatShort, jalaliMonth, jalaliParts, toIso } from './format';

export function jalaliDate(date: Date) {
  const parts = jalaliParts.formatToParts(date);
  const read = (type: string) => digitToLatin(parts.find((part) => part.type === type)?.value ?? '1');
  return { year: read('year'), month: read('month'), day: read('day') };
}

export function createMonth(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  while (jalaliDate(first).day !== 1) first.setDate(first.getDate() - 1);
  const calendarDays: Date[] = [];
  const activeMonth = jalaliDate(first).month;
  const cursor = new Date(first);
  while (jalaliDate(cursor).month === activeMonth) {
    calendarDays.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  // Persian week starts on Saturday; getDay() is Sunday-based, hence the +1 shift.
  return { first, afterLast: cursor, calendarDays, blankDays: (first.getDay() + 1) % 7 };
}

export function jalaliMonthStart(date: Date) {
  const copy = new Date(date);
  while (jalaliDate(copy).day !== 1) copy.setDate(copy.getDate() - 1);
  return copy;
}

export function jalaliYearStart(date: Date) {
  const copy = new Date(date);
  while (jalaliDate(copy).month !== 1 || jalaliDate(copy).day !== 1) copy.setDate(copy.getDate() - 1);
  return copy;
}

/** Saturday of the Persian week that `date` falls in. */
export function jalaliWeekStart(date: Date) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - ((copy.getDay() + 1) % 7));
  return copy;
}

/** The 7 ISO dates (Saturday..Friday) of the Persian week that `date` falls in. */
export function jalaliWeekDates(date: Date) {
  const start = jalaliWeekStart(date);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return toIso(day);
  });
}

/** 1-based week number within the Persian year (week containing 1 Farvardin is week 1). */
export function jalaliWeekNumber(date: Date) {
  const firstWeekStart = jalaliWeekStart(jalaliYearStart(date));
  const thisWeekStart = jalaliWeekStart(date);
  const days = Math.round((thisWeekStart.getTime() - firstWeekStart.getTime()) / 86400000);
  return Math.floor(days / 7) + 1;
}

export const isSameJalaliWeek = (aIso: string, bIso: string) =>
  toIso(jalaliWeekStart(dateFromIso(aIso))) === toIso(jalaliWeekStart(dateFromIso(bIso)));

export const isSameJalaliMonth = (aIso: string, bIso: string) => {
  const a = jalaliDate(dateFromIso(aIso));
  const b = jalaliDate(dateFromIso(bIso));
  return a.year === b.year && a.month === b.month;
};

export const isSameJalaliYear = (aIso: string, bIso: string) => jalaliDate(dateFromIso(aIso)).year === jalaliDate(dateFromIso(bIso)).year;

/** Moves an anchor ISO date one whole period forward/back, matched to the given plan kind. */
export function shiftPeriod(kind: PlanKind, iso: string, direction: 1 | -1): string {
  const date = dateFromIso(iso);
  if (kind === 'هفتگی') {
    const start = jalaliWeekStart(date);
    start.setDate(start.getDate() + direction * 7);
    return toIso(start);
  }
  if (kind === 'ماهانه') {
    const start = jalaliMonthStart(date);
    const probe = new Date(start);
    probe.setDate(probe.getDate() + direction * 32);
    return toIso(jalaliMonthStart(probe));
  }
  if (kind === 'سالانه') {
    const start = jalaliYearStart(date);
    const probe = new Date(start);
    probe.setDate(probe.getDate() + direction * 370);
    return toIso(jalaliYearStart(probe));
  }
  const next = new Date(date);
  next.setDate(next.getDate() + direction);
  return toIso(next);
}

/** Human label for the period a plan kind + anchor date represents. */
export function periodLabel(kind: PlanKind, iso: string): string {
  const date = dateFromIso(iso);
  if (kind === 'روزانه') return formatShort(iso);
  if (kind === 'هفتگی') {
    const start = jalaliWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `هفته ${digits.format(jalaliWeekNumber(date))} سال ${digits.format(jalaliDate(date).year)} (${formatShort(toIso(start))} تا ${formatShort(toIso(end))})`;
  }
  if (kind === 'ماهانه') return jalaliMonth.format(date);
  return `سال ${digits.format(jalaliDate(date).year)}`;
}
