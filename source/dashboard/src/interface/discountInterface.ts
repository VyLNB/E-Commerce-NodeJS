export interface CouponItem {
    _id: string;
    code: string;
    name: string;
    description: string;
    discountValue: number;
    type: string;
    usageLimitTotal: number;
    usageLimitPerCustomer: number;
    usedCount: number;
    validFrom: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

export interface PaginationInfo{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface DiscountQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  sort_by?: string;
}