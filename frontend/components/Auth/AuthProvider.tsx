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

import { checkOrder } from "@/lib/payment-api";

import { usePathname } from "next/navigation";

function GlobalPaymentSuccessModal() {
  const { user, subscription, refresh } = useAuth();
  const [show, setShow] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Polling & focus listener to detect activation without reloading
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      if (pathname.includes('/admin')) return; // Don't show on admin page
      
      const ref = localStorage.getItem("pending_upgrade_ref");
      if (!ref) return;

      try {
        const { status } = await checkOrder(ref);
        if (status === "active") {
          localStorage.removeItem("pending_upgrade_ref");
          refresh(); // Update global auth state, which will trigger the history check below
        }
      } catch (err) {
        // ignore errors
      }
    };
    
    interval = setInterval(checkStatus, 15000);
    window.addEventListener("focus", checkStatus);
    
    checkStatus();
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkStatus);
    };
  }, [refresh, pathname]);

  // Detect cross-device or non-pending_upgrade_ref upgrades
  useEffect(() => {
    if (subscription && user && !pathname.includes('/admin')) {
      const key = `last_sub_${user.id}`;
      const lastSubStr = localStorage.getItem(key);
      
      if (lastSubStr) {
        try {
          const lastSub = JSON.parse(lastSubStr);
          const isNowActive = subscription.status === "active" && subscription.plan !== "free";
          const wasNotActive = lastSub.plan === "free" || lastSub.status !== "active";
          const changedPlan = lastSub.plan !== subscription.plan;
          const extendedTime = new Date(subscription.expires_at || 0).getTime() > new Date(lastSub.expires_at || 0).getTime();
          
          if (isNowActive && (wasNotActive || changedPlan || extendedTime)) {
            setShow(true);
          }
        } catch (e) {}
      }
      
      localStorage.setItem(key, JSON.stringify(subscription));
    }
  }, [subscription, user, pathname]);

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
