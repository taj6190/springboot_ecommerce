'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ShoppingBag, Loader2, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login({
        fullName: data.data.fullName,
        email: data.data.email,
        roles: data.data.roles,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      toast.success('Welcome back!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-accent)' }}>
            <ShoppingBag size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold">Welcome Back</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl" style={{ border: '1px solid var(--color-border)', background: 'white' }}>
          <div>
            <label className="label-text">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="input-field pl-11" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="label-text">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="input-field pl-11" placeholder="Min 6 characters" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-accent w-full py-3">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm mt-4" style={{ color: 'var(--color-text-dim)' }}>
          Don&apos;t have an account? <Link href="/register" className="font-semibold" style={{ color: 'var(--color-accent)' }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
}
