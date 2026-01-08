import type { PaginationInfo, UserItem, UsersQueryParams } from "../interface/usersInterface.ts";
import { apiRequest } from "./admin.ts";

// Response cho danh sách users
export interface UsersResponseData {
  users: UserItem[];
  meta: PaginationInfo;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: UsersResponseData;
  timestamp: Date;
}

// Response cho single user (CHÚ Ý: data là UserItem, không phải UsersResponseData)
export interface SingleUserResponse {
  success: boolean;
  message: string;
  data: UserItem;
  timestamp: Date;
}

// Lấy danh sách người dùng
export async function getUsers(
  params: UsersQueryParams = {}
): Promise<UsersResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.q) queryParams.append("q", params.q);
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);

  const queryString = queryParams.toString();
  const url = `/admin/users${queryString ? `?${queryString}` : ""}`;

  return await apiRequest<UsersResponse>("get", url);
}

// Lấy thông tin chi tiết một user
export async function getUserById(id: string): Promise<SingleUserResponse> {
  return apiRequest<SingleUserResponse>("get", `/admin/users/${id}`);
}

// Xóa user
export async function deleteUser(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("delete", `/admin/users/${id}`);
}

// Update user status
export async function updateUserStatus(
  id: string, 
  status: "active" | "inactive" | "suspended"
): Promise<SingleUserResponse> {
  return apiRequest<SingleUserResponse>("put", `/admin/users/${id}/status`, { status });
}