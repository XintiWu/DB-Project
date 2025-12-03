const BASE_URL = "http://localhost:3000/api";

// 通用 fetch
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function getUsers() {
  return request<any[]>("/users");
}

export function getRequests() {
  return request<any[]>("/requests");
}

// Alias for compatibility
export const getAllRequests = getRequests;

export function createRequest(data: any) {
  return request<any>("/requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function submitClaim(data: any) {
  return request<any>("/request-accepters/bulk", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
