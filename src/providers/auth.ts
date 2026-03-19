import type { AuthProvider } from "@refinedev/core";
import { API_URL, TOKEN_KEY } from "./constants";

const USER_KEY = "refine-user";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await fetch(`${API_URL}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: "이메일 또는 비밀번호가 올바르지 않습니다.",
          },
        };
      }

      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.accessToken ?? data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user ?? { email }));

      return { success: true, redirectTo: "/" };
    } catch {
      return {
        success: false,
        error: {
          name: "NetworkError",
          message: "서버에 연결할 수 없습니다.",
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { authenticated: false, redirectTo: "/login" };

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(TOKEN_KEY);
        return { authenticated: false, redirectTo: "/login" };
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return { authenticated: false, redirectTo: "/login" };
    }

    return { authenticated: true };
  },

  getPermissions: async () => null,

  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  },

  onError: async (error) => {
    if (error?.status === 401) {
      return { logout: true, redirectTo: "/login", error };
    }
    return { error };
  },
};
