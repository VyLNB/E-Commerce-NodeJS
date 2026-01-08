import axios, { AxiosError } from "axios";

export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  error?: {
    stack?: string;
    statusCode: number;
  };
  timestamp: Date;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // cookies
});

// debug
// hàm dùng sau khi login mock thành công
export function setAuthToken(token: string) {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export async function apiRequest<T>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  payload?: unknown
): Promise<T> {
  try {
    const response = await apiClient.request<StandardApiResponse<T>>({
      method,
      url: url,
      data: payload,
    });

    const responseData = response.data;

    if (responseData.success) {
      return responseData as T;
    }

    // Ngược lại sẽ throw error message từ chính response đó
    throw new Error(
      responseData?.message || "Đã xảy ra lỗi không xác định từ máy chủ."
    );
  } catch (err) {
    // Trường hợp khác errors cần can thiệp sâu hơn ở server
    if (axios.isAxiosError(err)) {
      const serverError = (err as AxiosError<StandardApiResponse>).response
        ?.data;

      if (serverError) {
        throw new Error(serverError.message);
      }

      throw new Error(
        err.message || "Lỗi kết nối mạng hoặc máy chủ không phản hồi."
      );
    }
    throw err;
  }
}

// Dành cho upload form-data
export async function apiFormRequest<T>(
  method: "post" | "put",
  url: string,
  formData: FormData
): Promise<T> {
  try {
    const response = await apiClient.request<StandardApiResponse<T>>({
      method,
      url: url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data", // Quan trọng: set là multipart
      },
    });

    const responseData = response.data;

    if (responseData.success) {
      return responseData as T;
    }

    throw new Error(
      responseData?.message || "Đã xảy ra lỗi không xác định từ máy chủ."
    );
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const serverError = (err as AxiosError<StandardApiResponse>).response
        ?.data;
      if (serverError) {
        throw new Error(serverError.message);
      }
      throw new Error(
        err.message || "Lỗi kết nối mạng hoặc máy chủ không phản hồi."
      );
    }
    throw err;
  }
}
