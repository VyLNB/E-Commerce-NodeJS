import type { Order, OrdersQueryParams } from "../interface/orderInterface";
import type { PaginationInfo } from "../interface/usersInterface";
import { apiRequest } from "./admin";

export interface OrderResponseData {
    orders: Order[];
    meta: PaginationInfo;
}

export interface OrderResponse {
    success: boolean;
    message: string;
    data: OrderResponseData;
    timestamp: Date;
}

export async function getOrders(
  params: OrdersQueryParams = {}
): Promise<OrderResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.q) queryParams.append("q", params.q);
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);

  const queryString = queryParams.toString();
  const url = `/admin/orders${queryString ? `?${queryString}` : ""}`;

  return await apiRequest<OrderResponse>("get", url);
}

export async function updateOrderStatus(id: string,status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"): Promise<OrderResponse> {
  return apiRequest<OrderResponse>("put", `/admin/orders/${id}/status`, { status });
}