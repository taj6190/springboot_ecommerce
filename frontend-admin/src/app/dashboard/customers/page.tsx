'use client';

import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { ApiResponse, Page, User } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import { useState } from 'react';

export default function CustomersPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);

    const { data, isLoading } = useQuery({
        queryKey: ['customers', page, search],
        queryFn: () =>
            api.get<ApiResponse<Page<User>>>('/admin/users', {
                params: { page, size: 20, keyword: search || undefined },
            }).then(r => r.data),
    });

    const users: User[] = data?.data?.content ?? [];
    const totalPages = data?.data?.totalPages ?? 0;
    const totalEl = data?.data?.totalElements ?? 0;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users size={22} style={{ color: 'var(--accent)' }} /> Customers
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{totalEl} registered users</p>
            </div>

            <div className="card p-4">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                        placeholder="Search by name or email..." className="input pl-9" />
                </div>
            </div>

            <div className="card table-container">
                <table>
                    <thead>
                        <tr><th>Customer</th><th>Phone</th><th>Roles</th><th>Status</th><th>Joined</th></tr>
                    </thead>
                    <tbody>
                        {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                                <td key={j}><div className="h-4 w-20 rounded bg-[var(--bg-hover)] animate-pulse" /></td>
                            ))}</tr>
                        )) : users.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No customers found.</td></tr>
                        ) : users.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                            {u.fullName?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{u.fullName}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{u.phone || '-'}</td>
                                <td>
                                    <div className="flex flex-wrap gap-1">
                                        {(u.roles ?? []).map(r => (
                                            <span key={r} className="badge bg-indigo-500/20 text-indigo-400 text-xs">{r.replace('ROLE_', '')}</span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${u.enabled && !u.locked ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {u.locked ? 'Locked' : u.enabled ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                            </tr>
                        ))}
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
