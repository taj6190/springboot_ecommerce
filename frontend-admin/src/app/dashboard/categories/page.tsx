'use client';

import { categoryApi } from '@/services/categoryService';
import { uploadApi } from '@/services/uploadService';
import type { Category } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Edit, Layers, Loader2, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

const schema = z.object({
    nameEn: z.string().min(2, 'Name is required'),
    nameBn: z.string().optional(),
    descriptionEn: z.string().optional(),
    imageUrl: z.string().optional(),
    parentId: z.string().optional(),
    displayOrder: z.coerce.number().optional(),
    active: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

// Recursive tree node component
function CategoryNode({ cat, depth, onEdit, onDelete, expanded, toggleExpand, selected, toggleSelect }: {
    cat: Category; depth: number; onEdit: (c: Category) => void;
    onDelete: (id: string) => void; expanded: Set<string>; toggleExpand: (id: string) => void;
    selected: Set<string>; toggleSelect: (id: string) => void;
}) {
    const hasChildren = cat.children && cat.children.length > 0;
    const isOpen = expanded.has(cat.id);

    return (
        <div>
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors group"
                style={{ paddingLeft: `${16 + depth * 28}px` }}>
                {hasChildren ? (
                    <button onClick={() => toggleExpand(cat.id)} className="p-0.5 rounded" style={{ color: 'var(--text-muted)' }}>
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                ) : (
                    <span className="w-[18px]" />
                )}
                <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-[var(--border)] bg-[var(--bg-primary)] accent-indigo-500 cursor-pointer"
                    checked={selected.has(cat.id)}
                    onChange={() => toggleSelect(cat.id)}
                />
                {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt="" className="w-7 h-7 rounded-md object-cover flex-shrink-0" />
                ) : (
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                        {cat.nameEn.charAt(0)}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{cat.nameEn}</p>
                    <div className="flex items-center gap-2">
                        {cat.nameBn && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{cat.nameBn}</span>}
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>L{cat.level}</span>
                    </div>
                </div>
                <span className={`badge text-[10px] ${cat.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {cat.active ? 'Active' : 'Off'}
                </span>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(cat)} className="p-1.5 rounded hover:bg-[var(--bg-card)]" style={{ color: 'var(--text-muted)' }}><Edit size={13} /></button>
                    <button onClick={() => { if (confirm(`Delete "${cat.nameEn}"?`)) onDelete(cat.id); }}
                        className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 size={13} /></button>
                </div>
            </div>
            {hasChildren && isOpen && (
                <div className="animate-fade-in">
                    {cat.children!.map(child => (
                        <CategoryNode key={child.id} cat={child} depth={depth + 1}
                            onEdit={onEdit} onDelete={onDelete} expanded={expanded} toggleExpand={toggleExpand}
                            selected={selected} toggleSelect={toggleSelect} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Flatten categories for parent selector dropdown
function flattenCategories(cats: Category[], depth = 0): { id: string; nameEn: string; depth: number }[] {
    const result: { id: string; nameEn: string; depth: number }[] = [];
    cats.forEach(c => {
        result.push({ id: c.id, nameEn: c.nameEn, depth });
        if (c.children?.length) result.push(...flattenCategories(c.children, depth + 1));
    });
    return result;
}

export default function CategoriesPage() {
    const qc = useQueryClient();
    const [editId, setEditId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll() });
    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: { active: true, displayOrder: 0 },
    });

    const imageUrl = watch('imageUrl');

    const createMut = useMutation({
        mutationFn: (d: FormData) => categoryApi.create({ ...d, parentId: d.parentId || undefined }),
        onSuccess: () => { toast.success('Category created'); qc.invalidateQueries({ queryKey: ['categories'] }); closeForm(); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
    });
    const updateMut = useMutation({
        mutationFn: (d: FormData) => categoryApi.update(editId!, { ...d, parentId: d.parentId || undefined }),
        onSuccess: () => { toast.success('Category updated'); qc.invalidateQueries({ queryKey: ['categories'] }); closeForm(); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
    });
    const deleteMut = useMutation({
        mutationFn: (id: string) => categoryApi.delete(id),
        onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['categories'] }); },
        onError: () => toast.error('Failed'),
    });

    const closeForm = () => { setShowForm(false); setEditId(null); setPreviewUrl(''); reset({ nameEn: '', nameBn: '', descriptionEn: '', imageUrl: '', parentId: '', displayOrder: 0, active: true }); };
    const startEdit = (cat: Category) => {
        setEditId(cat.id); setShowForm(true); setPreviewUrl(cat.imageUrl || '');
        reset({ nameEn: cat.nameEn, nameBn: cat.nameBn ?? '', descriptionEn: cat.descriptionEn ?? '', imageUrl: cat.imageUrl ?? '', parentId: cat.parentId ?? '', displayOrder: cat.displayOrder, active: cat.active });
    };
    const onSubmit = (d: any) => { if (editId) updateMut.mutate(d); else createMut.mutate(d); };

    const toggleExpand = (id: string) => {
        setExpanded(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    };
    const expandAll = () => {
        const ids = new Set<string>();
        const collect = (cats: Category[]) => cats.forEach(c => { ids.add(c.id); if (c.children?.length) collect(c.children); });
        collect(categories); setExpanded(ids);
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelected(newSelected);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selected.size} categories?`)) return;
        setIsDeletingBulk(true);
        try {
            await categoryApi.deleteBulk(Array.from(selected));
            toast.success(`${selected.size} categories deleted`);
            setSelected(new Set());
            qc.invalidateQueries({ queryKey: ['categories'] });
        } catch (e) {
            toast.error('Failed to delete categories');
        } finally {
            setIsDeletingBulk(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadApi.upload(file, 'categories');
            setValue('imageUrl', url); setPreviewUrl(url);
            toast.success('Image uploaded');
        } catch { toast.error('Upload failed'); }
        setUploading(false);
    };

    const categories: Category[] = data?.data ?? [];
    const flatCats = flattenCategories(categories);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Layers size={22} style={{ color: 'var(--accent)' }} /> Category Hierarchy
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {flatCats.length} categories • Supports unlimited nesting
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
                            Delete ({selected.size})
                        </button>
                    )}
                    <button onClick={expandAll} className="btn-secondary text-xs">Expand All</button>
                    <button onClick={() => setExpanded(new Set())} className="btn-secondary text-xs">Collapse</button>
                    <button onClick={() => { closeForm(); setShowForm(true); }} className="btn-primary"><Plus size={16} /> Add Category</button>
                </div>
            </div>

            {/* ─── Form ──────────────────────────────────── */}
            {showForm && (
                <div className="card p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>{editId ? 'Edit Category' : 'New Category'}</h3>
                        <button onClick={closeForm} className="p-1 rounded hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Name (EN) *</label>
                                <input {...register('nameEn')} className="input" placeholder="Electronics" />
                                {errors.nameEn && <p className="text-xs text-red-400 mt-1">{errors.nameEn.message}</p>}
                            </div>
                            <div>
                                <label className="label">Name (BN)</label>
                                <input {...register('nameBn')} className="input" placeholder="ইলেকট্রনিক্স" />
                            </div>
                            <div>
                                <label className="label">Parent Category</label>
                                <select {...register('parentId')} className="input">
                                    <option value="">— Root (Top Level) —</option>
                                    {flatCats.filter(c => c.id !== editId).map(c => (
                                        <option key={c.id} value={c.id}>{'—'.repeat(c.depth)} {c.nameEn}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Display Order</label>
                                <input {...register('displayOrder')} type="number" className="input" />
                            </div>
                        </div>
                        <div>
                            <label className="label">Description</label>
                            <textarea {...register('descriptionEn')} className="input" rows={2} placeholder="Category description..." />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="label">Category Image</label>
                            <div className="flex items-center gap-4">
                                {(previewUrl || imageUrl) && (
                                    <img src={previewUrl || imageUrl || ''} alt="" className="w-16 h-16 rounded-lg object-cover" style={{ border: '1px solid var(--border)' }} />
                                )}
                                <div>
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                                        className="btn-secondary text-xs">
                                        {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> Upload Image</>}
                                    </button>
                                    <input {...register('imageUrl')} className="input mt-2 text-xs" placeholder="Or paste image URL" />
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

            {/* ─── Tree View ─────────────────────────────── */}
            <div className="card p-2">
                {isLoading ? (
                    <div className="p-6 space-y-3">{[1, 2, 3, 4].map(n => <div key={n} className="h-10 rounded bg-[var(--bg-hover)] animate-pulse" />)}</div>
                ) : categories.length === 0 ? (
                    <div className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>No categories yet. Create your first root category!</div>
                ) : (
                    categories.map(cat => (
                        <CategoryNode key={cat.id} cat={cat} depth={0}
                            onEdit={startEdit} onDelete={(id) => deleteMut.mutate(id)}
                            expanded={expanded} toggleExpand={toggleExpand}
                            selected={selected} toggleSelect={toggleSelect} />
                    ))
                )}
            </div>

            <div className="text-xs p-2" style={{ color: 'var(--text-muted)' }}>
                💡 Tip: Select a "Parent Category" when creating to nest it as a subcategory. L0 = root, L1 = subcategory, L2 = sub-subcategory.
            </div>
        </div>
    );
}
