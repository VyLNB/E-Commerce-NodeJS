// import type { UserResponse } from "../user.tsx";
// import type { StandardApiResponse } from "../admin.tsx";

// Mock API để test trước khi kết nối API thực tế

export interface MockAuthResponse {
  success: boolean;
  data: {
    _id: string;
    email: string;
    avatar: string;
    fullName: string;
    loyaltyPoints: number;
    status: string;
    role: string;
    createdAt: string;
    updatedAt: string
  };
}

export async function signinMock({ email, password }: { email: string; password: string }): Promise<MockAuthResponse> {
  return new Promise<MockAuthResponse>((resolve, reject) => {
    setTimeout(() => {
      if (email === "admin@example.com" && password === "123456") {
        resolve({
          success: true,
          data: {
            _id: "668c1b7dabd7ee502264edc",
            email: "admin@example.com",
            avatar: "https://avatar.iran.liara.run/username?username=admin",
            fullName: "Admin User",
            loyaltyPoints: 100,
            status: "active",
            role: "admin",
            createdAt: "2025-01-15T10:30:00.000Z",
            updatedAt: "2025-01-15T10:30:00.000Z"
          }
        });
      } else if (email === "user@example.com" && password === "123456") {
        resolve({
          success: true,
          data: {
            _id: "668c1b7dabd7ee502264edd",
            email: "user@example.com", 
            avatar: "https://avatar.iran.liara.run/username?username=user",
            fullName: "Người Dùng Demo",
            loyaltyPoints: 50,
            status: "active",
            role: "customer",
            createdAt: "2025-01-10T08:15:00.000Z",
            updatedAt: "2025-01-15T09:20:00.000Z"
          }
        });
      } else {
        // Giả lập lỗi từ server
        reject(new Error("Email hoặc mật khẩu không đúng. Vui lòng thử lại."));
      }
    }, 500); // delay 500ms giả lập thời gian gọi API
  });
}

