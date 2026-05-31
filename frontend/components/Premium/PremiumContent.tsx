"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import PricingSection from "@/components/Landing/PricingSection";
import { createOrder, checkOrder, OrderResponse } from "@/lib/payment-api";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useRouter } from "@/i18n/navigation";
import "@/app/landing.css";

const PLAN_PRICES: Record<string, string> = {
  weekly: "6.000đ/tuần",
  monthly: "26.000đ/tháng",
  yearly: "266.000đ/năm",
};

export default function PremiumContent() {
  const t = useTranslations("Landing");
  const { user, refresh } = useAuth();
  const router = useRouter();
  
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const newOrder = await createOrder(planId);
      setOrder(newOrder);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!order || activated) return;
    
    // Polling every 10 seconds
    const interval = setInterval(async () => {
      try {
        const { status } = await checkOrder(order.payment_ref);
        if (status === "active") {
          setActivated(true);
          await refresh();
        }
      } catch (err) {
        // ignore errors during polling
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [order, activated, refresh]);

  const tiers = [
    {
      id: "weekly",
      name: t("tierFree"),
      price: t("tierFreePrice"),
      period: t("tierFreePeriod"),
      features: [t("tierFreeF1"), t("tierFreeF2"), t("tierFreeF3")],
      cta: t("tierFreeCta"),
    },
    {
      id: "monthly",
      name: t("tierPro"),
      price: t("tierProPrice"),
      period: t("tierProPeriod"),
      features: [t("tierProF1"), t("tierProF2"), t("tierProF3")],
      cta: t("tierProCta"),
    },
    {
      id: "yearly",
      name: t("tierMaster"),
      price: t("tierMasterPrice"),
      period: t("tierMasterPeriod"),
      features: [t("tierMasterF1"), t("tierMasterF2"), t("tierMasterF3")],
      cta: t("tierMasterCta"),
    },
  ];

  return (
    <div className="premium-override">
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-override {
          --font-brush: "ThuPhapScript", "ThuPhap", "Dancing Script", "Merienda", "Noto Serif SC", cursive;
          --premium-text: var(--ink);
          --premium-border: var(--line);
          --premium-bg: var(--paper);
          --premium-accent: var(--accent);
        }
        .premium-override .pricingSection {
          background: transparent !important;
          padding: 20px 0 !important;
        }
        .premium-override .pricingCard {
          background: var(--premium-bg) !important;
          border: 1px solid var(--premium-border) !important;
          box-shadow: none !important;
          color: var(--premium-text) !important;
        }
        .premium-override .pricingCard * {
          color: var(--premium-text) !important;
        }
        .premium-override .pricingTitle {
          color: var(--premium-text) !important;
        }
        .premium-override .pricingAmount {
          color: var(--premium-accent) !important;
        }
        .premium-override .pricingAmount span {
          color: var(--premium-text) !important;
          opacity: 0.7 !important;
        }
        .premium-override .pricingFeatures li::before {
          color: var(--premium-accent) !important;
        }
        .premium-override .pricingCta {
          color: var(--premium-text) !important;
          border: 1px solid var(--premium-border) !important;
          background: transparent !important;
        }
        .premium-override .pricingCta:hover {
          background: var(--premium-border) !important;
        }
        .payment-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }
        .payment-modal {
          background: var(--paper);
          color: var(--ink);
          border-radius: 12px;
          padding: 32px;
          width: 100%;
          max-width: 600px;
          position: relative;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .payment-close {
          position: absolute;
          top: 16px; right: 16px;
          background: none; border: none;
          font-size: 24px; color: var(--ink);
          cursor: pointer; opacity: 0.6;
        }
        .payment-close:hover { opacity: 1; }
        .payment-modal h2 { text-align: center; margin-bottom: 24px; font-size: 24px; }
        .payment-box {
          display: flex; gap: 24px; flex-wrap: wrap;
        }
        @media (max-width: 600px) {
          .payment-box { flex-direction: column; align-items: center; }
        }
        .qr-side {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .qr-side img { width: 100%; max-width: 250px; border-radius: 12px; border: 1px solid var(--line); }
        .info-side {
          flex: 1; display: flex; flex-direction: column; gap: 16px; min-width: 200px;
        }
        .info-item {
          display: flex; flex-direction: column; gap: 4px;
        }
        .info-label { font-size: 13px; opacity: 0.6; }
        .info-value { font-size: 16px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
        .copy-btn {
          background: none; border: none; color: var(--accent); cursor: pointer; font-size: 12px; padding: 4px; border-radius: 4px;
        }
        .copy-btn:hover { background: rgba(0,0,0,0.05); }
      `}} />
      <PricingSection title={t("pricingTitle")} tiers={tiers} onSelectPlan={handleSelectPlan} />
      
      {loading && <div style={{ textAlign: "center", marginTop: 20 }}>Đang xử lý...</div>}
      {error && <div style={{ color: "red", textAlign: "center", marginTop: 20 }}>{error}</div>}
      
      {order && (
        <div className="payment-modal-overlay" onClick={() => !activated && setOrder(null)}>
          <div className="payment-modal" onClick={e => e.stopPropagation()}>
            <button className="payment-close" onClick={() => setOrder(null)}>×</button>
            <h2>Thông tin chuyển khoản</h2>
            
            {activated ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
                <h3 style={{ color: "var(--success, #22c55e)", fontSize: "24px" }}>Đã kích hoạt thành công!</h3>
                <p style={{ marginTop: "12px", opacity: 0.8 }}>Cảm ơn bạn đã nâng cấp tài khoản.</p>
                <button 
                  onClick={() => router.push("/practice")}
                  style={{ marginTop: "24px", padding: "12px 24px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                >
                  Bắt đầu luyện tập
                </button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: "24px", background: "rgba(245, 158, 11, 0.1)", color: "#d97706", padding: "8px", borderRadius: "8px", fontWeight: "bold" }}>
                  Gói đã chọn: {(() => {
                    const planId = order.qr_url.includes(PLAN_PRICES.weekly) ? 'weekly' : 
                                  order.qr_url.includes(PLAN_PRICES.monthly) ? 'monthly' : 
                                  order.qr_url.includes(PLAN_PRICES.yearly) ? 'yearly' : '';
                                  // Hack: order doesn't have planId directly, but we know the amount
                    if (order.amount === 6000) return "Trải nghiệm — 6.000đ/tuần";
                    if (order.amount === 26000) return "Thường xuyên — 26.000đ/tháng";
                    return "Năm — 266.000đ/năm";
                  })()}
                </div>
                
                <div className="payment-box">
                  <div className="qr-side">
                    <img src={order.qr_url} alt="QR Code" />
                    <span style={{ fontSize: "14px", opacity: 0.7 }}>Quét mã QR để chuyển khoản</span>
                  </div>
                  
                  <div className="info-side">
                    <div className="info-item">
                      <span className="info-label">Ngân hàng</span>
                      <div className="info-value">
                        TECHCOMBANK 
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText("TECHCOMBANK")}>Copy</button>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Chủ tài khoản</span>
                      <div className="info-value">
                        VU NGOC QUAN 
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText("VU NGOC QUAN")}>Copy</button>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Số tài khoản</span>
                      <div className="info-value">
                        19076437519010 
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText("19076437519010")}>Copy</button>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Số tiền</span>
                      <div className="info-value">
                        {order.amount.toLocaleString("vi-VN")}đ 
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(order.amount.toString())}>Copy</button>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Nội dung CK (Bắt buộc)</span>
                      <div className="info-value">
                        <span style={{ color: "var(--accent)" }}>{order.payment_ref}</span>
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(order.payment_ref)}>Copy</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", opacity: 0.7 }}>
                  Hệ thống sẽ tự động kích hoạt <span style={{ color: "var(--success, #22c55e)", fontWeight: "bold" }}>trong vòng vài giây</span> sau khi chuyển khoản.
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <div style={{ width: "16px", height: "16px", border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    Đang chờ thanh toán...
                  </div>
                  <style dangerouslySetInnerHTML={{__html: `@keyframes spin { to { transform: rotate(360deg); } }`}}/>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
