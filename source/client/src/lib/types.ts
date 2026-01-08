export interface Variant {
  _id: string;
  sku: string;
  variantName: string;
  priceAdjustment: number;
  stock: number;
  images: string[];
  specifications?: Record<string, string>;
  attributes?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export type CartItem = {
  id: string; // SẼ SỬ DỤNG VARIANT ID (hoặc SKU) làm ID
  name: string;
  productId: string;
  description: string;
  code: string;
  price: number; // Giá cuối cùng của biến thể
  quantity: number;
  imageUrl: string;
  imageAlt: string;
};

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface Product {
  _id: string;
  name: string;
  images: string[]; // Ảnh chung của sản phẩm
  price: number; // Giá cơ sở (base price)
  effectivePrice?: number;
  description?: string;
  totalRating: number;
  variants: Variant[];
  totalStock?: number; // Tổng tồn kho
  displayPrice?: number; // Giá thấp nhất để hiển thị
  specifications?: Record<string, string>;
  attributes?: Record<string, string>;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface PaginationSchema {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}

export interface UserAuth {
  _id: string | null;
  email: string | null;
  fullName: string | null;
  avatar: string | null;
  loyaltyPoints: number | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface Address {
  _id: number;
  recipientName: string;
  email?: string;
  phone: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
