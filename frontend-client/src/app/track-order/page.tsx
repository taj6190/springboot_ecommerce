'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import {
  Search,
  Package,
  Loader2,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  ArrowRight,
  CircleDot,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantInfo?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

interface StatusHistory {
  fromStatus: string | null;
  toStatus: string;
  changedBy: string;
  changedAt: string;
  notes?: string;
}

interface TrackedOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingPostalCode: string;
  notes?: string;
  couponCode?: string;
  items: OrderItem[];
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const statusMeta: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  PENDING: { icon: <Clock size={18} />, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  CONFIRMED: { icon: <CheckCircle2 size={18} />, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Confirmed' },
  PROCESSING: { icon: <Package size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Processing' },
  SHIPPED: { icon: <Truck size={18} />, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Shipped' },
  DELIVERED: { icon: <CheckCircle2 size={18} />, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  CANCELLED: { icon: <XCircle size={18} />, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
  RETURNED: { icon: <RotateCcw size={18} />, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Returned' },
};

export default function TrackOrderPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAuthenticated && user?.accessToken) {
        headers['Authorization'] = `Bearer ${user.accessToken}`;
      }

      const res = await fetch(`${API}/orders/${encodeURIComponent(trimmed)}`, { headers });

      if (!res.ok) {
        if (res.status === 404) {
          setError('Order not found. Please check your order number and try again.');
        } else if (res.status === 401 || res.status === 403) {
          setError('Please log in to track this order.');
        } else {
          setError('Something went wrong. Please try again later.');
        }
        return;
      }

      const data = await res.json();
      setOrder(data.data);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? STATUS_FLOW.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'CANCELLED';
  const isReturned = order?.status === 'RETURNED';

  return (
    <div className="bg-[#F2F4F8] min-h-screen py-8">
      <div className="container-main max-w-4xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#EF4A23] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400">Track Order</span>
        </div>

        {/* Search Section */}
        <div className="bg-white border border-[#e2e4e8] p-8 mb-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#EF4A23] flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-[#081621] mb-2">Track Your Order</h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Enter your order number to get real-time status updates on your purchase.
            </p>
          </div>

          <form onSubmit={handleTrack} className="max-w-lg mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Enter order number (e.g., ORD-20250609-XXXX)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="input-field pl-11"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !orderNumber.trim()}
                className="btn btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Track'}
              </button>
            </div>
          </form>

          {error && (
            <div className="max-w-lg mx-auto mt-4 bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium flex items-center gap-2">
              <XCircle size={16} />
              {error}
            </div>
          )}

          {!isAuthenticated && (
            <p className="text-center text-xs text-gray-400 mt-4">
              <Link href="/login" className="text-[#EF4A23] font-bold hover:underline">Log in</Link> for easier order tracking
            </p>
          )}
        </div>

        {/* Order Result */}
        {order && (
          <div className="space-y-6 animate-fade-up">

            {/* Status Progress Bar */}
            <div className="bg-white border border-[#e2e4e8] p-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-[#081621]">Order #{order.orderNumber}</h2>
                <span className={`text-xs font-bold px-3 py-1.5 ${statusMeta[order.status]?.bg || 'bg-gray-100'} ${statusMeta[order.status]?.color || 'text-gray-700'}`}>
                  {statusMeta[order.status]?.label || order.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-8">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>

              {/* Progress Steps */}
              {!isCancelled && !isReturned ? (
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {STATUS_FLOW.map((step, i) => {
                      const isActive = i <= currentStepIndex;
                      const isCurrent = i === currentStepIndex;
                      const meta = statusMeta[step];
                      return (
                        <div key={step} className="flex flex-col items-center relative z-10 flex-1">
                          <div
                            className={`w-10 h-10 flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-[#EF4A23] text-white shadow-lg shadow-[#EF4A23]/30 scale-110'
                                : isActive
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {meta.icon}
                          </div>
                          <p className={`text-[11px] font-bold mt-2 text-center ${
                            isCurrent ? 'text-[#EF4A23]' : isActive ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {meta.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {/* Progress line */}
                  <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-0">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STATUS_FLOW.length - 1)) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200">
                  {statusMeta[order.status]?.icon}
                  <div>
                    <p className="text-sm font-bold text-red-700">
                      Order {order.status === 'CANCELLED' ? 'Cancelled' : 'Returned'}
                    </p>
                    <p className="text-xs text-red-500">
                      {order.status === 'CANCELLED'
                        ? 'This order has been cancelled.'
                        : 'This order has been returned.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Items */}
              <div className="lg:col-span-2 bg-white border border-[#e2e4e8]">
                <div className="bg-[#f5f6f7] px-6 py-3 border-b border-[#e2e4e8]">
                  <h3 className="text-sm font-black text-[#081621] uppercase tracking-wide flex items-center gap-2">
                    <ShoppingBag size={14} /> Order Items
                  </h3>
                </div>
                <div className="divide-y divide-[#f0f0f0]">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-[#fafafa] transition-colors">
                      {item.imageUrl ? (
                        <div className="w-16 h-16 border border-[#e2e4e8] p-1 flex-shrink-0 bg-white">
                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 border border-[#e2e4e8] flex items-center justify-center flex-shrink-0 bg-gray-50">
                          <Package size={20} className="text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#081621] truncate">{item.productName}</p>
                        {item.variantInfo && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.variantInfo}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-[#EF4A23]">৳{Number(item.totalPrice).toLocaleString()}</p>
                        <p className="text-[11px] text-gray-400">
                          {item.quantity} × ৳{Number(item.unitPrice).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Price summary */}
                <div className="border-t border-[#e2e4e8] p-4 space-y-2 bg-[#fafafa]">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span>৳{Number(order.subtotal).toLocaleString()}</span>
                  </div>
                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Discount</span>
                      <span>-৳{Number(order.discountAmount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Shipping</span>
                    <span>{Number(order.shippingCost) > 0 ? `৳${Number(order.shippingCost).toLocaleString()}` : 'Free'}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-[#081621] pt-2 border-t border-[#e2e4e8]">
                    <span>Total</span>
                    <span className="text-[#EF4A23]">৳{Number(order.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Shipping Info */}
                <div className="bg-white border border-[#e2e4e8]">
                  <div className="bg-[#f5f6f7] px-6 py-3 border-b border-[#e2e4e8]">
                    <h3 className="text-sm font-black text-[#081621] uppercase tracking-wide flex items-center gap-2">
                      <MapPin size={14} /> Shipping Details
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-[#081621] font-semibold">{order.shippingName}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{order.shippingPhone}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-600">
                        <p>{order.shippingAddress}</p>
                        <p>{order.shippingCity}{order.shippingDistrict ? `, ${order.shippingDistrict}` : ''}</p>
                        {order.shippingPostalCode && <p>Postal Code: {order.shippingPostalCode}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="bg-white border border-[#e2e4e8]">
                    <div className="bg-[#f5f6f7] px-6 py-3 border-b border-[#e2e4e8]">
                      <h3 className="text-sm font-black text-[#081621] uppercase tracking-wide flex items-center gap-2">
                        <Clock size={14} /> Status Timeline
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-0">
                        {[...order.statusHistory].reverse().map((h, i) => {
                          const meta = statusMeta[h.toStatus];
                          return (
                            <div key={i} className="flex gap-3 relative">
                              {/* Timeline line */}
                              {i < order.statusHistory.length - 1 && (
                                <div className="absolute left-[11px] top-7 bottom-0 w-px bg-gray-200" />
                              )}
                              <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                i === 0 ? 'bg-[#EF4A23] text-white' : 'bg-gray-100 text-gray-400'
                              }`}>
                                <CircleDot size={12} />
                              </div>
                              <div className="pb-5">
                                <p className={`text-xs font-bold ${i === 0 ? 'text-[#081621]' : 'text-gray-500'}`}>
                                  {meta?.label || h.toStatus}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  {new Date(h.changedAt).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                  })}
                                </p>
                                {h.notes && <p className="text-[11px] text-gray-400 mt-0.5">{h.notes}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="bg-white border border-[#e2e4e8] p-4">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide mb-2">Order Notes</p>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
