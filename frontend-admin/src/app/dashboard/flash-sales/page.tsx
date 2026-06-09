'use client';

import { Zap, Plus, Search, Eye, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, Product } from '@/types';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function FlashSalesPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['flash-sale-products'],
    queryFn: () => api.get<ApiResponse<Product[]>>('/public/products/flash-sale').then(r => r.data),
  });

  const products: Product[] = Array.isArray(data?.data) ? data.data : [];
  const filteredProducts = products.filter(p => p.nameEn.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap size={22} style={{ color: 'var(--accent)' }} /> Active Flash Sales
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Currently active flash sale products
          </p>
        </div>
        <Link href="/dashboard/products" className="btn-primary">
          <Plus size={16} /> Add Product to Flash Sale
        </Link>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search active flash sales..." className="input pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 h-48 animate-pulse bg-[var(--bg-hover)]" />
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full card p-12 flex flex-col items-center justify-center text-center border-dashed">
            <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
              <Zap size={32} className="text-orange-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Active Flash Sales</h3>
            <p className="text-sm max-w-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Enable "Flash Sale Active" on any product to see it here.
            </p>
            <Link href="/dashboard/products" className="btn-primary">
              <Plus size={16} /> Manage Products
            </Link>
          </div>
        ) : (
          filteredProducts.map(p => (
            <div key={p.id} className="card p-4 card-hover flex flex-col">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-[var(--bg-hover)] flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {p.mainImageUrl ? (
                    <img src={p.mainImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Zap size={24} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{p.nameEn}</p>
                  <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>{p.sku}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold text-sm">{formatCurrency(p.discountPrice || p.mainPrice)}</span>
                    {p.discountPrice && p.discountPrice < p.mainPrice && (
                      <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{formatCurrency(p.mainPrice)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <span className={`badge ${p.stockQuantity > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}
                </span>
                <Link href={`/dashboard/products/${p.id}`} className="btn-secondary text-xs px-3 py-1.5 h-auto">
                  <Eye size={14} /> View
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
