import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Check, Download, ShoppingCart, Trash2, WalletCards } from 'lucide-react';
import type { PlannerData, ReportPreset, TransactionType } from '../types';
import { digits, formatMoney, formatShort, todayIso, toIso, uid } from '../lib/format';
import { jalaliMonthStart, jalaliYearStart } from '../lib/jalali';
import { computeShoppingReport } from '../lib/report';
import { accountBalance, accountTransactionsSorted } from '../lib/storage';
import { EmptyState, PageHeading, StatCard } from '../components/common';
import { JalaliDatePicker } from '../components/JalaliDatePicker';

const reportPresets: ReportPreset[] = ['روزانه', 'هفتگی', 'ماهانه', 'سالانه', 'دلخواه'];

export function ShoppingPage({
  data,
  update,
  notify,
  categoryName,
  reportPreset,
  setReportPreset,
  reportFrom,
  setReportFrom,
  reportTo,
  setReportTo,
  onExportPdf,
  onDeleteAccount,
}: {
  data: PlannerData;
  update: (patch: Partial<PlannerData>) => void;
  notify: (text: string) => void;
  categoryName: (id: string) => string;
  reportPreset: ReportPreset;
  setReportPreset: (preset: ReportPreset) => void;
  reportFrom: string;
  setReportFrom: (iso: string) => void;
  reportTo: string;
  setReportTo: (iso: string) => void;
  onExportPdf: () => void;
  onDeleteAccount: (id: string) => void;
}) {
  const [shoppingTitle, setShoppingTitle] = useState('');
  const [shoppingPrice, setShoppingPrice] = useState('');
  const [shoppingCategory, setShoppingCategory] = useState('cat-food');
  const [shoppingAccount, setShoppingAccount] = useState(data.accounts[0]?.id ?? '');
  const [shoppingDate, setShoppingDate] = useState(todayIso());
  const [accountName, setAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('برداشت');
  const [transactionAccount, setTransactionAccount] = useState(data.accounts[0]?.id ?? '');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionNote, setTransactionNote] = useState('');

  const shoppingCategories = data.categories.filter((category) => category.area === 'shopping');

  const addShopping = () => {
    const title = shoppingTitle.trim();
    const price = Number(shoppingPrice);
    if (!title) return notify('لطفاً نام خرید را بنویسید.');
    if (!Number.isFinite(price) || price < 0) return notify('مبلغ خرید را به تومان وارد کنید.');
    if (!shoppingAccount) return notify('ابتدا یک حساب بانکی اضافه کنید.');
    update({ shopping: [{ id: uid(), title, quantity: 1, bought: false, price, date: shoppingDate, categoryId: shoppingCategory, accountId: shoppingAccount }, ...data.shopping] });
    setShoppingTitle('');
    setShoppingPrice('');
    notify('مورد خرید به لیست اضافه شد.');
  };

  const addAccount = () => {
    const name = accountName.trim();
    const balance = Number(newAccountBalance);
    if (!name) return notify('نام حساب را بنویسید.');
    if (!Number.isFinite(balance) || balance < 0) return notify('موجودی اولیه را درست وارد کنید.');
    const account = { id: uid(), name, initialBalance: balance };
    update({ accounts: [...data.accounts, account] });
    setShoppingAccount(account.id);
    setTransactionAccount(account.id);
    setAccountName('');
    setNewAccountBalance('');
    notify('حساب جدید اضافه شد.');
  };

  const addTransaction = () => {
    const amount = Number(transactionAmount);
    if (!transactionAccount) return notify('ابتدا یک حساب بانکی اضافه کنید.');
    if (!Number.isFinite(amount) || amount <= 0) return notify('مبلغ تراکنش را درست وارد کنید.');
    update({
      transactions: [
        { id: uid(), accountId: transactionAccount, type: transactionType, amount, date: todayIso(), note: transactionNote.trim() },
        ...data.transactions,
      ],
    });
    setTransactionAmount('');
    setTransactionNote('');
    notify(transactionType === 'واریز' ? 'واریز ثبت شد و موجودی حساب به‌روز شد.' : 'برداشت ثبت شد و موجودی حساب به‌روز شد.');
  };

  const { total: reportTotal, dates: reportDates, totalsByCategory } = computeShoppingReport(data, reportPreset, reportFrom, reportTo);

  return (
    <section data-testid="shopping-page" className="space-y-5">
      <PageHeading title="خرید و هزینه‌ها" description="خریدها را با تاریخ شمسی دسته‌بندی و موجودی حساب‌ها را پیگیری کنید." icon={ShoppingCart} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="خرید امروز"
          value={formatMoney(data.shopping.filter((item) => item.bought && item.date === todayIso()).reduce((sum, item) => sum + item.price * item.quantity, 0))}
          text="هزینه‌های پرداخت‌شده امروز"
        />
        <StatCard
          title="خرید این ماه شمسی"
          value={formatMoney(data.shopping.filter((item) => item.bought && item.date >= toIso(jalaliMonthStart(new Date()))).reduce((sum, item) => sum + item.price * item.quantity, 0))}
          text="جمع هزینه از ابتدای ماه"
        />
        <StatCard
          title="خرید امسال شمسی"
          value={formatMoney(data.shopping.filter((item) => item.bought && item.date >= toIso(jalaliYearStart(new Date()))).reduce((sum, item) => sum + item.price * item.quantity, 0))}
          text="جمع هزینه از ابتدای سال"
        />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <section className="planner-card p-5 sm:p-6">
          <h2 className="text-lg font-black">ثبت خرید جدید</h2>
          <div className="mt-4 space-y-3">
            <input data-testid="shopping-input" value={shoppingTitle} onChange={(event) => setShoppingTitle(event.target.value)} placeholder="مثلاً: خرید میوه" className="field" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input data-testid="shopping-price-input" type="number" min="0" value={shoppingPrice} onChange={(event) => setShoppingPrice(event.target.value)} placeholder="مبلغ (تومان)" className="field" />
              <JalaliDatePicker testId="shopping-date-input" label="تاریخ خرید شمسی" value={shoppingDate} onChange={setShoppingDate} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select data-testid="shopping-category-select" value={shoppingCategory} onChange={(event) => setShoppingCategory(event.target.value)} className="field">
                {shoppingCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {categoryName(category.id)}
                  </option>
                ))}
              </select>
              <select data-testid="shopping-account-select" value={shoppingAccount} onChange={(event) => setShoppingAccount(event.target.value)} className="field">
                {data.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <button data-testid="add-shopping-button" onClick={addShopping} className="primary-button w-full">
              افزودن به لیست خرید
            </button>
          </div>

          <div className="mt-7 border-t border-[#e6ece7] pt-5">
            <h2 className="text-lg font-black">واریز / برداشت از حساب</h2>
            <p className="mt-1 text-sm text-[#748278]">این تراکنش‌ها مستقل از فهرست خریدند و بلافاصله موجودی حساب را تغییر می‌دهند.</p>
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  data-testid="transaction-type-withdraw"
                  onClick={() => setTransactionType('برداشت')}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-bold ${transactionType === 'برداشت' ? 'bg-[#a34f4f] text-white' : 'bg-[#f3ecec] text-[#7a4a4a]'}`}
                >
                  <ArrowDownCircle size={16} />
                  برداشت
                </button>
                <button
                  type="button"
                  data-testid="transaction-type-deposit"
                  onClick={() => setTransactionType('واریز')}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-bold ${transactionType === 'واریز' ? 'bg-[#0e6038] text-white' : 'bg-[#edf3ee] text-[#53695c]'}`}
                >
                  <ArrowUpCircle size={16} />
                  واریز
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select data-testid="transaction-account-select" value={transactionAccount} onChange={(event) => setTransactionAccount(event.target.value)} className="field">
                  {data.accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                <input data-testid="transaction-amount-input" type="number" min="0" value={transactionAmount} onChange={(event) => setTransactionAmount(event.target.value)} placeholder="مبلغ (تومان)" className="field" />
              </div>
              <input data-testid="transaction-note-input" value={transactionNote} onChange={(event) => setTransactionNote(event.target.value)} placeholder="توضیح (اختیاری)" className="field" />
              <button data-testid="add-transaction-button" onClick={addTransaction} className="secondary-button w-full">
                ثبت تراکنش
              </button>
            </div>
          </div>
        </section>

        <section className="planner-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <WalletCards className="text-[#177043]" size={22} />
            <h2 className="text-lg font-black">حساب‌های بانکی</h2>
          </div>
          <div className="mt-4 space-y-2">
            {data.accounts.map((account) => (
              <div key={account.id} className="rounded-xl bg-[#f2f6f2] px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <b className="block text-sm">{account.name}</b>
                    <span className="text-xs text-[#718077]">موجودی اولیه: {formatMoney(account.initialBalance)}</span>
                  </div>
                  <b data-testid={`account-balance-${account.id}`} className="shrink-0 text-sm text-[#16693c]">
                    {formatMoney(accountBalance(data, account.id))}
                  </b>
                  <button data-testid={`delete-account-${account.id}`} onClick={() => onDeleteAccount(account.id)} className="shrink-0 text-xs text-[#a34f4f]">
                    حذف
                  </button>
                </div>
                {accountTransactionsSorted(data, account.id).length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-white pt-2">
                    {accountTransactionsSorted(data, account.id)
                      .slice(0, 3)
                      .map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between text-[11px] text-[#5c6d61]">
                          <span>
                            {transaction.type} {transaction.note ? `— ${transaction.note}` : ''}
                          </span>
                          <span className={transaction.type === 'واریز' ? 'font-bold text-[#177043]' : 'font-bold text-[#a34f4f]'}>
                            {transaction.type === 'واریز' ? '+' : '−'}
                            {formatMoney(transaction.amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
            {!data.accounts.length && <EmptyState text="هنوز حساب بانکی ثبت نشده است." />}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input data-testid="account-name-input" value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="نام حساب" className="field" />
            <input data-testid="account-balance-input" type="number" min="0" value={newAccountBalance} onChange={(event) => setNewAccountBalance(event.target.value)} placeholder="موجودی اولیه" className="field" />
            <button data-testid="add-account-button" onClick={addAccount} className="secondary-button">
              افزودن
            </button>
          </div>
        </section>
      </div>
      <section className="planner-card overflow-hidden">
        <div className="border-b border-[#e2e9e3] px-5 py-5 sm:px-6">
          <h2 className="font-black">فهرست خرید</h2>
          <p className="mt-1 text-sm text-[#748278]">تیک زدن هر مورد، هزینه را از حساب انتخاب‌شده کم می‌کند.</p>
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          {data.shopping.length ? (
            data.shopping.map((item) => (
              <article key={item.id} className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3 sm:flex-nowrap ${item.bought ? 'border-[#d9e9dc] bg-[#f6faf6]' : 'border-[#d9e4db] bg-white'}`}>
                <button
                  data-testid={`toggle-shopping-${item.id}`}
                  onClick={() => update({ shopping: data.shopping.map((entry) => (entry.id === item.id ? { ...entry, bought: !entry.bought } : entry)) })}
                  className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 ${item.bought ? 'border-[#28a75b] bg-[#28a75b] text-white' : 'border-[#aebfb2] text-transparent'}`}
                >
                  <Check size={16} />
                </button>
                <div className="min-w-0 flex-1">
                  <b className={item.bought ? 'line-through text-[#718077]' : ''}>{item.title}</b>
                  <p className="mt-1 text-xs text-[#718177]">
                    {categoryName(item.categoryId)} • {data.accounts.find((account) => account.id === item.accountId)?.name ?? 'بدون حساب'} • {formatShort(item.date)}
                  </p>
                </div>
                <b className="text-sm text-[#17663b]">{formatMoney(item.price * item.quantity)}</b>
                <div className="flex items-center rounded-xl bg-[#edf2ee]">
                  <button
                    data-testid={`decrease-shopping-${item.id}`}
                    onClick={() => update({ shopping: data.shopping.map((entry) => (entry.id === item.id ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry)) })}
                    className="grid size-10 place-items-center"
                  >
                    −
                  </button>
                  <b data-testid={`shopping-quantity-${item.id}`} className="w-7 text-center text-sm">
                    {digits.format(item.quantity)}
                  </b>
                  <button
                    data-testid={`increase-shopping-${item.id}`}
                    onClick={() => update({ shopping: data.shopping.map((entry) => (entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry)) })}
                    className="grid size-10 place-items-center"
                  >
                    +
                  </button>
                </div>
                <button
                  data-testid={`delete-shopping-${item.id}`}
                  onClick={() => update({ shopping: data.shopping.filter((entry) => entry.id !== item.id) })}
                  className="grid size-10 place-items-center rounded-xl text-[#88978c] hover:bg-red-50 hover:text-red-600"
                  aria-label="حذف خرید"
                >
                  <Trash2 size={18} />
                </button>
              </article>
            ))
          ) : (
            <EmptyState text="لیست خرید شما خالی است." />
          )}
        </div>
      </section>
      <section className="planner-card p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black">گزارش خرج‌کرد</h2>
            <p className="mt-1 text-sm text-[#748278]">گزارش را در بازهٔ تاریخ شمسی ببینید و به پی‌دی‌اف تبدیل کنید.</p>
          </div>
          <button data-testid="shopping-pdf-button" onClick={onExportPdf} className="secondary-button">
            <Download size={17} />خروجی پی‌دی‌اف
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {reportPresets.map((preset) => (
            <button
              key={preset}
              data-testid={`report-${preset}`}
              onClick={() => setReportPreset(preset)}
              className={`min-h-10 rounded-xl px-3 text-xs font-bold ${reportPreset === preset ? 'bg-[#0e6038] text-white' : 'bg-[#edf3ee] text-[#53695c]'}`}
            >
              {preset}
            </button>
          ))}
        </div>
        {reportPreset === 'دلخواه' && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <JalaliDatePicker testId="report-from-input" label="از تاریخ شمسی" value={reportFrom} onChange={setReportFrom} />
            <JalaliDatePicker testId="report-to-input" label="تا تاریخ شمسی" value={reportTo} onChange={setReportTo} />
          </div>
        )}
        <div data-testid="shopping-report" className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[.7fr_1.3fr]">
          <div className="rounded-2xl bg-[#e9f4eb] p-5">
            <p className="text-sm font-bold text-[#477255]">جمع خرج‌کرد</p>
            <b className="mt-3 block text-2xl font-black text-[#12673b]">{formatMoney(reportTotal)}</b>
            <p className="mt-2 text-xs leading-6 text-[#5f7765]">
              {formatShort(reportDates.from)} تا {formatShort(reportDates.to)}
            </p>
          </div>
          <div className="space-y-2">
            {totalsByCategory.length ? (
              totalsByCategory.map(({ category, total }) => (
                <div key={category.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#e0e8e1] px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-bold">
                    <i className="size-3 rounded-full" style={{ background: category.color }} />
                    {categoryName(category.id)}
                  </span>
                  <b className="text-sm">{formatMoney(total)}</b>
                </div>
              ))
            ) : (
              <EmptyState text="در این بازه خرج‌کرد ثبت‌شده‌ای ندارید." />
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
