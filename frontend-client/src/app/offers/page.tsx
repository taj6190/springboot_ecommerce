import ProductCard from '@/components/ProductCard';
import { getFlashSaleProducts } from '@/lib/api';
import type { Product } from '@/types';
import { ArrowRight, Clock, Flame, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Flash Deals | Nexora',
  description: 'Grab the hottest deals before time runs out! Limited-time flash sale offers on premium products.',
};

export default async function OffersPage() {
  let flashProducts: Product[] = [];

  try {
    const res = await getFlashSaleProducts();
    flashProducts = res.data ?? [];
  } catch {
    flashProducts = [];
  }

  return (
    <div className="bg-[#F2F4F8] min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #EF4A23 0%, transparent 50%), radial-gradient(circle at 80% 50%, #EF4A23 0%, transparent 50%)',
          }} />
        </div>

        {/* Animated dots */}
        <div className="absolute top-6 left-[10%] w-2 h-2 bg-orange-500/40 animate-pulse" />
        <div className="absolute top-12 right-[20%] w-1.5 h-1.5 bg-yellow-400/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-10 left-[30%] w-1 h-1 bg-orange-400/40 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-6 right-[15%] w-2.5 h-2.5 bg-red-500/30 animate-pulse" style={{ animationDelay: '1.5s' }} />

        <div className="container-main relative z-10 py-12 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 mb-5 border border-white/10">
            <Flame size={14} className="text-orange-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-orange-400">
              Limited Time Only
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Flash <span className="text-[#EF4A23]">Deals</span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-lg mx-auto mb-8">
            Unbeatable prices on premium products. Don&apos;t miss out — these deals won&apos;t last long!
          </p>

          <div className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-sm px-8 py-4 border border-white/10">
            <div className="flex items-center gap-2 text-white">
              <Zap size={18} className="text-yellow-400" />
              <span className="text-sm font-bold">Live Now</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={16} />
              <span className="text-sm font-semibold">While stocks last</span>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Products */}
      <section className="container-main py-10">
        {flashProducts.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-0 border-b-2 border-[#EF4A23] pb-2">
              <h2 className="text-base font-bold text-[#081621] uppercase tracking-wide flex items-center gap-2">
                <Flame size={16} className="text-[#EF4A23]" /> Flash Sale Products
              </h2>
              <span className="text-xs font-bold text-gray-400">{flashProducts.length} product{flashProducts.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
              {flashProducts.map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Clock size={32} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-black text-[#081621] mb-2">No Active Flash Deals</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
              There are no flash sale products right now. Check back soon — new deals drop regularly!
            </p>
            <Link href="/products" className="btn btn-accent">
              Browse All Products <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      {flashProducts.length > 0 && (
        <section className="container-main pb-12">
          <div className="bg-[#081621] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#EF4A23] mb-2">
                Can&apos;t find what you&apos;re looking for?
              </p>
              <h3 className="text-xl md:text-2xl font-black text-white">
                Explore our full collection
              </h3>
            </div>
            <Link href="/products" className="btn btn-accent flex-shrink-0">
              Shop All Products <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
