export interface BrandItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface BrandQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  sort_by?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}
