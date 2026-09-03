import type { Category, PlannerData } from '../types';
import { todayIso } from './format';

export const storageKey = 'hamrah-planner-data-v2';
export const legacyStorageKey = 'hamrah-planner-data-v1';

export const kinds = ['روزانه', 'هفتگی', 'ماهانه', 'سالانه'] as const;
export const priorities = ['زیاد', 'متوسط', 'کم'] as const;
export const categoryColors = ['#2f8b57', '#3b82c4', '#d68a30', '#a8578d', '#7963c9', '#ca5959'];

export const defaultCategories: Category[] = [
  { id: 'cat-health', title: 'سلامت', area: 'planner', parentId: null, color: '#2f8b57' },
  { id: 'cat-work', title: 'کار و مطالعه', area: 'planner', parentId: null, color: '#3b82c4' },
  { id: 'cat-walk', title: 'ورزش', area: 'planner', parentId: 'cat-health', color: '#d68a30' },
  { id: 'cat-food', title: 'خوراکی', area: 'shopping', parentId: null, color: '#2f8b57' },
  { id: 'cat-home', title: 'خانه', area: 'shopping', parentId: null, color: '#a8578d' },
  { id: 'cat-fruit', title: 'میوه و سبزیجات', area: 'shopping', parentId: 'cat-food', color: '#d68a30' },
];

// Fallback category used when an item's own category gets deleted, per area.
export const fallbackCategoryId = { planner: 'cat-work', shopping: 'cat-food' } as const;

export const defaultData: PlannerData = {
  note: '',
  tasks: [
    { id: 'task-1', title: 'مرور برنامه‌های امروز', done: true, createdAt: todayIso() },
    { id: 'task-2', title: 'تماس با همکاران', done: false, createdAt: todayIso() },
  ],
  plans: [
    { id: 'plan-1', title: 'پیاده‌روی صبحگاهی', kind: 'روزانه', date: todayIso(), time: '08:00', endTime: '10:00', done: false, priority: 'زیاد', categoryId: 'cat-walk' },
    { id: 'plan-2', title: 'مرور اهداف هفته', kind: 'هفتگی', date: todayIso(), time: '18:00', endTime: '', done: false, priority: 'متوسط', categoryId: 'cat-work' },
  ],
  goals: [
    { id: 'goal-1', title: 'خواندن ۱۲ کتاب در سال', note: 'هر ماه یک کتاب', done: false },
    { id: 'goal-2', title: 'ورزش منظم', note: 'حداقل سه روز در هفته', done: false },
  ],
  shopping: [
    { id: 'shop-1', title: 'میوه', quantity: 1, bought: false, price: 180000, date: todayIso(), categoryId: 'cat-fruit', accountId: 'account-1' },
    { id: 'shop-2', title: 'نان', quantity: 2, bought: true, price: 40000, date: todayIso(), categoryId: 'cat-food', accountId: 'account-1' },
  ],
  categories: defaultCategories,
  accounts: [{ id: 'account-1', name: 'حساب اصلی', initialBalance: 5000000 }],
  font: 'vazirmatn',
};

export function getStoredData(): PlannerData {
  try {
    const raw = localStorage.getItem(storageKey) ?? localStorage.getItem(legacyStorageKey);
    if (!raw) return defaultData;
    const saved = JSON.parse(raw) as Partial<PlannerData>;
    return {
      ...defaultData,
      ...saved,
      plans: (saved.plans ?? defaultData.plans).map((plan) => ({
        ...plan,
        endTime: plan.endTime ?? '',
        priority: plan.priority ?? 'متوسط',
        categoryId: plan.categoryId ?? 'cat-work',
      })),
      shopping: (saved.shopping ?? defaultData.shopping).map((item) => ({
        ...item,
        price: item.price ?? 0,
        date: item.date ?? todayIso(),
        categoryId: item.categoryId ?? 'cat-food',
        accountId: item.accountId ?? 'account-1',
      })),
      categories: saved.categories?.length ? saved.categories : defaultCategories,
      accounts: saved.accounts?.length ? saved.accounts : defaultData.accounts,
      font: saved.font ?? 'vazirmatn',
    };
  } catch {
    return defaultData;
  }
}

/**
 * Removing a category used to leave plans/shopping items pointing at a
 * dangling categoryId. This reassigns anything that referenced the removed
 * category (or one of its children) to the area's fallback category instead.
 */
export function removeCategoryFromData(data: PlannerData, categoryId: string): PlannerData {
  const removedIds = new Set(
    data.categories.filter((category) => category.id === categoryId || category.parentId === categoryId).map((category) => category.id),
  );
  const removed = data.categories.find((category) => category.id === categoryId);
  const fallback = removed ? fallbackCategoryId[removed.area] : 'cat-work';
  return {
    ...data,
    categories: data.categories.filter((category) => !removedIds.has(category.id)),
    plans: data.plans.map((plan) => (removedIds.has(plan.categoryId) ? { ...plan, categoryId: fallback } : plan)),
    shopping: data.shopping.map((item) => (removedIds.has(item.categoryId) ? { ...item, categoryId: fallback } : item)),
  };
}

/** Removing a bank account reassigns its shopping items to the first remaining account (if any). */
export function removeAccountFromData(data: PlannerData, accountId: string): PlannerData {
  const remainingAccounts = data.accounts.filter((account) => account.id !== accountId);
  const fallback = remainingAccounts[0]?.id ?? '';
  return {
    ...data,
    accounts: remainingAccounts,
    shopping: data.shopping.map((item) => (item.accountId === accountId ? { ...item, accountId: fallback } : item)),
  };
}
