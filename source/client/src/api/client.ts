import axios, { AxiosError } from "axios";

interface StandardApiResponse<T = unknown> {
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
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Gửi kèm cookie khi gửi requests
});

// Xử lý URL API tùy thuộc vào môi trường (Server hay Client)
const isServer = typeof window === "undefined";
const SERVER_HOST = isServer
  ? `http://api:${process.env.APP_PORT || 3000}/${
      process.env.NEXT_PUBLIC_API_VERSION
    }`
  : `${process.env.NEXT_PUBLIC_SERVER_HOST}:${process.env.NEXT_PUBLIC_SERVER_PORT}/${process.env.NEXT_PUBLIC_API_VERSION}`;

export async function apiRequest<T>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  payload?: unknown
): Promise<T> {
  try {
    const response = await apiClient.request<StandardApiResponse<T>>({
      method,
      url: `${SERVER_HOST}${url}`,
      data: payload,
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

export async function apiFormDataRequest<T>(
  method: "post" | "put",
  url: string,
  formData: FormData
): Promise<T> {
  try {
    const response = await apiClient.request<StandardApiResponse<T>>({
      method,
      url: `${SERVER_HOST}${url}`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
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
