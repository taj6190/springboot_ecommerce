'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { 
  ShoppingBag, 
  Loader2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Building, 
  Navigation, 
  Eye, 
  EyeOff,
  Gift,
  Compass,
  Clock,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const [form, setForm] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    phone: '', 
    address: '', 
    city: '', 
    district: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
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

  if (isAuthenticated && user) {
    const initials = user.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F1F4F8] relative overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#EF4A23]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-[#E2E8F0] shadow-2xl p-8 text-center relative z-10">
          <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white font-black text-xl mx-auto mb-6 shadow-lg">
            {initials || '?'}
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
            Already Signed In
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-6">
            You are logged in as <span className="text-slate-800 font-bold">{user.fullName}</span>
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-slate-950 text-white font-bold text-xs uppercase tracking-widest py-3.5 hover:bg-[#EF4A23] transition-colors text-center"
              style={{ borderRadius: '0px' }}
            >
              Go to Homepage
            </Link>
            <Link
              href="/products"
              className="block w-full bg-white border border-[#E2E8F0] text-slate-800 font-bold text-xs uppercase tracking-widest py-3.5 hover:border-slate-800 transition-colors text-center"
              style={{ borderRadius: '0px' }}
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="block w-full bg-white border border-[#E2E8F0] text-slate-800 font-bold text-xs uppercase tracking-widest py-3.5 hover:border-slate-800 transition-colors text-center"
              style={{ borderRadius: '0px' }}
            >
              My Account Dashboard
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => logout()}
              className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Sign Out from Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#F1F4F8]">
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#EF4A23]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Registration Box */}
      <div className="w-full max-w-6xl bg-white border border-[#E2E8F0] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative min-h-[620px] z-10 transition-all duration-300">
        
        {/* Left Side: Member Benefits Panel (Visible on Large Screens) */}
        <div className="hidden lg:flex w-[35%] p-12 bg-slate-50 border-r border-[#E2E8F0] flex-col justify-between relative overflow-hidden select-none">
          {/* Subtle Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.25] pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)', 
              backgroundSize: '20px 20px' 
            }} 
          />

          {/* Header */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-[#EF4A23] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <ShoppingBag size={20} className="text-white" />
              </div>
              <div>
                <span className="text-base font-black uppercase tracking-wider text-slate-900 block">NEXORA</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block -mt-1">BD E-COMMERCE</span>
              </div>
            </Link>
          </div>

          {/* Benefits */}
          <div className="my-auto space-y-6 relative z-10">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-6 border-b-2 border-[#EF4A23] pb-3 w-fit">
              MEMBER BENEFITS
            </h2>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 border border-[#E2E8F0] bg-white flex items-center justify-center flex-shrink-0 shadow-sm text-[#EF4A23]">
                <Gift size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Welcome Rewards</h3>
                <p className="text-xs text-slate-500 mt-0.5">Receive standard coupon codes and exclusive offers upon account activation.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 border border-[#E2E8F0] bg-white flex items-center justify-center flex-shrink-0 shadow-sm text-[#EF4A23]">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Instant Order Tracking</h3>
                <p className="text-xs text-slate-500 mt-0.5">Monitor and trace shipment delivery statuses seamlessly in real-time.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 border border-[#E2E8F0] bg-white flex items-center justify-center flex-shrink-0 shadow-sm text-[#EF4A23]">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Personalized Wishlists</h3>
                <p className="text-xs text-slate-500 mt-0.5">Save premium electronics, gadgets, and collections for easy checkouts later.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 border border-[#E2E8F0] bg-white flex items-center justify-center flex-shrink-0 shadow-sm text-[#EF4A23]">
                <Compass size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Faster Checkout</h3>
                <p className="text-xs text-slate-500 mt-0.5">Save delivery address, phone, and coordinates to order in a single click.</p>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <div className="relative z-10 pt-6 border-t border-[#E2E8F0]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">SECURE REGISTRATION SYSTEM</span>
          </div>
        </div>

        {/* Right Side: Registration Form Panel */}
        <div className="w-full lg:w-[65%] p-8 sm:p-12 md:p-14 flex flex-col justify-between relative bg-white">
          <div className="w-full my-auto">
            {/* Header for Mobile only */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#EF4A23] flex items-center justify-center">
                  <ShoppingBag size={18} className="text-white" />
                </div>
                <div>
                  <span className="text-sm font-black uppercase tracking-wider text-slate-900 block">NEXORA</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block -mt-1">BD E-COMMERCE</span>
                </div>
              </div>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">
                Create Account
              </h1>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Join BD Commerce today for premium gadgets & lifestyle
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dual-column on screens bigger than mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                    Full Name *
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A23] transition-colors">
                      <User size={15} />
                    </span>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => set('fullName', e.target.value)}
                      required
                      placeholder="John Doe"
                      className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-sm py-2.5 pl-11 pr-4 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                    Email Address *
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A23] transition-colors">
                      <Mail size={15} />
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-sm py-2.5 pl-11 pr-4 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                    Password *
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A23] transition-colors">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-sm py-2.5 pl-11 pr-12 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                      style={{ borderRadius: '0px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A23] transition-colors">
                      <Phone size={15} />
                    </span>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+880 17..."
                      className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-sm py-2.5 pl-11 pr-4 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                  Delivery Address
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A23] transition-colors">
                    <MapPin size={15} />
                  </span>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="Flat/House, Street Name, Area"
                    className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-sm py-2.5 pl-11 pr-4 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                    style={{ borderRadius: '0px' }}
                  />
                </div>
              </div>

              {/* City and District (Dual Column) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                    City
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A23] transition-colors">
                      <Building size={15} />
                    </span>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => set('city', e.target.value)}
                      placeholder="e.g. Dhaka"
                      className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-sm py-2.5 pl-11 pr-4 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>

                {/* District */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                    District
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A23] transition-colors">
                      <Navigation size={15} />
                    </span>
                    <input
                      type="text"
                      value={form.district}
                      onChange={(e) => set('district', e.target.value)}
                      placeholder="e.g. Dhaka"
                      className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-sm py-2.5 pl-11 pr-4 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 text-white font-bold text-xs uppercase tracking-widest py-3.5 mt-2 hover:bg-[#EF4A23] transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: '0px' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Already have an account?{' '}
                <Link href="/login" className="text-[#EF4A23] hover:underline font-black">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
