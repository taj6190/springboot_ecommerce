import { getCategories } from '@/lib/api';
import type { Category } from '@/types';
import Link from 'next/link';
import { ArrowRight, Grid3X3 } from 'lucide-react';

export const metadata = {
  title: 'All Categories — Nexora',
  description: 'Browse all product categories at Nexora.',
};

export default async function CategoriesPage() {
  let categories: Category[] = [];
  try {
    const res = await getCategories();
    categories = res.data ?? [];
  } catch {}

  return (
    <div className="container-main py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <Grid3X3 size={24} style={{ color: 'var(--color-accent)' }} /> All Categories
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>Browse products by category</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>No categories yet.</div>
      ) : (
        <div className="space-y-8">
          {categories.map(cat => (
            <div key={cat.id}>
              <Link href={`/products?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.nameEn)}`}
                className="flex items-center gap-3 mb-4 group">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ background: 'rgba(239,74,35,0.08)', color: 'var(--color-accent)' }}>{cat.nameEn.charAt(0)}</div>
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-bold group-hover:text-[var(--color-accent)] transition-colors">{cat.nameEn}</h2>
                  {cat.nameBn && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{cat.nameBn}</p>}
                </div>
                <ArrowRight size={16} style={{ color: 'var(--color-text-muted)' }} />
              </Link>
              {cat.children && cat.children.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 ml-4 pl-4" style={{ borderLeft: '2px solid var(--color-border)' }}>
                  {cat.children.map(sub => (
                    <Link key={sub.id} href={`/products?categoryId=${sub.id}&categoryName=${encodeURIComponent(sub.nameEn)}`}
                      className="p-3 rounded-xl text-center transition-all hover:bg-[var(--color-bg-card)] group"
                      style={{ border: '1px solid var(--color-border)' }}>
                      {sub.imageUrl ? (
                        <img src={sub.imageUrl} alt="" className="w-8 h-8 mx-auto rounded object-cover mb-2" />
                      ) : (
                        <div className="w-8 h-8 mx-auto rounded flex items-center justify-center mb-2 text-xs font-bold"
                          style={{ background: 'rgba(239,74,35,0.06)', color: 'var(--color-accent)' }}>{sub.nameEn.charAt(0)}</div>
                      )}
                      <p className="text-xs font-medium truncate group-hover:text-[var(--color-accent)]">{sub.nameEn}</p>
                      {sub.children && sub.children.length > 0 && (
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub.children.length} sub</p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
