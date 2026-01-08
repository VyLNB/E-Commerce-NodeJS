import { type ReactNode, useContext, useEffect, useState } from "react";
import { getProfileAdmin, signin, signout } from "../../api/auth";
import type { AuthUser } from "../../lib/types";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const user = await getProfileAdmin();
        if (user.data) {
          setUser(user.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await signin({ email, password });
    if (response?.data) {
      if (response.data.role !== "admin") {
        throw new Error("Tài khoản không có quyền truy cập trang quản trị.");
      }

      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response));
    }

    return response;
  };

  const logout = () => {
    signout();
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
