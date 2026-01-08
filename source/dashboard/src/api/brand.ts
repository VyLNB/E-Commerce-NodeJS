import { apiFormRequest, apiRequest } from "./admin";
import type {
  PaginationInfo,
  BrandItem,
  BrandQueryParams,
} from "../interface/brandInterface";

export interface BrandListResponse {
  data: {
    brands: BrandItem[];
    pagination: PaginationInfo;
  };
  error: boolean;
  message: string;
  success: boolean;
  timestamp: Date;
}

export async function getBrands(
  params: BrandQueryParams = {}
): Promise<BrandListResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.q) queryParams.append("q", params.q);
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);

  const queryString = queryParams.toString();
  const url = `/admin/brands${queryString ? `?${queryString}` : ""}`;

  return await apiRequest<BrandListResponse>("get", url);
}

interface BrandAPIResponse {
  message: string;
  success: boolean;
  data: BrandItem;
}

export async function getBrandById(
  id: string | number
): Promise<BrandAPIResponse> {
  return apiRequest<BrandAPIResponse>("get", `/admin/brands/${id}`);
}

export async function deleteBrand(brandID: string): Promise<BrandListResponse> {
  return await apiRequest<BrandListResponse>(
    "delete",
    `/admin/brands/${brandID}`
  );
}

// Tạo thương hiệu mới
export async function createBrand(formData: FormData): Promise<BrandItem> {
  return await apiFormRequest<BrandItem>("post", "/admin/brands", formData);
}

// Cập nhật thuơng hiệu
export async function updateBrand(
  id: string,
  formData: FormData
): Promise<BrandItem> {
  return await apiFormRequest<BrandItem>(
    "put",
    `/admin/brands/${id}`,
    formData
  );
}
