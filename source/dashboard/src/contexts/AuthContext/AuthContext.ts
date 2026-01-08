import { createContext } from "react";
import type { AuthUser } from "../../lib/types";
import type { AuthResponse } from "../../api/auth";

export interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
