export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  sort_by?: string;
  category_id?: string;
  brand_id?: string;
}

export interface ProductVariant {
  _id?: string;
  sku: string;
  variantName: string; // Tên phiên bản, vd: "Đỏ / L"
  priceAdjustment: number; // Điều chỉnh giá (so với giá gốc)
  attributes: Record<string, string>; // { "Màu sắc": "Đỏ", "Kích thước": "L" }
  stock: number;
  images: string[];
  specifications: Record<string, string>; // vd: { "Màu sắc": "Đỏ", "Kích thước": "L" }
  status: string;
}

/**
 * vd: { name: "Màu sắc", values: ["Đỏ", "Xanh"] }
 */
export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductItem {
  _id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  totalStock: number;
  specifications: Record<string, string>;
  attributes: Record<string, string>;
  status: string;
  totalRating: number;
  createdAt: string;
  updatedAt: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  variants: ProductVariant[];
  variantOptions: string[];
}
