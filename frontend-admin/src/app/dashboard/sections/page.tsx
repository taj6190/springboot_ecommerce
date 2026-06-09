'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cmsApi } from '@/services/cmsService';
import { PanelTop, Plus, GripVertical, Edit, Trash2, X, Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { HomepageSection } from '@/types';

const SECTION_TYPES = [
  'FEATURED_PRODUCTS', 'TRENDING_PRODUCTS', 'BEST_SELLERS',
  'NEW_ARRIVALS', 'BRAND_CAROUSEL', 'CATEGORY_GRID',
  'PROMO_BANNER', 'FLASH_SALE', 'CUSTOM',
];

const schema = z.object({
  sectionType: z.string().min(1, 'Type required'),
  titleEn: z.string().min(2, 'Title required'),
  titleBn: z.string().optional(),
  displayOrder: z.coerce.number().optional(),
  config: z.string().optional(),
  active: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function SectionsPage() {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['sections'], queryFn: cmsApi.getSections });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { active: true, displayOrder: 0, sectionType: 'FEATURED_PRODUCTS' },
  });

  const createMut = useMutation({
    mutationFn: (d: FormData) => cmsApi.createSection(d),
    onSuccess: () => { toast.success('Section created'); qc.invalidateQueries({ queryKey: ['sections'] }); closeForm(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });
  const updateMut = useMutation({
    mutationFn: (d: FormData) => cmsApi.updateSection(editId!, d),
    onSuccess: () => { toast.success('Section updated'); qc.invalidateQueries({ queryKey: ['sections'] }); closeForm(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => cmsApi.deleteSection(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['sections'] }); },
    onError: () => toast.error('Failed'),
  });

  const closeForm = () => { setShowForm(false); setEditId(null); reset({ sectionType: 'FEATURED_PRODUCTS', titleEn: '', titleBn: '', displayOrder: 0, config: '', active: true }); };
  const startEdit = (s: HomepageSection) => {
    setEditId(s.id); setShowForm(true);
    reset({ sectionType: s.sectionType, titleEn: s.titleEn ?? '', titleBn: s.titleBn ?? '', displayOrder: s.displayOrder, config: s.config ?? '', active: s.active });
  };
  const onSubmit = (d: any) => { if (editId) updateMut.mutate(d); else createMut.mutate(d); };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelected(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selected.size} sections?`)) return;
    setIsDeletingBulk(true);
    try {
      await cmsApi.deleteSectionsBulk(Array.from(selected));
      toast.success(`${selected.size} sections deleted`);
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ['sections'] });
    } catch (e) {
      toast.error('Failed to delete sections');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const sections: HomepageSection[] = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="space-y-6 animate-fade-in" style={{ maxWidth: 900 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <PanelTop size={22} style={{ color: 'var(--color-accent)' }} /> Homepage Sections
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{sections.length} sections</p>
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
          <button onClick={() => { closeForm(); setShowForm(true); }} className="btn-primary"><Plus size={16} /> Add Section</button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>{editId ? 'Edit Section' : 'New Section'}</h3>
            <button onClick={closeForm} className="p-1 rounded hover:bg-[var(--color-bg-hover)]" style={{ color: 'var(--color-text-muted)' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Section Type *</label>
                <select {...register('sectionType')} className="input">
                  {SECTION_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Display Order</label>
                <input {...register('displayOrder')} type="number" className="input" />
              </div>
              <div>
                <label className="label">Title (EN) *</label>
                <input {...register('titleEn')} className="input" placeholder="Featured Products" />
                {errors.titleEn && <p className="text-xs text-red-400 mt-1">{errors.titleEn.message}</p>}
              </div>
              <div>
                <label className="label">Title (BN)</label>
                <input {...register('titleBn')} className="input" placeholder="ফিচার্ড পণ্য" />
              </div>
            </div>
            <div>
              <label className="label">Config (JSON)</label>
              <textarea {...register('config')} className="input font-mono text-xs" rows={3} placeholder='{"limit": 8, "category": "electronics"}' />
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
        <div className="space-y-2">{[1,2,3].map(n => <div key={n} className="card p-5 h-16 animate-pulse" />)}</div>
      ) : sections.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>No sections yet. Add your first homepage section.</div>
      ) : (
        <div className="card p-3 space-y-2">
          {sections.map(s => (
            <div key={s.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${selected.has(s.id) ? 'bg-[var(--bg-hover)] ring-1 ring-[var(--accent)]' : 'hover:bg-[var(--bg-hover)]'}`}>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-primary)] accent-indigo-500 cursor-pointer"
                  checked={selected.has(s.id)}
                  onChange={() => toggleSelect(s.id)}
                />
                <GripVertical size={18} style={{ color: 'var(--color-text-muted)' }} />
                <div>
                  <p className="font-semibold text-white text-sm">{s.titleEn || s.sectionType}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.sectionType.replace(/_/g, ' ')} • Order: {s.displayOrder}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${s.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {s.active ? 'Visible' : 'Hidden'}
                </span>
                <button onClick={() => startEdit(s)} className="p-1.5 rounded hover:bg-[var(--color-bg-card)]" style={{ color: 'var(--color-text-muted)' }}><Edit size={14} /></button>
                <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(s.id); }} className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
