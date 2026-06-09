import FilterSidebar from '@/components/FilterSidebar';
import ProductCard from '@/components/ProductCard';
import {
  getCategories,
  getBrands,
  getProducts,
  getProductsByCategory,
  searchProducts,
  type ApiRes,
  type Page,
} from '@/lib/api';
import type { Category, Product, Brand } from '@/types';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{
    search?: string;
    brandIds?: string;
    categoryIds?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    sort?: string;
    categoryName?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || '0');
  const sort = params.sort || 'createdAt,desc';

  let products: Product[] = [];
  let totalPages = 0;
  let categories: Category[] = [];
  let brands: Brand[] = [];

  const categoriesPromise = getCategories()
    .then((r) => r.data ?? [])
    .catch(() => [] as Category[]);

  const brandsPromise = getBrands()
    .then((r) => r.data ?? [])
    .catch(() => [] as Brand[]);

  const productsPromise = getProducts(page, 20, sort, {
    categoryIds: params.categoryIds || params.categoryId,
    brandIds: params.brandIds,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    keyword: params.search
  });

  const [cats, brnds, prodRes] = await Promise.allSettled([categoriesPromise, brandsPromise, productsPromise]);
  if (cats.status === 'fulfilled') categories = cats.value;
  if (brnds.status === 'fulfilled') brands = brnds.value;
  if (prodRes.status === 'fulfilled') {
    products = prodRes.value.data.content;
    totalPages = prodRes.value.data.totalPages;
  }

  const sortOptions = [
    { value: 'createdAt,desc', label: 'Newest First' },
    { value: 'mainPrice,asc', label: 'Price: Low → High' },
    { value: 'mainPrice,desc', label: 'Price: High → Low' },
    { value: 'avgRating,desc', label: 'Top Rated' },
  ];

  function buildHref(overrides: Record<string, string>) {
    const merged = { ...params, ...overrides };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    return `/products?${sp.toString()}`;
  }

  function findCategoryName(cats: Category[], id?: string): string | undefined {
    if (!id) return undefined;
    for (const cat of cats) {
      if (cat.id === id) return cat.nameEn;
      if (cat.children) {
        const found = findCategoryName(cat.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  const activeCategoryId = params.categoryIds || params.categoryId;
  const singleCategoryId = activeCategoryId && !activeCategoryId.includes(',') ? activeCategoryId : undefined;
  const resolvedCategoryName = params.categoryName || findCategoryName(categories, singleCategoryId);

  const pageTitle = params.search
    ? `Search: "${params.search}"`
    : resolvedCategoryName
      ? resolvedCategoryName
      : 'All Products';

  return (
    <div className="bg-[#F2F4F8] min-h-screen py-5">
      <div className="container-main">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#EF4A23] transition-colors">Home</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-gray-400">Products</span>
          {resolvedCategoryName && (
            <>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-[#081621] font-semibold">{resolvedCategoryName}</span>
            </>
          )}
        </nav>

        <div className="flex gap-4 items-start">

          {/* ── Sidebar ── */}
          <aside className="w-[260px] flex-shrink-0 hidden md:block">
            <FilterSidebar categories={categories} brands={brands} />
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* Top Bar */}
            <div className="bg-white border border-[#e2e4e8] px-4 py-3 mb-4 flex items-center justify-between">
              <h1 className="text-[14px] font-bold text-[#081621]">{pageTitle}</h1>
              <span className="text-[12px] text-gray-400">{products.length} products</span>
            </div>

            {/* Grid or Empty */}
            {products.length === 0 ? (
              <div className="bg-white border border-[#e2e4e8] text-center py-20">
                <p className="text-base font-bold text-[#333] mb-1">No products found</p>
                <p className="text-[12px] text-gray-400 mb-5">Try adjusting your filters or search query.</p>
                <Link
                  href="/products"
                  className="inline-block px-5 py-2 bg-[#EF4A23] text-white text-[12px] font-bold hover:bg-[#d43d1a] transition-colors"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-6">
                {page > 0 && (
                  <Link
                    href={buildHref({ page: String(page - 1) })}
                    className="px-4 py-2 text-[12px] font-semibold bg-white border border-[#e2e4e8] text-[#333] hover:bg-[#EF4A23] hover:text-white hover:border-[#EF4A23] transition-colors"
                  >
                    ← Prev
                  </Link>
                )}

                {/* Page number pills */}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p0 = Math.max(0, Math.min(page - 3, totalPages - 7));
                  const n = p0 + i;
                  return (
                    <Link
                      key={n}
                      href={buildHref({ page: String(n) })}
                      className={`w-9 h-9 flex items-center justify-center text-[12px] font-semibold border transition-colors ${n === page
                        ? 'bg-[#EF4A23] text-white border-[#EF4A23]'
                        : 'bg-white text-[#333] border-[#e2e4e8] hover:border-[#EF4A23] hover:text-[#EF4A23]'
                        }`}
                    >
                      {n + 1}
                    </Link>
                  );
                })}

                {page < totalPages - 1 && (
                  <Link
                    href={buildHref({ page: String(page + 1) })}
                    className="px-4 py-2 text-[12px] font-semibold bg-white border border-[#e2e4e8] text-[#333] hover:bg-[#EF4A23] hover:text-white hover:border-[#EF4A23] transition-colors"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
