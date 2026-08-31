export type NavigationPath =
  | 'overview'
  | 'buildings'
  | 'add-building'
  | 'edit-building'
  | 'floors'
  | 'room-types'
  | 'add-room-type'
  | 'edit-room-type'
  | 'rooms'
  | 'add-room'
  | 'bulk-add-rooms'
  | 'edit-room'
  | 'room-status'
  | 'amenities'
  | 'taxes'
  | 'tax-configuration'
  | 'add-tax'
  | 'edit-tax'
  | 'add-tax-rate'
  | 'edit-tax-rate'
  | 'rates-packages'
  | 'policies'
  | 'user-management'
  | 'integrations'
  | 'notifications'
  | 'audit-logs'
  | 'system-health';

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

export interface PropertyData {
  id: string;
  identity: PropertyIdentity;
  location: PropertyLocation;
  contact: PropertyContact;
}

export type BuildingStatus = 'active' | 'inactive' | 'maintenance' | 'closed';

export interface Building {
  id: string;
  code: string;
  name: string;
  description: string;
  status: BuildingStatus;
  totalFloors: number;
  totalRooms: number;
  hasActiveRooms: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: {
    name: string;
    initials: string;
  };
}

export type FloorStatus = 'active' | 'inactive' | 'maintenance';

export interface Floor {
  id: string;
  name: string;
  floorNumber?: number;
  description: string;
  buildingId: string;
  buildingName: string;
  status: FloorStatus;
  totalRooms?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type RoomCategory = 'Standard' | 'Deluxe' | 'Suite' | 'Executive' | 'Villa' | 'Penthouse';
export type RoomTypeStatus = 'active' | 'inactive' | 'renovation';

export interface RoomType {
  id: string;
  name: string;
  code: string;
  shortName?: string;
  color?: string;
  category: RoomCategory;
  baseRate: number;
  extraAdultRate?: number;
  extraChildRate?: number;
  capacity: number;
  maxAdults?: number;
  maxChildren?: number;
  bedType: string;
  bedCount?: number;
  extraBedAllowed?: boolean;
  maxExtraBeds?: number;
  sizeSqm?: number;
  sizeSqft?: number;
  viewType?: string;
  smokingPolicy?: 'non-smoking' | 'smoking' | 'designated';
  isAccessible?: boolean;
  description?: string;
  amenities?: string[];
  totalUnits: number;
  status: RoomTypeStatus;
  buildingId?: string;
  buildingName?: string;
  floorId?: string;
  floorName?: string;
  buildingIds?: string[];
  overBookingLimit?: number;
  isCrs?: boolean;
  allowInOccupancy?: boolean;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RoomStatus = 'occupied' | 'available' | 'maintenance' | 'cleaning' | 'reserved' | 'dirty' | 'clean' | 'ooo' | string;

export interface RoomStatusConfig {
  id: string;
  name: string;
  shortName: string;
  code: string;
  bgColor: string;
  textColor: string;
  isActive: boolean;
  isSystemDefault?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: string;
  name: string;
  shortName: string;
  number: string;
  buildingId: string;
  buildingName: string;
  floorId?: string;
  floor: number;
  floorName?: string;
  roomTypeId: string;
  roomTypeName: string;
  status: RoomStatus;
  rate: number;
  isHourlyRental?: boolean;
  isSmoking?: boolean;
  isHandicapAccessible?: boolean;
  isPetAllowed?: boolean;
  includeInOccupancyAdr?: boolean;
  isCrsInventory?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxSlab {
  id: string;
  fromAmount: number;
  toAmount: number | null;
  ratePercentage: number;
  description?: string;
}

export interface TaxItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  taxType: 'GST' | 'VAT' | 'Service Tax' | 'Luxury Tax' | 'City Tax' | 'Environmental Fee' | string;
  ruleType?: 'percentage' | 'fixed';
  value?: number;
  applicationMethod?: 'per_night' | 'per_person_night' | 'per_stay' | 'per_item' | string;
  calculationStrategy?: 'per-day' | 'per-stay' | 'percentage';
  isActive: boolean;
  configsCount?: number;
  jurisdiction?: string;
  slabs?: TaxSlab[];
  applicableTo?: 'all-rooms' | 'specific-rooms' | 'food-beverage' | 'all-services';
  effectiveDate?: string;
  fromDate?: string;
  lastDate?: string;
  ratePercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

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
