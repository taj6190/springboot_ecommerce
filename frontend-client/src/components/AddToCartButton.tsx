'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import type { ProductDetail } from '@/types';
import toast from 'react-hot-toast';

export default function AddToCartButton({ product }: { product: ProductDetail }) {
  const addItem = useCartStore((s) => s.addItem);

  const setQuickBuy = useCartStore((s) => s.setQuickBuy);
  const router = useRouter();

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.nameEn,
      image: product.mainImageUrl,
      price: product.discountPrice || product.mainPrice,
      quantity: 1,
      sku: product.sku,
    });
    toast.success(`${product.nameEn} added to cart`);
  };

  const handleBuyNow = () => {
    setQuickBuy({
      productId: product.id,
      name: product.nameEn,
      image: product.mainImageUrl,
      price: product.discountPrice || product.mainPrice,
      quantity: 1,
      sku: product.sku,
    });
    router.push('/checkout?quickbuy=true');
  };

  const message = `Hello, I'm interested in ordering/enquiring about this product:

*Product:* ${product.nameEn}
*Price:* ৳${(product.discountPrice || product.mainPrice).toLocaleString()}
*SKU:* ${product.sku || 'N/A'}
*URL:* https://nexora.com/${product.urlSlug}`;

  const whatsappUrl = `https://wa.me/8801625456190?text=${encodeURIComponent(message)}`;

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex gap-3">
        <button onClick={handleAdd} disabled={product.stockQuantity <= 0}
          className="btn btn-outline flex-1 py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed text-center justify-center">
          <ShoppingCart size={18} /> {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <button onClick={handleBuyNow} disabled={product.stockQuantity <= 0}
          className="btn btn-accent flex-1 py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed text-center justify-center">
          Buy Now
        </button>
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full btn py-3.5 bg-[#25D366] text-white hover:bg-[#20ba56] transition-all text-center justify-center shadow-lg shadow-green-500/15 hover:scale-[1.01]"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.37 5.054L2 22l5.077-1.332a9.929 9.929 0 004.93 1.317h.005c5.507 0 9.99-4.479 9.991-9.985A9.972 9.972 0 0012.012 2zm5.72 13.914c-.313.882-1.815 1.636-2.502 1.742-.687.106-1.52.193-4.579-1.071-3.06-1.264-4.98-4.375-5.133-4.582-.152-.206-1.22-1.626-1.22-3.107 0-1.482.777-2.209 1.052-2.505.275-.297.61-.371.813-.371.204 0 .408.002.584.01.185.008.435-.07.68.524.253.613.864 2.106.94 2.26.076.151.127.327.026.529-.102.202-.153.328-.305.503-.153.176-.32.392-.457.527-.152.152-.313.318-.135.623.178.305.793 1.309 1.702 2.118.908.81 1.674 1.06 1.979 1.213.305.152.483.127.66-.076.178-.203.778-.905.986-1.213.208-.309.417-.258.704-.152.287.105 1.822.86 2.137 1.018.315.157.525.235.602.368.077.133.077.771-.236 1.653z"/>
        </svg>
        Order via WhatsApp
      </a>
    </div>
  );
}
