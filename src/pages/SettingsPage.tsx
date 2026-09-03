import { useState } from 'react';
import { Plus, Settings2 } from 'lucide-react';
import type { CategoryArea, FontChoice, PlannerData } from '../types';
import { uid } from '../lib/format';
import { categoryColors } from '../lib/storage';
import { PageHeading } from '../components/common';
import { CategoryList } from '../components/CategoryList';

const fonts: { id: FontChoice; title: string }[] = [
  { id: 'vazirmatn', title: 'وزیرمتن' },
  { id: 'nazanin', title: 'بی‌نازنین' },
  { id: 'titr', title: 'بی‌تیتر' },
];

export function SettingsPage({
  data,
  update,
  notify,
  categoryName,
  onDeleteCategory,
}: {
  data: PlannerData;
  update: (patch: Partial<PlannerData>) => void;
  notify: (text: string) => void;
  categoryName: (id: string) => string;
  onDeleteCategory: (id: string) => void;
}) {
  const [categoryArea, setCategoryArea] = useState<CategoryArea>('planner');
  const [categoryTitle, setCategoryTitle] = useState('');
  const [categoryParent, setCategoryParent] = useState('');
  const [categoryColor, setCategoryColor] = useState(categoryColors[0]);

  const plannerCategories = data.categories.filter((category) => category.area === 'planner');
  const shoppingCategories = data.categories.filter((category) => category.area === 'shopping');

  const addCategory = () => {
    const title = categoryTitle.trim();
    if (!title) return notify('عنوان دسته را بنویسید.');
    update({ categories: [...data.categories, { id: uid(), title, area: categoryArea, parentId: categoryParent || null, color: categoryColor }] });
    setCategoryTitle('');
    setCategoryParent('');
    notify('دسته‌بندی جدید ذخیره شد.');
  };

  return (
    <section data-testid="settings-page" className="space-y-5">
      <PageHeading title="تنظیمات" description="دسته‌بندی‌های چندسطحی، رنگ‌ها و فونت دلخواه را مدیریت کنید." icon={Settings2} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[.85fr_1.15fr]">
        <section className="planner-card p-5 sm:p-6">
          <h2 className="text-lg font-black">ظاهر نوشته‌ها</h2>
          <p className="mt-1 text-sm text-[#748278]">فونت را برای تمام دفترچه انتخاب کنید.</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {fonts.map((font) => (
              <button
                key={font.id}
                data-testid={`font-${font.id}`}
                onClick={() => update({ font: font.id })}
                className={`min-h-12 rounded-xl border px-3 text-sm font-bold ${data.font === font.id ? 'border-[#177043] bg-[#e7f3e9] text-[#106138]' : 'border-[#dce6de] bg-white'}`}
              >
                {font.title}
              </button>
            ))}
          </div>
          <div className="mt-7 border-t border-[#e6ece7] pt-5">
            <h2 className="text-lg font-black">ساخت دسته‌بندی</h2>
            <div className="mt-4 space-y-3">
              <select
                data-testid="category-area-select"
                value={categoryArea}
                onChange={(event) => {
                  setCategoryArea(event.target.value as CategoryArea);
                  setCategoryParent('');
                }}
                className="field"
              >
                <option value="planner">دسته‌بندی کارها و پلنر</option>
                <option value="shopping">دسته‌بندی خرید</option>
              </select>
              <input data-testid="category-title-input" value={categoryTitle} onChange={(event) => setCategoryTitle(event.target.value)} placeholder="عنوان دسته یا زیرمجموعه" className="field" />
              <select data-testid="category-parent-select" value={categoryParent} onChange={(event) => setCategoryParent(event.target.value)} className="field">
                <option value="">عنوان اصلی (بدون زیرمجموعه)</option>
                {data.categories
                  .filter((category) => category.area === categoryArea && !category.parentId)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      زیرمجموعهٔ {category.title}
                    </option>
                  ))}
              </select>
              <div className="flex flex-wrap items-center gap-2">
                {categoryColors.map((color) => (
                  <button
                    key={color}
                    data-testid={`category-color-${color}`}
                    onClick={() => setCategoryColor(color)}
                    className={`size-8 rounded-full ring-offset-2 ${categoryColor === color ? 'ring-2 ring-[#263d2f]' : ''}`}
                    style={{ background: color }}
                    aria-label="انتخاب رنگ"
                  />
                ))}
                <input data-testid="category-color-input" type="color" value={categoryColor} onChange={(event) => setCategoryColor(event.target.value)} className="size-9 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
              </div>
              <button data-testid="add-category-button" onClick={addCategory} className="primary-button w-full">
                <Plus size={18} />افزودن دسته‌بندی
              </button>
            </div>
          </div>
        </section>
        <section className="planner-card p-5 sm:p-6">
          <h2 className="text-lg font-black">دسته‌بندی‌های فعلی</h2>
          <p className="mt-1 text-sm text-[#748278]">هر عنوان اصلی می‌تواند زیرمجموعه و رنگ مستقل داشته باشد. حذف یک دسته، برنامه‌ها و خریدهای آن را به‌طور خودکار به دسته‌ی پیش‌فرض منتقل می‌کند.</p>
          <CategoryList title="کارها و پلنر" categories={plannerCategories} categoryName={categoryName} onDelete={onDeleteCategory} />
          <CategoryList title="خرید" categories={shoppingCategories} categoryName={categoryName} onDelete={onDeleteCategory} />
        </section>
      </div>
    </section>
  );
}
