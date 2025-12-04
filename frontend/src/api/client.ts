const API_BASE_URL = "http://localhost:3000/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "API request failed");
  }

  return response.json();
}

export function getAllRequests() {
  return request<any[]>("/requests");
}

export function submitClaim(data: any) {
  return request<any>("/request-accepters/bulk", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function createRequest(data: any) {
  return request<any>("/requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getAllIncidents() {
  return request<any[]>("/incidents");
}

export function getAllShelters() {
  return request<any[]>("/shelters");
}

export function getAllInventories() {
  return request<any[]>("/inventories");
}

export function getAllFinancials() {
  return request<any[]>("/financials");
}

export function getAllItems() {
  return request<any[]>("/items");
}

export async function getRequestsByIncidentId(incidentId: string) {
  const res = await fetch(`${API_BASE_URL}/requests?incident_id=${incidentId}`)
  if (!res.ok) throw new Error('Failed to fetch requests')
  return res.json()
}

export async function getInventoryItems(inventoryId: string) {
  const res = await fetch(`${API_BASE_URL}/inventory-items?inventory_id=${inventoryId}`)
  if (!res.ok) throw new Error('Failed to fetch inventory items')
  return res.json()
}

