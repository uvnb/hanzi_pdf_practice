"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "@/lib/api-client";
import { SubscriptionResponse, fetchSubscription } from "@/lib/payment-api";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: SessionUser | null;
  subscription: SubscriptionResponse | null;
  loading: boolean;
  loginWithGoogleCredential: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAuth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/api/auth/me");
      if (response.ok) {
        const userData = (await response.json()) as SessionUser;
        setUser(userData);
        try {
          const subData = await fetchSubscription();
          setSubscription(subData);
        } catch {
          setSubscription(null);
        }
      } else {
        setUser(null);
        setSubscription(null);
      }
    } catch {
      setUser(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuth();
  }, [fetchAuth]);

  const loginWithGoogleCredential = useCallback(async (credential: string) => {
    const response = await apiFetch("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
    if (!response.ok) {
      throw new Error("Đăng nhập Google không thành công.");
    }
    const userData = (await response.json()) as SessionUser;
    setUser(userData);
    try {
      const subData = await fetchSubscription();
      setSubscription(subData);
    } catch {
      setSubscription(null);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setSubscription(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, subscription, loading, loginWithGoogleCredential, logout, refresh: fetchAuth }),
    [loading, loginWithGoogleCredential, logout, user, subscription, fetchAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
