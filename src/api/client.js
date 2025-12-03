const BASE_URL = "http://localhost:3000/api";

// 通用 fetch
async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function getUsers() {
  return request("/users");
}

export function getRequests() {
  return request("/requests");
}

// Alias for compatibility
export const getAllRequests = getRequests;

export function createRequest(data) {
  return request("/requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

