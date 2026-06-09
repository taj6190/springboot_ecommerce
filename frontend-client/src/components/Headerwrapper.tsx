// app/components/HeaderWrapper.tsx  ← Server Component (no 'use client')
import type { Category } from '@/types';
import Header from './Header';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/public/categories`, {
      next: { revalidate: 300 }, // ISR: re-fetch at most every 5 min
    });
    const data = await res.json();
    return data?.data?.slice(0, 12) ?? [];
  } catch {
    return [];
  }
}

export default async function HeaderWrapper() {
  const categories = await getCategories();
  // Categories are fetched on the server — Header renders with data already present.
  // No client-side fetch, no loading flash.
  return <Header categories={categories} />;
}
