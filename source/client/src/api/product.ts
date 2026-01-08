import { PaginationSchema, Product } from "@/lib/types";
import { apiFormDataRequest, apiRequest } from "./client";

// Define the expected API response for a list of products
interface ProductsApiResponse {
  message: string;
  success: boolean;
  data: {
    products: Product[];
    pagination: PaginationSchema;
  };
}

// Define the expected API response for a single product
interface ProductApiResponse {
  message: string;
  success: boolean;
  data: Product;
}

export interface Rating {
  _id: string;
  star: number;
  comment: string;
  images?: string[];
  postedBy: {
    _id: string;
    fullName: string;
    avatar: string;
  };
  createdAt?: string; // Server không lưu timestamps cho subdocument ratingSchema nhưng product updateAt sẽ đổi
}

interface GetRatingsResponse {
  message: string;
  success: boolean;
  data: {
    ratings: Rating[];
    total: number;
    page: number;
    limit: number;
    avgStar: number;
    totalRating: number;
  };
}

interface AddRatingPayload {
  star: number;
  comment: string;
}

interface AddRatingResponse {
  message: string;
  success: boolean;
  data: {
    rating: Rating;
    totalRating: number;
    avgStar: number;
  };
}

// 2. Hàm lấy danh sách đánh giá
export async function getProductRatings(
  productId: string,
  page = 1,
  limit = 10
): Promise<GetRatingsResponse["data"]> {
  const response = await apiRequest<GetRatingsResponse>(
    "get",
    `/products/${productId}/ratings?page=${page}&limit=${limit}`
  );
  return response.data;
}

// 3. Hàm gửi đánh giá mới (Yêu cầu Token - apiRequest đã tự xử lý credentials)
export async function addProductRating(
  productId: string,
  formData: FormData
): Promise<AddRatingResponse["data"]> {
  const response = await apiFormDataRequest<AddRatingResponse>(
    "post",
    `/products/${productId}/ratings`,
    formData
  );
  return response.data;
}

export async function getProducts(
  params?: URLSearchParams
): Promise<ProductsApiResponse> {
  const endpoint = params ? `/products?${params.toString()}` : "/products";
  return apiRequest<ProductsApiResponse>("get", endpoint);
}

export async function getProductById(
  id: string | number
): Promise<ProductApiResponse> {
  return apiRequest<ProductApiResponse>("get", `/products/${id}`);
}
