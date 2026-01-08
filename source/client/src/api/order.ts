import { apiRequest } from "./client";
import { Address } from "@/lib/types";

interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface OrderSubmissionPayload {
  items: OrderItem[];
  shippingAddress: Pick<
    Address,
    "recipientName" | "phone" | "city" | "district" | "ward" | "street"
  >;
  paymentMethod: string; // e.g., "Cash on Delivery", "Bank"
  discountCode?: string;
  notes?: string;
}

interface OrderCreationResponse {
  jobId: string;
  message: string; // "Order is being processed"
  orderNumber: "PENDING" | string;
}

interface OrderApiResponse {
  message: string;
  success: boolean;
  data: OrderCreationResponse;
}

export interface OrderProduct {
  productId: {
    _id: string;
    name: string;
    images: string[];
  };
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: string; // "Pending", "Confirmed", etc.
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  shippingAddress: Address;
  paymentDetails: {
    method: string;
    paidAt?: string;
    transactionId?: string;
  };
  items: OrderProduct[];
  createdAt: string;
  updatedAt: string;
}

interface GetOrdersApiResponse {
  message: string;
  success: boolean;
  data: {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function createOrder(
  payload: OrderSubmissionPayload
): Promise<OrderCreationResponse> {
  const response = await apiRequest<OrderApiResponse>(
    "post",
    "/orders",
    payload
  );
  return response.data;
}

export async function getMyOrders(
  page = 1,
  limit = 10
): Promise<GetOrdersApiResponse["data"]> {
  const response = await apiRequest<GetOrdersApiResponse>(
    "get",
    `/orders?page=${page}&limit=${limit}`
  );
  return response.data;
}
