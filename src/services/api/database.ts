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

  // =========================================================================
  // EXTENDED CONFIGURATION & MASTER LISTS API (Multi-Tenant Isolated)
  // =========================================================================
  // Exchange Rates
  async getExchangeRates(clientId: string) {
    return request<any[]>('/configuration/exchange-rates', {}, clientId);
  },
  async createExchangeRate(clientId: string, data: any) {
    const payload = {
      country_name: data.country_name || data.country,
      currency_name: data.currency_name || data.currency,
      currency_sign: data.currency_sign || data.sign || '$',
      rate: data.rate !== undefined ? Number(data.rate) : 1.0,
      is_base_rate: Boolean(data.is_base_rate ?? data.isBaseRate),
    };
    return request<any>('/configuration/exchange-rates', { method: 'POST', body: JSON.stringify(payload) }, clientId);
  },
  async updateExchangeRate(clientId: string, id: number | string, data: any) {
    const payload = {
      country_name: data.country_name || data.country,
      currency_name: data.currency_name || data.currency,
      currency_sign: data.currency_sign || data.sign,
      rate: data.rate !== undefined ? Number(data.rate) : undefined,
      is_base_rate: data.is_base_rate !== undefined ? Boolean(data.is_base_rate) : (data.isBaseRate !== undefined ? Boolean(data.isBaseRate) : undefined),
    };
    return request<any>(`/configuration/exchange-rates/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, clientId);
  },
  async deleteExchangeRate(clientId: string, id: number | string) {
    return request<any>(`/configuration/exchange-rates/${id}`, { method: 'DELETE' }, clientId);
  },

  // Email Templates
  async getEmailTemplates(clientId: string) {
    return request<any[]>('/configuration/email-templates', {}, clientId);
  },
  async createEmailTemplate(clientId: string, data: any) {
    const triggers = data.triggers || {};
    const payload = {
      template_name: data.template_name || data.name,
      trigger_reservation: triggers.created ?? data.trigger_reservation ?? false,
      trigger_reservation_update: triggers.updated ?? data.trigger_reservation_update ?? false,
      trigger_reservation_cancel: triggers.cancelled ?? data.trigger_reservation_cancel ?? false,
      trigger_after_reservation_cancel: data.trigger_after_reservation_cancel ?? false,
      trigger_before_check_in: triggers.beforeCheckIn ?? data.trigger_before_check_in ?? false,
      trigger_check_in: triggers.atCheckIn ?? data.trigger_check_in ?? false,
      trigger_after_check_in: triggers.afterCheckIn ?? data.trigger_after_check_in ?? false,
      trigger_before_check_out: triggers.beforeCheckOut ?? data.trigger_before_check_out ?? false,
      trigger_check_out: triggers.atCheckOut ?? data.trigger_check_out ?? false,
      trigger_after_check_out: triggers.afterCheckOut ?? data.trigger_after_check_out ?? false,
      trigger_date_of_birth: triggers.dob ?? data.trigger_date_of_birth ?? false,
    };
    return request<any>('/configuration/email-templates', { method: 'POST', body: JSON.stringify(payload) }, clientId);
  },
  async updateEmailTemplate(clientId: string, id: number | string, data: any) {
    const triggers = data.triggers || {};
    const payload = {
      template_name: data.template_name || data.name,
      trigger_reservation: triggers.created ?? data.trigger_reservation,
      trigger_reservation_update: triggers.updated ?? data.trigger_reservation_update,
      trigger_reservation_cancel: triggers.cancelled ?? data.trigger_reservation_cancel,
      trigger_after_reservation_cancel: data.trigger_after_reservation_cancel,
      trigger_before_check_in: triggers.beforeCheckIn ?? data.trigger_before_check_in,
      trigger_check_in: triggers.atCheckIn ?? data.trigger_check_in,
      trigger_after_check_in: triggers.afterCheckIn ?? data.trigger_after_check_in,
      trigger_before_check_out: triggers.beforeCheckOut ?? data.trigger_before_check_out,
      trigger_check_out: triggers.atCheckOut ?? data.trigger_check_out,
      trigger_after_check_out: triggers.afterCheckOut ?? data.trigger_after_check_out,
      trigger_date_of_birth: triggers.dob ?? data.trigger_date_of_birth,
    };
    return request<any>(`/configuration/email-templates/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, clientId);
  },
  async deleteEmailTemplate(clientId: string, id: number | string) {
    return request<any>(`/configuration/email-templates/${id}`, { method: 'DELETE' }, clientId);
  },

  // Measurement Units
  async getMeasurementUnits(clientId: string) {
    return request<any[]>('/configuration/measurement-units', {}, clientId);
  },
  async createMeasurementUnit(clientId: string, data: any) {
    const payload = {
      measurement: data.measurement || data.name,
      short_name: data.short_name || data.shortName,
      description: data.description || '',
    };
    return request<any>('/configuration/measurement-units', { method: 'POST', body: JSON.stringify(payload) }, clientId);
  },
  async updateMeasurementUnit(clientId: string, id: number | string, data: any) {
    const payload = {
      measurement: data.measurement || data.name,
      short_name: data.short_name || data.shortName,
      description: data.description,
    };
    return request<any>(`/configuration/measurement-units/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, clientId);
  },
  async deleteMeasurementUnit(clientId: string, id: number | string) {
    return request<any>(`/configuration/measurement-units/${id}`, { method: 'DELETE' }, clientId);
  },

  // Other Charges & Categories
  async getOtherChargeCategories(clientId: string) {
    return request<any[]>('/configuration/other-charges/categories', {}, clientId);
  },
  async createOtherChargeCategory(clientId: string, data: any) {
    const payload = {
      short_name: data.short_name || data.shortName,
      category_name: data.category_name || data.name,
      description: data.description || '',
      is_default: Boolean(data.is_default ?? data.isDefault),
    };
    return request<any>('/configuration/other-charges/categories', { method: 'POST', body: JSON.stringify(payload) }, clientId);
  },
  async updateOtherChargeCategory(clientId: string, id: number | string, data: any) {
    const payload = {
      short_name: data.short_name || data.shortName,
      category_name: data.category_name || data.name,
      description: data.description,
      is_default: data.is_default !== undefined ? Boolean(data.is_default) : (data.isDefault !== undefined ? Boolean(data.isDefault) : undefined),
    };
    return request<any>(`/configuration/other-charges/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, clientId);
  },
  async deleteOtherChargeCategory(clientId: string, id: number | string) {
    return request<any>(`/configuration/other-charges/categories/${id}`, { method: 'DELETE' }, clientId);
  },
  async getOtherCharges(clientId: string) {
    return request<any[]>('/configuration/other-charges', {}, clientId);
  },
  async createOtherCharge(clientId: string, data: any) {
    const payload = {
      occ_id: data.occ_id || data.categoryId || null,
      short_name: data.short_name || data.shortName,
      charge_name: data.charge_name || data.name,
      taxable: Boolean(data.taxable ?? data.is_taxable),
      always_charge: Boolean(data.always_charge ?? data.alwaysCharge),
      reoccur_charge: Boolean(data.reoccur_charge ?? data.reoccur),
      reoccur_frequency: data.reoccur_frequency || data.reoccurFrequency || null,
      crs_charge: Boolean(data.crs_charge ?? data.crsCharge),
      call_logging_charge: Boolean(data.call_logging_charge ?? data.callLoggingCharge),
      pos_charge: Boolean(data.pos_charge ?? data.posCharge),
      forecasting_revenue: Boolean(data.forecasting_revenue ?? data.forecastingRevenue),
    };
    return request<any>('/configuration/other-charges', { method: 'POST', body: JSON.stringify(payload) }, clientId);
  },
  async updateOtherCharge(clientId: string, id: number | string, data: any) {
    const payload = {
      occ_id: data.occ_id || data.categoryId,
      short_name: data.short_name || data.shortName,
      charge_name: data.charge_name || data.name,
      taxable: data.taxable !== undefined ? Boolean(data.taxable) : undefined,
      always_charge: data.always_charge !== undefined ? Boolean(data.always_charge) : (data.alwaysCharge !== undefined ? Boolean(data.alwaysCharge) : undefined),
      reoccur_charge: data.reoccur_charge !== undefined ? Boolean(data.reoccur_charge) : (data.reoccur !== undefined ? Boolean(data.reoccur) : undefined),
      reoccur_frequency: data.reoccur_frequency || data.reoccurFrequency,
      crs_charge: data.crs_charge !== undefined ? Boolean(data.crs_charge) : (data.crsCharge !== undefined ? Boolean(data.crsCharge) : undefined),
      call_logging_charge: data.call_logging_charge !== undefined ? Boolean(data.call_logging_charge) : (data.callLoggingCharge !== undefined ? Boolean(data.callLoggingCharge) : undefined),
      pos_charge: data.pos_charge !== undefined ? Boolean(data.pos_charge) : (data.posCharge !== undefined ? Boolean(data.posCharge) : undefined),
      forecasting_revenue: data.forecasting_revenue !== undefined ? Boolean(data.forecasting_revenue) : (data.forecastingRevenue !== undefined ? Boolean(data.forecastingRevenue) : undefined),
    };
    return request<any>(`/configuration/other-charges/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, clientId);
  },
  async deleteOtherCharge(clientId: string, id: number | string) {
    return request<any>(`/configuration/other-charges/${id}`, { method: 'DELETE' }, clientId);
  },

  // Policies
  async getPolicies(clientId: string) {
    return request<any[]>('/configuration/policies', {}, clientId);
  },
  async createPolicy(clientId: string, data: any) {
    const payload = {
      title: data.title || (data.roomTypeName ? `${data.roomTypeName} - ${data.rateTypeName || 'Standard'}` : 'Hotel Policy'),
      category: data.category || data.policyType || 'General',
      description: data.description || data.content || '',
      is_active: Boolean(data.is_active ?? true),
    };
    return request<any>('/configuration/policies', { method: 'POST', body: JSON.stringify(payload) }, clientId);
  },
  async updatePolicy(clientId: string, id: number | string, data: any) {
    const payload = {
      title: data.title || (data.roomTypeName ? `${data.roomTypeName} - ${data.rateTypeName || 'Standard'}` : undefined),
      category: data.category || data.policyType,
      description: data.description || data.content,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : undefined,
    };
    return request<any>(`/configuration/policies/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, clientId);
  },
  async deletePolicy(clientId: string, id: number | string) {
    return request<any>(`/configuration/policies/${id}`, { method: 'DELETE' }, clientId);
  },

  // Packages
  async getPackages(clientId: string) {
    return request<any[]>('/configuration/packages', {}, clientId);
  },
  async createPackage(clientId: string, data: any) {
    const payload = {
      code: data.code || data.shortName,
      name: data.name,
      description: data.description || '',
      rate_type_id: data.rate_type_id || data.rateTypeId || null,
      package_type: data.package_type || data.packageType || 'meal',
      inclusions: data.inclusions || [],
      base_price: Number(data.base_price ?? data.basePrice) || 0,
      extra_adult_price: Number(data.extra_adult_price ?? data.extraAdultPrice) || 0,
      extra_child_price: Number(data.extra_child_price ?? data.extraChildPrice) || 0,
      valid_from: data.valid_from || data.validFrom,
      valid_to: data.valid_to || data.validTo,
      min_stay_nights: Number(data.min_stay_nights ?? data.minStayNights) || 1,
      is_active: Boolean(data.is_active ?? data.isActive ?? true),
      is_crs_enabled: Boolean(data.is_crs_enabled ?? data.isCrsEnabled ?? false),
    };
    return request<any>('/configuration/packages', { method: 'POST', body: JSON.stringify(payload) }, clientId);
  },
  async updatePackage(clientId: string, id: number | string, data: any) {
    const payload = {
      code: data.code || data.shortName,
      name: data.name,
      description: data.description,
      rate_type_id: data.rate_type_id || data.rateTypeId,
      package_type: data.package_type || data.packageType,
      inclusions: data.inclusions,
      base_price: data.base_price !== undefined ? Number(data.base_price) : (data.basePrice !== undefined ? Number(data.basePrice) : undefined),
      extra_adult_price: data.extra_adult_price !== undefined ? Number(data.extra_adult_price) : (data.extraAdultPrice !== undefined ? Number(data.extraAdultPrice) : undefined),
      extra_child_price: data.extra_child_price !== undefined ? Number(data.extra_child_price) : (data.extraChildPrice !== undefined ? Number(data.extraChildPrice) : undefined),
      valid_from: data.valid_from || data.validFrom,
      valid_to: data.valid_to || data.validTo,
      min_stay_nights: data.min_stay_nights !== undefined ? Number(data.min_stay_nights) : (data.minStayNights !== undefined ? Number(data.minStayNights) : undefined),
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : (data.isActive !== undefined ? Boolean(data.isActive) : undefined),
      is_crs_enabled: data.is_crs_enabled !== undefined ? Boolean(data.is_crs_enabled) : (data.isCrsEnabled !== undefined ? Boolean(data.isCrsEnabled) : undefined),
    };
    return request<any>(`/configuration/packages/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, clientId);
  },
  async deletePackage(clientId: string, id: number | string) {
    return request<any>(`/configuration/packages/${id}`, { method: 'DELETE' }, clientId);
  },

  // Rate Types
  async getRateTypes(clientId: string) {
    return request<any[]>('/configuration/rate-types', {}, clientId);
  },
  async createRateType(clientId: string, data: any) {
    const payload = {
      short_name: data.short_name || data.shortName,
      rate_type_name: data.rate_type_name || data.name,
      description: data.description || '',
      bind_with_rate: Number(data.bind_with_rate ?? data.bindPercentage) || 0,
      is_hourly: Boolean(data.is_hourly ?? data.isHourly),
      is_crs_tax_inclusive: Boolean(data.is_crs_tax_inclusive ?? data.isCrsTaxInclusive),
      crs_enable: Boolean(data.crs_enable ?? data.isCrsEnabled),
      code: data.code || data.rateCode || data.shortName,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : (data.status !== 'inactive'),
    };
    return request<any>('/configuration/rate-types', { method: 'POST', body: JSON.stringify(payload) }, clientId);
  },
  async updateRateType(clientId: string, id: number | string, data: any) {
    const payload = {
      short_name: data.short_name || data.shortName,
      rate_type_name: data.rate_type_name || data.name,
      description: data.description,
      bind_with_rate: data.bind_with_rate !== undefined ? Number(data.bind_with_rate) : (data.bindPercentage !== undefined ? Number(data.bindPercentage) : undefined),
      is_hourly: data.is_hourly !== undefined ? Boolean(data.is_hourly) : (data.isHourly !== undefined ? Boolean(data.isHourly) : undefined),
      is_crs_tax_inclusive: data.is_crs_tax_inclusive !== undefined ? Boolean(data.is_crs_tax_inclusive) : (data.isCrsTaxInclusive !== undefined ? Boolean(data.isCrsTaxInclusive) : undefined),
      crs_enable: data.crs_enable !== undefined ? Boolean(data.crs_enable) : (data.isCrsEnabled !== undefined ? Boolean(data.isCrsEnabled) : undefined),
      code: data.code || data.rateCode || data.shortName,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : (data.status !== undefined ? data.status !== 'inactive' : undefined),
    };
    return request<any>(`/configuration/rate-types/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, clientId);
  },
  async deleteRateType(clientId: string, id: number | string) {
    return request<any>(`/configuration/rate-types/${id}`, { method: 'DELETE' }, clientId);
  },

  // Document Types
  async getDocumentTypes(clientId: string) {
    return request<any[]>('/configuration/document-types', {}, clientId);
  },
  async createDocumentType(clientId: string, data: any) {
    const payload = {
      short_name: data.short_name || data.shortName,
      document_name: data.document_name || data.name,
      document_category: data.document_category || data.category || 'Identity',
      description: data.description || '',
      is_default: Boolean(data.is_default ?? data.isDefault),
    };
    return request<any>('/configuration/document-types', { method: 'POST', body: JSON.stringify(payload) }, clientId);
  },
  async updateDocumentType(clientId: string, id: number | string, data: any) {
    const payload = {
      short_name: data.short_name || data.shortName,
      document_name: data.document_name || data.name,
      document_category: data.document_category || data.category,
      description: data.description,
      is_default: data.is_default !== undefined ? Boolean(data.is_default) : (data.isDefault !== undefined ? Boolean(data.isDefault) : undefined),
    };
    return request<any>(`/configuration/document-types/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, clientId);
  },
  async deleteDocumentType(clientId: string, id: number | string) {
    return request<any>(`/configuration/document-types/${id}`, { method: 'DELETE' }, clientId);
  },

  // Payment Types
  async getPaymentTypes(clientId: string) {
    return request<any[]>('/configuration/payment-types', {}, clientId);
  },
  async createPaymentType(clientId: string, data: any) {
    const payload = {
      short_name: data.short_name || data.shortName,
      payment_type_name: data.payment_type_name || data.name,
      category_name: data.category_name || data.category || 'Credit Card',
      description: data.description || '',
      credit_card_processing: Boolean(data.credit_card_processing ?? data.ccProcessing),
    };
    return request<any>('/configuration/payment-types', { method: 'POST', body: JSON.stringify(payload) }, clientId);
  },
  async updatePaymentType(clientId: string, id: number | string, data: any) {
    const payload = {
      short_name: data.short_name || data.shortName,
      payment_type_name: data.payment_type_name || data.name,
      category_name: data.category_name || data.category,
      description: data.description,
      credit_card_processing: data.credit_card_processing !== undefined ? Boolean(data.credit_card_processing) : (data.ccProcessing !== undefined ? Boolean(data.ccProcessing) : undefined),
    };
    return request<any>(`/configuration/payment-types/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, clientId);
  },
  async deletePaymentType(clientId: string, id: number | string) {
    return request<any>(`/configuration/payment-types/${id}`, { method: 'DELETE' }, clientId);
  },

  // Guest Categories
  async getGuestCategories(clientId: string) {
    return request<any[]>('/configuration/guest-categories', {}, clientId);
  },
  async createGuestCategory(clientId: string, data: any) {
    const payload = {
      category_name: data.category_name || data.name,
      short_name: data.short_name || data.shortName,
      description: data.description || '',
      is_highlight: Boolean(data.is_highlight ?? data.isHighlight),
      color_code: data.color_code || data.color || '#3b82f6',
    };
    return request<any>('/configuration/guest-categories', { method: 'POST', body: JSON.stringify(payload) }, clientId);
  },
  async updateGuestCategory(clientId: string, id: number | string, data: any) {
    const payload = {
      category_name: data.category_name || data.name,
      short_name: data.short_name || data.shortName,
      description: data.description,
      is_highlight: data.is_highlight !== undefined ? Boolean(data.is_highlight) : (data.isHighlight !== undefined ? Boolean(data.isHighlight) : undefined),
      color_code: data.color_code || data.color,
    };
    return request<any>(`/configuration/guest-categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, clientId);
  },
  async deleteGuestCategory(clientId: string, id: number | string) {
    return request<any>(`/configuration/guest-categories/${id}`, { method: 'DELETE' }, clientId);
  },

  // =========================================================================
  // RESERVATION LOGS (Miscellaneous -> Reservation Log)
  // =========================================================================
  async getReservationLogs(clientId: string, params?: { action_type?: string; booking_number?: string; search?: string; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.action_type) queryParams.set('action_type', params.action_type);
    if (params?.booking_number) queryParams.set('booking_number', params.booking_number);
    if (params?.search) queryParams.set('search', params.search);
    if (params?.limit) queryParams.set('limit', String(params.limit));
    const qs = queryParams.toString();
    return request<any[]>(`/configuration/reservation-logs${qs ? `?${qs}` : ''}`, {}, clientId);
  },
  async getReservationLogById(clientId: string, id: number | string) {
    return request<any>(`/configuration/reservation-logs/${id}`, {}, clientId);
  },
  async createReservationLog(clientId: string, data: any) {
    return request<any>('/configuration/reservation-logs', { method: 'POST', body: JSON.stringify(data) }, clientId);
  },

  // =========================================================================
  // RATE & AVAILABILITY (Confidential / Multi-Tenant Scoped)
  // =========================================================================
  async getRoomRates(clientId: string, queryParams?: { from?: string; to?: string; roomTypeId?: number; rateTypeId?: number }) {
    const q = new URLSearchParams();
    if (queryParams?.from) q.set('from', queryParams.from);
    if (queryParams?.to) q.set('to', queryParams.to);
    if (queryParams?.roomTypeId) q.set('roomTypeId', String(queryParams.roomTypeId));
    if (queryParams?.rateTypeId) q.set('rateTypeId', String(queryParams.rateTypeId));
    const qs = q.toString();
    return request<any[]>(`/rate-availability/room-rates${qs ? `?${qs}` : ''}`, {}, clientId);
  },
  async createRoomRate(clientId: string, data: any) {
    return request<any>('/rate-availability/room-rates', { method: 'POST', body: JSON.stringify(data) }, clientId);
  },
  async updateRoomRate(clientId: string, id: number | string, data: any) {
    return request<any>(`/rate-availability/room-rates/${id}`, { method: 'PUT', body: JSON.stringify(data) }, clientId);
  },
  async bulkUpdateRoomRates(clientId: string, data: any) {
    return request<any>('/rate-availability/room-rates/bulk', { method: 'PUT', body: JSON.stringify(data) }, clientId);
  },
};

