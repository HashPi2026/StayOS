/**
 * PostgreSQL Database API Client for StayOS
 * Communicates with backend endpoints (/api/v1/*) connected to the user's PostgreSQL / Supabase database.
 */

const BASE_URL = '/api/v1';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  clientId?: string
): Promise<{ data: T | null; error: string | null }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (clientId) {
      headers['x-client-id'] = clientId;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const errMsg = json?.error?.message || json?.message || `HTTP ${res.status}: ${res.statusText}`;
      return { data: null, error: errMsg };
    }
    return { data: json?.data ?? json, error: null };
  } catch (err: any) {
    console.warn(`[Database API Request Error] ${endpoint}:`, err);
    return { data: null, error: err.message || 'Network request failed' };
  }
}

export const databaseApi = {
  // Properties
  async getProperties() {
    return request<any[]>('/properties');
  },
  async createProperty(propertyData: {
    client_id: string;
    property_name: string;
    city?: string;
    state?: string;
    address?: string;
    region?: string;
  }) {
    return request<any>('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  },

  // Property Master
  async getPropertyMaster(clientId: string) {
    return request<any>('/configuration/property', {}, clientId);
  },
  async updatePropertyMaster(clientId: string, data: any) {
    return request<any>(
      '/configuration/property',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      clientId
    );
  },

  // Buildings
  async getBuildings(clientId: string) {
    return request<any[]>('/configuration/buildings', {}, clientId);
  },
  async createBuilding(clientId: string, data: { building_name: string; description?: string }) {
    return request<any>(
      '/configuration/buildings',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      clientId
    );
  },
  async updateBuilding(clientId: string, id: number | string, data: { building_name?: string; description?: string }) {
    return request<any>(
      `/configuration/buildings/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      clientId
    );
  },
  async deleteBuilding(clientId: string, id: number | string) {
    return request<any>(
      `/configuration/buildings/${id}`,
      {
        method: 'DELETE',
      },
      clientId
    );
  },

  // Floors
  async getFloors(clientId: string) {
    return request<any[]>('/configuration/floors', {}, clientId);
  },
  async createFloor(clientId: string, data: { building_id: number; floor_name: string; description?: string }) {
    return request<any>(
      '/configuration/floors',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      clientId
    );
  },
  async updateFloor(clientId: string, id: number | string, data: { building_id?: number; floor_name?: string; description?: string }) {
    return request<any>(
      `/configuration/floors/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      clientId
    );
  },
  async deleteFloor(clientId: string, id: number | string) {
    return request<any>(
      `/configuration/floors/${id}`,
      {
        method: 'DELETE',
      },
      clientId
    );
  },

  // Room Types
  async getRoomTypes(clientId: string) {
    return request<any[]>('/configuration/room-types', {}, clientId);
  },
  async createRoomType(clientId: string, data: any) {
    return request<any>(
      '/configuration/room-types',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      clientId
    );
  },
  async updateRoomType(clientId: string, id: number | string, data: any) {
    return request<any>(
      `/configuration/room-types/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      clientId
    );
  },
  async deleteRoomType(clientId: string, id: number | string) {
    return request<any>(
      `/configuration/room-types/${id}`,
      {
        method: 'DELETE',
      },
      clientId
    );
  },

  // Rooms
  async getRooms(clientId: string) {
    return request<any[]>('/configuration/rooms', {}, clientId);
  },
  async createRoom(clientId: string, data: any) {
    return request<any>(
      '/configuration/rooms',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      clientId
    );
  },
  async updateRoom(clientId: string, id: number | string, data: any) {
    return request<any>(
      `/configuration/rooms/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      clientId
    );
  },
  async deleteRoom(clientId: string, id: number | string) {
    return request<any>(
      `/configuration/rooms/${id}`,
      {
        method: 'DELETE',
      },
      clientId
    );
  },

  // Room Statuses
  async getRoomStatuses(clientId: string) {
    return request<any[]>('/configuration/room-statuses', {}, clientId);
  },

  // Taxes
  async getTaxes(clientId: string) {
    return request<any[]>('/configuration/taxes', {}, clientId);
  },
  async createTax(clientId: string, data: any) {
    return request<any>(
      '/configuration/taxes',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      clientId
    );
  },
  async updateTax(clientId: string, id: number | string, data: any) {
    return request<any>(
      `/configuration/taxes/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      clientId
    );
  },
  async deleteTax(clientId: string, id: number | string) {
    return request<any>(
      `/configuration/taxes/${id}`,
      {
        method: 'DELETE',
      },
      clientId
    );
  },

  // Users & Permissions (Pattern B)
  async getUsers(clientId: string) {
    return request<any[]>('/configuration/users', {}, clientId);
  },
  async createUser(clientId: string, data: any) {
    return request<any>(
      '/configuration/users',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      clientId
    );
  },
  async updateUser(clientId: string, id: number | string, data: any) {
    return request<any>(
      `/configuration/users/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      clientId
    );
  },
  async toggleUserStatus(clientId: string, id: number | string, isActive: boolean) {
    return request<any>(
      `/configuration/users/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive }),
      },
      clientId
    );
  },
  async deleteUser(clientId: string, id: number | string) {
    return request<any>(
      `/configuration/users/${id}`,
      {
        method: 'DELETE',
      },
      clientId
    );
  },

  // =========================================================================
  // GUEST MODULE API (Isolated Multi-Tenant)
  // =========================================================================
  async getGuests(clientId: string, roleId?: number) {
    return request<any[]>('/guest/guests', { headers: { 'x-role-id': String(roleId || 1) } }, clientId);
  },
  async getGuest(clientId: string, guestId: number | string, roleId?: number) {
    return request<any>(`/guest/guests/${guestId}`, { headers: { 'x-role-id': String(roleId || 1) } }, clientId);
  },
  async createGuest(clientId: string, data: any, roleId?: number) {
    return request<any>('/guest/guests', { method: 'POST', body: JSON.stringify(data), headers: { 'x-role-id': String(roleId || 1) } }, clientId);
  },
  async updateGuest(clientId: string, guestId: number | string, data: any, roleId?: number) {
    return request<any>(`/guest/guests/${guestId}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'x-role-id': String(roleId || 1) } }, clientId);
  },
  async deleteGuest(clientId: string, guestId: number | string, roleId?: number) {
    return request<any>(`/guest/guests/${guestId}`, { method: 'DELETE', headers: { 'x-role-id': String(roleId || 1) } }, clientId);
  },
  async getGuestContacts(clientId: string, guestId: number | string, roleId?: number) {
    return request<any[]>(`/guest/guests/${guestId}/contacts`, { headers: { 'x-role-id': String(roleId || 1) } }, clientId);
  },
  async getGuestDocuments(clientId: string, guestId: number | string, roleId?: number) {
    return request<any[]>(`/guest/guests/${guestId}/documents`, { headers: { 'x-role-id': String(roleId || 1) } }, clientId);
  },
  async getContacts(clientId: string, roleId?: number) {
    return request<any[]>('/guest/contacts', { headers: { 'x-role-id': String(roleId || 1) } }, clientId);
  },
  async getContactCategories(clientId: string, roleId?: number) {
    return request<any[]>('/guest/contact-categories', { headers: { 'x-role-id': String(roleId || 1) } }, clientId);
  },
  async getLostFoundItems(clientId: string, roleId?: number) {
    return request<any[]>('/guest/lost-found-items', { headers: { 'x-role-id': String(roleId || 1) } }, clientId);
  },
  async createLostFoundItem(clientId: string, data: any, roleId?: number) {
    return request<any>('/guest/lost-found-items', { method: 'POST', body: JSON.stringify(data), headers: { 'x-role-id': String(roleId || 1) } }, clientId);
  },
};

