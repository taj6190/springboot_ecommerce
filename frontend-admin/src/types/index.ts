// Global type definitions for the admin panel

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  email: string;
  fullName: string;
  roles: string[];
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  nameEn: string;
  nameBn?: string;
  slug: string;
  descriptionEn?: string;
  imageUrl?: string;
  parentId?: string;
  displayOrder: number;
  active: boolean;
  level: number;
  children?: Category[];
}

export interface CategoryRequest {
  nameEn: string;
  nameBn?: string;
  descriptionEn?: string;
  imageUrl?: string;
  parentId?: string;
  displayOrder?: number;
  active?: boolean;
}

// ─── Brand ───────────────────────────────────────────────────────────────────
export interface Brand {
  id: string;
  nameEn: string;
  nameBn?: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  active: boolean;
}

export interface BrandRequest {
  nameEn: string;
  nameBn?: string;
  description?: string;
  logoUrl?: string;
  active?: boolean;
}

// ─── Product ─────────────────────────────────────────────────────────────────
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProductVariant {
  id?: string;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  weight?: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  active: boolean;
  imageUrl?: string;
}

export interface ProductImage {
  id?: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isMain: boolean;
  variantId?: string;
}

export interface ProductFaq {
  id?: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  nameEn: string;
  nameBn?: string;
  shortDescEn?: string;
  shortDescBn?: string;
  longDescEn?: string;
  longDescBn?: string;
  sku: string;
  productType?: string;
  mainPrice: number;
  discountPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  status: ProductStatus;
  featured: boolean;
  trending: boolean;
  bestSeller: boolean;
  flashSaleActive: boolean;
  urlSlug: string;
  avgRating: number;
  reviewCount: number;
  wishlistCount: number;
  mainImageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
  faqs?: ProductFaq[];
  specifications?: ProductSpecification[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  nameEn: string;
  nameBn?: string;
  shortDescEn?: string;
  shortDescBn?: string;
  longDescEn?: string;
  longDescBn?: string;
  sku: string;
  productType?: string;
  mainPrice: number;
  discountPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  categoryId?: string;
  brandId?: string;
  status: ProductStatus;
  featured?: boolean;
  trending?: boolean;
  bestSeller?: boolean;
  flashSaleActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  variants?: ProductVariant[];
  faqs?: ProductFaq[];
  specifications?: ProductSpecification[];
  tags?: string[];
  images?: ProductImage[];
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
export type PaymentMethod = 'COD' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'CARD' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantInfo?: string;
}

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  changedAt: string;
  changedBy?: string;
  note?: string;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  totalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingPostalCode?: string;
  notes?: string;
  couponCode?: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  monthOrders: number;
  monthRevenue: number;
  ordersByStatus: Record<OrderStatus, number>;
  lowStockProducts: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  profileImageUrl?: string;
  enabled: boolean;
  locked: boolean;
  roles: string[];
  createdAt: string;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────
export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit: number;
  usageCount: number;
  active: boolean;
  validFrom?: string;
  validUntil?: string;
}

// ─── Slider ──────────────────────────────────────────────────────────────────
export interface Slider {
  id: string;
  titleEn: string;
  titleBn?: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
  active: boolean;
}

// ─── Homepage Section ────────────────────────────────────────────────────────
export interface HomepageSection {
  id: string;
  sectionType: string;
  titleEn?: string;
  titleBn?: string;
  displayOrder: number;
  config?: string;
  active: boolean;
}

// ─── Static Page ─────────────────────────────────────────────────────────────
export interface StaticPage {
  id: string;
  slug: string;
  titleEn: string;
  titleBn?: string;
  contentEn: string;
  contentBn?: string;
  pageType?: string;
  published: boolean;
}

// ─── Review ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment?: string;
  approved: boolean;
  createdAt: string;
}

// ─── Tag ─────────────────────────────────────────────────────────────────────
export interface Tag {
  id: string;
  name: string;
  slug?: string;
}
