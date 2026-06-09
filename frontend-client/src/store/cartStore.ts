import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartStore {
  isOpen: boolean;
  items: CartItem[];
  quickBuyItem: CartItem | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQty: (productId: string, qty: number, variantId?: string) => void;
  clear: () => void;
  setQuickBuy: (item: CartItem) => void;
  clearQuickBuy: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],
      quickBuyItem: null,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) =>

        set((s) => {
          const key = item.productId + (item.variantId || '');
          const existing = s.items.find((i) => i.productId + (i.variantId || '') === key);
          if (existing) {
            return { items: s.items.map((i) => (i.productId + (i.variantId || '') === key ? { ...i, quantity: i.quantity + item.quantity } : i)) };
          }
          return { items: [...s.items, item] };
        }),
      setQuickBuy: (item) => set({ quickBuyItem: item }),
      clearQuickBuy: () => set({ quickBuyItem: null }),
      removeItem: (productId, variantId) =>
        set((s) => ({ items: s.items.filter((i) => !(i.productId === productId && i.variantId === (variantId || i.variantId))) })),
      updateQty: (productId, qty, variantId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId && i.variantId === (variantId || i.variantId) ? { ...i, quantity: Math.max(1, qty) } : i
          ),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'bd-cart' }
  )
);
