'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import type { ApiResponse, Page, User } from '@/types';
import {
  UserCog, Search, Shield, Lock, Unlock, Plus, Trash2, Edit, X, Loader2, Save,
} from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const ALL_ROLES = ['ROLE_ADMIN', 'ROLE_PRODUCT_MANAGER', 'ROLE_INVENTORY_MANAGER', 'ROLE_CONTENT_EDITOR', 'ROLE_CUSTOMER'];

const roleColors: Record<string, string> = {
  ROLE_ADMIN: 'bg-red-500/20 text-red-400',
  ROLE_PRODUCT_MANAGER: 'bg-purple-500/20 text-purple-400',
  ROLE_INVENTORY_MANAGER: 'bg-cyan-500/20 text-cyan-400',
  ROLE_CONTENT_EDITOR: 'bg-amber-500/20 text-amber-400',
  ROLE_CUSTOMER: 'bg-gray-500/20 text-gray-400',
};

const createSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  roles: z.array(z.string()).min(1, 'Select at least one role'),
});

const editSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  roles: z.array(z.string()).min(1, 'Select at least one role'),
  enabled: z.boolean(),
  locked: z.boolean(),
});

type CreateData = z.infer<typeof createSchema>;
type EditData = z.infer<typeof editSchema>;

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () =>
      api.get<ApiResponse<Page<User>>>('/admin/users', {
        params: { page, size: 20, keyword: search || undefined },
      }).then(r => r.data),
  });

  // Create form
  const createForm = useForm<CreateData>({
    resolver: zodResolver(createSchema),
    defaultValues: { roles: ['ROLE_CUSTOMER'] },
  });

  // Edit form
  const editForm = useForm<EditData>({
    resolver: zodResolver(editSchema),
    defaultValues: { enabled: true, locked: false, roles: [] },
  });

  const createMut = useMutation({
    mutationFn: (d: CreateData) => api.post<ApiResponse<User>>('/admin/users', d).then(r => r.data),
    onSuccess: () => {
      toast.success('User created successfully');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setMode('list');
      createForm.reset();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create user'),
  });

  const updateMut = useMutation({
    mutationFn: (d: EditData) => api.put<ApiResponse<User>>(`/admin/users/${editingUserId}`, d).then(r => r.data),
    onSuccess: () => {
      toast.success('User updated');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setMode('list');
      setEditingUserId(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete<ApiResponse<void>>(`/admin/users/${id}`).then(r => r.data),
    onSuccess: () => {
      toast.success('User deleted');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete'),
  });

  const toggleLockMut = useMutation({
    mutationFn: (userId: string) => api.patch<ApiResponse<User>>(`/admin/users/${userId}/toggle-lock`).then(r => r.data),
    onSuccess: () => { toast.success('Lock status toggled'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const toggleEnableMut = useMutation({
    mutationFn: (userId: string) => api.patch<ApiResponse<User>>(`/admin/users/${userId}/toggle-enable`).then(r => r.data),
    onSuccess: () => { toast.success('Enable status toggled'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const users: User[] = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const totalEl = data?.data?.totalElements ?? 0;

  const startEdit = (u: User) => {
    setEditingUserId(u.id);
    editForm.reset({
      fullName: u.fullName,
      email: u.email,
      phone: u.phone ?? '',
      address: '',
      city: '',
      district: '',
      postalCode: '',
      roles: u.roles ?? [],
      enabled: u.enabled,
      locked: u.locked,
    });
    setMode('edit');
  };

  const closeForm = () => {
    setMode('list');
    setEditingUserId(null);
    createForm.reset();
    editForm.reset();
  };

  // Shared role checkboxes component
  const RoleCheckboxes = ({ form }: { form: any }) => (
    <div>
      <label className="label">Roles *</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ALL_ROLES.map(role => (
          <label key={role} className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
            style={{ background: (form.watch('roles') || []).includes(role) ? 'var(--accent-light)' : 'var(--bg-primary)' }}>
            <input
              type="checkbox"
              className="w-4 h-4 accent-indigo-500"
              checked={(form.watch('roles') || []).includes(role)}
              onChange={(e) => {
                const current = form.getValues('roles') || [];
                if (e.target.checked) form.setValue('roles', [...current, role]);
                else form.setValue('roles', current.filter((r: string) => r !== role));
              }}
            />
            <span className={`badge text-xs ${roleColors[role] || ''}`}>{role.replace('ROLE_', '')}</span>
          </label>
        ))}
      </div>
      {form.formState.errors.roles && (
        <p className="text-xs text-red-400 mt-1">{form.formState.errors.roles.message}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCog size={22} style={{ color: 'var(--accent)' }} /> Staff & User Management
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {totalEl} users • Create, edit, delete, and assign roles
          </p>
        </div>
        {mode === 'list' && (
          <button onClick={() => { closeForm(); setMode('create'); }} className="btn-primary">
            <Plus size={16} /> Create User
          </button>
        )}
      </div>

      {/* ─── Create User Form ───────────────────────────────────────── */}
      {mode === 'create' && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Create New User</h3>
            <button onClick={closeForm} className="p-1 rounded hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <form onSubmit={createForm.handleSubmit((d) => createMut.mutate(d))} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input {...createForm.register('fullName')} className="input" placeholder="John Doe" />
                {createForm.formState.errors.fullName && <p className="text-xs text-red-400 mt-1">{createForm.formState.errors.fullName.message}</p>}
              </div>
              <div>
                <label className="label">Email *</label>
                <input {...createForm.register('email')} type="email" className="input" placeholder="john@example.com" />
                {createForm.formState.errors.email && <p className="text-xs text-red-400 mt-1">{createForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Password *</label>
                <input {...createForm.register('password')} type="password" className="input" placeholder="Min 6 characters" />
                {createForm.formState.errors.password && <p className="text-xs text-red-400 mt-1">{createForm.formState.errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <input {...createForm.register('phone')} className="input" placeholder="+880 17..." />
              </div>
              <div>
                <label className="label">City</label>
                <input {...createForm.register('city')} className="input" placeholder="Dhaka" />
              </div>
              <div>
                <label className="label">District</label>
                <input {...createForm.register('district')} className="input" placeholder="Dhaka" />
              </div>
            </div>
            <div>
              <label className="label">Address</label>
              <textarea {...createForm.register('address')} className="input" rows={2} placeholder="Full street address" />
            </div>
            <RoleCheckboxes form={createForm} />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={createMut.isPending} className="btn-primary">
                {createMut.isPending ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Save size={16} /> Create User</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Edit User Form ────────────────────────────────────────── */}
      {mode === 'edit' && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Edit User</h3>
            <button onClick={closeForm} className="p-1 rounded hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <form onSubmit={editForm.handleSubmit((d) => updateMut.mutate(d))} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input {...editForm.register('fullName')} className="input" />
                {editForm.formState.errors.fullName && <p className="text-xs text-red-400 mt-1">{editForm.formState.errors.fullName.message}</p>}
              </div>
              <div>
                <label className="label">Email *</label>
                <input {...editForm.register('email')} type="email" className="input" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input {...editForm.register('phone')} className="input" />
              </div>
              <div>
                <label className="label">City</label>
                <input {...editForm.register('city')} className="input" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input type="checkbox" {...editForm.register('enabled')} className="w-4 h-4 accent-green-500" />
                Enabled
              </label>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input type="checkbox" {...editForm.register('locked')} className="w-4 h-4 accent-orange-500" />
                Locked
              </label>
            </div>
            <RoleCheckboxes form={editForm} />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={updateMut.isPending} className="btn-primary">
                {updateMut.isPending ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Search ────────────────────────────────────────────────── */}
      {mode === 'list' && (
        <div className="card p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by name or email..." className="input pl-9" />
          </div>
        </div>
      )}

      {/* ─── Table ─────────────────────────────────────────────────── */}
      {mode === 'list' && (
        <>
          <div className="card table-container">
            <table>
              <thead>
                <tr><th>User</th><th>Phone</th><th>Roles</th><th>Status</th><th>Joined</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div className="h-4 w-20 rounded bg-[var(--bg-hover)] animate-pulse" /></td>
                  ))}</tr>
                )) : users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No users found.</td></tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{ background: (u.roles || []).includes('ROLE_ADMIN') ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                          {u.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{u.fullName}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{u.phone || '—'}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(u.roles ?? []).map(r => (
                          <span key={r} className={`badge text-[10px] ${roleColors[r] || 'bg-gray-500/20 text-gray-400'}`}>
                            {r.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className={`badge text-xs ${u.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {u.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        {u.locked && <span className="badge text-xs bg-orange-500/20 text-orange-400">Locked</span>}
                      </div>
                    </td>
                    <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(u)} title="Edit User"
                          className="p-2 rounded-lg hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-muted)' }}>
                          <Edit size={15} />
                        </button>
                        <button onClick={() => toggleEnableMut.mutate(u.id)}
                          title={u.enabled ? 'Disable' : 'Enable'}
                          className={`p-2 rounded-lg hover:bg-[var(--bg-hover)] ${u.enabled ? 'text-green-400' : 'text-red-400'}`}>
                          <Shield size={15} />
                        </button>
                        <button onClick={() => toggleLockMut.mutate(u.id)}
                          title={u.locked ? 'Unlock' : 'Lock'}
                          className={`p-2 rounded-lg hover:bg-[var(--bg-hover)] ${u.locked ? 'text-orange-400' : ''}`}
                          style={{ color: u.locked ? undefined : 'var(--text-muted)' }}>
                          {u.locked ? <Unlock size={15} /> : <Lock size={15} />}
                        </button>
                        <button onClick={() => { if (confirm(`Delete user "${u.fullName}"? This cannot be undone.`)) deleteMut.mutate(u.id); }}
                          title="Delete User" className="p-2 rounded-lg hover:bg-red-500/10 text-red-400">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
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
        </>
      )}
    </div>
  );
}
