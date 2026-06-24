import { getProductBySlug, getProducts } from '@/lib/api';
import { Star, ShieldCheck, Truck, RefreshCw, ChevronRight } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';
import ProductImageGallery from '@/components/ProductImageGallery';
import ReviewsSection from '@/components/ReviewsSection';
import ProductCard from '@/components/ProductCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Product } from '@/types';

interface Props { params: Promise<{ slug: string }> }

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  let product;
  try {
    const res = await getProductBySlug(slug);
    product = res.data;
  } catch { notFound(); }
  if (!product) notFound();

  const images = [product.mainImageUrl, ...(product.images?.map(i => i.imageUrl) || [])].filter(Boolean) as string[];

  let relatedProducts: Product[] = [];
  if (product.categoryId) {
    try {
      const relatedRes = await getProducts(0, 6, 'createdAt,desc', { categoryIds: product.categoryId });
      relatedProducts = (relatedRes.data?.content || []).filter((p: Product) => p.id !== product.id).slice(0, 5);
    } catch (e) {
      console.error('Failed to fetch related products', e);
    }
  }

  // Fallback backfill: if there are fewer than 3 category products, backfill with the latest store products
  if (relatedProducts.length < 3) {
    try {
      const fallbackRes = await getProducts(0, 10, 'createdAt,desc');
      const generalProducts = (fallbackRes.data?.content || []).filter((p: Product) => p.id !== product.id);
      
      const existingIds = new Set(relatedProducts.map(p => p.id));
      for (const p of generalProducts) {
        if (!existingIds.has(p.id)) {
          relatedProducts.push(p);
          existingIds.add(p.id);
        }
        if (relatedProducts.length >= 5) break;
      }
    } catch (e) {
      console.error('Failed to fetch fallback related products', e);
    }
  }

  return (
    <div className="bg-[#F2F4F8] min-h-screen py-8">
      <div className="container-main">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500 mb-6 select-none">
          <Link href="/" className="hover:text-[#EF4A23] transition-colors">Home</Link>
          <ChevronRight size={10} className="text-slate-300" />
          <Link href="/products" className="hover:text-[#EF4A23] transition-colors">Products</Link>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-slate-400 truncate max-w-[200px] sm:max-w-none">{product.nameEn}</span>
        </div>

        <div className="bg-white p-6 md:p-10 border border-[#E2E8F0] shadow-sm">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Gallery (Left/Top) */}
            <div className="w-full lg:w-[45%]">
              <ProductImageGallery images={images} productName={product.nameEn} />
            </div>

            {/* Info and Purchase Widget (Right/Bottom) */}
            <div className="w-full lg:w-[55%] space-y-8">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-5 uppercase tracking-tight">
                  {product.nameEn}
                </h1>
                
                {/* Structured Metadata Grid instead of generic pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* SKU */}
                  <div className="border border-slate-100 bg-slate-50/50 p-3 select-none">
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Product SKU</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{product.sku || 'N/A'}</p>
                  </div>
                  {/* Brand */}
                  {product.brandName && (
                    <div className="border border-slate-100 bg-slate-50/50 p-3 select-none">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Brand / Make</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{product.brandName}</p>
                    </div>
                  )}
                  {/* Rating */}
                  <div className="border border-slate-100 bg-slate-50/50 p-3 select-none">
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Rating</p>
                    {product.reviewCount > 0 ? (
                      <a href="#reviews" className="flex items-center gap-1 mt-0.5 hover:text-[#EF4A23] transition-colors cursor-pointer">
                        <Star size={11} className="text-amber-500 fill-amber-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-900">{product.avgRating?.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400">({product.reviewCount} reviews)</span>
                      </a>
                    ) : (
                      <p className="text-xs font-bold text-slate-400 mt-0.5">No reviews yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Features */}
              {product.shortDescEn && (
                <div className="border-l-2 border-[#EF4A23] pl-4 py-1">
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-900 mb-2">Key Features</h3>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: product.shortDescEn }} className="prose prose-sm max-w-none prose-ul:list-disc prose-ul:ml-4" />
                  </div>
                </div>
              )}

              {/* Pricing & Checkout Widget */}
              <div className="bg-slate-50 border border-slate-200/60 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-1">Special Discount Price</p>
                    <div className="flex items-end gap-3">
                      <p className="text-3xl font-black text-[#EF4A23]">৳{(product.discountPrice || product.mainPrice).toLocaleString()}</p>
                      {product.discountPrice && (
                        <p className="text-base text-slate-400 line-through font-semibold mb-1">৳{product.mainPrice.toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {product.discountPrice && (
                    <div className="bg-[#EF4A23] text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                      {Math.round(((product.mainPrice - product.discountPrice) / product.mainPrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 ${product.stockQuantity > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className={`font-bold ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} items left)` : 'Temporarily Out of Stock'}
                  </span>
                </div>

                {/* AddToCartButton component contains WhatsApp and add actions */}
                <AddToCartButton product={product} />

                {/* Shipping Features */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200/60 text-center text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
                  <div className="flex flex-col items-center gap-1.5 hover:text-slate-800 transition-colors">
                    <Truck size={15} className="text-[#EF4A23]" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 hover:text-slate-800 transition-colors">
                    <ShieldCheck size={15} className="text-[#EF4A23]" />
                    <span>100% Genuine</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 hover:text-slate-800 transition-colors">
                    <RefreshCw size={14} className="text-[#EF4A23]" />
                    <span>Easy Return</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Specs, Description, and reviews */}
        <div className="mt-8 space-y-8">
          
          {/* Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div id="specification" className="bg-white border border-[#E2E8F0] shadow-sm overflow-hidden scroll-mt-6">
              <div className="bg-slate-900 px-6 py-4 border-b border-[#E2E8F0]">
                <h2 className="text-xs font-black uppercase tracking-wider text-white">Technical Specifications</h2>
              </div>
              <div className="divide-y divide-[#E2E8F0]">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex flex-col sm:flex-row hover:bg-slate-50 transition-colors">
                    <div className="w-full sm:w-[30%] px-6 py-3.5 bg-slate-50/50 sm:border-r border-[#E2E8F0] text-xs font-black text-slate-700 uppercase tracking-wider">
                      {spec.key}
                    </div>
                    <div className="w-full sm:w-[70%] px-6 py-3.5 text-xs font-medium text-slate-800">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.longDescEn && (
            <div id="description" className="bg-white border border-[#E2E8F0] shadow-sm overflow-hidden scroll-mt-6">
              <div className="bg-slate-900 px-6 py-4 border-b border-[#E2E8F0]">
                <h2 className="text-xs font-black uppercase tracking-wider text-white">Product Description</h2>
              </div>
              <div className="p-6 md:p-8">
                <div 
                  className="prose prose-sm max-w-none text-xs leading-relaxed text-slate-700 prose-headings:text-slate-900 prose-strong:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: product.longDescEn }} 
                />
              </div>
            </div>
          )}

          {/* Reviews load client-side */}
          <div id="reviews" className="scroll-mt-6 bg-white border border-[#E2E8F0] p-6 md:p-8 shadow-sm">
            <ReviewsSection productId={product.id} reviewCount={product.reviewCount} />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-8 scroll-mt-6">
              <div className="mb-6 border-b border-[#e2e4e8] pb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  People also buy these products
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
