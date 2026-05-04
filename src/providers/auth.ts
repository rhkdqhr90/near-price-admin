import type { AuthProvider } from "@refinedev/core";
import { API_URL, TOKEN_KEY } from "./constants";
import { tokenStorage } from "./storage";

const USER_KEY = "refine-user";

const clearSession = () => {
  tokenStorage.remove(TOKEN_KEY);
  tokenStorage.remove(USER_KEY);
};

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
      tokenStorage.set(TOKEN_KEY, data.accessToken ?? data.access_token);
      tokenStorage.set(USER_KEY, JSON.stringify(data.user ?? { email }));

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
    clearSession();
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = tokenStorage.get(TOKEN_KEY);
    if (!token) return { authenticated: false, redirectTo: "/login" };

    // 1차: 클라이언트 측 만료 검사 (네트워크 호출 절감용 빠른 사전 차단)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        clearSession();
        return { authenticated: false, redirectTo: "/login" };
      }
    } catch {
      clearSession();
      return { authenticated: false, redirectTo: "/login" };
    }

    // 2차: 백엔드에 실제 서명 검증 위임 (위조 토큰 차단)
    try {
      const response = await fetch(`${API_URL}/user/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        clearSession();
        return { authenticated: false, redirectTo: "/login" };
      }
      if (!response.ok) {
        // 네트워크/서버 일시 오류는 인증 상태를 유지(스파이크 시 무한 로그아웃 방지)
        return { authenticated: true };
      }
    } catch {
      // 오프라인/네트워크 단절 시에도 기존 세션을 즉시 끊지 않음
      return { authenticated: true };
    }

    return { authenticated: true };
  },

  getPermissions: async () => null,

  getIdentity: async () => {
    const token = tokenStorage.get(TOKEN_KEY);
    if (!token) return null;

    const raw = tokenStorage.get(USER_KEY);
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
    if (error?.status === 403) {
      return { redirectTo: "/login", error };
    }
    return { error };
  },
};
