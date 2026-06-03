"use client";

import { useState, useEffect } from "react";
import { apiUrl } from "@/lib/api-client";

export default function AdminPage() {
  const [apiKey, setApiKey] = useState("");
  const [pendingOrders, setPendingOrders] = useState<{payment_ref: string, amount: number, plan: string, created_at: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    if (!apiKey) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/api/payments/admin/pending"), {
        headers: { "x-api-key": apiKey }
      });
      if (!res.ok) throw new Error("Sai API Key hoặc không có quyền truy cập");
      const data = await res.json();
      setPendingOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activateOrder = async (paymentRef: string) => {
    if (!confirm(`Bạn có chắc chắn muốn kích hoạt đơn hàng ${paymentRef}?`)) return;
    try {
      const res = await fetch(apiUrl(`/api/payments/admin/activate/${paymentRef}`), {
        method: "POST",
        headers: { "x-api-key": apiKey }
      });
      if (!res.ok) throw new Error("Lỗi kích hoạt");
      localStorage.setItem('admin_approved', Date.now().toString());
      alert("Kích hoạt thành công!");
      fetchOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", color: "var(--ink)", fontFamily: "sans-serif" }}>
      <h1>Quản trị viên - Chờ duyệt thanh toán</h1>
      <p style={{ opacity: 0.7 }}>Trang này dùng để duyệt thủ công các giao dịch khi vượt quá hạn mức SePay (50 giao dịch/tháng).</p>
      
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <input 
          type="password" 
          placeholder="Nhập API Key / Webhook Secret" 
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ padding: "8px 12px", width: "300px", borderRadius: "4px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)" }}
        />
        <button 
          onClick={fetchOrders}
          style={{ padding: "8px 16px", background: "var(--accent)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Tải danh sách
        </button>
      </div>

      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}

      <div style={{ marginTop: "30px" }}>
        {loading ? (
          <p>Đang tải...</p>
        ) : pendingOrders.length === 0 ? (
          <p>Không có đơn hàng nào đang chờ duyệt.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr style={{ background: "var(--hover)", textAlign: "left" }}>
                <th style={{ padding: "10px", border: "1px solid var(--line)" }}>Mã giao dịch (Nội dung CK)</th>
                <th style={{ padding: "10px", border: "1px solid var(--line)" }}>Gói</th>
                <th style={{ padding: "10px", border: "1px solid var(--line)" }}>Số tiền</th>
                <th style={{ padding: "10px", border: "1px solid var(--line)" }}>Ngày tạo</th>
                <th style={{ padding: "10px", border: "1px solid var(--line)" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map(order => (
                <tr key={order.payment_ref}>
                  <td style={{ padding: "10px", border: "1px solid var(--line)", fontWeight: "bold", color: "var(--accent)" }}>{order.payment_ref}</td>
                  <td style={{ padding: "10px", border: "1px solid var(--line)" }}>{order.plan}</td>
                  <td style={{ padding: "10px", border: "1px solid var(--line)" }}>{order.amount.toLocaleString("vi-VN")}đ</td>
                  <td style={{ padding: "10px", border: "1px solid var(--line)" }}>{new Date(order.created_at).toLocaleString("vi-VN")}</td>
                  <td style={{ padding: "10px", border: "1px solid var(--line)" }}>
                    <button 
                      onClick={() => activateOrder(order.payment_ref)}
                      style={{ padding: "6px 12px", background: "#22c55e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      Duyệt & Kích hoạt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
