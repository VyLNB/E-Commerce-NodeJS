import { apiFormRequest, apiRequest, type StandardApiResponse } from "./admin";
import type {
  PaginationInfo,
  ProductItem,
  ProductQueryParams,
} from "../interface/productInterface";

export interface ProductListResponse {
  data: {
    products: ProductItem[];
    pagination: PaginationInfo;
  };
  error: boolean;
  message: string;
  success: boolean;
  timestamp: Date;
}

interface ProductApiResponse {
  message: string;
  success: boolean;
  data: ProductItem;
}

interface UploadResponse {
  imagePaths: string[];
}

export async function uploadProductImages(
  formData: FormData
): Promise<StandardApiResponse<UploadResponse>> {
  return apiFormRequest<StandardApiResponse<UploadResponse>>(
    "post",
    "/admin/products/upload-images",
    formData
  );
}

export async function getProducts(
  params: URLSearchParams | Record<string, any> = {}
): Promise<ProductListResponse> {
  let queryString = "";

  if (params instanceof URLSearchParams) {
    queryString = params.toString();
  } else {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value.toString());
      }
    });
    queryString = query.toString();
  }

  const url = `/admin/products${queryString ? `?${queryString}` : ""}`;

  return await apiRequest<ProductListResponse>("get", url);
}

export async function getProductById(
  id: string | number
): Promise<ProductApiResponse> {
  return apiRequest<ProductApiResponse>("get", `/admin/products/${id}`);
}

// Tạo sản phẩm mới
export async function createProduct(
  formData: FormData
): Promise<ProductApiResponse> {
  return await apiFormRequest<ProductApiResponse>(
    "post",
    `/admin/products`,
    formData
  );
}

// Cập nhật sản phẩm
export async function updateProduct(
  id: string,
  formData: FormData
): Promise<ProductApiResponse> {
  return await apiFormRequest<ProductApiResponse>(
    "put",
    `/admin/products/${id}`,
    formData
  );
}

// Xóa sản phẩm
export async function deleteProduct(id: string): Promise<void> {
  return await apiRequest<void>("delete", `/admin/products/${id}`);
}
