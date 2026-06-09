'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import type { Review } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function ReviewsSection({ productId, reviewCount }: { productId: string; reviewCount: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (reviewCount === 0) { setLoaded(true); return; }
    fetch(`${API}/public/products/${productId}/reviews?page=0&size=10`)
      .then(r => r.json())
      .then(d => { setReviews(d.data?.content ?? []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [productId, reviewCount]);

  if (reviewCount === 0) return null;

  return (
    <div className="bg-white rounded-sm border border-[#eee] overflow-hidden">
      <div className="bg-[#f5f6f7] px-6 py-3 border-b border-[#eee]">
        <h2 className="text-lg font-bold text-[#081621]">Reviews ({reviewCount})</h2>
      </div>
      <div className="p-6 space-y-4">
        {!loaded ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2"><div className="skeleton h-4 w-32" /><div className="skeleton h-3 w-full" /></div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          reviews.map(rev => (
            <div key={rev.id} className="border-b border-[#eee] last:border-0 pb-4 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-[#081621]">{rev.userName}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-[11px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
              {rev.comment && <p className="text-sm text-[#555]">{rev.comment}</p>}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
