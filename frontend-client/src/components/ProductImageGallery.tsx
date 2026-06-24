'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

interface Props {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: Props) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div>
      <div className="aspect-square bg-white border border-slate-200 rounded-none flex items-center justify-center overflow-hidden mb-4 group select-none">
        {activeImage ? (
          <img src={activeImage} alt={productName} className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
             <ShoppingCart size={40} />
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar select-none">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActiveImage(img)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-none overflow-hidden border-2 transition-all cursor-pointer ${activeImage === img ? 'border-[#EF4A23]' : 'border-slate-200 opacity-60 hover:opacity-100'}`}>
              <img src={img} alt="" className="w-full h-full object-contain bg-white p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
