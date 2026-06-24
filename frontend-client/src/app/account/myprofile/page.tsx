'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Save,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyProfilePage() {
  const { user, isAuthenticated, login } = useAuthStore();
  const router = useRouter();

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    // Simulate API update and update local store
    setTimeout(() => {
      login({
        ...user,
        fullName,
        email,
      });
      toast.success('Profile updated successfully!');
      setLoading(false);
    }, 800);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPassLoading(true);
    // Simulate API update
    setTimeout(() => {
      toast.success('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPassLoading(false);
    }, 1000);
  };

  const initials = fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-[#F2F4F8] min-h-screen py-8">
      <div className="container-main">
        {/* Navigation & Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-xs">
          <Link href="/account" className="text-slate-500 hover:text-orange-500 transition-colors flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <ArrowLeft size={12} /> Back to Account
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8 border-b border-[#e2e4e8] pb-4">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
            My Profile
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
            Update your account details and security settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Visual Avatar & Status Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-[#E2E8F0] shadow-sm p-8 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-slate-900 flex items-center justify-center text-white font-black text-3xl mb-4 shadow-lg select-none">
                {initials || '?'}
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                {fullName}
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                {email}
              </p>
              
              <div className="mt-6 w-full pt-6 border-t border-[#F1F4F8] space-y-3 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">User Role</span>
                  <span className="font-bold text-slate-800 uppercase text-[10px]">{user.roles?.map((r) => r.replace('ROLE_', '')).join(', ') || 'Customer'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Account Status</span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 border border-green-100">
                    Active
                  </span>
                </div>
              </div>

              <div className="mt-6 w-full">
                <span className="inline-flex items-center justify-center gap-1.5 w-full text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 border border-green-100 py-2.5">
                  <ShieldCheck size={12} /> Verified Account
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Edit & Password Change Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Update Info Card */}
            <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#F1F4F8]">
                <span className="text-xs font-black bg-slate-900 text-white w-6 h-6 flex items-center justify-center">
                  01
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Update Account Details
                </h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <User size={12} /> Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full bg-white border border-[#E2E8F0] text-slate-800 text-sm py-2.5 px-4 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Mail size={12} /> Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white border border-[#E2E8F0] text-slate-800 text-sm py-2.5 px-4 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-950 text-white font-bold text-xs uppercase tracking-widest py-3 px-6 hover:bg-orange-500 transition-colors duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    style={{ borderRadius: '0px' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={13} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#F1F4F8]">
                <span className="text-xs font-black bg-slate-900 text-white w-6 h-6 flex items-center justify-center">
                  02
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Change Password
                </h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Lock size={12} /> Current Password
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-white border border-[#E2E8F0] text-slate-800 text-sm py-2.5 px-4 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Lock size={12} /> New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-white border border-[#E2E8F0] text-slate-800 text-sm py-2.5 px-4 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Lock size={12} /> Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full bg-white border border-[#E2E8F0] text-slate-800 text-sm py-2.5 px-4 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={passLoading}
                    className="bg-slate-950 text-white font-bold text-xs uppercase tracking-widest py-3 px-6 hover:bg-orange-500 transition-colors duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    style={{ borderRadius: '0px' }}
                  >
                    {passLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={13} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
