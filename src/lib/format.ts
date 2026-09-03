import type { Priority } from '../types';

// Single shared Persian-digit number formatter (used for plain counts and money alike).
export const digits = new Intl.NumberFormat('fa-IR');

export const jalaliFull = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'full' });
export const jalaliShort = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' });
export const jalaliParts = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'numeric', day: 'numeric' });
export const jalaliMonth = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long' });

export const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const todayIso = () => toIso(new Date());

// Noon avoids DST edge cases when a date-only ISO string is turned back into a Date.
export const dateFromIso = (iso: string) => new Date(`${iso}T12:00:00`);

export const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const formatFull = (date: Date | string) => jalaliFull.format(typeof date === 'string' ? dateFromIso(date) : date);
export const formatShort = (date: string) => jalaliShort.format(dateFromIso(date));
export const formatMoney = (amount: number) => `${digits.format(Math.max(0, amount))} تومان`;

export const digitToLatin = (value: string) =>
  Number(value.replace(/[۰-۹]/g, (char) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(char))));

export const priorityValue = (priority: Priority) => ({ زیاد: 1, متوسط: 2, کم: 3 })[priority];

export const minutesOf = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return Number.isFinite(hour) && Number.isFinite(minute) ? hour * 60 + minute : 0;
};
