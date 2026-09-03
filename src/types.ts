export type Page = 'today' | 'tasks' | 'planner' | 'calendar' | 'progress' | 'goals' | 'shopping' | 'settings';
export type PlanKind = 'روزانه' | 'هفتگی' | 'ماهانه' | 'سالانه';
export type Priority = 'زیاد' | 'متوسط' | 'کم';
export type CategoryArea = 'planner' | 'shopping';
export type FontChoice = 'vazirmatn' | 'nazanin' | 'titr';
export type ReportPreset = 'روزانه' | 'هفتگی' | 'ماهانه' | 'سالانه' | 'دلخواه';
export type PrintMode = 'planner' | 'shopping';

export type Task = { id: string; title: string; done: boolean; createdAt: string };

export type Plan = {
  id: string;
  title: string;
  kind: PlanKind;
  date: string;
  time: string;
  endTime: string;
  done: boolean;
  priority: Priority;
  categoryId: string;
};

export type Goal = { id: string; title: string; note: string; done: boolean };

export type Category = { id: string; title: string; area: CategoryArea; parentId: string | null; color: string };

export type ShoppingItem = {
  id: string;
  title: string;
  quantity: number;
  bought: boolean;
  price: number;
  date: string;
  categoryId: string;
  accountId: string;
};

export type BankAccount = { id: string; name: string; initialBalance: number };

export type PlannerData = {
  note: string;
  tasks: Task[];
  plans: Plan[];
  goals: Goal[];
  shopping: ShoppingItem[];
  categories: Category[];
  accounts: BankAccount[];
  font: FontChoice;
};
