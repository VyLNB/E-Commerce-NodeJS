export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  imageUrl?: string;
  isActive: boolean;
  parentCategoryId?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  sort_by?: string;
}
