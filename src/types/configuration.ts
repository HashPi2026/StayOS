import { RoleType } from './user';

export interface RateTypeItem {
  id: string;
  shortName: string;
  name: string;
  description: string;
  bindPercentage: number;
  isHourly: boolean;
  isCrsTaxInclusive: boolean;
  isCrsEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type DocumentCategory = 'Identity' | 'Visa' | 'Voucher' | 'Health' | 'Business' | 'Other';

export interface DocumentTypeItem {
  id: string;
  shortName: string;
  name: string;
  category: DocumentCategory;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OtherChargeCategoryItem {
  id: string;
  shortName: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OtherChargeItem {
  id: string;
  shortName: string;
  name: string;
  category: string;
  price?: number;
  taxable: boolean;
  alwaysCharge: boolean;
  reoccur: boolean;
  reoccurFrequency?: 'Daily' | 'Weekly' | 'Monthly';
  crsCharge: boolean;
  callLoggingCharge: boolean;
  posCharge: boolean;
  forecastingRevenue: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeasurementUnitItem {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentTypeItem {
  id: string;
  shortName: string;
  name: string;
  category: 'Credit Card' | 'Cash' | 'Bank Transfer' | 'Digital Wallet' | 'Check' | 'Other';
  ccProcessing: boolean;
  status: 'Active' | 'Inactive';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExchangeRateItem {
  id: string;
  country: string;
  countryCode?: string;
  currency: string;
  sign: string;
  rate: number;
  isBaseRate: boolean;
  flagUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionActionSet {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface PermissionModuleDef {
  id: string;
  name: string;
  group: 'Reservations' | 'Operations' | 'Finance & Routing' | 'Configuration' | 'User Management & System';
  subtext?: string;
  icon?: string;
  disabledActions?: {
    view?: boolean;
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
}

export interface RoleItem {
  id: string;
  name: string;
  code: string;
  type: RoleType;
  description: string;
  usersCount: number;
  isSystem?: boolean;
  isCritical?: boolean;
  permissions: Record<string, PermissionActionSet>;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailTemplateTriggers {
  created: boolean;
  updated: boolean;
  cancelled: boolean;
  dob: boolean;
  beforeCheckIn: boolean;
  beforeCheckInDays: number;
  atCheckIn: boolean;
  afterCheckIn: boolean;
  afterCheckInDays: number;
  beforeCheckOut: boolean;
  beforeCheckOutDays: number;
  atCheckOut: boolean;
  afterCheckOut: boolean;
  afterCheckOutDays: number;
}

export interface EmailTemplateItem {
  id: string;
  name: string;
  subject: string;
  body: string;
  senderName?: string;
  replyTo?: string;
  triggers: EmailTemplateTriggers;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface PolicyItem {
  id: string;
  roomTypeId: string;
  roomTypeName: string;
  rateTypeId: string;
  rateTypeName: string;
  content: string;
  policyType?: 'cancellation' | 'deposit' | 'general' | 'no-show';
  createdAt: string;
  updatedAt: string;
}

export interface GuestCategoryItem {
  id: string;
  name: string;
  shortName: string;
  color: string;
  description: string;
  isHighlight: boolean;
  highlightIcon?: 'star' | 'warning' | 'verified' | 'favorite' | 'flag' | 'none';
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}
