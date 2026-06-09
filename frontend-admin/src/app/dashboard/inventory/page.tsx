'use client';

import { Warehouse, Search, AlertTriangle, ArrowDownUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/services/productService';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

function InventoryRow({ product }: { product: Product }) {
  const qc = useQueryClient();
  const [stock, setStock] = useState(product.stockQuantity);
  
  // Sync local state when server data changes (e.g. after update or external change)
  useEffect(() => {
    setStock(product.stockQuantity);
  }, [product.stockQuantity]);

  const updateMut = useMutation({
    mutationFn: () => productApi.updateStock(product.id, stock, 'SET'),
    onSuccess: () => {
      toast.success('Stock updated');
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: () => toast.error('Failed to update stock'),
  });

  return (
    <tr>
      <td className="font-mono text-sm">{product.sku}</td>
      <td>
        <p className="text-sm font-medium text-white truncate max-w-[250px]">{product.nameEn}</p>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${product.stockQuantity <= (product.lowStockThreshold || 5) ? 'text-red-400' : 'text-white'}`}>
            {product.stockQuantity}
          </span>
          {product.stockQuantity <= (product.lowStockThreshold || 5) && (
            <span title="Low Stock"><AlertTriangle size={14} className="text-red-400" /></span>
          )}
        </div>
      </td>
      <td>
        <span className={`badge ${product.stockQuantity > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
        </span>
      </td>
      <td>
        <div className="flex items-center justify-end gap-2">
          <input 
            type="number" 
            value={stock} 
            onChange={e => setStock(parseInt(e.target.value) || 0)} 
            className="input h-8 w-24 px-2 py-1 text-sm text-right" 
          />
          <button 
            onClick={() => updateMut.mutate()} 
            disabled={updateMut.isPending || stock === product.stockQuantity}
            className="btn-secondary p-1.5 px-2 h-8 disabled:opacity-50" 
            title="Update Stock"
          >
            <ArrowDownUp size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', search],
    queryFn: () => productApi.getAll({ page: 0, size: 50, keyword: search || undefined }),
  });

  const products: Product[] = data?.data?.content ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Warehouse size={22} style={{ color: 'var(--accent)' }} /> Inventory Management
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Quickly adjust stock levels and monitor low inventory
          </p>
        </div>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by SKU or product name..." className="input pl-9" />
        </div>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th className="text-right">Quick Update</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={5}><div className="h-4 w-full bg-[var(--bg-hover)] animate-pulse rounded" /></td></tr>
            )) : products.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No products found.</td></tr>
            ) : products.map(p => (
              <InventoryRow key={p.id} product={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
