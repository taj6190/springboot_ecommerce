'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { canAccess } from '@/lib/rbac';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check RBAC - skip for exact /dashboard (everyone can see it)
    if (pathname !== '/dashboard' && user?.roles) {
      if (!canAccess(user.roles, pathname)) {
        toast.error('You do not have permission to access this page');
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, pathname, user, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
