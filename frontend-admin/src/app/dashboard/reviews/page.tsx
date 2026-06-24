'use client';

import { formatDate } from '@/lib/utils';
import { cmsApi } from '@/services/cmsService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Review {
    id: string;
    productId: string;
    productName?: string;
    userName?: string;
    rating: number;
    comment?: string;
    approved: boolean;
    createdAt: string;
}

export default function ReviewsPage() {
    const qc = useQueryClient();
    const [page, setPage] = useState(0);

    const { data, isLoading } = useQuery({
        queryKey: ['reviews', page],
        queryFn: () => cmsApi.getPendingReviews(page),
    });

    const approveMut = useMutation({
        mutationFn: (id: string) => cmsApi.approveReview(id),
        onSuccess: () => { toast.success('Approved'); qc.invalidateQueries({ queryKey: ['reviews'] }); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => cmsApi.deleteReview(id),
        onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['reviews'] }); },
        onError: () => toast.error('Failed'),
    });

    const reviews: Review[] = data?.data?.content ?? [];
    const totalPages = data?.data?.totalPages ?? 0;

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={13} className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
            ))}
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Star size={22} style={{ color: 'var(--color-accent)' }} /> Pending Reviews
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Approve or reject customer product reviews</p>
            </div>

            <div className="space-y-3">
                {isLoading ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="card p-5 h-20 animate-pulse" />
                )) : reviews.length === 0 ? (
                    <div className="card p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>No pending reviews.</div>
                ) : reviews.map(r => (
                    <div key={r.id} className="card p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                        {(r.userName || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{r.userName || 'Anonymous'}</p>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            on <span className="text-indigo-400">{r.productName || 'Product'}</span> • {formatDate(r.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                {renderStars(r.rating)}
                                {r.comment && <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>{r.comment}</p>}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                                <button onClick={() => approveMut.mutate(r.id)} title="Approve"
                                    className="p-2 rounded-lg hover:bg-green-500/10 text-green-400"><Check size={16} /></button>
                                <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(r.id); }}
                                    title="Delete" className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs px-3 py-1.5">Previous</button>
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Page {page + 1} of {totalPages}</span>
                    <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs px-3 py-1.5">Next</button>
                </div>
            )}
        </div>
    );
}
