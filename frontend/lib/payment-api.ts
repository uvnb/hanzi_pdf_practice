import { apiFetch, apiUrl } from "./api-client";

export interface SubscriptionResponse {
  plan: string;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  pdf_count_today: number;
  pdf_limit: number;
}

export interface OrderResponse {
  payment_ref: string;
  amount: number;
  qr_url: string;
  status: string;
}

export async function fetchSubscription(): Promise<SubscriptionResponse> {
  const url = apiUrl("/api/payments/me");
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch subscription: ${response.status}`);
  }
  return await response.json();
}

export async function createOrder(plan: string): Promise<OrderResponse> {
  const url = apiUrl("/api/payments/order");
  const response = await apiFetch(url, {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.status}`);
  }
  return await response.json();
}

export async function checkOrder(paymentRef: string): Promise<{ status: string }> {
  const url = apiUrl(`/api/payments/check/${paymentRef}`);
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`Failed to check order: ${response.status}`);
  }
  return await response.json();
}

export async function consumePdfQuota(): Promise<{ status: string; count: number; limit: number }> {
  const url = apiUrl("/api/payments/use-pdf");
  const response = await apiFetch(url, { method: "POST" });
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("PDF_QUOTA_EXCEEDED");
    }
    throw new Error(`Failed to use PDF quota: ${response.status}`);
  }
  return await response.json();
}

export async function simulateWebhook(paymentRef: string): Promise<{ status: string }> {
  const url = apiUrl("/api/payments/webhook");
  const response = await apiFetch(url, {
    method: "POST",
    body: JSON.stringify({ payment_ref: paymentRef }),
  });
  if (!response.ok) {
    throw new Error(`Failed to trigger webhook: ${response.status}`);
  }
  return await response.json();
}
