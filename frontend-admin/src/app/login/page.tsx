'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ShoppingBag, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      if (res.success) {
        setAuth(res.data);
        toast.success(`Welcome back, ${res.data.fullName}!`);
        router.push('/dashboard');
      } else {
        toast.error(res.message || 'Login failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, var(--bg-primary) 60%)' }}>

      {/* Glowing background circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4H10L14 14V4H18V20H14L10 10V20H6V4Z" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Nexora</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Admin Panel</p>
        </div>

        {/* Card */}
        <div className="card p-8" style={{ boxShadow: '0 0 40px rgba(0,0,0,0.4)' }}>
          <h2 className="text-xl font-semibold text-white mb-1">Sign in to your account</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Enter your credentials to access the dashboard
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@nexora.com"
                  className="input pl-9"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pl-9 pr-10"
                />
                <button type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-2.5">
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-3 rounded-lg text-xs" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
            <strong className="text-white">Demo credentials:</strong><br />
            Email: admin@nexora.com<br />
            Password: Admin@123
          </div>
        </div>
      </div>
    </div>
  );
}
