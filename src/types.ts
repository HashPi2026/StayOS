export type NavigationPath =
  | 'overview'
  | 'buildings'
  | 'add-building'
  | 'edit-building'
  | 'room-types'
  | 'rooms'
  | 'amenities'
  | 'rates-packages'
  | 'taxes'
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

export interface RoomType {
  id: string;
  name: string;
  code: string;
  category: 'Standard' | 'Deluxe' | 'Suite' | 'Executive';
  baseRate: number;
  capacity: number;
  bedType: string;
  totalUnits: number;
  status: 'active' | 'inactive';
}

export interface Room {
  id: string;
  number: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  roomTypeId: string;
  roomTypeName: string;
  status: 'occupied' | 'available' | 'maintenance' | 'cleaning' | 'reserved';
  rate: number;
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
