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

export function getAllRequests(options: { page?: number; limit?: number; type?: string; keyword?: string; incident_id?: string; area_name?: string; area_id?: string } = {}) {
  const { page, limit, type, keyword, incident_id, area_name, area_id } = options;
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (type) params.append('type', type);
  if (keyword) params.append('keyword', keyword);
  if (incident_id) params.append('incident_id', incident_id);
  if (area_name) params.append('area_name', area_name);
  if (area_id) params.append('area_id', area_id);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request<{ data: any[]; meta: any } | any[]>(`/requests${query}`);
}

// Update signature to be more specific if possible, but 'any' allows flexibility.
// Ideally: submitClaim(data: { accepter_id: number, items: { request_id: number, qty: number, ... }[] })
export function submitClaim(data: any) {
  return request<any>("/request-accepts/bulk", {
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

export function getAllIncidents(options: { page?: number; limit?: number; review_status?: string; unverified?: string | boolean } = {}) {
  const { page, limit, review_status, unverified } = options;
  let query = "";
  if (page) query += `?page=${page}`;
  if (limit) query += `${query ? '&' : '?'}limit=${limit}`;
  if (review_status) query += `${query ? '&' : '?'}review_status=${review_status}`;
  if (unverified) query += `${query ? '&' : '?'}unverified=true`;
  return request<{ data: any[]; meta: any } | any[]>(`/incidents${query}`);
}

export function createIncident(data: any) {
  return request<any>("/incidents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getAllShelters(options: { page?: number; limit?: number; keyword?: string } = {}) {
  const { page, limit, keyword } = options;
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (keyword) params.append('keyword', keyword);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request<{ data: any[]; meta: any } | any[]>(`/shelters${query}`);
}

export function getNearbyShelters(latitude: number, longitude: number, limit: number = 10) {
  return request<any[]>(`/shelters?latitude=${latitude}&longitude=${longitude}&limit=${limit}`);
}

export function getAllInventories(options: { page?: number; limit?: number } = {}) {
  const { page, limit } = options;
  let query = "";
  if (page) query += `?page=${page}`;
  if (limit) query += `${query ? '&' : '?'}limit=${limit}`;
  return request<{ data: any[]; meta: any } | any[]>(`/inventories${query}`);
}

export function getAllFinancials(options: { page?: number; limit?: number; sortBy?: string; sortOrder?: string } = {}) {
  const { page, limit, sortBy, sortOrder } = options;
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (sortBy) params.append('sortBy', sortBy);
  if (sortOrder) params.append('sortOrder', sortOrder);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request<{ data: any[]; meta: any } | any[]>(`/financials${query}`);
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



export function getUnverifiedRequests(options: { page?: number; limit?: number } = {}) {
  const { page, limit } = options;
  let query = "?unverified=true";
  if (page) query += `&page=${page}`;
  if (limit) query += `&limit=${limit}`;
  return request<{ data: any[]; meta: any } | any[]>(`/requests${query}`);
}

export function reviewRequest(requestId: string, data: any) {
  return request<any>(`/requests/${requestId}/review`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getUnverifiedIncidents(options: { page?: number; limit?: number } = {}) {
  const { page, limit } = options;
  let query = "?unverified=true";
  if (page) query += `&page=${page}`;
  if (limit) query += `&limit=${limit}`;
  return request<{ data: any[]; meta: any } | any[]>(`/incidents${query}`);
}

export function reviewIncident(incidentId: string, data: any) {
  return request<any>(`/incidents/${incidentId}/review`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getSearchAnalytics() {
  return request<any>("/analytics/search");
}

export function getIncidentStatsByArea() {
  return request<any[]>("/analytics/incident-stats");
}

export function getTopNeededCategories() {
  return request<any[]>("/analytics/top-needed-categories");
}

export function getIdleResources(days: number = 30) {
  return request<any[]>(`/analytics/idle-resources?days=${days}`);
}

export function getSearchKeywordsAnalysis() {
  return request<any[]>("/analytics/search-keywords-analysis");
}

export function getPageStats(startDate?: string, endDate?: string) {
  let query = "";
  if (startDate) query += `?startDate=${startDate}`;
  if (endDate) query += `${query ? '&' : '?'}endDate=${endDate}`;
  return request<any[]>(`/analytics/pages${query}`);
}

export function getVolunteerLeaderboard(limit: number = 10) {
  return request<any[]>(`/analytics/volunteer-leaderboard?limit=${limit}`);
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



export function getAllAreas() {
  return request<any[]>("/area");
}

export function getInventoryById(inventoryId: string | number) {
  return request<any>(`/inventories/${inventoryId}`);
}

export function getMyInventories(userId: string) {
  return request<any[]>(`/inventory-owners?user_id=${userId}`);
}

export function getInventoryItems(inventoryId: string | number, status?: string) {
  let url = `/inventory-items/${inventoryId}`;
  if (status) {
    url += `?status=${status}`;
  }
  return request<any>(url);
}

export function createInventory(data: any) {
  return request<any>("/inventories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateInventory(inventoryId: string | number, data: any) {
  return request<any>(`/inventories/${inventoryId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteInventory(inventoryId: string | number) {
  return request<any>(`/inventories/${inventoryId}`, {
    method: "DELETE",
  });
}

// --- Warehouse Team ---

export function getInventoryOwners(inventoryId: string | number) {
  return request<any[]>(`/inventory-owners?inventory_id=${inventoryId}`);
}

export function addInventoryOwner(data: any) {
  return request<any>("/inventory-owners", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function removeInventoryOwner(inventoryId: string | number, userId: string | number) {
  return request<any>(`/inventory-owners/${inventoryId}/${userId}`, {
    method: "DELETE",
  });
}

// --- Warehouse Items ---

export function addInventoryItem(data: any) {
  return request<any>("/inventory-items", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateInventoryItem(inventoryId: string | number, itemId: string | number, data: any) {
  return request<any>(`/inventory-items/${inventoryId}/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteInventoryItem(inventoryId: string | number, itemId: string | number, status: string = 'Owned') {
  return request<any>(`/inventory-items/${inventoryId}/${itemId}?status=${status}`, {
    method: "DELETE",
  });
}
// --- Lends & Provides ---

export function createLend(data: any) {
  return request<any>("/lends", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function createProvide(data: any) {
  return request<any>("/provides", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function transferInventory(data: any) {
  return request<any>("/inventories/transfer", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getWarehouseLends(inventoryId: string | number) {
  return request<any[]>(`/lends/inventory/${inventoryId}`);
}

export function approveLend(lendId: string | number) {
  return request<any>(`/lends/${lendId}/approve`, {
    method: "PUT"
  });
}

export function rejectLend(lendId: string | number) {
  return request<any>(`/lends/${lendId}/reject`, {
    method: "PUT"
  });
}

export function getUserLends(userId: string | number) {
  return request<any[]>(`/lends/user/${userId}`);
}

export function returnLend(lendId: string | number) {
  return request<any>(`/lends/${lendId}/return`, {
    method: "PUT"
  });
}

export function returnInventoryItem(inventoryId: string | number, itemId: string | number) {
  return request<any>(`/lends/return-item`, {
    method: "POST",
    body: JSON.stringify({ inventory_id: inventoryId, item_id: itemId })
  });
}
