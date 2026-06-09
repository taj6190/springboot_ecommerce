'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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
      <div className="container-main py-16 text-center">
        <h1 className="text-xl font-bold mb-2">Nothing to Checkout</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-dim)' }}>Add items or buy a product.</p>
        <Link href="/products" className="btn btn-accent">Shop Now</Link>
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
        // Since guest doesn't have an order history page yet
        toast.success(`Your order ${data.data.orderNumber} has been placed.`);
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    }
    setLoading(false);
  };

  return (
    <div className="container-main py-8">
      <button onClick={openCart} className="inline-flex items-center gap-1 text-sm font-medium mb-6 hover:text-[var(--color-accent)]" style={{ color: 'var(--color-text-dim)' }}>
        <ArrowLeft size={14} /> Back to Cart
      </button>
      <h1 className="text-2xl font-extrabold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl" style={{ border: '1px solid var(--color-border)' }}>
              <h3 className="font-bold mb-4">Shipping Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Full Name *</label>
                  <input value={form.shippingName} onChange={(e) => set('shippingName', e.target.value)} required className="input-field" placeholder="John Doe" />
                </div>
                {!isAuthenticated && (
                  <div>
                    <label className="label-text">Email Address *</label>
                    <input type="email" value={form.guestEmail} onChange={(e) => set('guestEmail', e.target.value)} required className="input-field" placeholder="you@example.com" />
                  </div>
                )}
                <div className={!isAuthenticated ? "sm:col-span-2" : ""}>
                  <label className="label-text">Phone *</label>
                  <input value={form.shippingPhone} onChange={(e) => set('shippingPhone', e.target.value)} required className="input-field" placeholder="+880 1XXX" />
                </div>
              </div>
              <div className="mt-4">
                <label className="label-text">Address *</label>
                <textarea value={form.shippingAddress} onChange={(e) => set('shippingAddress', e.target.value)} required className="input-field" rows={2} placeholder="Full street address" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="label-text">City</label>
                  <input value={form.shippingCity} onChange={(e) => set('shippingCity', e.target.value)} className="input-field" placeholder="Dhaka" />
                </div>
                <div>
                  <label className="label-text">District</label>
                  <input value={form.shippingDistrict} onChange={(e) => set('shippingDistrict', e.target.value)} className="input-field" placeholder="Dhaka" />
                </div>
                <div>
                  <label className="label-text">Postal Code</label>
                  <input value={form.shippingPostalCode} onChange={(e) => set('shippingPostalCode', e.target.value)} className="input-field" placeholder="1000" />
                </div>
              </div>
              <div className="mt-4">
                <label className="label-text">Order Notes</label>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className="input-field" rows={2} placeholder="Any special instructions..." />
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ border: '1px solid var(--color-border)' }}>
              <h3 className="font-bold mb-3">Coupon Code</h3>
              <div className="flex gap-2">
                <input value={form.couponCode} onChange={(e) => set('couponCode', e.target.value)} className="input-field" placeholder="Enter coupon code" />
                <button type="button" className="btn btn-outline flex-shrink-0 text-sm">Apply</button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl p-6 h-fit sticky top-20" style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)' }}>
            <h3 className="font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {checkoutItems.map((item) => (
                <div key={item.productId + (item.variantId || '')} className="flex justify-between text-sm">
                  <span className="truncate flex-1" style={{ color: 'var(--color-text-dim)' }}>{item.name} × {item.quantity}</span>
                  <span className="font-medium ml-2">৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="flex justify-between"><span style={{ color: 'var(--color-text-dim)' }}>Subtotal</span><span>৳{checkoutTotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--color-text-dim)' }}>Shipping</span><span className="text-green-600 font-medium">Free</span></div>
            </div>
            <div className="flex justify-between mt-4 pt-4 text-lg font-bold" style={{ borderTop: '1px solid var(--color-border)' }}>
              <span>Total</span><span>৳{checkoutTotal.toLocaleString()}</span>
            </div>
            <button type="submit" disabled={loading} className="btn btn-accent w-full py-3 mt-4">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Placing Order...</> : <><ShieldCheck size={16} /> Place Order</>}
            </button>
            <p className="text-center text-[11px] mt-3" style={{ color: 'var(--color-text-muted)' }}>Payment on delivery (Cash on Delivery)</p>
          </div>
        </div>
      </form>
    </div>
  );
}
