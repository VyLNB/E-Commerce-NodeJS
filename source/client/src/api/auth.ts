import { apiRequest } from "./client";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SigninPayloadSchema = z.object({
  email: z.string(),
  password: z.string(),
});
export type SigninPayload = z.infer<typeof SigninPayloadSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SignupPayloadSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  address: {
    city: z.string(),
    district: z.string(),
    ward: z.string(),
    street: z.string(),
  },
});
export type SignupPayload = z.infer<typeof SignupPayloadSchema>;


interface AuthResponse {
  message: string;
  success: boolean;
  error: boolean;
  data: {
    _id: string;
    fullName: string;
    avatar: string;
    email: string;
    loyaltyPoints: number;
    accessToken: string;
    refreshToken: string;
  };
}



export async function signin(
  credentials: SigninPayload
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("post", "/users/login", credentials);
}

export async function signup(userData: SignupPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("post", "/users/register", userData);
}

export async function getCurrentUser(): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("get", "/users/me");
}

export async function logout(): Promise<void> {
  return apiRequest<void>("delete", "/users/logout");
}


export async function resetPassword(token: string | null, newPassword: string): Promise<void> {
  return apiRequest<void>("put", "/users/reset-password", {
    token, newPassword
  });
}