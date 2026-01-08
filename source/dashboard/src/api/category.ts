import type {
  CategoryItem,
  PaginationInfo,
  CategoryQueryParams,
} from "../interface/categoryInterface";
import { apiFormRequest, apiRequest } from "./admin";

export interface CategoryResponse {
  data: {
    categories: CategoryItem[];
    pagination: PaginationInfo;
  };
  success: boolean;
  message: string;
}

export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}

export async function getCategory(
  params: CategoryQueryParams = {}
): Promise<CategoryResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.q) queryParams.append("q", params.q);
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);

  const queryString = queryParams.toString();
  const url = `/admin/categories${queryString ? `?${queryString}` : ""}`;

  return await apiRequest<CategoryResponse>("get", url);
}

interface CategoryAPIResponse {
  message: string;
  success: boolean;
  data: CategoryItem;
}

export async function getCategoryById(
  id: string | number
): Promise<CategoryAPIResponse> {
  return apiRequest<CategoryAPIResponse>("get", `/admin/categories/${id}`);
}

export async function deleteCategory(
  categoryID: string
): Promise<CategoryResponse> {
  return await apiRequest<CategoryResponse>(
    "delete",
    `/admin/categories/${categoryID}`
  );
}

// Tạo danh mục mới
export async function createCategory(
  formData: FormData
): Promise<CategoryItem> {
  return await apiFormRequest<CategoryItem>(
    "post",
    "/admin/categories",
    formData
  );
}

// Cập nhật danh mục
export async function updateCategory(
  id: string,
  formData: FormData
): Promise<CategoryItem> {
  return await apiFormRequest<CategoryItem>(
    "put",
    `/admin/categories/${id}`,
    formData
  );
}
