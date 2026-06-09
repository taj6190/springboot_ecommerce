'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboardService';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingCart, DollarSign, TrendingUp, AlertTriangle,
  Package, ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
  });

  const stats = data?.data;

  const cards = [
    {
      title: "Today's Orders",
      value: stats?.todayOrders ?? 0,
      icon: ShoppingCart,
      glow: 'stat-glow-purple',
      gradient: 'from-indigo-500 to-purple-600',
      change: '+12%',
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(stats?.todayRevenue ?? 0),
      icon: DollarSign,
      glow: 'stat-glow-green',
      gradient: 'from-emerald-500 to-green-600',
      change: '+8%',
    },
    {
      title: "Month's Orders",
      value: stats?.monthOrders ?? 0,
      icon: TrendingUp,
      glow: 'stat-glow-cyan',
      gradient: 'from-cyan-500 to-blue-600',
      change: '+24%',
    },
    {
      title: 'Low Stock',
      value: stats?.lowStockProducts ?? 0,
      icon: AlertTriangle,
      glow: 'stat-glow-amber',
      gradient: 'from-amber-500 to-orange-600',
      change: 'Alert',
    },
  ];

  const statusList = stats?.ordersByStatus
    ? Object.entries(stats.ordersByStatus)
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.fullName?.split(' ')[0] ?? 'Admin'} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`card card-hover p-5 ${card.glow}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-white mt-2">
                  {isLoading ? (
                    <span className="inline-block w-16 h-7 rounded bg-[var(--bg-hover)] animate-pulse" />
                  ) : (
                    card.value
                  )}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                <card.icon size={20} className="text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <ArrowUpRight size={14} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">{card.change}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Orders by Status + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Package size={18} style={{ color: 'var(--accent)' }} />
            Orders by Status
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((n) => (
                <div key={n} className="h-10 rounded-lg bg-[var(--bg-hover)] animate-pulse" />
              ))}
            </div>
          ) : statusList.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {statusList.map(([status, count]) => {
                const colors: Record<string, string> = {
                  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PROCESSING: '#8b5cf6',
                  SHIPPED: '#06b6d4', DELIVERED: '#22c55e', CANCELLED: '#ef4444',
                  RETURNED: '#f97316',
                };
                const total = statusList.reduce((s, [, c]) => s + c, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {status}
                    </span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--bg-hover)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: colors[status] || '#6366f1' }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly Revenue */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign size={18} style={{ color: 'var(--accent)' }} />
            Monthly Revenue
          </h3>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-4xl font-bold text-white">
              {isLoading ? (
                <span className="inline-block w-32 h-10 rounded bg-[var(--bg-hover)] animate-pulse" />
              ) : (
                formatCurrency(stats?.monthRevenue ?? 0)
              )}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Total revenue this month
            </p>
            <div className="flex items-center gap-1 mt-3">
              <ArrowUpRight size={14} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">+18%</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>from last month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
