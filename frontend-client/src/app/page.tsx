import ProductCard from '@/components/ProductCard';
import {
    getBrands,
    getFeaturedProducts,
    getFlashSaleProducts,
    getSliders,
    getTrendingProducts,
} from '@/lib/api';
import type { Brand, Product } from '@/types';
import { ArrowRight, ChevronRight, Headphones, RefreshCw, Shield, Truck } from 'lucide-react';
import Link from 'next/link';

async function getHomeData() {
    const [brandsRes, slidersRes, featuredRes, trendingRes, flashRes] = await Promise.allSettled([
        getBrands(),
        getSliders(),
        getFeaturedProducts(),
        getTrendingProducts(),
        getFlashSaleProducts(),
    ]);
    return {
        brands: brandsRes.status === 'fulfilled' ? (brandsRes.value.data ?? []) : [],
        sliders: slidersRes.status === 'fulfilled' ? (slidersRes.value.data ?? []) : [],
        featured: featuredRes.status === 'fulfilled' ? (featuredRes.value.data ?? []) : [],
        trending: trendingRes.status === 'fulfilled' ? (trendingRes.value.data ?? []) : [],
        flashSale: flashRes.status === 'fulfilled' ? (flashRes.value.data ?? []) : [],
    };
}

function SectionHeader({ title, href }: { title: string; href: string }) {
    return (
        <div className="flex items-center justify-between mb-0 border-b-2 border-[#EF4A23] pb-2">
            <h2 className="text-base font-bold text-[#081621] uppercase tracking-wide">{title}</h2>
            <Link
                href={href}
                className="text-xs font-semibold text-[#EF4A23] hover:underline flex items-center gap-1"
            >
                View All <ArrowRight size={13} />
            </Link>
        </div>
    );
}

// Static promo banner images (cosmetics with model — Unsplash)
const PROMO_BANNERS = [
    {
        img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
        label: 'New Arrivals',
        sub: 'Skincare Essentials',
    },
    {
        img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        label: 'Bestsellers',
        sub: 'Makeup Collection',
    },
    {
        img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
        label: 'Luxury Picks',
        sub: 'Premium Fragrances',
    },
];

// Fallback hero if no slider data
const HERO_FALLBACK =
    'https://plus.unsplash.com/premium_photo-1681490813995-ab422f7d6e3b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

