import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  BarChart3, Bell, CalendarDays, Download, ListChecks, Menu, NotebookPen, Settings2, ShoppingCart, Target, X,
} from 'lucide-react';
import type { Category, Page, PlanKind, PlannerData, PrintMode, ReportPreset } from './types';
import { minutesOf, todayIso } from './lib/format';
import { getStoredData, removeAccountFromData, removeCategoryFromData, storageKey } from './lib/storage';
import { PrintReport } from './components/PrintReport';
import { TodayPage } from './pages/TodayPage';
import { TasksPage } from './pages/TasksPage';
import { PlannerPage } from './pages/PlannerPage';
import { CalendarPage } from './pages/CalendarPage';
import { ProgressPage } from './pages/ProgressPage';
import { GoalsPage } from './pages/GoalsPage';
import { ShoppingPage } from './pages/ShoppingPage';
import { RemindersPage } from './pages/RemindersPage';
import { SettingsPage } from './pages/SettingsPage';

const pages: { id: Page; label: string; icon: typeof NotebookPen }[] = [
  { id: 'today', label: 'امروز', icon: NotebookPen },
  { id: 'tasks', label: 'کارها', icon: ListChecks },
  { id: 'planner', label: 'پلنر', icon: CalendarDays },
  { id: 'calendar', label: 'تقویم', icon: CalendarDays },
  { id: 'progress', label: 'پیشرفت', icon: BarChart3 },
  { id: 'goals', label: 'اهداف', icon: Target },
  { id: 'shopping', label: 'خرید و هزینه', icon: ShoppingCart },
  { id: 'reminders', label: 'یادآوری‌ها', icon: Bell },
  { id: 'settings', label: 'تنظیمات', icon: Settings2 },
];

