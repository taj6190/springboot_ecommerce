'use client';

import { formatCurrency } from '@/lib/utils';
import { dashboardApi } from '@/services/dashboardService';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import {
    AlertTriangle,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
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
            change: '+12%',
        },
        {
            title: "Today's Revenue",
            value: formatCurrency(stats?.todayRevenue ?? 0),
            icon: DollarSign,
            change: '+8%',
        },
        {
            title: "Month's Orders",
            value: stats?.monthOrders ?? 0,
            icon: TrendingUp,
            change: '+24%',
        },
        {
            title: 'Low Stock',
            value: stats?.lowStockProducts ?? 0,
            icon: AlertTriangle,
            change: 'Alert',
        },
    ];

    const statusList = stats?.ordersByStatus ? Object.entries(stats.ordersByStatus) : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Welcome back, {user?.fullName?.split(' ')[0] ?? 'Admin'}
                </h1>
                <p className="text-sm text-gray-400 mt-1">Here's your store overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <Card key={i} className="bg-gray-900/50 border-gray-800">
                        <div className="p-5">
                            <div className="flex items-center justify-between">
                                <card.icon className="h-5 w-5 text-gray-400" />
                                <span className="text-xs text-green-400">{card.change}</span>
                            </div>
                            <p className="text-2xl font-semibold text-white mt-3">
                                {isLoading ? '—' : card.value}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{card.title}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Orders by Status */}
                <Card className="bg-gray-900/50 border-gray-800">
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="h-4 w-4 text-gray-400" />
                            <h3 className="text-sm font-medium text-gray-300">Orders by Status</h3>
                        </div>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(n => <div key={n} className="h-8 bg-gray-800 rounded animate-pulse" />)}
                            </div>
                        ) : statusList.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {statusList.map(([status, count]) => {
                                    const total = statusList.reduce((s, [, c]) => s + c, 0);
                                    const percentage = total > 0 ? (count / total) * 100 : 0;

                                    return (
                                        <div key={status}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">{status}</span>
                                                <span className="text-gray-300">{count}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Monthly Revenue */}
                <Card className="bg-gray-900/50 border-gray-800">
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <h3 className="text-sm font-medium text-gray-300">Monthly Revenue</h3>
                        </div>
                        <div className="text-center py-6">
                            <p className="text-3xl font-semibold text-white">
                                {isLoading ? '—' : formatCurrency(stats?.monthRevenue ?? 0)}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">Total revenue this month</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
