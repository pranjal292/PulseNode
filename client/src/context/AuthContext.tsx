// ═══════════════════════════════════════════════════════════════
//  Auth Context — Live Postgres Backend Integration
// ═══════════════════════════════════════════════════════════════

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { User, UserTag } from "../types";

const API_URL = "http://localhost:4000/api";
const TOKEN_KEY = "pulsenode_token";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => void;
  updateUserTag: (targetId: string, newTag: UserTag, clubIds?: string[]) => Promise<string | null>;
  // allUsers is no longer synchronously available since we are on live DB
  // For the sake of the EditTags page, we need a way to fetch users.
  // We'll expose a helper to fetch users.
  fetchAllUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Session Hydration ──────────────────────────────────────
  useEffect(() => {
    const fetchUser = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user);
          } else {
            localStorage.removeItem(TOKEN_KEY);
            setUser(null);
          }
        })
        .catch((err) => {
          console.error("Failed to hydrate auth:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    fetchUser();
    const iv = setInterval(fetchUser, 10000);
    return () => clearInterval(iv);
  }, []);

  // ── Login ──────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        return data.error || "Login failed";
      }

      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      return null;
    } catch (err) {
      return "Network error occurred";
    }
  }, []);

  // ── Signup ─────────────────────────────────────────────────
  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<string | null> => {
      try {
        const res = await fetch(`${API_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();

        if (!data.success) {
          return data.error || "Registration failed";
        }

        setUser(data.user);
        localStorage.setItem(TOKEN_KEY, data.token);
        return null;
      } catch (err) {
        return "Network error occurred";
      }
    },
    []
  );

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  // ── Update Tag ─────────────────────────────────────────────
  const updateUserTag = useCallback(
    async (targetId: string, newTag: UserTag, clubIds?: string[]): Promise<string | null> => {
      const token = localStorage.getItem(TOKEN_KEY);
      try {
        const res = await fetch(`${API_URL}/update-tag`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetUserId: targetId, newTag, clubIds }),
        });
        const data = await res.json();
        if (!data.success) {
          return data.error || "Failed to update tag";
        }
        return null;
      } catch (err) {
        return "Network error occurred";
      }
    },
    []
  );

  // ── Fetch Users ────────────────────────────────────────────
  // EditTagsPage needs to list users. We don't have a /users endpoint yet.
  // We'll implement a fast one on the backend, but for now we fetch it.
  const fetchAllUsers = useCallback(async (): Promise<User[]> => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) return data.users;
      return [];
    } catch {
      return [];
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateUserTag,
        fetchAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
