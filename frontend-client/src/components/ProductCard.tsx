'use client';

import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types';
import { Eye, ShoppingCart, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCartStore();

  const displayPrice = product.discountPrice || product.mainPrice;
  const discount = product.discountPrice
    ? Math.round(((product.mainPrice - product.discountPrice) / product.mainPrice) * 100)
    : 0;

  const buildCartItem = () => ({
    productId: product.id,
    name: product.nameEn,
    price: displayPrice,
    image: product.mainImageUrl,
    quantity: 1,
    sku: product.sku,
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(buildCartItem());
    toast.success('Added to cart!');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(buildCartItem());
    router.push('/checkout');
  };

  return (
    <div className="product-card group relative bg-white border border-[#e2e4e8] rounded-lg flex flex-col hover:z-10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-shadow duration-200 overflow-hidden">

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link href={`/${product.urlSlug}`} className="block w-full h-full">
          {product.mainImageUrl ? (
            <img
              src={product.mainImageUrl}
              alt={product.nameEn}
              width={800}
              height={800}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#f5f6f7] text-[#ccc]">
              <ShoppingCart size={36} />
            </div>
          )}
        </Link>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-[#EF4A23] text-white text-[9px] font-black px-1.5 py-0.5 uppercase">
            -{discount}%
          </span>
        )}

        {/* Quick View on hover */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
          <Link
            href={`/${product.urlSlug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 bg-[#081621] text-white text-[10px] font-bold px-3 py-1.5 hover:bg-[#EF4A23] transition-colors pointer-events-auto"
          >
            <Eye size={11} /> Quick View
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 pt-3 pb-3 flex flex-col flex-1">
        {/* Brand */}
        <p className="text-[10px] text-[#999] font-semibold uppercase tracking-wide mb-1 truncate">
          {product.brand?.nameEn || 'Premium'}
        </p>

        {/* Name */}
        <Link href={`/${product.urlSlug}`}>
          <h3 className="text-[12px] font-semibold text-[#333] leading-tight line-clamp-2 min-h-[32px] hover:text-[#EF4A23] transition-colors mb-2">
            {product.nameEn}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-[15px] font-black text-[#EF4A23]">
              ৳{displayPrice.toLocaleString()}
            </span>
            {product.discountPrice && (
              <span className="text-[11px] text-[#aaa] line-through">
                ৳{product.mainPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={handleAddToCart}
              className="flex-shrink-0 w-9 h-9 border border-[#e2e4e8] flex items-center justify-center text-[#555] hover:border-[#EF4A23] hover:text-[#EF4A23] transition-colors"
              title="Add to Cart"
            >
              <ShoppingCart size={15} />
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 h-9 bg-[#081621] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#EF4A23] transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap size={11} className="fill-current" />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
