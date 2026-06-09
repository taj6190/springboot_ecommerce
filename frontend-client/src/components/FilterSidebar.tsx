'use client';

import { Category, Brand } from '@/types';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
}

export default function FilterSidebar({ categories, brands }: FilterSidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Accordion states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    category: true,
    brand: true
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Price Range states
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '0');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '442000');

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '0');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* ── Price Range ── */}
      <FilterSection 
        title="Price Range" 
        isOpen={openSections.price} 
        onToggle={() => toggleSection('price')}
      >
        <div className="px-4 py-6">
          <div className="relative h-1.5 bg-slate-100 rounded-full mb-8">
            <div className="absolute inset-0 bg-orange-500 rounded-full" style={{ left: '0%', right: '20%' }} />
            <div className="absolute left-[0%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-orange-500 rounded-full cursor-pointer shadow-sm" />
            <div className="absolute left-[80%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-orange-500 rounded-full cursor-pointer shadow-sm" />
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="text" 
              value={minPrice} 
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={() => updateFilters('minPrice', minPrice)}
              className="w-full h-10 border border-slate-200 rounded text-center text-sm focus:border-orange-500 outline-none" 
            />
            <input 
              type="text" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={() => updateFilters('maxPrice', maxPrice)}
              className="w-full h-10 border border-slate-200 rounded text-center text-sm focus:border-orange-500 outline-none" 
            />
          </div>
        </div>
      </FilterSection>

      {/* ── Categories ── */}
      <FilterSection 
        title="Category" 
        isOpen={openSections.category} 
        onToggle={() => toggleSection('category')}
      >
        <div className="py-2 px-4 flex flex-col gap-2.5 max-h-[300px] overflow-y-auto no-scrollbar">
           {categories.map(cat => (
             <CategoryCheckbox 
               key={cat.id} 
               cat={cat} 
               selectedIds={searchParams.get('categoryIds')?.split(',') || searchParams.get('categoryId')?.split(',') || []} 
               onToggle={(id) => {
                 const categoryIdParam = searchParams.get('categoryId');
                 const categoryIdsParam = searchParams.get('categoryIds');
                 const current = categoryIdsParam?.split(',').filter(Boolean) || categoryIdParam?.split(',').filter(Boolean) || [];
                 const next = current.includes(id) 
                   ? current.filter(x => x !== id) 
                   : [...current, id];
                 
                 const params = new URLSearchParams(searchParams.toString());
                 params.delete('categoryId');
                 if (next.length > 0) {
                   params.set('categoryIds', next.join(','));
                 } else {
                   params.delete('categoryIds');
                 }
                 params.set('page', '0');
                 router.push(`/products?${params.toString()}`);
               }}
             />
           ))}
        </div>
      </FilterSection>

      {/* ── Brands ── */}
      <FilterSection 
        title="Brand" 
        isOpen={openSections.brand} 
        onToggle={() => toggleSection('brand')}
      >
        <div className="p-4 flex flex-col gap-2.5 max-h-[250px] overflow-y-auto no-scrollbar">
          {brands.map(brand => (
            <Checkbox 
              key={brand.id} 
              label={brand.nameEn} 
              checked={searchParams.get('brandIds')?.split(',').includes(brand.id)}
              onChange={() => {
                const current = searchParams.get('brandIds')?.split(',').filter(Boolean) || [];
                const next = current.includes(brand.id) 
                  ? current.filter(x => x !== brand.id) 
                  : [...current, brand.id];
                updateFilters('brandIds', next.join(','));
              }}
            />
          ))}
        </div>
      </FilterSection>

    </div>
  );
}

function FilterSection({ title, children, isOpen, onToggle }: { title: string, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full px-4 py-3.5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="text-[14px] font-bold text-[#081621]">{title}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] border-t border-slate-100' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  );
}

function Checkbox({ label, checked = false, onChange, count }: { label: string, checked?: boolean, onChange?: () => void, count?: number }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className={`w-4.5 h-4.5 border-2 rounded flex items-center justify-center transition-all ${checked ? 'bg-orange-500 border-orange-500' : 'border-slate-200 group-hover:border-orange-500'}`}>
        {checked && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <span className="text-[13px] text-slate-600 group-hover:text-orange-500 transition-colors flex-1">{label}</span>
      {count !== undefined && <span className="text-[11px] text-slate-300 font-medium">{count}</span>}
    </label>
  );
}

function CategoryCheckbox({ cat, selectedIds, onToggle, depth = 0 }: { cat: Category, selectedIds: string[], onToggle: (id: string) => void, depth?: number }) {
  const isSelected = selectedIds.includes(cat.id);
  return (
    <>
      <Checkbox 
        label={cat.nameEn} 
        checked={isSelected} 
        onChange={() => onToggle(cat.id)}
      />
      {cat.children && cat.children.map(child => (
        <div key={child.id} className="ml-4 flex flex-col gap-2.5 mt-2.5 mb-1">
          <CategoryCheckbox cat={child} selectedIds={selectedIds} onToggle={onToggle} depth={depth + 1} />
        </div>
      ))}
    </>
  );
}
