import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest, authRequest } from "./queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  nationality: string;
  phoneNumber: string;
  passportNumber: string;
  isVerified: boolean;
 role: string; // ✅ NOT optional!
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  nationality: string;
  phoneNumber: string;
  passportNumber: string;
  [key: string]: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const verified = await verifyToken();
          if (verified) {
            setUser(JSON.parse(userData));
          } else {
            clearAuthData();
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          clearAuthData();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const verifyToken = async (): Promise<boolean> => {
    try {
      await apiRequest("GET", "/api/auth/verify");
      return true;
    } catch {
      return false;
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await authRequest<{ token: string; user: User }>(
        "POST",
        "/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      let errorMessage = "Login failed";
      if (err instanceof Error) {
        errorMessage = err.message.includes("400")
          ? "Invalid email or password"
          : err.message;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await authRequest<{ token: string; user: User }>(
        "POST",
        "/api/auth/register",
        userData
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      let errorMessage = "Registration failed";
      if (err instanceof Error) {
        errorMessage = err.message.includes("400")
          ? "Invalid registration data"
          : err.message;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    window.location.href = "/auth";
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
