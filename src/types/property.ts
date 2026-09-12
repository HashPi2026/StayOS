export interface PropertyIdentity {
  name: string;
  clientId: string;
  region: 'na' | 'eu' | 'apac' | 'latam';
}

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
  mapImageUrl?: string;
}

export interface PropertyContact {
  websiteUrl: string;
  email?: string;
  phone?: string;
}

export interface PropertyMetadata {
  code: string;
  totalRooms: number;
  occupancyRate: number;
  todayArrivals: number;
  todayDepartures: number;
  currency: string;
  currencySymbol: string;
  status: 'operational' | 'maintenance' | 'peak';
  imageUrl: string;
  userRole?: string;
  clusterSyncStatus?: 'synced' | 'syncing' | 'offline';
  starRating?: number;
}

export interface TenantSubscription {
  plan: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  status: 'active' | 'trial' | 'past_due' | 'suspended';
  billingCycle: 'monthly' | 'annually';
  maxRooms: number;
  features: string[];
  currentRoomCount: number;
  renewalDate: string;
}

export interface TenantCapMetrics {
  theoremModel: 'CP' | 'CA'; // Hotel PMS CP model: Consistency (no double-booking) + Partition Tolerance (tenant isolation)
  isolationLevel: 'database_and_storage_partition';
  tenantWorkspaceId: string;
  isDataPartitioned: boolean;
  activeNode: string;
}

export interface PropertyData {
  id: string;
  identity: PropertyIdentity;
  location: PropertyLocation;
  contact: PropertyContact;
  meta?: PropertyMetadata;
  subscription?: TenantSubscription;
  capModel?: TenantCapMetrics;
}

export interface Amenity {
  id: string;
  name: string;
  category: 'Wellness' | 'Dining' | 'Business' | 'Recreation' | 'Facility';
  location: string;
  openingHours: string;
  status: 'open' | 'closed' | 'renovation';
  icon: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
}
