'use client';

import { useAuthStore } from '@/store/authStore';
import type { Order, OrderItem } from '@/types';
import { Loader2, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-indigo-100 text-indigo-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    RETURNED: 'bg-gray-100 text-gray-700',
};

export default function OrdersPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        fetch(`${API}/orders?page=0&size=20`, {
            headers: { Authorization: `Bearer ${user?.accessToken}` },
        })
            .then(r => r.json())
            .then(data => { setOrders(data.data?.content ?? []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated) return null;

    return (
        <div className="container-main py-8">
            <h1 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
                <Package size={24} style={{ color: 'var(--color-accent)' }} /> My Orders
            </h1>

            {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-accent)' }} /></div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16">
                    <Package size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <h2 className="text-lg font-bold mb-2">No orders yet</h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--color-text-dim)' }}>Your order history will appear here.</p>
                    <Link href="/products" className="btn btn-accent">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((o) => (
                        <div key={o.id} className="p-5 rounded-2xl" style={{ border: '1px solid var(--color-border)' }}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <p className="font-bold">Order #{o.orderNumber}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                        {new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {o.status}
                                    </span>
                                    <span className="font-bold">৳{Number(o.totalAmount).toLocaleString()}</span>
                                </div>
                            </div>
                            {o.items && o.items.length > 0 && (
                                <div className="mt-3 pt-3 space-y-1" style={{ borderTop: '1px solid var(--color-border)' }}>
                                    {o.items.slice(0, 3).map((item: OrderItem, i: number) => (
                                        <p key={i} className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
                                            {item.productName || item.sku} × {item.quantity} — ৳{Number(item.totalPrice).toLocaleString()}
                                        </p>
                                    ))}
                                    {o.items.length > 3 && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>+{o.items.length - 3} more items</p>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
