import type { UserResponse } from "../user.tsx";
import type { StandardApiResponse } from "../admin.tsx";

// mock dữ liệu users
const mockUsers: UserResponse[] = [
  {
    id: "668c1b7dabd7ee502264edc",
    email: "jackson@gmail.com",
    avatar: "https://th.bing.com/th/id/R.9b6fafa54911acdb42adde96ed3234ea?rik=QnmYkM8MQVbnAw&pid=ImgRaw&r=0",
    fullName: "Jackson Vyle",
    loyaltyPoints: 150,
    status: "active",
    role: "customer",
    createdAt: new Date("2024-01-15T10:30:00.000Z"),
    updatedAt: new Date("2024-01-15T10:30:00.000Z"),
  },
  {
    id: "668c1b7dabd7ee502264edc1",
    email: "jackson@gmail.com",
    avatar: "https://th.bing.com/th/id/R.9b6fafa54911acdb42adde96ed3234ea?rik=QnmYkM8MQVbnAw&pid=ImgRaw&r=0",
    fullName: "Jackson Jenny",
    loyaltyPoints: 150,
    status: "active",
    role: "customer",
    createdAt: new Date("2024-01-15T10:30:00.000Z"),
    updatedAt: new Date("2024-01-15T10:30:00.000Z"),
  },
  {
    id: "668c1b7dabd7ee502264edc2",
    email: "jackson@gmail.com",
    avatar: "https://th.bing.com/th/id/R.9b6fafa54911acdb42adde96ed3234ea?rik=QnmYkM8MQVbnAw&pid=ImgRaw&r=0",
    fullName: "Jackson Hello",
    loyaltyPoints: 150,
    status: "active",
    role: "customer",
    createdAt: new Date("2024-01-15T10:30:00.000Z"),
    updatedAt: new Date("2024-01-15T10:30:00.000Z"),
  },
  {
    id: "668c1b7dabd7ee502264edc3",
    email: "jackson@gmail.com",
    // avatar: "https://th.bing.com/th/id/R.9b6fafa54911acdb42adde96ed3234ea?rik=QnmYkM8MQVbnAw&pid=ImgRaw&r=0",
    fullName: "Jackson Windy",
    loyaltyPoints: 150,
    status: "active",
    role: "customer",
    createdAt: new Date("2024-01-15T10:30:00.000Z"),
    updatedAt: new Date("2024-01-15T10:30:00.000Z"),
  },
  {
    id: "668c1b7dabd7ee502264edc4",
    email: "jackson@gmail.com",
    // avatar: "https://th.bing.com/th/id/R.9b6fafa54911acdb42adde96ed3234ea?rik=QnmYkM8MQVbnAw&pid=ImgRaw&r=0",
    fullName: "Jackson Jack",
    loyaltyPoints: 150,
    status: "active",
    role: "customer",
    createdAt: new Date("2024-01-15T10:30:00.000Z"),
    updatedAt: new Date("2024-01-15T10:30:00.000Z"),
  }
];


// Mock get users
export async function getUsersMock(): Promise<StandardApiResponse<UserResponse[]>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: mockUsers });
    }, 300);
  });
}

// Mock get user by id
export async function getUserByIdMock(id: string): Promise<StandardApiResponse<UserResponse>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.id === id);
      if (user) {
        resolve({ success: true, data: user });
      } else {
        reject(new Error("Không tìm thấy người dùng"));
      }
    }, 300);
  });
}

// Mock delete user
export async function deleteUserMock(id: string): Promise<StandardApiResponse<{message: string}>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        mockUsers.splice(userIndex, 1);
        resolve({ 
          success: true, 
          data: { message: "Xóa người dùng thành công" }
        });
      } else {
        reject(new Error("Không tìm thấy người dùng để xóa"));
      }
    }, 300);
  });
}