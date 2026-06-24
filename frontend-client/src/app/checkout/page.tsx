'use client';

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import {
    ArrowLeft,
    Info,
    Loader2,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    ShieldCheck,
    ShoppingBag,
    Tag,
    User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, total, clear, openCart } = useCartStore();
    const { user, isAuthenticated } = useAuthStore();
    const cartTotal = total();

    const [isQuickBuy, setIsQuickBuy] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsQuickBuy(window.location.search.includes('quickbuy=true'));
        }
    }, []);

    const checkoutItems = isQuickBuy && useCartStore.getState().quickBuyItem
        ? [useCartStore.getState().quickBuyItem!]
        : items;

    const checkoutTotal = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const [form, setForm] = useState({
        shippingName: user?.fullName || '',
        guestEmail: user?.email || '',
        shippingPhone: '',
        shippingAddress: '',
        shippingCity: '',
        shippingDistrict: '',
        shippingPostalCode: '',
        notes: '',
        couponCode: '',
    });
    const [loading, setLoading] = useState(false);

    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    if (checkoutItems.length === 0) {
        return (
            <div className="container-main py-20 text-center bg-[#F2F4F8] min-h-[70vh] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[#EF4A23]/10 flex items-center justify-center text-[#EF4A23] mb-6">
                    <ShoppingBag size={28} />
                </div>
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">Nothing to Checkout</h1>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-6">Your shopping cart or quick buy item is empty.</p>
                <Link href="/products" className="bg-[#EF4A23] text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 hover:bg-slate-950 transition-colors">
                    Browse Products
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const body = {
                ...form,
                items: checkoutItems.map((i) => ({
                    productId: i.productId,
                    variantId: i.variantId || null,
                    quantity: i.quantity,
                })),
            };
            const endpoint = isAuthenticated ? '/orders' : '/public/orders';
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (isAuthenticated && user?.accessToken) {
                headers['Authorization'] = `Bearer ${user.accessToken}`;
            }

            const res = await fetch(`${API}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            let data;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(text || `Server error: ${res.status}`);
            }

            if (!res.ok) throw new Error(data?.message || `Order failed (${res.status})`);

            if (isQuickBuy) {
                useCartStore.getState().clearQuickBuy();
            } else {
                clear();
            }
            toast.success('Order placed successfully!');

            if (isAuthenticated) {
                router.push(`/orders/${data.data.orderNumber}`);
            } else {
                toast.success(`Your order ${data.data.orderNumber} has been placed.`);
                router.push('/');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to place order');
        }
        setLoading(false);
    };

    return (
        <div className="bg-[#F2F4F8] min-h-screen py-8">
            <div className="container-main">
                {/* Navigation back */}
                <button
                    onClick={openCart}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-[#EF4A23] transition-colors mb-6 cursor-pointer"
                >
                    <ArrowLeft size={14} /> Back to Cart
                </button>

                {/* Title */}
                <div className="mb-8 border-b border-[#e2e4e8] pb-4">
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                        Checkout Details
                    </h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                        Complete your order with cash on delivery
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                        {/* Left Column: Shipping Form & Addons */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Shipping card */}
                            <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#F1F4F8]">
                                    <span className="text-xs font-black bg-slate-900 text-white w-6 h-6 flex items-center justify-center">01</span>
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Shipping Details</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Full Name */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">
                                            Full Name *
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A23] transition-colors">
                                                <User size={15} />
                                            </span>
                                            <input
                                                type="text"
                                                value={form.shippingName}
                                                onChange={(e) => set('shippingName', e.target.value)}
                                                required
                                                placeholder="John Doe"
                                                className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-sm py-2.5 pl-11 pr-4 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                                                style={{ borderRadius: '0px' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Guest Email (If not authenticated) */}
                                    {!isAuthenticated && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">
                                                Email Address (Optional)
                                            </label>
                                            <div className="relative group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A23] transition-colors">
                                                    <Mail size={15} />
                                                </span>
                                                <input
                                                    type="email"
                                                    value={form.guestEmail}
                                                    onChange={(e) => set('guestEmail', e.target.value)}
                                                    placeholder="you@example.com"
                                                    className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-sm py-2.5 pl-11 pr-4 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                                                    style={{ borderRadius: '0px' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Phone */}
                                    <div className={!isAuthenticated ? "sm:col-span-2 space-y-1" : "space-y-1"}>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">
                                            Phone Number *
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A23] transition-colors">
                                                <Phone size={15} />
                                            </span>
                                            <input
                                                type="text"
                                                value={form.shippingPhone}
                                                onChange={(e) => set('shippingPhone', e.target.value)}
                                                required
                                                placeholder="+880 17..."
                                                className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-sm py-2.5 pl-11 pr-4 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                                                style={{ borderRadius: '0px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="mt-4 space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">
                                        Full Delivery Address *
                                    </label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-4 text-slate-400 group-focus-within:text-[#EF4A23] transition-colors">
                                            <MapPin size={15} />
                                        </span>
                                        <textarea
                                            value={form.shippingAddress}
                                            onChange={(e) => set('shippingAddress', e.target.value)}
                                            required
                                            rows={3}
                                            placeholder="Flat/House, Road Name, Area details..."
                                            className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-sm py-2.5 pl-11 pr-4 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                                            style={{ borderRadius: '0px' }}
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* Instructions and Coupon */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                                {/* Order Notes */}
                                <div className="bg-white border border-[#E2E8F0] p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#F1F4F8]">
                                        <span className="text-xs font-black bg-slate-950 text-white w-5 h-5 flex items-center justify-center">02</span>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Order Instructions</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Notes for courier / shipping</label>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#EF4A23]">
                                                <MessageSquare size={14} />
                                            </span>
                                            <textarea
                                                value={form.notes}
                                                onChange={(e) => set('notes', e.target.value)}
                                                rows={2}
                                                placeholder="e.g. Leave package with reception..."
                                                className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-xs py-2.5 pl-10 pr-4 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                                                style={{ borderRadius: '0px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Discount Coupon */}
                                <div className="bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#F1F4F8]">
                                            <span className="text-xs font-black bg-slate-950 text-white w-5 h-5 flex items-center justify-center">03</span>
                                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Discount Coupon</h3>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Apply coupon code</label>
                                            <div className="flex gap-2">
                                                <div className="relative group flex-1">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EF4A23]">
                                                        <Tag size={14} />
                                                    </span>
                                                    <input
                                                        value={form.couponCode}
                                                        onChange={(e) => set('couponCode', e.target.value)}
                                                        placeholder="Enter coupon code"
                                                        className="w-full bg-white border border-[#E2E8F0] placeholder-slate-400 text-slate-900 text-xs py-2.5 pl-10 pr-4 outline-none transition-all duration-200 focus:border-[#EF4A23] focus:ring-1 focus:ring-[#EF4A23]"
                                                        style={{ borderRadius: '0px' }}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    className="border-2 border-slate-950 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 hover:bg-slate-950 hover:text-white transition-colors duration-200"
                                                    style={{ borderRadius: '0px' }}
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* Right Column: Order Summary (Sticky Panel) */}
                        <div className="bg-white border border-[#E2E8F0] p-8 shadow-md sticky top-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6 pb-2 border-b border-[#F1F4F8]">
                                ORDER SUMMARY
                            </h3>

                            {/* Items List */}
                            <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100 pr-2 mb-6 no-scrollbar">
                                {checkoutItems.map((item) => (
                                    <div key={item.productId + (item.variantId || '')} className="flex gap-3 py-3 items-center">
                                        {/* Item Thumbnail */}
                                        <div className="w-12 h-12 border border-slate-200 flex-shrink-0 relative overflow-hidden bg-slate-50">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <ShoppingBag size={16} />
                                                </div>
                                            )}
                                        </div>
                                        {/* Item Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-slate-800 truncate leading-tight uppercase">
                                                {item.name}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                                                Qty: {item.quantity} {item.variantLabel ? `| ${item.variantLabel}` : ''}
                                            </p>
                                        </div>
                                        {/* Item Total */}
                                        <span className="text-xs font-black text-slate-900 shrink-0">
                                            ৳{(item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Price calculations */}
                            <div className="space-y-2.5 text-xs pt-4 border-t border-slate-100 mb-6">
                                <div className="flex justify-between items-center text-slate-500">
                                    <span className="font-semibold uppercase tracking-wider text-[10px]">Subtotal</span>
                                    <span className="font-bold">৳{checkoutTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500">
                                    <span className="font-semibold uppercase tracking-wider text-[10px]">Shipping</span>
                                    <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Free</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-900 pt-3 border-t border-slate-100">
                                    <span className="font-black uppercase tracking-wider text-[11px]">Total Amount</span>
                                    <span className="text-base font-black text-[#EF4A23]">৳{checkoutTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Cash on delivery notification banner */}
                            <div className="flex gap-2.5 items-start p-3 bg-slate-50 border border-slate-100 text-slate-600 text-[10px] mb-6">
                                <Info size={14} className="text-[#EF4A23] shrink-0 mt-0.5" />
                                <p className="font-medium">
                                    We currently support <strong>Cash on Delivery (COD)</strong> payment for all shipments. Verify items at delivery.
                                </p>
                            </div>

                            {/* Checkout Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-950 text-white font-bold text-xs uppercase tracking-widest py-4 hover:bg-[#EF4A23] transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ borderRadius: '0px' }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={14} />
                                        Place Order
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                <ShieldCheck size={13} className="text-green-500" />
                                <span>SSL Encrypted Checkout</span>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}
