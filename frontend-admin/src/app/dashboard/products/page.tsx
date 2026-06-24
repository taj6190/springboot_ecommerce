'use client';

import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { productApi } from '@/services/productService';
import type { Product } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Loader2, Package, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProductsPage() {
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('PUBLISHED');
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['products', page, statusFilter, search],
        queryFn: () =>
            productApi.getAll({
                page,
                size: 15,
                status: statusFilter || undefined,
                keyword: search || undefined,
            }),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => productApi.delete(id),
        onSuccess: () => {
            toast.success('Product deleted');
            qc.invalidateQueries({ queryKey: ['products'] });
        },
        onError: () => toast.error('Failed to delete'),
    });

    const products = data?.data?.content ?? [];
    const totalPages = data?.data?.totalPages ?? 0;
    const totalEl = data?.data?.totalElements ?? 0;

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelected(newSelected);
    };

    const toggleSelectAll = () => {
        if (selected.size === products.length && products.length > 0) {
            setSelected(new Set());
        } else {
            setSelected(new Set(products.map(p => p.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selected.size} products?`)) return;
        setIsDeletingBulk(true);
        try {
            await productApi.deleteBulk(Array.from(selected));
            toast.success(`${selected.size} products processed (deleted or archived)`);
            setSelected(new Set());
            qc.invalidateQueries({ queryKey: ['products'] });
        } catch (e) {
            toast.error('Failed to delete products');
        } finally {
            setIsDeletingBulk(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Package size={22} style={{ color: 'var(--accent)' }} /> Products
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {totalEl} products total
                    </p>
                </div>
                <div className="flex gap-2">
                    {selected.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isDeletingBulk}
                            className="btn-secondary text-red-400 border-red-500/30 hover:bg-red-500/10"
                        >
                            {isDeletingBulk ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Delete Selected ({selected.size})
                        </button>
                    )}
                    <Link href="/dashboard/products/new" className="btn-primary">
                        <Plus size={16} /> Add Product
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }} />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        placeholder="Search products..."
                        className="input pl-9"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                    className="input"
                    style={{ width: 'auto', minWidth: 160 }}
                >
                    <option value="">All Status</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
            </div>

            {/* Table */}
            <div className="card table-container">
                <table>
                    <thead>
                        <tr>
                            <th className="w-10">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-primary)] accent-indigo-500"
                                    checked={products.length > 0 && selected.size === products.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <td key={j}>
                                            <div className="h-4 w-20 rounded bg-[var(--bg-hover)] animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((p: Product) => (
                                <tr key={p.id} className={selected.has(p.id) ? 'bg-[var(--bg-hover)]' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-primary)] accent-indigo-500"
                                            checked={selected.has(p.id)}
                                            onChange={() => toggleSelect(p.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ background: 'var(--bg-hover)' }}
                                            >
                                                {p.mainImageUrl ? (
                                                    <img src={p.mainImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <Package size={16} style={{ color: 'var(--text-muted)' }} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white text-sm truncate max-w-[200px]">{p.nameEn}</p>
                                                {p.brandName && (
                                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.brandName}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-mono text-xs">{p.sku}</td>
                                    <td>
                                        <div>
                                            <span className="text-white font-medium">{formatCurrency(p.mainPrice)}</span>
                                            {p.discountPrice && (
                                                <span className="text-xs ml-1 text-green-400">
                                                    {formatCurrency(p.discountPrice)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={p.stockQuantity <= (p.lowStockThreshold || 5) ? 'text-red-400 font-medium' : ''}>
                                            {p.stockQuantity}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusColor(p.status)}`}>{p.status}</span>
                                    </td>
                                    <td className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        {formatDate(p.createdAt)}
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={`/dashboard/products/${p.id}`}
                                                className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                                                style={{ color: 'var(--text-muted)' }}
                                                title="Edit"
                                            >
                                                <Edit size={15} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this product?')) deleteMut.mutate(p.id);
                                                }}
                                                className="p-2 rounded-lg transition-colors hover:bg-red-500/10 text-red-400"
                                                title="Delete"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage((p) => p - 1)}
                        className="btn-secondary text-xs px-3 py-1.5"
                    >
                        Previous
                    </button>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                        className="btn-secondary text-xs px-3 py-1.5"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
