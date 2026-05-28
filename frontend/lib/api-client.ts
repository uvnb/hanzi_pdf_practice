const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function apiUrl(path: string): URL {
  const baseUrl =
    API_URL ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return new URL(path, baseUrl);
}

export function apiFetch(path: string | URL, init: RequestInit = {}): Promise<Response> {
  const headers = init.body
    ? { "Content-Type": "application/json", ...init.headers }
    : init.headers;
  const target = typeof path === "string" && !API_URL ? path : apiUrl(path.toString());
  return fetch(target, {
    ...init,
    credentials: "include",
    headers,
  });
}
