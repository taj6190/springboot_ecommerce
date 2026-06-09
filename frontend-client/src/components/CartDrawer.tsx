'use client';

import { useCartStore } from '@/store/cartStore';
import { X, Trash2, Minus, Plus, ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQty, total, clear } = useCartStore();
  const cartTotal = total();
  const router = useRouter();

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity" 
        onClick={closeCart}
      />

      {/* Drawer (Sharp Design) */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
            <ShoppingCart size={22} className="text-orange-500" />
            Cart <span className="text-xs font-black text-slate-400 border border-slate-200 px-2 py-0.5 ml-2">{items.length}</span>
          </h2>
          <button onClick={closeCart} className="p-2 hover:bg-slate-50 transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                <ShoppingCart size={40} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 uppercase">Your cart is empty</p>
                <p className="text-sm text-slate-400 mt-2 font-medium">Add some premium tech to get started.</p>
              </div>
              <button onClick={closeCart} className="btn btn-outline mt-8 w-full">Continue Shopping</button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId + (item.variantId || '')} className="flex gap-4 p-4 border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover bg-slate-50 flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center bg-slate-50 text-slate-200 flex-shrink-0">📦</div>
                  )}
                  
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 uppercase tracking-tight">{item.name}</p>
                      <button onClick={() => removeItem(item.productId, item.variantId)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <p className="font-black text-slate-900 text-lg">৳{(item.price || 0).toLocaleString()}</p>
                      
                      {/* Qty controls (Sharp) */}
                      <div className="flex items-center border border-slate-200 h-9">
                        <button onClick={() => updateQty(item.productId, item.quantity - 1, item.variantId)} className="w-8 h-full flex items-center justify-center hover:bg-slate-50 text-slate-400 border-r border-slate-200"><Minus size={14} /></button>
                        <span className="text-xs font-black w-8 text-center text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, item.quantity + 1, item.variantId)} className="w-8 h-full flex items-center justify-center hover:bg-slate-50 text-slate-400 border-l border-slate-200"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-900 font-black">৳{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-sm font-black uppercase tracking-tighter text-slate-900">Total Amount</span>
                <span className="text-2xl font-black text-orange-500">৳{cartTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <button onClick={() => { closeCart(); router.push('/checkout'); }} className="btn btn-accent w-full py-4 text-sm shadow-[8px_8px_0_0_rgba(0,0,0,0.1)]">
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            <button onClick={clear} className="w-full text-center text-[10px] mt-6 text-slate-300 hover:text-red-500 font-black uppercase tracking-widest transition-colors">
              Clear All Items
            </button>
          </div>
        )}
      </div>
    </>
  );
}
