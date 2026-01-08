import type { AuthUser } from "../lib/types";
import { apiRequest } from "./admin";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SigninPayloadSchema = z.object({
  email: z.string(),
  password: z.string(),
});
export type SigninPayload = z.infer<typeof SigninPayloadSchema>;

export interface AuthResponse {
  message: string;
  success: boolean;
  error: boolean;
  data: AuthUser;
}

export async function signin(
  credentials: SigninPayload
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("post", "/users/login", credentials);
}

export async function signout(): Promise<void> {
  return apiRequest<void>("delete", "/users/logout");
}

export async function getProfileAdmin(): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("get", "/users/me");
}
