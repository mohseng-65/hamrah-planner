import type { Category } from '../types';

export function CategoryList({
  title,
  categories,
  categoryName,
  onDelete,
}: {
  title: string;
  categories: Category[];
  categoryName: (id: string) => string;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-black text-[#3b5949]">{title}</h3>
      <div className="space-y-2">
        {categories
          .filter((category) => !category.parentId)
          .map((category) => (
            <div key={category.id}>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f4f7f4] px-3 py-3">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <i className="size-3 rounded-full" style={{ background: category.color }} />
                  {category.title}
                </span>
                <button data-testid={`delete-category-${category.id}`} onClick={() => onDelete(category.id)} className="text-xs text-[#a34f4f]">
                  حذف
                </button>
              </div>
              {categories
                .filter((child) => child.parentId === category.id)
                .map((child) => (
                  <div key={child.id} className="me-5 mt-2 flex items-center justify-between gap-3 rounded-xl border border-[#e2e9e3] px-3 py-2.5">
                    <span className="flex items-center gap-2 text-xs font-bold">
                      <i className="size-2.5 rounded-full" style={{ background: child.color }} />
                      {categoryName(child.id)}
                    </span>
                    <button data-testid={`delete-category-${child.id}`} onClick={() => onDelete(child.id)} className="text-xs text-[#a34f4f]">
                      حذف
                    </button>
                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
}