export default async function HomePage() {
    const { brands, sliders, featured, trending, flashSale } = await getHomeData();
    const [hero, side1, side2] = sliders;

    return (
        <main className="bg-[#F2F4F8] min-h-screen mt-2 mb-2">

            {/* ── Hero + Sidebar + Side Banners ── */}
            <section className="container-main pt-4 pb-5">
                <div className="flex gap-4">

                    {/* LEFT: Brands Sidebar */}
                    <aside className="hidden lg:block w-[220px] flex-shrink-0">
                        <div className="bg-white border border-[#e2e4e8]">
                            <div className="bg-[#EF4A23] px-4 py-3">
                                <span className="text-white text-sm font-bold uppercase tracking-wide">Top Brands</span>
                            </div>
                            <ul className="divide-y divide-[#f0f0f0]">
                                {brands.length > 0
                                    ? brands.slice(0, 12).map((brand: Brand) => (
                                        <li key={brand.id}>
                                            <Link
                                                href={`/products?brandIds=${brand.id}`}
                                                className="flex items-center justify-between px-4 py-2.5 text-[13px] text-[#333] hover:text-[#EF4A23] hover:bg-[#fff5f3] transition-colors group"
                                            >
                                                <span className="flex items-center gap-2.5">
                                                    {brand.logoUrl ? (
                                                        <img src={brand.logoUrl} alt={brand.nameEn} className="w-5 h-5 object-contain flex-shrink-0" />
                                                    ) : (
                                                        <span className="w-5 h-5 bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400 flex-shrink-0">
                                                            {brand.nameEn.charAt(0)}
                                                        </span>
                                                    )}
                                                    {brand.nameEn}
                                                </span>
                                                <ChevronRight size={13} className="text-[#bbb] group-hover:text-[#EF4A23]" />
                                            </Link>
                                        </li>
                                    ))
                                    : Array.from({ length: 8 }).map((_, i) => (
                                        <li key={i} className="px-4 py-2.5">
                                            <div className="h-3 bg-slate-100 rounded w-3/4 animate-pulse" />
                                        </li>
                                    ))}
                            </ul>
                            {brands.length > 12 && (
                                <Link
                                    href="/products"
                                    className="flex items-center justify-center gap-1 py-2.5 text-[12px] font-semibold text-[#EF4A23] hover:bg-[#fff5f3] border-t border-[#f0f0f0]"
                                >
                                    All Brands <ArrowRight size={12} />
                                </Link>
                            )}
                        </div>
                    </aside>

                    {/* CENTER: Main Hero Slider */}
                    <div className="flex-1 relative h-[340px] md:h-[420px] overflow-hidden bg-slate-200 group">
                        <img
                            src={hero?.imageUrl || HERO_FALLBACK}
                            alt="Hero Banner"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                        <div className="absolute bottom-10 left-10 z-10">
                            <p className="text-[#EF4A23] text-xs font-bold uppercase tracking-widest mb-2">
                                {hero?.titleEn || 'New Season Collection'}
                            </p>
                            <h1 className="text-white text-3xl font-black leading-tight max-w-xs mb-5">
                                Discover Your Beauty Ritual
                            </h1>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 bg-[#EF4A23] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#d43d1a] transition-colors"
                            >
                                Shop Now <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT: Two Side Banners */}
                    <div className="hidden lg:flex flex-col gap-4 w-[200px] flex-shrink-0">
                        {[side1, side2].map((s, i) => {
                            const fallback =
                                i === 0
                                    ? 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80'
                                    : 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80';
                            return (
                                <Link
                                    key={i}
                                    href="/products"
                                    className="flex-1 relative overflow-hidden bg-slate-300 group block"
                                >
                                    <img
                                        src={s?.imageUrl || fallback}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 z-10">
                                        <p className="text-white text-[11px] font-black uppercase tracking-widest">
                                            {s?.titleEn || (i === 0 ? 'Flash Sale' : 'New In')}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Service Feature Bar ── */}
            <section className="container-main mb-5">
                <div className="bg-white border border-[#e2e4e8] grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e2e4e8]">
                    {[
                        { Icon: Truck, title: 'Free Shipping', sub: 'On orders over ৳999' },
                        { Icon: RefreshCw, title: 'Easy Returns', sub: '7-day return policy' },
                        { Icon: Shield, title: 'Secure Payment', sub: 'SSL protected' },
                        { Icon: Headphones, title: '24/7 Support', sub: 'Dedicated helpline' },
                    ].map(({ Icon, title, sub }) => (
                        <div key={title} className="flex items-center gap-3 px-5 py-4">
                            <Icon size={22} className="text-[#EF4A23] flex-shrink-0" />
                            <div>
                                <p className="text-[12px] font-bold text-[#081621] leading-tight">{title}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Promo Banners (3-col) ── */}
            <section className="container-main mb-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PROMO_BANNERS.map((b) => (
                        <Link
                            key={b.label}
                            href="/products"
                            className="relative h-[180px] overflow-hidden group block bg-slate-200"
                        >
                            <img
                                src={b.img}
                                alt={b.label}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                            <div className="absolute bottom-4 left-4 z-10">
                                <p className="text-[10px] text-[#EF4A23] font-black uppercase tracking-widest">{b.sub}</p>
                                <p className="text-white text-sm font-black mt-0.5">{b.label}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Featured Products ── */}
            {featured.length > 0 && (
                <section className="container-main mb-12">
                    <SectionHeader title="Featured Products" href="/products" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                        {featured.slice(0, 10).map((p: Product) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Flash Sale ── */}
            {flashSale.length > 0 && (
                <section className="container-main mb-12">
                    <SectionHeader title="🔥 Flash Sale" href="/products" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                        {flashSale.slice(0, 5).map((p: Product) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Fresh Arrivals ── */}
            {trending.length > 0 && (
                <section className="container-main mb-16">
                    <SectionHeader title="Fresh Arrivals" href="/products" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                        {trending.slice(0, 10).map((p: Product) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

        </main>
    );
}
