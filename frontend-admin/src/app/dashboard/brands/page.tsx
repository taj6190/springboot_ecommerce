'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { brandApi } from '@/services/brandService';
import { uploadApi } from '@/services/uploadService';
import { Tag, Plus, Trash2, Edit, X, Loader2, Save, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import type { Brand } from '@/types';

const schema = z.object({
  nameEn: z.string().min(2, 'Name required'),
  nameBn: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  active: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function BrandsPage() {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [page, setPage] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({ 
    queryKey: ['brands', page], 
    queryFn: () => brandApi.getAll({ page, size: 20 }) 
  });
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { active: true },
  });
  const logoUrl = watch('logoUrl');

  const createMut = useMutation({
    mutationFn: (d: FormData) => brandApi.create(d),
    onSuccess: () => { toast.success('Brand created'); qc.invalidateQueries({ queryKey: ['brands'] }); closeForm(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });
  const updateMut = useMutation({
    mutationFn: (d: FormData) => brandApi.update(editId!, d),
    onSuccess: () => { toast.success('Brand updated'); qc.invalidateQueries({ queryKey: ['brands'] }); closeForm(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => brandApi.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['brands'] }); },
    onError: () => toast.error('Failed'),
  });

  const closeForm = () => { setShowForm(false); setEditId(null); setPreviewUrl(''); reset({ nameEn: '', nameBn: '', description: '', logoUrl: '', active: true }); };
  const startEdit = (b: Brand) => {
    setEditId(b.id); setShowForm(true); setPreviewUrl(b.logoUrl || '');
    reset({ nameEn: b.nameEn, nameBn: b.nameBn ?? '', description: b.description ?? '', logoUrl: b.logoUrl ?? '', active: b.active });
  };
  const onSubmit = (d: FormData) => { if (editId) updateMut.mutate(d); else createMut.mutate(d); };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadApi.upload(file, 'brands');
      setValue('logoUrl', url); setPreviewUrl(url);
      toast.success('Logo uploaded');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelected(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selected.size} brands?`)) return;
    setIsDeletingBulk(true);
    try {
      await brandApi.deleteBulk(Array.from(selected));
      toast.success(`${selected.size} brands deleted`);
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ['brands'] });
    } catch (e) {
      toast.error('Failed to delete brands');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const brands: Brand[] = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const totalEl = data?.data?.totalElements ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag size={22} style={{ color: 'var(--accent)' }} /> Brands
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{totalEl} brands</p>
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
          <button onClick={() => { closeForm(); setShowForm(true); }} className="btn-primary"><Plus size={16} /> Add Brand</button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>{editId ? 'Edit Brand' : 'New Brand'}</h3>
            <button onClick={closeForm} className="p-1 rounded hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Brand Name (EN) *</label>
                <input {...register('nameEn')} className="input" placeholder="Samsung" />
                {errors.nameEn && <p className="text-xs text-red-400 mt-1">{errors.nameEn.message}</p>}
              </div>
              <div>
                <label className="label">Brand Name (BN)</label>
                <input {...register('nameBn')} className="input" placeholder="স্যামসাং" />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea {...register('description')} className="input" rows={2} placeholder="Brand description..." />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="label">Brand Logo / Icon</label>
              <div className="flex items-center gap-4">
                {(previewUrl || logoUrl) && (
                  <img src={previewUrl || logoUrl || ''} alt="" className="w-14 h-14 rounded-lg object-contain bg-white p-1" />
                )}
                <div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="btn-secondary text-xs">
                    {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> Upload Logo</>}
                  </button>
                  <input {...register('logoUrl')} className="input mt-2 text-xs" placeholder="Or paste logo URL" />
                </div>
              </div>
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

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(n => <div key={n} className="card h-28 animate-pulse" />)}</div>
      ) : brands.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: 'var(--text-muted)' }}>No brands yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map(b => (
            <div key={b.id} className={`card card-hover p-4 flex flex-col items-center text-center group relative ${selected.has(b.id) ? 'ring-2 ring-[var(--accent)]' : ''}`}>
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-primary)] accent-indigo-500 cursor-pointer"
                  checked={selected.has(b.id)}
                  onChange={() => toggleSelect(b.id)}
                />
              </div>
              {b.logoUrl ? (
                <img src={b.logoUrl} alt={b.nameEn} className="w-14 h-14 rounded-lg object-contain bg-white p-1.5 mb-3" />
              ) : (
                <div className="w-14 h-14 rounded-lg flex items-center justify-center text-lg font-bold mb-3"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  {b.nameEn.charAt(0)}
                </div>
              )}
              <p className="font-semibold text-white text-sm">{b.nameEn}</p>
              {b.nameBn && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.nameBn}</p>}
              <span className={`badge text-[10px] mt-2 ${b.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {b.active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(b)} className="p-1.5 rounded hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-muted)' }}><Edit size={13} /></button>
                <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(b.id); }}
                  className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between card p-3 mt-4">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-secondary text-xs px-3"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn-secondary text-xs px-3"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
