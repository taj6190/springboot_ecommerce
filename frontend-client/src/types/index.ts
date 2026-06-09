/* ── Types matching Spring Boot backend DTOs ─────────────────────── */

export interface Category {
  id: string;
  nameEn: string;
  nameBn?: string;
  slug: string;
  imageUrl?: string;
  parentId?: string;
  children?: Category[];
  level: number;
  active: boolean;
}

export interface Brand {
  id: string;
  nameEn: string;
  slug: string;
  logoUrl?: string;
}

export interface Product {
  brand: any;
  id: string;
  nameEn: string;
  nameBn?: string;
  shortDescEn?: string;
  sku: string;
  urlSlug: string;
  mainPrice: number;
  discountPrice?: number;
  stockQuantity: number;
  status: string;
  featured: boolean;
  trending: boolean;
  bestSeller: boolean;
  flashSaleActive: boolean;
  mainImageUrl?: string;
  avgRating: number;
  reviewCount: number;
  categoryId?: string;
  categoryName?: string;
  brandName?: string;
}

export interface ProductDetail extends Product {
  longDescEn?: string;
  longDescBn?: string;
  shortDescBn?: string;
  costPrice?: number;
  images?: { id: string; imageUrl: string; isMain: boolean }[];
  variants?: ProductVariant[];
  faqs?: { question: string; answer: string }[];
  specifications?: { key: string; value: string }[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  active: boolean;
}

export interface Slider {
  id: string;
  titleEn: string;
  titleBn?: string;
  imageUrl: string;
  linkUrl?: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  sku: string;
  variantLabel?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  productName?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
