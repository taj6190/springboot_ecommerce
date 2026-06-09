'use client';

import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboardService';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30');

  // We reuse the dashboard stats for the mock report view
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats-report'],
    queryFn: () => dashboardApi.getStats(),
  });

  const stats = data?.data;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={22} style={{ color: 'var(--accent)' }} /> Reports & Analytics
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Comprehensive sales, product, and customer analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="input w-40">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <button className="btn-secondary">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white">Revenue</p>
              <p className="text-xs text-green-400 font-medium">+18% vs last period</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {isLoading ? '...' : formatCurrency(stats?.monthRevenue ?? 0)}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white">Orders</p>
              <p className="text-xs text-green-400 font-medium">+24% vs last period</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {isLoading ? '...' : stats?.monthOrders ?? 0}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white">AOV</p>
              <p className="text-xs text-red-400 font-medium">-2% vs last period</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {isLoading || !stats?.monthOrders ? '...' : formatCurrency((stats.monthRevenue || 0) / stats.monthOrders)}
          </p>
        </div>
      </div>

      <div className="card p-6 min-h-[400px] flex items-center justify-center border-dashed">
        <div className="text-center">
          <BarChart3 size={48} className="mx-auto mb-4" style={{ color: 'var(--border)' }} />
          <h3 className="text-lg font-medium text-white mb-2">Detailed Charts Coming Soon</h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            The interactive charts module will be integrated here showing sales trends, 
            top selling products, and customer acquisition over time.
          </p>
        </div>
      </div>
    </div>
  );
}
