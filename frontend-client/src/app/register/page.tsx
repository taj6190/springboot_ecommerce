'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ShoppingBag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', address: '', city: '', district: '' });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      login({
        fullName: data.data.fullName,
        email: data.data.email,
        roles: data.data.roles,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      toast.success('Account created!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-accent)' }}>
            <ShoppingBag size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold">Create Account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>Join BD Commerce today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl" style={{ border: '1px solid var(--color-border)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Full Name *</label>
              <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="label-text">Email *</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label-text">Password *</label>
              <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} className="input-field" placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="label-text">Phone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input-field" placeholder="+880 17..." />
            </div>
          </div>
          <div>
            <label className="label-text">Address</label>
            <input value={form.address} onChange={(e) => set('address', e.target.value)} className="input-field" placeholder="Street address" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">City</label>
              <input value={form.city} onChange={(e) => set('city', e.target.value)} className="input-field" placeholder="Dhaka" />
            </div>
            <div>
              <label className="label-text">District</label>
              <input value={form.district} onChange={(e) => set('district', e.target.value)} className="input-field" placeholder="Dhaka" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-accent w-full py-3">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-4" style={{ color: 'var(--color-text-dim)' }}>
          Already have an account? <Link href="/login" className="font-semibold" style={{ color: 'var(--color-accent)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
