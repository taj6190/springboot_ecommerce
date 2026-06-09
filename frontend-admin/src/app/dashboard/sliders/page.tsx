'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cmsApi } from '@/services/cmsService';
import { Image as ImageIcon, Plus, Trash2, Edit, X, Loader2, Save, GripVertical } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Slider } from '@/types';

const schema = z.object({
  titleEn: z.string().min(2, 'Title is required'),
  titleBn: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL'),
  linkUrl: z.string().optional(),
  displayOrder: z.coerce.number().optional(),
  active: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function SlidersPage() {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['sliders'], queryFn: cmsApi.getSliders });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { active: true, displayOrder: 0 },
  });

  const createMut = useMutation({
    mutationFn: (d: FormData) => cmsApi.createSlider(d),
    onSuccess: () => { toast.success('Slider created'); qc.invalidateQueries({ queryKey: ['sliders'] }); closeForm(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });
  const updateMut = useMutation({
    mutationFn: (d: FormData) => cmsApi.updateSlider(editId!, d),
    onSuccess: () => { toast.success('Slider updated'); qc.invalidateQueries({ queryKey: ['sliders'] }); closeForm(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => cmsApi.deleteSlider(id),
    onSuccess: () => { toast.success('Slider deleted'); qc.invalidateQueries({ queryKey: ['sliders'] }); },
    onError: () => toast.error('Failed to delete'),
  });

  const closeForm = () => { setShowForm(false); setEditId(null); reset({ titleEn: '', titleBn: '', imageUrl: '', linkUrl: '', displayOrder: 0, active: true }); };
  const startEdit = (s: Slider) => { setEditId(s.id); setShowForm(true); reset({ titleEn: s.titleEn, titleBn: s.titleBn ?? '', imageUrl: s.imageUrl, linkUrl: s.linkUrl ?? '', displayOrder: s.displayOrder, active: s.active }); };
  const onSubmit = (d: any) => { if (editId) updateMut.mutate(d); else createMut.mutate(d); };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelected(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selected.size} sliders?`)) return;
    setIsDeletingBulk(true);
    try {
      await cmsApi.deleteSlidersBulk(Array.from(selected));
      toast.success(`${selected.size} sliders deleted`);
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ['sliders'] });
    } catch (e) {
      toast.error('Failed to delete sliders');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const sliders: Slider[] = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon size={22} style={{ color: 'var(--color-accent)' }} /> Homepage Sliders
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{sliders.length} sliders</p>
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
          <button onClick={() => { closeForm(); setShowForm(true); }} className="btn-primary"><Plus size={16} /> Add Slider</button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{editId ? 'Edit Slider' : 'New Slider'}</h3>
            <button onClick={closeForm} className="p-1 rounded hover:bg-[var(--color-bg-hover)]" style={{ color: 'var(--color-text-muted)' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Title (EN) *</label>
                <input {...register('titleEn')} className="input" placeholder="Summer Sale" />
                {errors.titleEn && <p className="text-xs text-red-400 mt-1">{errors.titleEn.message}</p>}
              </div>
              <div>
                <label className="label">Title (BN)</label>
                <input {...register('titleBn')} className="input" placeholder="গ্রীষ্মকালীন সেল" />
              </div>
              <div>
                <label className="label">Image URL *</label>
                <input {...register('imageUrl')} className="input" placeholder="https://example.com/banner.jpg" />
                {errors.imageUrl && <p className="text-xs text-red-400 mt-1">{errors.imageUrl.message}</p>}
              </div>
              <div>
                <label className="label">Link URL</label>
                <input {...register('linkUrl')} className="input" placeholder="/sale" />
              </div>
              <div>
                <label className="label">Display Order</label>
                <input {...register('displayOrder')} type="number" className="input" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2].map(n => <div key={n} className="card h-48 animate-pulse" />)}
        </div>
      ) : sliders.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>No sliders yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sliders.map(s => (
            <div key={s.id} className={`card card-hover overflow-hidden relative ${selected.has(s.id) ? 'ring-2 ring-[var(--accent)]' : ''}`}>
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-primary)] accent-indigo-500 cursor-pointer"
                  checked={selected.has(s.id)}
                  onChange={() => toggleSelect(s.id)}
                />
              </div>
              <div className="h-36 bg-cover bg-center relative" style={{ backgroundImage: `url(${s.imageUrl})`, backgroundColor: 'var(--color-bg-hover)' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="font-semibold text-white text-sm">{s.titleEn}</p>
                  {s.titleBn && <p className="text-xs text-white/70">{s.titleBn}</p>}
                </div>
                <div className="absolute top-3 right-3 flex gap-1">
                  <span className={`badge text-xs ${s.active ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                    {s.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <GripVertical size={14} />
                  Order: {s.displayOrder}
                  {s.linkUrl && <span>• {s.linkUrl}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(s)} className="p-1.5 rounded hover:bg-[var(--color-bg-hover)]" style={{ color: 'var(--color-text-muted)' }}><Edit size={14} /></button>
                  <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(s.id); }} className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
