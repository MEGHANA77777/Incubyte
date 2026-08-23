import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  decodeJwtPayload,
  isTokenExpired,
} from "../utils/jwt";

export interface AuthUser {
  id: string;
  username?: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (token: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: (token) => {
        const payload = decodeJwtPayload(token);

        if (!payload || isTokenExpired(token)) {
          localStorage.removeItem("access_token");

          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });

          return;
        }

        localStorage.setItem("access_token", token);

        set({
          token,
          user: {
            id: payload.sub,
            role: payload.role,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setUser: (user) => {
        set({
          user,
        });
      },

      logout: () => {
        localStorage.removeItem("access_token");

        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage",

      onRehydrateStorage: () => {
        return () => {
          useAuthStore.setState({
            isLoading: false,
          });
        };
      },
    }
  )
);
