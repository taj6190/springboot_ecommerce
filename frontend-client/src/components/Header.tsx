'use client';

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import type { Category, Product } from '@/types';
import { 
  ChevronDown, 
  Loader2, 
  LogOut, 
  Menu, 
  Search, 
  ShoppingCart, 
  User, 
  X,
  ArrowRight,
  PhoneCall,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface Props {
  categories: Category[];
}

function MobileCategory({ cat, onSelect }: { cat: Category; onSelect: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = cat.children && cat.children.length > 0;

  return (
    <div className="border-b border-slate-50 last:border-0">
      <div className="flex items-center">
        <Link
          href={`/products?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.nameEn)}`}
          onClick={onSelect}
          className="flex-1 p-3 font-semibold text-slate-700 hover:text-orange-500 transition-all"
        >
          {cat.nameEn}
        </Link>
        {hasChildren && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-3 text-slate-400 hover:text-orange-500 transition-all"
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="bg-slate-50 pl-4 animate-fade-in">
          {cat.children!.map((child) => (
            <MobileCategory key={child.id} cat={child} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header({ categories }: Props) {
  const router = useRouter();
  const { count, openCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        try {
          const r = await fetch(`${API}/public/products/search?keyword=${encodeURIComponent(searchQuery)}&size=6`);
          if (r.ok) {
            const contentType = r.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const d = await r.json();
              setSearchResults(d.data?.content ?? []);
            }
          }
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setShowSearch(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* ── Top Info Bar (Compact) ── */}
      <div className="bg-slate-900 text-white py-1.5 hidden md:block">
        <div className="container-main flex justify-between items-center text-[11px] font-semibold tracking-wider uppercase">
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-1.5 text-slate-400">
              <PhoneCall size={12} className="text-orange-500" /> +880 1700 000000
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <MapPin size={12} className="text-orange-500" /> Gulshan-1, Dhaka
            </span>
          </div>
          <div className="flex gap-5">
            <Link href="/track-order" className="hover:text-orange-500 transition-colors">Track Order</Link>
            <Link href="/offers" className="hover:text-orange-500 transition-colors text-orange-500">Flash Deals</Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        
        {/* ── Main Nav ── */}
        <div className="container-main h-16 md:h-20 flex items-center gap-4 md:gap-8">
          
          {/* Mobile Menu Trigger */}
          <button 
            className="md:hidden p-2 -ml-2 text-slate-600"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4H10L14 14V4H18V20H14L10 10V20H6V4Z" fill="white" />
              </svg>
            </div>
            <span className="text-slate-900 text-lg md:text-xl font-black tracking-tight leading-none">
              Nex<span className="text-orange-500">ora</span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative group">
              <input
                type="text"
                placeholder="Search premium products..."
                className="w-full h-11 pl-11 pr-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-orange-500/30 focus:shadow-xl focus:shadow-slate-200/50 transition-all text-sm font-medium"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
            </form>

            {/* Desktop Search Dropdown */}
            {showSearch && searchQuery.trim().length > 2 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 shadow-2xl overflow-hidden animate-fade-up z-50">
                {isSearching ? (
                  <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={24} /></div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="p-2">
                      {searchResults.map(p => (
                        <Link key={p.id} href={`/${p.urlSlug}`} onClick={() => setShowSearch(false)} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 transition-all group/item">
                          <div className="w-10 h-10 border border-slate-100 flex items-center justify-center p-1 bg-white shrink-0">
                            <img src={p.mainImageUrl || ''} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate group-hover/item:text-orange-500 transition-colors">{p.nameEn}</p>
                            <p className="text-xs text-orange-500 font-black mt-0.5">৳{(p.discountPrice || p.mainPrice).toLocaleString()}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <button onClick={() => handleSearchSubmit()} className="w-full py-3 bg-slate-50 text-[11px] font-black uppercase text-orange-500 hover:bg-orange-50 transition-colors tracking-widest flex items-center justify-center gap-1.5 border-t border-slate-100">
                      View All Results <ArrowRight size={12} />
                    </button>
                  </>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm font-medium">No matches found.</div>
                )}
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-1 md:gap-3 ml-auto">
            {/* Mobile Search Trigger */}
            <button className="md:hidden p-2 text-slate-600"><Search size={22} /></button>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/account" className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all">
                  <div className="w-6 h-6 bg-orange-500 flex items-center justify-center border-2 border-white shadow-sm">
                    <User size={12} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{user?.fullName?.split(' ')[0]}</span>
                </Link>
                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:text-orange-500 transition-colors">
                <User size={18} /> Login
              </Link>
            )}

            <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block" />

            <button 
              onClick={openCart}
              className="relative p-2 md:p-3 text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-all"
            >
              <ShoppingCart size={22} />
              {mounted && count() > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                  {count()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Desktop Category Nav ── */}
        <nav className="hidden md:block border-t border-slate-50">
          <div className="container-main flex items-center gap-2">
            <Link href="/products" className="flex-shrink-0 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-orange-500 border-b-2 border-transparent hover:border-orange-500 transition-all">
              Shop All
            </Link>
            {categories.slice(0, 10).map(cat => (
              <div key={cat.id} className="relative group">
                <Link 
                  href={`/products?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.nameEn)}`}
                  className="flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold text-slate-600 hover:text-orange-500 border-b-2 border-transparent group-hover:border-orange-500 transition-all whitespace-nowrap"
                >
                  {cat.nameEn}
                  {cat.children && cat.children.length > 0 && <ChevronDown size={14} className="text-slate-300 group-hover:rotate-180 transition-transform" />}
                </Link>
                
                {/* Mega Dropdown Placeholder / Submenu */}
                {cat.children && cat.children.length > 0 && (
                  <div className="absolute top-full left-0 min-w-[220px] bg-white border border-slate-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 p-2 z-50">
                    {cat.children.map(sub => (
                      <div key={sub.id} className="group/sub relative">
                        <Link 
                          href={`/products?categoryId=${sub.id}&categoryName=${encodeURIComponent(sub.nameEn)}`} 
                          className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-all"
                        >
                          {sub.nameEn}
                          {sub.children && sub.children.length > 0 && <ChevronDown size={12} className="-rotate-90 text-slate-300" />}
                        </Link>
                        
                        {/* Sub-sub categories (Level 2) */}
                        {sub.children && sub.children.length > 0 && (
                          <div className="absolute left-full top-0 min-w-[200px] bg-white border border-slate-100 shadow-xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible translate-x-1 group-hover/sub:translate-x-0 transition-all p-1 z-50">
                            {sub.children.map(ss => (
                              <Link 
                                key={ss.id} 
                                href={`/products?categoryId=${ss.id}&categoryName=${encodeURIComponent(ss.nameEn)}`}
                                className="block px-4 py-2 text-xs font-medium text-slate-500 hover:text-orange-500 hover:bg-slate-50 transition-all"
                              >
                                {ss.nameEn}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </header>

      {/* ── Mobile Off-canvas Drawer ── */}
      <div 
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        
        <div 
          className={`absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl transition-transform duration-300 ease-out transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <span className="text-lg font-black tracking-tight">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
          </div>

          {/* Drawer Content */}
          <div className="overflow-y-auto h-full pb-20">
            <div className="p-5">
               {isAuthenticated ? (
                 <div className="flex items-center gap-3 p-4 bg-slate-50 mb-6">
                    <div className="w-10 h-10 bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">
                      {user?.fullName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{user?.fullName}</p>
                      <button onClick={logout} className="text-xs font-bold text-red-500">Sign Out</button>
                    </div>
                 </div>
               ) : (
                 <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 p-4 bg-slate-900 text-white font-black text-sm mb-6 shadow-xl shadow-slate-900/20">
                   <User size={18} /> Sign In / Register
                 </Link>
               )}

               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Categories</p>
                    <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-3 font-semibold text-orange-500 bg-orange-50">
                    <span>Shop All Products</span>
                    <ArrowRight size={16} />
                 </Link>
                 {categories.map(cat => (
                   <MobileCategory 
                     key={cat.id} 
                     cat={cat} 
                     onSelect={() => setMobileMenuOpen(false)} 
                   />
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
