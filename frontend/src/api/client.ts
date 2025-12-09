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
    const errorMessage = error.error || error.message || `HTTP ${response.status}: ${response.statusText}`;
    console.error('API Error:', {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      error
    });
    throw new Error(errorMessage);
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

export function createIncident(data: any) {
  return request<any>("/incidents", {
    method: "POST",
    body: JSON.stringify(data),
  });
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

export function getFinancialStats() {
  return request<any>("/financials/stats");
}

export function getAllItems() {
  return request<any[]>("/items");
}

export function getAllSkillTags() {
  return request<any[]>("/skill-tags");
}

export function login(data: any) {
  return request<any>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function register(data: any) {
  return request<any>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getAnalytics() {
  return request<any>("/analytics/stats");
}

export function getUserRequests(userId: string) {
  return request<any[]>(`/requests?requester_id=${userId}`);
}

export function getUserIncidents(userId: string) {
  return request<any[]>(`/incidents?reporter_id=${userId}`);
}

export function updateUser(userId: string, data: any) {
  return request<any>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
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

export function getUnverifiedRequests() {
  return request<any[]>("/requests?unverified=true");
}

export function reviewRequest(requestId: string, data: any) {
  return request<any>(`/requests/${requestId}/review`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getSearchAnalytics() {
  return request<any>("/analytics/search");
}

export function logSearch(data: any) {
  return request<any>("/analytics/log-search", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function warnUser(data: any) {
  return request<any>("/warnings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