function App() {
  const [data, setData] = useState<PlannerData>(getStoredData);
  const [page, setPage] = useState<Page>('today');
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [printMode, setPrintMode] = useState<PrintMode>('planner');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted',
  );

  // Shared between the Planner and Calendar pages, so "add plan for this day" can jump across pages.
  const [planDate, setPlanDate] = useState(todayIso());
  const [plannerFilter, setPlannerFilter] = useState<PlanKind>('روزانه');
  const [planKind, setPlanKind] = useState<PlanKind>('روزانه');

  // Lifted (rather than local to ShoppingPage) so the print-only report reflects the same range.
  const [reportPreset, setReportPreset] = useState<ReportPreset>('ماهانه');
  const [reportFrom, setReportFrom] = useState(todayIso());
  const [reportTo, setReportTo] = useState(todayIso());

  const firedReminders = useRef<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  // Checks every 20s for داily plans whose reminder time has arrived; fires a browser
  // notification (if allowed) and always falls back to the in-app status banner.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = new Date();
      const nowIso = todayIso();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      data.plans
        .filter((plan) => plan.kind === 'روزانه' && !plan.done && plan.date === nowIso && (plan.reminderMinutes ?? 0) > 0)
        .forEach((plan) => {
          const fireAt = minutesOf(plan.time) - (plan.reminderMinutes ?? 0);
          const key = `${plan.id}-${nowIso}`;
          if (nowMinutes >= fireAt && nowMinutes < fireAt + 1 && !firedReminders.current.has(key)) {
            firedReminders.current.add(key);
            const text = `یادآوری: «${plan.title}» ساعت ${plan.time}`;
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('همراه برنامه‌ریز', { body: text });
            }
            notify(text);
          }
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 20000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.plans]);

  const update = (patch: Partial<PlannerData>) => setData((current) => ({ ...current, ...patch }));
  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2800);
  };
  const openPage = (next: Page) => {
    setPage(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const categoryById = (id: string): Category | undefined => data.categories.find((category) => category.id === id);
  const categoryName = (id: string) => {
    const category = categoryById(id);
    const parent = category?.parentId ? categoryById(category.parentId) : undefined;
    return category ? `${parent ? `${parent.title} / ` : ''}${category.title}` : 'بدون دسته';
  };
  const togglePlan = (id: string) => update({ plans: data.plans.map((plan) => (plan.id === id ? { ...plan, done: !plan.done } : plan)) });

  // window.print() must run synchronously inside the click handler, or some browsers drop the
  // call for losing "user activation". flushSync forces the printMode change into the DOM first
  // so the print-only report reflects the right mode without needing an async delay.
  const exportPdf = (mode: PrintMode) => {
    flushSync(() => setPrintMode(mode));
    notify('پنجرهٔ چاپ باز می‌شود؛ گزینهٔ «ذخیره به‌صورت PDF» را انتخاب کنید.');
    window.print();
  };

  const enableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return notify('مرورگر شما از اعلان پشتیبانی نمی‌کند.');
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    notify(permission === 'granted' ? 'اعلان یادآوری‌ها فعال شد.' : 'اجازه‌ی نمایش اعلان داده نشد.');
  };

  const switchPlannerKind = (kind: PlanKind) => {
    setPlannerFilter(kind);
    setPlanKind(kind);
  };
  const openPlanForDate = (iso: string, kind: PlanKind) => {
    setPlanDate(iso);
    switchPlannerKind(kind);
    openPage('planner');
  };
  const deleteCategory = (id: string) => {
    setData((current) => removeCategoryFromData(current, id));
    notify('دسته‌بندی حذف شد و موارد مرتبط به دسته‌ی پیش‌فرض منتقل شدند.');
  };
  const deleteAccount = (id: string) => {
    setData((current) => removeAccountFromData(current, id));
    notify('حساب حذف شد.');
  };

  const plannerCategories = data.categories.filter((category) => category.area === 'planner');

  return (
    <div className={`min-h-screen bg-[#f6f8f6] pb-24 text-[#26342c] font-${data.font}`}>
      <header className="no-print sticky top-0 z-30 border-b border-[#e1e6e1] bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button data-testid="menu-button" onClick={() => setMenuOpen(true)} className="grid size-11 place-items-center rounded-xl text-[#355346] hover:bg-[#edf4ee]" aria-label="باز کردن منو">
            <Menu size={23} />
          </button>
          <button data-testid="brand-home-button" onClick={() => openPage('today')} className="text-center">
            <b className="block text-base font-black">پلیز</b>
            <small className="block text-[10px] text-[#7d8a82]">دفتر برنامه‌ریزی من</small>
          </button>
          <button data-testid="export-pdf-button" onClick={() => exportPdf('planner')} className="grid size-11 place-items-center rounded-xl text-[#17633a] hover:bg-[#e8f3ea]" aria-label="خروجی پی‌دی‌اف">
            <Download size={20} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="no-print fixed inset-0 z-50 bg-[#12261d]/35" onClick={() => setMenuOpen(false)}>
          <aside data-testid="app-menu" className="h-full w-[min(20rem,88vw)] overflow-y-auto bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-[#0e5533] text-white">
                  <NotebookPen size={22} />
                </span>
                <div>
                  <b className="block font-black">دفتر برنامه‌ریزی من</b>
                  <span className="text-xs text-[#708075]">همراه روزهای شما</span>
                </div>
              </div>
              <button data-testid="close-menu-button" onClick={() => setMenuOpen(false)} className="grid size-10 place-items-center rounded-xl text-[#66756a] hover:bg-[#edf2ee]" aria-label="بستن منو">
                <X size={21} />
              </button>
            </div>
            <nav className="space-y-1">
              {pages.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    data-testid={`nav-${item.id}`}
                    onClick={() => openPage(item.id)}
                    className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-right text-sm font-bold ${page === item.id ? 'bg-[#e5f0e7] text-[#075b31]' : 'text-[#4f6256] hover:bg-[#eff4f0]'}`}
                  >
                    <Icon size={19} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <p className="mt-8 rounded-2xl bg-[#edf4ee] p-4 text-xs leading-6 text-[#53715e]">
              همهٔ انتخاب‌های تاریخ با تقویم هجری شمسی انجام می‌شوند و اطلاعات شما روی دستگاه حفظ می‌شود.
            </p>
          </aside>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {message && (
          <div data-testid="status-message" role="status" className="no-print mb-5 rounded-xl border border-[#bcddc5] bg-[#e6f5e9] px-4 py-3 text-sm font-bold text-[#17643a]">
            {message}
          </div>
        )}

        {page === 'today' && <TodayPage data={data} update={update} categoryById={categoryById} togglePlan={togglePlan} openPlanner={() => openPage('planner')} />}
        {page === 'tasks' && <TasksPage data={data} update={update} notify={notify} />}
        {page === 'planner' && (
          <PlannerPage
            data={data}
            update={update}
            notify={notify}
            categoryById={categoryById}
            categoryName={categoryName}
            plannerCategories={plannerCategories}
            togglePlan={togglePlan}
            plannerFilter={plannerFilter}
            planKind={planKind}
            planDate={planDate}
            onSwitchKind={switchPlannerKind}
            setPlanDate={setPlanDate}
          />
        )}
        {page === 'calendar' && <CalendarPage data={data} categoryById={categoryById} togglePlan={togglePlan} onAddPlanForDate={openPlanForDate} />}
        {page === 'progress' && <ProgressPage data={data} categoryById={categoryById} togglePlan={togglePlan} onExportPdf={() => exportPdf('planner')} />}
        {page === 'goals' && <GoalsPage data={data} update={update} notify={notify} />}
        {page === 'shopping' && (
          <ShoppingPage
            data={data}
            update={update}
            notify={notify}
            categoryName={categoryName}
            reportPreset={reportPreset}
            setReportPreset={setReportPreset}
            reportFrom={reportFrom}
            setReportFrom={setReportFrom}
            reportTo={reportTo}
            setReportTo={setReportTo}
            onExportPdf={() => exportPdf('shopping')}
            onDeleteAccount={deleteAccount}
          />
        )}
        {page === 'reminders' && (
          <RemindersPage data={data} categoryById={categoryById} notificationsEnabled={notificationsEnabled} onEnableNotifications={enableNotifications} />
        )}
        {page === 'settings' && <SettingsPage data={data} update={update} notify={notify} categoryName={categoryName} onDeleteCategory={deleteCategory} />}

        <PrintReport data={data} printMode={printMode} reportPreset={reportPreset} reportFrom={reportFrom} reportTo={reportTo} categoryName={categoryName} />
      </main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-[#dce6de] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {pages.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                data-testid={`mobile-nav-${item.id}`}
                onClick={() => openPage(item.id)}
                className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${page === item.id ? 'bg-[#e4f0e6] text-[#0f6339]' : 'text-[#6a7b70]'}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button data-testid="mobile-more-button" onClick={() => setMenuOpen(true)} className="flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold text-[#6a7b70]">
            <Menu size={19} />
            <span>بیشتر</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
