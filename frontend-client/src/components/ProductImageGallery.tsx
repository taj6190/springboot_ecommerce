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
      <div className="aspect-square bg-white border border-[#eee] rounded-sm flex items-center justify-center overflow-hidden mb-4">
        {activeImage ? (
          <img src={activeImage} alt={productName} className="w-full h-full object-contain p-4 transition-all duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
             <ShoppingCart size={48} />
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActiveImage(img)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-sm overflow-hidden border transition-all ${activeImage === img ? 'border-[#EF4A23]' : 'border-[#eee] opacity-70 hover:opacity-100'}`}>
              <img src={img} alt="" className="w-full h-full object-contain bg-white p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
