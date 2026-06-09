'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cmsApi } from '@/services/cmsService';
import { FileText, Plus, Trash2, Edit, X, Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { StaticPage } from '@/types';

const PAGE_TYPES = ['ABOUT', 'PRIVACY', 'TERMS', 'REFUND', 'SHIPPING', 'CONTACT', 'FAQ', 'CUSTOM'];

const schema = z.object({
  slug: z.string().min(2, 'Slug required'),
  titleEn: z.string().min(2, 'Title required'),
  titleBn: z.string().optional(),
  contentEn: z.string().min(10, 'Content required'),
  contentBn: z.string().optional(),
  pageType: z.string().optional(),
  published: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function StaticPagesPage() {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['static-pages'], queryFn: cmsApi.getPages });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { published: true },
  });

  const createMut = useMutation({
    mutationFn: (d: FormData) => cmsApi.createPage(d),
    onSuccess: () => { toast.success('Page created'); qc.invalidateQueries({ queryKey: ['static-pages'] }); closeForm(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });
  const updateMut = useMutation({
    mutationFn: (d: FormData) => cmsApi.updatePage(editId!, d),
    onSuccess: () => { toast.success('Page updated'); qc.invalidateQueries({ queryKey: ['static-pages'] }); closeForm(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => cmsApi.deletePage(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['static-pages'] }); },
    onError: () => toast.error('Failed'),
  });

  const closeForm = () => { setShowForm(false); setEditId(null); reset({ slug: '', titleEn: '', titleBn: '', contentEn: '', contentBn: '', pageType: '', published: true }); };
  const startEdit = (p: StaticPage) => {
    setEditId(p.id); setShowForm(true);
    reset({ slug: p.slug, titleEn: p.titleEn, titleBn: p.titleBn ?? '', contentEn: p.contentEn, contentBn: p.contentBn ?? '', pageType: p.pageType ?? '', published: p.published });
  };
  const onSubmit = (d: FormData) => { if (editId) updateMut.mutate(d); else createMut.mutate(d); };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelected(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selected.size} pages?`)) return;
    setIsDeletingBulk(true);
    try {
      await cmsApi.deletePagesBulk(Array.from(selected));
      toast.success(`${selected.size} pages deleted`);
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ['static-pages'] });
    } catch (e) {
      toast.error('Failed to delete pages');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const pages: StaticPage[] = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText size={22} style={{ color: 'var(--color-accent)' }} /> Static Pages
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{pages.length} pages — About Us, Terms, Privacy, etc.</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
              className="btn-secondary text-red-400 border-red-500/30 hover:bg-red-500/10"
            >
              {isDeletingBulk ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Delete ({selected.size})
            </button>
          )}
          <button onClick={() => { closeForm(); setShowForm(true); }} className="btn-primary"><Plus size={16} /> New Page</button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>{editId ? 'Edit Page' : 'New Page'}</h3>
            <button onClick={closeForm} className="p-1 rounded hover:bg-[var(--color-bg-hover)]" style={{ color: 'var(--color-text-muted)' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">URL Slug *</label>
                <input {...register('slug')} className="input font-mono" placeholder="about-us" />
                {errors.slug && <p className="text-xs text-red-400 mt-1">{errors.slug.message}</p>}
              </div>
              <div>
                <label className="label">Title (EN) *</label>
                <input {...register('titleEn')} className="input" placeholder="About Us" />
                {errors.titleEn && <p className="text-xs text-red-400 mt-1">{errors.titleEn.message}</p>}
              </div>
              <div>
                <label className="label">Page Type</label>
                <select {...register('pageType')} className="input">
                  <option value="">-- Select --</option>
                  {PAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Title (BN)</label>
              <input {...register('titleBn')} className="input" placeholder="আমাদের সম্পর্কে" />
            </div>
            <div>
              <label className="label">Content (EN) *</label>
              <textarea {...register('contentEn')} className="input font-mono text-xs" rows={10} placeholder="Page content (HTML supported)..." />
              {errors.contentEn && <p className="text-xs text-red-400 mt-1">{errors.contentEn.message}</p>}
            </div>
            <div>
              <label className="label">Content (BN)</label>
              <textarea {...register('contentBn')} className="input text-sm" rows={5} placeholder="বাংলায় বিষয়বস্তু..." />
            </div>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input type="checkbox" {...register('published')} className="w-4 h-4 accent-indigo-500" /> Published
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(n => <div key={n} className="card h-24 animate-pulse" />)}</div>
      ) : pages.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>No static pages yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map(p => (
            <div key={p.id} className={`card card-hover p-5 relative ${selected.has(p.id) ? 'ring-2 ring-[var(--accent)]' : ''}`}>
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-primary)] accent-indigo-500 cursor-pointer"
                  checked={selected.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                />
              </div>
              <div className="flex items-start justify-between mb-2 ml-6">
                <div>
                  <p className="font-semibold text-white text-sm">{p.titleEn}</p>
                  <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-text-muted)' }}>/{p.slug}</p>
                </div>
                <span className={`badge text-xs ${p.published ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {p.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="ml-6">
                {p.pageType && <span className="badge text-[10px] bg-purple-500/20 text-purple-400">{p.pageType}</span>}
              </div>
              <div className="flex justify-end gap-1 mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <button onClick={() => startEdit(p)} className="p-1.5 rounded hover:bg-[var(--color-bg-hover)]" style={{ color: 'var(--color-text-muted)' }}><Edit size={14} /></button>
                <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(p.id); }} className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
