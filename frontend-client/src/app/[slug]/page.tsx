import { getProductBySlug, getProducts } from '@/lib/api';
import { Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
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
    <div className="bg-[#F2F4F8] min-h-screen py-6">
      <div className="container-main">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#EF4A23] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#EF4A23] transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-400 truncate">{product.nameEn}</span>
        </div>

        <div className="bg-white p-4 md:p-8 rounded-sm shadow-sm border border-[#eee]">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-[40%]">
              <ProductImageGallery images={images} productName={product.nameEn} />
            </div>

            <div className="w-full lg:w-[60%] space-y-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[#081621] leading-tight mb-4">{product.nameEn}</h1>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="bg-[#f5f6f7] px-3 py-1.5 rounded-full text-[12px]">
                    <span className="text-gray-500">Price: </span>
                    <span className="font-bold text-[#EF4A23]">৳{(product.discountPrice || product.mainPrice).toLocaleString()}</span>
                  </div>
                  {product.discountPrice && (
                    <div className="bg-[#f5f6f7] px-3 py-1.5 rounded-full text-[12px]">
                      <span className="text-gray-500">Regular: </span>
                      <span className="font-bold text-[#081621] line-through">৳{product.mainPrice.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="bg-[#f5f6f7] px-3 py-1.5 rounded-full text-[12px]">
                    <span className="text-gray-500">Status: </span>
                    <span className={product.stockQuantity > 0 ? 'font-bold text-[#10b981]' : 'font-bold text-[#EF4A23]'}>
                      {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="bg-[#f5f6f7] px-3 py-1.5 rounded-full text-[12px]">
                    <span className="text-gray-500">SKU: </span>
                    <span className="font-bold text-[#081621]">{product.sku || 'N/A'}</span>
                  </div>
                  {product.brandName && (
                    <div className="bg-[#f5f6f7] px-3 py-1.5 rounded-full text-[12px]">
                      <span className="text-gray-500">Brand: </span>
                      <span className="font-bold text-[#081621]">{product.brandName}</span>
                    </div>
                  )}
                  {product.reviewCount > 0 && (
                    <a href="#reviews" className="bg-[#f5f6f7] px-3 py-1.5 rounded-full text-[12px] flex items-center gap-1 hover:bg-[#e2e4e6] transition-colors cursor-pointer">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-[#081621]">{product.avgRating?.toFixed(1)}</span>
                      <span className="text-gray-500">({product.reviewCount})</span>
                    </a>
                  )}
                </div>
              </div>

              {product.shortDescEn && (
                <div>
                  <h3 className="text-lg font-bold text-[#081621] mb-3">Key Features</h3>
                  <div className="text-sm text-[#333] leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: product.shortDescEn }} className="prose prose-sm max-w-none prose-ul:list-disc prose-ul:ml-4" />
                  </div>
                </div>
              )}

              {/* Premium, polished checkout widget card */}
              <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-sm shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Special Offer Price</p>
                    <div className="flex items-end gap-3">
                      <p className="text-3xl font-black text-[#EF4A23]">৳{(product.discountPrice || product.mainPrice).toLocaleString()}</p>
                      {product.discountPrice && (
                        <p className="text-base text-slate-400 line-through font-semibold mb-0.5">৳{product.mainPrice.toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {product.discountPrice && (
                    <div className="bg-[#EF4A23] text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm">
                      {Math.round(((product.mainPrice - product.discountPrice) / product.mainPrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${product.stockQuantity > 0 ? 'bg-[#10b981]' : 'bg-red-500'}`} />
                  <span className={`font-bold ${product.stockQuantity > 0 ? 'text-[#10b981]' : 'text-red-500'}`}>
                    {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} items left)` : 'Temporarily Out of Stock'}
                  </span>
                </div>

                <AddToCartButton product={product} />

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200/60 text-center text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
                  <div className="flex flex-col items-center gap-1.5 hover:text-slate-800 transition-colors">
                    <Truck size={14} className="text-orange-500" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 hover:text-slate-800 transition-colors">
                    <ShieldCheck size={14} className="text-orange-500" />
                    <span>100% Genuine</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 hover:text-slate-800 transition-colors">
                    <RefreshCw size={14} className="text-orange-500" />
                    <span>Easy Return</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom: Specs + Description + Reviews (lazy) */}
        <div className="mt-8">
          <div className="space-y-8">
            {product.specifications && product.specifications.length > 0 && (
              <div id="specification" className="bg-white rounded-sm border border-[#eee] overflow-hidden scroll-mt-6">
                <div className="bg-[#f5f6f7] px-6 py-3 border-b border-[#eee]">
                  <h2 className="text-lg font-bold text-[#081621]">Specification</h2>
                </div>
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex flex-col sm:flex-row border-b border-[#eee] last:border-0 hover:bg-[#fafafa] transition-colors">
                    <div className="w-full sm:w-[30%] px-6 py-3.5 bg-[#fbfbfc] sm:border-r border-[#eee] text-sm font-bold text-[#666]">{spec.key}</div>
                    <div className="w-full sm:w-[70%] px-6 py-3.5 text-sm text-[#333]">{spec.value}</div>
                  </div>
                ))}
              </div>
            )}

            {product.longDescEn && (
              <div id="description" className="bg-white rounded-sm border border-[#eee] overflow-hidden scroll-mt-6">
                <div className="bg-[#f5f6f7] px-6 py-3 border-b border-[#eee]">
                  <h2 className="text-lg font-bold text-[#081621]">Description</h2>
                </div>
                <div className="p-6">
                  <div className="prose prose-sm max-w-none text-sm leading-relaxed text-[#333]"
                    dangerouslySetInnerHTML={{ __html: product.longDescEn }} />
                </div>
              </div>
            )}

            {/* Reviews load client-side — doesn't block page render */}
            <div id="reviews" className="scroll-mt-6">
              <ReviewsSection productId={product.id} reviewCount={product.reviewCount} />
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="pt-12 mt-12 border-t border-[#eee] scroll-mt-6">
                <h2 className="text-lg md:text-xl font-black text-[#081621] mb-6 uppercase tracking-wider">
                  People also buy these products
                </h2>
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
    </div>
  );
}
