'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import type { ApiResponse, Coupon } from '@/types';
import { Ticket, Plus, Trash2, Edit, X, Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '@/lib/utils';

const couponApi = {
  getAll: () => api.get<ApiResponse<Coupon[]>>('/admin/coupons').then(r => r.data),
  create: (d: any) => api.post<ApiResponse<Coupon>>('/admin/coupons', d).then(r => r.data),
  update: (id: string, d: any) => api.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/admin/coupons/${id}`).then(r => r.data),
  deleteBulk: (ids: string[]) => api.delete<ApiResponse<void>>('/admin/coupons/bulk', { data: ids }).then(r => r.data),
};

const schema = z.object({
  code: z.string().min(3, 'Code is required'),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  value: z.coerce.number().min(1, 'Value is required'),
  minOrderAmount: z.coerce.number().optional(),
  maxDiscount: z.coerce.number().optional(),
  usageLimit: z.coerce.number().optional(),
  active: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CouponsPage() {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['coupons'], queryFn: couponApi.getAll });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { type: 'PERCENTAGE', active: true, usageLimit: 0 },
  });

  const createMut = useMutation({
    mutationFn: (d: FormData) => couponApi.create(d),
    onSuccess: () => { toast.success('Coupon created'); qc.invalidateQueries({ queryKey: ['coupons'] }); closeForm(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });
  const updateMut = useMutation({
    mutationFn: (d: FormData) => couponApi.update(editId!, d),
    onSuccess: () => { toast.success('Coupon updated'); qc.invalidateQueries({ queryKey: ['coupons'] }); closeForm(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => couponApi.delete(id),
    onSuccess: () => { toast.success('Coupon deleted'); qc.invalidateQueries({ queryKey: ['coupons'] }); },
    onError: () => toast.error('Failed to delete'),
  });

  const closeForm = () => { setShowForm(false); setEditId(null); reset({ code: '', description: '', type: 'PERCENTAGE', value: 0, active: true }); };
  const startEdit = (c: Coupon) => {
    setEditId(c.id); setShowForm(true);
    reset({ code: c.code, description: c.description ?? '', type: c.type, value: c.value, minOrderAmount: c.minOrderAmount ?? undefined, maxDiscount: c.maxDiscount ?? undefined, usageLimit: c.usageLimit, active: c.active });
  };
  const onSubmit = (d: any) => { if (editId) updateMut.mutate(d); else createMut.mutate(d); };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selected.size === coupons.length && coupons.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(coupons.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selected.size} coupons?`)) return;
    setIsDeletingBulk(true);
    try {
      await couponApi.deleteBulk(Array.from(selected));
      toast.success(`${selected.size} coupons deleted`);
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ['coupons'] });
    } catch (e) {
      toast.error('Failed to delete coupons');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const coupons: Coupon[] = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket size={22} style={{ color: 'var(--accent)' }} /> Coupons
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{coupons.length} coupons</p>
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
          <button onClick={() => { closeForm(); setShowForm(true); }} className="btn-primary"><Plus size={16} /> Add Coupon</button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{editId ? 'Edit Coupon' : 'New Coupon'}</h3>
            <button onClick={closeForm} className="p-1 rounded hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Code *</label>
                <input {...register('code')} className="input font-mono uppercase" placeholder="SUMMER20" />
                {errors.code && <p className="text-xs text-red-400 mt-1">{errors.code.message}</p>}
              </div>
              <div>
                <label className="label">Type *</label>
                <select {...register('type')} className="input">
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>
              <div>
                <label className="label">Value *</label>
                <input {...register('value')} type="number" className="input" placeholder="20" />
                {errors.value && <p className="text-xs text-red-400 mt-1">{errors.value.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Min Order (৳)</label>
                <input {...register('minOrderAmount')} type="number" className="input" placeholder="500" />
              </div>
              <div>
                <label className="label">Max Discount (৳)</label>
                <input {...register('maxDiscount')} type="number" className="input" placeholder="200" />
              </div>
              <div>
                <label className="label">Usage Limit</label>
                <input {...register('usageLimit')} type="number" className="input" placeholder="0 = unlimited" />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <input {...register('description')} className="input" placeholder="Optional description" />
            </div>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input type="checkbox" {...register('active')} className="w-4 h-4 accent-indigo-500" /> Active
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {editId ? 'Update' : 'Create'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th className="w-10">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-primary)] accent-indigo-500 cursor-pointer"
                  checked={coupons.length > 0 && selected.size === coupons.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Code</th><th>Type</th><th>Value</th><th>Usage</th><th>Status</th><th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (<td key={j}><div className="h-4 w-16 rounded bg-[var(--bg-hover)] animate-pulse" /></td>))}</tr>
            )) : coupons.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No coupons yet.</td></tr>
            ) : coupons.map(c => (
              <tr key={c.id} className={selected.has(c.id) ? 'bg-[var(--bg-hover)]' : ''}>
                <td>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-primary)] accent-indigo-500 cursor-pointer"
                    checked={selected.has(c.id)}
                    onChange={() => toggleSelect(c.id)}
                  />
                </td>
                <td className="font-mono font-semibold text-white">{c.code}</td>
                <td><span className="badge bg-purple-500/20 text-purple-400">{c.type.replace('_', ' ')}</span></td>
                <td className="text-white font-medium">{c.type === 'PERCENTAGE' ? `${c.value}%` : formatCurrency(c.value)}</td>
                <td style={{ color: 'var(--text-muted)' }}>{c.usageCount} / {c.usageLimit || '∞'}</td>
                <td>
                  <span className={`badge ${c.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => startEdit(c)} className="p-2 rounded-lg hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-muted)' }}><Edit size={15} /></button>
                    <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(c.id); }} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
