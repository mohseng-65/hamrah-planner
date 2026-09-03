export type Page = 'today' | 'tasks' | 'planner' | 'calendar' | 'progress' | 'goals' | 'shopping' | 'reminders' | 'settings';
export type PlanKind = 'روزانه' | 'هفتگی' | 'ماهانه' | 'سالانه';
export type Priority = 'زیاد' | 'متوسط' | 'کم';
export type CategoryArea = 'planner' | 'shopping';
export type FontChoice = 'vazirmatn' | 'nazanin' | 'titr';
export type ReportPreset = 'روزانه' | 'هفتگی' | 'ماهانه' | 'سالانه' | 'دلخواه';
export type PrintMode = 'planner' | 'shopping';
export type GoalPeriodKind = 'ماهانه' | 'سالانه';
export type TransactionType = 'واریز' | 'برداشت';

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
  /** Minutes before `time` to fire an in-app reminder. Only meaningful for داily plans with a time. */
  reminderMinutes?: number;
};

export type Goal = {
  id: string;
  title: string;
  note: string;
  done: boolean;
  /** Optional timeframe the goal is tied to. periodDate is a month-start or year-start ISO date. */
  periodKind?: GoalPeriodKind;
  periodDate?: string;
};

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

export type AccountTransaction = {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  date: string;
  note: string;
};

export type PlannerData = {
  note: string;
  tasks: Task[];
  plans: Plan[];
  goals: Goal[];
  shopping: ShoppingItem[];
  categories: Category[];
  accounts: BankAccount[];
  transactions: AccountTransaction[];
  font: FontChoice;
};
