const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api';

/* ── Core fetch wrapper ─────────────────────────────────────────── */

interface FetchOpts extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

export async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { params, ...init } = opts;
  let url = `${API}${path}`;

  if (params) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '' && v !== null) {
        if (Array.isArray(v)) {
          v.forEach(val => sp.append(k, String(val)));
        } else if (typeof v === 'string' && v.includes(',')) {
          // If it's a comma-separated string, also split and append separately for Spring compatibility
          v.split(',').forEach(val => sp.append(k, val.trim()));
        } else {
          sp.set(k, String(v));
        }
      }
    }
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.message || `API ${res.status}`);
    }
    return body;
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || `API ${res.status}`);
    }
    // If it's OK but not JSON, we might have a problem depending on the expected return type
    try {
       return JSON.parse(text);
    } catch {
       throw new Error(`Expected JSON but received: ${text.substring(0, 50)}...`);
    }
  }
}

/* ── Response shapes ────────────────────────────────────────────── */

export interface ApiRes<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

/* ── Revalidation constants (seconds) ───────────────────────────── */

const CACHE_SHORT = 30;   // product listings
const CACHE_MED   = 120;  // featured / trending
const CACHE_LONG  = 300;  // categories, brands, sliders

/* ── Typed endpoint helpers ─────────────────────────────────────── */

import type { Product, ProductDetail, Category, Brand, Slider } from '@/types';

// Products — paginated with filters
export const getProducts = (
  page = 0, 
  size = 20, 
  sort = 'createdAt,desc',
  filters: { 
    categoryIds?: string; 
    brandIds?: string; 
    minPrice?: string; 
    maxPrice?: string;
    keyword?: string;
  } = {}
) =>
  apiFetch<ApiRes<Page<Product>>>('/public/products', {
    params: { 
      page, size, sort, 
      categoryIds: filters.categoryIds,
      brandIds: filters.brandIds,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      keyword: filters.keyword
    },
    next: { revalidate: CACHE_SHORT },
  });

// Product detail by slug
export const getProductBySlug = (slug: string) =>
  apiFetch<ApiRes<ProductDetail>>(`/public/products/${slug}`, {
    next: { revalidate: CACHE_SHORT },
  });

// Search products
export const searchProducts = (keyword: string, page = 0, size = 20) =>
  apiFetch<ApiRes<Page<Product>>>('/public/products/search', {
    params: { keyword, page, size },
    next: { revalidate: CACHE_SHORT },
  });

// Products by category ID
export const getProductsByCategory = (categoryId: string, page = 0, size = 20, sort = 'createdAt,desc') =>
  apiFetch<ApiRes<Page<Product>>>(`/public/products/category/${categoryId}`, {
    params: { page, size, sort },
    next: { revalidate: CACHE_SHORT },
  });

// Products by brand ID
export const getProductsByBrand = (brandId: string, page = 0, size = 20, sort = 'createdAt,desc') =>
  apiFetch<ApiRes<Page<Product>>>(`/public/products/brand/${brandId}`, {
    params: { page, size, sort },
    next: { revalidate: CACHE_SHORT },
  });

// Curated lists (no pagination — returns List)
export const getFeaturedProducts = () =>
  apiFetch<ApiRes<Product[]>>('/public/products/featured', { next: { revalidate: CACHE_MED } });

export const getTrendingProducts = () =>
  apiFetch<ApiRes<Product[]>>('/public/products/trending', { next: { revalidate: CACHE_MED } });

export const getFlashSaleProducts = () =>
  apiFetch<ApiRes<Product[]>>('/public/products/flash-sale', { next: { revalidate: CACHE_MED } });

// Categories
export const getCategories = () =>
  apiFetch<ApiRes<Category[]>>('/public/categories', { next: { revalidate: CACHE_LONG } });

export const getCategoryBySlug = (slug: string) =>
  apiFetch<ApiRes<Category>>(`/public/categories/${slug}`, { next: { revalidate: CACHE_LONG } });

// Brands
export const getBrands = () =>
  apiFetch<ApiRes<Brand[]>>('/public/brands', { next: { revalidate: CACHE_LONG } });

// Sliders
export const getSliders = () =>
  apiFetch<ApiRes<Slider[]>>('/public/sliders', { next: { revalidate: CACHE_LONG } });

// Reviews
import type { Review } from '@/types';

export const getProductReviews = (productId: string, page = 0, size = 10) =>
  apiFetch<ApiRes<Page<Review>>>(`/public/products/${productId}/reviews`, {
    params: { page, size },
    next: { revalidate: CACHE_SHORT },
  });
