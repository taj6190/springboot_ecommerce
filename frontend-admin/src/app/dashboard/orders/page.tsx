'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/services/orderService';
import { formatCurrency, getStatusColor, formatDateTime } from '@/lib/utils';
import { ShoppingCart, Eye, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Order, OrderStatus } from '@/types';

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

export default function OrdersPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, statusFilter],
    queryFn: () => orderApi.getAll({ page, size: 15, status: (statusFilter || undefined) as any }),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => orderApi.updateStatus(id, status),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['orders'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const orders: Order[] = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const totalEl = data?.data?.totalElements ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart size={22} style={{ color: 'var(--accent)' }} /> Orders
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{totalEl} orders total</p>
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="input" style={{ width: 'auto', minWidth: 160 }}>
          <option value="">All Status</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                  <td key={j}><div className="h-4 w-20 rounded bg-[var(--bg-hover)] animate-pulse" /></td>
                ))}</tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <>
                  <tr key={o.id}>
                    <td className="font-mono text-sm font-semibold text-white">{o.orderNumber}</td>
                    <td>
                      <div>
                        <p className="text-sm text-white">{o.shippingName || o.customerName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.shippingPhone}</p>
                      </div>
                    </td>
                    <td className="font-medium text-white">{formatCurrency(o.totalAmount)}</td>
                    <td>
                      <div className="relative inline-block">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatusMut.mutate({ id: o.id, status: e.target.value as OrderStatus })}
                          className={`badge cursor-pointer appearance-none pr-6 ${getStatusColor(o.status)}`}
                          style={{ background: 'transparent', border: 'none', fontSize: '12px', fontWeight: 500 }}
                        >
                          {ALL_STATUSES.map(s => <option key={s} value={s} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>{s}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </td>
                    <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatDateTime(o.createdAt)}</td>
                    <td>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                          style={{ color: 'var(--text-muted)' }} title="View Details">
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedOrder === o.id && (
                    <tr key={`${o.id}-details`}>
                      <td colSpan={6} className="!p-0">
                        <div className="p-5 m-2 rounded-lg animate-fade-in" style={{ background: 'var(--bg-hover)' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Shipping Info</p>
                              <p className="text-sm text-white">{o.shippingName}</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.shippingPhone}</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.shippingAddress}</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.shippingCity}, {o.shippingDistrict}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Order Summary</p>
                              <p className="text-sm">Subtotal: <span className="text-white">{formatCurrency(o.totalAmount)}</span></p>
                              <p className="text-sm">Discount: <span className="text-green-400">-{formatCurrency(o.discountAmount || 0)}</span></p>
                              <p className="text-sm">Shipping: <span className="text-white">{formatCurrency(o.shippingAmount || 0)}</span></p>
                            </div>
                          </div>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Items ({o.items?.length ?? 0})</p>
                          <div className="space-y-2">
                            {(o.items ?? []).map(item => (
                              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
                                <div>
                                  <p className="text-sm text-white">{item.productName}</p>
                                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{item.sku}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-white">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                                  <p className="text-xs font-medium text-white">{formatCurrency(item.totalPrice)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs px-3 py-1.5">Previous</button>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Page {page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs px-3 py-1.5">Next</button>
        </div>
      )}
    </div>
  );
}
