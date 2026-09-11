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
