import { digitToLatin, jalaliParts } from './format';

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
