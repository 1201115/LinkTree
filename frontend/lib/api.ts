const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function clearToken() {
  // noop (legacy)
}

export function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });
}
