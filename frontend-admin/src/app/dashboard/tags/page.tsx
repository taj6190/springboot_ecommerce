'use client';

import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Save, Tags, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

interface Tag { id: string; name: string; slug: string; }

const tagApi = {
    getAll: () => api.get<ApiResponse<Tag[]>>('/admin/tags').then(r => r.data),
    create: (d: { name: string }) => api.post<ApiResponse<Tag>>('/admin/tags', d).then(r => r.data),
    delete: (id: string) => api.delete<ApiResponse<void>>(`/admin/tags/${id}`).then(r => r.data),
};

const schema = z.object({ name: z.string().min(2, 'Tag name is required') });
type FormData = z.infer<typeof schema>;

export default function TagsPage() {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);

    const { data, isLoading } = useQuery({ queryKey: ['tags'], queryFn: tagApi.getAll });
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const createMut = useMutation({
        mutationFn: (d: FormData) => tagApi.create(d),
        onSuccess: () => { toast.success('Tag created'); qc.invalidateQueries({ queryKey: ['tags'] }); setShowForm(false); reset(); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => tagApi.delete(id),
        onSuccess: () => { toast.success('Tag deleted'); qc.invalidateQueries({ queryKey: ['tags'] }); },
        onError: () => toast.error('Failed'),
    });

    const tags: Tag[] = Array.isArray(data?.data) ? data.data : [];

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Tags size={22} style={{ color: 'var(--accent)' }} /> Tags
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{tags.length} tags for product categorization</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16} /> Add Tag</button>
            </div>

            {showForm && (
                <div className="card p-5 animate-fade-in">
                    <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="label">Tag Name *</label>
                            <input {...register('name')} className="input" placeholder="Smartphone, Budget, Premium..." />
                            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn-primary h-[42px]">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Create</>}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary h-[42px]"><X size={16} /></button>
                    </form>
                </div>
            )}

            {isLoading ? (
                <div className="card p-6"><div className="h-20 animate-pulse rounded bg-[var(--bg-hover)]" /></div>
            ) : tags.length === 0 ? (
                <div className="card p-12 text-center" style={{ color: 'var(--text-muted)' }}>No tags yet.</div>
            ) : (
                <div className="card p-4">
                    <div className="flex flex-wrap gap-2">
                        {tags.map(t => (
                            <div key={t.id} className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                {t.name}
                                <button onClick={() => { if (confirm(`Delete tag "${t.name}"?`)) deleteMut.mutate(t.id); }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-red-500/20 text-red-400">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
