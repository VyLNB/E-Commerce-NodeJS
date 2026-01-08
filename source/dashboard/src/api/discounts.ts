import { apiRequest } from "./admin";
import type { CouponItem, DiscountQueryParams, PaginationInfo } from "../interface/discountInterface";

// Sửa interface để khớp với StandardApiResponse
export interface DiscountResponseData {
    items: CouponItem[];
    meta: PaginationInfo;
}

export interface DiscountResponse {
    success: boolean;
    data: DiscountResponseData;  
    message: string;
    timestamp: Date;
}

export async function getCoupons(
  params: DiscountQueryParams = {}
): Promise<DiscountResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.q) queryParams.append("q", params.q);
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);

  const queryString = queryParams.toString();
  const url = `/admin/discounts${queryString ? `?${queryString}` : ""}`;

  return await apiRequest<DiscountResponse>("get", url);
}


// Tạo mã giảm giá mới
export async function createDiscount(data: any): Promise<CouponItem> {
  return await apiRequest<CouponItem>("post", "/admin/discounts", data);
}

interface DiscountAPIResponse {
  message: string;
  success: boolean;
  data: CouponItem;
}

export async function getDiscountById(
  id: string | number
): Promise<DiscountAPIResponse> {
  return apiRequest<DiscountAPIResponse>("get", `/admin/discounts/${id}`);
}

export async function disableDiscount(id: string | number): Promise<DiscountAPIResponse> {
  return await apiRequest<DiscountAPIResponse>(
    "get",
    `/admin/discounts/${id}/disable`
  );
}
