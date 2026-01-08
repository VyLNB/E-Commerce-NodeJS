import { cookies } from "next/headers";
import { Address, UserAuth } from "@/lib/types";

// URL của API server nội bộ
const API_HOST = process.env.INTERNAL_API_BASE_URL || "http://localhost:5000";

/**
 * Hàm helper chạy trên server để lấy session (userId)
 */
async function getServerSession(): Promise<UserAuth | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_HOST}/v1/users/me`, {
      headers: { Cookie: `accessToken=${token}` },
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return payload.data;
  } catch {
    return null;
  }
}

export async function getAddressesOnServer(): Promise<Address[]> {
  const session = await getServerSession();
  if (!session?._id) {
    return [];
  }

  const tokenStore = await cookies();
  const token = tokenStore.get("accessToken")?.value;

  try {
    const res = await fetch(`${API_HOST}/v1/users/${session._id}/addresses`, {
      headers: { Cookie: `accessToken=${token}` },
    });

    if (!res.ok) {
      console.error("Server fetch /addresses thất bại:", res.status);
      return [];
    }

    const payload = await res.json();
    return payload.data || [];
  } catch (error) {
    console.error("Lỗi khi fetch addresses trên server:", error);
    return [];
  }
}
