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
import { useRouter } from "@/i18n/navigation";

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

  return (
    <AuthContext.Provider value={value}>
      {children}
      <GlobalPaymentSuccessModal />
    </AuthContext.Provider>
  );
}

function GlobalPaymentSuccessModal() {
  const { subscription, refresh } = useAuth();
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (subscription?.status === "active") {
      const isPending = localStorage.getItem("pending_upgrade");
      if (isPending === "true") {
        setShow(true);
        localStorage.removeItem("pending_upgrade");
      }
    }
  }, [subscription]);

  // Polling & focus listener to detect activation without reloading
  useEffect(() => {
    const checkStatus = () => {
      if (localStorage.getItem("pending_upgrade") === "true") {
        refresh();
      }
    };
    
    const interval = setInterval(checkStatus, 15000);
    window.addEventListener("focus", checkStatus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkStatus);
    };
  }, [refresh]);

  if (!show) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "var(--paper)", color: "var(--ink)", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "450px", position: "relative", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <button onClick={() => setShow(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "24px", color: "var(--ink)", cursor: "pointer", opacity: 0.6 }}>×</button>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
        <h3 style={{ color: "var(--success, #22c55e)", fontSize: "24px" }}>Đã kích hoạt thành công!</h3>
        <p style={{ marginTop: "12px", opacity: 0.8 }}>Cảm ơn bạn đã nâng cấp tài khoản.</p>
        <button 
          onClick={() => {
            setShow(false);
            router.push("/practice");
          }}
          style={{ marginTop: "24px", padding: "12px 24px", background: "#1e3a8a", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          Bắt đầu luyện tập
        </button>
      </div>
    </div>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
