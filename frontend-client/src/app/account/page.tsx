'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Package,
  LogOut,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const initials = user.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-[#F2F4F8] min-h-screen py-8">
      <div className="container-main">
        {/* Page Header */}
        <div className="mb-8 border-b border-[#e2e4e8] pb-4">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
            My Account
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
            Manage your profile and view your activity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Card */}
            <div className="bg-white border border-[#E2E8F0] shadow-sm">
              <div className="p-8 flex flex-col items-center text-center border-b border-[#F1F4F8]">
                <div className="w-20 h-20 bg-slate-900 flex items-center justify-center text-white font-black text-2xl mb-4 shadow-lg">
                  {initials}
                </div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  {user.fullName}
                </h2>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  {user.email}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 border border-green-100 px-3 py-1 mb-4">
                  <ShieldCheck size={11} /> Verified Account
                </span>
                <Link
                  href="/account/myprofile"
                  className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                >
                  Edit Profile
                </Link>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </div>

          {/* Right Column: Details & Quick Links */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info */}
            <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#F1F4F8]">
                <span className="text-xs font-black bg-slate-900 text-white w-6 h-6 flex items-center justify-center">
                  01
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Account Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User size={11} /> Full Name
                  </label>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] text-sm font-semibold text-slate-800 py-2.5 px-4">
                    {user.fullName}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Mail size={11} /> Email Address
                  </label>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] text-sm font-semibold text-slate-800 py-2.5 px-4">
                    {user.email}
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck size={11} /> Account Type
                  </label>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] text-sm font-semibold text-slate-800 py-2.5 px-4">
                    {user.roles?.map((r) => r.replace('ROLE_', '')).join(', ') || 'Customer'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#F1F4F8]">
                <span className="text-xs font-black bg-slate-900 text-white w-6 h-6 flex items-center justify-center">
                  02
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Quick Links
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/account/myprofile"
                  className="group flex items-center gap-4 p-4 border border-[#E2E8F0] hover:border-[#EF4A23] hover:bg-[#FFF8F6] transition-all"
                >
                  <div className="w-10 h-10 bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EF4A23] group-hover:bg-[#EF4A23] group-hover:text-white transition-all shrink-0">
                    <User size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-800 group-hover:text-[#EF4A23] transition-colors">
                      My Profile
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Update details & password
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-[#EF4A23] transition-colors shrink-0"
                  />
                </Link>

                <Link
                  href="/orders"
                  className="group flex items-center gap-4 p-4 border border-[#E2E8F0] hover:border-[#EF4A23] hover:bg-[#FFF8F6] transition-all"
                >
                  <div className="w-10 h-10 bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EF4A23] group-hover:bg-[#EF4A23] group-hover:text-white transition-all shrink-0">
                    <Package size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-800 group-hover:text-[#EF4A23] transition-colors">
                      My Orders
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Track & manage your orders
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-[#EF4A23] transition-colors shrink-0"
                  />
                </Link>

                <Link
                  href="/track-order"
                  className="group flex items-center gap-4 p-4 border border-[#E2E8F0] hover:border-[#EF4A23] hover:bg-[#FFF8F6] transition-all"
                >
                  <div className="w-10 h-10 bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EF4A23] group-hover:bg-[#EF4A23] group-hover:text-white transition-all shrink-0">
                    <ArrowRight size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-800 group-hover:text-[#EF4A23] transition-colors">
                      Track Order
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Check delivery status
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-[#EF4A23] transition-colors shrink-0"
                  />
                </Link>

                <Link
                  href="/products"
                  className="group flex items-center gap-4 p-4 border border-[#E2E8F0] hover:border-[#EF4A23] hover:bg-[#FFF8F6] transition-all"
                >
                  <div className="w-10 h-10 bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EF4A23] group-hover:bg-[#EF4A23] group-hover:text-white transition-all shrink-0">
                    <ArrowRight size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-800 group-hover:text-[#EF4A23] transition-colors">
                      Continue Shopping
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Browse our latest products
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-[#EF4A23] transition-colors shrink-0"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
